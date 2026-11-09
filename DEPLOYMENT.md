# Deployment Guide: IntelliDesk AI
## Comprehensive Instructions for Pushing to GitHub & Deploying to Vercel

This guide provides end-to-end instructions for deploying the **IntelliDesk AI** enterprise service desk and identity access provisioning platform online to **Vercel** with continuous deployment from **GitHub**.

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Step 1: Local Verification](#step-1-local-verification)
4. [Step 2: Commit and Push to GitHub](#step-2-commit-and-push-to-github)
5. [Step 3: Deploy to Vercel (Web UI Method)](#step-3-deploy-to-vercel-web-ui-method)
6. [Alternative: Deploy via Vercel CLI](#alternative-deploy-via-vercel-cli)
7. [Step 4: Environment Variables Setup](#step-4-environment-variables-setup)
8. [Step 5: Post-Deployment Smoke Test](#step-5-post-deployment-smoke-test)
9. [Dataset Files and CSV Operations](#dataset-files-and-csv-operations)
10. [Troubleshooting Guide](#troubleshooting-guide)

---

## 1. Architecture Overview

- **Framework**: Next.js 15 (App Router, Server Actions, Dynamic API Endpoints)
- **Language**: TypeScript with Zod validation
- **Styling**: Tailwind CSS & Lucide Icons
- **Visual Analytics**: Recharts responsive charts
- **Agent Orchestration**: Multi-Agent Supervisor-Worker pattern (Gemini API + LangGraph / Policy Engine)
- **Persistence**: Dual-mode database architecture (Hybrid Supabase PostgreSQL + Academic Self-Contained In-Memory / File Engine with `DEMO_MODE=true`)
- **Hosting**: Vercel Serverless Edge Network

---

## 2. Prerequisites

Before beginning the deployment process, ensure you have:
1. **GitHub Account**: [Sign up here](https://github.com) if you do not have one.
2. **Vercel Account**: [Sign up with GitHub](https://vercel.com/signup) (recommended for seamless zero-config builds).
3. **Git installed locally**: Verify with `git --version`.
4. **Node.js 18+ or 20+**: Verify with `node -v`.

---

## Step 1: Local Verification

Before pushing your changes, confirm that the project builds cleanly and all 20 automated tests pass.

```bash
# Navigate to the project root
cd intellidesk-ai

# 1. Install dependencies
npm install

# 2. Run the 20-test verification suite
npm test

# 3. Create a production build to check for type errors
npm run build
```

Expected output:
```
✓ Compiled successfully
✓ Generating static pages (22/22)
✓ Finalizing page optimization
```

---

## Step 2: Commit and Push to GitHub

### Option A: Create a New GitHub Repository

1. Go to [GitHub - New Repository](https://github.com/new).
2. Set the repository name (e.g., `intellidesk-ai`).
3. Set the visibility to **Public** or **Private**.
4. **Do NOT** initialize with a README, `.gitignore`, or license (the repository already contains these).
5. Click **Create repository**.

### Option B: Push Existing Local Code

In your terminal from `intellidesk-ai`:

```bash
# 1. Check current git status
git status

# 2. Stage all files (including datasets, CSV APIs, and reports)
git add .

# 3. Commit with a meaningful message
git commit -m "feat: complete IntelliDesk AI platform with CSV analytics and datasets"

# 4. Set default branch to main
git branch -M main

# 5. Link to your GitHub remote repository (replace with your actual GitHub URL)
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/intellidesk-ai.git
# (If 'origin' already exists, use: git remote set-url origin https://github.com/<YOUR_GITHUB_USERNAME>/intellidesk-ai.git)

# 6. Push code to GitHub
git push -u origin main
```

---

## Step 3: Deploy to Vercel (Web UI Method)

The Vercel Web Dashboard provides the easiest, most reliable deployment with automatic preview branches and SSL certificates.

1. **Log in to Vercel**: Navigate to [vercel.com](https://vercel.com).
2. **Add New Project**:
   - Click the **"Add New..."** button in the top right.
   - Select **"Project"**.
3. **Import Git Repository**:
   - Find your `intellidesk-ai` repository under "Import Git Repository".
   - Click **"Import"**.
4. **Configure Project Settings**:
   - **Project Name**: `intellidesk-ai` (or your preferred name).
   - **Framework Preset**: `Next.js` (detected automatically).
   - **Root Directory**: `./` (leave default, or set to `intellidesk-ai` if your repo root is the parent folder).
   - **Build Command**: `next build` (default).
   - **Output Directory**: `.next` (default).
   - **Install Command**: `npm install` (default).

5. **Configure Environment Variables** (Critical Step):
   Expand the **Environment Variables** section and add the following keys:

   | Key | Value | Description |
   |-----|-------|-------------|
   | `DEMO_MODE` | `true` | Enables deterministic academic simulation engine |
   | `NEXT_PUBLIC_DEMO_MODE` | `true` | Informs frontend portals of active simulation state |
   | `AI_MODEL_ID` | `gemini-1.5-flash` | Language model identifier |
   | `GOOGLE_GENERATIVE_AI_API_KEY` | *(Your Gemini API Key)* | Optional if `DEMO_MODE=true` (used for live LLM chat) |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Optional fallback for cloud Supabase |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `your-anon-key` | Optional fallback for cloud Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | `your-service-role-key` | Optional server-side service role |

6. **Deploy**:
   - Click **"Deploy"**.
   - Vercel will clone the repository, build the Next.js application, generate serverless edge handlers, and assign an active domain (e.g., `https://intellidesk-ai.vercel.app`).

---

## Alternative: Deploy via Vercel CLI

If you prefer deploying directly from the command line:

```bash
# 1. Install Vercel CLI globally
npm i -g vercel

# 2. Login to your Vercel account
vercel login

# 3. Deploy to preview
vercel

# Follow the interactive prompts:
# ? Set up and deploy “~/AntiGravity/intellidesk-ai”? [Y/n] y
# ? Which scope do you want to deploy to? (Select your account)
# ? Link to existing project? [y/N] n
# ? What’s your project’s name? intellidesk-ai
# ? In which directory is your code located? ./

# 4. Set Environment Variables
vercel env add DEMO_MODE production
# Enter value: true
vercel env add NEXT_PUBLIC_DEMO_MODE production
# Enter value: true

# 5. Deploy directly to Production
vercel --prod
```

---

## Step 4: Environment Variables Setup

For academic presentations, viva examinations, and live demos, set `DEMO_MODE=true`. This guarantees:
- **Instant Reliability**: Zero dependence on external cloud connectivity, rate limits, or network timeouts.
- **Full Feature Completeness**: All 5 portals (Employee, IT Service Desk, IAM, Manager Approvals, Analytics) remain 100% operational with working buttons, forms, and simulated provisioning.
- **Audit Logging**: Every single user action is recorded into the in-memory/file audit ledger.

If you wish to attach a live Google Gemini API key:
1. Obtain an API key from [Google AI Studio](https://aistudio.google.com/).
2. Add `GOOGLE_GENERATIVE_AI_API_KEY` to your Vercel Environment Variables.
3. Redeploy the application via **Deployments > Redeploy** in Vercel.

---

## Step 5: Post-Deployment Smoke Test

Once deployed, visit your live Vercel URL and test the following routes:

1. **Root / Navigation**:
   - `https://<your-project>.vercel.app/`
   - Check that navigation links to all five portals work.

2. **Employee IT Support Portal**:
   - `https://<your-project>.vercel.app/employee`
   - Submit a test ticket or ask a troubleshooting question.

3. **IT Service Desk Console**:
   - `https://<your-project>.vercel.app/service-desk`
   - Verify tickets appear, filter by category/priority, and change ticket status.

4. **Identity & Access Management (IAM)**:
   - `https://<your-project>.vercel.app/iam`
   - Request access to an application (e.g., SAP S/4HANA Finance) and observe policy validation.

5. **Manager Approvals Portal**:
   - `https://<your-project>.vercel.app/approvals`
   - Approve or reject pending requests and trigger simulated provisioning.

6. **Analytics Dashboard with CSV Features**:
   - `https://<your-project>.vercel.app/analytics`
   - Click **Download CSV** -> Download "Incident Tickets CSV" or "Analytics Summary CSV".
   - Click **Upload CSV** -> Upload `sample_tickets_upload_template.csv` and observe real-time chart updates.

7. **Audit Ledger**:
   - `https://<your-project>.vercel.app/audit`
   - Verify all actions have immutable cryptographic hashes and timestamps.

---

## Dataset Files and CSV Operations

The repository includes curated synthetic datasets ready for academic analysis and viva demonstration:

| File Location | Description | Rows / Records |
|---------------|-------------|----------------|
| `datasets/it_tickets_dataset.csv` | Full IT service desk ticket records with priority, category, SLA status | 150 rows |
| `datasets/employees_dataset.csv` | Synthetic organizational directory with roles, departments, managers | 50 rows |
| `datasets/access_requests_dataset.csv` | Historical IAM access requests with approval states and risk levels | 60 rows |
| `datasets/sop_knowledge_base.csv` | Curated SOP troubleshooting documents for RAG retrieval | 20 documents |
| `datasets/sample_tickets_upload_template.csv` | Ready-to-use template for testing the Dashboard CSV Upload modal | 10 rows |

### Accessing Datasets in Production
The datasets are also deployed in the public web folder, accessible directly via your live URL:
- `https://<your-project>.vercel.app/datasets/it_tickets_dataset.csv`
- `https://<your-project>.vercel.app/datasets/sample_tickets_upload_template.csv`

---

## Troubleshooting Guide

### 1. Build Failure: `Property totalTickets does not exist on type Promise`
- **Cause**: An asynchronous method call without `await`.
- **Solution**: Already resolved in `lib/database/db-client.ts` and `app/api/analytics/csv/route.ts` with typed promises.

### 2. 404 on API Routes or Images
- **Cause**: Root directory misconfiguration on Vercel.
- **Solution**: In Vercel Project Settings > General, ensure **Root Directory** is set to where `package.json` resides (`./` or `intellidesk-ai`).

### 3. CSV Upload Returns 400 "CSV content is empty"
- **Cause**: Uploading an empty file or missing header row.
- **Solution**: Use `datasets/sample_tickets_upload_template.csv` which has standard headers (`ticket_id,title,category,priority,status,employee_id,assigned_team`).

### 4. Supabase Connection Refused in Production
- **Cause**: Missing or invalid cloud database credentials.
- **Solution**: Keep `DEMO_MODE=true` in Vercel Environment Variables to use the zero-latency in-memory state engine.
