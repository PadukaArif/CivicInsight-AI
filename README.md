<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/Bun-Runtime-F9F1E1?style=for-the-badge&logo=bun&logoColor=black" alt="Bun" />
  <img src="https://img.shields.io/badge/Capacitor-8-119EFF?style=for-the-badge&logo=capacitor&logoColor=white" alt="Capacitor 8" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
</p>

<h1 align="center">🏛️ CivicInsight AI — Frontend</h1>

<p align="center">
  <strong>Portal Digital Terpadu RT/RW Berbasis AI</strong><br/>
  A modern, AI-powered civic management platform for neighborhood-level governance transparency, citizen services, and data-driven decision making.
</p>

<p align="center">
  <a href="https://github.com/PadukaArif/CivicInsight-AI">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=flat-square&logo=github" alt="GitHub Repo" />
  </a>
  <a href="https://github.com/PadukaArif/CivicInsight-AI-Backend">
    <img src="https://img.shields.io/badge/Backend-Repository-181717?style=flat-square&logo=github" alt="Backend Repo" />
  </a>
  <a href="https://civicinsight-ai-backend.up.railway.app">
    <img src="https://img.shields.io/badge/API-Production-0B0D0E?style=flat-square&logo=railway" alt="Production API" />
  </a>
</p>

> [!IMPORTANT]
> ### 📥 Download Android App (APK)
> Anda dapat mengunduh berkas aplikasi Android siap pakai (APK) langsung dari repositori ini:  
> 👉 **[Download CivicInsight.apk (v1.0.0)](https://github.com/PadukaArif/CivicInsight-AI/raw/main/CivicInsight.apk)**

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
  - [Production Build](#production-build)
  - [Android APK Build](#android-apk-build)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## 🌐 Overview

**CivicInsight AI** is a comprehensive digital portal designed for RT/RW (neighborhood-level) civic management in Indonesia. It leverages artificial intelligence to deliver transparent financial reporting, real-time citizen complaint tracking, 24/7 AI-powered consultation, and population data management — all through a sleek, mobile-first interface.

Built for the **LKS Nasional** competition, this project demonstrates production-grade engineering practices including type-safe development, responsive design, hybrid mobile deployment, and seamless AI integration.

---

## ✨ Key Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Citizen Dashboard** | Real-time population statistics and RT financial transparency with interactive data visualizations |
| 2 | **AI Consultation 24/7** | Intelligent civic assistant powered by **Google Gemini** and **Groq LLaMA** for instant citizen inquiries |
| 3 | **Complaint Reporting System** | End-to-end citizen complaint tracking with status pipeline: `Terkirim → Diproses → Selesai` |
| 4 | **AI Fact Checker** | AI-driven verification of information and neighborhood rumors to combat misinformation |
| 5 | **AI Service Evaluation** | Analytics dashboard for RT/RW service effectiveness assessment *(admin only)* |
| 6 | **Population Data Management** | Comprehensive citizen and family card (KK) data management system |
| 7 | **Polls & Surveys** | Community polling and neighborhood satisfaction surveys for data-driven governance |
| 8 | **Admin Panel** | Role-based access control for RT/RW officers with dedicated management tools |
| 9 | **Android Hybrid App** | Native Android APK via Capacitor 8 for offline-capable mobile deployment |
| 10 | **Responsive Design** | Mobile-first approach ensuring optimal experience across all devices |

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 19 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **Bundler & Runtime** | Bun |
| **Mobile** | Capacitor 8 (Android hybrid) |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **UI Primitives** | Radix UI |
| **AI Providers** | Google Gemini, Groq LLaMA |
| **Backend** | [CivicInsight AI Backend](https://github.com/PadukaArif/CivicInsight-AI-Backend) (Railway) |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CivicInsight AI                       │
│                   Frontend (React 19)                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────┐  ┌──────────────┐  ┌──────────────────┐  │
│   │  Views   │  │   Hooks      │  │   Components     │  │
│   │ (Pages)  │──│ useCivicData │──│  Layout / UI     │  │
│   └────┬─────┘  └──────┬───────┘  └──────────────────┘  │
│        │               │                                 │
│        └───────┬───────┘                                 │
│                │                                         │
│         ┌──────▼──────┐                                  │
│         │   App.tsx    │  ← Routing & Auth                │
│         └──────┬──────┘                                  │
│                │                                         │
├────────────────┼─────────────────────────────────────────┤
│          ┌─────▼─────┐        ┌──────────────────┐      │
│          │ Bun Server │───────│  API Proxy Layer  │      │
│          │ :3000      │       └────────┬─────────┘      │
│          └────────────┘                │                 │
└────────────────────────────────────────┼─────────────────┘
                                         │
                              ┌──────────▼──────────┐
                              │   Backend API        │
                              │   (Railway Cloud)    │
                              │   /api/v1/*          │
                              └──────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **[Bun](https://bun.sh/)** v1.0 or higher

```bash
# Install Bun (macOS / Linux)
curl -fsSL https://bun.sh/install | bash

# Install Bun (Windows)
powershell -c "irm bun.sh/install.ps1 | iex"

# Verify installation
bun --version
```

### Installation

```bash
# Clone the repository
git clone https://github.com/PadukaArif/CivicInsight-AI.git
cd CivicInsight-AI/frontend

# Install dependencies
bun install
```

### Development

```bash
# Start the development server
bun run dev
```

The application will be available at **http://localhost:3000** with hot module replacement enabled and API proxy configured to the backend.

### Production Build

```bash
# Build for production
bun run build
```

The optimized bundle will be output to the `dist/` directory, ready for static hosting or CDN deployment.

### Android APK Build

```bash
# Sync web assets to the Android project
npx cap sync android

# Build the debug APK
cd android
./gradlew assembleDebug
```

The APK will be generated at `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## 🔐 Environment Variables

Create a `.env` file in the project root or set the following variables in your environment:

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://civicinsight-ai-backend.up.railway.app` |

```env
# .env.local (example)
VITE_API_URL=http://localhost:8000
```

---

## 📂 Project Structure

```
src/
├── components/
│   ├── layout/                  # Layout components
│   │   ├── DashboardLayout.tsx  # Main authenticated layout with sidebar & navigation
│   │   └── LoginView.tsx        # Authentication view
│   └── views/                   # Feature views (pages)
│       ├── BerandaView.tsx      # Dashboard home — statistics & financial transparency
│       ├── KonsultasiAIView.tsx # AI consultation chat interface
│       ├── LaporAduanView.tsx   # Citizen complaint submission & tracking
│       ├── CekFaktaView.tsx     # AI fact-checking tool
│       ├── EvaluasiAIView.tsx   # AI service evaluation (admin)
│       ├── DataWargaView.tsx    # Population data management
│       ├── PollingView.tsx      # Community polls & surveys
│       └── ...                  # Additional feature views
├── hooks/
│   └── useCivicData.ts          # Central state management hook (data fetching, auth, state)
├── lib/                         # Utility functions and helpers
├── App.tsx                      # Root component — routing, auth guards, view orchestration
├── index.ts                     # Bun dev server entry with API proxy configuration
├── index.html                   # HTML entry point
└── index.css                    # Global styles & Tailwind CSS directives
```

---

## 📸 Screenshots

> Screenshots coming soon. The application features a modern glassmorphism UI with smooth animations, dark/light mode support, and responsive layouts optimized for both desktop and mobile viewports.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

Please ensure your code follows the existing TypeScript conventions and passes all linting checks before submitting.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](../LICENSE) file for details.

---

## 👤 Author

**Arif**

- ✉️ Email: [arifraffyfadlurahman@gmail.com](mailto:arifraffyfadlurahman@gmail.com)
- 🐙 GitHub: [@PadukaArif](https://github.com/PadukaArif)

---

<p align="center">
  Built with ❤️ for <strong>LKS Nasional</strong><br/>
  <sub>CivicInsight AI — Empowering neighborhoods through technology</sub>
</p>
