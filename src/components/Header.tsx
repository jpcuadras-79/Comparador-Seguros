import React from 'react';
import { Shield, Car } from 'lucide-react';
import { UserNav } from './UserNav';

interface Props {
  onOpenAdmin: () => void;
  onOpenHistory: () => void;
  savedCount?: number;
}

export const Header: React.FC<Props> = ({ onOpenAdmin, onOpenHistory, savedCount = 0 }) => {
  return (
    <header className="bg-[#0A2540] text-white shadow-md border-b border-blue-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="p-2.5 bg-gradient-to-br from-blue-700 to-blue-950 rounded-xl border border-blue-400/30 shadow-inner flex items-center justify-center shrink-0">
              <div className="relative">
                <Shield className="w-8 h-8 text-emerald-400" />
                <Car className="w-4 h-4 text-white absolute bottom-0.5 right-0.5" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Comparador de Propuestas BN
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Costa Rica
                </span>
                <span className="text-xs text-blue-200/70 hidden sm:inline-block">
                  Corredora de Seguros
                </span>
              </div>
              <p className="mt-0.5 text-xs sm:text-sm text-blue-100 font-normal">
                Compara propuestas de seguro de automóvil en minutos. La IA prepara, el asesor decide.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-end sm:self-auto">
            <UserNav
              onOpenAdmin={onOpenAdmin}
              onOpenHistory={onOpenHistory}
              savedCount={savedCount}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
