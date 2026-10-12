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
st.sidebar.markdown("### 📡 डेटा स्रोत स्थिति (Data Feed)")
refresh_data = st.sidebar.button("🔄 लाइव मंडी भाव रिफ्रेश करें (Refresh)")

st.sidebar.markdown("### 🎙️ आवाज़ से पूछें (Voice Assistant)")
voice_query = st.sidebar.text_input(
    "या यहाँ टाइप करें / Or speak query:",
    placeholder="जैसे: आज गुलाबबाग में मक्का का भाव क्या है?"
)

# Header
st.markdown('<div class="main-title">🌾 किसान मंडी भाव और आवाज़ सलाहकार</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-title">Kisan Mandi Bhav Predictor & 7-Day ML Price Forecasting System</div>', unsafe_allow_html=True)

# Fetch prediction from backend API or dynamic fallback engine
API_URL = "http://localhost:8000/predict"
data = None

try:
    response = requests.get(
        API_URL,
        params={"crop": selected_crop, "mandi": selected_mandi, "refresh": refresh_data},
        timeout=3.5
    )
    if response.status_code == 200:
        data = response.json()
except Exception:
    # Standalone dynamic retrieval with resilient CSV fallback
    from src.live_data_fetcher import get_dynamic_mandi_data
    from app import simulate_xgboost_forecast, SUPPORTED_CROPS, generate_advisory

    dyn = get_dynamic_mandi_data(selected_crop, selected_mandi, force_refresh=refresh_data)
    base_price = float(dyn["modal_price"])
    trend = float(dyn.get("trend", 0.045))
    volatility = float(dyn.get("volatility", 0.028))

    forecasts, day7 = simulate_xgboost_forecast(base_price, trend, volatility)
    abs_chg = day7 - base_price
    pct_chg = (abs_chg / base_price) * 100
    crop_meta = SUPPORTED_CROPS.get(selected_crop, {"hi": "मक्का", "icon": "🌽", "maithili": "मकई"})
    advisory = generate_advisory(
        crop_meta["hi"], selected_crop.capitalize(), crop_meta["maithili"],
        pct_chg, abs_chg, selected_mandi_label, base_price, day7
    )
    data = {
        "mandi_name": selected_mandi_label,
        "crop_name": crop_meta["hi"],
        "crop_icon": crop_meta["icon"],
        "current_price": base_price,
        "min_price": round(float(dyn.get("min_price", base_price * 0.96)), 2),
        "max_price": round(float(dyn.get("max_price", base_price * 1.04)), 2),
        "today_arrivals": float(dyn.get("arrivals", 3200)),
        "forecast_day7_price": round(day7, 2),
        "price_change_absolute": round(abs_chg, 2),
        "price_change_percentage": round(pct_chg, 2),
        "trend_direction": "UP" if pct_chg >= 2.5 else ("DOWN" if pct_chg <= -2.5 else "STABLE"),
        "advisory": advisory.dict(),
        "forecast_series": [f.dict() for f in forecasts],
        "data_source": dyn["source"],
        "is_live_data": dyn["is_live"],
        "arrival_date": dyn.get("arrival_date", ""),
        "data_note": dyn.get("note", ""),
    }

if data:
    # Live data badge
    is_live = data.get("is_live_data", False)
    badge_color = "#16a34a" if is_live else "#d97706"
    badge_label = "🟢 लाइव APMC मंडी डेटा (data.gov.in Live API)" if is_live else f"📦 बैकअप डेटा: Agmarknet ऐतिहासिक रिकॉर्ड ({data.get('data_note', 'Offline Resilient')})"
    st.markdown(f"""
    <div style="display:inline-block; padding: 4px 12px; border-radius: 9999px; background: {badge_color}18; border: 1px solid {badge_color}50; color: {badge_color}; font-size: 0.85rem; font-weight: 700; margin-bottom: 1rem;">
        {badge_label} · तारीख: {data.get('arrival_date', 'आज')}
    </div>
    """, unsafe_allow_html=True)

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

        # Audio Output with Dynamic Language Synchronization
        lang_title = "हिन्दी आवाज़" if current_lang == "hi" else ("मैथिली आवाज़" if current_lang == "mai" else "English Voice")
        st.markdown(f"#### 🔊 {lang_title} में सुनें (Listen in Audio)")
        
        speech_script = (
            adv.get("audio_script_hi", "") if current_lang == "hi"
            else (adv.get("audio_script_maithili", adv.get("audio_script_hi", "")) if current_lang == "mai"
            else adv.get("audio_script_en", ""))
        )
        
        # Display clean script preview
        st.caption(f"🗣️ *\"{speech_script}\"*")
        
        audio_played = False
        if HAS_GTTS:
            btn_label = f"▶️ {lang_title} सुनें (Play Audio Voice)"
            if st.button(btn_label, key=f"audio_btn_{current_lang}"):
                tts_lang = "hi" if current_lang in ["hi", "mai"] else "en"
                try:
                    # Use Indian English tld for familiar accent when English is picked
                    tld = "co.in" if tts_lang == "en" else "com"
                    tts = gTTS(text=speech_script, lang=tts_lang, tld=tld, slow=False)
                    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as fp:
                        tts.save(fp.name)
                        st.audio(fp.name, format="audio/mp3", autoplay=True)
                        audio_played = True
                except Exception as e:
                    st.warning(f"Audio generation fallback: {str(e)}")
        
        if not audio_played:
            # HTML5 Browser Speech Synthesis Button Integration
            escaped_text = speech_script.replace('"', '&quot;').replace("'", "&#39;")
            synth_lang = "hi-IN" if current_lang in ["hi", "mai"] else "en-US"
            st.components.v1.html(
                f"""
                <button onclick="speak()" style="background-color:#15803d; color:white; border:none; padding:10px 16px; border-radius:10px; font-weight:bold; cursor:pointer; font-size:14px; margin-top:5px; display:flex; align-items:center; gap:6px;">
                    🔊 ब्राउज़र आवाज़ में सुनें ({lang_title})
                </button>
                <script>
                function speak() {{
                    window.speechSynthesis.cancel();
                    const u = new SpeechSynthesisUtterance("{escaped_text}");
                    u.lang = "{synth_lang}";
                    u.rate = 0.88;
                    window.speechSynthesis.speak(u);
                }}
                </script>
                """,
                height=55,
            )

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
