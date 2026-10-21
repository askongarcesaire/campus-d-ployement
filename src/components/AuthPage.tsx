import React, { useState, useEffect } from 'react';
import {
  GraduationCap, Eye, EyeOff, AlertCircle, CheckCircle, KeyRound,
  Sparkles, Award, BookOpen, Users, Globe2, ArrowRight, ShieldCheck,
  CheckCircle2, Lock, Mail, User as UserIcon, Building, MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ReferenceData } from '../types';
import { CountryFlag } from './CountryFlag';
import { AFRICAN_ACADEMIC_DIRECTORY, getCountryMeta } from '../data/africanDirectory';

export const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'register' | 'login' | 'forgot'>('register');
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('Sénégal');
  const [city, setCity] = useState('');
  const [institution, setInstitution] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [academicLevel, setAcademicLevel] = useState('Licence 3 (L3)');
  const [graduationYear, setGraduationYear] = useState('2026');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [devResetToken, setDevResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Status & Reference Data
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reference, setReference] = useState<ReferenceData | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOpportunities: 0,
    totalResources: 0
  });

  useEffect(() => {
    api.getReference().then(res => {
      setReference(res);
      if (res?.stats) {
        setStats({
          totalUsers: res.stats.totalUsers || 0,
          totalOpportunities: res.stats.totalOpportunities || 0,
          totalResources: res.stats.totalResources || 0
        });
      }
    }).catch(() => {});
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Échec de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    if (!termsAccepted) {
      setError('Veuillez accepter les conditions d\'utilisation pour créer votre compte.');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        country,
        city,
        institution: institution || (reference?.institutions[0] || 'Université Cheikh Anta Diop (UCAD) - Dakar'),
        fieldOfStudy: fieldOfStudy || (reference?.fieldsOfStudy[0] || 'Informatique & Génie Logiciel'),
        academicLevel,
        graduationYear,
        termsAccepted
      });
    } catch (err: any) {
      setError(err.message || 'Échec de la création de compte');
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
      if (res.devResetToken) {
        setDevResetToken(res.devResetToken);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la réinitialisation');
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
        setMode('login');
        setForgotSuccess('');
        setDevResetToken('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la réinitialisation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Banner Navigation */}
      <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur-md px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-blue-900/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white block leading-tight">
                CampusHub <span className="text-amber-400">Africa</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium block leading-none">
                Réseau Académique Panafricain
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Se connecter
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
              }`}
            >
              Créer un compte
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14">
        
        {/* Left Column: Platform Mission & Benefits */}
        <div className="flex-1 max-w-xl text-left space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-500/30 text-amber-300 text-xs font-semibold shadow-xs">
            <Globe2 className="w-3.5 h-3.5" />
            <span>Portail des Étudiants d'Afrique Francophone</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Connecter les étudiants, <br />
            partager les opportunités, <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-blue-400 bg-clip-text text-transparent">
              construire l’avenir de l’Afrique.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Pour accéder aux bourses vérifiées (Eiffel, DAAD, Afrique Subsaharienne), à la bibliothèque d'annales corrigées,
            et échanger avec des étudiants de l'UCAD, UFHB, UY1, UAC et de tout le continent, veuillez créer votre compte étudiant sécurisé.
          </p>

          {/* Pillars List */}
          <div className="space-y-3.5 pt-2">
            <div className="flex items-start gap-3 bg-slate-800/40 border border-slate-700/50 p-3.5 rounded-2xl">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Bourses & Stages Vérifiés</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Fin des fausses annonces payantes grâce à un contrôle strict des opportunités académiques.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-800/40 border border-slate-700/50 p-3.5 rounded-2xl">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Bibliothèque Universitaire Partagée</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Polycopiés, fiches de TD, mémoires et anciens sujets d'examens avec corrigés complets.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-800/40 border border-slate-700/50 p-3.5 rounded-2xl">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Entraide & Messagerie Directe</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Échangez en temps réel via Socket.io avec les étudiants et mentors de votre filière.</p>
              </div>
            </div>
          </div>

          {/* Real Metrics Banner */}
          <div className="pt-4 border-t border-slate-800 grid grid-cols-3 gap-3">
            <div>
              <p className="text-xl sm:text-2xl font-black text-amber-400">{stats.totalUsers}+</p>
              <p className="text-[11px] text-slate-400">Étudiants inscrits</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-blue-400">{stats.totalOpportunities}+</p>
              <p className="text-[11px] text-slate-400">Bourses actives</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-white">{stats.totalResources}+</p>
              <p className="text-[11px] text-slate-400">Cours & annales</p>
            </div>
          </div>

        </div>

        {/* Right Column: Interactive Connection & Registration Card */}
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 text-slate-900 overflow-hidden">
          
          {/* Card Header Switcher */}
          <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl w-full">
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'register'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Créer un compte
              </button>
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Se connecter
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-7">
            
            {/* Error banner */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Mode 1: Registration Form */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 max-h-[62vh] overflow-y-auto pr-1">
                
                <div className="pb-1">
                  <h2 className="text-base font-bold text-slate-900">Rejoindre la communauté étudiante</h2>
                  <p className="text-xs text-slate-500">Remplissez vos informations académiques pour accéder au réseau</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="etudiant@universite.edu ou nom@gmail.com"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Mot de passe *</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 caractères"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Confirmer mot de passe *</label>
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CountryFlag country={country} size="sm" />
                        <span>Pays d'études *</span>
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
                        onChange={(e) => setCountry(e.target.value)}
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
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Ville</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Dakar, Abidjan..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Université ou établissement *</label>
                  <select
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  >
                    <option value="">Sélectionnez votre université...</option>
                    {reference?.institutions.map((inst) => (
                      <option key={inst} value={inst}>{inst}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Filière / Domaine d'études *</label>
                  <select
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  >
                    <option value="">Sélectionnez votre filière...</option>
                    {reference?.fieldsOfStudy.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Niveau d'études *</label>
                    <select
                      value={academicLevel}
                      onChange={(e) => setAcademicLevel(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                    >
                      {reference?.academicLevels.map((lvl) => (
                        <option key={lvl} value={lvl}>{lvl}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Promotion (Année)</label>
                    <input
                      type="number"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      placeholder="2026"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
                    />
                    <span className="text-[11px] text-slate-600 leading-tight">
                      J'accepte la charte universitaire de CampusHub Africa et confirme l'authenticité de mes données académiques.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-700 hover:bg-blue-800 active:scale-98 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-4"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>{isLoading ? 'Création de votre compte...' : 'Créer mon compte et accéder à la plateforme'}</span>
                </button>
              </form>
            )}

            {/* Mode 2: Login Form */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                <div className="pb-1">
                  <h2 className="text-base font-bold text-slate-900">Connexion à votre espace</h2>
                  <p className="text-xs text-slate-500">Saisissez vos identifiants académiques</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Adresse e-mail</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@ucad.sn ou nom@gmail.com"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Mot de passe</label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-blue-700 hover:text-blue-800 font-medium"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-700 hover:bg-blue-800 active:scale-98 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isLoading ? 'Connexion en cours...' : 'Se connecter'}</span>
                </button>

                <p className="text-center text-xs text-slate-500 pt-2">
                  Nouveau sur CampusHub ?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(''); }}
                    className="font-bold text-blue-700 hover:underline"
                  >
                    Créer un compte en 1 minute
                  </button>
                </p>
              </form>
            )}

            {/* Mode 3: Forgot Password Form */}
            {mode === 'forgot' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>Récupération du compte</span>
                </div>
                <p className="text-xs text-slate-600">
                  Saisissez l'e-mail lié à votre profil étudiant pour réinitialiser votre mot de passe.
                </p>

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
                      placeholder="votre-email@ucad.sn"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="w-1/3 py-2.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                      >
                        Retour
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
                    <label className="block text-xs font-bold text-slate-700">Nouveau mot de passe</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nouveau mot de passe (min 6 caractères)"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs"
                    >
                      Mettre à jour le mot de passe
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 px-4 text-center text-xs text-slate-500">
        <p>CampusHub Africa © 2026 — Plateforme académique panafricaine protégée et modérée.</p>
        <p className="mt-1 text-[11px] text-slate-600">Sénégal · Côte d'Ivoire · Cameroun · Bénin · Mali · Guinée · Burkina Faso · Togo · Gabon · Congo</p>
      </footer>

    </div>
  );
};
