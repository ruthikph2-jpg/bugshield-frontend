# 🛡️ BugShield — AI-Powered Code Bug Detector & Auto-Fixer

> **Detect it. Fix it. Understand it.**

BugShield is an AI-powered web application that detects bugs in your code, automatically generates a fix, and explains the root cause in simple English.

🌐 **Live Demo**: [bugshield-frontend.vercel.app](https://bugshield-frontend.vercel.app)

---

## ✨ Features

- 🔍 **Bug Detection** — Identifies syntax errors, logic bugs, and runtime issues
- 🤖 **AI-Powered Fix** — Automatically generates corrected code using Google Gemini AI
- 📝 **Clear Explanation** — Step-by-step explanation of what went wrong and how it was fixed
- 🔧 **What Changed** — Highlights exactly which lines were changed and why
- 🌐 **Multi-Language Support** — Python, JavaScript, Java, C++, TypeScript, Go, Rust and more
- 🎨 **Clean Dark UI** — Professional dark-themed interface with code editor

---

## 🖥️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| AI | Google Gemini 1.5 Flash |
| Deployment (Frontend) | Vercel |
| Deployment (Backend) | Render |
| Version Control | Git + GitHub |

---

## 🚀 Getting Started Locally

### 1. Clone the repos
```bash
git clone https://github.com/ruthikph2-jpg/bugshield-frontend
git clone https://github.com/ruthikph2-jpg/bugshield-backend
```

### 2. Setup Backend
```bash
cd bugshield-backend
npm install
cp .env.example .env
# Add your Gemini API key to .env
npm start
```

### 3. Setup Frontend
```bash
cd bugshield-frontend
npm install
# Create .env with VITE_BACKEND_URL=http://localhost:5000
npm run dev
```

---

## 📸 Screenshots

### Bug Detected & Fixed
The app detects the bug, shows the corrected code, and explains the fix step by step.

---

## 🔗 Related Repos

- **Backend**: [github.com/ruthikph2-jpg/bugshield-backend](https://github.com/ruthikph2-jpg/bugshield-backend)

---

## 👨‍💻 Author

**Ruthik PH** — [@ruthikph2-jpg](https://github.com/ruthikph2-jpg)

---

⭐ Star this repo if you found it useful!
