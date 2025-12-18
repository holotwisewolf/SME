# SME Project Dependencies

A beginner-friendly guide to set up the project.

---

## Step 1: Install Node.js

Before anything, you need Node.js installed on your computer.

1. Go to: https://nodejs.org/en
2. Download the **LTS** version (recommended)
3. Run the installer and follow the prompts
4. Verify installation by opening **Command Prompt** or **PowerShell** and typing:
   ```bash
   node --version
   npm --version
   ```
   If you see version numbers, you're good!

---

## Step 2: Clone the Project

```bash
git clone https://github.com/holotwisewolf/SME.git
```

---

## Step 3: Install All Dependencies

Open **Command Prompt** or **PowerShell**, navigate to the project folder, and run:

```bash
cd path\to\SME_Spotify_Music_Explorer
npm install
```

This automatically installs everything (React, Framer Motion, DnD Kit, etc.).

---

## Step 4: Set Up Environment Variables

Create a `.env` file in the project root and add:

```
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Step 5: Run the Project

```bash
npm run dev
```

Open the URL shown in terminal (usually http://localhost:5173).

---

## Individual Package Installs (Optional)

Only needed if a package is missing:

```bash
npm install framer-motion
npm install lucide-react
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install date-fns
npm install @supabase/supabase-js
```
