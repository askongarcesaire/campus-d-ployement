import React, { useState, useEffect } from 'react';
import {
  Users, Plus, X, Check, Building, Globe2, Sparkles, LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AcademicGroup } from '../types';

export const GroupsView: React.FC = () => {
  const { user, openAuthModal, setActiveTab } = useAuth();
  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    category: 'FILIERE',
    institution: '',
    country: 'Sénégal',
    isPrivate: false
  });

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setIsLoading(true);
    try {
      const res = await api.groups.list();
      setGroups(res.groups);
    } catch (_err) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleJoin = async (groupId: string) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    try {
      const res = await api.groups.join(groupId);
      setGroups(prev => prev.map(g => {
        if (g.id === groupId) {
          return {
            ...g,
            isMember: res.joined,
            members_count: res.joined ? g.members_count + 1 : Math.max(1, g.members_count - 1)
          };
        }
        return g;
      }));
    } catch (_err) {}
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }
    try {
      await api.groups.create(newGroup);
      setShowCreateModal(false);
      loadGroups();
      setNewGroup({
        name: '',
        description: '',
        category: 'FILIERE',
        institution: '',
        country: 'Sénégal',
        isPrivate: false
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-700" />
            <span>Groupes & Communautés Universitaires</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Rejoignez des cercles d'entraide par université, par filière ou par projet de mobilité
          </p>
        </div>

        <button
          onClick={() => {
            if (!user) openAuthModal('login');
            else setShowCreateModal(true);
          }}
          className="px-4 py-2 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un groupe</span>
        </button>
      </div>

      {/* Grid of Groups */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 animate-pulse">
              <div className="w-1/3 h-4 bg-slate-200 rounded" />
              <div className="w-full h-10 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3">
                  <img
                    src={group.avatar_url || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=256&q=80'}
                    alt=""
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {group.name}
                    </h3>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                      <span>{group.members_count} membres</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{group.institution || group.country || 'Panafricain'}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 mt-3 leading-relaxed">
                  {group.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {group.is_private ? 'Groupe privé' : 'Groupe ouvert'}
                </span>

                <button
                  onClick={() => handleToggleJoin(group.id)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    group.isMember
                      ? 'bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600'
                      : 'bg-blue-700 hover:bg-blue-800 text-white shadow-xs'
                  }`}
                >
                  {group.isMember ? 'Membre (Quitter)' : 'Rejoindre'}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-blue-900 to-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Créer une communauté universitaire</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nom de la communauté *</label>
                <input
                  type="text"
                  required
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="Ex : Club IA & Data UCAD Dakar"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description & Objectifs *</label>
                <textarea
                  rows={3}
                  required
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="Objectifs du groupe, activités, thématiques d'échanges..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Université / Rattachement</label>
                <input
                  type="text"
                  value={newGroup.institution}
                  onChange={(e) => setNewGroup({ ...newGroup, institution: e.target.value })}
                  placeholder="Ex : UCAD, UFHB ou Panafricain..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Créer le groupe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
