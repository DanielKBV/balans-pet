# Шаг 0. Инструменты для Claude Code (15–20 минут)

Ставится один раз. Я перепроверил всё поиском: у каждого инструмента указано, кто автор и почему он в списке.

## Что ставим

| № | Инструмент | Кто сделал | Что даёт |
|---|---|---|---|
| 1 | **frontend-design** | Anthropic, официальный | Вид лендинга без «сгенерированного ИИ» стиля |
| 2 | **Context7** | Upstash, есть в официальном каталоге Anthropic | Claude Code читает свежую документацию next-intl, Next 16, React Three Fiber, а не вспоминает по памяти |
| 3 | **Chrome DevTools MCP** | Команда Chrome в Google, официальный | Claude Code сам меряет скорость, эмулирует слабый телефон, видит, что тормозит |
| 4 | **GSAP skills** | GreenSock, авторы GSAP, официальный | Анимации при прокрутке и их скорость |
| 5 | **Vercel agent skills** | Vercel, авторы Next.js, официальный | Правила скорости React и Next.js |
| 6 | **threejs-skills** | CloudAI-X, сообщество, 4 200 звёзд на GitHub | 13 skills по three.js и React Three Fiber под свежие версии, есть отдельные про скорость и R3F |
| 7 | **web-quality-skills** | Адди Османи (бывший руководитель Chrome Developer Experience в Google), неофициальный | Скорость, Core Web Vitals, доступность, SEO. Работает вместе с Chrome DevTools MCP |

Уже есть в проекте и тоже используются: `check-screens` (скриншоты 6 ширин) и `impeccable` (дизайн).

**Skill, который всё объединяет.** Готового официального нет: я проверил, есть только маленькие авторские наборы с 2–5 звёздами, им доверять рано. Поэтому я написал его под Balans: `balans-launch` в папке `v_repozitoriy`. В нём записано, какой инструмент для какой задачи, в каком порядке их соединять, проверки после каждой фазы и бюджет скорости. К нему два агента: `perf-auditor` (меряет скорость) и `screen-reviewer` (смотрит скриншоты глазами).

**Что я не взял:** `three-agent-skills` (emalorenzo) из прошлого списка заменён на `threejs-skills`: тот новее, шире и с проверенными версиями. Наборы «3D-сайт под ключ» (`3d-web-pack`, `immersive-3d-web`, `3d-website-architect`) не берём: у них по 2–5 звёзд и они дублируют то, что уже есть.

## Команды

Открой терминал в папке проекта (`C:\Users\HP\Desktop\Balans`).

**В обычном терминале:**

```
npx skills add cloudai-x/threejs-skills
npx skills add vercel-labs/agent-skills
claude mcp add chrome-devtools --scope user npx chrome-devtools-mcp@latest
```

Если установщик `skills` спросит, для какого агента, выбери Claude Code. Если спросит, какие skills, выбери все.

Если третья команда на Windows даст ошибку, используй такую:

```
claude mcp add chrome-devtools --scope user -- cmd /c npx -y chrome-devtools-mcp@latest
```

**Внутри Claude Code** (запусти `claude`, вводи по одной строке):

```
/plugin install frontend-design@claude-plugins-official
/plugin marketplace add greensock/gsap-skills
/plugin marketplace add addyosmani/web-quality-skills
/plugin install web-quality-skills@addy-web-quality-skills
/plugin
```

Последняя команда открывает окно плагинов. Во вкладке Discover найди и установи **Context7** и **gsap-skills**. Потом перезапусти Claude Code.

## Скопируй мои файлы в проект

Содержимое папки `v_repozitoriy` скопируй в корень проекта с заменой. Там две папки: `docs/launch/` и `.claude/` (она скрытая, начинается с точки). Проще всего распаковать архив `balans_launch.zip` и перетащить содержимое `v_repozitoriy` в `C:\Users\HP\Desktop\Balans`. Существующие `check-screens` и `impeccable` не затрутся.

## Проверка установки

Вставь в Claude Code:

```
Проверь, что всё установлено для запуска из docs/launch. Ничего не меняй в коде.
1. Перечисли, какие из этих skills ты видишь: balans-launch, frontend-design, impeccable, check-screens, threejs-react-three-fiber, threejs-performance, gsap-scrolltrigger, gsap-performance, react-best-practices, performance, core-web-vitals, seo, accessibility, web-quality-audit.
2. Перечисли агентов: perf-auditor, screen-reviewer.
3. Проверь MCP: context7 (найди документацию next-intl) и chrome-devtools (открой https://balans-pet.vercel.app и запиши трассировку загрузки).
4. Запусти npx lighthouse https://balans-pet.vercel.app --form-factor=mobile и покажи Performance, LCP, CLS, TBT. Запиши цифры в docs/launch/PROGRESS.md как «до начала».
5. Для каждого отсутствующего инструмента скажи точную команду установки.
```

Если чего-то одного не хватает, не застревай: в skill записано, что тогда Claude Code работает по официальной документации.
