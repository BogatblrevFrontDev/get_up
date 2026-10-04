export type TreeNode = {
  name: string;
  type: "dir" | "file";
  path: string;
  desc?: string;
  chips?: string[];
  points?: string[];
  children?: TreeNode[];
};

export const FILE_TREE: TreeNode = {
  name: "karkas/",
  type: "dir",
  path: "karkas",
  desc: "Корень темы. Здесь лежит только то, что обязан видеть WordPress: обязательные шаблоны и точка входа. Вся логика вынесена в inc/, секции — в template-parts/, статика — в assets/.",
  children: [
    {
      name: "style.css",
      type: "file",
      path: "karkas/style.css",
      desc: "Паспорт темы: Theme Name, Version, Requires PHP 8.0, Text Domain. Ни одной строки стилей — файл не участвует в рендере, 0 КБ блокирующего CSS.",
      chips: ["только мета", "0 КБ в рендере"],
    },
    {
      name: "functions.php",
      type: "file",
      path: "karkas/functions.php",
      desc: "Точка входа темы. Не содержит бизнес-логики: определяет константы и подключает четыре модуля из inc/. Простыня кода в functions.php — первый признак темы, которую невозможно поддерживать.",
      chips: ["загрузчик модулей", "PHP 8"],
      points: [
        "define KARKAS_VERSION / KARKAS_DIR / KARKAS_URI — единые константы для всех модулей",
        "require_once inc/setup.php, enqueue.php, cleanup.php, ajax.php",
        "Ноль хуков напрямую — каждый хук живёт в своём модуле",
      ],
    },
    { name: "index.php", type: "file", path: "karkas/index.php", desc: "Обязательный fallback WordPress. Минимальный: шапка → цикл → подвал. Существует, чтобы тема не упала на нестандартном запросе." },
    {
      name: "header.php",
      type: "file",
      path: "karkas/header.php",
      desc: "Чистый <head> и семантическая шапка. Критический CSS уже заинлайнен через inc/enqueue.php, шрифты — самозагружаемые woff2, шапка доступна с клавиатуры (skip-link, aria).",
      chips: ["критический CSS", "a11y"],
    },
    { name: "footer.php", type: "file", path: "karkas/footer.php", desc: "Подвал: меню, контакты, юридические ссылки и wp_footer() ровно один раз перед </body>. Ничего лишнего не подключает." },
    { name: "front-page.php", type: "file", path: "karkas/front-page.php", desc: "Главная страница. Собирается из четырёх секций template-parts через get_template_part(). Порядок секций — единственное, что здесь есть.", chips: ["get_template_part"] },
    { name: "page.php", type: "file", path: "karkas/page.php", desc: "Базовый шаблон статичных страниц: «Услуги», «Контакты», «О компании». Заголовок + контент + CTA-блок с формой." },
    { name: "single.php", type: "file", path: "karkas/single.php", desc: "Статья блога: заголовок, мета (дата, автор, время чтения), контент, блок похожих записей. Разметка — под SEO-микроданные Article." },
    { name: "archive.php", type: "file", path: "karkas/archive.php", desc: "Лента блога: анонсы записей и нативная пагинация get_the_posts_pagination() — без тяжёлых плагинов постраничной навигации." },
    { name: "screenshot.png", type: "file", path: "karkas/screenshot.png", desc: "Превью темы в админке WordPress, 1200×900, сжатый PNG до ~150 КБ." },
    {
      name: "inc/",
      type: "dir",
      path: "karkas/inc",
      desc: "PHP-модули темы. Один файл — одна зона ответственности. Такой inc/ переносится между проектами почти без изменений.",
      children: [
        {
          name: "setup.php",
          type: "file",
          path: "karkas/inc/setup.php",
          desc: "Возможности темы: title-tag, миниатюры, custom-logo, html5, два меню. Здесь же — кастомные размеры изображений, нарезанные mobile-first.",
          chips: ["after_setup_theme"],
          points: [
            "add_image_size('case-thumb', 640, 400, true) — ровно под мобильную сетку, без переразмера",
            "add_image_size('case-full', 1280, 800, true) — для десктопа и страницы кейса",
          ],
        },
        {
          name: "enqueue.php",
          type: "file",
          path: "karkas/inc/enqueue.php",
          desc: "Сердце производительности темы. Три слоя ассетов: инлайн-критический CSS, main.css через preload+onload, скрипты только со strategy 'defer'. jQuery и jquery-migrate выпиливаются.",
          chips: ["preload", "defer", "без jQuery"],
          points: [
            "wp_add_inline_style — критический CSS (~3 КБ) прямо в <head>",
            "style_loader_tag фильтруется в неблокирующий preload/onload",
            "wp_enqueue_script(..., ['strategy' => 'defer']) — API WordPress 6.3+",
            "wp_add_inline_script отдаёт фронту REST-URL и nonce для формы",
          ],
        },
        {
          name: "cleanup.php",
          type: "file",
          path: "karkas/inc/cleanup.php",
          desc: "Чистит <head> от мусора: эмодзи-скрипты, oEmbed-дискавери, WLWManifest, dashicons для гостей, стили Gutenberg и theme.json на фронте. Экономит 40–60 КБ и несколько запросов.",
          chips: ["−40 КБ", "−4 запроса"],
        },
        {
          name: "ajax.php",
          type: "file",
          path: "karkas/inc/ajax.php",
          desc: "REST-эндпоинт karkas/v1/lead: валидация аргументов, nonce, honeypot, rate-limit на транзиентах и отправка заявки в Telegram Bot API через wp_remote_post. Без единого плагина форм.",
          chips: ["REST API", "Telegram", "без плагинов"],
        },
      ],
    },
    {
      name: "template-parts/",
      type: "dir",
      path: "karkas/template-parts",
      desc: "Секции страниц как детали конструктора — но без конструктора. Каждая секция переиспользуется на любой странице через get_template_part().",
      children: [
        { name: "hero.php", type: "file", path: "karkas/template-parts/hero.php", desc: "Первый экран: УТП, подзаголовок, два CTA и блок микро-доказательств (цифры). Полностью покрыт критическим CSS — LCP рисуется без ожидания main.css." },
        { name: "advantages.php", type: "file", path: "karkas/template-parts/advantages.php", desc: "Преимущества: шесть пунктов с inline-SVG-иконками. Никаких шрифтовых иконок — иконка весит 300–700 байт и красится через currentColor." },
        { name: "cases-preview.php", type: "file", path: "karkas/template-parts/cases-preview.php", desc: "Три свежих кейса из CPT: WP_Query с no_found_rows, миниатюры case-thumb, loading='lazy' и decoding='async'." },
        { name: "cta.php", type: "file", path: "karkas/template-parts/cta.php", desc: "Финальный призыв к действию: заголовок-оффер и подключение формы заявки." },
        {
          name: "forms/",
          type: "dir",
          path: "karkas/template-parts/forms",
          desc: "Формы сайта. Разметка отделена от логики: PHP только выводит поля, всю работу делает lead-form.js.",
          children: [
            { name: "lead-form.php", type: "file", path: "karkas/template-parts/forms/lead-form.php", desc: "Форма заявки: имя, телефон, комментарий, скрытое honeypot-поле, строка статуса с role='status' и data-атрибуты для JS." },
          ],
        },
      ],
    },
    {
      name: "assets/",
      type: "dir",
      path: "karkas/assets",
      desc: "Статика: стили, скрипты, картинки, шрифты. В репозиторий коммитятся собранные css/js — сборка SCSS живёт в npm-скриптах.",
      children: [
        {
          name: "css/",
          type: "dir",
          path: "karkas/assets/css",
          desc: "Собранные стили. Два файла — два слоя загрузки.",
          children: [
            { name: "critical.css", type: "file", path: "karkas/assets/css/critical.css", desc: "~3 КБ самого важного: шапка, герой, сетка, типографика, @font-face. Инлайнится в <head> — первый экран не ждёт сеть.", chips: ["инлайн", "~3 КБ"] },
            { name: "main.css", type: "file", path: "karkas/assets/css/main.css", desc: "Весь сайт, собранный из SCSS, с autoprefixer и cssnano. Грузится неблокирующе после critical.", chips: ["preload", "минифицирован"] },
          ],
        },
        {
          name: "scss/",
          type: "dir",
          path: "karkas/assets/scss",
          desc: "Исходники стилей. Сборка: sass + postcss-cli (autoprefixer + cssnano) одной командой npm run build:css.",
          children: [
            { name: "main.scss", type: "file", path: "karkas/assets/scss/main.scss", desc: "Точка входа: импорты партиалов в порядке variables → base → layout → секции → формы." },
            { name: "_variables.scss", type: "file", path: "karkas/assets/scss/_variables.scss", desc: "Токены дизайна: цвета, шкала отступов, типографика, breakpoints mobile-first (min-width)." },
            { name: "_base.scss", type: "file", path: "karkas/assets/scss/_base.scss", desc: "Сброс, контейнер, утилиты (.visually-hidden, .reveal), типографика." },
            { name: "_header.scss", type: "file", path: "karkas/assets/scss/_header.scss", desc: "Шапка, бургер, мобильное меню — только transform/opacity в анимациях." },
            { name: "_sections.scss", type: "file", path: "karkas/assets/scss/_sections.scss", desc: "Секции главной, карточки кейсов, CTA." },
            { name: "_forms.scss", type: "file", path: "karkas/assets/scss/_forms.scss", desc: "Поля, кнопка с состоянием is-loading, строка статуса." },
          ],
        },
        {
          name: "js/",
          type: "dir",
          path: "karkas/assets/js",
          desc: "Vanilla JS, ноль зависимостей. Два файла — два сценария.",
          children: [
            { name: "app.js", type: "file", path: "karkas/assets/js/app.js", desc: "Бургер-меню, плавный скролл, reveal-анимации на Intersection Observer. ~4 КБ, подключается с defer.", chips: ["defer", "~4 КБ"] },
            { name: "lead-form.js", type: "file", path: "karkas/assets/js/lead-form.js", desc: "AJAX-отправка формы: fetch → REST → Telegram. Состояния загрузки, успеха и ошибок — без перезагрузки страницы.", chips: ["fetch", "0 библиотек"] },
          ],
        },
        { name: "img/", type: "dir", path: "karkas/assets/img", desc: "Только SVG и WebP. Растры всегда с width/height в разметке — CLS равен нулю." },
        { name: "fonts/", type: "dir", path: "karkas/assets/fonts", desc: "Самозагружаемые woff2 (кириллица + латиница, subsets). font-display: swap объявлен в critical.css — никакого FOIT." },
      ],
    },
  ],
};

export const findNode = (root: TreeNode, path: string): TreeNode | null => {
  if (root.path === path) return root;
  for (const child of root.children ?? []) {
    const found = findNode(child, path);
    if (found) return found;
  }
  return null;
};

export const DECISIONS = [
  {
    title: "inc/ вместо простыни functions.php",
    text: "Каждый модуль — одна зона ответственности: setup, enqueue, cleanup, ajax. Модули переезжают между проектами, ревью-диффы читаются, конфликты при merges почти исчезают.",
  },
  {
    title: "template-parts/ — секции как детали",
    text: "Главная собирается из hero, advantages, cases-preview, cta через get_template_part(). Ту же форму или CTA можно вставить в любую страницу одной строкой — гибкость конструктора без его веса.",
  },
  {
    title: "Два слоя CSS: critical + main",
    text: "~3 КБ критического CSS инлайнятся в <head> и рисуют первый экран мгновенно. Остальные ~30 КБ main.css подтягиваются через preload → onload, не блокируя рендер. Именно это даёт зелёный LCP на мобильных.",
  },
  {
    title: "Ноль зависимостей на фронте",
    text: "Vanilla JS + Intersection Observer + fetch закрывают все задачи темы: меню, анимации, AJAX-форма. jQuery выпиливается из зависимостей — минус ~90 КБ, которые корпоративному сайту не нужны.",
  },
  {
    title: "SCSS собирается, не редактируется",
    text: "В репозитории и на проде — только собранные critical.css и main.css. Партиалы с переменными и mobile-first breakpoints (min-width) держат дизайн в токенах, cssnano жмёт вывод.",
  },
];

export const STATS = [
  { value: "~20", label: "файлов в теме" },
  { value: "4", label: "PHP-модуля в inc/" },
  { value: "0", label: "плагинов форм и конструкторов" },
  { value: "~7 КБ", label: "весь JavaScript темы" },
];
