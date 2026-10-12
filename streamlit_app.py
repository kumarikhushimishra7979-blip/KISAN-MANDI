"""
Kisan Mandi Bhav Predictor & Voice Advisory Assistant - Streamlit Frontend
Designed for semi-literate and rural Indian farmers with big visual cards and speech synthesis.
"""

import streamlit as st
import requests
import json
import plotly.graph_objects as go
import tempfile
import os
try:
    from gtts import gTTS
    HAS_GTTS = True
except ImportError:
    HAS_GTTS = False

st.set_page_config(
    page_title="Kisan Mandi Bhav Predictor & Voice Advisory",
    page_icon="🌾",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for high contrast farmer-friendly cards and zero clutter
st.markdown("""
<style>
    .main-title {
        font-size: 2.2rem;
        font-weight: 800;
        color: #14532d;
        margin-bottom: 0.2rem;
    }
    .sub-title {
        font-size: 1.1rem;
        color: #4b5563;
        margin-bottom: 1.5rem;
    }
    .action-card-hold {
        background: linear-gradient(135deg, #15803d, #166534);
        color: white;
        padding: 1.8rem;
        border-radius: 1.25rem;
        text-align: center;
        box-shadow: 0 10px 25px -5px rgba(21, 128, 61, 0.4);
        margin-bottom: 1.5rem;
    }
    .action-card-sell {
        background: linear-gradient(135deg, #dc2626, #991b1b);
        color: white;
        padding: 1.8rem;
        border-radius: 1.25rem;
        text-align: center;
        box-shadow: 0 10px 25px -5px rgba(220, 38, 38, 0.4);
        margin-bottom: 1.5rem;
    }
    .action-card-stable {
        background: linear-gradient(135deg, #d97706, #b45309);
        color: white;
        padding: 1.8rem;
        border-radius: 1.25rem;
        text-align: center;
        box-shadow: 0 10px 25px -5px rgba(217, 119, 6, 0.4);
        margin-bottom: 1.5rem;
    }
    .big-signal-text {
        font-size: 2.5rem;
        font-weight: 900;
        letter-spacing: 0.05em;
        margin-top: 0.5rem;
    }
    .price-badge {
        font-size: 2rem;
        font-weight: 800;
        color: #111827;
    }
</style>
""", unsafe_allow_html=True)

# Language Configuration
LANG_OPTIONS = {
    "हिन्दी (Hindi)": "hi",
    "English": "en",
    "मैथिली (Maithili)": "mai"
}

CROPS = {
    "🌽 मक्का (Maize)": "maize",
    "🌾 धान (Paddy)": "paddy",
    "🌾 गेहूं (Wheat)": "wheat",
    "🌼 सरसों (Mustard)": "mustard"
}

MANDIS = {
    "Gulabbagh (Purnea, Bihar)": "gulabbagh",
    "Purnea City (Bihar)": "purnea",
    "Patna Fatuha (Bihar)": "patna",
    "Muzaffarpur (Bihar)": "muzaffarpur"
}

# Sidebar controls
st.sidebar.image("https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=400&q=80", caption="APMC Gulabbagh Mandi")
selected_lang_label = st.sidebar.selectbox("🌐 भाषा चुनें / Select Language", list(LANG_OPTIONS.keys()))
current_lang = LANG_OPTIONS[selected_lang_label]

selected_crop_label = st.sidebar.selectbox("🌾 फसल चुनें / Select Crop", list(CROPS.keys()), index=0)
selected_crop = CROPS[selected_crop_label]

selected_mandi_label = st.sidebar.selectbox("🏛️ मंडी चुनें / Select Mandi", list(MANDIS.keys()), index=0)
selected_mandi = MANDIS[selected_mandi_label]

st.sidebar.markdown("---")
st.sidebar.markdown("### 🎙️ आवाज़ से पूछें (Voice Assistant)")
voice_query = st.sidebar.text_input(
    "या यहाँ टाइप करें / Or speak query:",
    placeholder="जैसे: आज गुलाबबाग में मक्का का भाव क्या है?"
)

# Header
st.markdown('<div class="main-title">🌾 किसान मंडी भाव और आवाज़ सलाहकार</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-title">Kisan Mandi Bhav Predictor & 7-Day ML Price Forecasting System</div>', unsafe_allow_html=True)

# Fetch prediction from backend API or fallback simulator
API_URL = "http://localhost:8000/predict"
data = None

try:
    response = requests.get(API_URL, params={"crop": selected_crop, "mandi": selected_mandi}, timeout=3)
    if response.status_code == 200:
        data = response.json()
except Exception:
    # Fallback realistic calculation if standalone Streamlit execution without separate FastAPI server
    from app import simulate_xgboost_forecast, MARKET_BASELINES, SUPPORTED_CROPS, generate_advisory
    base_info = MARKET_BASELINES.get(selected_mandi, MARKET_BASELINES["gulabbagh"])[selected_crop]
    base_price = base_info["base_price"]
    forecasts, day7 = simulate_xgboost_forecast(base_price, base_info["trend"], base_info["volatility"])
    abs_chg = day7 - base_price
    pct_chg = (abs_chg / base_price) * 100
    crop_meta = SUPPORTED_CROPS[selected_crop]
    advisory = generate_advisory(
        crop_meta["hi"], selected_crop.capitalize(), crop_meta["maithili"],
        pct_chg, abs_chg, selected_mandi_label, base_price, day7
    )
    data = {
        "mandi_name": selected_mandi_label,
        "crop_name": crop_meta["hi"],
        "crop_icon": crop_meta["icon"],
        "current_price": base_price,
        "min_price": round(base_price * 0.96, 2),
        "max_price": round(base_price * 1.04, 2),
        "forecast_day7_price": round(day7, 2),
        "price_change_absolute": round(abs_chg, 2),
        "price_change_percentage": round(pct_chg, 2),
        "trend_direction": "UP" if pct_chg >= 2.5 else ("DOWN" if pct_chg <= -2.5 else "STABLE"),
        "advisory": advisory.dict(),
        "forecast_series": [f.dict() for f in forecasts],
    }

if data:
    adv = data["advisory"]
    direction = data["trend_direction"]
    card_class = "action-card-hold" if direction == "UP" else ("action-card-sell" if direction == "DOWN" else "action-card-stable")
    
    col_card, col_stats = st.columns([1.2, 1])

    with col_card:
        # Animated / Visual No-Read Card
        signal_icon = "🟢 🌽 ⬆️" if direction == "UP" else ("🔴 🔻 📉" if direction == "DOWN" else "🟡 ⚖️ ➡️")
        action_text = adv["action_hi"] if current_lang == "hi" else (adv["action_maithili"] if current_lang == "mai" else adv["action"])
        reason_text = adv["reason_hi"] if current_lang == "hi" else (adv["reason_maithili"] if current_lang == "mai" else adv["reason_en"])
        
        st.markdown(f"""
        <div class="{card_class}">
            <div style="font-size: 3.5rem;">{signal_icon}</div>
            <div class="big-signal-text">{action_text}</div>
            <p style="font-size: 1.15rem; margin-top: 0.8rem; font-weight: 500;">{reason_text}</p>
        </div>
        """, unsafe_allow_html=True)

        # Audio Output
        st.markdown("#### 🔊 आवाज़ में सुनें (Listen in Audio)")
        speech_script = adv["audio_script_hi"] if current_lang == "hi" else (adv["audio_script_maithili"] if current_lang == "mai" else adv["audio_script_en"])
        
        if HAS_GTTS:
            if st.button("▶️ सलाह सुनें (Play Audio Voice)", key="audio_btn"):
                tts_lang = "hi" if current_lang in ["hi", "mai"] else "en"
                tts = gTTS(text=speech_script, lang=tts_lang, slow=False)
                with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as fp:
                    tts.save(fp.name)
                    st.audio(fp.name, format="audio/mp3")
        else:
            st.info(f"🗣️ Audio Script: \"{speech_script}\"")

    with col_stats:
        st.markdown("### 📊 बाज़ार भाव विवरण (Market Rates)")
        kpi1, kpi2 = st.columns(2)
        kpi1.metric("आज का भाव (Current Price)", f"₹{data['current_price']:,.0f} / Qtl")
        kpi2.metric(
            "7 दिन बाद अनुमान (Day-7 Forecast)",
            f"₹{data['forecast_day7_price']:,.0f} / Qtl",
            delta=f"{data['price_change_percentage']:+.1f}% (₹{data['price_change_absolute']:+,.0f})"
        )

        st.markdown("---")
        st.markdown("##### 🧮 किसान मुनाफा कैलकुलेटर (Farmer Net Gain)")
        lot_quintals = st.number_input("आपके पास कितनी फसल है? (क्विंटल में)", min_value=1, max_value=5000, value=50, step=5)
        diff_total = (data['forecast_day7_price'] - data['current_price']) * lot_quintals
        if diff_total >= 0:
            st.success(f"💰 7 दिन रोककर बेचने पर संभावित अतिरिक्त फायदा: **+₹{abs(diff_total):,.0f}**")
        else:
            st.error(f"⚠️ 7 दिन देर करने पर संभावित नुकसान: **-₹{abs(diff_total):,.0f}** (तुरंत बेचें)")

    # 7-Day Forecast Interactive Chart
    st.markdown("### 📈 7-दिवसीय मूल्य रुझान चार्ट (7-Day Forecast Trajectory)")
    dates = [f["day_name"][:3] + " (" + f["date"][5:] + ")" for f in data["forecast_series"]]
    preds = [f["predicted_price"] for f in data["forecast_series"]]
    lowers = [f["lower_bound"] for f in data["forecast_series"]]
    uppers = [f["upper_bound"] for f in data["forecast_series"]]

    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=dates, y=uppers, mode='lines', line=dict(width=0),
        showlegend=False, name="Upper Confidence"
    ))
    fig.add_trace(go.Scatter(
        x=dates, y=lowers, mode='lines', line=dict(width=0),
        fill='tonexty', fillcolor='rgba(34, 197, 94, 0.15)',
        name="Confidence Band (विश्वास सीमा)"
    ))
    fig.add_trace(go.Scatter(
        x=dates, y=preds, mode='lines+markers',
        line=dict(color='#15803d', width=4),
        marker=dict(size=8, color='#166534'),
        name="Predicted Price (अनुमानित भाव ₹)"
    ))
    fig.update_layout(
        margin=dict(l=20, r=20, t=30, b=20),
        height=320,
        xaxis_title="तारीख (Date)",
        yaxis_title="भाव (₹ / क्विंटल)",
        plot_bgcolor="#f8fafc",
    )
    st.plotly_chart(fig, use_container_width=True)

st.markdown("---")
st.caption("🌾 Kisan Mandi Bhav Predictor Minor Project | Data modeled from Agmarknet APMC Market Records.")
