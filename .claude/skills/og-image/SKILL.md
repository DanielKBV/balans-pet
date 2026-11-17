---
name: og-image
description: Делает дизайнерскую картинку превью ссылки (Open Graph, 1200x630) для Balans через next/og ImageResponse по готовому эталону, на EN и RU. Использовать в RUN 4, фаза 1, и при любой правке превью ссылки.
---

# OG-картинка Balans

Цель: превью ссылки в Telegram, LinkedIn, Upwork выглядит как у Linear, Vercel, Stripe. Это **собранная картинка** (логотип, заголовок, мини-интерфейс, серебряные монеты), а **не скриншот сайта**.

Дизайн уже утверждён глазами. Эталон кода: `docs/launch/og/og_reference.tsx`. Эталон результата: `docs/launch/og/reference/og-<ВАРИАНТ>-<en|ru>.png`. Вариант (A, B или C) Даниэл называет в промте. Ничего не придумывай сверх эталона: перенеси его 1 в 1.

## Что уже лежит в репозитории

- `assets/og/fonts/` — Inter 400/600/700 и Geist Mono 500 в TTF (с кириллицей).
- `assets/og/coins-ring.png` (вариант A) — серебряные монеты, отрендеренные из Blender-модели сайта, фон прозрачный. Выбран и сделан вариант A; монеты вариантов B и C (`coin-*.png`) и их эталоны удалены, они есть в `balans_og.zip` у Даниэла.
- Папка `assets/` не в `public/`, наружу не отдаётся. Читаем через `fs`.

## Как устроить

1. **`app/og/route.tsx`** — route handler, `export const runtime = "nodejs"`.
   - `GET(req)`: `lang = searchParams.get("lang") === "ru" ? "ru" : "en"`.
   - Шрифты и PNG: `readFile(join(process.cwd(), "assets/og/..."))`. PNG превращай в `data:image/png;base64,...`.
   - Вернуть `new ImageResponse(<OgX lang={lang} img={img} />, { width: 1200, height: 630, fonts, headers: { "Cache-Control": "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400" } })`.
   - Компонент варианта положи рядом: `app/og/og-card.tsx` (перенеси из эталона только выбранный вариант и то, что он использует: `C`, `COPY`, `Logo`, `Pill`, `Url`, `Backdrop`, `Phone`).
2. **Метаданные главной** (`app/page.tsx` или где сейчас `metadata` лендинга): `generateMetadata({ searchParams })`. Язык берём из `?lang=` (по умолчанию `en`: боты приходят без cookie).
   - `openGraph: { type: "website", siteName: "Balans", url, title, description, locale: "en_US" | "ru_RU", images: [{ url: \`/og?lang=${lang}\`, width: 1200, height: 630, alt }] }`
   - `twitter: { card: "summary_large_image", title, description, images: [\`/og?lang=${lang}\`] }`
   - `metadataBase: new URL("https://balans-pet.vercel.app")` в корневом layout, если его ещё нет.
   - Тексты title/description/alt бери из словарей next-intl, не хардкодь.
   - Если в проекте уже есть `opengraph-image.*` или `twitter-image.*` в `app/`, удали их: файловая конвенция перебьёт наши теги.
3. Итог: `balans-pet.vercel.app` → английское превью, `balans-pet.vercel.app/?lang=ru` → русское (ссылку с `?lang=ru` Даниэл ставит в русское резюме).

## Правила Satori (иначе упадёт или поедет)

- У каждого `<div>` с несколькими детьми обязательно `display: "flex"`. Текст с переменной пиши одной строкой-шаблоном: `` {`${URL}/dashboard`} ``, не `{URL}/dashboard`.
- Только flex и `position: absolute`. Нет CSS grid, нет `filter: blur`, нет `backdrop-filter`, нет `calc()`.
- **Нельзя большой `box-shadow`** (blur больше ~30px и тени у элементов у края): resvg падает с `unwrap() on None`. Свечение делай слоем `radial-gradient`, рамку — `border`, а не `0 0 0 1px`-тенью.
- **Шрифт Inter, не Geist**: у Geist в Satori слишком широкие пробелы. Geist Mono только для адреса сайта.
- Шрифты только TTF/OTF/WOFF (не WOFF2). У `<img>` всегда `width` и `height`.
- Не тянуть шрифты и картинки по сети во время запроса: всё из `assets/og/`.

## Проверка (обязательно, до СТОП)

1. `dev`-скрипт проекта, открыть `http://localhost:3000/og?lang=en` и `?lang=ru`. Сделать скриншоты 1200x630 и положить рядом с `docs/launch/og/reference/og-<ВАРИАНТ>-*.png`. Отличий быть не должно (допустим сдвиг в пару пикселей). Если отличается — чинить, а не «и так сойдёт».
2. `curl -sI localhost:3000/og?lang=ru` → `200`, `content-type: image/png`. Размер ответа меньше 1 МБ.
3. сборка и запуск (`build`, затем `start`), затем `curl -s localhost:3000/ | grep -E 'og:image|twitter:'` и то же для `/?lang=ru`: в `og:image` абсолютный URL с `?lang=`.
4. Кириллица: на RU-картинке нет квадратиков.
5. Ворота качества проекта (`lint`, `typecheck`, `build`).
6. После деплоя preview: открыть `<preview-url>/og?lang=en`. Если Vercel preview закрыт паролем, проверить на продакшене после слияния.

## После слияния (сказать Даниэлу)

Отправить себе в «Избранное» Telegram обе ссылки (`https://balans-pet.vercel.app` и `https://balans-pet.vercel.app/?lang=ru`). Если видна старая картинка, отправить ссылку боту `@WebpageBot`, он обновит кэш. LinkedIn: Post Inspector (`linkedin.com/post-inspector`).

## Не делать

Не делать скриншот сайта через Playwright как OG. Не менять тексты лендинга. Не добавлять в картинку стек, код, «Next.js / Supabase». Не трогать дизайн эталона без слова Даниэла.
