# react-inspiration-calendar

A minimalist daily inspiration calendar built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- Date picker for browsing any day
- AI-generated daily inspiration content
- Lunar calendar information
- Minimal SVG calendar presentation
- Responsive layout for desktop and mobile

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Google Gemini API

## Getting Started

### Requirements

- Node.js 18+
- pnpm or npm

### Install

```bash
pnpm install
```

Copy `.env.example` to `.env.local` and set your Gemini API key:

```env
GEMINI_API_KEY=your_api_key_here
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Preview

```bash
pnpm preview
```

## Project Structure

```text
react-inspiration-calendar/
├─ src/
│  ├─ components/
│  ├─ services/
│  ├─ utils/
│  ├─ App.tsx
│  ├─ index.css
│  ├─ index.tsx
│  └─ types.ts
├─ index.html
├─ package.json
├─ postcss.config.js
├─ tailwind.config.js
├─ tsconfig.json
└─ vite.config.ts
```

## License

MIT
