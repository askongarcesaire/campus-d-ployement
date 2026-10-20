import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { RightSidebar } from './components/RightSidebar';
import { MobileNav } from './components/MobileNav';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { ReportModal } from './components/ReportModal';
import { FeedView } from './components/FeedView';
import { OpportunitiesView } from './components/OpportunitiesView';
import { ResourcesView } from './components/ResourcesView';
import { DirectoryView } from './components/DirectoryView';
import { GroupsView } from './components/GroupsView';
import { MessagingView } from './components/MessagingView';
import { ProfileView } from './components/ProfileView';
import { AdminView } from './components/AdminView';
import { AuthGatePage } from './components/AuthGatePage';
import { CustomizationProvider } from './context/CustomizationContext';
import { SettingsView } from './components/SettingsView';
import { X } from 'lucide-react';

function AppContent() {
  const { user, activeTab, setActiveTab, viewProfileUserId } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [guestMode, setGuestMode] = useState(false);

  // If user is not authenticated and has not chosen guest preview, display the Connection & Registration Gate
  if (!user && !guestMode) {
    return (
      <AuthGatePage
        onExploreGuest={() => setGuestMode(true)}
        onOpenSettings={() => {
          setGuestMode(true);
          setActiveTab('settings');
        }}
      />
    );
  }

  // Choose center view
  const renderView = () => {
    switch (activeTab) {
      case 'feed':
        return <FeedView />;
      case 'saved':
        return <FeedView savedOnly={true} />;
      case 'opportunities':
        return <OpportunitiesView />;
      case 'resources':
        return <ResourcesView />;
      case 'directory':
        return <DirectoryView />;
      case 'groups':
        return <GroupsView />;
      case 'messages':
        return <MessagingView />;
      case 'profile':
        return <ProfileView userId={viewProfileUserId} />;
      case 'admin':
        return <AdminView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <FeedView />;
    }
  };

  const isWideView = activeTab === 'messages' || activeTab === 'admin' || activeTab === 'settings';

  return (
    <div className="min-h-screen bg-slate-100/60 font-sans text-slate-900 flex flex-col">
      {/* Top Header */}
      <Header
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
        onOpenCreatePost={() => setActiveTab('feed')}
      />

      {/* Main Layout Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex gap-6 items-start">
          
          {/* Left Desktop Sidebar */}
          <div className="hidden md:block w-56 lg:w-64 shrink-0 sticky top-20 max-h-[calc(100vh-90px)] overflow-y-auto scrollbar-none">
            <Sidebar />
          </div>

          {/* Main Content Area */}
          <main className={`flex-1 min-w-0 pb-20 md:pb-8 ${isWideView ? 'w-full' : ''}`}>
            {renderView()}
          </main>

          {/* Right Desktop Column (Context, upcoming deadlines, suggested students) */}
          {!isWideView && (
            <div className="hidden lg:block w-72 shrink-0 sticky top-20 max-h-[calc(100vh-90px)] overflow-y-auto scrollbar-none">
              <RightSidebar />
            </div>
          )}

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-white h-full p-4 flex flex-col justify-between shadow-2xl z-10">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="font-bold text-sm text-slate-900">Menu CampusHub</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />

      {/* Modals */}
      <AuthModal />
      <ReportModal />
    </div>
  );
}

export default function App() {
  return (
    <CustomizationProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </CustomizationProvider>
  );
}
