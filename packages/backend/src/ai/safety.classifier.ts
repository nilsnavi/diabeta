export type SafetyCategory =
  | 'dose_request'
  | 'emergency_symptoms'
  | 'medication_change'
  | 'diagnosis_request'
  | 'safe';

const PATTERNS: { category: SafetyCategory; patterns: RegExp[] }[] = [
  {
    category: 'dose_request',
    patterns: [
      /доз[аеуию]/i,
      /сколько.*инсулин/i,
      /инсулин.*сколько/i,
      /how much.*insulin/i,
      /insulin.*dose/i,
      /units? of insulin/i,
      /единиц.*инсулин/i,
    ],
  },
  {
    category: 'emergency_symptoms',
    patterns: [
      /потер[ял].*сознани/i,
      /не могу дышать/i,
      /очень плохо/i,
      /срочно помог/i,
      /скорую/i,
      /умираю/i,
      /сильна[яе] боль/i,
      /chest pain/i,
      /can't breathe/i,
      /unconscious/i,
      /emergency/i,
    ],
  },
  {
    category: 'medication_change',
    patterns: [
      /отмен[ия]ть.*препарат/i,
      /перестать принимать/i,
      /прекратить.*лечение/i,
      /stop taking/i,
      /cancel.*medication/i,
      /сменить.*препарат/i,
      /change.*medication/i,
      /switch.*drug/i,
    ],
  },
  {
    category: 'diagnosis_request',
    patterns: [
      /у меня.*диабет/i,
      /есть ли у меня/i,
      /поставь диагноз/i,
      /do I have diabetes/i,
      /diagnose me/i,
      /what disease/i,
      /какая болезнь/i,
    ],
  },
];

export function classifyMessage(text: string): SafetyCategory {
  for (const { category, patterns } of PATTERNS) {
    if (patterns.some((p) => p.test(text))) {
      return category;
    }
  }
  return 'safe';
}

export function isSafeCategory(category: SafetyCategory): boolean {
  return category === 'safe';
}

export function getSafeResponse(category: SafetyCategory): string {
  switch (category) {
    case 'dose_request':
      return 'Я не могу рекомендовать дозировки инсулина или препаратов — это может быть опасно. Пожалуйста, обратитесь к вашему врачу или эндокринологу для подбора дозы.';
    case 'emergency_symptoms':
      return 'Это звучит как серьёзная ситуация. Пожалуйста, немедленно обратитесь за медицинской помощью — вызовите скорую помощь (103) или обратитесь в ближайшее отделение экстренной помощи.';
    case 'medication_change':
      return 'Изменение или отмена препаратов должны обсуждаться только с вашим лечащим врачом. Пожалуйста, не меняйте схему лечения самостоятельно — это может быть опасно.';
    case 'diagnosis_request':
      return 'Я не могу ставить диагнозы — это задача врача. Если вас беспокоит ваше здоровье, запишитесь на приём к эндокринологу или терапевту.';
    default:
      return 'Пожалуйста, обратитесь к врачу.';
  }
}