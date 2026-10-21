import React, { useState, useEffect } from 'react';
import {
  GraduationCap, Eye, EyeOff, AlertCircle, CheckCircle,
  Sparkles, Award, BookOpen, Users, Globe2, ShieldCheck,
  ArrowRight, KeyRound, Lock, Check, Sliders
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCustomization, PlatformLogo } from '../context/CustomizationContext';
import { api } from '../services/api';
import { ReferenceData } from '../types';
import {
  AFRICAN_ACADEMIC_DIRECTORY,
  getAllAfricanCountries,
  getCitiesByCountry,
  getUniversitiesByCountry,
  getCountryMeta
} from '../data/africanDirectory';
import { CountryFlag } from './CountryFlag';

interface AuthGatePageProps {
  onExploreGuest?: () => void;
  onOpenSettings?: () => void;
}

export const AuthGatePage: React.FC<AuthGatePageProps> = ({ onExploreGuest, onOpenSettings }) => {
  const { login, register } = useAuth();
  const { branding, colorScheme } = useCustomization();
  const [tab, setTab] = useState<'register' | 'login' | 'forgot'>('register');
  const [reference, setReference] = useState<ReferenceData | null>(null);

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOpportunities: 0,
    totalResources: 0
  });

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [country, setCountry] = useState('Sénégal');
  const [city, setCity] = useState('Dakar');
  const [isCustomCity, setIsCustomCity] = useState(false);
  const [customCity, setCustomCity] = useState('');
  const [institution, setInstitution] = useState('');
  const [isCustomInstitution, setIsCustomInstitution] = useState(false);
  const [customInstitution, setCustomInstitution] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [academicLevel, setAcademicLevel] = useState('Licence 3 (L3)');
  const [graduationYear, setGraduationYear] = useState('2026');
  const [termsAccepted, setTermsAccepted] = useState(true);

  // When country changes, dynamically update cities and universities
  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    const newCities = getCitiesByCountry(newCountry);
    setCity(newCities[0] || '');
    setIsCustomCity(false);
    setCustomCity('');
    setInstitution('');
    setIsCustomInstitution(false);
    setCustomInstitution('');
  };

  // Forgot Password form
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [devResetToken, setDevResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Status & loading
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.getReference().then(res => {
      setReference(res);
      if (res?.stats) {
        setStats(res.stats);
      }
    }).catch(() => {});
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(loginEmail, loginPassword);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (registerPassword !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    if (!termsAccepted) {
      setError('Veuillez accepter les conditions d\'utilisation pour continuer.');
      return;
    }

    const effectiveCity = isCustomCity ? (customCity.trim() || 'Ville') : (city || getCitiesByCountry(country)[0] || 'Dakar');
    const effectiveInstitution = (isCustomInstitution && customInstitution.trim())
      ? customInstitution.trim()
      : (institution || getUniversitiesByCountry(country)[0] || 'Autre établissement');

    setIsLoading(true);
    try {
      await register({
        firstName,
        lastName,
        email: registerEmail,
        password: registerPassword,
        confirmPassword,
        country,
        city: effectiveCity,
        institution: effectiveInstitution,
        fieldOfStudy: fieldOfStudy || (reference?.fieldsOfStudy[0] || 'Informatique & Génie Logiciel'),
        academicLevel,
        graduationYear,
        termsAccepted
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de compte');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await api.auth.forgotPassword(forgotEmail);
      setForgotSuccess(res.message);
      if (res.devResetToken) setDevResetToken(res.devResetToken);
    } catch (err: any) {
      setError(err.message || 'Erreur de réinitialisation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await api.auth.resetPassword(devResetToken, newPassword);
      setForgotSuccess(res.message);
      setTimeout(() => {
        setTab('login');
        setForgotSuccess('');
        setDevResetToken('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erreur de réinitialisation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Navbar Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PlatformLogo className="shadow-lg shadow-blue-900/30" />
            <div>
              <span className="text-lg font-bold tracking-tight text-white block leading-tight">
                {branding.platform_name || 'CampusHub Africa'}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block leading-none truncate max-w-xs">
                {branding.platform_slogan || 'Le Réseau Académique Panafricain'}
              </span>
              {branding.institution_tag && (
                <span className="text-[10px] text-amber-400 font-semibold block mt-0.5 truncate max-w-xs">
                  {branding.institution_tag}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                title="Personnaliser le logo et les paramètres"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Personnaliser Logo</span>
              </button>
            )}
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-400">
              <Globe2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Afrique Francophone & Diaspora</span>
            </span>
            {onExploreGuest && (
              <button
                onClick={onExploreGuest}
                className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 transition-colors"
              >
                Mode Visiteur
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-14">
        
        {/* Left Presentation Column */}
        <div className="flex-1 max-w-xl text-left space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/40 border border-blue-500/30 text-amber-300 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Plateforme Officielle Étudiante</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Connecter les étudiants, <br />
            partager les opportunités, <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-blue-400 bg-clip-text text-transparent">
              construire l’avenir de l’Afrique.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Rejoignez des milliers d'étudiants de Dakar, Abidjan, Yaoundé, Cotonou, Bamako, Ouagadougou, Lomé et d'ailleurs.
            Accédez gratuitement aux bourses internationales certifiées, aux fiches de cours et annales corrigées d'examens.
          </p>

          {/* 3 Core Strengths */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <h3 className="font-bold text-white">Bourses & Stages Vérifiés</h3>
                <p className="text-slate-400 mt-0.5">Fini les fausses annonces : vérification systématique des bourses France Excellence Eiffel, DAAD et stages.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <h3 className="font-bold text-white">Bibliothèque Académique Partagée</h3>
                <p className="text-slate-400 mt-0.5">Téléchargement libre de polycopiés de cours, sujets d'examens et annales avec corrigés rédigés par les majors.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Users className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <h3 className="font-bold text-white">Réseau & Messagerie Directe</h3>
                <p className="text-slate-400 mt-0.5">Entraide, binômes de révision et messagerie instantanée en temps réel entre étudiants d'universités partenaires.</p>
              </div>
            </div>
          </div>

          {/* Real Metrics Banner */}
          <div className="pt-4 border-t border-slate-800 grid grid-cols-3 gap-3 text-center">
            <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
              <p className="text-xl font-extrabold text-white">{stats.totalUsers}+</p>
              <p className="text-[10px] text-slate-400">Étudiants inscrits</p>
            </div>
            <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
              <p className="text-xl font-extrabold text-amber-400">{stats.totalOpportunities}+</p>
              <p className="text-[10px] text-slate-400">Bourses ouvertes</p>
            </div>
            <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
              <p className="text-xl font-extrabold text-blue-400">{stats.totalResources}+</p>
              <p className="text-[10px] text-slate-400">Cours & Annales</p>
            </div>
          </div>

        </div>

        {/* Right Authentication Gate Card */}
        <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden shrink-0">
          
          {/* Card Header */}
          <div className="p-5 bg-gradient-to-r from-blue-900 via-blue-950 to-slate-900 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Portail d'Accès</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold leading-tight">
              {tab === 'register' ? 'Créer mon compte étudiant' : tab === 'login' ? 'Connexion à mon compte' : 'Réinitialiser mon mot de passe'}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {tab === 'register'
                ? 'Rejoignez la communauté universitaire en quelques secondes.'
                : 'Accédez à votre espace personnel et aux opportunités.'}
            </p>
          </div>

          {/* Form Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-2">
            <button
              onClick={() => { setTab('register'); setError(''); }}
              className={`pb-3 text-xs font-bold transition-all border-b-2 mr-6 ${
                tab === 'register' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Nouveau ? Créer un compte
            </button>
            <button
              onClick={() => { setTab('login'); setError(''); }}
              className={`pb-3 text-xs font-bold transition-all border-b-2 ${
                tab === 'login' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Déjà membre ? Se connecter
            </button>
          </div>

          {/* Form Content */}
          <div className="p-5 sm:p-6">
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* TAB: Register */}
            {tab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Prénom *</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Mariama"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Nom *</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Diallo"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Adresse e-mail universitaire ou personnelle *</label>
                  <input
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="votre.nom@universite.edu ou nom@gmail.com"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Mot de passe *</label>
                    <div className="relative">
                      <input
                        type={showRegisterPassword ? 'text' : 'password'}
                        required
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder="Min. 6 car."
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showRegisterPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Confirmation *</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Répéter mot de passe"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* PAYS (54 PAYS D'AFRIQUE + DIASPORA) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CountryFlag country={country} size="sm" />
                        <span>Pays d'Afrique *</span>
                      </span>
                      <span className="text-[10px] text-blue-700 font-semibold flex items-center gap-1">
                        <CountryFlag country={country} size="sm" />
                        <span>{country}</span>
                      </span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-2.5 pointer-events-none select-none z-10 flex items-center">
                        <CountryFlag country={country} size="sm" />
                      </div>
                      <select
                        value={country}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none font-medium text-slate-800"
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

                  {/* VILLE DYNAMIQUE SELON PAYS */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Ville de résidence *</span>
                      <span className="text-[10px] text-slate-500 font-normal">Selon {country}</span>
                    </label>
                    {!isCustomCity ? (
                      <select
                        value={city}
                        onChange={(e) => {
                          if (e.target.value === '__custom__') {
                            setIsCustomCity(true);
                            setCustomCity('');
                          } else {
                            setCity(e.target.value);
                          }
                        }}
                        className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                      >
                        {getCitiesByCountry(country).map((cty) => (
                          <option key={cty} value={cty}>{cty}</option>
                        ))}
                        <option value="__custom__">✍️ Autre ville non répertoriée...</option>
                      </select>
                    ) : (
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          required
                          value={customCity}
                          onChange={(e) => setCustomCity(e.target.value)}
                          placeholder={`Ville en ${country}`}
                          className="flex-1 px-3 py-2 text-xs bg-white border border-blue-500 rounded-xl focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setIsCustomCity(false)}
                          className="px-2.5 py-1 text-[10px] text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl shrink-0"
                          title="Revenir à la liste"
                        >
                          Liste
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* UNIVERSITE DYNAMIQUE SELON PAYS */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Université / Établissement *</span>
                    <span className="text-[10px] text-blue-700 font-semibold">{getCountryMeta(country).flag} Universités de {country}</span>
                  </label>
                  {!isCustomInstitution ? (
                    <select
                      value={institution}
                      onChange={(e) => {
                        if (e.target.value === '__custom__' || e.target.value.startsWith('Autre université')) {
                          setIsCustomInstitution(true);
                          setInstitution(e.target.value);
                        } else {
                          setInstitution(e.target.value);
                        }
                      }}
                      className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                    >
                      <option value="">Sélectionnez votre université en {country}...</option>
                      {getUniversitiesByCountry(country).map((inst) => (
                        <option key={inst} value={inst}>{inst}</option>
                      ))}
                      <option value="__custom__">✍️ Autre université / institut non listé...</option>
                    </select>
                  ) : (
                    <div className="space-y-1.5 animate-in fade-in">
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          required
                          value={customInstitution}
                          onChange={(e) => setCustomInstitution(e.target.value)}
                          placeholder={`Nom complet de votre établissement en ${country}`}
                          className="flex-1 px-3 py-2 text-xs bg-white border border-blue-500 rounded-xl focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomInstitution(false);
                            setCustomInstitution('');
                          }}
                          className="px-2.5 py-1 text-[10px] text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl shrink-0"
                        >
                          Revenir à la liste
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        Votre établissement sera enregistré et associé au pays : {country}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Filière / Spécialité *</label>
                  <select
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="">Sélectionnez votre filière...</option>
                    {reference?.fieldsOfStudy.map((f: string) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Niveau d'études *</label>
                    <select
                      value={academicLevel}
                      onChange={(e) => setAcademicLevel(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                    >
                      {reference?.academicLevels.map((lvl: string) => (
                        <option key={lvl} value={lvl}>{lvl}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Promotion</label>
                    <input
                      type="number"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      placeholder="2026"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
                    />
                    <span className="text-[11px] text-slate-600 leading-tight">
                      J'accepte la charte d'entraide académique et les conditions d'utilisation.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 bg-blue-700 hover:bg-blue-800 active:scale-98 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>{isLoading ? 'Création de votre profil...' : 'Valider & Entrer sur CampusHub'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

              </form>
            )}

            {/* TAB: Login */}
            {tab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Adresse e-mail</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="exemple@ucad.sn ou email personnel"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Mot de passe</label>
                    <button
                      type="button"
                      onClick={() => setTab('forgot')}
                      className="text-[11px] text-blue-700 hover:text-blue-800 font-semibold"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-700 hover:bg-blue-800 active:scale-98 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <span>{isLoading ? 'Connexion en cours...' : 'Se connecter & Accéder à la plateforme'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* TAB: Forgot */}
            {tab === 'forgot' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>Récupération de compte</span>
                </div>

                {forgotSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{forgotSuccess}</span>
                  </div>
                )}

                {!devResetToken ? (
                  <form onSubmit={handleForgotSubmit} className="space-y-3">
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="votre-adresse-email@domaine.com"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setTab('login')}
                        className="w-1/3 py-2.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-2/3 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs"
                      >
                        {isLoading ? 'Envoi...' : 'Générer le lien'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700">Définir un nouveau mot de passe</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nouveau mot de passe (min 6 car.)"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs"
                    >
                      Valider le nouveau mot de passe
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>

          {/* Footer note */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500">
            Plateforme réservée aux étudiants et chercheurs d'Afrique francophone.
          </div>

        </div>

      </main>

      {/* Page Footer */}
      <footer className="border-t border-slate-800 py-6 px-4 text-center text-xs text-slate-500">
        <p className="max-w-md mx-auto leading-relaxed">
          CampusHub Africa © 2026 · « Connecter les étudiants, partager les opportunités, construire l’avenir de l’Afrique. »
        </p>
      </footer>

    </div>
  );
};
