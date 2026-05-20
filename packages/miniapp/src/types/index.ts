export interface User {
  id: string;
  telegramId: string;
  firstName: string;
  lastName?: string | null;
  username?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface DiabetesProfile {
  id: string;
  userId: string;
  diabetesType: 'TYPE_1' | 'TYPE_2' | 'GESTATIONAL' | 'OTHER';
  diagnosisDate?: string | null;
  targetGlucoseMin: number;
  targetGlucoseMax: number;
  glucoseUnit: 'MMOL_L' | 'MG_DL';
  doctorName?: string | null;
  doctorContact?: string | null;
  notes?: string | null;
}

export interface BloodSugar {
  id: string;
  userId: string;
  value: number;
  unit: 'MMOL_L' | 'MG_DL';
  measuredAt: string;
  notes?: string | null;
  beforeMeal?: boolean | null;
  afterMeal?: boolean | null;
}

export interface Insulin {
  id: string;
  userId: string;
  insulinType: 'RAPID' | 'SHORT' | 'INTERMEDIATE' | 'LONG' | 'PREMIXED';
  dosage: number;
  units: string;
  injectedAt: string;
  notes?: string | null;
}

export interface Food {
  id: string;
  userId: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  name: string;
  carbohydrates?: number | null;
  calories?: number | null;
  protein?: number | null;
  fat?: number | null;
  eatenAt: string;
  notes?: string | null;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  type: 'MEASUREMENT' | 'MEDICATION' | 'MEAL' | 'CUSTOM';
  frequency: 'DAILY' | 'WEEKLY' | 'CUSTOM';
  time: string;
  daysOfWeek: number[];
  isActive: boolean;
  nextSendAt: string;
}

export interface AnalyticsOverview {
  period: string;
  bloodSugar: { count: number; average: number };
  insulin: { count: number };
  food: { count: number };
}

export interface BloodSugarAnalytics {
  period: string;
  count: number;
  average: number;
  min: number;
  max: number;
  records: BloodSugar[];
}

export interface AnalyticsSummary {
  averageGlucose: number | null;
  minGlucose: number | null;
  maxGlucose: number | null;
  measurementsCount: number;
  inRangeCount: number;
  belowRangeCount: number;
  aboveRangeCount: number;
  inRangePercent: number | null;
  belowRangePercent: number | null;
  aboveRangePercent: number | null;
}

export interface GlucoseChartPoint {
  value: number;
  measuredAt: string;
  context?: string | null;
}

export interface GlucoseChartData {
  targetMin: number;
  targetMax: number;
  points: GlucoseChartPoint[];
}

export interface AnalyticsPattern {
  type: string;
  message: string;
}

export interface AnalyticsPatterns {
  patterns: AnalyticsPattern[];
}

export interface Report {
  id: string;
  userId: string;
  type: string;
  format: string;
  startDate: string;
  endDate: string;
  fileUrl: string;
  fileName: string;
  fileSize: string;
  generatedAt: string;
}