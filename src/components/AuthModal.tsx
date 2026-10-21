import React, { useState, useEffect } from 'react';
import { X, GraduationCap, Eye, EyeOff, AlertCircle, CheckCircle, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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

export const AuthModal: React.FC = () => {
  const { authModalState, closeAuthModal, login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(authModalState.mode);
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Dynamic country change handler
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

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [devResetToken, setDevResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Status & Error
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reference, setReference] = useState<ReferenceData | null>(null);

  useEffect(() => {
    setMode(authModalState.mode);
    setError('');
  }, [authModalState]);

  useEffect(() => {
    api.getReference().then(setReference).catch(() => {});
  }, []);

  if (!authModalState.isOpen) return null;

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
      setError('Les mots de passe saisis ne sont pas identiques.');
      return;
    }

    if (!termsAccepted) {
      setError('Veuillez accepter les conditions d\'utilisation de CampusHub Africa.');
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
        email,
        password,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-blue-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">CampusHub Africa</h3>
              <p className="text-xs text-slate-300">Portail académique panafricain</p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`pb-3 text-xs font-bold transition-all border-b-2 mr-6 ${
              mode === 'login' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Se connecter
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            className={`pb-3 text-xs font-bold transition-all border-b-2 ${
              mode === 'register' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Créer un compte étudiant
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Mode: Login */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Adresse e-mail universitaire ou personnelle</label>
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
                {isLoading ? 'Connexion en cours...' : 'Se connecter à mon compte'}
              </button>
            </form>
          )}

          {/* Mode: Register */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Fatou"
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
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Adresse e-mail académique ou personnelle *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="etudiant@universite.edu"
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
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Confirmation *</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Répéter le mot de passe"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <span>Université ou établissement d'enseignement *</span>
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
                    <option value="">Sélectionnez votre établissement en {country}...</option>
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
                        placeholder={`Nom de votre établissement en ${country}`}
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
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Filière / Domaine d'études *</label>
                <select
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
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
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                  >
                    {reference?.academicLevels.map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Année de promotion</label>
                  <input
                    type="number"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    placeholder="2026"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
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
                    J'accepte les conditions générales d'utilisation et m'engage à partager des contenus académiques authentiques.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-700 hover:bg-blue-800 active:scale-98 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? 'Création de votre profil...' : 'Valider mon inscription'}
              </button>
            </form>
          )}

          {/* Mode: Forgot Password */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span>Réinitialisation du mot de passe</span>
              </div>
              <p className="text-xs text-slate-600">
                Saisissez votre adresse e-mail. Un lien sécurisé vous permettra de définir un nouveau mot de passe.
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
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
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
                  <label className="block text-xs font-bold text-slate-700">Définir le nouveau mot de passe</label>
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

      </div>
    </div>
  );
};
