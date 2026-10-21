import React, { useState, useEffect } from 'react';
import { Award, ArrowRight, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Opportunity } from '../types';

export const RightSidebar: React.FC = () => {
  const { user, openUserProfile, startDirectChat, setActiveTab } = useAuth();
  const [suggestedStudents, setSuggestedStudents] = useState<any[]>([]);
  const [upcomingOpportunities, setUpcomingOpportunities] = useState<Opportunity[]>([]);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const dirRes = await api.directory.search({ limit: 4 });
      setSuggestedStudents(dirRes.students.filter(s => s.id !== user?.id).slice(0, 3));

      const oppRes = await api.opportunities.list({ limit: 3 });
      setUpcomingOpportunities(oppRes.opportunities.slice(0, 3));
    } catch (_err) {}
  };

  return (
    <aside className="w-full space-y-5 py-4">
      
      {/* Approaching Scholarship Deadlines */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Bourses & Échéances
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('opportunities')}
            className="text-[11px] font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-0.5"
          >
            Voir tout <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {upcomingOpportunities.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">Aucune opportunité publiée pour l'instant.</p>
          ) : (
            upcomingOpportunities.map((op) => (
              <div
                key={op.id}
                onClick={() => setActiveTab('opportunities')}
                className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[11px] font-semibold text-blue-700 truncate">{op.organization}</span>
                  {op.is_verified && (
                    <span className="inline-flex items-center text-[10px] text-emerald-700 font-medium shrink-0">
                      <CheckCircle2 className="w-3 h-3 mr-0.5" /> Vérifiée
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-900 line-clamp-2 leading-snug">
                  {op.title}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>
                    {op.deadline
                      ? `Clôture le ${new Date(op.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`
                      : 'Candidatures ouvertes'}
                  </span>
                  <span>·</span>
                  <span className="truncate">{op.country}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Suggested Students Network */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Étudiants à découvrir
          </h3>
          <button
            onClick={() => setActiveTab('directory')}
            className="text-[11px] font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-0.5"
          >
            Annuaire <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {suggestedStudents.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">Aucun autre étudiant inscrit pour le moment.</p>
          ) : (
            suggestedStudents.map((st) => (
              <div key={st.id} className="flex items-start justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div
                  onClick={() => openUserProfile(st.id)}
                  className="flex items-start gap-2.5 min-w-0 cursor-pointer flex-1"
                >
                  <img
                    src={st.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                    alt=""
                    className="w-9 h-9 rounded-xl object-cover shrink-0 border border-slate-200"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate hover:text-blue-700">
                      {st.first_name} {st.last_name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate leading-tight">
                      {st.field_of_study}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {st.institution?.split('(')[0]?.trim()} · {st.country}
                    </p>
                  </div>
                </div>

                {user && user.id !== st.id && (
                  <button
                    onClick={() => startDirectChat(st.id)}
                    className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors shrink-0"
                    title="Envoyer un message"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Community Charter Footer */}
      <div className="px-2 text-[11px] text-slate-400 leading-relaxed space-y-1">
        <p className="font-medium text-slate-500">CampusHub Africa © 2026</p>
        <p>Bourses vérifiées · Cours partagés · Entraide académique panafricaine.</p>
        <div className="pt-2 flex flex-wrap gap-2 text-[10px] text-slate-500">
          <span className="hover:text-blue-700 cursor-pointer" onClick={() => setActiveTab('feed')}>Fil</span>
          <span>·</span>
          <span className="hover:text-blue-700 cursor-pointer" onClick={() => setActiveTab('opportunities')}>Bourses</span>
          <span>·</span>
          <span className="hover:text-blue-700 cursor-pointer" onClick={() => setActiveTab('resources')}>Ressources</span>
          <span>·</span>
          <span className="hover:text-blue-700 cursor-pointer" onClick={() => setActiveTab('directory')}>Annuaire</span>
        </div>
      </div>

    </aside>
  );
};
