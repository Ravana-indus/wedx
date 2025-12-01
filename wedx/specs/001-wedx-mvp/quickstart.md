# Wedx MVP Quickstart

## Prerequisites
- Node.js 18+
- npm or pnpm
- Supabase Account (or local instance)
- OpenAI API Key

## Setup

1. **Clone & Install**
   ```bash
   git clone <repo>
   cd wedx
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env.local` and fill in:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   OPENAI_API_KEY=sk-...
   ```

3. **Database Migration**
   Apply the schema to Supabase:
   ```bash
   npx supabase db push
   ```
   (Or copy schema from `data-model.md` to Supabase SQL Editor)

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

## Key Commands
- `npm run dev`: Start dev server
- `npm run build`: Build for production
- `npm run test`: Run tests (Vitest)
- `npm run lint`: Lint code
