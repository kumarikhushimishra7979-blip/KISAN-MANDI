# Kisan Mandi Bhav Predictor & Voice Advisory Assistant 🌾
> **Minor Project / Engineering Capstone Documentation & Implementation**  
> *Audio-First, Multilingual, Icon-Driven APMC Commodity Price Prediction System for Indian Farmers*

---

## 1. Executive Summary & Problem Statement
Indian farmers, particularly smallholders selling at major agricultural trading hubs like **Gulabbagh Mandi in Purnea (Bihar)**, often face significant economic loss due to distress sales during peak harvest glut. Due to illiteracy and existing English-centric apps, farmers cannot easily interpret complex candlestick charts or tabular data.

This project delivers a **voice-first, multilingual, icon-driven interface**:
- **Speech-to-Text (STT):** Farmers speak queries in Hindi, Maithili, or English (e.g., *"आज गुलाबबाग में मक्का का भाव क्या है?"*).
- **Machine Learning Time-Series Forecaster:** XGBoost Regressor predicting 7-day modal prices with lag features and rolling averages.
- **Visual Signals (No-Read Interface):** High-contrast color-coded cards:
  - 🟢 **HOLD (रोकें):** Green signal + Smiling Crop icon (Prices rising $\rightarrow$ Hold stock for higher margins).
  - 🔴 **SELL (बेचें):** Red signal + Downward trend indicator (Prices falling $\rightarrow$ Sell immediately before market drop).
  - 🟡 **WAIT & WATCH (निगरानी रखें):** Amber scale (Stable range-bound prices).
- **Text-to-Speech (TTS):** Automated voice narration reading actionable advice aloud in local dialects.

---

## 2. System Architecture & Project Structure
```text
mandi-price-prediction/
├── data/
│   └── agmarknet_data.csv             # Historical mandi prices & daily arrivals
├── models/
│   └── xgboost_maize_gulabbagh.joblib    # Trained XGBoost model artifact
├── src/
│   ├── preprocess.py                  # Lag calculation (t-1, t-7), rolling averages
│   ├── train.py                       # Model fitting, evaluation (RMSE, MAPE)
│   └── inference.py                   # Recursive multi-step 7-day forecasting
├── app.py                             # FastAPI backend & GET /predict endpoint
├── streamlit_app.py                   # Streamlit frontend with voice & visuals
├── requirements.txt                   # Pinned Python package dependencies
└── README.md                          # Complete setup and evaluation guide
```

---

## 3. Quickstart & Installation

### Step 1: Clone and Set Up Virtual Environment
```bash
git clone https://github.com/your-username/kisan-mandi-bhav-predictor.git
cd kisan-mandi-bhav-predictor

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install required packages
pip install -r requirements.txt
```

### Step 2: Start the FastAPI Backend
```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger API documentation will be available at `http://localhost:8000/docs`.

### Step 3: Launch the Streamlit Frontend
```bash
streamlit run streamlit_app.py
```
Open your browser at `http://localhost:8501`.

---

## 4. REST API Endpoint Specification

### `GET /predict`
Returns current rates, 7-day recursive projections, and translated audio advice scripts.

**Query Parameters:**
- `crop`: `maize` | `paddy` | `wheat` | `mustard`
- `mandi`: `gulabbagh` | `purnea` | `patna` | `muzaffarpur`

**Sample Response:**
```json
{
  "mandi_name": "Gulabbagh (Purnea)",
  "crop_name": "मक्का (Corn)",
  "current_price": 2240.0,
  "forecast_day7_price": 2380.0,
  "price_change_absolute": 140.0,
  "price_change_percentage": 6.25,
  "trend_direction": "UP",
  "advisory": {
    "action": "HOLD",
    "action_hi": "रोकें (स्टॉक बचाएं)",
    "action_maithili": "रुकीं (अखनि नहि बेची)",
    "reason_hi": "अगले 7 दिनों में भाव ₹140 प्रति क्विंटल (+6.2%) बढ़ने का अनुमान है। अभी फसल न बेचें।",
    "audio_script_hi": "किसान भाई ध्यान दें! गुलाबबाग में मक्का का भाव अगले सात दिनों में ₹2380 तक बढ़ने की संभावना है। हमारी सलाह है कि अपनी उपज को रोककर रखें।"
  }
}
```

---

## 5. Machine Learning Methodology
1. **Feature Engineering:**
   - **Lags:** $P_{t-1}, P_{t-2}, P_{t-3}, P_{t-7}$ (Weekly seasonality).
   - **Rolling Statistics:** 7-day moving average ($\mu_7$) and rolling standard deviation ($\sigma_7$).
   - **Supply Pressure:** $Arrivals_{t-1}$ to account for volume surges.
2. **Evaluation Metrics:**
   - **RMSE (Root Mean Square Error):** Measures deviation in ₹/Quintal.
   - **MAPE (Mean Absolute Percentage Error):** Target $< 4.5\%$ for robust price forecasting.
