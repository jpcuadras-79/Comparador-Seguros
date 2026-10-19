import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Comparador de Propuestas BN</span>
            <span>•</span>
            <span>Corredora de Seguros Costa Rica</span>
          </div>

          <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 text-amber-900 px-3.5 py-2 rounded-lg text-xs font-medium max-w-2xl">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-left leading-normal">
              <strong>Aviso legal:</strong> Borrador generado con IA. Debe ser validado por un asesor contra las condiciones reales de la póliza. No suba datos reales de clientes.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
