# AI Resume Checker

An AI-powered web application that **reads a resume (PDF or DOCX), scores it out of 100, and compares it with a job description**. It tells you which skills you have, which skills and keywords the job wants that your resume is missing, and exactly what to improve. An **OpenAI** model adds a recruiter-style review on top: a summary, concrete fixes, rewritten bullet points and a job fit judged by meaning rather than exact words. Users sign in with email and password, and each user sees only their own history. Everything can be downloaded as a PDF report.

> B.Tech CSE Minor Project · React + Node.js/Express + MongoDB · NLP with TF-IDF and cosine similarity · OpenAI review · email/password login

---

## Table of contents

1. [What does it do?](#1-what-does-it-do)
2. [Quick start (5 minutes)](#2-quick-start-5-minutes)
3. [Step-by-step setup for a new laptop](#3-step-by-step-setup-for-a-new-laptop)
4. [Two ways to run it](#4-two-ways-to-run-it)
5. [How to test it](#5-how-to-test-it)
6. [Using MongoDB (optional)](#6-using-mongodb-optional)
7. [Deploying it online](#7-deploying-it-online)
8. [Troubleshooting](#8-troubleshooting)
9. [How it works inside](#9-how-it-works-inside)
10. [Algorithms explained](#10-algorithms-explained)
11. [API reference](#11-api-reference)
12. [Project structure](#12-project-structure)
13. [Project report material](#13-project-report-material-abstract-objectives-limitations-future-scope)

---

## 1. What does it do?

You upload your resume and, optionally, paste a job description. Within about a second you get a dashboard with:

| Feature | What you see |
|---|---|
| **Resume score (0–100)** | One overall score built from 9 clear rules, plus a chart showing points earned per rule and why |
| **Job match %** | How closely your resume matches the job description, computed with TF-IDF + cosine similarity |
| **Candidate details** | Name, email, phone, LinkedIn, GitHub, degree, CGPA, picked out automatically. Anything not found shows "Not found"; nothing is ever invented. |
| **Skills** | Technical skills grouped by category (languages, frameworks, databases, cloud, tools, AI/ML, CS fundamentals) plus soft skills, with a radar chart |
| **Gap analysis** | Skills and keywords the job asks for that are *missing* from your resume, plus the ones you match |
| **AI review (OpenAI)** | A short summary, specific improvements per section, weak bullet points rewritten, and (with a job description) a meaning-based job-fit score with the requirements met and missing. Needs an OpenAI API key. |
| **Feedback** | Strengths, weaknesses, missing sections and specific recommendations |
| **Education / Experience / Projects / Certifications** | Extracted and listed from the resume |
| **PDF report** | One click downloads a formatted report of the whole analysis |
| **History** | Every analysis is saved to your account. You can reopen, download or delete it, and see a score trend chart. |
| **Accounts** | Sign up / log in with email and password. Analyze, Results and History need a login; each user only sees their own analyses. |

**Pages:** Home · Log in / Sign up · Analyze (upload) · Results dashboard · History · About · Help (with a live "is the server running?" check).

> **Two layers.** The rule-based analysis (score, skills, TF-IDF job match) runs entirely on your machine and needs no internet or API key. The **AI review** is extra: it only runs when `OPENAI_API_KEY` is set in `backend/.env`, and it sends the resume text (and job description) to OpenAI. Without a key the app works normally and the dashboard says the AI review is off.

---

## 2. Quick start (5 minutes)

You only need **Node.js 20 or newer** installed (see [section 3](#3-step-by-step-setup-for-a-new-laptop) if you don't have it).

Unzip the project, open a terminal **inside the `ai-resume-checker` folder**, and run:

```bash
npm run setup     # installs everything (first time only, ~1 minute)
npm run build     # builds the website (first time, and after any frontend change)
npm start         # starts the app
```

Then open **http://localhost:5000** in your browser, click **Log in → Sign up**, and create an account with any email and a password of 8+ characters. Accounts are stored locally, so the email doesn't have to be real.

To turn on the AI review, put your OpenAI key in `backend/.env` (see [3.4](#34-configuration-file)) and restart.

To try it immediately, use the sample files in the `samples/` folder:
- `samples/sample_resume.pdf` or `samples/sample_resume.docx` as the resume
- On the Analyze page, click **"Use sample JD"** to fill in a job description

Stop the app with `Ctrl + C` in the terminal.

---

## 3. Step-by-step setup for a new laptop

### 3.1 Install Node.js (one time)

Check whether it's already installed:

```bash
node -v    # should print v20.x or higher (v22, v24 are fine)
npm -v
```

If not installed, or older than v20:

| OS | How to install |
|---|---|
| **Windows** | Download the **LTS** installer from https://nodejs.org and run it (keep the default options). Close and reopen the terminal afterwards. |
| **macOS** | Download the LTS installer from https://nodejs.org, **or** run `brew install node` if you use Homebrew. |
| **Linux (Ubuntu/Debian)** | `curl -fsSL https://deb.nodesource.com/setup_22.x \| sudo -E bash - && sudo apt install -y nodejs` |

> On Windows, use **PowerShell** or **Command Prompt**. All the `npm` commands below are the same on every OS.

### 3.2 Get the project

Unzip `ai-resume-checker.zip` anywhere (for example, your Desktop), then open a terminal in that folder:

- **Windows:** open the folder in File Explorer, click the address bar, type `cmd` and press Enter.
- **macOS / Linux:** `cd ~/Desktop/ai-resume-checker` (adjust the path).

You should see `backend`, `frontend`, `samples`, `docs` and `README.md` when you list the folder (`dir` on Windows, `ls` on mac/Linux).

### 3.3 Install dependencies

```bash
npm run setup
```

This runs `npm install` inside both `backend/` and `frontend/`. It downloads about 400 MB of packages into the `node_modules` folders, so it needs internet **this one time**.

### 3.4 Configuration file

The app runs **without any configuration**, but you'll want a config file for the OpenAI key and a fixed login secret. Copy the example:

```bash
# macOS / Linux
cp backend/.env.example backend/.env

# Windows (Command Prompt)
copy backend\.env.example backend\.env
```

Then edit `backend/.env`:

| Variable | Default | What it does |
|---|---|---|
| `PORT` | `5000` | Port the server runs on |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Frontend address allowed to call the API (only matters in development mode or when frontend and backend are hosted separately) |
| `MONGODB_URI` | *(empty)* | MongoDB connection string. Empty means results are saved to a local file instead (see [section 6](#6-using-mongodb-optional)). |
| `MAX_FILE_SIZE_MB` | `5` | Maximum resume upload size |
| `JWT_SECRET` | *(empty)* | Secret that signs login tokens. Set any long random string (the `.env.example` shows a command that makes one). If empty, a random secret is used and **everyone is logged out whenever the server restarts**. |
| `OPENAI_API_KEY` | *(empty)* | Your OpenAI API key from https://platform.openai.com/api-keys. Empty means the AI review is off; everything else still works. |
| `OPENAI_MODEL` | `gpt-6-luna` | OpenAI model used for the review. `gpt-6-luna` is the low-cost option; `gpt-6.2-sol` gives better reviews for more money. |

Restart the server after changing `.env`.

### 3.5 Build and start

```bash
npm run build
npm start
```

You should see:

```
[storage] Using local JSON file: .../backend/data/analyses.json
[server] API running on http://localhost:5000/api
[server] Open the app at http://localhost:5000
```

Open **http://localhost:5000**.

---

## 4. Two ways to run it

### Option A — Single server (easiest; for demos and testing)

```bash
npm run build    # only needed again if you change frontend code
npm start
```

→ Everything (website + API) runs at **http://localhost:5000**.

### Option B — Development mode (for editing the code)

One command starts both, from inside the `ai-resume-checker` folder:

```bash
npm run dev
```

This runs the backend API on port 5000 (restarts when backend files change) and the frontend on port 5173 (updates the browser instantly). **Ctrl+C** stops both.

> Prefer separate terminals? `npm run dev:backend` and `npm run dev:frontend` still work.

→ Open **http://localhost:5173**. The frontend forwards all `/api` calls to the backend on port 5000.

> In development mode, open port **5173**, not 5000. If you visit 5000 before running `npm run build`, you'll only get the API.

---

## 5. How to test it

### 5.1 Automated tests

```bash
npm test
```

Expected output ends with:

```
ℹ pass 13
ℹ fail 0
```

These tests check:
- the cosine similarity maths;
- the tokenizer and stemmer;
- that skill matching avoids false positives ("C" is not found inside "C++", "go home" is not the Go language);
- phone number formats;
- full analysis of the sample PDF and DOCX;
- that missing information comes back empty instead of being invented;
- password hashing and login tokens (a tampered or forged token is rejected);
- the OpenAI call, against a fake local OpenAI server, so no key or money is needed: request format, parsing, and that API errors become a readable message instead of a crash.

### 5.2 Manual test checklist (in the browser)

With the app running at http://localhost:5000:

| # | Do this | You should see |
|---|---|---|
| 1 | Open **Help** | "Backend online", "Storage: Local JSON file", and the AI review status (model name, or "off") |
| 1b | Click **Analyze** while logged out | You are sent to **Log in**. Click **Sign up**, create an account, and you land on Analyze. |
| 2 | **Analyze** → drag `samples/sample_resume.pdf` onto the upload box → click **Use sample JD** → **Analyze Resume** | A progress bar, then the dashboard: resume score ~91%, job match ~50%, name **Aarav Mehta**, 28 technical skills |
| 3 | On the dashboard, open **"How is the score calculated?"** | 9 criteria with points earned out of maximum |
| 4 | Look at **Job description match** | Missing skills: TypeScript, CI/CD, Unit Testing, Communication |
| 5 | Click **Download PDF report** | A PDF named `Resume_Report_Aarav_Mehta.pdf` downloads |
| 6 | **Analyze another** → upload `samples/sample_resume.docx` **without** a job description | A dashboard with "Add a JD to compare" instead of a job match |
| 7 | Upload `samples/invalid.txt` | Error: "Only PDF and DOCX files are allowed." |
| 8 | Upload `samples/fake.pdf` | Error: "File is not a valid PDF." |
| 9 | Open **History** | Both analyses listed, with a trend chart. View, download and delete all work. |
| 9b | With an OpenAI key set, look at the **AI review** card on a dashboard | Summary, improvements, rewritten bullets and (with a JD) an AI job-fit ring. Without a key: "AI review is off". |
| 9c | **Log out**, sign up as a second user, open **History** | Empty: users can't see each other's analyses |
| 10 | Upload your **own** resume | A real analysis of your resume |
| 11 | Stop the server (`Ctrl + C`) and refresh **Help** | "Backend offline" |

### 5.3 Testing the API directly (optional)

With the server running, in a second terminal (macOS / Linux):

```bash
# health check
curl http://localhost:5000/api/health

# create an account and copy the "token" from the response
curl -H "Content-Type: application/json" -d '{"email":"me@test.dev","password":"password123"}' \
     http://localhost:5000/api/auth/register
TOKEN=paste-the-token-here

# analyze a resume
curl -H "Authorization: Bearer $TOKEN" \
     -F resume=@samples/sample_resume.pdf \
     -F "jobDescription=Looking for a React and Node.js developer with MongoDB, Docker and TypeScript" \
     http://localhost:5000/api/resume/analyze

# list history
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/resume/history
```

Windows 10 and 11 also include `curl`. Write the analyze command on a single line and remove the `\`.

---

## 6. Using MongoDB (optional)

By default, results are saved to `backend/data/analyses.json`, so the app works with no database at all. To use MongoDB instead:

**Option 1 — MongoDB Atlas (free cloud database, no install):**
1. Create a free account at https://www.mongodb.com/cloud/atlas and create a free **M0** cluster.
2. Under *Database Access*, create a user and password. Under *Network Access*, allow your IP (or `0.0.0.0/0` for testing).
3. Click *Connect → Drivers* and copy the connection string.
4. Put it in `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/ai_resume_checker
   ```

**Option 2 — Local MongoDB:** install MongoDB Community Server, then set
`MONGODB_URI=mongodb://localhost:27017/ai_resume_checker`

**Option 3 — Docker:** `docker run -d -p 27017:27017 --name mongo mongo:7`, then use the same URI as Option 2.

Restart the server. You should see `[storage] Connected to MongoDB`, and the Help page will say **Storage: MongoDB**.
If MongoDB can't be reached, the server prints a warning and **falls back to the JSON file automatically**, so the app keeps working.

---

## 7. Deploying it online

Because the backend serves the built frontend, the whole app deploys as **one Node.js web service**. Any host that runs Node works (Render, Railway, a VPS, etc.). Example for **Render** (has a free tier):

1. Push the project to a GitHub repository.
2. On https://render.com, choose **New → Web Service** and select the repository.
3. Settings:
   - **Build command:** `npm run setup && npm run build`
   - **Start command:** `npm start`
   - **Environment variables:** `MONGODB_URI` = your Atlas connection string (recommended; see the note below), `JWT_SECRET` = a long random string, `OPENAI_API_KEY` = your key
4. Deploy, then open the URL Render gives you.

> **Note:** most free hosts wipe the local disk on every restart, so with the JSON fallback the history **and user accounts** would disappear. Use MongoDB Atlas (free) for a hosted version. The host sets `PORT` automatically; the server reads it.

**Hosting frontend and backend separately** (e.g. frontend on Vercel or Netlify, backend on Render):
- Frontend: build with the environment variable `VITE_API_URL=https://your-backend.onrender.com`
- Backend: set `CLIENT_ORIGIN=https://your-frontend.vercel.app` so CORS allows it

**Running it on a laptop for others on the same Wi-Fi:** start it with `npm start` and share `http://<your-laptop-IP>:5000`. Find the IP with `ipconfig` on Windows, `ipconfig getifaddr en0` on macOS, or `hostname -I` on Linux. You may need to allow Node through the firewall.

---

## 8. Troubleshooting

| Problem | Fix |
|---|---|
| `'npm' is not recognized` / `command not found: npm` | Node.js isn't installed or the terminal was opened before installing. Install Node.js and reopen the terminal. |
| `SyntaxError` or `Unexpected token` on start | Node.js is too old. Run `node -v`; you need v20 or newer. |
| `EADDRINUSE: address already in use :::5000` | Something else is using port 5000 (on macOS, often AirPlay Receiver). Set `PORT=5050` in `backend/.env`, or close the other program. |
| Browser shows JSON / "Route GET / not found" at port 5000 | The frontend wasn't built. Run `npm run build`, then `npm start` again. |
| "Cannot reach the server" in the app | The backend isn't running. Start it with `npm start` (or `npm run dev` in development mode). |
| "Very little text could be extracted" | The PDF is a scanned image. Export the resume from Word or Google Docs as a PDF instead of scanning it. |
| Name or phone shows "Not found" | Put your name alone on the first line and contact details in plain text just below it (not inside an image or a page header graphic). |
| A section wasn't detected | Use standard headings on their own line: *Education, Experience, Projects, Skills, Certifications*. |
| `npm run setup` fails with network errors | Check your internet and run it again. On a college network, try a mobile hotspot. |
| Want to clear the history | Delete `backend/data/analyses.json` (JSON mode), or use the delete buttons on the History page. |
| Everyone gets logged out after a restart | Set `JWT_SECRET` in `backend/.env`. |
| Forgot a password | There is no reset email. In JSON mode, delete that user from `backend/data/users.json` and sign up again (deleting the file removes all accounts). |
| "AI review is off" | `OPENAI_API_KEY` is empty. Add it to `backend/.env` and restart. |
| "AI review unavailable: the API key was rejected" | The key is wrong or was revoked. Create a new key and update `.env`. |
| "AI review unavailable: … rate limit or quota" | The OpenAI account has no credit left or is sending too many requests. Add billing credit on platform.openai.com or wait a minute. |
| AI review error mentioning the model | Your account may not have access to `OPENAI_MODEL`. Try another model name from the OpenAI models page. |

---

## 9. How it works inside

```
 Browser (React)                              Server (Node.js + Express)
┌───────────────────┐   upload file + JD    ┌──────────────────────────────────────────────┐
│ Log in / Sign up  │ ── email+password ──► │ 0. Auth: scrypt-hashed passwords, signed     │
│                   │ ◄──── token ───────── │    token sent as "Authorization: Bearer"     │
│ Analyze page      │ ────────────────────► │ 1. Validate: .pdf/.docx, MIME type,          │
│ (drag & drop,     │                       │    file signature (%PDF / PK), ≤ 5 MB        │
│  progress bar)    │                       │ 2. Extract text: pdf-parse / mammoth          │
│                   │                       │ 3. Parse: sections, name, email, phone,       │
│ Results dashboard │ ◄──────────────────── │    degree, CGPA, experience, projects …       │
│ (Recharts charts) │     JSON result       │ 4. Analyze: skills, 9-criteria score,         │
│                   │                       │    TF-IDF + cosine job match, feedback        │
│                   │                       │ 4b. AI review: OpenAI (if key set)           │
│ History page      │ ◄──── history ─────── │ 5. Save: MongoDB, or JSON file fallback       │
│ PDF download      │ ◄──── report ──────── │ 6. Report: PDF drawn with PDFKit              │
└───────────────────┘                       └──────────────────────────────────────────────┘
```

**Privacy and security:**
- The uploaded file stays in memory and is **never written to disk**.
- Only the analysis result is stored, tagged with the user who made it. Every read, delete and report download checks that the analysis belongs to the logged-in user.
- Passwords are never stored: only a salted **scrypt** hash (Node's built-in `crypto`). Login returns a token signed with HMAC-SHA256 that expires after 7 days.
- When an OpenAI key is set, the extracted resume text and job description are sent to OpenAI for the AI review. The file itself is not sent.
- Each file is checked three ways: extension, MIME type, and its first bytes, so a renamed `.exe` is rejected.
- Uploads are limited by size, the job description is capped at 20,000 characters, CORS is restricted, and internal error details are never sent to the browser.

### Technology stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4, React Router, Recharts (charts), Lucide (icons) |
| Backend | Node.js, Express 5, Multer (uploads), CORS, dotenv |
| Resume parsing | pdf-parse (PDF), mammoth (DOCX) |
| Analysis | Custom NLP written in JavaScript: tokenizer, stop words, stemmer, TF-IDF, cosine similarity, regex extraction, skill dictionary |
| AI review | OpenAI Chat Completions API with Structured Outputs (a strict JSON schema), called with Node's built-in `fetch` |
| Auth | Email + password; scrypt hashing and HMAC-signed tokens from Node's built-in `crypto` (no extra packages) |
| Database | MongoDB + Mongoose, with automatic local JSON-file fallback |
| PDF report | PDFKit |
| Tests | Node.js built-in test runner |

---

## 10. Algorithms explained

### 10.1 Text preprocessing
1. Convert to lowercase.
2. **Tokenize** into words, keeping technical tokens such as `c++`, `c#` and `node.js` intact.
3. Remove **stop words** ("the", "and", "with", …).
4. **Stem** words so different forms match: `optimized`, `optimize` and `optimizing` all become `optimiz`.

### 10.2 TF-IDF
Each document (resume, job description) becomes a vector of word weights:

- **TF (term frequency)** = times the word appears ÷ total words in the document
- **IDF (inverse document frequency)** = `ln((1 + N) / (1 + df)) + 1`, where N = number of documents and df = number of documents containing the word
- **weight = TF × IDF**

We use the *smoothed* IDF (the same formula as scikit-learn). With only two documents, the plain `ln(N/df)` gives **zero** weight to every word the two share, which is exactly the overlap we want to measure.

### 10.3 Cosine similarity

```
cos(R, J) = (R · J) / (|R| × |J|)
```

It measures the angle between the two vectors: 1 = same word distribution, 0 = nothing in common. It does not depend on document length, so a 2-page resume can still be compared fairly with a short job description.

### 10.4 Job match percentage

```
Job match = 40% × cosine similarity + 40% × skill coverage + 20% × keyword coverage
```

- **Skill coverage** = job-description skills found in the resume ÷ skills detected in the job description
- **Keyword coverage** = the job description's top 25 TF-IDF keywords found in the resume ÷ 25 (generic words like "candidate" and "responsibilities" are excluded)

Raw cosine similarity between a resume and a short job description is usually low (0.2–0.4) even for a good fit, so it is combined with skill coverage, which reflects what recruiters actually look for.

### 10.5 Resume score (0–100)

| Criterion | Max points | How points are earned |
|---|---|---|
| Contact information | 10 | email 4, phone 3, LinkedIn/GitHub 3 |
| Resume structure | 10 | 2 per core section (education, experience, projects, skills), summary 1, sensible length (250–1100 words) 1 |
| Skills | 20 | number of technical skills (12 pts at 12+), number of skill categories (up to 4), soft skills (up to 4) |
| Education | 10 | section 5, recognized degree 3, grade or year 2 |
| Experience | 15 | section 6, dated entries 4, bullet points (1 each, up to 5) |
| Projects | 10 | section 5, 2 per project (up to 5) |
| Certifications | 5 | section 2 + 1 per certificate |
| Impact & language | 10 | action verbs like *developed, optimized, led* (up to 6), numbers like "35%" or "200+ users" (up to 4) |
| Keyword relevance | 10 | only when a job description is given: keyword coverage × 5 + skill coverage × 5 |

**Score = points earned ÷ maximum points × 100.** Without a job description the maximum is 90, so the score is out of 90, rescaled to 100.

### 10.6 Skill extraction
The dictionary has 110 technical skills in 7 categories, 10 soft skills, and 60+ aliases (e.g. `ReactJS` → React, `sklearn` → scikit-learn, `k8s` → Kubernetes). Matching uses special word boundaries so `C` isn't found inside `C++` and `Java` isn't found inside `JavaScript`. Short, ambiguous names (`Go`, `R`, `C`) must match exactly in their capitalised form, so "let's go" doesn't count as the Go language.

### 10.7 Information extraction
- **Sections** are found by heading lines (Education, Work Experience, Projects, Technical Skills, …).
- **Regular expressions** find the email, phone, LinkedIn/GitHub URLs, degree (B.Tech, M.Sc, …), CGPA/percentage, and date ranges ("Jun 2025 – Aug 2025").
- The **name** is taken from the first lines of the resume only if it looks like a name (2–4 capitalised words, no digits). Otherwise it is reported as not found.

### 10.8 AI review (OpenAI)
- After the rule-based analysis, the extracted text (capped at 15,000 characters) and the job description go to OpenAI's Chat Completions API, together with a system prompt that forbids inventing facts.
- The request uses **Structured Outputs**: a strict JSON schema, so the reply always has exactly the fields `summary`, `strengths`, `improvements`, `rewrittenBullets` and `jobFit`, and the code never has to guess at free text.
- The model judges job fit **by meaning**, so "built REST APIs in Express" counts towards "backend development", which TF-IDF can't do. Rewrites use `[X]` where a number belongs instead of making one up.
- The AI review is kept **separate from the resume score**. The score stays rule-based and reproducible; the AI layer adds judgement on top. If OpenAI is down, the upload still succeeds and the dashboard shows why the review is missing.

### 10.9 Authentication
- **Sign-up** stores `salt:scrypt(password, salt)`. scrypt is deliberately slow and memory-hard, which makes brute-forcing a stolen hash expensive. Login re-computes the hash and compares in constant time.
- **Token** = `base64url(payload) + "." + HMAC-SHA256(payload, JWT_SECRET)`, where the payload is user id, email and expiry (7 days). This is the same idea as a JWT. The server can verify it without a session table, and changing any byte breaks the signature.
- The frontend keeps the token in `localStorage` and sends it as `Authorization: Bearer <token>`. If the server answers 401, the app clears the token and goes back to the login page.

---

## 11. API reference

Base URL: `http://localhost:5000`. Every response looks like `{ "success": true, "data": ... }` or `{ "success": false, "message": "..." }`.

All `/api/resume/*` endpoints need the header `Authorization: Bearer <token>`, where the token comes from register or login.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server status, active storage (`mongodb` or `json`) and AI model (`null` if no key) |
| `POST` | `/api/auth/register` | JSON `{ "email", "password" }` (password 8–128 characters). Returns `{ token, user }`. |
| `POST` | `/api/auth/login` | JSON `{ "email", "password" }`. Returns `{ token, user }`. |
| `GET` | `/api/auth/me` | The logged-in user (needs the token) |
| `POST` | `/api/resume/analyze` | Analyze a resume. Form-data fields: `resume` (PDF/DOCX file, required), `jobDescription` (text, optional, at least 30 characters to be used) |
| `GET` | `/api/resume/history?limit=50` | List your previous analyses (summary only) |
| `GET` | `/api/resume/:id` | Get one analysis with all details |
| `GET` | `/api/resume/:id/report` | Download the PDF report |
| `DELETE` | `/api/resume/:id` | Delete an analysis |

**Example response** of `POST /api/resume/analyze` (shortened):

```json
{
  "success": true,
  "data": {
    "id": "2c70919f-…",
    "fileName": "sample_resume.pdf",
    "resumeScore": 90,
    "jobMatch": 46,
    "result": {
      "candidate": { "name": "Aarav Mehta", "email": "aarav.mehta@example.com", "phone": "+91 98765 43210" },
      "skills": { "technical": ["Python", "React", "Node.js", "…"], "soft": ["Teamwork", "Leadership"] },
      "score": { "overall": 90, "criteria": [{ "label": "Skills", "score": 20, "max": 20, "details": "…" }] },
      "jobMatch": {
        "matchPercent": 46, "cosineSimilarity": 0.251, "skillCoverage": 71, "keywordCoverage": 36,
        "matchedSkills": ["React", "Node.js", "MongoDB"], "missingSkills": ["TypeScript", "CI/CD"],
        "matchingKeywords": ["react", "express"], "missingKeywords": ["jest", "pipelines"]
      },
      "feedback": { "strengths": ["…"], "weaknesses": ["…"], "recommendations": ["…"] },
      "ai": {
        "model": "gpt-6-luna",
        "summary": "…",
        "strengths": ["…"],
        "improvements": [{ "section": "Experience", "issue": "…", "suggestion": "…" }],
        "rewrittenBullets": [{ "original": "…", "improved": "…" }],
        "jobFit": { "score": 68, "verdict": "…", "matchedRequirements": ["…"], "missingRequirements": ["…"] }
      }
    }
  }
}
```

`ai` is `null` when no OpenAI key is set, or `{ "error": "AI review unavailable: …" }` if the OpenAI call failed. The upload still succeeds in both cases.

**Error codes:**

| Code | Meaning |
|---|---|
| `400` | No file, wrong file type, fake file, file too large, invalid email or short password |
| `401` | Not logged in, token expired or invalid, or wrong email/password |
| `409` | An account with that email already exists |
| `404` | Analysis or route not found |
| `422` | File couldn't be read (corrupted, password-protected, or a scanned image) |
| `500` | Unexpected server error |

---

## 12. Project structure

```
ai-resume-checker/
├── package.json                  # one-command scripts: setup, build, start, test, dev:*
├── README.md                     # this file
├── docs/
│   ├── VIVA_GUIDE.md             # simple explanation + likely viva questions + demo script
│   └── COMMIT_PLAN.md            # step-by-step git commit sequence (not committed itself)
├── samples/                      # sample resume (PDF, DOCX, HTML source), sample JD, invalid test files
├── backend/
│   ├── server.js                 # starts Express, CORS, routes, serves built frontend
│   ├── .env.example              # configuration template
│   ├── routes/                   # resumeRoutes.js, authRoutes.js: URL → controller mapping
│   ├── controllers/
│   │   ├── resumeController.js   # analyze/history/report/delete (scoped to the logged-in user)
│   │   └── authController.js     # register, login, me
│   ├── services/
│   │   ├── parser.js             # PDF/DOCX text extraction, sections, contact/education extraction
│   │   ├── nlp.js                # tokenizer, stemmer, TF-IDF, cosine similarity, keyword gap
│   │   ├── analyzer.js           # skills, resume score, job match, strengths/weaknesses/tips
│   │   ├── ai.js                 # OpenAI review (structured JSON output)
│   │   ├── storage.js            # MongoDB or JSON-file storage (analyses + users)
│   │   └── report.js             # PDF report generation
│   ├── models/                   # Analysis.js, User.js: MongoDB schemas
│   ├── middleware/               # auth (hashing, tokens, requireAuth), upload validation, error handler
│   ├── utils/skills.js           # skill dictionary and matcher
│   ├── test/                     # engine, auth and AI (mock OpenAI) tests
│   └── data/                     # analyses.json and users.json are created here in JSON mode
└── frontend/
    ├── index.html, vite.config.js
    └── src/
        ├── App.jsx, main.jsx     # routes (Analyze/Results/History need login)
        ├── auth.jsx              # login state + RequireAuth route guard
        ├── config.js             # project title, team names, guide (shown on About page)
        ├── services/api.js       # calls to the backend (token header, upload with progress, report download)
        ├── components/           # navbar/footer layout, cards, score ring, chips
        └── pages/                # Landing, Login, Analyze, Results, History, About, Help
```

To change the **team names, roll numbers, guide or college** on the About page, edit `frontend/src/config.js` and run `npm run build` again.

---

## 13. Project report material (abstract, objectives, limitations, future scope)

### Abstract
Job seekers, especially students, often apply with one generic resume and receive no feedback on why it does or does not suit a role. This project implements an automated resume analyzer that parses PDF and DOCX resumes, extracts structured information using rule-based natural language processing, and rates resume quality with an explainable 100-point scoring model. When a job description is provided, both documents are converted into TF-IDF vectors. Their cosine similarity is combined with skill and keyword coverage to produce a job-match percentage, and the job's skills and keywords that are missing from the resume are listed. Every detected gap becomes a specific recommendation. On top of this transparent baseline, a large language model (OpenAI, called through its Structured Outputs API) reviews the resume like a recruiter: it summarises it, suggests section-level fixes, rewrites weak bullet points without inventing facts, and judges job fit by meaning, which handles the synonyms TF-IDF misses. Users sign in with email and password, and each user's analyses are private to them. Results are shown on an interactive dashboard, stored in MongoDB (or a local JSON file as a fallback), and exported as a PDF report.

### Problem statement
- Manual resume review is slow and subjective, and candidates rarely learn what is missing.
- Generic resumes don't reflect the keywords and skills a particular job asks for.
- Many online "resume scores" are black boxes: users can't see how the number was produced.

### Objectives
1. Accept PDF and DOCX resumes and extract their text reliably.
2. Extract candidate details, education, experience, projects and certifications without inventing missing data.
3. Identify technical and soft skills.
4. Compute an explainable 0–100 resume score.
5. Measure resume-to-job similarity using TF-IDF and cosine similarity, and list matching and missing keywords and skills.
6. Generate strengths, weaknesses and actionable recommendations.
7. Add an LLM-based review (OpenAI) for meaning-level job fit and bullet-point rewrites, without making the core score depend on it.
8. Secure the app with email/password accounts so each user's history is private.
9. Visualize results, keep a history, and export a PDF report.

### Limitations
- Scanned or image-only PDFs aren't supported (no OCR).
- Extraction depends on standard section headings. Multi-column layouts or text inside images and tables can reduce accuracy.
- The skill dictionary is finite: unknown skills aren't labelled as skills, although they still count in the TF-IDF similarity.
- TF-IDF matches words, not meanings, so synonyms with different stems ("built" vs "developed") don't match. The AI review covers this, but only when an OpenAI key is configured.
- The AI review depends on a paid external API, can make mistakes, and its output can vary between runs; the rule-based score stays the reference number.
- Auth is deliberately simple: no password reset, email verification or login rate limiting.
- **The score measures completeness and keyword alignment only. It does not guarantee ATS compatibility or hiring success.**

### Future scope
- Local sentence embeddings (e.g. Sentence-BERT) as an offline alternative to the OpenAI review.
- A trained NER model (e.g. spaCy) for more robust name, organization and date extraction.
- OCR (Tesseract) to support scanned resumes.
- Password reset by email, email verification and login rate limiting.
- Side-by-side comparison across resume versions.
- A recruiter mode that ranks many resumes against one job description.

---

### Sample data note
The sample resume (`Aarav Mehta`) and the team names on the About page are **fictional placeholders**.
