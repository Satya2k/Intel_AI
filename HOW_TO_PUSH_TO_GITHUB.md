# How to Push the AI_GIt Folder to GitHub

This document explains step-by-step how to manually push all the files in this folder to your GitHub repository.

---

## METHOD 1: Git Command Line (Recommended & Fastest)

Open your **Terminal** app on your Mac and run the following commands:

### Step 1: Create a New Empty Repository on GitHub
1. Open your browser and go to: **[https://github.com/new](https://github.com/new)**
2. In **Repository name**, enter: `intellidesk-ai` (or any name you want).
3. Set visibility to **Public** or **Private**.
4. **CRITICAL**: Do **NOT** check "Add a README file", do **NOT** check "Add .gitignore", and do **NOT** choose a license. (These files are already included in this folder).
5. Click the green **"Create repository"** button.
6. Copy your repository URL from the page. It will look like:
   `https://github.com/<YOUR_USERNAME>/intellidesk-ai.git`

---

### Step 2: Push from Terminal

Copy and paste these commands into your terminal:

```bash
# 1. Navigate into the AI_GIt folder
cd /Users/satyasmac/AntiGravity/AI_GIt

# 2. Set the branch name to main
git branch -M main

# 3. Connect to your GitHub repository (replace with your actual GitHub URL)
git remote add origin https://github.com/<YOUR_USERNAME>/intellidesk-ai.git
# (Note: If 'origin' already exists, run: git remote set-url origin https://github.com/<YOUR_USERNAME>/intellidesk-ai.git)

# 4. Push all files to GitHub
git push -u origin main
```

When prompted:
- **Username**: Enter your GitHub username.
- **Password**: Enter your **GitHub Personal Access Token (PAT)** (not your normal account password, because GitHub requires a token for terminal access).
  - *If you don't have a token, go to GitHub -> Settings -> Developer Settings -> Personal Access Tokens (Classic) -> Generate new token -> Check `repo` -> Copy token.*

---

## METHOD 2: Using the 1-Click Interactive Push Script

We have included a convenient script inside this folder:

```bash
cd /Users/satyasmac/AntiGravity/AI_GIt
chmod +x push_to_github.sh
./push_to_github.sh
```

The script will prompt you for your GitHub repository URL and automatically execute the commands for you!

---

## METHOD 3: Using GitHub Desktop App

If you prefer a graphical interface:

1. Open **GitHub Desktop** on your Mac.
2. Click **File** in the top menu bar -> **Add Local Repository...** (or press `Cmd + O`).
3. Click **Choose...** and select this folder:
   `/Users/satyasmac/AntiGravity/AI_GIt`
4. Click **Add Repository**.
5. Click **Publish repository** in the top right.
6. Choose whether you want it to be private or public, then click **Publish Repository**.
7. Done! All files are now on GitHub.

---

## METHOD 4: Drag & Drop via Web Browser (No Git Required)

If you do not want to use Git or Terminal:

1. Create a repository on [github.com/new](https://github.com/new) and check **"Add a README file"**.
2. On your newly created repository page, click **"Add file"** -> **"Upload files"**.
3. Open **Finder** on your Mac and navigate to:
   `/Users/satyasmac/AntiGravity/AI_GIt`
4. Select all files and folders inside `AI_GIt` (press `Cmd + A`).
5. Drag and drop them directly onto the GitHub upload area in your browser.
6. Scroll down to the bottom, enter a commit message like `Initial upload`, and click **Commit changes**.

---

## Troubleshooting Common Errors

### Error: `remote origin already exists`
Run:
```bash
git remote set-url origin https://github.com/<YOUR_USERNAME>/intellidesk-ai.git
```

### Error: `Support for password authentication was removed`
Use a GitHub Personal Access Token instead of your password:
1. Go to GitHub -> Settings -> Developer Settings -> Personal Access Tokens -> Tokens (classic).
2. Click "Generate new token", give it a name, select expiration, and check the `repo` scope.
3. Copy the token and paste it when prompted for Password.

### Error: `Updates were rejected because the remote contains work that you do not have locally`
If you created the GitHub repo with a README or license, force push this clean codebase:
```bash
git push -u origin main --force
```

---

## Next Step: Deploy to Vercel

Once pushed to GitHub:
1. Go to **[https://vercel.com/new](https://vercel.com/new)**.
2. Sign in with GitHub and select your `intellidesk-ai` repository.
3. In **Environment Variables**, add:
   - `DEMO_MODE` = `true`
   - `NEXT_PUBLIC_DEMO_MODE` = `true`
4. Click **Deploy**. Your site will be live online with automatic HTTPS in ~45 seconds!
