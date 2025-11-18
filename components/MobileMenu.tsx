
import React from 'react';

type View = 'featured' | 'calendar' | 'analytics' | 'playlist' | 'track' | 'community';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  selectedView: View;
  onSelectView: (view: View) => void;
  user: any;
}

interface MenuButtonProps {
  icon: React.ReactElement;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isLocked?: boolean;
}

const MenuButton: React.FC<MenuButtonProps> = ({ icon, label, isActive, onClick, isLocked }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-md transition-colors duration-200 text-left ${
      isActive
        ? 'bg-brand-accent text-gray-900 font-semibold'
        : 'text-brand-text-secondary hover:bg-brand-surface-light hover:text-brand-text'
    } ${isLocked ? 'opacity-75' : ''}`}
  >
    <div className="flex items-center gap-4">
        {icon}
        <span className="text-lg">{label}</span>
    </div>
     {isLocked && (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
    )}
  </button>
);

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, selectedView, onSelectView, user }) => {
  const views: { id: View, label: string, icon: React.ReactElement }[] = [
    {
      id: 'featured',
      label: 'Content',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-12v4m-2-2h4m5 4v4m-2-2h4M17 3h4M19 5v-2m-3 14h4m-2 2v-4" /></svg>
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    },
     {
        id: 'playlist',
        label: 'Playlists',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
    },
    {
      id: 'track',
      label: 'Track',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.5 12a9.5 9.5 0 009.5 9.5 9.5 9.5 0 009.5-9.5A9.5 9.5 0 0012 2.5 9.5 9.5 0 002.5 12z" /></svg>
    },
    {
      id: 'community',
      label: 'Community',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-40">
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      ></div>
      
      {/* Menu */}
      <div className={`fixed top-0 right-0 h-full w-64 bg-brand-surface shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Menu</h2>
                <button onClick={onClose} className="p-2 text-brand-text-secondary hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
             <nav className="flex flex-col gap-2">
                {views.map(view => {
                   const isLocked = (view.id === 'track' || view.id === 'community') && !user;
                   return (
                    <MenuButton
                        key={view.id}
                        label={view.label}
                        icon={view.icon}
                        isActive={selectedView === view.id}
                        onClick={() => onSelectView(view.id)}
                        isLocked={isLocked}
                    />
                   );
                })}
            </nav>
        </div>
      </div>
    </div>
  );
};
