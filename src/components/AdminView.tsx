import React, { useState, useEffect } from 'react';
import {
  Shield, Users, Award, BookOpen, AlertCircle, CheckCircle,
  XCircle, Search, ShieldAlert, History, UserCheck, UserX,
  Trash2, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ReportItem } from '../types';

export const AdminView: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'reports' | 'audit'>('stats');
  
  // Users state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  
  // Reports state
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    loadAllAdminData();
  }, [activeTab]);

  const loadAllAdminData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'stats') {
        const res = await api.admin.getStats();
        setStats(res.stats);
      } else if (activeTab === 'users') {
        const res = await api.admin.getUsers({
          search: userSearch || undefined,
          role: userRoleFilter !== 'ALL' ? userRoleFilter : undefined
        });
        setUsersList(res.users);
      } else if (activeTab === 'reports') {
        const res = await api.admin.getReports();
        setReports(res.reports);
      } else if (activeTab === 'audit') {
        const res = await api.admin.getAuditLogs();
        setAuditLogs(res.logs);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUserStatus = async (targetId: string, newStatus: string) => {
    const reason = prompt(`Motif du changement de statut vers ${newStatus} :`) || 'Modération administrative';
    try {
      await api.admin.updateUserStatus(targetId, newStatus, reason);
      setActionSuccess(`Statut utilisateur mis à jour en ${newStatus}.`);
      setTimeout(() => setActionSuccess(''), 3000);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResolveReport = async (reportId: string, status: string, deleteTarget: boolean) => {
    const note = prompt('Note de résolution de modération :') || 'Traité par l\'équipe';
    try {
      await api.admin.resolveReport(reportId, {
        status,
        resolutionNote: note,
        deleteTarget
      });
      setActionSuccess('Signalement résolu avec succès.');
      setTimeout(() => setActionSuccess(''), 3000);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-12 text-center text-red-700">
        <ShieldAlert className="w-12 h-12 mx-auto mb-2 text-red-600" />
        <h2 className="text-base font-bold">Accès Réservé aux Administrateurs</h2>
        <p className="text-xs text-red-600/80">Cette section est strictement restreinte aux modérateurs de CampusHub Africa.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-600" />
            <span>Tableau de Bord Administrateur & Modération</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gouvernance académique, gestion des utilisateurs, traitement des signalements et journaux d'audit
          </p>
        </div>

        <button
          onClick={loadAllAdminData}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          title="Actualiser"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" /> {actionSuccess}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white p-1 rounded-2xl">
        {[
          { id: 'stats', label: 'Indicateurs en direct', icon: Award },
          { id: 'users', label: 'Gestion Utilisateurs', icon: Users },
          { id: 'reports', label: 'Signalements & Modération', icon: ShieldAlert },
          { id: 'audit', label: 'Journal d\'audit', icon: History }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                isActive
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Stats */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold">Total Étudiants</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalUsers}</p>
              <span className="text-[11px] text-emerald-600 font-medium">Comptes vérifiés</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold">Bourses & Stages</span>
              <p className="text-2xl font-black text-blue-700 mt-1">{stats.totalOpportunities}</p>
              <span className="text-[11px] text-slate-400">{stats.verifiedOpportunities} certifiées</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold">Publications Fil</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalPosts}</p>
              <span className="text-[11px] text-slate-400">Échanges académiques</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold">Signalements en attente</span>
              <p className={`text-2xl font-black mt-1 ${stats.pendingReports > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {stats.pendingReports}
              </p>
              <span className="text-[11px] text-slate-400">À examiner</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Charte de Gouvernance & Modération Académique</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              En tant qu'administrateur ou modérateur de CampusHub Africa, vous garantissez l'exactitude des offres de bourses, protégez les étudiants contre les escroqueries de faux visas ou faux frais de dossier, et veillez au respect strict des règles de courtoisie et d'éthique universitaire.
            </p>
          </div>
        </div>
      )}

      {/* Tab: Users */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') loadAllAdminData(); }}
                placeholder="Chercher par nom ou e-mail..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none"
              >
                <option value="ALL">Tous les rôles</option>
                <option value="STUDENT">Étudiant</option>
                <option value="MODERATOR">Modérateur</option>
                <option value="ADMIN">Administrateur</option>
              </select>
              <button
                onClick={loadAllAdminData}
                className="px-3 py-1.5 bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Filtrer
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <th className="py-3 px-4">Utilisateur</th>
                  <th className="py-3 px-4">Établissement</th>
                  <th className="py-3 px-4">Rôle</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{u.first_name} {u.last_name}</p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <p className="truncate max-w-[200px]">{u.institution}</p>
                      <p className="text-[10px] text-slate-400">{u.country}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-blue-700">{u.role}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700'
                          : u.status === 'SUSPENDED'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      {u.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleUpdateUserStatus(u.id, 'SUSPENDED')}
                          className="px-2.5 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                        >
                          Suspendre
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateUserStatus(u.id, 'ACTIVE')}
                          className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                        >
                          Réactiver
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Reports */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Signalements reçus des étudiants</h3>
            <span className="text-xs text-slate-500">{reports.length} dossier(s)</span>
          </div>

          {reports.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-1">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="font-bold text-slate-800">Aucun signalement en attente</p>
              <p>Toutes les publications et annonces respectent la charte académique.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div key={rep.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded">
                        {rep.reason}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        Cible : {rep.target_type} ({rep.target_id})
                      </span>
                    </div>

                    {rep.details && (
                      <p className="text-xs text-slate-600 mt-1 italic bg-white p-2.5 rounded-lg border border-slate-200/60">
                        « {rep.details} »
                      </p>
                    )}

                    <div className="text-[11px] text-slate-400 pt-1">
                      Signalé par {rep.reporter_first_name} {rep.reporter_last_name} le{' '}
                      {new Date(rep.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <button
                      onClick={() => handleResolveReport(rep.id, 'RESOLVED', true)}
                      className="px-3 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition-colors"
                    >
                      Supprimer contenu
                    </button>
                    <button
                      onClick={() => handleResolveReport(rep.id, 'DISMISSED', false)}
                      className="px-3 py-1.5 text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition-colors"
                    >
                      Rejeter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Audit */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
            Journal des actions administratives & modération
          </h3>
          <div className="space-y-2.5 text-xs">
            {auditLogs.length === 0 ? (
              <p className="text-slate-400 py-6 text-center">Aucune action consignée pour l'instant.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-slate-500"> sur {log.target_type} ({log.target_id})</span>
                    {log.details && <p className="text-[11px] text-slate-500 mt-0.5">{log.details}</p>}
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(log.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};
