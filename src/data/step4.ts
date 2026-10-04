import type { CodeFile } from "./step2";

export const STEP4_FILES: CodeFile[] = [
  {
    name: "front-page.php",
    lang: "php",
    note: "Главная — только порядок секций. Логика в inc/, вёрстка секций — в template-parts/.",
    code: `<?php
/**
 * Главная страница.
 *
 * Шаблон-сборщик: порядок секций — единственное, что здесь есть.
 * Секции переиспользуются на других страницах через get_template_part().
 *
 * @package Karkas
 */

defined( 'ABSPATH' ) || exit;

get_header(); ?>

<main id="content" class="page-main">

	<?php get_template_part( 'template-parts/hero' ); ?>

	<?php get_template_part( 'template-parts/advantages' ); ?>

	<?php get_template_part( 'template-parts/cases', 'preview' ); ?>

	<?php get_template_part( 'template-parts/cta' ); ?>

</main>

<?php
get_footer();
`,
  },
  {
    name: "template-parts/hero.php",
    lang: "php-template",
    note: "Первый экран покрыт критическим CSS целиком: LCP-элемент рисуется до загрузки main.css.",
    code: `<?php
/**
 * Первый экран: УТП + CTA + микро-доказательства.
 *
 * @package Karkas
 */

defined( 'ABSPATH' ) || exit;
?>
<section class="hero" aria-labelledby="hero-title">
	<div class="container hero__inner">

		<p class="hero__kicker reveal"><?php esc_html_e( 'Веб-разработка полного цикла', 'karkas' ); ?></p>

		<h1 class="hero__title reveal" id="hero-title">
			<?php esc_html_e( 'Сайты, которые окупаются, а не просто «есть»', 'karkas' ); ?>
		</h1>

		<p class="hero__lead reveal">
			<?php esc_html_e( 'Проектируем, разрабатываем и запускаем корпоративные сайты за 6 недель. PageSpeed 95+ на мобильных — не обещание, а пункт договора.', 'karkas' ); ?>
		</p>

		<div class="hero__actions reveal">
			<a class="btn btn--primary" href="#lead-form"><?php esc_html_e( 'Обсудить проект', 'karkas' ); ?></a>
			<a class="btn btn--ghost" href="<?php echo esc_url( home_url( '/kejssy/' ) ); ?>">
				<?php esc_html_e( 'Смотреть кейсы', 'karkas' ); ?>
			</a>
		</div>

		<dl class="hero__proof reveal" aria-label="<?php esc_attr_e( 'Факты о компании', 'karkas' ); ?>">
			<div><dt><?php esc_html_e( 'лет на рынке', 'karkas' ); ?></dt><dd>11</dd></div>
			<div><dt><?php esc_html_e( 'проектов запущено', 'karkas' ); ?></dt><dd>240+</dd></div>
			<div><dt><?php esc_html_e( 'средний рост конверсии', 'karkas' ); ?></dt><dd>×1,8</dd></div>
		</dl>

	</div>
</section>
`,
  },
  {
    name: "template-parts/cases-preview.php",
    lang: "php-template",
    note: "WP_Query с no_found_rows — не считаем общее число записей, запрос быстрее. Миниатюры ленивые.",
    code: `<?php
/**
 * Превью кейсов: три свежих проекта из CPT "case".
 *
 * @package Karkas
 */

defined( 'ABSPATH' ) || exit;

$cases = new WP_Query(
	[
		'post_type'      => 'case',
		'posts_per_page' => 3,
		'no_found_rows'  => true, // пагинации нет — не считаем COUNT(*)
	]
);

if ( ! $cases->have_posts() ) {
	return;
}
?>
<section class="cases-preview" aria-labelledby="cases-title">
	<div class="container">

		<div class="section-head reveal">
			<h2 class="section-title" id="cases-title"><?php esc_html_e( 'Свежие кейсы', 'karkas' ); ?></h2>
			<a class="section-link" href="<?php echo esc_url( home_url( '/kejssy/' ) ); ?>">
				<?php esc_html_e( 'Все проекты', 'karkas' ); ?> →
			</a>
		</div>

		<div class="cases-preview__grid">
			<?php while ( $cases->have_posts() ) : $cases->the_post(); ?>
				<article class="case-card reveal">
					<a class="case-card__link" href="<?php the_permalink(); ?>"
						aria-label="<?php the_title_attribute(); ?>">

						<?php if ( has_post_thumbnail() ) : ?>
							<?php
							the_post_thumbnail(
								'case-thumb',
								[
									'loading'  => 'lazy',   // нативная ленивая загрузка
									'decoding' => 'async',  // декодирование вне главного потока
									'class'    => 'case-card__img',
								]
							);
							?>
						<?php endif; ?>

						<h3 class="case-card__title"><?php the_title(); ?></h3>

						<p class="case-card__meta">
							<?php echo esc_html( get_post_meta( get_the_ID(), 'result', true ) ); ?>
						</p>
					</a>
				</article>
			<?php endwhile; ?>
		</div>

	</div>
</section>
<?php wp_reset_postdata(); ?>
`,
  },
  {
    name: "assets/scss/_reveal.scss",
    lang: "scss",
    note: "Анимируются только transform и opacity — свойства, которые браузер считает на композиторе, без layout и paint.",
    code: `// Появление блоков при скролле.
// Анимировать можно только transform и opacity: они не вызывают
// reflow и не перерисовывают соседей — дёшево даже на слабых телефонах.

.reveal {
	opacity: 0;
	transform: translateY(24px);
	transition:
		opacity 0.6s cubic-bezier(0.2, 0.7, 0.2, 1),
		transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
	transition-delay: var(--reveal-delay, 0s); // стаггер для сеток
}

.reveal.is-in {
	opacity: 1;
	transform: none;
}

// Уважение к настройкам пользователя: без анимаций вообще.
@media (prefers-reduced-motion: reduce) {
	.reveal {
		opacity: 1;
		transform: none;
		transition: none;
	}
}
`,
  },
  {
    name: "assets/js/app.js",
    lang: "javascript",
    note: "Intersection Observer срабатывает один раз на блок (unobserve). Без IO или при reduce-motion — блоки показываются сразу.",
    code: `/**
 * KARKAS — app.js (~4 КБ, defer).
 * Бургер-меню, плавный скролл, reveal-анимации.
 * Ноль зависимостей: только Vanilla JS.
 */
(() => {
	'use strict';

	/* 1. Бургер-меню */
	const burger = document.querySelector('.burger');
	const mobileMenu = document.getElementById('mobile-menu');

	if (burger && mobileMenu) {
		burger.addEventListener('click', () => {
			const open = burger.getAttribute('aria-expanded') === 'true';
			burger.setAttribute('aria-expanded', String(!open));
			mobileMenu.hidden = open;
			document.body.classList.toggle('menu-open', !open);
		});
	}

	/* 2. Плавный скролл по якорям — без библиотек */
	document.querySelectorAll('a[href^="#"]').forEach((link) => {
		link.addEventListener('click', (event) => {
			const target = document.querySelector(link.getAttribute('href'));
			if (!target) return;
			event.preventDefault();
			target.scrollIntoView({ behavior: 'smooth', block: 'start' });
		});
	});

	/* 3. Reveal-анимации через Intersection Observer */
	const items = document.querySelectorAll('.reveal');
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (reduceMotion || !('IntersectionObserver' in window)) {
		items.forEach((el) => el.classList.add('is-in'));
		return;
	}

	const io = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				entry.target.classList.add('is-in');
				io.unobserve(entry.target); // анимируем один раз
			}
		},
		{
			rootMargin: '0px 0px -8% 0px',
			threshold: 0.1,
		}
	);

	items.forEach((el) => io.observe(el));
})();
`,
  },
];

export const STEP4_NOTES = [
  {
    title: "get_template_part вместо include",
    text: "Штатный механизм WordPress: ищет cases-preview.php, затем cases.php, поддерживает второй параметр. Секции переиспользуются и переопределяются в дочерней теме.",
  },
  {
    title: "no_found_rows = быстрее",
    text: "Когда пагинация не нужна, WP_Query по умолчанию всё равно делает второй запрос COUNT(*). no_found_rows: true убирает его — на больших CPT это заметно.",
  },
  {
    title: "loading='lazy' + decoding='async'",
    text: "Нативная ленивая загрузка картинок ниже первого экрана и асинхронное декодирование — две бесплатные победы для LCP и INP. Герой остаётся без lazy: он и есть LCP.",
  },
  {
    title: "unobserve после появления",
    text: "Каждый блок анимируется один раз и отписывается от наблюдателя: на длинной странице IO не держит сотни подписок — колбэк срабатывает ровно столько раз, сколько нужно.",
  },
];
