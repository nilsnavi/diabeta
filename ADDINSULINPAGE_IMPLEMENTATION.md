# DiaBeta AddInsulinPage - Реализация

Современный экран для безопасной фиксации введённого инсулина в Telegram Mini App DiaBeta. Содержит чёткие медицинские дисклеймеры и удобный UX для быстрого ввода дозы.

---

## 🎯 Цель

Пользователь фиксирует введённый инсулин. **Система не назначает и не рассчитывает дозы** — только записывает данные, предоставленные пользователем.

---

## ⚠️ Медицинская безопасность

### Дисклеймер (в верхней части формы)
```tsx
<div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
  <span>⚠️</span>
  <p>
    DiaBeta записывает введённую вами дозу, но 
    <strong>не назначает лечение</strong> и 
    <strong>не рассчитывает дозировки</strong>. 
    Всегда следуйте назначениям вашего врача.
  </p>
</div>
```

**Ключевые принципы:**
- ✅ Нет рекомендаций по дозировкам
- ✅ Нет расчётов на основе сахара/еды
- ✅ Явное предупреждение о роли приложения
- ✅ Ссылка на врача как источник назначений

---

## 📱 Структура экрана

### 1. Header
```tsx
<header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
  - Кнопка "Назад" (←)
  - Заголовок: "Добавить инсулин"
</header>
```

---

### 2. Медицинский дисклеймер
- ⚠️ Amber/orange градиентный фон
- Чёткое сообщение о роли приложения
- Жирный текст для ключевых фраз
- Всегда виден при заполнении формы

---

### 3. Тип инсулина (Chips Grid)
```tsx
<div className="grid grid-cols-2 gap-2">
  {insulinTypes.map(type => (
    <button className="p-3 rounded-xl border-2">
      <div>{type.icon}</div>
      <div>{type.label}</div>
    </button>
  ))}
</div>
```

**5 типов:**
1. ⚡ **Быстрый** (rapid)
2. ⏱️ **Короткий** (short)
3. 🌙 **Базальный** (basal)
4. 🔄 **Смешанный** (mixed)
5. 📝 **Другой** (other)

**UX:**
- Grid layout 2 колонки
- Иконка + текст
- Активный тип: синяя рамка + фон
- Обязательное поле с валидацией

---

### 4. Препарат (Chips)
```tsx
<div className="flex flex-wrap gap-2">
  {insulinNames.map(name => (
    <button className="px-4 py-2 rounded-xl font-medium">
      {name.label}
    </button>
  ))}
</div>
```

**7 препаратов:**
1. НовоРапид
2. Туджео
3. Лантус
4. Левемир
5. Хумалог
6. Апидра
7. Другое

**UX:**
- Горизонтальная прокрутка если не помещается
- Активный препарат: синий фон + белый текст
- Компактные кнопки
- Обязательное поле

---

### 5. Количество единиц (Крупное поле)
```tsx
<div className="flex items-center gap-3">
  <button onClick={() => adjustUnits(-0.5)}>−</button>
  
  <input
    type="number"
    inputMode="decimal"
    step="0.5"
    min="0.5"
    max="100"
    placeholder="5.0"
    className="text-5xl font-bold text-center py-6"
  />
  
  <button onClick={() => adjustUnits(0.5)}>+</button>
</div>
```

**Особенности:**
- **Огромный размер шрифта** (text-5xl) для удобства
- **Центрированный текст** для фокуса внимания
- **Numeric keyboard** через `inputMode="decimal"`
- **Шаг 0.5** (кратность дозе)
- **Кнопки ±0.5** для быстрой корректировки
- **Суффикс "ед"** внутри поля
- **Валидация**: 0.5 - 100 единиц

**Функция adjustUnits:**
```typescript
const adjustUnits = (delta: number) => {
  const current = parseFloat(units) || 0;
  const newValue = Math.max(0.5, Math.min(100, current + delta));
  setUnits(newValue.toFixed(1));
};
```

---

### 6. Место инъекции (Необязательное)
```tsx
<div className="grid grid-cols-2 gap-2">
  {injectionSites.map(site => (
    <button className="p-3 rounded-xl border-2">
      <div>{site.icon}</div>
      <div>{site.label}</div>
    </button>
  ))}
</div>
```

**4 места:**
1. 🔵 Живот
2. 🦵 Бедро
3. 💪 Рука
4. 🍑 Ягодица

**UX:**
- Grid layout 2 колонки
- Иконка + текст
- Активное место: фиолетовая рамка + фон
- Необязательное поле

---

### 7. Дата и время
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

### 8. Комментарий (Необязательный)
```tsx
<textarea
  placeholder="Например: перед обедом, после тренировки..."
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

### 9. Кнопка "Сохранить" (Fixed Bottom)
```tsx
<div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg p-4">
  <button 
    disabled={!insulinType || !insulinName || !units}
    className="w-full py-4 px-6 rounded-2xl"
  >
    Сохранить
  </button>
</div>
```

**UX:**
- Fixed positioning внизу экрана
- Всегда видна (не нужно скроллить)
- Disabled state если нет обязательных полей
- Градиентный фон когда активна (blue-cyan)
- Safe area padding для iPhone
- Backdrop blur для современного вида

---

### 10. Success State
```tsx
<div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center">
  {/* Blue insulin icon */}
  <h2>Инсулин записан</h2>
  <div className="text-5xl font-bold">{units}</div>
  <div>единиц</div>
  
  {/* Info */}
  <div>{type icon} {type label}</div>
  <div>{insulin name}</div>
  {injectionSite && <div>{site icon} {site label}</div>}
  
  {/* Buttons */}
  <button>Добавить ещё</button>
  <button>На главную</button>
</div>
```

**Элементы:**
- 💉 Синяя иконка успеха (градиент blue-cyan)
- ✓ Большое значение дозы
- ✓ Тип инсулина с иконкой
- ✓ Название препарата
- ✓ Место инъекции (если указано)
- ✓ Две кнопки действий

**Кнопки действий:**
1. **"Добавить ещё"** - сброс формы, новая запись
2. **"На главную"** - переход на Dashboard (/)

---

## 🔧 Валидация

### Insulin Type (Обязательное)
```typescript
if (!insulinType) → "Выберите тип инсулина"
```

### Insulin Name (Обязательное)
```typescript
if (!insulinName) → "Выберите препарат"
```

### Units (Обязательное)
```typescript
if (!units) → "Введите количество единиц"
if (isNaN(units)) → "Введите корректное число"
if (units < 0.5) → "Минимальная доза 0.5 единиц"
if (units > 100) → "Максимальная доза 100 единиц"
if (units % 0.5 !== 0) → "Доза должна быть кратна 0.5"
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

### Цветовая схема
| Элемент | Цвета |
|---------|-------|
| Дисклеймер | amber-50 to orange-50 |
| Тип инсулина (active) | blue-500 border + bg |
| Препарат (active) | blue-500 bg |
| Место инъекции (active) | purple-500 border + bg |
| Кнопка сохранения | blue-500 to cyan-600 gradient |
| Success icon | blue-500 to cyan-600 gradient |

### Анимации
- **active:scale-[0.98]** - тактильная обратная связь на кнопках
- **transition-all duration-200** - плавные переходы
- **hover:bg-gray-200** - подсветка при наведении

### Типографика
- **Заголовки**: text-xl / text-2xl font-bold
- **Значение дозы**: text-5xl font-bold (огромное)
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
✅ **Кнопки ±0.5** - быстрая корректировка дозы  
✅ **Grid типов** - компактно, видно все варианты  
✅ **Автофокус** можно добавить на units  

### Скорость ввода
✅ **Numeric keyboard** - только цифры и точка  
✅ **Quick adjustment** - кнопки +/- для изменения  
✅ **Default datetime** - не нужно выбирать время  
✅ **Comment optional** - можно пропустить  

### Безопасность
✅ **Явный дисклеймер** - нет медицинских назначений  
✅ **Валидация диапазона** - 0.5-100 единиц  
✅ **Шаг 0.5** - предотвращает некорректные дозы  
✅ **Нет рекомендаций** - только запись данных  

---

## 🔌 Mock Implementation

### Save Function
```typescript
const mockSave = async (data: any) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Saved insulin:', data);
  return { success: true };
};
```

### Data Structure
```typescript
{
  insulinType: 'rapid',              // InsulinType
  insulinName: 'novorapid',          // InsulinName
  units: 5.0,                        // number
  injectionSite: 'abdomen' | null,   // string | null
  measuredAt: '2024-01-15T14:30',    // ISO string
  comment: 'Перед обедом'            // string | null
}
```

### API Integration (TODO)
Заменить mock на реальный вызов:
```typescript
import { insulinApi } from '../features/insulin/api';

await insulinApi.create({
  insulinType,
  insulinName,
  units: parseFloat(units),
  injectionSite: injectionSite || null,
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
- **Minimum**: 48x48px (кнопки типов и мест)
- **Adjust buttons**: 48x48px (w-12 h-12)
- **Input field**: 80px height (py-6)
- **Save button**: 56px height (py-4)

### Dark Mode
- Полная поддержка через `dark:` классы
- bg-gray-900, text-gray-100
- Корректные контрасты

---

## ✅ Критерии готовности

- ✅ **Пользователь может выбрать тип**
  - 5 вариантов с иконками
  - Grid layout для удобства
  - Active state highlighting
  - Валидация обязательности

- ✅ **Пользователь может выбрать препарат**
  - 7 популярных препаратов
  - Chips layout с прокруткой
  - Active state highlighting
  - Валидация обязательности

- ✅ **Пользователь может ввести дозу**
  - Крупное поле ввода (text-5xl)
  - Numeric keyboard
  - Кнопки ±0.5 для корректировки
  - Валидация диапазона 0.5-100
  - Шаг 0.5 enforced

- ✅ **Пользователь может сохранить**
  - Fixed bottom кнопка
  - Disabled state пока форма неполная
  - Mock save function
  - Success state после сохранения

- ✅ **Нет медицинских рекомендаций**
  - Явный дисклеймер вверху
  - Нет расчётов доз
  - Нет советов по лечению
  - Ссылка на врача

- ✅ **Success state работает**
  - Синяя иконка 💉
  - Большое значение дозы
  - Информация о типе и препарате
  - Две кнопки действий
  - Возможность добавить ещё или вернуться

---

## 🎯 Особенности реализации

### Type Safety
```typescript
type InsulinType = 'rapid' | 'short' | 'basal' | 'mixed' | 'other';
type InsulinName = 'novorapid' | 'tudjeo' | 'lantus' | 'levemir' | 'humalog' | 'apidra' | 'other';

interface OptionItem {
  value: string;
  label: string;
  icon?: string;
}
```

### State Management
```typescript
// Form state
const [insulinType, setInsulinType] = useState<InsulinType | ''>('');
const [insulinName, setInsulinName] = useState<InsulinName | ''>('');
const [units, setUnits] = useState<string>('');
const [injectionSite, setInjectionSite] = useState<string>('');
const [comment, setComment] = useState('');
const [dateTime, setDateTime] = useState(dayjs().format('YYYY-MM-DDTHH:mm'));

// Validation
const [errors, setErrors] = useState<{...}>({});

// UI
const [showSuccess, setShowSuccess] = useState(false);
```

### Navigation
```typescript
const navigate = useNavigate();

// Back
navigate(-1);

// Success actions
navigate('/'); // Home
// or reset form for another entry
```

---

## 🚀 Как использовать

### Импорт и роутинг
```tsx
import AddInsulinPage from './pages/AddInsulinPage';

// В App.tsx
<Route path="/add-insulin" element={<AddInsulinPage />} />
```

### Навигация к странице
```tsx
// Из HomePage
<button onClick={() => navigate('/add-insulin')}>
  💉 Инсулин
</button>
```

### API Integration (когда будет готов backend)
1. Создать `features/insulin/api.ts`
2. Заменить mockSave на `await insulinApi.create(...)`
3. Добавить try-catch error handling
4. Добавить loading state (опционально)

---

## 📝 Итог

**AddInsulinPage полностью готов!**

✅ **Безопасность** - явные медицинские дисклеймеры  
✅ **Удобный ввод** - крупные элементы, кнопки ±0.5  
✅ **Валидация** - comprehensive checks  
✅ **Типы и препараты** - chips/cards selection  
✅ **Success state** - confirmation screen  
✅ **One-handed use** - оптимизировано  
✅ **Mobile-first** - идеально для Telegram Mini App  
✅ **Dark mode** - полная поддержка  
✅ **No medical advice** - только запись данных  

**Файл:** [`packages/miniapp/src/pages/AddInsulinPage.tsx`](file://d:\Project\diabeta\packages\miniapp\src\pages\AddInsulinPage.tsx)

**Готово к использованию!** 🚀✨
