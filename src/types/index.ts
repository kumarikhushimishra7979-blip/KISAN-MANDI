export type Language = 'hi' | 'en' | 'mai';

export interface Crop {
  id: string;
  name: string;
  hindiName: string;
  maithiliName: string;
  icon: string;
  category: 'grain' | 'cash_crop' | 'oilseed' | 'vegetable';
  typicalMoisture: number; // in percentage
  bagSizeKg: number;
}

export interface Mandi {
  id: string;
  name: string;
  hindiName: string;
  district: string;
  state: string;
  distanceKmFromGulabbagh: number;
  marketType: 'APMC Major' | 'APMC Secondary' | 'Sub-Yard';
}

export interface DailyForecast {
  dayIndex: number;
  dateStr: string;
  dayName: string;
  dayNameHi: string;
  predictedPrice: number;
  lowerBound: number;
  upperBound: number;
  arrivalsEstimated: number;
}

export type ActionType = 'HOLD' | 'SELL' | 'STABLE';

export interface AdvisoryDetails {
  action: ActionType;
  actionTitleHi: string;
  actionTitleEn: string;
  actionTitleMai: string;
  reasonHi: string;
  reasonEn: string;
  reasonMai: string;
  audioSpeechHi: string;
  audioSpeechEn: string;
  audioSpeechMai: string;
  urgency: 'high' | 'medium' | 'low';
  optimalSaleDay: number;
}

export interface PredictionResult {
  mandi: Mandi;
  crop: Crop;
  currentPrice: number;
  minPrice: number;
  maxPrice: number;
  todayArrivals: number;
  forecastDay7Price: number;
  priceChangeAbs: number;
  priceChangePct: number;
  advisory: AdvisoryDetails;
  forecastSeries: DailyForecast[];
  historicalPrices: { date: string; price: number }[];
  modelConfidence: number;
  dataSource?: 'live_apmc_api' | 'historical_agmarknet_fallback';
  isLiveData?: boolean;
  arrivalDate?: string;
  dataNote?: string;
  lastRefreshed?: string;
  qualityMoistureImpact: {
    recommendedMoisture: number;
    priceDeductionPerPct: number;
  };
}
