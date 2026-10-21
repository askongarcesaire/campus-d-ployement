import React, { useState, useEffect } from 'react';
import {
  Award, Search, Filter, Calendar, MapPin, Building,
  ExternalLink, Bookmark, CheckCircle2, Plus, X, AlertCircle,
  Clock, Share2, Check, Flag, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Opportunity, ReferenceData } from '../types';
import { CountryFlag } from './CountryFlag';
import { getCountryMeta } from '../data/africanDirectory';

export const OpportunitiesView: React.FC = () => {
  const { user, openAuthModal, openReportModal } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [reference, setReference] = useState<ReferenceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // Modal creation
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    organization: '',
    country: 'France',
    category: 'SCHOLARSHIP_INTL',
    academicLevel: 'Licence 3 / Master',
    fieldOfStudy: 'Toutes filières',
    requirements: '',
    requiredDocuments: '',
    applicationUrl: '',
    deadline: ''
  });

  // Details Modal
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    api.getReference().then(setReference).catch(() => {});
  }, []);

  useEffect(() => {
    loadOpportunities();
  }, [selectedCategory, selectedCountry, selectedLevel, favoritesOnly]);

  const loadOpportunities = async () => {
    setIsLoading(true);
    try {
      const res = await api.opportunities.list({
        category: selectedCategory,
        country: selectedCountry,
        academicLevel: selectedLevel,
        keyword: keyword || undefined,
        favoritesOnly
      });
      setOpportunities(res.opportunities);
    } catch (_err) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOpportunities();
  };

  const handleToggleFavorite = async (oppId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      openAuthModal('login');
      return;
    }
    try {
      const res = await api.opportunities.favorite(oppId);
      setOpportunities(prev => prev.map(o => {
        if (o.id === oppId) {
          return {
            ...o,
            isFavorited: res.favorited,
            favorites_count: res.favorited ? o.favorites_count + 1 : Math.max(0, o.favorites_count - 1)
          };
        }
        return o;
      }));
    } catch (_err) {}
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.opportunities.create(createForm);
      setShowCreateModal(false);
      loadOpportunities();
      setCreateForm({
        title: '',
        description: '',
        organization: '',
        country: 'France',
        category: 'SCHOLARSHIP_INTL',
        academicLevel: 'Licence 3 / Master',
        fieldOfStudy: 'Toutes filières',
        requirements: '',
        requiredDocuments: '',
        applicationUrl: '',
        deadline: ''
      });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = (opp: Opportunity, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(opp.application_url || window.location.href);
    setCopiedId(opp.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Post Button Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            <span>Bourses d'Études, Stages & Opportunités</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Offres vérifiées, bourses d'excellence internationales (Eiffel, DAAD) et stages d'insertion
          </p>
        </div>

        <button
          onClick={() => {
            if (!user) openAuthModal('login');
            else setShowCreateModal(true);
          }}
          className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Partager une opportunité</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Rechercher par mot-clé (ex: Eiffel, Orange, Informatique, DAAD...)"
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

        {/* Dropdowns Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Catégorie</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="ALL">Toutes les catégories</option>
              {reference?.opportunityCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Pays de destination</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="ALL">🌍 Tous les pays</option>
              {reference?.countries.map((ct) => (
                <option key={ct} value={ct}>{getCountryMeta(ct).flag} {ct}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Niveau d'études requis</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
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

      {/* Grid of Opportunities */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 animate-pulse">
              <div className="w-1/3 h-4 bg-slate-200 rounded" />
              <div className="w-full h-8 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
          <Award className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-800">Aucune opportunité ne correspond à vos filtres</p>
          <p className="text-xs text-slate-500">
            Modifiez vos critères de recherche ou réinitialisez les filtres.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              onClick={() => setSelectedOpportunity(opp)}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-md transition-all p-5 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                
                {/* Meta header: Clean unboxed metadata with · */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 truncate">
                    <span className="text-blue-700 truncate">{opp.organization}</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{opp.country}</span>
                  </div>

                  {opp.is_verified && (
                    <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Vérifiée
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-700 leading-snug">
                  {opp.title}
                </h3>

                {/* Excerpt */}
                <p className="text-xs text-slate-600 line-clamp-3 mt-2 leading-relaxed">
                  {opp.description}
                </p>

                {/* Criteria tags without pill enclosures */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                  {opp.academic_level && (
                    <div>
                      <span className="text-slate-400">Niveau : </span>
                      <span className="font-medium text-slate-700">{opp.academic_level}</span>
                    </div>
                  )}
                  {opp.field_of_study && (
                    <div>
                      <span className="text-slate-400">Domaine : </span>
                      <span className="font-medium text-slate-700">{opp.field_of_study}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-[11px] text-amber-700 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>
                    {opp.deadline
                      ? `Date limite : ${new Date(opp.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`
                      : 'Candidatures permanentes'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleToggleFavorite(opp.id, e)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      opp.isFavorited ? 'text-amber-600' : 'text-slate-400 hover:text-amber-600'
                    }`}
                    title="Enregistrer"
                  >
                    <Bookmark className={`w-4 h-4 ${opp.isFavorited ? 'fill-amber-600' : ''}`} />
                  </button>

                  <button
                    onClick={(e) => handleCopyLink(opp, e)}
                    className="p-1.5 text-slate-400 hover:text-blue-700 rounded-lg transition-colors"
                    title="Partager le lien"
                  >
                    {copiedId === opp.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Opportunity Detail Modal */}
      {selectedOpportunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[85vh] flex flex-col">
            
            <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Détail de l'opportunité
                </span>
              </div>
              <button
                onClick={() => setSelectedOpportunity(null)}
                className="p-1.5 text-slate-300 hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                    {selectedOpportunity.title}
                  </h2>
                  <p className="text-xs text-blue-700 font-semibold mt-1">
                    {selectedOpportunity.organization} · {selectedOpportunity.country}
                  </p>
                </div>

                {selectedOpportunity.is_verified && (
                  <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 rounded-lg shrink-0">
                    <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" /> Annonce Officielle Vérifiée
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-200">
                {selectedOpportunity.description}
              </div>

              {/* Requirements & Documents */}
              {(selectedOpportunity.requirements || selectedOpportunity.required_documents) && (
                <div className="space-y-3 pt-2">
                  {selectedOpportunity.requirements && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 mb-1">Conditions d'admission :</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{selectedOpportunity.requirements}</p>
                    </div>
                  )}

                  {selectedOpportunity.required_documents && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 mb-1">Pièces et documents demandés :</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{selectedOpportunity.required_documents}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Deadline & Author note */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs flex items-center justify-between text-amber-900">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-700" />
                  <span>
                    {selectedOpportunity.deadline
                      ? `Date limite de dépôt : ${new Date(selectedOpportunity.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`
                      : 'Candidatures traitées au fil de l\'eau'}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => openReportModal('OPPORTUNITY', selectedOpportunity.id, selectedOpportunity.title)}
                  className="text-xs text-slate-400 hover:text-red-600 flex items-center gap-1"
                >
                  <Flag className="w-3.5 h-3.5" /> Signaler cette annonce si suspecte
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={(e) => handleToggleFavorite(selectedOpportunity.id, e)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5"
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>{selectedOpportunity.isFavorited ? 'Enregistrée' : 'Sauvegarder'}</span>
                  </button>

                  {selectedOpportunity.application_url && (
                    <a
                      href={selectedOpportunity.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-xl shadow-md flex items-center justify-center gap-1.5"
                    >
                      <span>Postuler sur le site officiel</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Modal: Create Opportunity */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">Partager une bourse ou offre de stage</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-300 hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-3.5 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Titre de l'opportunité *</label>
                <input
                  type="text"
                  required
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="Ex : Bourse d'excellence Master DAAD 2026 / Stage Data Orange"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Organisme responsable *</label>
                  <input
                    type="text"
                    required
                    value={createForm.organization}
                    onChange={(e) => setCreateForm({ ...createForm, organization: e.target.value })}
                    placeholder="Ex : Campus France, DAAD, MTN..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CountryFlag country={createForm.country} size="sm" />
                      <span>Pays concerné *</span>
                    </span>
                    <span className="text-[10px] text-blue-700 font-semibold flex items-center gap-1">
                      <CountryFlag country={createForm.country} size="sm" />
                      <span>{createForm.country}</span>
                    </span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-2.5 pointer-events-none select-none z-10 flex items-center">
                      <CountryFlag country={createForm.country} size="sm" />
                    </div>
                    <select
                      value={createForm.country}
                      onChange={(e) => setCreateForm({ ...createForm, country: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-medium text-slate-800"
                    >
                      {reference?.countries.map((c) => (
                        <option key={c} value={c}>{getCountryMeta(c).flag} {c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Catégorie *</label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  >
                    {reference?.opportunityCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date limite de candidature</label>
                  <input
                    type="date"
                    value={createForm.deadline}
                    onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description détaillée *</label>
                <textarea
                  rows={4}
                  required
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Présentation du programme, prise en charge (allocation, billet...), public cible..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lien officiel de candidature *</label>
                <input
                  type="url"
                  required
                  value={createForm.applicationUrl}
                  onChange={(e) => setCreateForm({ ...createForm, applicationUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/3 py-2.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {isSubmitting ? 'Publication en cours...' : 'Publier l\'opportunité'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
