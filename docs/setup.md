# 📦 Project Setup Guide

This document explains all installations and environment setup needed to run the project.  
Files are already included in the repository — this guide only covers system requirements and environment configuration.

---

# 1. System Requirements

### ✔ Git  
Download: https://git-scm.com/downloads

### ✔ Node.js (LTS)  
Download: https://nodejs.org/en

---

# 2. Install Scoop (Windows Only)

Scoop makes installing the Supabase CLI easier.

Open **PowerShell** and run:

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
scoop install supabase
```
# 3. After cloning the project:

i. open command prompt
ii. cd to the path of the project folder
iii. run npm install inside the project folder

# 4. Add Environment Variables:

make a .env file and paste this:
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# 5. Run the Development Server:

i. cd to the path of the project folder
ii. enter: "npm run dev" to deploy the local server
