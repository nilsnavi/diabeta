# DiaBeta AddGlucosePage - Реализация

Современный экран для быстрого добавления записи сахара в Telegram Mini App DiaBeta. Оптимизирован для использования одной рукой за 5-10 секунд.

---

## 🎯 Цель

Пользователь должен иметь возможность добавить запись сахара максимально быстро и удобно, с минимальным количеством действий.

---

## 📱 Структура экрана

### 1. Header
```tsx
<header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
  - Кнопка "Назад" (←)
  - Заголовок: "Добавить сахар"
</header>
```

**Особенности:**
- Sticky positioning с blur backdrop
- Плавная навигация назад

---

### 2. Поле ввода значения (Крупное)
```tsx
<input
  type="number"
  inputMode="decimal"
  step="0.1"
  min="1.0"
  max="35.0"
  placeholder="6.4"
  className="text-5xl font-bold text-center py-6"
/>
```

**UX решения:**
- **Огромный размер шрифта** (text-5xl) для удобства
- **Центрированный текст** для фокуса внимания
- **Numeric keyboard** через `inputMode="decimal"`
- **Автофокус** при открытии страницы
- **Большая область касания** (py-6)
- **Суффикс "ммоль/л"** внутри поля

**Валидация:**
- Минимум: 1.0 ммоль/л
- Максимум: 35.0 ммоль/л
- Шаг: 0.1
- Обязательное поле

---

### 3. Быстрые значения (Quick Values)
```tsx
<div className="flex flex-wrap gap-2">
  {[5.0, 5.5, 6.0, 6.5, 7.0, 8.0, 10.0].map(val => (
    <button onClick={() => setValue(val)}>
      {val.toFixed(1)}
    </button>
  ))}
</div>
```

**Особенности:**
- 7 популярных значений одним касанием
- Активное значение подсвечивается синим
- Экономия времени на ввод
- Hover эффекты

---

### 4. Контекст измерения (Chips Grid)
```tsx
<div className="grid grid-cols-2 gap-2">
  {contextOptions.map(option => (
    <button className="p-3 rounded-xl border-2">
      <div>{option.icon}</div>
      <div>{option.label}</div>
    </button>
  ))}
</div>
```

**8 контекстов:**
1. 🌅 Натощак
2. 🍽️ До еды
3. ✅ После еды
4. 🌙 Перед сном
5. 🌃 Ночью
6. 🏃 После тренировки
7. 😔 Плохое самочувствие
8. 📝 Другое

**Дизайн:**
- Grid layout 2 колонки
- Иконка + текст
- Активный контекст: синяя рамка + фон
- Обязательное поле

---

### 5. Дата и время
```tsx
<input
  type="datetime-local"
  value={dateTime}
  onChange={(e) => setDateTime(e.target.value)}
/>
```

**Особенности:**
- По умолчанию: текущее время
- Формат: YYYY-MM-DDTHH:mm
- Нативный picker iOS/Android
- Можно изменить для прошлых записей

---

### 6. Комментарий (Необязательный)
```tsx
<textarea
  placeholder="Например: после прогулки, стресс..."
  rows={3}
  maxLength={1000}
/>
```

**Функции:**
- Счётчик символов (0/1000)
- Предупреждение при >900 символов
- Валидация maxLength
- Placeholder с примерами

---

### 7. Кнопка "Сохранить" (Fixed Bottom)
```tsx
<div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg p-4">
  <button 
    disabled={!value || !context}
    className="w-full py-4 px-6 rounded-2xl"
  >
    Сохранить
  </button>
</div>
```

**UX:**
- Fixed positioning внизу экрана
- Всегда видна (не нужно скроллить)
- Disabled state если нет value или context
- Градиентный фон когда активна
- Safe area padding для iPhone
- Backdrop blur для современного вида

---

### 8. Success State
```tsx
<div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center">
  {/* Green checkmark icon */}
  <h2>Сахар записан</h2>
  <div className="text-5xl font-bold">{value}</div>
  <div>ммоль/л</div>
  <div className="status-badge">В целевом диапазоне</div>
  
  {/* Buttons */}
  <button>Добавить ещё</button>
  <button>На главную</button>
</div>
```

**Элементы:**
- ✓ Зелёная иконка успеха (градиент)
- ✓ Большое значение сахара
- ✓ Статус (цветной badge):
  - 🟢 В целевом диапазоне (4.0-7.0)
  - 🟡 Выше цели (>7.0)
  - 🔴 Ниже цели (<4.0)
- ✓ Выбранный контекст с иконкой
- ✓ Две кнопки действий

**Кнопки действий:**
1. **"Добавить ещё"** - сброс формы, новое измерение
2. **"На главную"** - переход на Dashboard (/)

---

## 🔧 Валидация

### Value (Обязательное)
```typescript
if (!value) → "Введите значение сахара"
if (isNaN(value)) → "Введите корректное число"
if (value < 1.0) → "Минимальное значение 1.0 ммоль/л"
if (value > 35.0) → "Максимальное значение 35.0 ммоль/л"
```

### Context (Обязательное)
```typescript
if (!context) → "Выберите контекст измерения"
```

### Comment (Необязательное)
```typescript
if (comment.length > 1000) → "Комментарий не должен превышать 1000 символов"
```

### Real-time Validation
- Ошибки очищаются при изменении поля
- Красная рамка на ошибочных полях
- Иконка ⚠️ перед сообщением об ошибке
- Кнопка "Сохранить" disabled пока есть ошибки

---

## 🎨 Дизайн

### Цветовая схема статусов
| Диапазон | Цвет текста | Цвет фона | Статус |
|----------|-------------|-----------|--------|
| < 4.0 | red-600 | red-50 | Ниже цели |
| 4.0 - 7.0 | green-600 | green-50 | В целевом диапазоне |
| > 7.0 | amber-600 | amber-50 | Выше цели |

### Анимации
- **active:scale-[0.98]** - тактильная обратная связь на кнопках
- **transition-all duration-200** - плавные переходы
- **hover:bg-gray-200** - подсветка при наведении

### Типографика
- **Заголовки**: text-xl / text-2xl font-bold
- **Значение**: text-5xl font-bold (огромное)
- **Подписи**: text-sm font-medium
- **Placeholder**: text-gray-400

### Отступы
- **Контейнер**: px-4 py-4
- **Карточки**: p-5 / p-6
- **Между секциями**: space-y-4
- **Кнопки**: py-4 px-6

---

## 📊 UX Оптимизации

### Для одной руки
✅ **Крупные элементы** - легко попасть пальцем  
✅ **Bottom-fixed кнопка** - не нужно тянуться вверх  
✅ **Быстрые значения** - одно касание для常见值  
✅ **Grid контекстов** - компактно, видно все варианты  
✅ **Автофокус** на поле value - сразу можно вводить  

### Скорость ввода
✅ **Numeric keyboard** - только цифры и точка  
✅ **Quick values** - 7 кнопок для частых значений  
✅ **Default datetime** - не нужно выбирать время  
✅ **Comment optional** - можно пропустить  

### Обратная связь
✅ **Real-time validation** - ошибки сразу видны  
✅ **Disabled button** - понятно когда форма неполная  
✅ **Success animation** - подтверждение сохранения  
✅ **Clear errors on change** - не раздражают  

---

## 🔌 Mock Implementation

### Save Function
```typescript
const mockSave = async (data: any) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Saved:', data);
  return { success: true };
};
```

### Data Structure
```typescript
{
  value: 6.4,                    // number
  context: 'before_meal',        // GlucoseContext
  measuredAt: '2024-01-15T14:30', // ISO string
  comment: 'После обеда'         // string | null
}
```

### API Integration (TODO)
Заменить mock на реальный вызов:
```typescript
import { glucoseApi } from '../features/glucose/api';

await glucoseApi.create({
  value: parseFloat(value),
  context,
  measuredAt: dateTime,
  comment: comment.trim() || null,
});
```

---

## 📱 Адаптивность

### Mobile First
- **Base**: 320px+ (iPhone SE)
- **Optimal**: 375-390px (iPhone 13/14)
- **Max width**: max-w-md mx-auto
- **Safe area**: pb-24 + safe-area-bottom

### Touch Targets
- **Minimum**: 48x48px (кнопки контекста)
- **Quick values**: ~40px height
- **Save button**: 56px height (py-4)
- **Input field**: 80px height (py-6)

### Dark Mode
- Полная поддержка через `dark:` классы
- bg-gray-900, text-gray-100
- Корректные контрасты

---

## ✅ Критерии готовности

- ✅ **Форма работает**
  - Все поля функциональны
  - State management корректный
  - Submit обработан

- ✅ **Валидация работает**
  - Value: required, range 1.0-35.0
  - Context: required
  - Comment: max 1000 chars
  - Real-time error clearing

- ✅ **Быстрые значения работают**
  - 7 кнопок с популярными значениями
  - Одно касание для ввода
  - Active state highlighting

- ✅ **Success state отображается**
  - Зелёная иконка ✓
  - Большое значение
  - Цветной статус (green/amber/red)
  - Контекст с иконкой
  - Две кнопки действий

- ✅ **Экран удобен одной рукой**
  - Крупные элементы
  - Fixed bottom button
  - Quick values
  - Автофокус
  - Компактный layout

---

## 🎯 Особенности реализации

### State Management
```typescript
// Form state
const [value, setValue] = useState<string>('');
const [context, setContext] = useState<GlucoseContext | ''>('');
const [comment, setComment] = useState('');
const [dateTime, setDateTime] = useState(dayjs().format('YYYY-MM-DDTHH:mm'));

// Validation errors
const [errors, setErrors] = useState<{...}>({});

// UI state
const [showSuccess, setShowSuccess] = useState(false);
```

### Type Safety
```typescript
type GlucoseContext = 
  | 'fasting'
  | 'before_meal'
  | 'after_meal'
  | 'bedtime'
  | 'night'
  | 'after_exercise'
  | 'bad_feeling'
  | 'other';

interface ContextOption {
  value: GlucoseContext;
  label: string;
  icon: string;
}
```

### Navigation
```typescript
const navigate = useNavigate();

// Back button
navigate(-1);

// Success actions
navigate('/'); // Home
// or reset form for another entry
```

---

## 🚀 Как использовать

### Импорт
```tsx
import AddGlucosePage from './pages/AddGlucosePage';

// В роутере
<Route path="/add-glucose" element={<AddGlucosePage />} />
```

### Навигация к странице
```tsx
// Из HomePage
<button onClick={() => navigate('/add-glucose')}>
  🩸 Сахар
</button>

// Или из любого места
<Link to="/add-glucose">Добавить сахар</Link>
```

### API Integration (когда будет готов backend)
1. Раскомментировать import glucoseApi
2. Заменить mockSave на реальный вызов
3. Добавить error handling
4. Добавить loading state

---

## 📝 Итог

**AddGlucosePage полностью готов!**

✅ **Быстрый ввод** - 5-10 секунд на запись  
✅ **Удобная валидация** - real-time feedback  
✅ **Quick values** - 7 кнопок для частых значений  
✅ **8 контекстов** - с иконками и описаниями  
✅ **Success state** - красивый confirmation screen  
✅ **One-handed use** - оптимизировано для одной руки  
✅ **Mobile-first** - идеально для Telegram Mini App  
✅ **Dark mode** - полная поддержка  

**Файл:** [`packages/miniapp/src/pages/AddGlucosePage.tsx`](file://d:\Project\diabeta\packages\miniapp\src\pages\AddGlucosePage.tsx)

**Готово к использованию!** 🚀✨
