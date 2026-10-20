import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap, Search, Bell, MessageSquare, Plus,
  Shield, User as UserIcon, Bookmark, LogOut, Menu, X, CheckCheck,
  Sliders, Megaphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCustomization, PlatformLogo } from '../context/CustomizationContext';
import { api } from '../services/api';
import { NotificationItem } from '../types';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenCreatePost: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, onOpenCreatePost }) => {
  const { user, logout, openAuthModal, activeTab, setActiveTab, openUserProfile } = useAuth();
  const { branding, colorScheme } = useCustomization();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadNotifsCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await api.notifications.list();
      setNotifications(res.notifications);
    } catch (_err) {
      // quiet fail
    }
  };

  const handleMarkNotifRead = async (id: string, link?: string) => {
    try {
      await api.notifications.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      if (link) {
        if (link.startsWith('/posts')) setActiveTab('feed');
        else if (link.startsWith('/messages')) setActiveTab('messages');
        else if (link.startsWith('/profile')) {
          if (user) openUserProfile(user.id);
        }
      }
    } catch (_err) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (_err) {}
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Default search routing
    if (activeTab === 'opportunities') {
      // already in tab, event can bubble
    } else if (activeTab === 'directory') {
      // search in directory
    } else {
      setActiveTab('feed');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Customizable Announcement Banner */}
      {branding.show_announcement && branding.banner_announcement && (
        <div
          className={`text-white text-xs px-4 py-1.5 flex items-center justify-center gap-2 font-medium shadow-inner text-center ${
            branding.banner_type === 'urgent'
              ? 'bg-gradient-to-r from-red-600 to-rose-700'
              : branding.banner_type === 'warning'
              ? 'bg-gradient-to-r from-orange-600 to-amber-600'
              : branding.banner_type === 'success'
              ? 'bg-gradient-to-r from-amber-600 to-amber-700'
              : 'bg-gradient-to-r from-blue-700 to-indigo-800'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{branding.banner_announcement}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveTab('feed')}
            className="flex items-center gap-2.5 text-left group"
          >
            <PlatformLogo className="transition-transform group-hover:scale-105" />
            <div className="hidden sm:block">
              <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                {branding.platform_name || 'CampusHub Africa'}
              </span>
              <span className="text-[11px] text-slate-500 font-medium block leading-none truncate max-w-xs">
                {branding.platform_slogan || 'Réseau Académique Panafricain'}
              </span>
              {branding.institution_tag && (
                <span className="text-[10px] text-blue-700 font-bold block mt-0.5 truncate max-w-xs">
                  {branding.institution_tag}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher des bourses, cours, anciens sujets, étudiants..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/80 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none transition-all shadow-inner"
            />
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              {/* Quick Create Button */}
              <button
                onClick={onOpenCreatePost}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 active:scale-95 rounded-xl shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Publier</span>
              </button>

              {/* Direct Messages Icon */}
              <button
                onClick={() => setActiveTab('messages')}
                className={`p-2 rounded-xl transition-colors relative ${
                  activeTab === 'messages' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Messagerie instantanée"
              >
                <MessageSquare className="w-5 h-5" />
                {user.stats && user.stats.unreadMessages > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </button>

              {/* Notifications Dropdown */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl relative transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifsCount > 0 && (
                    <span className="absolute top-1 right-1 px-1.5 py-0.2 bg-red-600 text-white font-bold text-[10px] rounded-full border-2 border-white leading-tight">
                      {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">Notifications</span>
                      {unreadNotifsCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-blue-700 hover:text-blue-800 font-medium flex items-center gap-1"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          Tout marquer lu
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500">
                          Aucune notification pour le moment.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleMarkNotifRead(n.id, n.link)}
                            className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3 ${
                              !n.is_read ? 'bg-blue-50/40' : ''
                            }`}
                          >
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                              {n.actor_avatar ? (
                                <img src={n.actor_avatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Bell className="w-4 h-4 text-blue-700" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-900 leading-snug">{n.title}</p>
                              <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{n.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.created_at).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            {!n.is_read && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Direct Settings & Logo Customizer */}
              <button
                onClick={() => setActiveTab('settings')}
                className={`p-2 rounded-xl transition-colors ${
                  activeTab === 'settings' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Personnaliser le logo & les paramètres"
              >
                <Sliders className="w-5 h-5" />
              </button>

              {/* User Profile Avatar & Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <img
                    src={user.profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                    alt={user.profile?.first_name || 'Utilisateur'}
                    className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                  />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {user.profile?.first_name} {user.profile?.last_name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-600">
                        <span className="font-semibold text-blue-700">{user.role}</span>
                        <span>·</span>
                        <span className="truncate">{user.profile?.institution?.split('-')[0] || user.profile?.country}</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          openUserProfile(user.id);
                        }}
                        className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        Mon Profil Académique
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setActiveTab('saved');
                        }}
                        className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                      >
                        <Bookmark className="w-4 h-4 text-slate-400" />
                        Publications Enregistrées
                      </button>

                      {(user.role === 'ADMIN' || user.role === 'MODERATOR') && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setActiveTab('admin');
                          }}
                          className="w-full px-4 py-2 text-xs text-amber-700 hover:bg-amber-50 flex items-center gap-2.5 font-semibold"
                        >
                          <Shield className="w-4 h-4 text-amber-600" />
                          Tableau d'Administration
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setActiveTab('settings');
                        }}
                        className="w-full px-4 py-2 text-xs text-blue-700 hover:bg-blue-50 flex items-center gap-2.5 font-semibold"
                      >
                        <Sliders className="w-4 h-4 text-blue-600" />
                        Personnaliser Logo & Thème
                      </button>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 font-medium"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        Se déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('settings')}
                className={`p-2 rounded-xl transition-colors ${
                  activeTab === 'settings' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Personnaliser le logo & les paramètres"
              >
                <Sliders className="w-5 h-5" />
              </button>
              <button
                onClick={() => openAuthModal('login')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Se connecter
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-sm transition-all"
              >
                Créer un compte
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
