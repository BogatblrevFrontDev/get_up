import type { CodeFile } from "./step2";

export const STEP3_FILES: CodeFile[] = [
  {
    name: "header.php",
    lang: "php-template",
    note: "Минимальный <head>: charset, viewport, theme-color и wp_head() — всё остальное уже под контролем inc/enqueue.php и inc/cleanup.php.",
    code: `<?php
/**
 * Шапка сайта и <head>.
 *
 * Критический CSS инлайнится через inc/enqueue.php,
 * шрифты — самозагружаемые woff2 из assets/fonts (font-display: swap
 * объявлен в critical.css). Никаких внешних CDN.
 *
 * @package Karkas
 */

defined( 'ABSPATH' ) || exit;
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="theme-color" content="#0e1116">
	<?php wp_head(); ?>
</head>

<body <?php body_class( 'site' ); ?>>
<?php wp_body_open(); ?>

<a class="skip-link" href="#content"><?php esc_html_e( 'Перейти к содержимому', 'karkas' ); ?></a>

<header class="site-header">
	<div class="container site-header__inner">

		<?php if ( has_custom_logo() ) : ?>
			<?php the_custom_logo(); ?>
		<?php else : ?>
			<a class="site-logo" href="<?php echo esc_url( home_url( '/' ) ); ?>">
				<?php bloginfo( 'name' ); ?>
			</a>
		<?php endif; ?>

		<nav class="site-nav" aria-label="<?php esc_attr_e( 'Основное меню', 'karkas' ); ?>">
			<?php
			wp_nav_menu(
				[
					'theme_location' => 'primary',
					'container'      => false,
					'menu_class'     => 'site-nav__list',
					'fallback_cb'    => false,
				]
			);
			?>
		</nav>

		<a class="site-phone" href="tel:<?php echo esc_attr( str_replace( [ ' ', '-' ], '', KARKAS_PHONE ) ); ?>">
			<?php echo esc_html( KARKAS_PHONE ); ?>
		</a>

		<button class="burger" type="button" aria-expanded="false" aria-controls="mobile-menu">
			<span class="burger__line"></span>
			<span class="burger__line"></span>
			<span class="visually-hidden"><?php esc_html_e( 'Открыть меню', 'karkas' ); ?></span>
		</button>
	</div>

	<nav class="mobile-menu" id="mobile-menu" hidden
		aria-label="<?php esc_attr_e( 'Мобильное меню', 'karkas' ); ?>">
		<?php
		wp_nav_menu(
			[
				'theme_location' => 'primary',
				'container'      => false,
				'menu_class'     => 'mobile-menu__list',
				'fallback_cb'    => false,
			]
		);
		?>
	</nav>
</header>
`,
  },
  {
    name: "footer.php",
    lang: "php-template",
    note: "Подвал закрывает страницу: меню, контакты, политика конфиденциальности и единственный wp_footer() перед </body>.",
    code: `<?php
/**
 * Подвал сайта.
 *
 * wp_footer() вызывается ровно один раз, непосредственно перед </body> —
 * сюда defer-скрипты уже ничего не блокируют.
 *
 * @package Karkas
 */

defined( 'ABSPATH' ) || exit;
?>

<footer class="site-footer">
	<div class="container site-footer__grid">

		<div class="site-footer__brand">
			<p class="site-footer__name"><?php bloginfo( 'name' ); ?></p>
			<p class="site-footer__desc"><?php echo esc_html( get_bloginfo( 'description' ) ); ?></p>
		</div>

		<nav class="site-footer__nav" aria-label="<?php esc_attr_e( 'Меню в подвале', 'karkas' ); ?>">
			<?php
			wp_nav_menu(
				[
					'theme_location' => 'footer',
					'container'      => false,
					'menu_class'     => 'site-footer__list',
					'fallback_cb'    => false,
				]
			);
			?>
		</nav>

		<div class="site-footer__contacts">
			<a href="tel:<?php echo esc_attr( str_replace( [ ' ', '-' ], '', KARKAS_PHONE ) ); ?>">
				<?php echo esc_html( KARKAS_PHONE ); ?>
			</a>
			<a href="mailto:hello@example.dev">hello@example.dev</a>
			<a href="https://t.me/example_dev" rel="noopener">Telegram</a>
		</div>
	</div>

	<div class="container site-footer__bottom">
		<span>© <?php echo esc_html( gmdate( 'Y' ) ); ?> <?php bloginfo( 'name' ); ?></span>
		<?php if ( get_privacy_policy_url() ) : ?>
			<a href="<?php echo esc_url( get_privacy_policy_url() ); ?>">
				<?php esc_html_e( 'Политика конфиденциальности', 'karkas' ); ?>
			</a>
		<?php endif; ?>
	</div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
`,
  },
];

export const STEP3_NOTES = [
  {
    title: "Шрифты — самозагружаемые",
    text: "woff2 лежат в assets/fonts, @font-face с font-display: swap объявлен в critical.css. Нет внешнего CDN — нет и preconnect, и стороннего запроса, который ломает LCP на мобильной сети.",
  },
  {
    title: "<head> на три строки",
    text: "charset, viewport, theme-color + wp_head(). Title и canonical отдаёт ядро (title-tag), description — SEO-плагин. Эмодзи и oEmbed уже вычищены в cleanup.php.",
  },
  {
    title: "Доступность из коробки",
    text: "skip-link до контента, aria-label у каждой nav-зоны, бургер с aria-expanded/aria-controls и видимым только скринридеру текстом. Это бесплатно и снимает вопросы аудитов.",
  },
  {
    title: "wp_footer() — один и в конце",
    text: "Все defer-скрипты темы уже распарсены к этому моменту; wp_footer() добавляет только то, что должны подключить плагины. Дублировать вызов — классическая ошибка, удваивающая очереди.",
  },
];
