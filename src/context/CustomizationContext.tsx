import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  GraduationCap, Shield, BookOpen, Flame, Star,
  Globe, TreePine, Feather, Sparkles, Image as ImageIcon
} from 'lucide-react';
import {
  SiteSettings, UserPreferences, ThemeColor,
  LogoType, LogoShape, LogoSize, AnnouncementType
} from '../types';
import { api } from '../services/api';

const BRANDING_STORAGE_KEY = 'campushub_branding_custom';
const PREFERENCES_STORAGE_KEY = 'campushub_user_preferences';

export const defaultSettings: SiteSettings = {
  platform_name: 'CampusHub Africa',
  platform_slogan: '« Connecter les étudiants, partager les opportunités, construire l’avenir de l’Afrique. »',
  institution_tag: 'Réseau Académique Panafricain',
  logo_type: 'icon_grad_cap',
  logo_url: '',
  logo_shape: 'rounded',
  logo_size: 'medium',
  primary_color: 'blue',
  custom_color_hex: '#1d4ed8',
  banner_announcement: 'Rentrée universitaire 2026 : bourses France Excellence Eiffel et DAAD ouvertes aux candidatures !',
  banner_type: 'info',
  show_announcement: true,
  default_tab: 'feed',
};

export const defaultPreferences: UserPreferences = {
  themeMode: 'light',
  fontSize: 'normal',
  notifications: {
    scholarships: true,
    messages: true,
    comments: true,
    announcements: true,
  },
  privacy: {
    profilePublic: true,
    showUniversityOnly: false,
    allowDirectMessages: true,
    showEmailPublicly: false,
  },
};

interface CustomizationContextType {
  branding: SiteSettings;
  preferences: UserPreferences;
  updateBranding: (newSettings: Partial<SiteSettings>) => Promise<void>;
  resetBranding: () => Promise<void>;
  updatePreferences: (newPrefs: Partial<UserPreferences>) => void;
  isLoadingBranding: boolean;
  colorScheme: {
    gradient: string;
    primaryBtn: string;
    primaryText: string;
    badgeBg: string;
    borderActive: string;
  };
  exportConfig: () => void;
  importConfig: (jsonString: string) => Promise<boolean>;
}

const CustomizationContext = createContext<CustomizationContextType | undefined>(undefined);

export const CustomizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branding, setBranding] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem(BRANDING_STORAGE_KEY);
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      return saved ? { ...defaultPreferences, ...JSON.parse(saved) } : defaultPreferences;
    } catch {
      return defaultPreferences;
    }
  });

  const [isLoadingBranding, setIsLoadingBranding] = useState(true);

  // Fetch from server settings API on initial load
  useEffect(() => {
    api.settings.get()
      .then((res) => {
        if (res?.settings) {
          setBranding(prev => ({ ...prev, ...res.settings }));
          try {
            localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(res.settings));
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingBranding(false));
  }, []);

  // Sync document title when platform_name changes
  useEffect(() => {
    if (typeof document !== 'undefined' && branding.platform_name) {
      document.title = `${branding.platform_name} — Réseau Académique Panafricain`;
    }
  }, [branding.platform_name]);

  // Apply dark mode class to html element if dark mode is active
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (preferences.themeMode === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [preferences.themeMode]);

  const updateBranding = async (newSettings: Partial<SiteSettings>) => {
    const updated: SiteSettings = { ...branding, ...newSettings };
    setBranding(updated);
    try {
      localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    // Send to backend API
    try {
      await api.settings.update(updated);
    } catch (e) {
      console.warn('Note: settings preserved in browser local storage', e);
    }
  };

  const resetBranding = async () => {
    setBranding(defaultSettings);
    try {
      localStorage.removeItem(BRANDING_STORAGE_KEY);
    } catch {}
    try {
      await api.settings.update(defaultSettings);
    } catch {}
  };

  const updatePreferences = (newPrefs: Partial<UserPreferences>) => {
    const updated: UserPreferences = {
      ...preferences,
      ...newPrefs,
      notifications: { ...preferences.notifications, ...newPrefs.notifications },
      privacy: { ...preferences.privacy, ...newPrefs.privacy },
    };
    setPreferences(updated);
    try {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Export configuration as a downloadable JSON file
  const exportConfig = () => {
    const data = {
      branding,
      preferences,
      exportedAt: new Date().toISOString(),
      generator: 'CampusHub Africa Customizer'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campushub-config-${branding.platform_name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import configuration from JSON string
  const importConfig = async (jsonString: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.branding) {
        await updateBranding(parsed.branding);
      }
      if (parsed.preferences) {
        updatePreferences(parsed.preferences);
      }
      return true;
    } catch (err) {
      console.error('Failed to parse imported configuration:', err);
      return false;
    }
  };

  // Color theme mapper
  const getColorClasses = (color: ThemeColor) => {
    switch (color) {
      case 'amber':
        return {
          gradient: 'from-amber-700 via-amber-800 to-orange-600',
          primaryBtn: 'bg-amber-600 hover:bg-amber-700 text-white',
          primaryText: 'text-amber-700',
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
          borderActive: 'border-amber-600',
        };
      case 'emerald':
        return {
          gradient: 'from-emerald-800 via-emerald-700 to-teal-600',
          primaryBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          primaryText: 'text-emerald-700',
          badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          borderActive: 'border-emerald-600',
        };
      case 'indigo':
        return {
          gradient: 'from-indigo-900 via-indigo-800 to-blue-600',
          primaryBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
          primaryText: 'text-indigo-700',
          badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          borderActive: 'border-indigo-600',
        };
      case 'crimson':
        return {
          gradient: 'from-rose-900 via-rose-800 to-red-600',
          primaryBtn: 'bg-rose-700 hover:bg-rose-800 text-white',
          primaryText: 'text-rose-700',
          badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
          borderActive: 'border-rose-700',
        };
      case 'purple':
        return {
          gradient: 'from-purple-900 via-purple-800 to-violet-600',
          primaryBtn: 'bg-purple-700 hover:bg-purple-800 text-white',
          primaryText: 'text-purple-700',
          badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
          borderActive: 'border-purple-700',
        };
      case 'custom':
        return {
          gradient: 'from-slate-900 via-slate-800 to-blue-900',
          primaryBtn: 'bg-slate-900 hover:bg-slate-800 text-white',
          primaryText: 'text-slate-900',
          badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
          borderActive: 'border-slate-800',
        };
      case 'blue':
      default:
        return {
          gradient: 'from-blue-900 via-blue-800 to-amber-600',
          primaryBtn: 'bg-blue-700 hover:bg-blue-800 text-white',
          primaryText: 'text-blue-700',
          badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
          borderActive: 'border-blue-700',
        };
    }
  };

  const colorScheme = getColorClasses(branding.primary_color);

  return (
    <CustomizationContext.Provider
      value={{
        branding,
        preferences,
        updateBranding,
        resetBranding,
        updatePreferences,
        isLoadingBranding,
        colorScheme,
        exportConfig,
        importConfig
      }}
    >
      {children}
    </CustomizationContext.Provider>
  );
};

export function useCustomization() {
  const context = useContext(CustomizationContext);
  if (!context) {
    throw new Error('useCustomization must be used within CustomizationProvider');
  }
  return context;
}

/**
 * Reusable dynamic Platform Logo component that reflects user customization
 */
export const PlatformLogo: React.FC<{
  className?: string;
  iconClassName?: string;
  showCustomImage?: boolean;
  overrideSize?: LogoSize;
  overrideShape?: LogoShape;
}> = ({
  className,
  iconClassName,
  showCustomImage = true,
  overrideSize,
  overrideShape
}) => {
  const { branding, colorScheme } = useCustomization();

  const shape = overrideShape || branding.logo_shape || 'rounded';
  const size = overrideSize || branding.logo_size || 'medium';

  // Dynamic shape class
  const getShapeClass = () => {
    switch (shape) {
      case 'circle':
        return 'rounded-full';
      case 'shield':
        return 'rounded-t-xl rounded-b-3xl';
      case 'minimal':
        return 'rounded-lg bg-transparent border-0 shadow-none';
      case 'rounded':
      default:
        return 'rounded-xl';
    }
  };

  // Dynamic size class
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'w-8 h-8';
      case 'large':
        return 'w-12 h-12';
      case 'medium':
      default:
        return 'w-10 h-10';
    }
  };

  const getIconSizeClass = () => {
    if (iconClassName) return iconClassName;
    switch (size) {
      case 'small':
        return 'w-4 h-4';
      case 'large':
        return 'w-7 h-7';
      case 'medium':
      default:
        return 'w-5 h-5';
    }
  };

  const baseSizeClass = getSizeClass();
  const baseShapeClass = getShapeClass();
  const effectiveIconClass = getIconSizeClass();

  // If custom URL image or uploaded base64 data url is provided
  if (showCustomImage && branding.logo_type === 'custom_url' && branding.logo_url) {
    return (
      <div
        className={`${baseSizeClass} ${baseShapeClass} overflow-hidden bg-white border border-slate-200/90 flex items-center justify-center shadow-xs shrink-0 ${
          className || ''
        }`}
      >
        <img
          src={branding.logo_url}
          alt={branding.platform_name}
          className="w-full h-full object-contain p-0.5"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  // Render selected vector emblem with current theme gradient
  const renderIcon = () => {
    switch (branding.logo_type) {
      case 'icon_shield':
        return <Shield className={effectiveIconClass} />;
      case 'icon_book':
        return <BookOpen className={effectiveIconClass} />;
      case 'icon_torch':
        return <Flame className={effectiveIconClass} />;
      case 'icon_star':
        return <Star className={effectiveIconClass} />;
      case 'icon_globe':
        return <Globe className={effectiveIconClass} />;
      case 'icon_tree':
        return <TreePine className={effectiveIconClass} />;
      case 'icon_feather':
        return <Feather className={effectiveIconClass} />;
      case 'icon_grad_cap':
      default:
        return <GraduationCap className={effectiveIconClass} />;
    }
  };

  if (shape === 'minimal') {
    return (
      <div className={`${baseSizeClass} flex items-center justify-center ${colorScheme.primaryText} ${className || ''}`}>
        {renderIcon()}
      </div>
    );
  }

  return (
    <div
      className={`${baseSizeClass} ${baseShapeClass} flex items-center justify-center text-white shadow-md bg-gradient-to-tr ${colorScheme.gradient} shrink-0 ${
        className || ''
      }`}
      style={
        branding.primary_color === 'custom' && branding.custom_color_hex
          ? { backgroundColor: branding.custom_color_hex, backgroundImage: 'none' }
          : undefined
      }
    >
      {renderIcon()}
    </div>
  );
};
