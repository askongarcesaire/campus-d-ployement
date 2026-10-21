import React, { useState, useEffect } from 'react';
import {
  GraduationCap, Award, BookOpen, Users, MessageSquare,
  ShieldCheck, ArrowRight, CheckCircle2, ChevronRight, Globe2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const LandingPage: React.FC = () => {
  const { openAuthModal, setActiveTab } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalOpportunities: 0,
    totalResources: 0
  });

  useEffect(() => {
    loadRealStats();
  }, []);

  const loadRealStats = async () => {
    try {
      const res = await api.admin.getStats().catch(() => null);
      if (res?.stats) {
        setStats(res.stats);
      } else {
        // Fallback to directory + opp counts
        const dir = await api.directory.search({ limit: 1 }).catch(() => null);
        const opps = await api.opportunities.list({ limit: 1 }).catch(() => null);
        const resList = await api.resources.list({ limit: 1 }).catch(() => null);
        setStats({
          totalUsers: dir?.total ?? 0,
          totalPosts: 0,
          totalOpportunities: opps?.total ?? 0,
          totalResources: resList?.total ?? 0
        });
      }
    } catch (_e) {}
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-slate-900 to-blue-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-800/60 border border-blue-400/30 text-amber-300 text-xs font-semibold mb-6 shadow-xs backdrop-blur-xs">
            <Globe2 className="w-3.5 h-3.5" />
            <span>La plateforme académique d'Afrique francophone</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            Connecter les étudiants, <br className="hidden sm:inline" />
            partager les opportunités, <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-blue-300 bg-clip-text text-transparent">
              construire l’avenir de l’Afrique.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Rejoignez le réseau social universitaire dédié aux étudiants du Sénégal, de Côte d'Ivoire,
            du Cameroun, du Bénin, du Mali et de toute la diaspora. Bourses vérifiées, partages d'annales corrigées
            et mentorat direct.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
            <button
              onClick={() => openAuthModal('register')}
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Créer mon compte étudiant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('feed')}
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl active:scale-95 transition-all"
            >
              Découvrir les publications
            </button>
          </div>

          {/* Real Metrics Banner */}
          <div className="mt-14 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">{stats.totalUsers}+</p>
              <p className="text-xs text-slate-400 mt-0.5">Membres universitaires</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-400">{stats.totalOpportunities}+</p>
              <p className="text-xs text-slate-400 mt-0.5">Bourses & stages actifs</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">{stats.totalResources}+</p>
              <p className="text-xs text-slate-400 mt-0.5">Documents pédagogiques</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-300">100%</p>
              <p className="text-xs text-slate-400 mt-0.5">Accès gratuit aux cours</p>
            </div>
          </div>

        </div>
      </section>

      {/* Pillars / Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex-1">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700">Fonctionnalités clés</h2>
          <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900">
            Tout pour réussir votre parcours universitaire
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Bourses & Stages */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Bourses & Stages Vérifiés</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Accédez aux offres officielles de bourses internationales (France Excellence Eiffel, DAAD, bourses d'excellence africaines) et aux stages en entreprise, vérifiés par nos modérateurs.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('opportunities')}
              className="mt-4 inline-flex items-center text-xs font-bold text-blue-700 hover:text-blue-800"
            >
              Consulter les bourses <ChevronRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>

          {/* Card 2: Documents Pédagogiques */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Bibliothèque Pédagogique</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Téléchargez librement des polycopiés de cours, fiches de TD, mémoires et anciens sujets d'examens avec corrigés rédigés par les majors de promo.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('resources')}
              className="mt-4 inline-flex items-center text-xs font-bold text-blue-700 hover:text-blue-800"
            >
              Explorer les cours <ChevronRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>

          {/* Card 3: Réseau & Messagerie */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Annuaire & Messagerie Directe</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Trouvez facilement des étudiants et alumni par filière ou université (UCAD, UFHB, UY1, UAC, etc.) et échangez en temps réel pour préparer vos candidatures ou révisions.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('directory')}
              className="mt-4 inline-flex items-center text-xs font-bold text-blue-700 hover:text-blue-800"
            >
              Parcourir l'annuaire <ChevronRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>

        </div>

        {/* Benefits list */}
        <div className="mt-16 bg-gradient-to-br from-blue-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-white">
          <div className="max-w-3xl">
            <h3 className="text-xl sm:text-2xl font-bold mb-4">
              Pourquoi CampusHub Africa transforme la vie des étudiants
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Fin des fausses annonces de bourses payantes grâce à la modération stricte.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Centralisation des annales d'examens rares introuvables sur le web classique.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Entraide transfrontalière entre étudiants des grandes universités francophones.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Accompagnement et mentorat pour la mobilité académique internationale.</span>
              </div>
            </div>
            <div className="mt-8">
              <button
                onClick={() => openAuthModal('register')}
                className="px-6 py-3 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl transition-all"
              >
                Rejoindre la communauté gratuitement
              </button>
            </div>
          </div>
        </div>

      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-10 px-4 sm:px-6 lg:px-8 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">CampusHub Africa</p>
              <p className="text-[11px] text-slate-400">« Connecter les étudiants, partager les opportunités, construire l’avenir de l’Afrique. »</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400 text-xs">
            <span className="hover:text-white cursor-pointer" onClick={() => setActiveTab('feed')}>Fil d'actualité</span>
            <span>·</span>
            <span className="hover:text-white cursor-pointer" onClick={() => setActiveTab('opportunities')}>Bourses</span>
            <span>·</span>
            <span className="hover:text-white cursor-pointer" onClick={() => setActiveTab('resources')}>Ressources</span>
            <span>·</span>
            <span className="hover:text-white cursor-pointer" onClick={() => setActiveTab('directory')}>Annuaire</span>
          </div>

          <p className="text-[11px] text-slate-500">
            © 2026 CampusHub Africa. Tous droits réservés.
          </p>
        </div>
      </footer>

    </div>
  );
};
