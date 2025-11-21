# Team Git Workflow (Proper Steps)

A clear and correct workflow for teams working together on the **dev** branch.

---

## **Team Workflow Overview**
Everyone works on **dev**. Before anyone commits or pushes, they must pull the latest changes.

---

## **Person A Workflow**
1. Make changes locally.
2. Stage files:
   ```bash
   git add .
   ```
3. Commit:
   ```bash
   git commit -m "Your message here"
   ```
4. Push to dev:
   ```bash
   git push origin dev
   ```

---

## **Person B Workflow** (VERY IMPORTANT)
Before touching anything, Person B must update their local dev branch.

### **1. Switch to dev branch**
```bash
git checkout dev
```

### **2. Pull the newest changes**
```bash
git pull origin dev
```

If there are **merge conflicts**, resolve them.

### **3. After dev is fully updated, start working on changes**
- Make edits
- Stage and commit:
  ```bash
  git add .
  git commit -m "Your message"
  ```

### **4. Push changes**
```bash
git push origin dev
```

---

## **General Rules for Everyone**

### **Rule 1 — Always Pull Before Working**
Before coding anything:
```bash
git pull origin dev
```

### **Rule 2 — Always Pull Before Committing**
This ensures your commit is built on the latest version.
```bash
git pull --rebase origin dev
```

### **Why?**
- Prevents conflicts
- Prevents overwriting teammates' work
- Keeps the dev branch clean and updated


### **Rule 3 — Always write to changelog.md after making changes**
The changelog should include:
   - Why the change was made (Optional, if the change was obviously needed, this can be exempted)
   - Date of change
   - Who provided the change
   - What changed
   - Which file was affected

You can find the examples in `docs/changelog.md`

---

## Summary
- Person A pushes → Person B pulls BEFORE doing anything
- Everyone pulls BEFORE coding
- Everyone pulls WITH REBASE before committing
- Everyone must write their changes in changelog.md

This workflow ensures the entire team stays synced and avoids painful merge conflicts.

