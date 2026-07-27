# Meghaditya (मेघादित्य)

> **Rooftop Resource Assessment Tool for India**  
> Accurately assesses rainwater harvesting potential and rooftop solar energy yield for residential and commercial buildings across 700+ Indian districts, backed by district-wise rainfall data and NITI Aayog solar irradiance datasets.

---

## 🌟 Key Features

- 💧 **Rainwater Harvesting Assessment**: Calculates annual harvestable runoff volume (liters), optimal storage tank capacity sizing, and estimated domestic requirement coverage based on roof surface area and runoff coefficients (RCC concrete, tiled/sloped, green roofs).
- ☀️ **Rooftop Solar Energy Potential**: Estimates recommended PV array system size (kWp), annual clean electricity output (kWh), estimated annual utility bill savings (₹), and annual CO₂ footprint reduction.
- 📊 **12-Month Solar Radiation Breakdown**: Interactive monthly GHI (Global Horizontal Irradiance in kWh/m²/day) bar charts to model seasonal solar generation profiles.
- 📜 **State Subsidy & Policy Finder**: Dynamic policy lookups for state-specific solar subsidies (e.g., PM Surya Ghar Muft Bijli Yojana) and rainwater harvesting mandates.
- 🔍 **District Search**: Searchable database of over 700+ districts across all Indian States and Union Territories.
- ✨ **Staggered Entrance Motion & Glassmorphism**: Responsive frosted glass UI (`glassmorphism`) with smooth, staggered entrance reveals and dedicated mobile navigation menu.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: React 18 (Vite 6)
- **Styling**: Tailwind CSS 3, Vanilla CSS Keyframe Animations
- **Icons**: Lucide React
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios

### **Backend**
- **Framework**: FastAPI (Python 3.10+)
- **Database**: SQLite / SQLAlchemy ORM
- **Data Validation**: Pydantic v2
- **Server**: Uvicorn

---

## 📁 Project Architecture

```text
meghaditya/
├── src/                        # React Frontend Source
│   ├── assets/                 # High-resolution background imagery & branding assets
│   ├── components/             # Reusable UI Components
│   │   ├── LocationSearch.jsx  # Autocomplete search for 700+ Indian districts
│   │   ├── Navbar.jsx          # Glassmorphic top navigation with mobile menu drawer
│   │   ├── PageBackground.jsx  # Fixed background layer with optional Ken Burns zoom
│   │   ├── ResultCard.jsx      # Assessment metrics display card
│   │   ├── SplashScreen.jsx    # Animated one-time session landing splash
│   │   └── SubsidyPanel.jsx    # State subsidy & policy reference panel
│   ├── hooks/                  # Custom React hooks (e.g. useApiRequest)
│   ├── pages/                  # Page Views
│   │   ├── LandingPage.jsx     # Main landing view with staged entrance sequence
│   │   ├── RainwaterDashboard.jsx # Rainwater assessment workspace
│   │   └── SolarDashboard.jsx     # Rooftop solar assessment workspace
│   ├── App.jsx                 # Application root & client-side router
│   ├── index.css               # Design system tokens & animation keyframes
│   └── main.jsx                # React entry point
├── backend/                    # FastAPI Backend Source
│   ├── app/
│   │   ├── models.py           # SQLAlchemy database schemas
│   │   ├── schemas.py          # Pydantic request/response schemas
│   │   ├── crud.py             # Database query logic & calculations
│   │   ├── main.py             # FastAPI app initialization & CORS middleware
│   │   └── routers/            # API Endpoints (/assess, /locations, /subsidies)
│   └── requirements.txt        # Python package dependencies
├── package.json                # Frontend dependencies & scripts
├── tailwind.config.js          # Tailwind CSS configuration
└── vite.config.js              # Vite bundler configuration
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Python**: v3.10 or higher

---

### 1. Frontend Setup

1. **Navigate to the repository root**:
   ```bash
   cd meghaditya
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The frontend application will run locally at `http://localhost:5173`.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

### 2. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a Python virtual environment**:
   - **Linux/macOS**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```

3. **Install backend dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Launch the FastAPI API server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The API will be accessible at `http://localhost:8000`. API documentation is available at `http://localhost:8000/docs`.

---

## 🌐 Data Sources & Methodology

- **Precipitation Data**: District-wise Rainfall statistics calibrated per district surface area.
- **Solar Irradiance Data**: NITI Aayog Solar Irradiance Data providing annual average daily GHI (Global Horizontal Irradiance in kWh/m²/day) metrics.
- **Subsidies**: Aligned with Central and State Government incentive programs including PM Surya Ghar Muft Bijli Yojana.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
