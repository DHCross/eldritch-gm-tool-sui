# Eldritch RPG GM Tools (Next.js Edition)

A modernized web application for running Eldritch RPG campaigns. The suite provides encounter building utilities, reference material, and campaign management helpers inside a Next.js app that can be deployed directly to Vercel.

## ✨ Features

- **Landing Hub** – Jump to any tool in the suite from an accessible overview page.
- **Encounter Generator** – Build randomized encounters that respect party size, defense level, and threat preferences.
- **GM Suite Navigation** – Quick links to character, NPC, monster, roster, and documentation pages.
- **Static References** – Browse the Eldritch rules compendium and supporting documents bundled with the project.

> The original HTML utilities and reference spreadsheets are still shipped alongside the app inside the repository. They can be opened directly if you prefer the legacy experience.

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher (matching the Vercel runtime used by Next.js 15)
- npm 9+

### Installation

```bash
npm install
```

### Local Development

```bash
npm run dev
```

The app boots on [http://localhost:3000](http://localhost:3000). Any edits inside `src/` will hot reload automatically.

### Building for Production

```bash
npm run build
npm start
```

`next build` compiles the application and outputs an optimized production build that can be served with `next start` or deployed to a platform such as Vercel.

## ☁️ Deploying on Vercel

1. Push your fork to GitHub (or another Git provider).
2. Import the repository in the [Vercel dashboard](https://vercel.com/new) and select the `work` branch.
3. Leave the defaults (Framework Preset: **Next.js**). Vercel will detect the `build` and `start` scripts automatically.
4. Trigger the first deployment – subsequent pushes to the same branch redeploy automatically.

Vercel handles environment creation, HTTPS, and CDN caching out of the box. No Spark integration or custom build steps are required.

## 🧱 Project Structure

```
├── public/                     # Static assets (favicons, Open Graph images, etc.)
├── src/
│   ├── app/                    # Next.js App Router routes
│   │   ├── page.tsx            # Landing page
│   │   ├── gm-tools/           # GM tools overview
│   │   ├── encounter-generator/# Interactive encounter builder
│   │   ├── ...                 # Additional tool routes (NPCs, monsters, docs)
│   ├── css/                    # Legacy stylesheets for the classic HTML pages
│   └── js/                     # Legacy vanilla JS utilities
├── Resources/                  # Eldritch RPG rulebooks, spreadsheets, references
├── package.json                # Scripts and dependencies
├── next.config.ts              # Next.js configuration
└── README.md                   # This guide
```

## 🧪 Scripts

- `npm run dev` – Start the development server with Turbopack.
- `npm run build` – Generate an optimized production build.
- `npm start` – Run the compiled production server locally.
- `npm run lint` – Lint the TypeScript and React sources.

## 💾 Data Persistence

The modernized encounter generator stores imported party defense information in `localStorage`. Future roster and generator pages will follow the same pattern to keep your data on-device without any backend dependencies.

## 📚 Legacy Tools

The repository still contains self-contained HTML tools (`*.html`) and JavaScript modules under `src/js/`. They remain untouched for archival purposes and can be opened directly in a browser or hosted as static files.

## 🛡️ License

Released under the MIT License. See [LICENSE](LICENSE) for details.

---

Built for Game Masters running Eldritch RPG campaigns. Happy gaming! 🎲
