import { Crop, Mandi, PredictionResult, DailyForecast, ActionType } from '../types';

export const CROPS: Crop[] = [
  {
    id: 'maize',
    name: 'Maize (Corn)',
    hindiName: 'मक्का (भुट्टा)',
    maithiliName: 'मकई',
    icon: '🌽',
    category: 'grain',
    typicalMoisture: 14,
    bagSizeKg: 50,
  },
  {
    id: 'paddy',
    name: 'Paddy (Rice)',
    hindiName: 'धान (बासमती/सामान्य)',
    maithiliName: 'धान',
    icon: '🌾',
    category: 'grain',
    typicalMoisture: 17,
    bagSizeKg: 50,
  },
  {
    id: 'wheat',
    name: 'Wheat',
    hindiName: 'गेहूं (कनक)',
    maithiliName: 'गहुम',
    icon: '🌾',
    category: 'grain',
    typicalMoisture: 12,
    bagSizeKg: 50,
  },
  {
    id: 'mustard',
    name: 'Mustard Seeds',
    hindiName: 'सरसों (राई/तोरिया)',
    maithiliName: 'तोरी',
    icon: '🌼',
    category: 'oilseed',
    typicalMoisture: 8,
    bagSizeKg: 50,
  },
  {
    id: 'potato',
    name: 'Potato',
    hindiName: 'आलू (लाल/सफेद)',
    maithiliName: 'आलू',
    icon: '🥔',
    category: 'vegetable',
    typicalMoisture: 75,
    bagSizeKg: 50,
  },
  {
    id: 'onion',
    name: 'Onion',
    hindiName: 'प्याज (नासिक/लोकल)',
    maithiliName: 'पियाज',
    icon: '🧅',
    category: 'vegetable',
    typicalMoisture: 65,
    bagSizeKg: 40,
  },
  {
    id: 'soybean',
    name: 'Soybean',
    hindiName: 'सोयाबीन (पीला)',
    maithiliName: 'सोयाबीन',
    icon: '🌱',
    category: 'oilseed',
    typicalMoisture: 10,
    bagSizeKg: 50,
  },
  {
    id: 'gram',
    name: 'Gram (Chana)',
    hindiName: 'चना (देशी/काबुली)',
    maithiliName: 'चना',
    icon: '🧆',
    category: 'grain',
    typicalMoisture: 10,
    bagSizeKg: 50,
  },
];

export const MANDIS: Mandi[] = [
  {
    id: 'gulabbagh',
    name: 'Gulabbagh Mandi',
    hindiName: 'गुलाबबाग मंडी (पूर्णिया)',
    district: 'Purnea',
    state: 'Bihar',
    distanceKmFromGulabbagh: 0,
    marketType: 'APMC Major',
  },
  {
    id: 'purnea',
    name: 'Purnea City Mandi',
    hindiName: 'पूर्णिया सिटी मंडी',
    district: 'Purnea',
    state: 'Bihar',
    distanceKmFromGulabbagh: 12,
    marketType: 'APMC Secondary',
  },
  {
    id: 'muzaffarpur',
    name: 'Muzaffarpur APMC',
    hindiName: 'मुजफ्फरपुर मंडी',
    district: 'Muzaffarpur',
    state: 'Bihar',
    distanceKmFromGulabbagh: 245,
    marketType: 'APMC Major',
  },
  {
    id: 'patna',
    name: 'Patna (Fatuha Mandi)',
    hindiName: 'पटना (फतुहा मंडी)',
    district: 'Patna',
    state: 'Bihar',
    distanceKmFromGulabbagh: 310,
    marketType: 'APMC Major',
  },
  {
    id: 'bhagalpur',
    name: 'Bhagalpur Mandi',
    hindiName: 'भागलपुर मंडी',
    district: 'Bhagalpur',
    state: 'Bihar',
    distanceKmFromGulabbagh: 92,
    marketType: 'APMC Secondary',
  },
  {
    id: 'samastipur',
    name: 'Samastipur APMC',
    hindiName: 'समस्तीपुर मंडी',
    district: 'Samastipur',
    state: 'Bihar',
    distanceKmFromGulabbagh: 195,
    marketType: 'Sub-Yard',
  },
];

// Market Baseline Matrix
interface MarketConfig {
  basePrice: number;
  trendPct7d: number; // e.g. +6.5% or -4.2%
  volatility: number;
  dailyArrivals: number;
}

const MARKET_MATRIX: Record<string, Record<string, MarketConfig>> = {
  gulabbagh: {
    maize: { basePrice: 2280, trendPct7d: 6.8, volatility: 0.025, dailyArrivals: 4850 },
    paddy: { basePrice: 2160, trendPct7d: -3.8, volatility: 0.020, dailyArrivals: 2100 },
    wheat: { basePrice: 2440, trendPct7d: 4.1, volatility: 0.015, dailyArrivals: 980 },
    mustard: { basePrice: 5380, trendPct7d: 5.5, volatility: 0.028, dailyArrivals: 640 },
    potato: { basePrice: 1250, trendPct7d: -5.2, volatility: 0.045, dailyArrivals: 1800 },
    onion: { basePrice: 2850, trendPct7d: 8.4, volatility: 0.055, dailyArrivals: 1100 },
    soybean: { basePrice: 4420, trendPct7d: 2.1, volatility: 0.022, dailyArrivals: 420 },
    gram: { basePrice: 5900, trendPct7d: 3.5, volatility: 0.018, dailyArrivals: 510 },
  },
  purnea: {
    maize: { basePrice: 2240, trendPct7d: 5.8, volatility: 0.028, dailyArrivals: 2900 },
    paddy: { basePrice: 2140, trendPct7d: -3.2, volatility: 0.021, dailyArrivals: 1350 },
    wheat: { basePrice: 2410, trendPct7d: 3.6, volatility: 0.016, dailyArrivals: 750 },
    mustard: { basePrice: 5310, trendPct7d: 4.8, volatility: 0.030, dailyArrivals: 480 },
    potato: { basePrice: 1220, trendPct7d: -4.8, volatility: 0.042, dailyArrivals: 1400 },
    onion: { basePrice: 2790, trendPct7d: 7.9, volatility: 0.052, dailyArrivals: 890 },
    soybean: { basePrice: 4380, trendPct7d: 1.8, volatility: 0.024, dailyArrivals: 310 },
    gram: { basePrice: 5850, trendPct7d: 3.1, volatility: 0.019, dailyArrivals: 400 },
  },
  muzaffarpur: {
    maize: { basePrice: 2310, trendPct7d: 4.2, volatility: 0.026, dailyArrivals: 2200 },
    paddy: { basePrice: 2190, trendPct7d: -4.1, volatility: 0.023, dailyArrivals: 1900 },
    wheat: { basePrice: 2460, trendPct7d: 3.8, volatility: 0.017, dailyArrivals: 1100 },
    mustard: { basePrice: 5420, trendPct7d: 4.9, volatility: 0.029, dailyArrivals: 590 },
    potato: { basePrice: 1290, trendPct7d: -6.0, volatility: 0.048, dailyArrivals: 2300 },
    onion: { basePrice: 2920, trendPct7d: 8.9, volatility: 0.058, dailyArrivals: 1250 },
    soybean: { basePrice: 4450, trendPct7d: 2.4, volatility: 0.023, dailyArrivals: 360 },
    gram: { basePrice: 5940, trendPct7d: 3.2, volatility: 0.020, dailyArrivals: 480 },
  },
  patna: {
    maize: { basePrice: 2350, trendPct7d: 3.8, volatility: 0.024, dailyArrivals: 1800 },
    paddy: { basePrice: 2220, trendPct7d: -4.5, volatility: 0.025, dailyArrivals: 2600 },
    wheat: { basePrice: 2490, trendPct7d: 4.2, volatility: 0.016, dailyArrivals: 1500 },
    mustard: { basePrice: 5490, trendPct7d: 5.1, volatility: 0.028, dailyArrivals: 780 },
    potato: { basePrice: 1320, trendPct7d: -6.5, volatility: 0.050, dailyArrivals: 3100 },
    onion: { basePrice: 2980, trendPct7d: 9.2, volatility: 0.060, dailyArrivals: 1600 },
    soybean: { basePrice: 4490, trendPct7d: 2.0, volatility: 0.021, dailyArrivals: 410 },
    gram: { basePrice: 6010, trendPct7d: 3.6, volatility: 0.018, dailyArrivals: 620 },
  },
  bhagalpur: {
    maize: { basePrice: 2260, trendPct7d: 5.2, volatility: 0.027, dailyArrivals: 2100 },
    paddy: { basePrice: 2170, trendPct7d: -3.5, volatility: 0.022, dailyArrivals: 1600 },
    wheat: { basePrice: 2430, trendPct7d: 3.9, volatility: 0.018, dailyArrivals: 820 },
    mustard: { basePrice: 5360, trendPct7d: 5.0, volatility: 0.031, dailyArrivals: 490 },
    potato: { basePrice: 1260, trendPct7d: -4.9, volatility: 0.044, dailyArrivals: 1550 },
    onion: { basePrice: 2840, trendPct7d: 8.1, volatility: 0.054, dailyArrivals: 940 },
    soybean: { basePrice: 4400, trendPct7d: 2.2, volatility: 0.024, dailyArrivals: 290 },
    gram: { basePrice: 5880, trendPct7d: 3.3, volatility: 0.021, dailyArrivals: 420 },
  },
  samastipur: {
    maize: { basePrice: 2270, trendPct7d: 5.6, volatility: 0.026, dailyArrivals: 2300 },
    paddy: { basePrice: 2160, trendPct7d: -3.6, volatility: 0.021, dailyArrivals: 1500 },
    wheat: { basePrice: 2430, trendPct7d: 3.7, volatility: 0.017, dailyArrivals: 890 },
    mustard: { basePrice: 5370, trendPct7d: 5.2, volatility: 0.030, dailyArrivals: 520 },
    potato: { basePrice: 1270, trendPct7d: -5.5, volatility: 0.046, dailyArrivals: 1700 },
    onion: { basePrice: 2860, trendPct7d: 8.5, volatility: 0.056, dailyArrivals: 1020 },
    soybean: { basePrice: 4410, trendPct7d: 2.3, volatility: 0.022, dailyArrivals: 340 },
    gram: { basePrice: 5910, trendPct7d: 3.4, volatility: 0.019, dailyArrivals: 470 },
  },
};

const DAY_NAMES_HI = ['सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार', 'रविवार'];
const DAY_NAMES_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function calculateForecast(mandiId: string, cropId: string): PredictionResult {
  const mandi = MANDIS.find((m) => m.id === mandiId) || MANDIS[0];
  const crop = CROPS.find((c) => c.id === cropId) || CROPS[0];

  const marketConfig =
    MARKET_MATRIX[mandiId]?.[cropId] ||
    MARKET_MATRIX['gulabbagh']['maize'];

  const { basePrice, trendPct7d, volatility, dailyArrivals } = marketConfig;
  const now = new Date();

  // 14 days historical simulation
  const historicalPrices: { date: string; price: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayNoise = Math.sin(i * 1.5) * (basePrice * 0.012);
    const histP = Math.round(basePrice - (trendPct7d / 14) * i * (basePrice / 100) + dayNoise);
    historicalPrices.push({
      date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      price: histP,
    });
  }

  // Recursive 7-day multi-step prediction
  const forecastSeries: DailyForecast[] = [];
  let movingPrice = basePrice;
  const dailyDrift = (trendPct7d / 100) / 7;

  for (let step = 1; step <= 7; step++) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + step);
    const dayOfWeek = targetDate.getDay();
    const dayIndex = (dayOfWeek + 6) % 7; // Monday = 0

    // Small momentum effect + day noise
    const stepNoise = Math.sin(step * 1.8) * (basePrice * volatility * 0.4);
    movingPrice = movingPrice * (1 + dailyDrift) + stepNoise;

    const roundPrice = Math.round(movingPrice);
    const margin = Math.round(movingPrice * 0.02 * Math.sqrt(step));

    forecastSeries.push({
      dayIndex: step,
      dateStr: targetDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      dayName: DAY_NAMES_EN[dayIndex],
      dayNameHi: DAY_NAMES_HI[dayIndex],
      predictedPrice: roundPrice,
      lowerBound: roundPrice - margin,
      upperBound: roundPrice + margin,
      arrivalsEstimated: Math.round(dailyArrivals * (1 - dailyDrift * 2.5)),
    });
  }

  const forecastDay7Price = forecastSeries[forecastSeries.length - 1].predictedPrice;
  const priceChangeAbs = forecastDay7Price - basePrice;
  const priceChangePct = parseFloat(((priceChangeAbs / basePrice) * 100).toFixed(1));

  let action: ActionType = 'STABLE';
  if (priceChangePct >= 2.5) {
    action = 'HOLD';
  } else if (priceChangePct <= -2.5) {
    action = 'SELL';
  }

  // Create human and voice advisories
  let actionTitleHi = '';
  let actionTitleEn = '';
  let actionTitleMai = '';
  let reasonHi = '';
  let reasonEn = '';
  let reasonMai = '';
  let audioSpeechHi = '';
  let audioSpeechEn = '';
  let audioSpeechMai = '';
  let urgency: 'high' | 'medium' | 'low' = 'low';
  let optimalSaleDay = 7;

  if (action === 'HOLD') {
    urgency = 'high';
    actionTitleHi = 'फसल रोकें (स्टॉक बचाकर रखें)';
    actionTitleEn = 'HOLD PRODUCE (Wait for Price Surge)';
    actionTitleMai = 'माल रोकि कय राखू (अखनि नहि बेची)';
    optimalSaleDay = 5;

    reasonHi = `गुलाबबाग व क्षेत्रीय मंडियों में आवक कम होने से अगले 7 दिनों में भाव ₹${Math.abs(priceChangeAbs)}/क्विंटल (+${priceChangePct}%) बढ़ने की प्रबल संभावना है। 4 से 6 दिन रुकने पर भारी लाभ होगा।`;
    reasonEn = `Due to tightening arrivals and robust mill demand, prices are projected to rise by ₹${Math.abs(priceChangeAbs)}/Qtl (+${priceChangePct}%). Holding stock for 5-7 days maximizes return.`;
    reasonMai = `मंडी मे आवक कम रहय स' आबय वला 7 दिन मे दर ₹${Math.abs(priceChangeAbs)} प्रति क्विंटल (+${priceChangePct}%) बढ़य के संभावना अछि। 4-5 दिन रोकि कय बेचिब त' बेसी मुनाफा होयत।`;

    audioSpeechHi = `राम राम किसान भाई! ${mandi.hindiName} में ${crop.hindiName} का भाव आज ₹${basePrice} है, जो अगले 7 दिनों में बढ़कर लगभग ₹${forecastDay7Price} प्रति क्विंटल होने का अनुमान है। यानी ₹${Math.abs(priceChangeAbs)} का सीधा फायदा। हमारी सलाह है कि अभी फसल न बेचें और 5 दिन बाद ऊंचे दाम पर बेचें।`;
    audioSpeechEn = `Attention farmer friends! Current price for ${crop.name} at ${mandi.name} is ₹${basePrice} per quintal. Machine learning models forecast prices reaching ₹${forecastDay7Price} in 7 days, a rise of ₹${Math.abs(priceChangeAbs)}. We recommend holding your produce.`;
    audioSpeechMai = `प्रणाम किसान भाई! ${mandi.hindiName} मे ${crop.maithiliName} के भाव अखन ₹${basePrice} टका अछि, जे 7 दिन मे बढ़ि क' ₹${forecastDay7Price} क्विंटल भ' जायत। माल अखन रोकि कय राखू, नीक फायदा भेटत।`;
  } else if (action === 'SELL') {
    urgency = 'high';
    actionTitleHi = 'तुरंत बेचें (मंडी ले जाएं)';
    actionTitleEn = 'SELL IMMEDIATELY (Prevent Price Drop)';
    actionTitleMai = 'झटपट बेची (मंडी ल\' जाउ)';
    optimalSaleDay = 1;

    reasonHi = `नई कटाई की भारी आवक से भाव ₹${Math.abs(priceChangeAbs)}/क्विंटल (${priceChangePct}%) गिरने की आशंका है। नुकसान से बचने के लिए आज या कल में ही बेचें।`;
    reasonEn = `Heavy market supply glut expected to drag prices down by ₹${Math.abs(priceChangeAbs)}/Qtl (${priceChangePct}%). Selling right now protects your profit margin.`;
    reasonMai = `मंडी मे बेसी फसल आबय स' दर ₹${Math.abs(priceChangeAbs)} क्विंटल खसय के डर अछि। नुकसानी स' बचय लेल आजुक-काल्हि मे फसल बेचि दियौ।`;

    audioSpeechHi = `सतर्क रहें किसान भाई! ${mandi.hindiName} में ${crop.hindiName} की आवक तेजी से बढ़ रही है। 7 दिनों में भाव गिरकर ₹${forecastDay7Price} हो सकता है। घाटे से बचने के लिए अपनी उपज तुरंत मंडी ले जाकर आज ही बेचें।`;
    audioSpeechEn = `Warning to farmers! Heavy arrivals at ${mandi.name} are expected to pull ${crop.name} rates down to ₹${forecastDay7Price}. We strongly advise selling your harvest immediately to avoid losses.`;
    audioSpeechMai = `सावधान रहू किसान भाई! ${mandi.hindiName} मे ${crop.maithiliName} के दर खसि क' ₹${forecastDay7Price} भ' सकैत अछि। तुरंते मंडी जा क' माल बेचि दियौ।`;
  } else {
    urgency = 'medium';
    actionTitleHi = 'निगरानी रखें (स्थिर भाव)';
    actionTitleEn = 'MONITOR / RANGE BOUND (Balanced)';
    actionTitleMai = 'ताक-झांक राखू (दर स्थिर अछि)';
    optimalSaleDay = 3;

    reasonHi = `भाव अगले हफ्ते केवल ±₹${Math.abs(priceChangeAbs)}/क्विंटल के दायरे में सीमित रहेगा। अपनी नकदी की आवश्यकता और भंडारण क्षमता अनुसार निर्णय लें।`;
    reasonEn = `Market prices are moving sideways in a narrow channel. Liquidate based on warehouse storage costs and immediate cash obligations.`;
    reasonMai = `दर मे कोनो खास बढ़त या गिरावट नहि अछि। अपन सुविधा आ रूपैया के जरूरत मुताबिक फैसला लिय।`;

    audioSpeechHi = `किसान भाई, ${mandi.hindiName} में ${crop.hindiName} का भाव लगभग स्थिर रहेगा। दर ₹${basePrice} के करीब ही बना रहेगा। अपनी सुविधा के अनुसार फसल बेच सकते हैं।`;
    audioSpeechEn = `Farmer advisory: ${crop.name} price at ${mandi.name} is stable at around ₹${basePrice} per quintal. Proceed with selling as per your household requirements.`;
    audioSpeechMai = `${mandi.hindiName} मे ${crop.maithiliName} के दर स्थिर अछि। अपन जरूरत मुताबिक फैसला क' सकैत छी।`;
  }

  return {
    mandi,
    crop,
    currentPrice: basePrice,
    minPrice: Math.round(basePrice * 0.95),
    maxPrice: Math.round(basePrice * 1.05),
    todayArrivals: dailyArrivals,
    forecastDay7Price,
    priceChangeAbs,
    priceChangePct,
    advisory: {
      action,
      actionTitleHi,
      actionTitleEn,
      actionTitleMai,
      reasonHi,
      reasonEn,
      reasonMai,
      audioSpeechHi,
      audioSpeechEn,
      audioSpeechMai,
      urgency,
      optimalSaleDay,
    },
    forecastSeries,
    historicalPrices,
    modelConfidence: 91.4,
    qualityMoistureImpact: {
      recommendedMoisture: crop.typicalMoisture,
      priceDeductionPerPct: crop.category === 'grain' ? 35 : 45,
    },
  };
}
