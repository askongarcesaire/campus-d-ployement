import React from 'react';
import { Rss, Award, BookOpen, MessageSquare, User as UserIcon, Sliders } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MobileNav: React.FC = () => {
  const { user, activeTab, setActiveTab, openAuthModal, openUserProfile } = useAuth();

  const tabs = [
    { id: 'feed', label: 'Fil', icon: Rss },
    { id: 'opportunities', label: 'Bourses', icon: Award },
    { id: 'resources', label: 'Cours', icon: BookOpen },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      badge: user?.stats && user.stats.unreadMessages > 0 ? user.stats.unreadMessages : null
    },
    { id: 'settings', label: 'Paramètres', icon: Sliders },
    { id: 'profile', label: user ? 'Profil' : 'Connexion', icon: UserIcon },
  ];

  const handleSelect = (id: string) => {
    if (id === 'profile') {
      if (user) {
        openUserProfile(user.id);
      } else {
        openAuthModal('login');
      }
    } else {
      setActiveTab(id);
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-1 flex items-center justify-around shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleSelect(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
              isActive ? 'text-blue-700 font-bold' : 'text-slate-500 font-medium'
            }`}
          >
            <div className="relative">
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              {tab.badge && (
                <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-amber-500 text-white font-bold text-[8px] rounded-full border border-white">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[9px] sm:text-[10px] mt-0.5 leading-none">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
