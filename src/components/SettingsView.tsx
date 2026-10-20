import React, { useState, useRef } from 'react';
import {
  Palette, GraduationCap, Shield, BookOpen, Flame, Star,
  Globe, TreePine, Feather, Image as ImageIcon, Check,
  RefreshCw, Bell, Lock, User, Sliders, Sparkles, AlertCircle,
  Save, Eye, ArrowRight, Upload, Link as LinkIcon, Download,
  SlidersHorizontal, CheckCircle2, Megaphone, HelpCircle,
  FileText, Compass, School, Laptop, Moon, Sun, Smartphone
} from 'lucide-react';
import { useCustomization, PlatformLogo, defaultSettings } from '../context/CustomizationContext';
import { useAuth } from '../context/AuthContext';
import { LogoType, LogoShape, LogoSize, ThemeColor, AnnouncementType } from '../types';

export const SettingsView: React.FC = () => {
  const { user } = useAuth();
  const {
    branding,
    preferences,
    updateBranding,
    resetBranding,
    updatePreferences,
    colorScheme,
    exportConfig,
    importConfig
  } = useCustomization();

  const [activeTab, setActiveTab] = useState<'logo' | 'branding' | 'navigation' | 'profile' | 'backup'>('logo');

  // Form local state
  const [platformName, setPlatformName] = useState(branding.platform_name);
  const [platformSlogan, setPlatformSlogan] = useState(branding.platform_slogan);
  const [institutionTag, setInstitutionTag] = useState(branding.institution_tag || 'Réseau Académique Panafricain');
  const [logoType, setLogoType] = useState<LogoType>(branding.logo_type);
  const [logoUrl, setLogoUrl] = useState(branding.logo_url || '');
  const [logoShape, setLogoShape] = useState<LogoShape>(branding.logo_shape || 'rounded');
  const [logoSize, setLogoSize] = useState<LogoSize>(branding.logo_size || 'medium');
  const [primaryColor, setPrimaryColor] = useState<ThemeColor>(branding.primary_color);
  const [customColorHex, setCustomColorHex] = useState(branding.custom_color_hex || '#1d4ed8');
  const [bannerAnnouncement, setBannerAnnouncement] = useState(branding.banner_announcement || '');
  const [bannerType, setBannerType] = useState<AnnouncementType>(branding.banner_type || 'info');
  const [showAnnouncement, setShowAnnouncement] = useState(branding.show_announcement);
  const [defaultTab, setDefaultTab] = useState(branding.default_tab || 'feed');

  // File upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status & feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Logo Presets List
  const logoVectorPresets: { id: LogoType; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'icon_grad_cap',
      label: 'Toque Universitaire',
      icon: <GraduationCap className="w-5 h-5" />,
      desc: 'Réussite académique et obtention de diplôme'
    },
    {
      id: 'icon_shield',
      label: 'Bouclier Académique',
      icon: <Shield className="w-5 h-5" />,
      desc: 'Prestige, intégrité et rigueur scientifique'
    },
    {
      id: 'icon_book',
      label: 'Livre Ouvert du Savoir',
      icon: <BookOpen className="w-5 h-5" />,
      desc: 'Pédagogie, recherche et diffusion des connaissances'
    },
    {
      id: 'icon_torch',
      label: 'Flambeau du Savoir',
      icon: <Flame className="w-5 h-5" />,
      desc: 'Leadership, inspiration et avenir de la jeunesse'
    },
    {
      id: 'icon_star',
      label: 'Étoile Panafricaine',
      icon: <Star className="w-5 h-5" />,
      desc: 'Unité et rayonnement des talents africains'
    },
    {
      id: 'icon_globe',
      label: 'Globe International',
      icon: <Globe className="w-5 h-5" />,
      desc: 'Ouverture mondiale, bourses et partenariats'
    },
    {
      id: 'icon_tree',
      label: 'Arbre de la Sagesse',
      icon: <TreePine className="w-5 h-5" />,
      desc: 'Enracinement, sagesse africaine et épanouissement'
    },
    {
      id: 'icon_feather',
      label: 'Plume Académique',
      icon: <Feather className="w-5 h-5" />,
      desc: 'Littérature, rédaction de thèses et esprit critique'
    },
    {
      id: 'custom_url',
      label: 'Image / Fichier Logo Personnalisé',
      icon: <ImageIcon className="w-5 h-5" />,
      desc: 'Téléversez votre propre image ou saisissez une URL'
    }
  ];

  // Preset templates from popular African universities
  const sampleUniversities = [
    {
      name: 'UCAD Dakar Connect',
      slogan: '« Lux Mea Lex — La Lumière est ma Loi »',
      tag: 'Université Cheikh Anta Diop · Sénégal',
      color: 'blue' as ThemeColor,
      logoType: 'icon_shield' as LogoType,
      logoShape: 'shield' as LogoShape
    },
    {
      name: 'INP-HB Yamoussoukro',
      slogan: '« L’excellence technologique au service de l’Afrique »',
      tag: 'Institut National Polytechnique · Côte d’Ivoire',
      color: 'amber' as ThemeColor,
      logoType: 'icon_torch' as LogoType,
      logoShape: 'rounded' as LogoShape
    },
    {
      name: '2iE Eau & Environnement',
      slogan: '« Former les ingénieurs entrepreneurs d’Afrique »',
      tag: 'Institut International 2iE · Ouagadougou',
      color: 'emerald' as ThemeColor,
      logoType: 'icon_tree' as LogoType,
      logoShape: 'circle' as LogoShape
    },
    {
      name: 'CampusHub Pan-Africa',
      slogan: '« Connecter les étudiants, partager les opportunités, construire l’avenir »',
      tag: 'Réseau Académique Panafricain',
      color: 'indigo' as ThemeColor,
      logoType: 'icon_grad_cap' as LogoType,
      logoShape: 'rounded' as LogoShape
    }
  ];

  // Preset Theme colors
  const colorOptions: { id: ThemeColor; label: string; bgClass: string; desc: string }[] = [
    { id: 'blue', label: 'Bleu Royal & Or', bgClass: 'bg-blue-700', desc: 'Classique institutionnel' },
    { id: 'emerald', label: 'Vert Émeraude Sahel', bgClass: 'bg-emerald-600', desc: 'Croissance et renouveau' },
    { id: 'amber', label: 'Or & Ambre Panafricain', bgClass: 'bg-amber-600', desc: 'Chaleureux et dynamique' },
    { id: 'indigo', label: 'Indigo Saphir', bgClass: 'bg-indigo-600', desc: 'Innovation et tech' },
    { id: 'crimson', label: 'Pourpre & Carmin', bgClass: 'bg-rose-700', desc: 'Prestige et distinction' },
    { id: 'purple', label: 'Violet Cardinal', bgClass: 'bg-purple-700', desc: 'Inspirant et créatif' },
    { id: 'custom', label: 'Couleur Sur Mesure', bgClass: 'bg-slate-800', desc: 'Code HEX personnalisé' },
  ];

  // Handle image file selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSaveError('Veuillez sélectionner un fichier image valide (PNG, JPEG, SVG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setSaveError('L\'image sélectionnée est trop volumineuse (maximum 2 Mo).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      setLogoUrl(dataUrl);
      setLogoType('custom_url');
      setSaveError('');
    };
    reader.readAsDataURL(file);
  };

  // Apply a sample university preset
  const applyPreset = (preset: typeof sampleUniversities[0]) => {
    setPlatformName(preset.name);
    setPlatformSlogan(preset.slogan);
    setInstitutionTag(preset.tag);
    setPrimaryColor(preset.color);
    setLogoType(preset.logoType);
    setLogoShape(preset.logoShape);
    setLogoUrl('');
  };

  // Submit all customizations
  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveError('');
    try {
      await updateBranding({
        platform_name: platformName.trim() || 'CampusHub Africa',
        platform_slogan: platformSlogan.trim(),
        institution_tag: institutionTag.trim(),
        logo_type: logoType,
        logo_url: logoUrl.trim(),
        logo_shape: logoShape,
        logo_size: logoSize,
        primary_color: primaryColor,
        custom_color_hex: customColorHex,
        banner_announcement: bannerAnnouncement.trim(),
        banner_type: bannerType,
        show_announcement: showAnnouncement,
        default_tab: defaultTab
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      setSaveError(err.message || 'Erreur lors de l\'enregistrement des paramètres.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default
  const handleReset = async () => {
    if (confirm('Voulez-vous rétablir l\'ensemble des paramètres, logo et couleurs d\'origine de CampusHub Africa ?')) {
      await resetBranding();
      setPlatformName(defaultSettings.platform_name);
      setPlatformSlogan(defaultSettings.platform_slogan);
      setInstitutionTag('Réseau Académique Panafricain');
      setLogoType(defaultSettings.logo_type);
      setLogoUrl('');
      setLogoShape(defaultSettings.logo_shape || 'rounded');
      setLogoSize(defaultSettings.logo_size || 'medium');
      setPrimaryColor(defaultSettings.primary_color);
      setCustomColorHex('#1d4ed8');
      setBannerAnnouncement(defaultSettings.banner_announcement || '');
      setBannerType('info');
      setShowAnnouncement(true);
      setDefaultTab('feed');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  // Handle configuration file import
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (readEvent) => {
      const text = readEvent.target?.result as string;
      const success = await importConfig(text);
      if (success) {
        setImportStatus('Configuration importée et appliquée avec succès !');
        setTimeout(() => setImportStatus(null), 3500);
      } else {
        setSaveError('Fichier de configuration invalide.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-blue-700" />
            <span>Paramètres & Personnalisation</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Personnalisez le logo de la plateforme, l'identité visuelle de votre campus, les couleurs et vos préférences
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
            title="Revenir au design standard"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réinitialiser</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveAll()}
            disabled={isSaving}
            className="px-4 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Enregistrement...' : 'Sauvegarder'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Vos personnalisations (logo, identité et paramètres) ont été enregistrées avec succès et sont actives en temps réel !</span>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {importStatus && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* LIVE PREVIEW HERO CARD (Interactive Simulation) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-700" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Aperçu en Direct de la Bannière & du Logo
            </h2>
          </div>
          <span className="text-[11px] bg-blue-50 text-blue-800 font-semibold px-2 py-0.5 rounded-full border border-blue-100">
            Aperçu instantané
          </span>
        </div>

        {/* Header Preview Component */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              
              {/* Dynamic Logo Rendering */}
              {logoType === 'custom_url' && logoUrl ? (
                <div
                  className={`${
                    logoSize === 'small' ? 'w-8 h-8' : logoSize === 'large' ? 'w-12 h-12' : 'w-10 h-10'
                  } ${
                    logoShape === 'circle' ? 'rounded-full' :
                    logoShape === 'shield' ? 'rounded-t-xl rounded-b-3xl' :
                    logoShape === 'minimal' ? 'rounded-lg bg-transparent border-0' :
                    'rounded-xl'
                  } overflow-hidden bg-white border border-slate-200 p-0.5 flex items-center justify-center shadow-xs shrink-0`}
                >
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div
                  className={`${
                    logoSize === 'small' ? 'w-8 h-8' : logoSize === 'large' ? 'w-12 h-12' : 'w-10 h-10'
                  } ${
                    logoShape === 'circle' ? 'rounded-full' :
                    logoShape === 'shield' ? 'rounded-t-xl rounded-b-3xl' :
                    logoShape === 'minimal' ? 'rounded-lg bg-transparent border-0 shadow-none' :
                    'rounded-xl'
                  } flex items-center justify-center text-white shadow-md bg-gradient-to-tr ${
                    primaryColor === 'amber' ? 'from-amber-700 via-amber-800 to-orange-600' :
                    primaryColor === 'emerald' ? 'from-emerald-800 via-emerald-700 to-teal-600' :
                    primaryColor === 'indigo' ? 'from-indigo-900 via-indigo-800 to-blue-600' :
                    primaryColor === 'crimson' ? 'from-rose-900 via-rose-800 to-red-600' :
                    primaryColor === 'purple' ? 'from-purple-900 via-purple-800 to-violet-600' :
                    primaryColor === 'custom' ? 'from-slate-900 to-slate-800' :
                    'from-blue-900 via-blue-800 to-amber-600'
                  } shrink-0`}
                  style={
                    primaryColor === 'custom'
                      ? { backgroundColor: customColorHex, backgroundImage: 'none' }
                      : undefined
                  }
                >
                  {logoType === 'icon_shield' && <Shield className="w-5 h-5" />}
                  {logoType === 'icon_book' && <BookOpen className="w-5 h-5" />}
                  {logoType === 'icon_torch' && <Flame className="w-5 h-5" />}
                  {logoType === 'icon_star' && <Star className="w-5 h-5" />}
                  {logoType === 'icon_globe' && <Globe className="w-5 h-5" />}
                  {logoType === 'icon_tree' && <TreePine className="w-5 h-5" />}
                  {logoType === 'icon_feather' && <Feather className="w-5 h-5" />}
                  {logoType === 'icon_grad_cap' && <GraduationCap className="w-5 h-5" />}
                </div>
              )}

              <div>
                <span className="text-base font-bold text-slate-900 block leading-tight">
                  {platformName || 'CampusHub Africa'}
                </span>
                <span className="text-[11px] text-slate-500 font-medium block leading-none mt-0.5 truncate max-w-md">
                  {platformSlogan || 'Le Réseau Académique Panafricain'}
                </span>
                {institutionTag && (
                  <span className="text-[10px] text-blue-700 font-semibold block mt-0.5">
                    {institutionTag}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className="px-3.5 py-1.5 text-xs font-bold text-white rounded-xl shadow-xs"
                style={{
                  backgroundColor:
                    primaryColor === 'custom' ? customColorHex :
                    primaryColor === 'amber' ? '#d97706' :
                    primaryColor === 'emerald' ? '#059669' :
                    primaryColor === 'indigo' ? '#4f46e5' :
                    primaryColor === 'crimson' ? '#be123c' :
                    primaryColor === 'purple' ? '#7e22ce' :
                    '#1d4ed8'
                }}
              >
                Bouton Thème
              </span>
            </div>
          </div>

          {/* Simulated Announcement Bar */}
          {showAnnouncement && bannerAnnouncement && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                bannerType === 'urgent' ? 'bg-red-50 border border-red-200 text-red-900' :
                bannerType === 'success' ? 'bg-amber-50 border border-amber-200 text-amber-900' :
                bannerType === 'warning' ? 'bg-orange-50 border border-orange-200 text-orange-900' :
                'bg-blue-50 border border-blue-200 text-blue-900'
              }`}
            >
              <Megaphone className="w-4 h-4 shrink-0" />
              <span className="truncate font-medium">{bannerAnnouncement}</span>
            </div>
          )}
        </div>

        {/* Quick University Presets */}
        <div>
          <span className="text-[11px] font-bold text-slate-600 block mb-2">
            Modèles rapides d'universités africaines (cliquez pour tester) :
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {sampleUniversities.map((uni, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(uni)}
                className="p-2 text-left bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-xl transition-all group"
              >
                <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate">{uni.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{uni.tag.split('·')[0]}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-1 bg-white p-1 rounded-2xl border border-slate-200/90 shadow-xs">
        <button
          onClick={() => setActiveTab('logo')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'logo'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>1. Logo & Emblème</span>
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'branding'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>2. Thème & Couleurs</span>
        </button>

        <button
          onClick={() => setActiveTab('navigation')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'navigation'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>3. Annonces & Accueil</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <User className="w-4 h-4" />
          <span>4. Apparence & Confort</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'backup'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>5. Export & Sauvegarde</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LOGO & EMBLEME */}
      {/* ========================================================================= */}
      {activeTab === 'logo' && (
        <div className="space-y-6">
          
          {/* Section: Choix de l'emblème ou de l'image */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-5">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Type de Logo & Emblème</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Choisissez un symbole officiel panafricain ou téléversez le logo de votre université / organisation
              </p>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {logoVectorPresets.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setLogoType(opt.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    logoType === opt.id
                      ? 'border-blue-700 bg-blue-50/50 shadow-sm ring-1 ring-blue-700'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    logoType === opt.id ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {opt.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 leading-tight flex items-center justify-between">
                      <span>{opt.label}</span>
                      {logoType === opt.id && <Check className="w-3.5 h-3.5 text-blue-700 shrink-0" />}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">{opt.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom File Upload or URL Input if 'custom_url' selected */}
            {logoType === 'custom_url' && (
              <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in">
                
                {/* File Upload Zone */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Option A : Téléverser un fichier logo depuis votre appareil
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-300 hover:border-blue-600 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
                    >
                      <Upload className="w-4 h-4 text-blue-700" />
                      <span>Choisir un fichier image (PNG, SVG, WEBP, JPG)</span>
                    </button>
                    <span className="text-[11px] text-slate-500">Max 2 Mo. Transparent recommandé.</span>
                  </div>
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-bold uppercase">Ou via un lien URL</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                {/* Direct URL Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Option B : Saisir l'adresse URL du logo
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://mon-universite.edu/logo.png"
                        className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                    {logoUrl && (
                      <button
                        type="button"
                        onClick={() => setLogoUrl('')}
                        className="px-3 py-2 text-xs text-slate-600 hover:text-red-600 font-semibold"
                      >
                        Effacer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section: Forme & Taille du Logo */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-5">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Forme & Taille du Conteneur du Logo</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ajustez la silhouette et les proportions d'affichage de l'icône dans l'en-tête
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Forme */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Forme géométrique</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLogoShape('rounded')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                      logoShape === 'rounded'
                        ? 'border-blue-700 bg-blue-50/50 text-blue-900 ring-1 ring-blue-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Carré Arrondi</span>
                    <div className="w-5 h-5 rounded-md bg-blue-700"></div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLogoShape('circle')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                      logoShape === 'circle'
                        ? 'border-blue-700 bg-blue-50/50 text-blue-900 ring-1 ring-blue-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Cercle Parfait</span>
                    <div className="w-5 h-5 rounded-full bg-blue-700"></div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLogoShape('shield')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                      logoShape === 'shield'
                        ? 'border-blue-700 bg-blue-50/50 text-blue-900 ring-1 ring-blue-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Écusson / Badge</span>
                    <div className="w-5 h-5 rounded-t-sm rounded-b-lg bg-blue-700"></div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLogoShape('minimal')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                      logoShape === 'minimal'
                        ? 'border-blue-700 bg-blue-50/50 text-blue-900 ring-1 ring-blue-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Minimaliste (Sans Fond)</span>
                    <GraduationCap className="w-5 h-5 text-blue-700" />
                  </button>
                </div>
              </div>

              {/* Taille */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Taille d'affichage</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLogoSize('small')}
                    className={`py-3 px-2 rounded-xl border text-xs font-bold text-center transition-all ${
                      logoSize === 'small'
                        ? 'border-blue-700 bg-blue-50/50 text-blue-900 ring-1 ring-blue-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Compact (32px)
                  </button>

                  <button
                    type="button"
                    onClick={() => setLogoSize('medium')}
                    className={`py-3 px-2 rounded-xl border text-xs font-bold text-center transition-all ${
                      logoSize === 'medium'
                        ? 'border-blue-700 bg-blue-50/50 text-blue-900 ring-1 ring-blue-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Standard (40px)
                  </button>

                  <button
                    type="button"
                    onClick={() => setLogoSize('large')}
                    className={`py-3 px-2 rounded-xl border text-xs font-bold text-center transition-all ${
                      logoSize === 'large'
                        ? 'border-blue-700 bg-blue-50/50 text-blue-900 ring-1 ring-blue-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Grand (48px)
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Section: Sous-titre Institutionnel */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Tag ou Établissement Rattaché</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Texte d'affiliation affiché à côté du logo dans l'en-tête (ex : nom de faculté ou de campus)
              </p>
            </div>

            <div>
              <input
                type="text"
                value={institutionTag}
                onChange={(e) => setInstitutionTag(e.target.value)}
                placeholder="Ex : Réseau Académique Panafricain / Faculté des Sciences"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleSaveAll()}
              disabled={isSaving}
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Enregistrement en cours...' : 'Enregistrer le logo & l\'emblème'}</span>
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: THEME & COULEURS */}
      {/* ========================================================================= */}
      {activeTab === 'branding' && (
        <div className="space-y-6">
          
          {/* Nom & Devise */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Nom de la Plateforme & Slogan</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Adaptez l'intitulé de votre réseau académique à votre communauté
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nom principal de la plateforme *
                </label>
                <input
                  type="text"
                  required
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  placeholder="Ex : CampusHub Africa / UCAD Connect / Réseau Étudiant"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Slogan ou Devise officielle *
                </label>
                <input
                  type="text"
                  required
                  value={platformSlogan}
                  onChange={(e) => setPlatformSlogan(e.target.value)}
                  placeholder="Ex : Connecter les étudiants, partager les opportunités..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Palette de Couleurs */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Palette Thématique Panafricaine</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Modifiez la tonalité globale de l'interface (boutons, dégradés de bannière, badges actifs)
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {colorOptions.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setPrimaryColor(c.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                    primaryColor === c.id
                      ? 'border-slate-900 bg-slate-50 shadow-sm ring-1 ring-slate-900'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full ${c.bgClass} shrink-0 shadow-sm flex items-center justify-center text-white`}>
                    {primaryColor === c.id && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{c.label}</p>
                    <p className="text-[10px] text-slate-500 truncate">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom HEX Color Picker if 'custom' selected */}
            {primaryColor === 'custom' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in">
                <input
                  type="color"
                  value={customColorHex}
                  onChange={(e) => setCustomColorHex(e.target.value)}
                  className="w-12 h-12 rounded-xl cursor-pointer border border-slate-300 p-0.5 bg-white"
                />
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Code Couleur Hexadécimal
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Choisissez précisément la couleur exacte de la charte graphique de votre université
                  </p>
                </div>
                <input
                  type="text"
                  value={customColorHex}
                  onChange={(e) => setCustomColorHex(e.target.value)}
                  className="w-28 px-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-200 rounded-xl uppercase text-center"
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleSaveAll()}
              disabled={isSaving}
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Enregistrement en cours...' : 'Enregistrer le thème & les couleurs'}</span>
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: NAVIGATION, ANNONCES & ACCUEIL */}
      {/* ========================================================================= */}
      {activeTab === 'navigation' && (
        <div className="space-y-6">
          
          {/* Bannière d'annonces publique */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Bannière d'Annonce Publique</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Affichez un message prioritaire visible en haut de chaque page (ex: rentrée, bourses Eiffel ouvertes)
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAnnouncement}
                  onChange={(e) => setShowAnnouncement(e.target.checked)}
                  className="rounded border-slate-300 text-blue-700 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-xs font-semibold text-slate-700">Activer la bannière</span>
              </label>
            </div>

            {showAnnouncement && (
              <div className="space-y-3">
                <textarea
                  rows={2}
                  value={bannerAnnouncement}
                  onChange={(e) => setBannerAnnouncement(e.target.value)}
                  placeholder="Ex : Rentrée universitaire 2026 : candidatures bourses France Excellence Eiffel & DAAD ouvertes !"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none resize-none"
                />

                {/* Banner urgency style */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Style d'alerte :</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setBannerType('info')}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                        bannerType === 'info' ? 'bg-blue-50 border-blue-500 text-blue-800' : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      Information (Bleu)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBannerType('success')}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                        bannerType === 'success' ? 'bg-amber-50 border-amber-500 text-amber-800' : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      Bourses & Succès (Or)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBannerType('warning')}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                        bannerType === 'warning' ? 'bg-orange-50 border-orange-500 text-orange-800' : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      Important (Orange)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBannerType('urgent')}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                        bannerType === 'urgent' ? 'bg-red-50 border-red-500 text-red-800' : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      Urgent (Rouge)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Onglet par défaut à l'ouverture */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Module de Démarrage Par Défaut</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sélectionnez la vue qui s'affiche automatiquement à l'ouverture de l'application
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'feed', label: 'Fil d’Actualité', icon: FileText, desc: 'Publications et échanges' },
                { id: 'opportunities', label: 'Bourses & Stages', icon: GraduationCap, desc: 'Offres et financements' },
                { id: 'resources', label: 'Bibliothèque de Cours', icon: BookOpen, desc: 'Sujets et résumés de cours' },
                { id: 'directory', label: 'Annuaire Étudiants', icon: School, desc: 'Réseau et mise en relation' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setDefaultTab(m.id as any)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    defaultTab === m.id
                      ? 'border-blue-700 bg-blue-50/50 ring-1 ring-blue-700'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">{m.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleSaveAll()}
              disabled={isSaving}
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Enregistrement en cours...' : 'Enregistrer les paramètres d\'accueil'}</span>
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: APPARENCE, CONFORT & ACCESSIBILITE */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          
          {/* Mode Sombre / Clair & Taille de texte */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Préférences d'Affichage & Confort de Lecture</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ajustez le confort visuel de lecture de la plateforme sur vos appareils
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Thème clair / sombre */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">Thème de contraste</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updatePreferences({ themeMode: 'light' })}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 ${
                      preferences.themeMode === 'light'
                        ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span>Mode Clair</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updatePreferences({ themeMode: 'dark' })}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 ${
                      preferences.themeMode === 'dark'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span>Mode Nuit</span>
                  </button>
                </div>
              </div>

              {/* Taille de texte */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">Densité et taille de police</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => updatePreferences({ fontSize: 'compact' })}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                      preferences.fontSize === 'compact'
                        ? 'bg-blue-700 text-white border-blue-700'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Compact
                  </button>
                  <button
                    type="button"
                    onClick={() => updatePreferences({ fontSize: 'normal' })}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                      preferences.fontSize === 'normal'
                        ? 'bg-blue-700 text-white border-blue-700'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => updatePreferences({ fontSize: 'comfortable' })}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                      preferences.fontSize === 'comfortable'
                        ? 'bg-blue-700 text-white border-blue-700'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Agrandie
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Confidentialité & Notifications */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Confidentialité & Visibilité du Profil</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Contrôlez la visibilité de votre profil auprès de la communauté étudiante
              </p>
            </div>

            <div className="space-y-3 divide-y divide-slate-100">
              <label className="flex items-center justify-between py-2 cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-slate-800">Profil Académique Public</p>
                  <p className="text-[11px] text-slate-500">Visible dans l'annuaire des étudiants panafricains</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.privacy.profilePublic}
                  onChange={(e) => updatePreferences({
                    privacy: { ...preferences.privacy, profilePublic: e.target.checked }
                  })}
                  className="rounded border-slate-300 text-blue-700 focus:ring-blue-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between py-2 cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-slate-800">Restreindre à ma propre université uniquement</p>
                  <p className="text-[11px] text-slate-500">Seuls les camarades inscrits dans le même établissement voient vos détails</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.privacy.showUniversityOnly}
                  onChange={(e) => updatePreferences({
                    privacy: { ...preferences.privacy, showUniversityOnly: e.target.checked }
                  })}
                  className="rounded border-slate-300 text-blue-700 focus:ring-blue-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between py-2 cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-slate-800">Autoriser les messages privés directs</p>
                  <p className="text-[11px] text-slate-500">Permettre aux autres étudiants de démarrer une discussion académique avec vous</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.privacy.allowDirectMessages}
                  onChange={(e) => updatePreferences({
                    privacy: { ...preferences.privacy, allowDirectMessages: e.target.checked }
                  })}
                  className="rounded border-slate-300 text-blue-700 focus:ring-blue-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between py-2 cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-slate-800">Alertes Nouvelles Bourses d'Études</p>
                  <p className="text-[11px] text-slate-500">Recevoir une alerte lors de la parution d'offres Eiffel, DAAD ou nationales</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.notifications.scholarships}
                  onChange={(e) => updatePreferences({
                    notifications: { ...preferences.notifications, scholarships: e.target.checked }
                  })}
                  className="rounded border-slate-300 text-blue-700 focus:ring-blue-500 w-4 h-4"
                />
              </label>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: EXPORT, IMPORT & SAUVEGARDE */}
      {/* ========================================================================= */}
      {activeTab === 'backup' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Sauvegarde, Export & Partage de Configuration</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Exportez ou restaurez la configuration visuelle complète de votre université ou projet associatif
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Export */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                  <Download className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">Exporter la configuration (.json)</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Téléchargez un fichier JSON contenant votre logo, nom, devise, palette de couleurs et bannières personnalisées.
                </p>
              </div>
              <button
                type="button"
                onClick={exportConfig}
                className="w-full py-2.5 px-3 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger le fichier de configuration</span>
              </button>
            </div>

            {/* Import */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">Importer une configuration (.json)</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Chargez une configuration existante pour répliquer le logo et les couleurs sur un autre ordinateur.
                </p>
              </div>
              <label className="w-full py-2.5 px-3 text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                <Upload className="w-4 h-4 text-amber-600" />
                <span>Charger un fichier JSON</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>

          </div>

          {/* Reset Box */}
          <div className="p-4 bg-red-50/70 border border-red-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-red-900">Rétablir les réglages initiaux</p>
              <p className="text-[11px] text-red-700 mt-0.5">
                Supprime toutes les modifications visuelles et réapplique le logo original de CampusHub Africa
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-xs font-bold text-red-700 bg-white border border-red-300 hover:bg-red-50 rounded-xl transition-colors shrink-0"
            >
              Rétablir le design par défaut
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
