import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentProfile } from '../types';
import { api, tokenStorage } from '../services/api';
import { getSocket, disconnectSocket } from '../services/socket';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (formData: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  authModalState: { isOpen: boolean; mode: 'login' | 'register' };
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  viewProfileUserId: string | null;
  openUserProfile: (userId: string) => void;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  startDirectChat: (targetUserId: string) => Promise<void>;
  reportTarget: { type: string; id: string; title?: string } | null;
  openReportModal: (type: string, id: string, title?: string) => void;
  closeReportModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; mode: 'login' | 'register' }>({
    isOpen: false,
    mode: 'login'
  });
  const [viewProfileUserId, setViewProfileUserId] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<{ type: string; id: string; title?: string } | null>(null);

  const refreshUser = async () => {
    try {
      const token = tokenStorage.get();
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const data = await api.auth.me();
      setUser(data.user);
      getSocket(); // Ensure real-time socket connects
    } catch (_err) {
      tokenStorage.remove();
      setUser(null);
      disconnectSocket();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    tokenStorage.set(res.token);
    setUser(res.user);
    getSocket();
    setAuthModalState({ isOpen: false, mode: 'login' });
  };

  const register = async (formData: any) => {
    const res = await api.auth.register(formData);
    tokenStorage.set(res.token);
    setUser(res.user);
    getSocket();
    setAuthModalState({ isOpen: false, mode: 'login' });
  };

  const logout = () => {
    tokenStorage.remove();
    disconnectSocket();
    setUser(null);
    setActiveTab('feed');
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalState({ isOpen: true, mode });
  };

  const closeAuthModal = () => {
    setAuthModalState(prev => ({ ...prev, isOpen: false }));
  };

  const openUserProfile = (userId: string) => {
    setViewProfileUserId(userId);
    setActiveTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startDirectChat = async (targetUserId: string) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    try {
      const res = await api.messaging.startConversation(targetUserId);
      setActiveConversationId(res.conversationId);
      setActiveTab('messages');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Error starting conversation:', err);
    }
  };

  const openReportModal = (type: string, id: string, title?: string) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    setReportTarget({ type, id, title });
  };

  const closeReportModal = () => {
    setReportTarget(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        activeTab,
        setActiveTab,
        authModalState,
        openAuthModal,
        closeAuthModal,
        viewProfileUserId,
        openUserProfile,
        activeConversationId,
        setActiveConversationId,
        startDirectChat,
        reportTarget,
        openReportModal,
        closeReportModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
