import React, { useEffect, useState } from 'react';
import {
  fetchAllUsersForAdmin,
  fetchAllComparisonsForAdmin,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
  deleteComparisonDoc,
  AppUserProfile,
  SavedComparisonDoc,
  BOOTSTRAPPED_ADMIN_EMAIL,
} from '../lib/firebase';
import {
  Users,
  Shield,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Lock,
  ArrowLeft,
  Trash2,
  Edit2,
  UserPlus,
  Award,
  X,
  Mail,
  UserCheck,
} from 'lucide-react';

interface Props {
  onBackToApp: () => void;
}

export const AdminPanel: React.FC<Props> = ({ onBackToApp }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'stats'>('users');
  const [users, setUsers] = useState<AppUserProfile[]>([]);
  const [comparisons, setComparisons] = useState<SavedComparisonDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Modal state for Create / Edit User
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [targetUser, setTargetUser] = useState<AppUserProfile | null>(null);

  // Form fields
  const [formDisplayName, setFormDisplayName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formRole, setFormRole] = useState<'admin' | 'advisor'>('advisor');
  const [formStatus, setFormStatus] = useState<'active' | 'pending' | 'suspended'>('active');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    setActionMessage(null);
    try {
      const [uList, cList] = await Promise.all([
        fetchAllUsersForAdmin().catch(() => []),
        fetchAllComparisonsForAdmin().catch(() => []),
      ]);
      setUsers(uList);
      setComparisons(cList);
    } catch (err: any) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setTargetUser(null);
    setFormDisplayName('');
    setFormEmail('');
    setFormRole('advisor');
    setFormStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (u: AppUserProfile) => {
    setModalMode('edit');
    setTargetUser(u);
    setFormDisplayName(u.displayName);
    setFormEmail(u.email);
    setFormRole(u.role);
    setFormStatus(u.status);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDisplayName.trim() || !formEmail.trim()) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (modalMode === 'create') {
        const newUser = await createUserByAdmin({
          displayName: formDisplayName,
          email: formEmail,
          role: formRole,
          status: formStatus,
        });
        setUsers([newUser, ...users]);
        setActionMessage(`Usuario "${newUser.displayName}" creado con éxito.`);
      } else if (modalMode === 'edit' && targetUser) {
        await updateUserByAdmin(targetUser.uid, {
          displayName: formDisplayName,
          email: formEmail,
          role: formRole,
          status: formStatus,
        });
        setUsers(
          users.map((u) =>
            u.uid === targetUser.uid
              ? {
                  ...u,
                  displayName: formDisplayName,
                  email: formEmail,
                  role: formRole,
                  status: formStatus,
                }
              : u
          )
        );
        setActionMessage(`Usuario "${formDisplayName}" modificado con éxito.`);
      }

      setIsModalOpen(false);
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err: any) {
      alert('Error al guardar usuario: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: AppUserProfile) => {
    if (user.email === BOOTSTRAPPED_ADMIN_EMAIL) {
      alert('El administrador principal de la corredora no puede ser eliminado.');
      return;
    }

    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar permanentemente a "${user.displayName}" (${user.email})? Esta acción revocará todos sus accesos.`
    );
    if (!confirmDelete) return;

    try {
      await deleteUserByAdmin(user.uid, user.email);
      setUsers(users.filter((u) => u.uid !== user.uid));
      setActionMessage(`Usuario "${user.displayName}" eliminado del sistema.`);
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err: any) {
      alert('Error al eliminar usuario: ' + err.message);
    }
  };

  const handleDeleteComparison = async (id: string) => {
    if (!window.confirm('¿Eliminar este registro de comparación del registro de auditoría?')) return;
    try {
      await deleteComparisonDoc(id);
      setComparisons(comparisons.filter((c) => c.id !== id));
      setActionMessage('Registro de comparación eliminado.');
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredComparisons = comparisons.filter(
    (c) =>
      c.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.vehicleAndUsage?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.propuestaRecomendada?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics calculation
  const totalComparisons = comparisons.length;
  const activeUsersCount = users.filter((u) => u.status === 'active').length;
  const adminsCount = users.filter((u) => u.role === 'admin').length;

  const insurerCounts: Record<string, number> = {};
  comparisons.forEach((c) => {
    const ins = c.propuestaRecomendada || 'Otras';
    insurerCounts[ins] = (insurerCounts[ins] || 0) + 1;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Bar with Return button */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onBackToApp}
            className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-bold text-[#0A2540] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-blue-800" />
            <span>Volver al Comparador</span>
          </button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                <Shield className="w-3.5 h-3.5 text-amber-700" />
                <span>Panel de Administración</span>
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">Control de Accesos y Seguridad</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              Gestión Integral de Usuarios
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-blue-800 hover:bg-blue-900 shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Crear Usuario</span>
          </button>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-2xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-4 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer flex items-center space-x-2 ${
            activeTab === 'users'
              ? 'border-blue-800 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Control de Usuarios ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer flex items-center space-x-2 ${
            activeTab === 'audit'
              ? 'border-blue-800 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Auditoría de Comparaciones ({comparisons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer flex items-center space-x-2 ${
            activeTab === 'stats'
              ? 'border-blue-800 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Estadísticas de la Corredora</span>
        </button>
      </div>

      {/* TAB 1: USERS MANAGEMENT (CRUD) */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Directorio de Usuarios y Permisos
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Crea, modifica datos, asigna roles o elimina cuentas de asesores y administradores.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o correo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-800 hover:bg-blue-900 transition-colors shrink-0 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Nuevo</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="p-3.5">Usuario / Asesor</th>
                  <th className="p-3.5">Correo Electrónico</th>
                  <th className="p-3.5 text-center">Rol en Sistema</th>
                  <th className="p-3.5 text-center">Estado</th>
                  <th className="p-3.5 text-right">Acciones (Modificar / Eliminar)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                      No se encontraron usuarios registrados.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isRoot = u.email === BOOTSTRAPPED_ADMIN_EMAIL;
                    return (
                      <tr key={u.uid} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 font-bold text-slate-800">
                          <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs shrink-0">
                              {u.displayName ? u.displayName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <span>{u.displayName || 'Asesor'}</span>
                              {isRoot && (
                                <span className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                  Super Admin
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-600 font-mono text-[11px]">{u.email}</td>
                        <td className="p-3.5 text-center">
                          {u.role === 'admin' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                              <Shield className="w-3 h-3 mr-1 text-blue-700" />
                              Administrador
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                              Asesor Final
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          {u.status === 'active' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                              <CheckCircle className="w-3 h-3 mr-1 text-emerald-600" />
                              Activo
                            </span>
                          ) : u.status === 'pending' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                              <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
                              Pendiente
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800">
                              <XCircle className="w-3 h-3 mr-1 text-rose-600" />
                              Suspendido
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right space-x-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(u)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-100 text-blue-800 font-semibold transition-colors cursor-pointer"
                            title="Modificar usuario"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Modificar</span>
                          </button>

                          {!isRoot ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u)}
                              className="inline-flex items-center space-x-1 px-2 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold transition-colors cursor-pointer"
                              title="Eliminar usuario permanentemente"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Eliminar</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 italic text-[11px] px-2">
                              Protegido
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Registro de Auditoría de Comparaciones
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Historial centralizado de cotizaciones analizadas por todos los asesores para control de cumplimiento SUGESE.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por cliente o auto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="p-3.5">Cliente</th>
                  <th className="p-3.5">Vehículo</th>
                  <th className="p-3.5">Presupuesto</th>
                  <th className="p-3.5">Propuesta Recomendada</th>
                  <th className="p-3.5">Fecha</th>
                  <th className="p-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredComparisons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                      No hay registros de comparaciones guardadas aún.
                    </td>
                  </tr>
                ) : (
                  filteredComparisons.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-bold text-slate-800">{c.clientName}</td>
                      <td className="p-3.5 text-slate-600">{c.vehicleAndUsage}</td>
                      <td className="p-3.5 font-semibold text-emerald-700">
                        ₡{Number(c.maxBudgetColones || 0).toLocaleString('es-CR')}
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                          {c.propuestaRecomendada || 'Analizada'}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 text-[11px]">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString('es-CR') : '-'}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteComparison(c.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Eliminar de la auditoría"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STATS & SETTINGS */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Asesores Activos
            </span>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900">{activeUsersCount}</span>
              <span className="text-xs text-slate-500">de {users.length} usuarios totales</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {adminsCount} usuario(s) con privilegios de Administrador.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Comparaciones Ejecutadas
            </span>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-blue-900">{totalComparisons}</span>
              <span className="text-xs text-slate-500">análisis con IA generados</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Documentos procesados bajo el modelo Gemini 3.8 Flash.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Aseguradora Más Sugerida
            </span>
            <div className="mt-2 text-xl font-bold text-emerald-700">
              {Object.entries(insurerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Sin datos'}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Basado en coincidencia con coberturas obligatorias y presupuesto.
            </p>
          </div>

          <div className="md:col-span-3 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <Lock className="w-5 h-5 text-blue-800" />
              <h3 className="text-base font-bold text-slate-800">
                Parámetros de Seguridad en Producción
              </h3>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <strong className="block text-slate-800 font-semibold mb-1">
                  Control de Acceso Basado en Roles (RBAC)
                </strong>
                Protección a nivel de base de datos (`firestore.rules`) garantizando que los asesores solo pueden leer y consultar sus propios informes, mientras que el Administrador tiene visión global de auditoría.
              </div>
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <strong className="block text-slate-800 font-semibold mb-1">
                  Autenticación Empresarial
                </strong>
                Inicio de sesión mediante Google Workspace con validación estricta de correo electrónico (`email_verified == true`), impidiendo registros anónimos o vectores de suplantación.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
                  {modalMode === 'create' ? <UserPlus className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  {modalMode === 'create' ? 'Crear Nuevo Usuario' : 'Modificar Usuario'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre completo del asesor o administrador:
                </label>
                <input
                  type="text"
                  required
                  value={formDisplayName}
                  onChange={(e) => setFormDisplayName(e.target.value)}
                  placeholder="Ej: Lic. María Elena Chaves"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Correo electrónico:
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="asesor@corredorabn.fi.cr"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Rol asignado:
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as 'admin' | 'advisor')}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                  >
                    <option value="advisor">Asesor Final</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Estado de cuenta:
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'active' | 'pending' | 'suspended')}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                  >
                    <option value="active">Activo</option>
                    <option value="pending">Pendiente</option>
                    <option value="suspended">Suspendido</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-3.5 py-2 rounded-lg font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg font-bold text-white bg-blue-800 hover:bg-blue-900 transition-colors shadow-xs cursor-pointer flex items-center space-x-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>{modalMode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
