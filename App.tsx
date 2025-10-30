import React, { useState } from 'react';
import type { Video, ChannelInfo } from './types';
import { fetchChannelData } from './services/geminiService';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { CalendarView } from './components/CalendarView';
import { AnalyticsView } from './components/AnalyticsView';
import { FeaturedView } from './components/FeaturedView';
import { MobileMenu } from './components/MobileMenu';

type View = 'featured' | 'calendar' | 'analytics';

function App() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
  const [channelUrl, setChannelUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<View>('featured');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleAnalyze = async (url: string) => {
    if (!url) return;
    setIsLoading(true);
    setError(null);
    setChannelUrl(url);

    try {
      const { videos, channelInfo } = await fetchChannelData(url);
      setVideos(videos);
      setChannelInfo(channelInfo);
      setSelectedView('featured'); // Reset to featured view on new analysis
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
      setVideos([]);
      setChannelInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectView = (view: View) => {
    setSelectedView(view);
    setIsMenuOpen(false); // Close menu on selection
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-brand-accent mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg text-brand-text-secondary">Analyzing channel data...</p>
            <p className="text-sm text-brand-text-secondary">This may take a moment.</p>
          </div>
        </div>
      );
    }
    
    if (error) {
        return (
            <div className="flex items-center justify-center h-full text-center p-4">
                <div className="bg-red-900/50 border border-red-700 text-red-300 p-6 rounded-xl max-w-md">
                    <h3 className="text-xl font-bold mb-2">Analysis Failed</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!channelInfo) {
      return <WelcomeScreen />;
    }

    switch (selectedView) {
      case 'featured':
        return <FeaturedView videos={videos} />;
      case 'calendar':
        return <CalendarView videos={videos} />;
      case 'analytics':
        return <AnalyticsView videos={videos} />;
      default:
        return <WelcomeScreen />;
    }
  };

  return (
    <div className="h-screen w-screen bg-brand-bg text-brand-text flex flex-col font-sans overflow-hidden">
      <Header 
        onAnalyze={handleAnalyze} 
        isLoading={isLoading} 
        channelInfo={channelInfo} 
        channelUrl={channelUrl}
        onMenuToggle={() => setIsMenuOpen(true)}
      />
       {channelInfo && (
        <MobileMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          selectedView={selectedView}
          onSelectView={handleSelectView}
        />
       )}
      <div className="flex-1 flex overflow-hidden">
        {channelInfo && (
          <Sidebar 
            selectedView={selectedView} 
            onSelectView={handleSelectView} 
          />
        )}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-brand-bg">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;