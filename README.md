# Sopan Impact Measurement Dashboard
### Live M&E Portal — Bihar Rural Education Initiative

A live, demo-ready dashboard designed for **Sopan Learning Initiative** (operating in Gaya and Patna, Bihar, India) to track child literacy and numeracy progress under the **Teaching at the Right Level (TaRL)** tutoring methodology.

---

## 🔗 Live Deployments & Documents

* 🌐 **Live Dashboard (Vercel)**: **[https://anal-drab.vercel.app](https://anal-drab.vercel.app)**
* 📋 **Step-by-Step User Guide**: **[USER_GUIDE.md](./USER_GUIDE.md)**
* 📊 **Board Pitch Deck (5-Min Slide Deck)**: **[BOARD_PITCH.md](./BOARD_PITCH.md)**
* 🔬 **J-PAL M&E Validation Report**: **[VALIDATION_REPORT.md](./VALIDATION_REPORT.md)**

---

## 🎯 Key Metrics Tracked

1. **Weekly Learning Transition Rate (WLTR)**: The percentage of children who jumped $\ge 1$ ASER reading or math level (e.g. Letter to Word) in their weekly checks.
2. **Cost per ASER Transition**: Total cohort spend divided by total level improvements achieved, anchoring financial cost-effectiveness.
3. **Data Quality Health Score**: System compliance score measuring duplicates, invalid out-of-bound level entries, and mobile upload submission lag.
4. **Demographic Gaps**: Live gap analysis monitoring minority caste (SC, ST, OBC) and gender shares.

---

## 🛠️ Technology Stack & Architecture

* **Frontend**: React.js, Vite
* **Styling**: Tailwind CSS v4 (Glassmorphic dark design)
* **Visualizations**: Recharts (Responsive bar, area, line, and pie charts)
* **Data Flow**: PapaParse (CSV parsing) reading directly from a **Google Sheets Web Pipe** with local browser caching to support offline usage.
* **Ethics Safeguard**: Replaced individual worker leaderboards with a *Center-Level Data Health & Support Audit* to avoid shaming and prevent data falsification.

---

## 🚀 How to Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/vivekparihar6009/sopan-impact-dashboard.git
   cd sopan-impact-dashboard
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate the student database:
   ```bash
   node scripts/generate_data.cjs
   ```
4. Start the local server:
   ```bash
   npm run dev
   ```
   Open **`http://localhost:5173/`** in your browser.
