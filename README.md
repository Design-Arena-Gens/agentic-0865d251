# Notion Clone

A minimalist Notion-style workspace built with Next.js 14 and Tailwind CSS. The app supports multi-page workspaces, block-based editing, list and to-do blocks, and local persistence via `localStorage`.

## Features

- Sidebar with searchable page list and emoji icons
- Page creation, renaming, and deletion
- Blocks for text, headings, subheadings, quotes, bulleted & numbered lists, and to-dos
- Keyboard-first editing (Enter to create, Backspace to delete empty blocks, Arrow navigation)
- Local persistence using Zustand + `localStorage`
- Responsive layout with mobile-friendly page picker

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to use the app.

## Available Scripts

- `npm run dev` – start the development server
- `npm run build` – create a production build
- `npm start` – serve the production build
- `npm run lint` – run ESLint with Next.js rules

## Deployment

The project is optimized for deployment on Vercel:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-0865d251
```

## Tech Stack

- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Zustand for state management

## License

MIT
