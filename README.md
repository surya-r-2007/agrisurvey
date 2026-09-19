# AgriSurvey 🌾

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsurya-r-2007%2Fagrisurvey)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deploy_Now-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/new)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

An offline-first agricultural field survey, cadastral GIS mapping, and agronomic audit web application designed for field agricultural inspectors and extension officers.

---

## 🚀 Live Demo & 1-Click Deployment

You can deploy this application live to **Vercel** with a single click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsurya-r-2007%2Fagrisurvey)

### Deploy in 3 Simple Steps on Vercel:

1. **Log in to [Vercel.com](https://vercel.com)** using your GitHub account (`surya-r-2007`).
2. Click **Add New...** ➜ **Project** and select **`surya-r-2007/agrisurvey`**.
3. Keep default settings (Vite preset, `npm run build`) and click **Deploy**.

> Once deployed, Vercel will instantly generate a live URL (e.g., `https://agrisurvey.vercel.app` or `https://agrisurvey-web.vercel.app`) that automatically updates whenever you push commits to the `main` branch.

---

## ✨ Key Features

- **📍 Cadastral GIS Mapping:**
  - Real-time browser Geolocation API tracking (latitude, longitude, altitude, accuracy).
  - OpenStreetMap interactive layer with polygon boundaries and telemetry overlays.
  - Manual coordinate overrides and vertex-by-vertex boundary recording.

- **📋 10-Module Comprehensive Agronomic Surveys:**
  1. **Farmer Profile:** Personal details, landholding size, government registration ID.
  2. **Field Information:** Cadastral parcel ID, surveyed area, irrigation typology.
  3. **Soil Analysis:** Soil type, pH, N-P-K nutrient status, organic carbon metrics.
  4. **Water & Irrigation:** Source type, pump capacity, canal water schedules.
  5. **Crop Dossier:** Crop variety, sowing dates, phenological stage, yield estimates.
  6. **Pest & Disease Assessment:** Infection severity, identified symptoms, IPM practices.
  7. **Microclimate:** Ambient temperature, humidity, rainfall records, micro-station readings.
  8. **Technology Adoption:** Farm mechanization, IoT sensors, precision equipment.
  9. **Economic Indicators:** Input expenditure, labor costs, market linkages.
  10. **Temporal Observations:** Multi-season longitudinal trend tracker.

- **📄 Red-Knight Technologies Security & PDF Audits:**
  - Automated client-side PDF dossier generation.
  - Diagonal security watermark: **"RED-KNIGHT TECHNOLOGIES — CONFIDENTIAL & AUDITED"**.
  - Official Red-Knight Technologies heraldic branding and compliance seal.

- **💾 Offline-First Local Persistence:**
  - Zero static dummy data: full CRUD capability backed by resilient browser local storage (`localStorage`).
  - Works seamlessly during intermittent rural connectivity.

---

## 🛠️ Tech Stack

- **Framework:** React 19, TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS v4, Lucide Icons, Google Material Symbols
- **Animations:** Motion (`motion/react`)
- **Deployment:** Vercel (Configured with `vercel.json` SPA rewrites)

---

## 💻 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/surya-r-2007/agrisurvey.git
cd agrisurvey
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 4. Build for production
```bash
npm run build
```

---

## 📱 Mobile Version (Companion App)

Looking for the native Android APK mobile application built with React Native & Expo? Check out the [`mobile` branch](https://github.com/surya-r-2007/agrisurvey/tree/mobile) of this repository.

---

## 📄 License

This project is licensed under the MIT License.
