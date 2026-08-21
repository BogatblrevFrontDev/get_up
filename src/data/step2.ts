export type CodeFile = {
  name: string;
  lang: string;
  code: string;
  note?: string;
};

export const STEP2_FILES: CodeFile[] = [
  {
    name: "style.css",
    lang: "css",
    note: "Единственный файл, который WordPress требует в корне темы. Оставляем его паспортом — без единого правила стилей.",
    code: `/*!
Theme Name:   KARKAS
Theme URI:    https://example.dev/karkas
Author:       Команда разработки
Author URI:   https://example.dev
Description:  Быстрая корпоративная тема полного цикла: чистый PHP 8, SCSS,
              Vanilla JS. Mobile-first, цель — PageSpeed 95+ на мобильных.
              Без конструкторов и тяжёлых зависимостей.
Version:      1.0.0
Requires at least: 6.3
Requires PHP: 8.0
License:      GNU General Public License v2 or later
License URI:  http://www.gnu.org/licenses/gpl-2.0.html
Text Domain:  karkas
Tags:         one-column, custom-menu, custom-logo, translation-ready

Все стили собираются из SCSS в assets/css/main.css и подключаются
неблокирующе (preload + onload). Критический CSS инлайнится в <head>.
Этот файл содержит ТОЛЬКО мета-данные темы: ноль байт, блокирующих рендер.
*/
`,
  },
  {
    name: "functions.php",
    lang: "php",
    note: "Загрузчик модулей: константы + четыре require_once. Бизнес-логика здесь запрещена кодревью.",
    code: `<?php
/**
 * KARKAS — точка входа темы.
 *
 * Никакой бизнес-логики: только константы и подключение модулей из inc/.
 * Хуки и функции живут в своих модулях — functions.php остаётся читаемым.
 *
 * @package Karkas
 */

defined( 'ABSPATH' ) || exit;

define( 'KARKAS_VERSION', '1.0.0' );
define( 'KARKAS_DIR', get_template_directory() );
define( 'KARKAS_URI', get_template_directory_uri() );

// Телефон выносим в константу, чтобы header/footer не знали деталей.
define( 'KARKAS_PHONE', '+7 495 120-38-64' );

$modules = [ 'setup', 'enqueue', 'cleanup', 'ajax' ];

foreach ( $modules as $module ) {
	require_once KARKAS_DIR . "/inc/{$module}.php";
}
`,
  },
  {
    name: "inc/setup.php",
    lang: "php",
    note: "Поддержка возможностей темы и размеры изображений, нарезанные под реальную сетку — mobile-first.",
    code: `<?php
/**
 * Возможности темы: миниатюры, меню, размеры изображений.
 *
 * @package Karkas
 */

defined( 'ABSPATH' ) || exit;

add_action( 'after_setup_theme', static function (): void {

	// <title> управляется ядром — никаких хардкодов в header.php.
	add_theme_support( 'title-tag' );

	// Миниатюры для кейсов и блога.
	add_theme_support( 'post-thumbnails' );

	add_theme_support( 'custom-logo' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'html5', [ 'search-form', 'gallery', 'caption', 'style', 'script' ] );

	register_nav_menus( [
		'primary' => __( 'Основное меню', 'karkas' ),
		'footer'  => __( 'Меню в подвале', 'karkas' ),
	] );

	// Mobile-first размеры: отдаём ровно то, что просит сетка.
	// 640×400 — карточка кейса на мобильном и планшете.
	add_image_size( 'case-thumb', 640, 400, true );
	// 1280×800 — разворот кейса на десктопе.
	add_image_size( 'case-full', 1280, 800, true );
} );
`,
  },
  {
    name: "inc/enqueue.php",
    lang: "php",
    note: "Главный файл производительности: три слоя ассетов. Требует WordPress 6.3+ (strategy 'defer').",
    code: `<?php
/**
 * Подключение стилей и скриптов.
 *
 * Стратегия: критический CSS — инлайном, основной — неблокирующе,
 * скрипты — только defer. jQuery теме не нужен.
 *
 * @package Karkas
 */

defined( 'ABSPATH' ) || exit;

add_action( 'wp_enqueue_scripts', static function (): void {

	// 1) Критический CSS (~3 КБ) — прямо в <head>, без отдельного запроса.
	$critical = (string) file_get_contents( KARKAS_DIR . '/assets/css/critical.css' );

	wp_register_style( 'karkas-critical', false, [], KARKAS_VERSION );
	wp_enqueue_style( 'karkas-critical' );
	wp_add_inline_style( 'karkas-critical', $critical );

	// 2) Основной CSS. Регистрируем, чтобы дочерняя тема могла его снять,
	//    а ниже style_loader_tag заменит вывод на неблокирующий.
	wp_enqueue_style( 'karkas-main', KARKAS_URI . '/assets/css/main.css', [], KARKAS_VERSION );

	// 3) Скрипты — defer и в подвале (WordPress 6.3+).
	wp_enqueue_script( 'karkas-app', KARKAS_URI . '/assets/js/app.js', [], KARKAS_VERSION, [
		'strategy'  => 'defer',
		'in_footer' => true,
	] );

	wp_enqueue_script( 'karkas-lead', KARKAS_URI . '/assets/js/lead-form.js', [], KARKAS_VERSION, [
		'strategy'  => 'defer',
		'in_footer' => true,
	] );

	// 4) Данные для AJAX-формы: маршрут REST и nonce.
	wp_add_inline_script(
		'karkas-lead',
		sprintf(
			'window.karkasData = %s;',
			wp_json_encode(
				[
					'rest'  => esc_url_raw( rest_url( 'karkas/v1/lead' ) ),
					'nonce' => wp_create_nonce( 'karkas_lead' ),
				]
			)
		),
		'before'
	);
} );

/**
 * Основной CSS грузим неблокирующе: preload → onload → stylesheet.
 * Для браузеров без JS — <noscript>-фолбэк.
 */
add_filter( 'style_loader_tag', static function ( string $html, string $handle, string $href ): string {

	if ( 'karkas-main' !== $handle ) {
		return $html;
	}

	$href = esc_url( $href );

	return "<link rel=\\"preload\\" as=\\"style\\" href=\\"{$href}\\" onload=\\"this.onload=null;this.rel='stylesheet'\\">"
		. "<noscript><link rel=\\"stylesheet\\" href=\\"{$href}\\"></noscript>";
}, 10, 3 );

/**
 * jQuery и jquery-migrate не используются темой — снимаем с очереди,
 * если на них никто не подписался (экономим ~90 КБ).
 */
add_action( 'wp_default_scripts', static function ( WP_Scripts $scripts ): void {

	if ( isset( $scripts->registered['jquery'] ) ) {
		$scripts->registered['jquery']->deps = [];
	}
} );
`,
  },
  {
    name: "inc/cleanup.php",
    lang: "php",
    note: "Убираем из <head> всё, что корпоративному сайту не нужно. REST не трогаем — на нём работает форма.",
    code: `<?php
/**
 * Очистка <head> и лишних ассетов на фронте.
 *
 * Важно: REST API НЕ отключаем — на нём работает AJAX-форма (inc/ajax.php).
 *
 * @package Karkas
 */

defined( 'ABSPATH' ) || exit;

// Эмодзи-детект и спрайт: на корпоративном сайте не нужны.
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );
add_filter( 'emoji_svg_url', '__return_false' );

// Мусорные ссылки из <head>.
remove_action( 'wp_head', 'wlwmanifest_link' );
remove_action( 'wp_head', 'rsd_link' );
remove_action( 'wp_head', 'wp_generator' );
remove_action( 'wp_head', 'wp_shortlink_wp_head' );
remove_action( 'wp_head', 'adjacent_posts_rel_link_wp_head', 10 );

// oEmbed-дискавери и его JS.
remove_action( 'wp_head', 'wp_oembed_add_discovery_links' );
remove_action( 'wp_head', 'wp_oembed_add_host_js' );

// Стили блочного редактора и theme.json на фронте не нужны —
// тема сверстана руками, Gutenberg в шаблонах не используется.
add_action( 'wp_enqueue_scripts', static function (): void {
	wp_dequeue_style( 'global-styles' );
	wp_dequeue_style( 'wp-block-library' );
	wp_dequeue_style( 'wp-block-library-theme' );
	wp_dequeue_style( 'classic-theme-styles' );
}, 100 );

// Dashicons нужны только авторизованным (админ-бар). Гостям — долой.
add_action( 'wp_enqueue_scripts', static function (): void {

	if ( is_user_logged_in() ) {
		return;
	}

	add_action( 'wp_print_styles', static function (): void {
		wp_deregister_style( 'dashicons' );
	}, 100 );
} );

// XML-RPC — атавизм, закрываем.
add_filter( 'xmlrpc_enabled', '__return_false' );
`,
  },
];

export const STEP2_NOTES = [
  {
    title: "style.css — паспорт, а не стили",
    text: "WordPress узнаёт тему по заголовку файла. Если подключить его как таблицу стилей, каждый гость скачает их впустую — поэтому файл остаётся чисто мета-данными.",
  },
  {
    title: "Критический CSS инлайнится",
    text: "wp_register_style с false + wp_add_inline_style — штатный способ встроить ~3 КБ в <head>. Первый экран рисуется до единого запроса за стилями.",
  },
  {
    title: "defer — нативно, с WP 6.3",
    text: "Пятый параметр wp_enqueue_script принимает ['strategy' => 'defer']. Без самописных фильтров script_loader_tag и костылей с wp_script_add_data.",
  },
  {
    title: "Nonce уезжает на фронт",
    text: "wp_add_inline_script с window.karkasData отдаёт форме REST-URL и wp_create_nonce('karkas_lead') — проверка подлинности запроса без плагинов.",
  },
];
