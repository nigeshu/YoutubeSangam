import React from 'react';

type View = 'featured' | 'calendar' | 'analytics' | 'track';

interface SidebarProps {
  selectedView: View;
  onSelectView: (view: View) => void;
}

// FIX: Define a props interface for SidebarButton for better type checking.
interface SidebarButtonProps {
  // FIX: Replaced JSX.Element with React.ReactElement to resolve namespace issue.
  icon: React.ReactElement;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

// FIX: Type SidebarButton as a React.FC to resolve issues with React-specific props like 'key'.
const SidebarButton: React.FC<SidebarButtonProps> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-md transition-colors duration-200 ${
      isActive
        ? 'bg-brand-accent text-gray-900 font-semibold'
        : 'text-brand-text-secondary hover:bg-brand-surface-light hover:text-brand-text'
    }`}
  >
    {icon}
    <span className="text-base">{label}</span>
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ selectedView, onSelectView }) => {
  // FIX: Replaced JSX.Element with React.ReactElement to resolve namespace issue.
  const views: { id: View, label: string, icon: React.ReactElement }[] = [
    {
      id: 'featured',
      label: 'Featured',
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
      id: 'track',
      label: 'Track',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.5 12a9.5 9.5 0 009.5 9.5 9.5 9.5 0 009.5-9.5A9.5 9.5 0 0012 2.5 9.5 9.5 0 002.5 12z" /></svg>
    }
  ];

  return (
    <aside className="w-64 bg-brand-surface border-r border-brand-surface-light p-4 flex-shrink-0 hidden md:block">
      <nav className="flex flex-col gap-2">
        {views.map(view => (
          <SidebarButton
            key={view.id}
            label={view.label}
            icon={view.icon}
            isActive={selectedView === view.id}
            onClick={() => onSelectView(view.id)}
          />
        ))}
      </nav>
    </aside>
  );
};