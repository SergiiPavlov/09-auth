# 07-routing-nextjs

Продолжение NoteHub: улучшенная маршрутизация (Next.js App Router).

- Catch-all `/notes/filter/[...slug]` — фильтрация по тегу (`All` → без тега).
- Параллельные маршруты: `@sidebar` (меню тегов) и `@modal` (предпросмотр заметки).
- Перехват маршрута: открытие `/notes/[id]` из списка — модалка поверх страницы.
- Страница 404: `app/not-found.tsx`.
- CSR-данные через TanStack Query, серверная страница только прокидывает параметры.
- Стили скопированы из `react-notehub-styles-hw-07`.

## Скрипты
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run format`

`.env.local` с `NEXT_PUBLIC_NOTEHUB_TOKEN` уже положен.
