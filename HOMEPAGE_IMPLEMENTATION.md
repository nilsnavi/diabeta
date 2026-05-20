# DiaBeta HomePage - Реализация

Современный главный экран для Telegram Mini App DiaBeta с дизайном в стиле Apple Health.

---

## 🎨 Дизайн

### Визуальный стиль
- **Градиенты**: Мягкие переходы цветов для карточек и кнопок
- **Скругления**: rounded-3xl для основных карточек, rounded-2xl для элементов
- **Тени**: shadow-lg с цветными тенями для акцентных элементов
- **Анимации**: active:scale-95 для тактильной обратной связи
- **Пространство**: Много воздуха между элементами (space-y-4)

### Цветовая схема
- **Норма (зелёный)**: from-green-500 to-emerald-600
- **Выше цели (жёлтый)**: from-amber-500 to-orange-600
- **Ниже цели (красный)**: from-red-500 to-rose-600
- **Быстрые действия**: Разные градиенты для каждого типа

---

## 📱 Структура страницы

### 1. Header
```tsx
<header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
  - Название: "DiaBeta" с градиентом
  - Дата: текущая дата на русском языке
  - Иконка настроек: ссылка на /settings
</header>
```

**Особенности:**
- Sticky positioning с blur backdrop
- Градиентный текст для бренда
- Hover эффекты на иконке

---

### 2. Карточка последнего сахара
```tsx
<div className="bg-gradient-to-br {gradient} rounded-3xl p-6 text-white shadow-xl">
  - Большое значение (text-5xl)
  - Единицы измерения (ммоль/л)
  - Статус с индикатором
  - Время измерения (relative time)
  - Иконка 🩸 в круге
</div>
```

**Логика статусов:**
```typescript
if (value < 4.0) → "Ниже цели" (red gradient)
if (value > 7.0) → "Выше цели" (yellow gradient)
else → "В целевом диапазоне" (green gradient)
```

---

### 3. Быстрые действия
```tsx
<div className="grid grid-cols-2 gap-3">
  4 кнопки с градиентами:
  - 🩸 Сахар → /add-glucose
  - 💉 Инсулин → /add-insulin
  - 🍽️ Еда → /add-meal
  - 😊 Самочувствие → /feeling
</div>
```

**Дизайн:**
- Gradient backgrounds с уникальными цветами
- Hover эффект: scale-110 на иконке
- Active эффект: scale-95 на всей кнопке
- Тень с цветом (shadow-red-500/30 и т.д.)

---

### 4. Мини-график сахара
```tsx
<LineChart data={glucoseChartData}>
  <ReferenceArea y1={4.0} y2={7.0} fill="#10B981" fillOpacity={0.1} />
  <XAxis dataKey="time" />
  <YAxis domain={[3, 10]} />
  <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} />
</LineChart>
```

**Особенности:**
- Target range background (зелёная полоса 4.0-7.0)
- Monotone curve для плавности
- Кастомные точки с белой обводкой
- ResponsiveContainer для адаптивности

---

### 5. Сводка дня
```tsx
<div className="grid grid-cols-2 gap-4">
  4 карточки метрик:
  - 📊 Измерений: 7
  - ✅ В диапазоне: 71%
  - 💉 Инсулин: 18 ед
  - 🍞 ХЕ: 8
</div>
```

**Дизайн:**
- Каждая карточка с уникальным градиентом фона
- Иконка + label + значение
- Крупные цифры (text-2xl font-bold)

---

### 6. Ближайшее напоминание
```tsx
<div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-5">
  - Иконка ⏰ в градиентном круге
  - Название напоминания
  - Время
  - Кнопка "Открыть" → /reminders
</div>
```

---

### 7. Последние записи
```tsx
<div className="space-y-3">
  {recentEntries.map(entry => (
    <TimelineItem
      icon={entry.icon}
      title={entry.title}
      subtitle={entry.subtitle}
      value={entry.value}
      unit={entry.unit}
      time={entry.time}
      color={entry.color}
    />
  ))}
</div>
```

**Типы записей:**
- 🩸 Сахар крови (зелёный)
- 💉 Инсулин (фиолетовый)
- 🍽️ Еда (зелёный)
- 😊 Самочувствие (синий)

---

### 8. Bottom Navigation
```tsx
<nav className="fixed bottom-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg">
  5 вкладок:
  - 🏠 Главная (/)
  - 📋 Дневник (/history)
  - 📊 Аналитика (/analytics)
  - 🤖 AI (/ai-chat)
  - ⚙️ Настройки (/settings)
</nav>
```

**Особенности:**
- Fixed positioning внизу экрана
- Blur backdrop для современного вида
- Active state highlighting (синий цвет)
- Scale animation для активной иконки
- Safe area padding для iPhone

---

## 🔧 Технические детали

### Mock Data
```typescript
// График за день
const glucoseChartData = [
  { time: '06:00', value: 5.2 },
  { time: '08:00', value: 5.8 },
  // ... 7 точек
];

// Последние записи
const recentEntries = [
  { id: '1', type: 'glucose', icon: '🩸', value: 6.4, ... },
  // ... 4 записи
];

// Сводка дня
const dailySummary = {
  measurements: 7,
  inRangePercentage: 71,
  totalInsulin: 18,
  totalXE: 8,
};
```

### Dependencies
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "recharts": "^2.10.0",
  "dayjs": "^1.11.10",
  "tailwindcss": "^3.3.0"
}
```

### Responsive Design
- **Max width**: max-w-md mx-auto для центрирования
- **Padding**: px-4 для мобильных отступов
- **Grid**: grid-cols-2 для быстрых действий и сводки
- **Safe area**: pb-24 для bottom nav + safe-area-bottom

---

## 🎯 UX Features

### Интерактивность
✅ **Все кнопки кликабельны**  
✅ **Bottom nav работает через router links**  
✅ **Hover эффекты на всех интерактивных элементах**  
✅ **Active states для тактильной обратной связи**  

### Accessibility
✅ **ARIA labels** на иконках  
✅ **Semantic HTML** (header, nav, button)  
✅ **Keyboard navigation** support  
✅ **Color contrast** соответствует стандартам  

### Performance
✅ **ResponsiveContainer** для графиков  
✅ **CSS transitions** вместо JS анимаций  
✅ **Minimal re-renders** с React.memo (можно добавить)  

---

## 📊 Адаптивность

### Mobile First
- Базовый дизайн для 320px+
- Оптимизировано для 375px (iPhone SE)
- Идеально на 390px (iPhone 13/14)
- Центрируется на больших экранах (max-w-md)

### Dark Mode
- Полная поддержка через `dark:` классы
- Автоматическое переключение
- Корректные цвета для всех элементов

---

## 🚀 Как использовать

### Импорт
```tsx
import HomePage from './pages/HomePage';

// В роутере
<Route path="/" element={<HomePage />} />
```

### Навигация
Все кнопки используют `useNavigate()` hook:
```tsx
const navigate = useNavigate();
navigate('/add-glucose');
```

### Кастомизация
Изменить mock data в начале файла:
```tsx
const glucoseChartData = [...]; // ваши данные
const recentEntries = [...]; // ваши записи
```

---

## ✅ Критерии готовности

- ✅ **Страница выглядит как готовый продукт**
  - Современный дизайн с градиентами
  - Профессиональная типографика
  - Согласованные отступы и размеры

- ✅ **Все карточки адаптивные**
  - ResponsiveContainer для графиков
  - Grid layout для метрик
  - Flexbox для выравнивания

- ✅ **Быстрые действия кликабельны**
  - 4 кнопки с navigate()
  - Hover и active эффекты
  - Визуальная обратная связь

- ✅ **Bottom nav работает через router links**
  - 5 вкладок с navigate()
  - Active state highlighting
  - Smooth transitions

---

## 🎨 Визуальные скриншоты (описание)

### Light Mode
- Белый фон с серыми карточками
- Яркие градиенты на акцентных элементах
- Чёткие тени для глубины
- Синий цвет для активных элементов

### Dark Mode
- Тёмно-серый фон (#111827)
- Приглушённые градиенты
- Светлые карточки (#1F2937)
- Яркий синий для контраста

---

## 🔮 Следующие шаги

### API Integration
Заменить mock data на реальные вызовы:
```tsx
const { data: glucoseData } = useQuery({
  queryKey: ['glucose', 'today'],
  queryFn: () => glucoseApi.getToday(),
});
```

### Real-time Updates
Добавить WebSocket или polling:
```tsx
useEffect(() => {
  const interval = setInterval(refetch, 60000); // каждую минуту
  return () => clearInterval(interval);
}, []);
```

### Pull to Refresh
Реализовать обновление данных:
```tsx
import { usePullToRefresh } from 'react-use-pull-to-refresh';
```

---

## 📝 Итог

**HomePage полностью готов!**

✅ Современный дизайн в стиле Apple Health  
✅ Все 8 секций реализованы  
✅ Полная адаптивность  
✅ Dark mode support  
✅ Mock data для разработки  
✅ Кликабельные элементы  
✅ Working bottom navigation  

**Файл:** [`packages/miniapp/src/pages/HomePage.tsx`](file://d:\Project\diabeta\packages\miniapp\src\pages\HomePage.tsx)

**Готово к использованию!** 🚀
