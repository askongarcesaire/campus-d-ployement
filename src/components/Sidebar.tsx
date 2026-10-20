import {
  Rss, Award, BookOpen, Users, MessageSquare,
  Bookmark, Shield, Sparkles, LogIn, Sliders
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user, activeTab, setActiveTab, openAuthModal, openUserProfile } = useAuth();

  const navItems = [
    { id: 'feed', label: 'Fil d\'actualité', icon: Rss, badge: null },
    { id: 'opportunities', label: 'Bourses & Stages', icon: Award, highlight: true },
    { id: 'resources', label: 'Bibliothèque de Cours', icon: BookOpen, badge: null },
    { id: 'directory', label: 'Annuaire Étudiants', icon: Users, badge: null },
    { id: 'groups', label: 'Groupes Universitaires', icon: Users, badge: null },
    {
      id: 'messages',
      label: 'Messagerie Directe',
      icon: MessageSquare,
      badge: user?.stats && user.stats.unreadMessages > 0 ? user.stats.unreadMessages : null
    },
    { id: 'saved', label: 'Mes Favoris', icon: Bookmark, badge: null },
    { id: 'settings', label: 'Paramètres & Logo', icon: Sliders, badge: null },
  ];

  const handleSelect = (id: string) => {
    if (id === 'profile' && user) {
      openUserProfile(user.id);
    } else {
      setActiveTab(id);
    }
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-full flex flex-col justify-between py-4">
      <div className="space-y-1">
        
        {/* Navigation List */}
        <nav className="space-y-1" aria-label="Menu principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-800 text-white shadow-sm shadow-blue-900/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-amber-600' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-500 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Admin tab if role allows */}
          {user && (user.role === 'ADMIN' || user.role === 'MODERATOR') && (
            <button
              onClick={() => handleSelect('admin')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'admin'
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-800 hover:bg-amber-50'
              }`}
            >
              <Shield className="w-4 h-4 text-amber-600" />
              <span>Administration</span>
            </button>
          )}
        </nav>
      </div>

      {/* Mini Profile / Auth Card in Sidebar bottom */}
      <div className="pt-4 mt-6 border-t border-slate-200">
        {user ? (
          <div
            onClick={() => openUserProfile(user.id)}
            className="p-3 bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl border border-slate-200/80 cursor-pointer hover:border-blue-300 transition-all group"
          >
            <div className="flex items-center gap-3">
              <img
                src={user.profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                alt=""
                className="w-10 h-10 rounded-xl object-cover border border-white shadow-sm"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-700">
                  {user.profile?.first_name} {user.profile?.last_name}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {user.profile?.academic_level} · {user.profile?.country}
                </p>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
              <span>{user.stats?.postsCount || 0} posts</span>
              <span>·</span>
              <span>{user.stats?.resourcesCount || 0} ressources</span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-2xl shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Rejoignez-nous</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed mb-3">
              Connectez-vous pour échanger avec des milliers d'étudiants d'Afrique francophone.
            </p>
            <button
              onClick={() => openAuthModal('register')}
              className="w-full py-2 px-3 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              Créer mon compte
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
