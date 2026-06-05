# Contributing to OpenBridge

Thank you for your interest in contributing to OpenBridge! OpenBridge is built for open-source contributors, by the open-source community. Follow these guidelines to set up your local development environment.

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your machine:
* **Node.js** (v18.0.0 or higher)
* **npm** (v9.0.0 or higher)
* **Git**

---

## 🚀 Local Development Setup

Follow these steps to spin up the application on your local machine:

### 1. Clone the Repository
```bash
git clone https://github.com/Poojan2107/OpenBridge.git
cd OpenBridge
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory (you can copy `.env.example` as a template):
```bash
cp .env.example .env
```
Inside your `.env` file, specify:
* `DATABASE_URL="file:./dev.db"` (SQLite path)
* `GEMINI_API_KEY` (Your Google Gemini API Key - Optional, falls back to structured simulations if not provided)
* `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET` (For OAuth integrations - Optional, fall back to interactive sandboxes)

### 4. Database Setup & Sync
Prisma is used to manage database interactions. Initialize and push your local schema:
```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Start the Development Server
Launch the full-stack server (express API + Vite client):
```bash
npm run dev
```
Open your browser and navigate to: **`http://localhost:3000`**

---

## 📜 Contribution Rules & DCO Compliance

OpenBridge enforces the **Developer Certificate of Origin (DCO)** standard to certify that contributions are legally clear. 

### ✍️ Signed-Off Commits
Every commit submitted to this project must include a `Signed-off-by` line in the message footer.
You can automate this by adding the `-s` flag when committing:
```bash
git commit -s -m "feat: implement issue URL fetcher"
```
This will append the following footer to your commit message:
```text
Signed-off-by: Your Name <your.email@example.com>
```
*Note: Commits without this sign-off will fail the pre-flight checks and PR pipelines.*
