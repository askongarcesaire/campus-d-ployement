import React, { useState, useEffect } from 'react';
import {
  User as UserIcon, Building, MapPin, GraduationCap, Calendar,
  Linkedin, Github, Globe, Edit3, MessageSquare, Flag, BookOpen,
  Rss, X, Check, Save, Sparkles, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StudentProfile, Post, AcademicResource, ReferenceData } from '../types';
import {
  AFRICAN_ACADEMIC_DIRECTORY,
  getCitiesByCountry,
  getUniversitiesByCountry,
  getCountryMeta
} from '../data/africanDirectory';
import { CountryFlag } from './CountryFlag';

interface ProfileViewProps {
  userId?: string | null;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ userId }) => {
  const { user, refreshUser, openAuthModal, startDirectChat, openReportModal } = useAuth();
  const targetId = userId || user?.id;

  const [studentData, setStudentData] = useState<{
    id: string;
    role: string;
    memberSince: string;
    profile: StudentProfile;
    posts: Post[];
    resources: AcademicResource[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'resources'>('posts');
  const [showEditModal, setShowEditModal] = useState(false);
  const [reference, setReference] = useState<ReferenceData | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isOwnProfile = user && user.id === targetId;

  useEffect(() => {
    api.getReference().then(setReference).catch(() => {});
  }, []);

  useEffect(() => {
    if (targetId) {
      loadProfile(targetId);
    }
  }, [targetId]);

  const loadProfile = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await api.users.getStudent(id);
      setStudentData(res.student);
      setEditForm(res.student.profile);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.users.updateProfile(editForm);
      await refreshUser();
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setShowEditModal(false);
        if (targetId) loadProfile(targetId);
      }, 1500);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!targetId) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
        <UserIcon className="w-12 h-12 text-blue-700 mx-auto" />
        <h2 className="text-base font-bold text-slate-900">Profil Académique</h2>
        <p className="text-xs text-slate-500">Connectez-vous pour voir et gérer votre profil étudiant.</p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-5 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl"
        >
          Se connecter
        </button>
      </div>
    );
  }

  if (isLoading || !studentData) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4 animate-pulse">
        <div className="w-full h-32 bg-slate-200 rounded-xl" />
        <div className="w-24 h-24 -mt-12 ml-6 rounded-2xl bg-slate-300" />
        <div className="space-y-2">
          <div className="w-48 h-5 bg-slate-200 rounded" />
          <div className="w-72 h-3 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  const { profile, posts, resources } = studentData;

  return (
    <div className="space-y-5">
      
      {/* Profile Cover & Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        
        {/* Cover Banner */}
        <div className="h-36 sm:h-48 bg-gradient-to-r from-blue-950 via-blue-900 to-amber-700 relative">
          {profile.cover_url && (
            <img src={profile.cover_url} alt="" className="w-full h-full object-cover opacity-60" />
          )}
        </div>

        {/* Profile Info Overlay */}
        <div className="px-5 sm:px-8 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
            
            <div className="flex items-end gap-4">
              <img
                src={profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                alt=""
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-md bg-white shrink-0"
              />
              <div className="mb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-2xl font-black text-slate-900 leading-tight">
                    {profile.first_name} {profile.last_name}
                  </h1>
                  {studentData.role === 'ADMIN' && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-blue-700 leading-tight mt-0.5">
                  {profile.headline || `${profile.field_of_study} (${profile.academic_level})`}
                </p>
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex items-center gap-2 self-start sm:self-end">
              {isOwnProfile ? (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Modifier mon profil</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => startDirectChat(studentData.id)}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Envoyer un message</span>
                  </button>
                  <button
                    onClick={() => openReportModal('USER', studentData.id, `${profile.first_name} ${profile.last_name}`)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-slate-100 transition-colors"
                    title="Signaler ce profil"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

          </div>

          {/* Academic Credentials Row (Clean Unboxed Metadata) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-slate-600 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{profile.institution}</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{profile.field_of_study} · {profile.academic_level}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{profile.city ? `${profile.city}, ` : ''}{profile.country}</span>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>{profile.bio}</p>
            </div>
          )}

          {/* Skills & Interests Tags without pills */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-x-6 gap-y-2 text-xs">
            {profile.skills && profile.skills.length > 0 && (
              <div>
                <span className="text-slate-400">Compétences : </span>
                <span className="font-semibold text-slate-800">{profile.skills.join(' · ')}</span>
              </div>
            )}
            {profile.interests && profile.interests.length > 0 && (
              <div>
                <span className="text-slate-400">Centres d'intérêt : </span>
                <span className="font-semibold text-slate-800">{profile.interests.join(' · ')}</span>
              </div>
            )}
          </div>

          {/* Social Links */}
          {(profile.linkedin_url || profile.github_url || profile.portfolio_url) && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-4 text-xs font-semibold text-blue-700">
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                  <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                </a>
              )}
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline text-slate-800">
                  <Github className="w-3.5 h-3.5" /> GitHub
                </a>
              )}
              {profile.portfolio_url && (
                <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline text-amber-700">
                  <Globe className="w-3.5 h-3.5" /> Site personnel
                </a>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Tabs: Student's Posts vs Uploaded Resources */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4">
        
        <div className="flex border-b border-slate-200 mb-4">
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 mr-6 flex items-center gap-2 ${
              activeTab === 'posts' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500'
            }`}
          >
            <Rss className="w-4 h-4" />
            <span>Publications ({posts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('resources')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'resources' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Documents Partagés ({resources.length})</span>
          </button>
        </div>

        {/* Tab 1: Posts */}
        {activeTab === 'posts' && (
          <div className="space-y-3">
            {posts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Aucune publication pour le moment.
              </p>
            ) : (
              posts.map((p) => (
                <div key={p.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="text-[11px] text-slate-400 mb-1">
                    {new Date(p.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">{p.content}</p>
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center gap-4 text-xs text-slate-500">
                    <span>{p.likes_count} mentions J'aime</span>
                    <span>·</span>
                    <span>{p.comments_count} commentaires</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Resources */}
        {activeTab === 'resources' && (
          <div className="space-y-3">
            {resources.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Aucune ressource pédagogique déposée pour l'instant.
              </p>
            ) : (
              resources.map((r) => (
                <div key={r.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{r.title}</h4>
                    <p className="text-[11px] text-slate-500">{r.subject} · {r.academic_level}</p>
                  </div>
                  <span className="text-xs font-semibold text-blue-700">
                    {r.download_count} téléchargements
                  </span>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Modifier mon profil académique</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1.5 text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-3.5 max-h-[75vh] overflow-y-auto">
              
              {saveSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> Profil mis à jour avec succès !
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    value={editForm.first_name || ''}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={editForm.last_name || ''}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Titre de profil / Slogan</label>
                <input
                  type="text"
                  value={editForm.headline || ''}
                  onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })}
                  placeholder="Ex : Étudiante Master 1 Génie Logiciel | Dév Web & IA"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Biographie académique & parcours</label>
                <textarea
                  rows={3}
                  value={editForm.bio || ''}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Partagez vos ambitions, vos projets de recherche ou vos passions..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CountryFlag country={editForm.country || 'Sénégal'} size="sm" />
                      <span>Pays *</span>
                    </span>
                    <span className="text-[10px] text-blue-700 font-semibold flex items-center gap-1">
                      <CountryFlag country={editForm.country || 'Sénégal'} size="sm" />
                      <span>{editForm.country || 'Sénégal'}</span>
                    </span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-2.5 pointer-events-none select-none z-10 flex items-center">
                      <CountryFlag country={editForm.country || 'Sénégal'} size="sm" />
                    </div>
                    <select
                      value={editForm.country || 'Sénégal'}
                      onChange={(e) => {
                        const newCountry = e.target.value;
                        const cities = getCitiesByCountry(newCountry);
                        const unis = getUniversitiesByCountry(newCountry);
                        setEditForm({
                          ...editForm,
                          country: newCountry,
                          city: cities[0] || '',
                          institution: unis[0] || ''
                        });
                      }}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-medium text-slate-800"
                    >
                      {Object.entries(
                        Object.values(AFRICAN_ACADEMIC_DIRECTORY).reduce((acc, c) => {
                          acc[c.region] = acc[c.region] || [];
                          acc[c.region].push(c);
                          return acc;
                        }, {} as Record<string, typeof AFRICAN_ACADEMIC_DIRECTORY[string][]>)
                      ).map(([region, countries]) => (
                        <optgroup key={region} label={`📍 ${region}`}>
                          {countries.map((c) => (
                            <option key={c.name} value={c.name}>
                              {c.flag} {c.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ville de résidence</label>
                  <select
                    value={editForm.city || ''}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    {getCitiesByCountry(editForm.country || 'Sénégal').map((cty) => (
                      <option key={cty} value={cty}>{cty}</option>
                    ))}
                    <option value="Autre ville">✍️ Autre ville...</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Université / Établissement</label>
                <select
                  value={editForm.institution || ''}
                  onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                >
                  {getUniversitiesByCountry(editForm.country || 'Sénégal').map((inst) => (
                    <option key={inst} value={inst}>{inst}</option>
                  ))}
                  <option value="Autre établissement / Institut">✍️ Autre établissement / Institut...</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Filière</label>
                  <select
                    value={editForm.field_of_study || ''}
                    onChange={(e) => setEditForm({ ...editForm, field_of_study: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    {reference?.fieldsOfStudy.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Niveau d'études</label>
                  <select
                    value={editForm.academic_level || ''}
                    onChange={(e) => setEditForm({ ...editForm, academic_level: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    {reference?.academicLevels.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Photo de profil (URL)</label>
                  <input
                    type="url"
                    value={editForm.avatar_url || ''}
                    onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lien LinkedIn</label>
                  <input
                    type="url"
                    value={editForm.linkedin_url || ''}
                    onChange={(e) => setEditForm({ ...editForm, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="w-1/3 py-2.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-2/3 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
