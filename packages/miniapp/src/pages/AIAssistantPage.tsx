import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickQuestions = [
  'Почему сахар вечером выше?',
  'Что спросить у врача?',
  'Объясни мой отчёт',
  'Что такое ХЕ?',
  'Как лучше вести дневник?',
];

// Safety keywords that trigger safe response
const safetyKeywords = [
  'сколько инсулина',
  'какую дозу',
  'увеличить дозу',
  'уменьшить дозу',
  'дозировка',
  'назначить лечение',
  'изменить лечение',
  'сколько единиц',
  'какой инсулин',
];

// Check if question needs safe response
const needsSafeResponse = (question: string): boolean => {
  const lowerQuestion = question.toLowerCase();
  return safetyKeywords.some(keyword => lowerQuestion.includes(keyword));
};

// Mock AI response generator
const generateMockResponse = (question: string): string => {
  // Safety check first
  if (needsSafeResponse(question)) {
    return 'Я не могу назначать дозировки или менять лечение. Обсудите это с врачом. Я могу помочь подготовить вопросы для консультации.';
  }

  // Mock responses based on question patterns
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes('вечером') && lowerQuestion.includes('выше')) {
    return 'Вечернее повышение сахара — распространённое явление. Это может быть связано с:\n\n• Ужином и количеством углеводов\n• Снижением физической активности вечером\n• Естественными циркадными ритмами организма\n• Стрессом после рабочего дня\n\nРекомендую обсудить эту тенденцию с вашим эндокринологом. Он поможет скорректировать терапию при необходимости.';
  }

  if (lowerQuestion.includes('спросить у врача')) {
    return 'Вот важные вопросы для консультации с врачом:\n\n1. Как часто нужно измерять сахар?\n2. Какие целевые значения мне подходят?\n3. Нужно ли корректировать дозировки?\n4. Как питание влияет на мой сахар?\n5. Какие признаки гипо/гипергликемии мне важны?\n6. Нужны ли дополнительные обследования?\n7. Как физическая активность влияет на мой контроль?\n\nЗапишите свои наблюдения из дневника — это поможет врачу дать точные рекомендации.';
  }

  if (lowerQuestion.includes('отчёт') || lowerQuestion.includes('анализ')) {
    return 'На основе вашего дневника за последние 14 дней:\n\n📊 Общая статистика:\n• Средний сахар: 6.8 ммоль/л\n• В целевом диапазоне: 68% времени\n• Измерений: 42\n\n🔍 Наблюдения:\n• Вечерние значения чаще выше средних\n• После физической активности наблюдается снижение\n• Завтраки стабильнее ужинов\n\n⚠️ Важно: Это общая информация. Для медицинских рекомендаций обратитесь к врачу.';
  }

  if (lowerQuestion.includes('хе') || lowerQuestion.includes('хлебные единицы')) {
    return 'ХЕ (хлебная единица) — это условная мера количества углеводов в пище.\n\n📏 1 ХЕ = 10-12 г углеводов\n\nПримеры:\n• 1 кусок хлеба = 1 ХЕ\n• 1 среднее яблоко = 1 ХЕ\n• 100 г варёной гречки = 2 ХЕ\n• 1 стакан молока = 1 ХЕ\n\nЗачем считать ХЕ:\n• Помогает рассчитать дозу инсулина на еду\n• Позволяет контролировать углеводы\n• Упрощает планирование питания\n\nDiaBeta автоматически рассчитывает ХЕ на основе указанных углеводов (ХЕ = углеводы / 12).';
  }

  if (lowerQuestion.includes('вести дневник') || lowerQuestion.includes('как записывать')) {
    return 'Советы по ведению дневника:\n\n✅ Записывайте регулярно:\n• Измеряйте сахар в одно и то же время\n• Фиксируйте все приёмы пищи\n• Отмечайте инсулин сразу после инъекции\n\n✅ Будьте последовательны:\n• Используйте одинаковые контексты (до/после еды)\n• Добавляйте комментарии о самочувствии\n• Отмечайте физическую активность\n\n✅ Анализируйте:\n• Смотрите графики раз в неделю\n• Ищите закономерности\n• Делитесь данными с врачом\n\n💡 Чем подробнее дневник, тем полезнее анализ!';
  }

  // Default response
  return 'Спасибо за вопрос! Я помогу разобраться с информацией из вашего дневника.\n\nПомните, что я не заменяю врача и не назначаю лечение. Моя задача — помочь вам понять данные и подготовиться к консультации с врачом.\n\nЕсли у вас есть конкретные вопросы по записям в дневнике, задавайте!';
};

const AiAssistantPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Привет! 👋 Я ваш AI-ассистент. Помогу разобраться с дневником диабета, объясню термины и подскажу, что важно обсудить с врачом.\n\nЧем могу помочь?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle send message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateMockResponse(userMessage.content),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // 1-2 seconds delay
  };

  // Handle quick question
  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    // Optionally auto-send
    // setTimeout(() => handleSendMessage(), 100);
  };

  // Handle analyze diary
  const handleAnalyzeDiary = () => {
    const question = 'Проанализируй мой дневник за последние 14 дней';
    setInputValue(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 px-4 py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI-ассистент</h1>
      </header>

      {/* Warning Banner */}
      <div className="px-4 py-3 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-b border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
            AI помогает разобраться с дневником и терминами, но <strong>не заменяет врача</strong> и{' '}
            <strong>не назначает лечение</strong>.
          </p>
        </div>
      </div>

      {/* Quick Questions */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Быстрые вопросы:</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuickQuestion(question)}
              className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl text-sm font-medium whitespace-nowrap hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors active:scale-95"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md shadow-sm'
              }`}
            >
              <p className="text-sm whitespace-pre-line">{message.content}</p>
              <p
                className={`text-xs mt-2 ${
                  message.role === 'user'
                    ? 'text-blue-100'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Analyze Diary Button */}
      <div className="px-4 py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleAnalyzeDiary}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
        >
          <span>📊</span>
          <span>Проанализировать дневник за 14 дней</span>
        </button>
      </div>

      {/* Input Area - Fixed Bottom */}
      <div className="sticky bottom-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 p-4 safe-area-bottom">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Напишите вопрос…"
            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className={`p-3 rounded-xl transition-all active:scale-95 ${
              !inputValue.trim() || isTyping
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 hover:from-blue-600 hover:to-blue-700'
            }`}
            aria-label="Отправить"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiAssistantPage;
