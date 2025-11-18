
import React, { useState } from 'react';
import type { ChannelInfo } from '../types';

interface HeaderProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
  channelInfo: ChannelInfo | null;
  channelUrl: string;
  onMenuToggle: () => void;
  user: any | null;
  onSignOut: () => void;
}

const formatSubscribers = (num: number) => {
    return num.toLocaleString('en-US');
};

const HelpModal = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div 
            className="bg-brand-surface border border-brand-surface-light rounded-lg p-6 w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
        >
            <button 
                onClick={onClose} 
                className="absolute top-3 right-3 text-brand-text-secondary hover:text-brand-text"
                aria-label="Close help"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <h3 className="text-xl font-bold text-brand-text mb-4">How to Find Your Channel Link</h3>
            <div className="space-y-4 text-brand-text-secondary">
                <div>
                    <strong className="text-brand-text">1. Go To Your Channel</strong>
                </div>
                <div>
                    <strong className="text-brand-text">2. Go To Channel Info</strong>
                    <img 
                        src="https://i.postimg.cc/m2ZdNRG1/Screenshot-2025-10-30-090810.png" 
                        alt="Screenshot showing where to find channel info" 
                        className="mt-2 rounded-md border border-brand-surface-light w-full"
                    />
                </div>
                <div>
                    <strong className="text-brand-text">3. Select 'Share channel'</strong>
                </div>
                <div>
                    <strong className="text-brand-text">4. Copy Channel Link (For Error Copy Channel ID)</strong>
                </div>
            </div>
        </div>
    </div>
);

export const Header: React.FC<HeaderProps> = ({ onAnalyze, isLoading, channelInfo, channelUrl, onMenuToggle, user, onSignOut }) => {
  const [url, setUrl] = useState('');
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(url);
  };
  
  const Logo = ({ size = 32 }: { size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Youtube Sangam Logo"
        className="text-brand-accent flex-shrink-0"
    >
        <path
            d="M12 2L4 6V18L12 22L20 18V6L12 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M10 9L15 12L10 15V9Z"
            fill="currentColor"
        />
    </svg>
  );

  return (
    <header className="flex-shrink-0 bg-brand-surface border-b border-brand-surface-light p-4 md:px-6 flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
      {/* Desktop Title */}
      <div className="hidden md:flex items-center gap-4 flex-shrink-0 min-w-0">
        <Logo />
        {channelInfo ? (
            <>
                <h1 className="text-xl font-bold text-brand-text truncate" title={channelInfo.name}>{channelInfo.name}</h1>
                <div className="flex items-center gap-1 text-sm text-brand-text-secondary bg-brand-surface-light px-3 py-1 rounded-full flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{formatSubscribers(channelInfo.subscribers)}</span>
                </div>
            </>
        ) : (
            <h1 className="text-xl font-bold text-brand-text">Youtube Sangam</h1>
        )}
      </div>
       {/* Mobile Title */}
      <div className="flex md:hidden items-center gap-3 flex-shrink-0 min-w-0 order-1">
         <Logo size={28} />
         <h1 className="text-lg font-bold text-brand-text truncate">{channelInfo ? channelInfo.name : 'Youtube Sangam'}</h1>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto md:max-w-md flex-1 md:flex-initial order-3 md:order-2">
        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
            <button
                type="button"
                onClick={() => setIsHelpVisible(true)}
                className="p-2.5 bg-brand-surface-light rounded-md text-brand-text-secondary hover:bg-brand-surface-light/80 hover:text-white transition-colors flex-shrink-0"
                title="How to find channel link"
                aria-label="How to find channel link"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>
            <div className="relative flex-1">
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste channel link..."
                    className="w-full bg-brand-bg border border-brand-surface-light rounded-md py-2 pl-4 pr-28 text-brand-text placeholder-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute inset-y-0 right-0 m-1 px-4 py-1.5 bg-brand-accent text-gray-900 rounded font-semibold hover:bg-brand-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-accent disabled:bg-gray-500 disabled:text-white disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? '...' : 'Analyze'}
                </button>
            </div>
        </form>
        {channelInfo && (
             <button
                onClick={() => onAnalyze(channelUrl)}
                disabled={isLoading}
                className="p-2.5 bg-brand-surface-light rounded-md text-brand-text-secondary hover:bg-brand-surface-light/80 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                title="Refresh Data"
                aria-label="Refresh Data"
            >
                {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 15M20 20l-1.5-1.5A9 9 0 003.5 9" />
                    </svg>
                )}
            </button>
        )}
        {user && (
            <button
                onClick={onSignOut}
                className="p-2.5 bg-brand-surface-light rounded-md text-brand-text-secondary hover:bg-red-500/10 hover:text-red-400 transition-colors flex-shrink-0"
                title="Sign Out"
                aria-label="Sign Out"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            </button>
        )}
      </div>

       {/* Mobile Menu Toggle */}
       {channelInfo && (
        <div className="flex items-center order-2 md:hidden">
            <button
            onClick={onMenuToggle}
            className="p-2.5 bg-brand-surface-light rounded-md text-brand-text-secondary hover:bg-brand-surface-light/80 hover:text-white transition-colors"
            aria-label="Open menu"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
            </button>
        </div>
       )}

      {isHelpVisible && <HelpModal onClose={() => setIsHelpVisible(false)} />}
    </header>
  );
};
