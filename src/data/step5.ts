import type { CodeFile } from "./step2";

export const STEP5_FILES: CodeFile[] = [
  {
    name: "inc/ajax.php",
    lang: "php",
    note: "REST-эндпоинт POST /wp-json/karkas/v1/lead. Четыре рубежа: nonce → honeypot → rate-limit → Telegram. Валидация — declaratively в args.",
    code: `<?php
/**
 * Приём заявок: POST /wp-json/karkas/v1/lead
 *
 * Цепочка: nonce → honeypot → rate-limit → Telegram Bot API.
 * Без плагинов форм: только WP REST API и wp_remote_post.
 *
 * @package Karkas
 */

defined( 'ABSPATH' ) || exit;

add_action( 'rest_api_init', static function (): void {

	register_rest_route(
		'karkas/v1',
		'/lead',
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'permission_callback' => '__return_true', // публичный, защита — в колбэке
			'callback'            => 'karkas_handle_lead',
			'args'                => [
				'name'    => [
					'required'          => true,
					'sanitize_callback' => 'sanitize_text_field',
					'validate_callback' => static fn( $value ) => mb_strlen( (string) $value ) >= 2
						? true
						: new WP_Error( 'bad_name', __( 'Укажите имя — минимум 2 символа.', 'karkas' ), [ 'status' => 422 ] ),
				],
				'phone'   => [
					'required'          => true,
					'sanitize_callback' => 'sanitize_text_field',
					'validate_callback' => static fn( $value ) => preg_match( '/^[+0-9()\\-\\s]{7,20}$/', (string) $value )
						? true
						: new WP_Error( 'bad_phone', __( 'Телефон в формате +7 900 000-00-00.', 'karkas' ), [ 'status' => 422 ] ),
				],
				'message' => [
					'required'          => false,
					'default'           => '',
					'sanitize_callback' => 'sanitize_textarea_field',
				],
				'website' => [ // honeypot: люди его не видят, боты заполняют
					'required'          => false,
					'default'           => '',
					'sanitize_callback' => 'sanitize_text_field',
				],
				'nonce'   => [
					'required'          => true,
					'sanitize_callback' => 'sanitize_text_field',
				],
			],
		]
	);
} );

/**
 * Обработчик заявки.
 */
function karkas_handle_lead( WP_REST_Request $request ): WP_REST_Response|WP_Error {

	// 1) Nonce — защита от CSRF. Создаётся в inc/enqueue.php.
	if ( ! wp_verify_nonce( (string) $request['nonce'], 'karkas_lead' ) ) {
		return new WP_Error(
			'expired',
			__( 'Сессия устарела — обновите страницу и повторите.', 'karkas' ),
			[ 'status' => 403 ]
		);
	}

	// 2) Honeypot: скрытое поле заполнено — это бот. Отвечаем «успехом»
	//    и молча выбрасываем заявку, чтобы не обучать спамеров.
	if ( '' !== trim( (string) $request['website'] ) ) {
		return new WP_REST_Response( [ 'ok' => true ], 200 );
	}

	// 3) Rate-limit: не чаще одной заявки в 30 секунд с одного IP.
	$ip  = isset( $_SERVER['REMOTE_ADDR'] )
		? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) )
		: 'unknown';
	$key = 'karkas_lead_' . md5( $ip );

	if ( false !== get_transient( $key ) ) {
		return new WP_Error(
			'slow_down',
			__( 'Заявка уже ушла. Если она не дошла — напишите нам в Telegram.', 'karkas' ),
			[ 'status' => 429 ]
		);
	}

	// 4) Сообщение для менеджера. Все данные экранированы.
	$text = sprintf(
		"🆕 <b>Заявка с сайта</b> %s\\n\\n👤 Имя: %s\\n📞 Телефон: %s\\n💬 Задача: %s\\n🕒 %s",
		esc_html( home_url() ),
		esc_html( (string) $request['name'] ),
		esc_html( (string) $request['phone'] ),
		'' !== trim( (string) $request['message'] ) ? esc_html( (string) $request['message'] ) : '—',
		esc_html( current_time( 'd.m.Y H:i' ) )
	);

	// 5) Telegram Bot API. Секреты — в wp-config.php, не в коде темы.
	$token = defined( 'KARKAS_TG_TOKEN' ) ? KARKAS_TG_TOKEN : '';
	$chat  = defined( 'KARKAS_TG_CHAT' ) ? KARKAS_TG_CHAT : '';

	if ( '' === $token || '' === $chat ) {
		return new WP_Error(
			'misconfigured',
			__( 'Сервис приёма заявок не настроен.', 'karkas' ),
			[ 'status' => 503 ]
		);
	}

	$response = wp_remote_post(
		sprintf( 'https://api.telegram.org/bot%s/sendMessage', $token ),
		[
			'timeout' => 5, // не держим посетителя дольше 5 секунд
			'body'    => [
				'chat_id'    => $chat,
				'text'       => $text,
				'parse_mode' => 'HTML',
			],
		]
	);

	if ( is_wp_error( $response ) ) {
		return new WP_Error(
			'send_failed',
			__( 'Не удалось отправить заявку. Напишите нам на почту — продублируем вручную.', 'karkas' ),
			[ 'status' => 502 ]
		);
	}

	set_transient( $key, 1, 30 );

	return new WP_REST_Response( [ 'ok' => true ], 200 );
}
`,
  },
  {
    name: "assets/js/lead-form.js",
    lang: "javascript",
    note: "fetch → REST → статусы. Кнопка блокируется на время запроса, honeypot проверяется и на клиенте.",
    code: `/**
 * KARKAS — lead-form.js (defer).
 * AJAX-отправка заявки: без перезагрузки страницы, без библиотек.
 * Данные для запроса (REST-URL и nonce) приходят из window.karkasData.
 */
(() => {
	'use strict';

	const form = document.querySelector('[data-lead-form]');
	if (!form) return;

	const btn = form.querySelector('[type="submit"]');
	const status = form.querySelector('[data-form-status]');
	const honeypot = form.querySelector('[name="website"]');

	const setStatus = (type, text) => {
		status.hidden = false;
		status.className = 'form-status form-status--' + type;
		status.textContent = text;
	};

	form.addEventListener('submit', async (event) => {
		event.preventDefault();

		// Бот попался в honeypot — молча «принимаем».
		if (honeypot && honeypot.value) return;
		if (btn.disabled) return;

		btn.disabled = true;
		btn.classList.add('is-loading');
		btn.setAttribute('aria-busy', 'true');

		try {
			const payload = {
				name: form.elements.name.value.trim(),
				phone: form.elements.phone.value.trim(),
				message: form.elements.message ? form.elements.message.value.trim() : '',
				website: honeypot ? honeypot.value : '',
				nonce: window.karkasData ? window.karkasData.nonce : '',
			};

			const res = await fetch(window.karkasData.rest, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			const data = await res.json().catch(() => ({}));

			if (res.ok && data.ok) {
				form.reset();
				setStatus('ok', 'Спасибо! Заявка улетела в Telegram — ответим в течение 15 минут.');
			} else {
				setStatus('error', data.message || 'Что-то пошло не так. Попробуйте ещё раз.');
			}
		} catch (err) {
			setStatus('error', 'Сеть недоступна. Напишите нам в Telegram — продублируем вручную.');
		} finally {
			btn.disabled = false;
			btn.classList.remove('is-loading');
			btn.removeAttribute('aria-busy');
		}
	});
})();
`,
  },
  {
    name: "template-parts/forms/lead-form.php",
    lang: "php-template",
    note: "Чистая семантическая разметка: label оборачивает input, honeypot скрыт, статус — с role='status' для скринридеров.",
    code: `<?php
/**
 * Форма заявки (разметка).
 * Логику отправки ведёт assets/js/lead-form.js.
 *
 * @package Karkas
 */

defined( 'ABSPATH' ) || exit;
?>
<form class="lead-form" id="lead-form" data-lead-form
	action="<?php echo esc_url( rest_url( 'karkas/v1/lead' ) ); ?>" method="post">

	<div class="lead-form__grid">
		<label class="field">
			<span class="field__label"><?php esc_html_e( 'Ваше имя', 'karkas' ); ?></span>
			<input class="field__input" type="text" name="name"
				autocomplete="name" required minlength="2" placeholder="Иван">
		</label>

		<label class="field">
			<span class="field__label"><?php esc_html_e( 'Телефон', 'karkas' ); ?></span>
			<input class="field__input" type="tel" name="phone"
				autocomplete="tel" required inputmode="tel" placeholder="+7 ___ ___-__-__">
		</label>

		<label class="field field--wide">
			<span class="field__label"><?php esc_html_e( 'Пара слов о задаче', 'karkas' ); ?></span>
			<textarea class="field__input" name="message" rows="3"
				placeholder="Например: нужен корпоративный сайт с каталогом"></textarea>
		</label>
	</div>

	<!-- Honeypot: скрыт от людей, привлекателен для ботов -->
	<label class="visually-hidden" aria-hidden="true">
		<?php esc_html_e( 'Ваш сайт', 'karkas' ); ?>
		<input type="text" name="website" tabindex="-1" autocomplete="off">
	</label>

	<button class="btn btn--primary lead-form__submit" type="submit">
		<span class="lead-form__submit-text"><?php esc_html_e( 'Отправить заявку', 'karkas' ); ?></span>
	</button>

	<p class="lead-form__note">
		<?php esc_html_e( 'Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных.', 'karkas' ); ?>
	</p>

	<p class="form-status" data-form-status role="status" hidden></p>
</form>
`,
  },
  {
    name: "wp-config.php (фрагмент)",
    lang: "php",
    note: "Секреты живут вне темы и вне репозитория. wp-config.php не коммитится — это правило деплоя.",
    code: `<?php
/**
 * Секреты Telegram-бота.
 * Добавить в wp-config.php ДО строки "That's all, stop editing!".
 *
 * Как получить значения за 5 минут:
 * 1. @BotFather → /newbot → копируем токен        → KARKAS_TG_TOKEN
 * 2. Добавляем бота в чат отдела продаж и делаем админом
 * 3. В чате пишем /start, затем @getidsbot отдаст ID → KARKAS_TG_CHAT
 */

define( 'KARKAS_TG_TOKEN', '123456789:AAE-xxxxxxxxxxxxxxxxxxxxxxxx' );
define( 'KARKAS_TG_CHAT', '-100123456789' );
`,
  },
];

export const STEP5_NOTES = [
  {
    title: "REST API, а не admin-ajax",
    text: "admin-ajax.php тащит полное ядро WordPress на каждый запрос и отдаёт 0 в теле при ошибке. REST даёт типизированные args с sanitize/validate-колбэками и нормальные HTTP-статусы.",
  },
  {
    title: "Nonce против CSRF",
    text: "wp_create_nonce('karkas_lead') создаётся в enqueue.php и уезжает на фронт в window.karkasData. wp_verify_nonce на сервере отсекает запросы, сгенерированные не вашей страницей.",
  },
  {
    title: "Honeypot ловит 99% ботов",
    text: "Скрытое поле website невидимо людям (visually-hidden), но автозаполнители спама его заполняют. Отвечаем «успехом» — бот не узнает, что его раскрыли.",
  },
  {
    title: "Rate-limit на транзиентах",
    text: "set_transient на 30 секунд с ключом по md5(IP) — простейшая защита от флуда, не требующая внешних сервисов и не трогающая cron.",
  },
];

export const SECURITY_CHECKS = [
  "wp_verify_nonce — запрос пришёл с нашей страницы",
  "Honeypot-поле отфильтровывает ботов до отправки",
  "Rate-limit: 1 заявка в 30 секунд с IP (транзиенты)",
  "sanitize_text_field / sanitize_textarea_field на всех полях",
  "esc_html() при сборке сообщения для Telegram",
  "Валидация телефона регулярным выражением (args REST)",
  "timeout => 5 на wp_remote_post — сайт не виснет из-за Telegram",
  "Токен и chat_id — в wp-config.php, не в репозитории",
];

export const TG_SETUP = [
  { step: "1", text: "В Telegram откройте @BotFather, отправьте /newbot и скопируйте токен." },
  { step: "2", text: "Добавьте бота в чат, куда должны падать заявки, и назначьте админом." },
  { step: "3", text: "Узнайте ID чата (@getidsbot) и пропишите обе константы в wp-config.php." },
  { step: "4", text: "Отправьте тестовую заявку с сайта — сообщение появится в чате." },
];
