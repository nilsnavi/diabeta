// User types
export interface User {
  id: string;
  telegramId: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  languageCode?: string | null;
  timezone?: string | null;
  diabetesType?: DiabetesType | null;
  glucoseUnit?: GlucoseUnit;
  targetGlucoseMin?: number | null;
  targetGlucoseMax?: number | null;
  carbsPerBreadUnit?: number | null;
  usesInsulin?: boolean;
  usesMedications?: boolean;
  usesCgm?: boolean;
  onboardingCompleted?: boolean;
  acceptedTermsAt?: string | null;
  acceptedPrivacyAt?: string | null;
  acceptedHealthDataConsentAt?: string | null;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type DiabetesType = 'TYPE_1' | 'TYPE_2' | 'GESTATIONAL' | 'OTHER';
export type GlucoseUnit = 'MMOL_L' | 'MG_DL';

// Glucose types
export interface GlucoseEntry {
  id: string;
  userId: string;
  value: number;
  measuredAt: string;
  context?: string | null;
  comment?: string | null;
  createdAt: string;
}

export type GlucoseContext = 'before_meal' | 'after_meal' | 'bedtime' | 'fasting' | 'other';

// Insulin types
export interface InsulinEntry {
  id: string;
  userId: string;
  dose: number;
  insulinType: InsulinType;
  administeredAt: string;
  comment?: string | null;
  createdAt: string;
}

export type InsulinType = 'bolus' | 'basal' | 'correction';

// Meal types
export interface FoodItem {
  name: string;
  carbs: number;
  proteins: number;
  fats: number;
  calories: number;
}

export interface MealEntry {
  id: string;
  userId: string;
  eatenAt: string;
  foodItems: FoodItem[];
  totalCarbs: number;
  totalProteins: number;
  totalFats: number;
  totalCalories: number;
  breadUnits?: number;
  isFavorite: boolean;
  comment?: string | null;
  createdAt: string;
}

// Feeling types
export interface FeelingEntry {
  id: string;
  userId: string;
  recordedAt: string;
  mood?: string | null;
  symptoms?: string[];
  energyLevel?: number | null;
  stressLevel?: number | null;
  comment?: string | null;
  createdAt: string;
}

// Activity types
export interface ActivityEntry {
  id: string;
  userId: string;
  activityType: string;
  duration: number; // minutes
  intensity?: 'low' | 'medium' | 'high';
  caloriesBurned?: number;
  recordedAt: string;
  comment?: string | null;
  createdAt: string;
}

// Reminder types
export interface Reminder {
  id: string;
  userId: string;
  title: string;
  time: string; // "08:00"
  frequency: ReminderFrequency;
  daysOfWeek?: number[];
  enabled: boolean;
  nextRunAt: string;
  snoozedUntil?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

export type ReminderFrequency = 'daily' | 'weekly' | 'once';

// Analytics types
export interface AnalyticsSummary {
  average: number | null;
  min: number | null;
  max: number | null;
  totalReadings: number;
  inRangePercentage: number;
  belowRangePercentage: number;
  aboveRangePercentage: number;
  period: string;
}

export interface ChartDataPoint {
  time: string;
  value: number;
  timestamp: string;
}

// Report types
export interface ReportJob {
  id: string;
  userId: string;
  status: ReportStatus;
  period: string;
  startDate: string;
  endDate: string;
  fileUrl?: string | null;
  error?: string | null;
  createdAt: string;
  completedAt?: string | null;
}

export type ReportStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Timeline types
export interface TimelineItem {
  id: string;
  type: 'glucose' | 'insulin' | 'meal' | 'feeling' | 'activity';
  title: string;
  subtitle?: string;
  value?: number;
  unit?: string;
  time: string;
  icon: string;
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple';
}

// Legal types
export interface LegalDocument {
  id: string;
  title: string;
  version: string;
  content: string;
  type: LegalDocumentType;
}

export type LegalDocumentType = 'terms' | 'privacy' | 'personal_data' | 'health_data';

export interface UserLegalStatus {
  acceptedTermsAt?: string | null;
  acceptedPrivacyAt?: string | null;
  acceptedHealthDataConsentAt?: string | null;
}
