import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, LogOut, Shield, User, Clock, CheckCircle } from 'lucide-react';

interface Props {
  onOpenAdmin: () => void;
  onOpenHistory: () => void;
  savedCount?: number;
}

export const UserNav: React.FC<Props> = ({ onOpenAdmin, onOpenHistory, savedCount = 0 }) => {
  const { user, isAdmin, login, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-xs text-blue-200">
        <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        <span>Verificando sesión...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={login}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-all shadow-xs cursor-pointer"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Iniciar Sesión (Google)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2.5">
      {/* Advisor / User Tag */}
      <div className="flex items-center space-x-2 bg-blue-950/70 border border-blue-800/80 px-2.5 py-1 rounded-lg">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="w-6 h-6 rounded-full border border-blue-400/40"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-blue-800 text-blue-200 flex items-center justify-center text-[11px] font-bold">
            {user.displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="text-left hidden sm:block">
          <p className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
            {user.displayName}
          </p>
          <div className="flex items-center space-x-1">
            {isAdmin ? (
              <span className="text-[10px] font-bold text-amber-300 flex items-center space-x-0.5">
                <Shield className="w-2.5 h-2.5" />
                <span>Admin</span>
              </span>
            ) : (
              <span className="text-[10px] text-blue-300">Asesor</span>
            )}
          </div>
        </div>
      </div>

      {/* Button for personal history */}
      <button
        type="button"
        onClick={onOpenHistory}
        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-100 bg-blue-900/60 hover:bg-blue-900 border border-blue-700/60 transition-colors cursor-pointer"
        title="Ver mis cotizaciones guardadas"
      >
        <Clock className="w-3.5 h-3.5 text-blue-300" />
        <span className="hidden md:inline">Mis Cotizaciones</span>
        {savedCount > 0 && (
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-700 text-white">
            {savedCount}
          </span>
        )}
      </button>

      {/* Button for Admin Panel */}
      {isAdmin && (
        <button
          type="button"
          onClick={onOpenAdmin}
          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 border border-amber-300 transition-colors cursor-pointer shadow-2xs"
          title="Abrir Panel de Administración"
        >
          <Shield className="w-3.5 h-3.5 text-amber-950" />
          <span>Panel Admin</span>
        </button>
      )}

      {/* Logout */}
      <button
        type="button"
        onClick={logout}
        className="p-1.5 rounded-lg text-blue-300 hover:text-white hover:bg-blue-900/70 transition-colors cursor-pointer"
        title="Cerrar sesión"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
};
