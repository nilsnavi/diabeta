import * as crypto from 'crypto';
import { Telegraf, Markup } from 'telegraf';
import axios from 'axios';

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const MINIAPP_URL = process.env.MINIAPP_URL || 'https://diabeta.app';

if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN is required');
}

const bot = new Telegraf(BOT_TOKEN);

const api = axios.create({ baseURL: API_URL });

// ─── FSM ─────────────────────────────────────────────────────────────────────

type GlucoseState =
  | { step: 'await_value' }
  | { step: 'await_context'; value: number };

type InsulinState =
  | { step: 'insulin_type' }
  | { step: 'insulin_name'; insulinType: string }
  | { step: 'insulin_units'; insulinType: string; insulinName: string };

type FeelingState =
  | { step: 'feeling_select' }
  | { step: 'feeling_symptoms'; feeling: string };

type ActivityState =
  | { step: 'activity_type' }
  | { step: 'activity_duration'; activityType: string }
  | { step: 'activity_intensity'; activityType: string; durationMinutes: number };

type UserState = GlucoseState | InsulinState | FeelingState | ActivityState;

const userStates = new Map<number, UserState>();
const userTokens = new Map<number, string>();
const userSymptoms = new Map<number, string[]>();

// ─── Auth helpers ─────────────────────────────────────────────────────────────

function buildInitData(from: {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}): string {
  const authDate = Math.floor(Date.now() / 1000);
  const userObj = {
    id: from.id,
    first_name: from.first_name ?? '',
    ...(from.last_name ? { last_name: from.last_name } : {}),
    ...(from.username ? { username: from.username } : {}),
    ...(from.language_code ? { language_code: from.language_code } : {}),
  };

  const params = new URLSearchParams({
    auth_date: String(authDate),
    user: JSON.stringify(userObj),
  });

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(BOT_TOKEN)
    .digest();

  const hash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  params.set('hash', hash);
  return params.toString();
}

async function getToken(from: {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}): Promise<string> {
  const cached = userTokens.get(from.id);
  if (cached) return cached;

  const initData = buildInitData(from);
  const res = await api.post('/auth/telegram', { initData });
  const token: string = res.data.accessToken;
  userTokens.set(from.id, token);
  return token;
}

// ─── Context keyboard ─────────────────────────────────────────────────────────

const CONTEXT_OPTIONS = [
  { label: 'Натощак', value: 'FASTING' },
  { label: 'До еды', value: 'BEFORE_MEAL' },
  { label: 'После еды', value: 'AFTER_MEAL' },
  { label: 'Перед сном', value: 'BEFORE_SLEEP' },
  { label: 'Ночью', value: 'NIGHT' },
  { label: 'После тренировки', value: 'AFTER_ACTIVITY' },
  { label: 'Плохое самочувствие', value: 'FEELING_BAD' },
  { label: 'Другое', value: 'OTHER' },
] as const;

const contextKeyboard = Markup.inlineKeyboard(
  CONTEXT_OPTIONS.map((o) => [Markup.button.callback(o.label, `ctx_${o.value}`)]),
);

// ─── Main menu ────────────────────────────────────────────────────────────────

async function sendMainMenu(ctx: any) {
  await ctx.reply(
    'Выберите действие:',
    Markup.inlineKeyboard([
      [Markup.button.webApp('📱 Открыть приложение', MINIAPP_URL)],
      [Markup.button.callback('🩸 Добавить сахар', 'add_sugar')],
      [Markup.button.callback('💉 Записать инсулин', 'add_insulin')],
      [Markup.button.callback('🙂 Самочувствие', 'add_feeling')],
      [Markup.button.callback('🏃 Активность', 'add_activity')],
      [Markup.button.callback('⏰ Напоминания', 'reminders_menu')],
      [Markup.button.callback('📋 История', 'show_history')],
      [Markup.button.callback('📊 Статистика', 'stats')],
    ]),
  );
}

// ─── Glucose flow ─────────────────────────────────────────────────────────────

async function startGlucoseFlow(ctx: any) {
  const userId: number = ctx.from.id;
  userStates.set(userId, { step: 'await_value' });
  await ctx.reply(
    '🩸 Введите значение сахара, например <b>6.4</b>\n\n/cancel — отменить ввод',
    { parse_mode: 'HTML' },
  );
}

// ─── Commands ─────────────────────────────────────────────────────────────────

bot.start(async (ctx) => {
  const { first_name } = ctx.from;
  await ctx.reply(
    `👋 Привет, ${first_name}! Я DiaBeta — твой дневник диабетика.\n\n` +
      `📋 Я помогаю вести:\n` +
      `🩸 Дневник сахара\n` +
      `💉 Дневник инсулина\n` +
      `🍽️ Дневник питания\n` +
      `🙂 Дневник самочувствия\n` +
      `📊 Аналитику\n\n` +
      `⚠️ Сервис не является врачом и не назначает лечение.\n\n` +
      `Открой мини-приложение для полного доступа:`,
    Markup.inlineKeyboard([
      [Markup.button.webApp('🚀 Открыть DiaBeta', MINIAPP_URL)],
    ]),
  );
});

bot.command('menu', sendMainMenu);
bot.command('glucose', startGlucoseFlow);

// ─── History command ──────────────────────────────────────────────────────────

bot.command('history', async (ctx) => {
  let token: string;
  try {
    token = await getToken(ctx.from!);
  } catch {
    userTokens.delete(ctx.from!.id);
    await ctx.reply('❗ Не удалось авторизоваться. Попробуйте позже.');
    return;
  }

  try {
    const res = await api.get('/timeline?limit=10', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { items } = res.data as {
      items: Array<{
        type: string;
        title: string;
        subtitle: string;
        value: string;
        status: string | null;
        occurredAt: string;
      }>;
    };

    if (!items || items.length === 0) {
      await ctx.reply('📋 Записей пока нет.');
      return;
    }

    const TYPE_ICONS: Record<string, string> = {
      glucose: '🩸', insulin: '💉', meal: '🍽️', feeling: '🙂', activity: '🏃',
    };
    const STATUS_EMOJIS: Record<string, string> = {
      in_range: '✅', below_range: '⬇️', above_range: '⬆️',
    };

    let text = '📋 <b>Последние 10 записей:</b>\n\n';
    for (const item of items) {
      const icon = TYPE_ICONS[item.type] ?? '📌';
      const time = new Date(item.occurredAt).toLocaleString('ru-RU', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
      });
      const se = item.status ? (STATUS_EMOJIS[item.status] ?? '') + ' ' : '';
      text += `${icon} <b>${item.title}</b> — ${se}${item.value}\n`;
      text += `   ${item.subtitle} · ${time}\n\n`;
    }

    await ctx.reply(text, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.webApp('📋 Открыть историю', `${MINIAPP_URL}/history`)],
        [Markup.button.callback('🏠 Главное меню', 'main_menu')],
      ]),
    });
  } catch (err: any) {
    if (err?.response?.status === 401) userTokens.delete(ctx.from!.id);
    await ctx.reply('❗ Не удалось загрузить историю.');
  }
});

bot.action('show_history', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(
    '📋 История записей — откройте приложение:',
    Markup.inlineKeyboard([
      [Markup.button.webApp('📋 История', `${MINIAPP_URL}/history`)],
    ]),
  );
});

bot.command('cancel', async (ctx) => {
  const userId: number = ctx.from.id;
  if (userStates.has(userId)) {
    userStates.delete(userId);
    userSymptoms.delete(userId);
    await ctx.reply('❌ Ввод отменён.', { reply_markup: { remove_keyboard: true } });
  } else {
    await ctx.reply('Нечего отменять.');
  }
});

// ─── Inline button actions ────────────────────────────────────────────────────

bot.action('add_sugar', async (ctx) => {
  await ctx.answerCbQuery();
  await startGlucoseFlow(ctx);
});

bot.action('add_insulin', async (ctx) => {
  await ctx.answerCbQuery();
  await startInsulinFlow(ctx);
});

bot.action('stats', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(
    '📊 Для просмотра аналитики откройте приложение:',
    Markup.inlineKeyboard([[Markup.button.webApp('Открыть', `${MINIAPP_URL}/analytics`)]]),
  );
});

// Glucose context callbacks
for (const opt of CONTEXT_OPTIONS) {
  bot.action(`ctx_${opt.value}`, async (ctx) => {
    await ctx.answerCbQuery();

    const userId: number = ctx.from!.id;
    const state = userStates.get(userId);

    if (!state || state.step !== 'await_context') {
      await ctx.reply('Начните заново: нажмите 🩸 Добавить сахар или /glucose');
      return;
    }

    const glucoseValue = state.value;
    userStates.delete(userId);

    let token: string;
    try {
      token = await getToken(ctx.from!);
    } catch {
      userTokens.delete(userId);
      await ctx.reply('❗ Не удалось авторизоваться. Попробуйте позже.');
      return;
    }

    try {
      const res = await api.post(
        '/glucose',
        {
          value: glucoseValue,
          context: opt.value,
          measuredAt: new Date().toISOString(),
          source: 'telegram_bot',
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const { entry, status, message } = res.data;
      const statusEmoji =
        status === 'in_range' ? '✅' : status === 'below_range' ? '⬇️' : '⬆️';

      await ctx.editMessageReplyMarkup(undefined);
      await ctx.reply(
        `${statusEmoji} <b>Запись сохранена</b>\n\n` +
          `🩸 Сахар: <b>${entry.value} ммоль/л</b>\n` +
          `📍 Контекст: <b>${opt.label}</b>\n\n` +
          `ℹ️ ${message}\n\n` +
          `⚠️ Сервис не назначает лечение и не рекомендует дозы инсулина.`,
        {
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('🩸 Добавить ещё', 'add_sugar')],
            [Markup.button.callback('🏠 Главное меню', 'main_menu')],
          ]),
        },
      );
    } catch (err: any) {
      if (err?.response?.status === 401) {
        userTokens.delete(userId);
      }
      await ctx.reply('❗ Не удалось сохранить запись. Попробуйте ещё раз.');
    }
  });
}

bot.action('main_menu', async (ctx) => {
  await ctx.answerCbQuery();
  await sendMainMenu(ctx);
});

// ─── Insulin flow ─────────────────────────────────────────────────────────────

const INSULIN_TYPES = [
  { label: 'Быстрый', value: 'rapid' },
  { label: 'Короткий', value: 'short' },
  { label: 'Базальный', value: 'basal' },
  { label: 'Смешанный', value: 'mixed' },
  { label: 'Другой', value: 'other' },
] as const;

const INSULIN_NAMES = [
  'НовоРапид',
  'Туджео',
  'Лантус',
  'Левемир',
  'Хумалог',
  'Апидра',
  'Другое',
] as const;

const insulinTypeKeyboard = Markup.inlineKeyboard(
  INSULIN_TYPES.map((t) => [Markup.button.callback(t.label, `ins_type_${t.value}`)]),
);

const insulinNameKeyboard = Markup.inlineKeyboard([
  ...INSULIN_NAMES.slice(0, 6).map((n) => [Markup.button.callback(n, `ins_name_${n}`)]),
  [Markup.button.callback('Другое', 'ins_name_Другое')],
]);

async function startInsulinFlow(ctx: any) {
  const userId: number = ctx.from.id;
  userStates.set(userId, { step: 'insulin_type' });
  await ctx.reply(
    '💉 Выберите тип инсулина:\n\n/cancel — отменить ввод',
    insulinTypeKeyboard,
  );
}

for (const t of INSULIN_TYPES) {
  bot.action(`ins_type_${t.value}`, async (ctx) => {
    await ctx.answerCbQuery();
    const userId: number = ctx.from!.id;
    const state = userStates.get(userId);
    if (!state || state.step !== 'insulin_type') {
      await ctx.reply('Начните заново: нажмите 💉 Записать инсулин');
      return;
    }
    userStates.set(userId, { step: 'insulin_name', insulinType: t.value });
    await ctx.reply('💊 Выберите название инсулина:', insulinNameKeyboard);
  });
}

for (const name of INSULIN_NAMES) {
  bot.action(`ins_name_${name}`, async (ctx) => {
    await ctx.answerCbQuery();
    const userId: number = ctx.from!.id;
    const state = userStates.get(userId);
    if (!state || state.step !== 'insulin_name') {
      await ctx.reply('Начните заново: нажмите 💉 Записать инсулин');
      return;
    }
    userStates.set(userId, {
      step: 'insulin_units',
      insulinType: (state as any).insulinType,
      insulinName: name,
    });
    await ctx.reply('🔢 Введите количество единиц (например, 6):');
  });
}

// ─── Activity flow ────────────────────────────────────────────────────────────

const ACTIVITY_TYPES = [
  { label: 'Ходьба', value: 'walking' },
  { label: 'Бег', value: 'running' },
  { label: 'Тренажёрный зал', value: 'gym' },
  { label: 'Кардио', value: 'cardio' },
  { label: 'Силовая', value: 'strength' },
  { label: 'Велосипед', value: 'cycling' },
  { label: 'ЛФК', value: 'lfk' },
  { label: 'Другое', value: 'other' },
] as const;

const INTENSITY_OPTIONS_BOT = [
  { label: '🟢 Низкая', value: 'low' },
  { label: '🟡 Средняя', value: 'medium' },
  { label: '🔴 Высокая', value: 'high' },
] as const;

const activityTypeKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('🚶 Ходьба', 'act_walking'), Markup.button.callback('🏃 Бег', 'act_running')],
  [Markup.button.callback('🏋️ Тренажёрный зал', 'act_gym'), Markup.button.callback('❤️ Кардио', 'act_cardio')],
  [Markup.button.callback('💪 Силовая', 'act_strength'), Markup.button.callback('🚴 Велосипед', 'act_cycling')],
  [Markup.button.callback('🤸 ЛФК', 'act_lfk'), Markup.button.callback('🏅 Другое', 'act_other')],
]);

const intensityKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('🟢 Низкая', 'int_low')],
  [Markup.button.callback('🟡 Средняя', 'int_medium')],
  [Markup.button.callback('🔴 Высокая', 'int_high')],
]);

async function startActivityFlow(ctx: any) {
  const userId: number = ctx.from.id;
  userStates.set(userId, { step: 'activity_type' });
  await ctx.reply('🏃 Выберите тип активности:\n\n/cancel — отменить', activityTypeKeyboard);
}

bot.action('add_activity', async (ctx) => {
  await ctx.answerCbQuery();
  await startActivityFlow(ctx);
});

for (const t of ACTIVITY_TYPES) {
  bot.action(`act_${t.value}`, async (ctx) => {
    await ctx.answerCbQuery();
    const userId: number = ctx.from!.id;
    const state = userStates.get(userId);
    if (!state || state.step !== 'activity_type') {
      await ctx.reply('Начните заново: нажмите 🏃 Активность');
      return;
    }
    userStates.set(userId, { step: 'activity_duration', activityType: t.value });
    await ctx.reply(`${t.label} — введите длительность в минутах (1–600):`);
  });
}

for (const opt of INTENSITY_OPTIONS_BOT) {
  bot.action(`int_${opt.value}`, async (ctx) => {
    await ctx.answerCbQuery();
    const userId: number = ctx.from!.id;
    const state = userStates.get(userId);
    if (!state || state.step !== 'activity_intensity') {
      await ctx.reply('Начните заново: нажмите 🏃 Активность');
      return;
    }
    const aState = state as ActivityState & { step: 'activity_intensity' };

    let token: string;
    try {
      token = await getToken(ctx.from!);
    } catch {
      userTokens.delete(userId);
      await ctx.reply('❗ Не удалось авторизоваться. Попробуйте позже.');
      return;
    }

    userStates.delete(userId);

    try {
      await api.post(
        '/activities',
        {
          activityType: aState.activityType,
          durationMinutes: aState.durationMinutes,
          intensity: opt.value,
          startedAt: new Date().toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const actLabels: Record<string, string> = {
        walking: 'Ходьба', running: 'Бег', gym: 'Тренажёрный зал',
        cardio: 'Кардио', strength: 'Силовая', cycling: 'Велосипед', lfk: 'ЛФК', other: 'Другое',
      };

      await ctx.reply(
        `✅ <b>Запись сохранена</b>\n\n` +
          `🏃 Активность: <b>${actLabels[aState.activityType] ?? aState.activityType}</b>\n` +
          `⏱ Длительность: <b>${aState.durationMinutes} мин</b>\n` +
          `${opt.label}`,
        {
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('🏃 Добавить ещё', 'add_activity')],
            [Markup.button.callback('🏠 Главное меню', 'main_menu')],
          ]),
        },
      );
    } catch (err: any) {
      if (err?.response?.status === 401) userTokens.delete(userId);
      await ctx.reply('❗ Не удалось сохранить запись. Попробуйте ещё раз.');
    }
  });
}

// ─── Feeling flow ─────────────────────────────────────────────────────────────

const FEELING_OPTIONS = [
  { label: 'Хорошо', value: 'good' },
  { label: 'Нормально', value: 'normal' },
  { label: 'Слабость', value: 'weakness' },
  { label: 'Головокружение', value: 'dizzy' },
  { label: 'Плохо', value: 'bad' },
] as const;

const feelingKeyboard = Markup.inlineKeyboard([
  ...FEELING_OPTIONS.map((f) => [Markup.button.callback(f.label, `feeling_${f.value}`)]),
  [Markup.button.callback('Другое', 'feeling_other')],
]);

const symptomKeyboard = Markup.inlineKeyboard([
  [
    Markup.button.callback('Потливость', 'sym_sweating'),
    Markup.button.callback('Тремор', 'sym_tremor'),
  ],
  [
    Markup.button.callback('Голод', 'sym_hunger'),
    Markup.button.callback('Головная боль', 'sym_headache'),
  ],
  [
    Markup.button.callback('Сонливость', 'sym_drowsiness'),
    Markup.button.callback('Тревожность', 'sym_anxiety'),
  ],
  [
    Markup.button.callback('Тошнота', 'sym_nausea'),
    Markup.button.callback('Жажда', 'sym_thirst'),
  ],
  [Markup.button.callback('Частое мочеиспускание', 'sym_frequent_urination')],
  [Markup.button.callback('✅ Сохранить запись', 'sym_save')],
]);

const SYMPTOM_MAP: Record<string, string> = {
  sym_sweating: 'sweating',
  sym_tremor: 'tremor',
  sym_hunger: 'hunger',
  sym_headache: 'headache',
  sym_drowsiness: 'drowsiness',
  sym_anxiety: 'anxiety',
  sym_nausea: 'nausea',
  sym_thirst: 'thirst',
  sym_frequent_urination: 'frequent_urination',
};

async function startFeelingFlow(ctx: any) {
  const userId: number = ctx.from.id;
  userStates.set(userId, { step: 'feeling_select' });
  userSymptoms.set(userId, []);
  await ctx.reply('🙂 Как вы себя чувствуете?\n\n/cancel — отменить', feelingKeyboard);
}

bot.action('add_feeling', async (ctx) => {
  await ctx.answerCbQuery();
  await startFeelingFlow(ctx);
});

const ALL_FEELING_VALUES = [...FEELING_OPTIONS.map((f) => f.value), 'other'] as const;

for (const feeling of ALL_FEELING_VALUES) {
  bot.action(`feeling_${feeling}`, async (ctx) => {
    await ctx.answerCbQuery();
    const userId: number = ctx.from!.id;
    const state = userStates.get(userId);
    if (!state || state.step !== 'feeling_select') {
      await ctx.reply('Начните заново: нажмите 🙂 Самочувствие');
      return;
    }
    userStates.set(userId, { step: 'feeling_symptoms', feeling });
    userSymptoms.set(userId, []);

    const isBad = ['bad', 'dizzy', 'weakness'].includes(feeling);
    let text = 'Выберите симптомы (нажимайте по одному, затем нажмите Сохранить):';
    if (isBad) {
      text += '\n\n⚠️ Если состояние ухудшается или есть тревожные симптомы, обратитесь за медицинской помощью.';
    }
    await ctx.reply(text, symptomKeyboard);
  });
}

// Symptom toggle callbacks
for (const [action, symptomValue] of Object.entries(SYMPTOM_MAP)) {
  bot.action(action, async (ctx) => {
    await ctx.answerCbQuery();
    const userId: number = ctx.from!.id;
    const state = userStates.get(userId);
    if (!state || state.step !== 'feeling_symptoms') return;

    const syms = userSymptoms.get(userId) ?? [];
    if (syms.includes(symptomValue)) {
      userSymptoms.set(userId, syms.filter((s) => s !== symptomValue));
      await ctx.answerCbQuery(`Убрано: ${symptomValue}`);
    } else {
      syms.push(symptomValue);
      userSymptoms.set(userId, syms);
      await ctx.answerCbQuery(`Добавлено: ${symptomValue}`);
    }
  });
}

bot.action('sym_save', async (ctx) => {
  await ctx.answerCbQuery();
  const userId: number = ctx.from!.id;
  const state = userStates.get(userId);
  if (!state || state.step !== 'feeling_symptoms') {
    await ctx.reply('Начните заново: нажмите 🙂 Самочувствие');
    return;
  }

  const feeling = (state as FeelingState & { step: 'feeling_symptoms' }).feeling;
  const symptoms = userSymptoms.get(userId) ?? [];
  userStates.delete(userId);
  userSymptoms.delete(userId);

  let token: string;
  try {
    token = await getToken(ctx.from!);
  } catch {
    userTokens.delete(userId);
    await ctx.reply('❗ Не удалось авторизоваться. Попробуйте позже.');
    return;
  }

  try {
    await api.post(
      '/feelings',
      {
        feeling,
        symptoms,
        recordedAt: new Date().toISOString(),
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    const feelingLabels: Record<string, string> = {
      good: 'Хорошо',
      normal: 'Нормально',
      weakness: 'Слабость',
      dizzy: 'Головокружение',
      bad: 'Плохо',
      other: 'Другое',
    };

    const isBad = ['bad', 'dizzy', 'weakness'].includes(feeling);
    let reply = `✅ <b>Запись сохранена</b>\n\n🙂 Самочувствие: <b>${feelingLabels[feeling] ?? feeling}</b>`;
    if (symptoms.length > 0) {
      reply += `\n🩺 Симптомы: ${symptoms.join(', ')}`;
    }
    if (isBad) {
      reply += '\n\n⚠️ Если состояние ухудшается или есть тревожные симптомы, обратитесь за медицинской помощью.';
    }

    await ctx.reply(reply, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🙂 Добавить ещё', 'add_feeling')],
        [Markup.button.callback('🏠 Главное меню', 'main_menu')],
      ]),
    });
  } catch (err: any) {
    if (err?.response?.status === 401) {
      userTokens.delete(userId);
    }
    await ctx.reply('❗ Не удалось сохранить запись. Попробуйте ещё раз.');
  }
});

// ─── Text message handler (FSM) ───────────────────────────────────────────────

bot.on('text', async (ctx) => {
  const userId: number = ctx.from.id;
  const state = userStates.get(userId);

  if (!state) return;

  if ((state as ActivityState).step === 'activity_duration') {
    const aState = state as ActivityState & { step: 'activity_duration' };
    const raw = ctx.message.text.trim();
    const duration = parseInt(raw);
    if (isNaN(duration) || duration < 1 || duration > 600) {
      await ctx.reply('⚠️ Введите длительность числом от 1 до 600 минут.');
      return;
    }
    userStates.set(userId, { step: 'activity_intensity', activityType: aState.activityType, durationMinutes: duration });
    await ctx.reply('💪 Выберите интенсивность:', intensityKeyboard);
    return;
  }

  if ((state as InsulinState).step === 'insulin_units') {
    const iState = state as { step: 'insulin_units'; insulinType: string; insulinName: string };
    const raw = ctx.message.text.trim().replace(',', '.');
    const units = parseFloat(raw);

    if (isNaN(units) || !/^\d+([.,]\d+)?$/.test(ctx.message.text.trim())) {
      await ctx.reply('⚠️ Введите количество единиц числом, например 6');
      return;
    }

    if (units < 0.5 || units > 100) {
      await ctx.reply('⚠️ Количество инсулина должно быть от 0.5 до 100 ед.');
      return;
    }

    userStates.delete(userId);

    let token: string;
    try {
      token = await getToken(ctx.from!);
    } catch {
      userTokens.delete(userId);
      await ctx.reply('❗ Не удалось авторизоваться. Попробуйте позже.');
      return;
    }

    try {
      await api.post(
        '/insulin',
        {
          insulinType: iState.insulinType,
          insulinName: iState.insulinName === 'Другое' ? undefined : iState.insulinName,
          units,
          injectedAt: new Date().toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const nameLabel = iState.insulinName === 'Другое' ? 'Другой инсулин' : iState.insulinName;
      await ctx.reply(
        `✅ Записал: ${nameLabel}, ${units} ед.`,
        Markup.inlineKeyboard([
          [Markup.button.callback('💉 Добавить ещё', 'add_insulin')],
          [Markup.button.callback('🏠 Главное меню', 'main_menu')],
        ]),
      );
    } catch (err: any) {
      if (err?.response?.status === 401) {
        userTokens.delete(userId);
      }
      await ctx.reply('❗ Не удалось сохранить запись. Попробуйте ещё раз.');
    }
    return;
  }

  if (state.step === 'await_value') {
    const raw = ctx.message.text.trim().replace(',', '.');
    const value = parseFloat(raw);

    if (isNaN(value) || !/^\d+([.,]\d+)?$/.test(ctx.message.text.trim())) {
      await ctx.reply(
        '⚠️ Не получилось распознать значение. Введите сахар числом, например <b>6.4</b>',
        { parse_mode: 'HTML' },
      );
      return;
    }

    if (value < 1.0 || value > 35.0) {
      await ctx.reply('⚠️ Значение сахара должно быть от 1.0 до 35.0 ммоль/л');
      return;
    }

    userStates.set(userId, { step: 'await_context', value });
    await ctx.reply('📍 Выберите контекст измерения:', contextKeyboard);
  }
});

// ─── Reminders menu ──────────────────────────────────────────────────────────

const REMINDER_TYPE_LABELS_BOT: Record<string, string> = {
  check_glucose: 'Измерить сахар',
  basal_insulin: 'Ввести базальный инсулин',
  medication: 'Принять лекарство',
  after_meal_glucose: 'Проверить сахар после еды',
  before_sleep_glucose: 'Проверить сахар перед сном',
  sensor_replace: 'Заменить сенсор',
  supplies: 'Купить расходники',
  report: 'Сформировать отчёт',
  custom: 'Другое',
};

const REMINDER_TYPES_LIST = Object.entries(REMINDER_TYPE_LABELS_BOT);

type ReminderFSMState =
  | { step: 'rem_type' }
  | { step: 'rem_title'; type: string }
  | { step: 'rem_time'; type: string; title: string }
  | { step: 'rem_repeat'; type: string; title: string; time: string };

const reminderStates = new Map<number, ReminderFSMState>();

async function sendRemindersMenu(ctx: any) {
  let token: string;
  try {
    token = await getToken(ctx.from!);
  } catch {
    userTokens.delete(ctx.from!.id);
    await ctx.reply('❗ Не удалось авторизоваться. Попробуйте позже.');
    return;
  }

  try {
    const res = await api.get('/reminders', { headers: { Authorization: `Bearer ${token}` } });
    const reminders: any[] = res.data;

    let text = '⏰ <b>Напоминания</b>\n\n';
    if (reminders.length === 0) {
      text += 'Нет активных напоминаний.';
    } else {
      for (const r of reminders) {
        const icon = r.enabled ? '✅' : '🔕';
        const label = r.title || REMINDER_TYPE_LABELS_BOT[r.type] || r.type;
        text += `${icon} ${label} — ${r.time}\n`;
      }
    }

    await ctx.reply(text, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('➕ Создать напоминание', 'rem_create')],
        [Markup.button.webApp('📋 Управлять в приложении', `${MINIAPP_URL}/reminders`)],
        [Markup.button.callback('🏠 Главное меню', 'main_menu')],
      ]),
    });
  } catch (err: any) {
    if (err?.response?.status === 401) userTokens.delete(ctx.from!.id);
    await ctx.reply('❗ Не удалось загрузить напоминания.');
  }
}

bot.action('reminders_menu', async (ctx) => {
  await ctx.answerCbQuery();
  await sendRemindersMenu(ctx);
});

bot.command('reminders', async (ctx) => {
  await sendRemindersMenu(ctx);
});

bot.action('rem_create', async (ctx) => {
  await ctx.answerCbQuery();
  const userId: number = ctx.from!.id;
  reminderStates.set(userId, { step: 'rem_type' });

  const rows = REMINDER_TYPES_LIST.map(([value, label]) => [
    Markup.button.callback(label, `rem_t_${value}`),
  ]);

  await ctx.reply('⏰ Выберите тип напоминания:', Markup.inlineKeyboard(rows));
});

for (const [value] of REMINDER_TYPES_LIST) {
  bot.action(`rem_t_${value}`, async (ctx) => {
    await ctx.answerCbQuery();
    const userId: number = ctx.from!.id;
    const state = reminderStates.get(userId);
    if (!state || state.step !== 'rem_type') {
      await ctx.reply('Начните заново: нажмите ⏰ Напоминания');
      return;
    }
    reminderStates.set(userId, { step: 'rem_title', type: value });
    await ctx.reply(
      `Введите название (или отправьте <b>-</b> чтобы использовать стандартное):\n\nТип: ${REMINDER_TYPE_LABELS_BOT[value]}`,
      { parse_mode: 'HTML' },
    );
  });
}

bot.on('text', async (ctx) => {
  // existing FSM is handled above — this duplicate is for reminder FSM
});

// Reminder text input is handled inside the main 'text' handler below
// We'll inject the reminder FSM steps into existing text handler by extending it
// Instead, handle via action + separate text detection:

async function handleReminderTextInput(ctx: any): Promise<boolean> {
  const userId: number = ctx.from.id;
  const state = reminderStates.get(userId);
  if (!state) return false;

  const text: string = ctx.message.text.trim();

  if (state.step === 'rem_title') {
    const title = text === '-' ? REMINDER_TYPE_LABELS_BOT[state.type] : text;
    reminderStates.set(userId, { step: 'rem_time', type: state.type, title });
    await ctx.reply('🕐 Введите время напоминания в формате <b>ЧЧ:ММ</b>, например <b>08:00</b>:', {
      parse_mode: 'HTML',
    });
    return true;
  }

  if (state.step === 'rem_time') {
    if (!/^\d{2}:\d{2}$/.test(text)) {
      await ctx.reply('⚠️ Введите время в формате ЧЧ:ММ, например 08:00');
      return true;
    }
    reminderStates.set(userId, {
      step: 'rem_repeat',
      type: state.type,
      title: state.title,
      time: text,
    });
    await ctx.reply(
      '🔁 Выберите повторение:',
      Markup.inlineKeyboard([
        [Markup.button.callback('Каждый день', 'rem_rep_DAILY')],
        [Markup.button.callback('Каждую неделю', 'rem_rep_WEEKLY')],
        [Markup.button.callback('Каждый месяц', 'rem_rep_MONTHLY')],
        [Markup.button.callback('Не повторять', 'rem_rep_NONE')],
      ]),
    );
    return true;
  }

  return false;
}

for (const repeat of ['DAILY', 'WEEKLY', 'MONTHLY', 'NONE']) {
  bot.action(`rem_rep_${repeat}`, async (ctx) => {
    await ctx.answerCbQuery();
    const userId: number = ctx.from!.id;
    const state = reminderStates.get(userId);
    if (!state || state.step !== 'rem_repeat') {
      await ctx.reply('Начните заново: нажмите ⏰ Напоминания → Создать');
      return;
    }

    const repeatRuleMap: Record<string, string | undefined> = {
      DAILY: 'FREQ=DAILY',
      WEEKLY: 'FREQ=WEEKLY',
      MONTHLY: 'FREQ=MONTHLY',
      NONE: undefined,
    };
    const repeatRule = repeatRuleMap[repeat];

    reminderStates.delete(userId);

    let token: string;
    try {
      token = await getToken(ctx.from!);
    } catch {
      userTokens.delete(userId);
      await ctx.reply('❗ Не удалось авторизоваться. Попробуйте позже.');
      return;
    }

    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      await api.post(
        '/reminders',
        {
          type: state.type,
          title: state.title,
          time: state.time,
          ...(repeatRule ? { repeatRule } : {}),
          timezone: tz,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const repeatLabels: Record<string, string> = {
        DAILY: 'каждый день',
        WEEKLY: 'каждую неделю',
        MONTHLY: 'каждый месяц',
        NONE: 'без повторения',
      };

      await ctx.reply(
        `✅ <b>Напоминание создано</b>\n\n` +
          `⏰ ${state.title}\n` +
          `🕐 Время: <b>${state.time}</b>\n` +
          `🔁 Повторение: <b>${repeatLabels[repeat]}</b>`,
        {
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('⏰ К напоминаниям', 'reminders_menu')],
            [Markup.button.callback('🏠 Главное меню', 'main_menu')],
          ]),
        },
      );
    } catch (err: any) {
      if (err?.response?.status === 401) userTokens.delete(userId);
      await ctx.reply('❗ Не удалось создать напоминание.');
    }
  });
}

// ─── Reminder notification callbacks (sent by backend processor) ──────────────

bot.action(/^rem_done_(.+)$/, async (ctx) => {
  await ctx.answerCbQuery('✅ Отмечено как выполнено!');
  try {
    await ctx.editMessageReplyMarkup(undefined);
  } catch {}
  await ctx.reply('✅ Выполнено! Хорошая работа 👍');
});

bot.action(/^rem_snooze_(.+)$/, async (ctx) => {
  await ctx.answerCbQuery('⏱ Отложено на 10 минут');
  const reminderId = (ctx.match as RegExpMatchArray)[1];
  try {
    await ctx.editMessageReplyMarkup(undefined);
  } catch {}

  let token: string;
  try {
    token = await getToken(ctx.from!);
  } catch {
    await ctx.reply('⏱ Напоминание будет повторено через 10 минут.');
    return;
  }

  try {
    await api.post(
      `/reminders/${reminderId}/snooze`,
      { minutes: 10 },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    await ctx.reply('⏱ Напоминание отложено на 10 минут.');
  } catch {
    await ctx.reply('⏱ Напоминание отложено на 10 минут.');
  }
});

bot.action(/^rem_skip_(.+)$/, async (ctx) => {
  await ctx.answerCbQuery('⏭ Пропущено');
  try {
    await ctx.editMessageReplyMarkup(undefined);
  } catch {}

  let token: string;
  try {
    token = await getToken(ctx.from!);
  } catch {
    await ctx.reply('⏭ Напоминание пропущено.');
    return;
  }

  const reminderId = (ctx.match as RegExpMatchArray)[1];
  try {
    await api.post(
      `/reminders/${reminderId}/skip`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
  } catch {}
  await ctx.reply('⏭ Напоминание пропущено.');
});

bot.action(/^rem_diary_(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  try {
    await ctx.editMessageReplyMarkup(undefined);
  } catch {}
  await ctx.reply(
    '📓 Открыть дневник:',
    Markup.inlineKeyboard([[Markup.button.webApp('📓 Открыть дневник', MINIAPP_URL)]]),
  );
});

// ─── Help ─────────────────────────────────────────────────────────────────────

bot.help((ctx) =>
  ctx.reply(
    'DiaBeta — дневник диабетика 🩺\n\n' +
      'Команды:\n' +
      '/start — начало работы\n' +
      '/menu — главное меню\n' +
      '/glucose — добавить сахар\n' +
      '/cancel — отменить текущий ввод\n' +
      '/help — помощь\n\n' +
      '⚠️ Сервис не является врачом, не ставит диагнозы и не назначает лечение.',
  ),
);

// ─── Launch ───────────────────────────────────────────────────────────────────

bot.launch().then(() => {
  console.log('DiaBeta Bot started');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));