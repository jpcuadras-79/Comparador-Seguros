import React from 'react';
import { User, Car, DollarSign, CheckSquare, MessageSquare, CreditCard, RotateCcw } from 'lucide-react';
import { ClientProfile } from '../types/insurance';

interface Props {
  profile: ClientProfile;
  onChange: (profile: ClientProfile) => void;
  isLoading: boolean;
}

export const ClientProfileForm: React.FC<Props> = ({ profile, onChange, isLoading }) => {
  const handleTextChange = (field: keyof ClientProfile, value: any) => {
    onChange({
      ...profile,
      [field]: value,
    });
  };

  const handleCoverageToggle = (coverageKey: keyof ClientProfile['mandatoryCoverages']) => {
    onChange({
      ...profile,
      mandatoryCoverages: {
        ...profile.mandatoryCoverages,
        [coverageKey]: !profile.mandatoryCoverages[coverageKey],
      },
    });
  };

  const setQuickBudget = (amount: number) => {
    handleTextChange('maxBudgetColones', amount);
  };

  const handleResetToDefaultExample = () => {
    onChange({
      clientName: 'Carlos Alvarado Mora',
      vehicleAndUsage: 'Toyota RAV4 2023 - Uso Particular y viajes de trabajo',
      maxBudgetColones: 650000,
      mandatoryCoverages: {
        colision: true,
        robo: true,
        asistenciaVial: true,
        fenomenosNaturales: true,
        vehiculoSustituto: true,
      },
      priorities:
        'Prioridad: menor deducible en colisión y que incluya vehículo sustituto sin cobro adicional.',
      paymentMethod: 'Anual de contado',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0A2540] text-white text-xs font-bold">
              2
            </span>
            <h2 className="text-lg font-bold text-slate-800">Perfil del cliente</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Define las necesidades, presupuesto y coberturas exigidas por el cliente para la validación automática.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetToDefaultExample}
          disabled={isLoading}
          className="inline-flex items-center space-x-1 text-xs text-slate-600 hover:text-blue-700 hover:underline cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer datos de ejemplo</span>
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Nombre del Cliente */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
            <User className="w-3.5 h-3.5 text-blue-800" />
            <span>Nombre del cliente</span>
            <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            disabled={isLoading}
            value={profile.clientName}
            onChange={(e) => handleTextChange('clientName', e.target.value)}
            placeholder="Ej: Carlos Alvarado Mora"
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-all"
          />
        </div>

        {/* Vehículo y uso */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
            <Car className="w-3.5 h-3.5 text-blue-800" />
            <span>Vehículo y uso</span>
            <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            disabled={isLoading}
            value={profile.vehicleAndUsage}
            onChange={(e) => handleTextChange('vehicleAndUsage', e.target.value)}
            placeholder="Ej: Toyota RAV4 2023 - Uso particular"
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-all"
          />
        </div>

        {/* Presupuesto máximo anual (colones) */}
        <div className="md:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>Presupuesto máximo anual (colones ₡)</span>
              <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center space-x-1 text-xs text-slate-500">
              <span>Sugeridos:</span>
              <button
                type="button"
                onClick={() => setQuickBudget(500000)}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] cursor-pointer"
              >
                ₡500k
              </button>
              <button
                type="button"
                onClick={() => setQuickBudget(650000)}
                className="px-2 py-0.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium text-[11px] cursor-pointer"
              >
                ₡650k
              </button>
              <button
                type="button"
                onClick={() => setQuickBudget(750000)}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] cursor-pointer"
              >
                ₡750k
              </button>
              <button
                type="button"
                onClick={() => setQuickBudget(1000000)}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] cursor-pointer"
              >
                ₡1M
              </button>
            </div>
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-sm">
              ₡
            </span>
            <input
              type="number"
              min={0}
              step={10000}
              disabled={isLoading}
              value={profile.maxBudgetColones || ''}
              onChange={(e) => handleTextChange('maxBudgetColones', Number(e.target.value) || 0)}
              placeholder="650000"
              className="w-full pl-8 pr-3.5 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 transition-all"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Monto límite que el cliente está dispuesto a pagar al año. (Valor actual:{' '}
            <strong className="text-slate-800">
              ₡{Number(profile.maxBudgetColones || 0).toLocaleString('es-CR')} CRC
            </strong>
            )
          </p>
        </div>

        {/* Coberturas obligatorias (casillas) */}
        <div className="md:col-span-2 bg-slate-50/70 rounded-xl p-4 border border-slate-200">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-blue-800" />
            <span>Coberturas obligatorias (el semáforo exige que estén incluidas en la prima)</span>
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Marca las coberturas que el cliente considera indispensables. Si una propuesta las cobra por separado como paquete opcional, se marcará que NO cumple.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {[
              { key: 'colision', label: 'Colisión (Daño propio y vuelco)' },
              { key: 'robo', label: 'Robo (Total y parcial)' },
              { key: 'asistenciaVial', label: 'Asistencia vial 24/7' },
              { key: 'fenomenosNaturales', label: 'Fenómenos naturales' },
              { key: 'vehiculoSustituto', label: 'Vehículo sustituto' },
            ].map(({ key, label }) => {
              const isChecked = profile.mandatoryCoverages[key as keyof ClientProfile['mandatoryCoverages']];
              return (
                <label
                  key={key}
                  className={`flex items-center space-x-3 p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-2xs font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    disabled={isLoading}
                    checked={isChecked}
                    onChange={() =>
                      handleCoverageToggle(key as keyof ClientProfile['mandatoryCoverages'])
                    }
                    className="w-4 h-4 text-blue-700 rounded border-slate-300 focus:ring-blue-500 accent-blue-800"
                  />
                  <span>{label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Prioridades (área de texto) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-blue-800" />
            <span>Prioridades del cliente</span>
          </label>
          <textarea
            rows={3}
            disabled={isLoading}
            value={profile.priorities}
            onChange={(e) => handleTextChange('priorities', e.target.value)}
            placeholder="Ej: Menor deducible en colisión, grúa sin límite en GAM y vehículo sustituto garantizado."
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-all resize-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Se usará para justificar la recomendación preliminar en 5 líneas.
          </p>
        </div>

        {/* Forma de pago preferida */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
            <CreditCard className="w-3.5 h-3.5 text-blue-800" />
            <span>Forma de pago preferida</span>
          </label>
          <select
            disabled={isLoading}
            value={profile.paymentMethod}
            onChange={(e) => handleTextChange('paymentMethod', e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-all"
          >
            <option value="Anual de contado">Anual de contado (transferencia o cheque)</option>
            <option value="Semestral">Semestral (2 cuotas)</option>
            <option value="Trimestral">Trimestral (4 cuotas)</option>
            <option value="Mensual con tarjeta de crédito/débito">
              Mensual con cargo automático a tarjeta (débito/crédito)
            </option>
            <option value="Financiamiento Tasa Cero">Tasa Cero / Cuotas sin intereses</option>
          </select>
          <p className="text-[11px] text-slate-400 mt-1">
            Modalidad preferida para estructurar la propuesta al cliente.
          </p>
        </div>
      </div>
    </div>
  );
};
