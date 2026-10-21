import React, { useState, useEffect } from 'react';
import {
  Users, Search, MapPin, Building, GraduationCap, MessageSquare,
  ArrowRight, ShieldCheck, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ReferenceData } from '../types';
import { AFRICAN_ACADEMIC_DIRECTORY, getUniversitiesByCountry } from '../data/africanDirectory';
import { CountryFlag } from './CountryFlag';

export const DirectoryView: React.FC = () => {
  const { user, openUserProfile, startDirectChat, openAuthModal } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [reference, setReference] = useState<ReferenceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [selectedInstitution, setSelectedInstitution] = useState('ALL');
  const [selectedField, setSelectedField] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');

  useEffect(() => {
    api.getReference().then(setReference).catch(() => {});
  }, []);

  useEffect(() => {
    loadStudents();
  }, [selectedCountry, selectedInstitution, selectedField, selectedLevel, page]);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const res = await api.directory.search({
        search: search || undefined,
        country: selectedCountry,
        institution: selectedInstitution,
        fieldOfStudy: selectedField,
        academicLevel: selectedLevel,
        page,
        limit: 12
      });
      setStudents(res.students);
      setTotal(res.total);
    } catch (_err) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadStudents();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-700" />
          <span>Annuaire des Étudiants d'Afrique Francophone</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Connectez-vous avec des camarades d'universités partenaires, trouvez des binômes de révision et des mentors
        </p>
      </div>

      {/* Filter and Search Box */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, compétences ou centres d'intérêt (ex: Mariama, Python, Droit...)"
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Filtrer
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center justify-between">
              <span>Pays</span>
              {selectedCountry !== 'ALL' && (
                <span className="text-[10px] text-blue-700 font-semibold flex items-center gap-1">
                  <CountryFlag country={selectedCountry} size="sm" />
                  <span>{selectedCountry}</span>
                </span>
              )}
            </label>
            <div className="relative flex items-center">
              {selectedCountry !== 'ALL' && (
                <div className="absolute left-2.5 pointer-events-none select-none z-10 flex items-center">
                  <CountryFlag country={selectedCountry} size="sm" />
                </div>
              )}
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setSelectedInstitution('ALL');
                  setPage(1);
                }}
                className={`w-full ${selectedCountry !== 'ALL' ? 'pl-8' : 'px-2.5'} py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none`}
              >
                <option value="ALL">🌍 Tous les pays d'Afrique</option>
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
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Université</label>
            <select
              value={selectedInstitution}
              onChange={(e) => { setSelectedInstitution(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="ALL">
                {selectedCountry === 'ALL' ? 'Toutes les universités' : `Universités (${selectedCountry})`}
              </option>
              {(selectedCountry === 'ALL'
                ? (reference?.institutions || getUniversitiesByCountry('Sénégal'))
                : getUniversitiesByCountry(selectedCountry)
              ).map((inst) => (
                <option key={inst} value={inst}>{inst}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Filière</label>
            <select
              value={selectedField}
              onChange={(e) => { setSelectedField(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="ALL">Toutes les filières</option>
              {reference?.fieldsOfStudy.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Niveau d'études</label>
            <select
              value={selectedLevel}
              onChange={(e) => { setSelectedLevel(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="ALL">Tous niveaux</option>
              {reference?.academicLevels.map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Student Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 animate-pulse">
              <div className="w-12 h-12 bg-slate-200 rounded-2xl" />
              <div className="w-24 h-4 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-800">Aucun étudiant ne correspond à cette recherche</p>
          <p className="text-xs text-slate-500">Essayez d'élargir les critères pour découvrir plus de profils.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((st) => (
            <div
              key={st.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                
                {/* Avatar and Name */}
                <div className="flex items-start gap-3">
                  <img
                    src={st.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                    alt=""
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {st.first_name} {st.last_name}
                    </h3>
                    <p className="text-xs font-semibold text-blue-700 truncate">
                      {st.field_of_study}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {st.academic_level} {st.graduation_year ? `(Promo ${st.graduation_year})` : ''}
                    </p>
                  </div>
                </div>

                {/* Institution & Location */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{st.institution}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{st.city ? `${st.city}, ` : ''}{st.country}</span>
                  </div>
                </div>

                {/* Skills tags without pill enclosure */}
                {st.skills && st.skills.length > 0 && (
                  <div className="mt-2.5 text-[11px] text-slate-500 truncate">
                    <span className="text-slate-400">Compétences : </span>
                    <span className="font-medium text-slate-700">{st.skills.slice(0, 3).join(' · ')}</span>
                  </div>
                )}

              </div>

              {/* Bottom Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => openUserProfile(st.id)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-center"
                >
                  Voir profil
                </button>

                {user?.id !== st.id && (
                  <button
                    onClick={() => {
                      if (!user) openAuthModal('login');
                      else startDirectChat(st.id);
                    }}
                    className="p-2 text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition-colors shrink-0"
                    title="Envoyer un message"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40"
          >
            Précédent
          </button>
          <span className="text-xs font-medium text-slate-600">
            Page {page} sur {Math.ceil(total / 12)}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / 12)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      )}

    </div>
  );
};
