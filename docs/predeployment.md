# 🚀 Before Deployment Checklist

This is a crucial checklist to run **before you share your project link publicly**.  
These steps will save you from **security vulnerabilities**, **database bloat**, and **bot abuse**.

---

## 1. Prune Old Anonymous Users

### **Why**
Anonymous "Guest" users who haven't visited in a long time clutter your database and inflate your MAU count. You should clean them out periodically.

### **How**
You can run this manually in your Supabase SQL Editor.  
For production: set up a scheduled cron job (Supabase Edge Functions + pg_cron).

### **SQL Query**
```sql
-- Deletes anonymous guest users older than 30 days
delete from auth.users
where
  is_anonymous = true
  and created_at < now() - interval '30 days';

-- OPTIONAL: Clean up "ghost" data
-- Ensure your foreign keys have "on delete cascade"
-- OR manually clean related data with custom scripts.
```

---

## 2. Implement Cloudflare Turnstile (Captcha)

### **Why**
This is THE most important step to prevent bot abuse.  
Without it, someone can create **10,000 Guest or Email users** in minutes, exceeding the Supabase Free Tier MAU limits.

### **How**

#### **1. Get Keys**
Cloudflare Dashboard → Turnstile → **Add Site**  
Cloudfare Turnstile URL: https://dash.cloudflare.com/ebc78c8c7872ecf697df0269576a2630/turnstile/add
Copy your:  
- **Site Key**  
- **Secret Key**

#### **2. Configure Supabase**
Supabase Dashboard → Authentication → Security → **Bot Protection**

- Enable **Bot Protection**
- Select **Cloudflare Turnstile**
- Paste in your **Secret Key**

#### **3. Update Your React Code**

Install Turnstile:
```bash
npm install @marsidev/react-turnstile
```

Add component in your login / signup:
```tsx
const [token, setToken] = useState<string>();

const handleGuestLogin = async () => {
  await supabase.auth.signInAnonymously({
    options: {
      captchaToken: token, // Pass the captcha token
    },
  });
};

return (
  <>
    <Turnstile siteKey="YOUR_TURNSTILE_SITE_KEY" onSuccess={setToken} />
    <button onClick={handleGuestLogin} disabled={!token}>
      Continue as Guest
    </button>
  </>
);
```

---

## 3. Final RLS Policy Audit

### **Why**
A single misconfigured RLS policy can expose private user data.  
This is your **final security inspection** after implementing all Guest, User, and Dev logic.

### **How**

#### **Run the Policy Lister**
```sql
select
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
order by tablename, cmd;
```

---

## 🔍 Review Checklist (“The Worry Check”)

### **Profiles / Users**
- Do `INSERT` or `UPDATE` policies **block anonymous users**?
- Should include:
  ```sql
  (auth.jwt() ->> 'is_anonymous')::boolean is false
  ```

### **Views**
- Are views set to `security_invoker = true`?
- If not:  
  - Are they correctly marked as **Unrestricted** in the Supabase Dashboard?  
  - Do they leak private info? (e.g., private playlist counts)

### **Role: {public}**
- Verify every `{public}` policy.
- Ensure they are:
  - **SELECT-only**
  - **Safe for unauthenticated access**

### **`qual: true`**
- Means "everyone can see everything."
- Ask: is this intentional?

Examples:
| Table | `qual: true` OK? | Notes |
|-------|------------------|-------|
| tags | ✅ Yes | Public metadata |
| profiles | ⚠️ Sometimes | Usually OK if minimal info |
| playlists | ❌ No | Should be user-protected |

---

## ✔️ All steps complete?
You're ready for deployment! 🎉
