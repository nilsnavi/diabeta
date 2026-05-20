export interface PlanFeatures {
  historyDays: number | null; // null = unlimited
  maxReminders: number;
  pdfReports: boolean;
  excelReports: boolean;
  csvExport: boolean;
  aiAssistant: boolean;
  advancedAnalytics: boolean;
  familyAccess: boolean;
  foodDatabase: boolean;
}

export const PLANS: Record<string, PlanFeatures> = {
  FREE: {
    historyDays: 14,
    maxReminders: 3,
    pdfReports: false,
    excelReports: false,
    csvExport: true,
    aiAssistant: false,
    advancedAnalytics: false,
    familyAccess: false,
    foodDatabase: false,
  },
  PREMIUM: {
    historyDays: null,
    maxReminders: 20,
    pdfReports: true,
    excelReports: true,
    csvExport: true,
    aiAssistant: true,
    advancedAnalytics: true,
    familyAccess: true,
    foodDatabase: true,
  },
};

export const PREMIUM_PRICE_RUB = 299;
export const PREMIUM_DURATION_DAYS = 30;