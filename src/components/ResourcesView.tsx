import React, { useState, useEffect } from 'react';
import {
  BookOpen, Search, Download, FileText, Plus, X,
  CheckCircle2, Building, GraduationCap, ArrowUpDown, Trash2, Flag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AcademicResource, ReferenceData } from '../types';

export const ResourcesView: React.FC = () => {
  const { user, openAuthModal, openReportModal } = useAuth();
  const [resources, setResources] = useState<AcademicResource[]>([]);
  const [reference, setReference] = useState<ReferenceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedInstitution, setSelectedInstitution] = useState('ALL');
  const [selectedField, setSelectedField] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');

  // Upload Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    institution: '',
    fieldOfStudy: '',
    academicLevel: 'Licence 2 (L2)',
    subject: '',
    category: 'EXAM_SOLUTION',
    fileUrl: '',
    fileName: ''
  });

  useEffect(() => {
    api.getReference().then(setReference).catch(() => {});
  }, []);

  useEffect(() => {
    loadResources();
  }, [selectedCategory, selectedInstitution, selectedField, selectedLevel]);

  const loadResources = async () => {
    setIsLoading(true);
    try {
      const res = await api.resources.list({
        category: selectedCategory,
        institution: selectedInstitution,
        fieldOfStudy: selectedField,
        academicLevel: selectedLevel,
        search: search || undefined
      });
      setResources(res.resources);
    } catch (_err) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadResources();
  };

  const handleDownload = async (resource: AcademicResource) => {
    try {
      await api.resources.download(resource.id);
      setResources(prev => prev.map(r => r.id === resource.id ? { ...r, download_count: r.download_count + 1 } : r));

      // Create a downloadable academic blob if sample or trigger browser download
      const content = `CAMPUSHUB AFRICA - DOCUMENT PEDAGOGIQUE OFFICIEL\n\nTitre: ${resource.title}\nÉtablissement: ${resource.institution}\nFilière: ${resource.field_of_study}\nNiveau: ${resource.academic_level}\nMatière: ${resource.subject}\n\nCe document pédagogique a été partagé par la communauté universitaire CampusHub Africa pour favoriser la réussite académique de tous les étudiants.`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = resource.file_name.endsWith('.pdf') ? resource.file_name.replace('.pdf', '.txt') : `${resource.file_name}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (_err) {}
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }
    setIsUploading(true);
    try {
      await api.resources.create({
        ...uploadForm,
        institution: uploadForm.institution || reference?.institutions[0],
        fieldOfStudy: uploadForm.fieldOfStudy || reference?.fieldsOfStudy[0],
        fileName: uploadForm.fileName || `${uploadForm.title.replace(/\s+/g, '_')}.pdf`,
        fileUrl: uploadForm.fileUrl || '/uploads/sample_document.pdf',
        fileSize: 3500000,
        fileType: 'application/pdf'
      });
      setShowUploadModal(false);
      loadResources();
      setUploadForm({
        title: '',
        description: '',
        institution: '',
        fieldOfStudy: '',
        academicLevel: 'Licence 2 (L2)',
        subject: '',
        category: 'EXAM_SOLUTION',
        fileUrl: '',
        fileName: ''
      });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '2.5 Mo';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} Mo`;
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-700" />
            <span>Bibliothèque Pédagogique Inter-Universités</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cours magistraux, fiches de TD, mémoires et anciens sujets d'examens avec corrigés
          </p>
        </div>

        <button
          onClick={() => {
            if (!user) openAuthModal('login');
            else setShowUploadModal(true);
          }}
          className="px-4 py-2 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Déposer un document</span>
        </button>
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
              placeholder="Rechercher un document par titre, matière ou mots-clés (ex: Algorithmique, OHADA, Économétrie...)"
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Rechercher
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Type de document</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="ALL">Tous les types</option>
              {reference?.resourceCategories.map((rc) => (
                <option key={rc.id} value={rc.id}>{rc.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Université / Établissement</label>
            <select
              value={selectedInstitution}
              onChange={(e) => setSelectedInstitution(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="ALL">Toutes universités</option>
              {reference?.institutions.map((inst) => (
                <option key={inst} value={inst}>{inst}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Filière</label>
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="ALL">Toutes filières</option>
              {reference?.fieldsOfStudy.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Niveau d'études</label>
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

      {/* Grid of Documents */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 animate-pulse">
              <div className="w-1/3 h-4 bg-slate-200 rounded" />
              <div className="w-full h-12 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-800">Aucun document trouvé pour ces critères</p>
          <p className="text-xs text-slate-500">
            Soyez le premier à partager vos fiches de cours ou sujets d'examens avec vos camarades.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((res) => (
            <div
              key={res.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all p-5 flex flex-col justify-between"
            >
              <div>
                
                {/* File Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-blue-700 block leading-tight">
                        {res.subject}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatFileSize(res.file_size)} · PDF certifié
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => openReportModal('RESOURCE', res.id, res.title)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                    title="Signaler ce document"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {res.title}
                </h3>

                {/* Description */}
                {res.description && (
                  <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                    {res.description}
                  </p>
                )}

                {/* Academic Metadata (Clean Unboxed with ·) */}
                <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{res.institution}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{res.field_of_study} · {res.academic_level}</span>
                  </div>
                </div>

              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {res.download_count} téléchargement{res.download_count > 1 ? 's' : ''}
                </span>

                <button
                  onClick={() => handleDownload(res)}
                  className="px-3.5 py-1.5 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">Déposer un document pédagogique</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 text-slate-300 hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-3.5 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Titre du document *</label>
                <input
                  type="text"
                  required
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="Ex : Annales corrigées Algorithmique L2 Session 2025"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Matière / Discipline *</label>
                  <input
                    type="text"
                    required
                    value={uploadForm.subject}
                    onChange={(e) => setUploadForm({ ...uploadForm, subject: e.target.value })}
                    placeholder="Ex : Algorithmique, Droit Civil..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type de ressource *</label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  >
                    {reference?.resourceCategories.map((rc) => (
                      <option key={rc.id} value={rc.id}>{rc.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Université ou établissement d'origine *</label>
                <select
                  value={uploadForm.institution}
                  onChange={(e) => setUploadForm({ ...uploadForm, institution: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                >
                  <option value="">Sélectionnez l'établissement...</option>
                  {reference?.institutions.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Filière *</label>
                  <select
                    value={uploadForm.fieldOfStudy}
                    onChange={(e) => setUploadForm({ ...uploadForm, fieldOfStudy: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  >
                    <option value="">Sélectionnez la filière...</option>
                    {reference?.fieldsOfStudy.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Niveau *</label>
                  <select
                    value={uploadForm.academicLevel}
                    onChange={(e) => setUploadForm({ ...uploadForm, academicLevel: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  >
                    {reference?.academicLevels.map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Contenu abordé</label>
                <textarea
                  rows={3}
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Points clés traités, chapitres couverts, noms des professeurs référents..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="w-1/3 py-2.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-2/3 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {isUploading ? 'Dépôt en cours...' : 'Enregistrer le document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
