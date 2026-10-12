# Resume Match

A dashboard app for sourcing, scoring, and ranking candidate resumes against job descriptions. Search TechFetch.com for candidates or upload your own resume files (PDF/Word), then get instant keyword-based match scores.

## Prerequisites

- **Node.js 18+** and npm
- A Supabase project (database + auth + edge functions are already configured in `.env`)

## Running locally

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

The app runs at `http://localhost:5173`.

## Running on a server

```bash
# 1. Install dependencies
npm install

# 2. Build the production bundle
npm run build

# 3. Preview the production build locally
npm run preview
```

The `dist/` folder contains the static production build. Serve it with any static host:

- **Nginx / Apache**: Point the web root to `dist/`
- **Vercel / Netlify**: Connect your GitHub repo, set the build command to `npm run build` and the output directory to `dist`
- **Docker**:

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Then:

```bash
docker build -t resume-match .
docker run -p 8080:80 resume-match
```

## Environment variables

The `.env` file contains:

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon public key |

If deploying to a new Supabase project, update these values. The edge function (`techfetch-search`) must also be deployed to that project.

## Deploying the edge function

The TechFetch search proxy is in `supabase/functions/techfetch-search/`. If you set up a new Supabase project, deploy it using the Supabase MCP tools or CLI:

```bash
supabase functions deploy techfetch-search
```

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |

## How it works

1. **Sign in / sign up** — Email + password auth via Supabase
2. **Add a job description** — Paste text or upload a PDF/Word file
3. **Get candidates** — Either search TechFetch.com with your credentials, or upload resume files directly (PDF or .docx, parsed in-browser)
4. **Score & rank** — The app compares each resume against the JD using keyword matching across 150+ skills, weighted by category, and displays ranked results with match scores and explanations

## Tech stack

- React 18 + TypeScript + Vite
- Tailwind CSS + Lucide icons
- Supabase (auth, database, edge functions)
- pdfjs-dist + mammoth for in-browser file parsing
