import React from 'react';
import { useAuthStore } from '../store/authStore';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-gray-800 mb-6">👤 Профиль</h1>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
            👤
          </div>
          <div>
            <p className="font-semibold text-gray-800">
              {user?.firstName} {user?.lastName}
            </p>
            {user?.username && <p className="text-sm text-gray-500">@{user.username}</p>}
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100 mb-4">
        <p className="text-sm font-semibold text-yellow-800 mb-1">⚠️ Важное предупреждение</p>
        <p className="text-xs text-yellow-700">
          DiaBeta — информационный сервис. Он не является медицинским устройством, не ставит диагнозы
          и не назначает лечение. Все решения о лечении принимает только ваш лечащий врач.
        </p>
      </div>

      <button
        onClick={logout}
        className="w-full bg-red-50 text-red-600 border border-red-100 py-3 rounded-xl text-sm font-medium"
      >
        Выйти
      </button>
    </div>
  );
}