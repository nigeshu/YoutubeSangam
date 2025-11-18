
import React, { useState, useEffect } from 'react';
import type { Video, ChannelInfo, Playlist } from './types';
import { fetchChannelData } from './services/geminiService';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { CalendarView } from './components/CalendarView';
import { AnalyticsView } from './components/AnalyticsView';
import { FeaturedView } from './components/FeaturedView';
import { PlaylistView } from './components/PlaylistView';
import { CommunityView } from './components/CommunityView';
import { MobileMenu } from './components/MobileMenu';
import { OnboardingTour } from './components/OnboardingTour';
import AuthScreen from './components/AuthScreen';
import { auth, db } from './services/firebase';
import { TrackView } from './components/TrackView';

type View = 'featured' | 'calendar' | 'analytics' | 'track' | 'playlist' | 'community';

function App() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [viewAfterAuth, setViewAfterAuth] = useState<View | null>(null);
  const [hasAnalyzedOnLogin, setHasAnalyzedOnLogin] = useState(false);

  const [videos, setVideos] = useState<Video[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
  const [channelUrl, setChannelUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<View>('featured');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Tour State
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user: any) => {
      setUser(user);
      if (user) {
        try {
          const userDocRef = db.collection('users').doc(user.uid);
          const userDoc = await userDocRef.get();
          
          if (userDoc.exists) {
            const userData = userDoc.data();
            
            // Check for channel data
            if (!hasAnalyzedOnLogin && userData && userData.channelUrl) {
              await handleAnalyze(userData.channelUrl);
              setHasAnalyzedOnLogin(true);
            }

            // Check for tutorial status
            if (!userData?.tutorialCompleted) {
                setShowTour(true);
            }
          }
        } catch (err) {
            console.error("Failed to fetch user profile:", err);
            setError("Could not load your saved channel. Please try analyzing manually.");
        }
      } else {
        // Reset state on logout
        setHasAnalyzedOnLogin(false);
        setShowTour(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [hasAnalyzedOnLogin]); // Only re-run if this flag changes
  
  useEffect(() => {
    // After successful login, redirect to the intended page
    if (user && showAuthScreen && viewAfterAuth) {
        setShowAuthScreen(false);
        setSelectedView(viewAfterAuth);
        setViewAfterAuth(null);
    } else if (user && showAuthScreen) {
        setShowAuthScreen(false);
        // If logged in from welcome screen, go to track view
        if (!channelInfo) {
            setSelectedView('track');
        }
    }
  }, [user, showAuthScreen, viewAfterAuth, channelInfo]);

  const handleSignOut = async () => {
    await auth.signOut();
    // Reset app state on sign out
    setVideos([]);
    setPlaylists([]);
    setChannelInfo(null);
    setChannelUrl('');
    setError(null);
    setSelectedView('featured');
    setShowAuthScreen(false); // Ensure auth screen is hidden
    setHasAnalyzedOnLogin(false);
    setShowTour(false);
  };

  const handleAnalyze = async (url: string) => {
    if (!url) return;
    setIsLoading(true);
    setError(null);
    setChannelUrl(url);

    try {
      const { videos, channelInfo, playlists } = await fetchChannelData(url);
      setVideos(videos);
      setChannelInfo(channelInfo);
      setPlaylists(playlists);
      setSelectedView('featured'); // Reset to featured view on new analysis
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
      setVideos([]);
      setPlaylists([]);
      setChannelInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectView = (view: View) => {
    if ((view === 'track' || view === 'community') && !user) {
        setViewAfterAuth(view);
        setShowAuthScreen(true);
    } else {
        setSelectedView(view);
    }
    setIsMenuOpen(false); // Close menu on selection
  }

  const handleWelcomeScreenTrackClick = () => {
      if (!user) {
          setViewAfterAuth('track'); // Take user to the track view after login
          setShowAuthScreen(true);
      }
  };

  const handleTourComplete = async () => {
      setShowTour(false);
      if (user) {
          try {
              await db.collection('users').doc(user.uid).update({
                  tutorialCompleted: true
              });
          } catch (e) {
              console.error("Failed to update tutorial status", e);
          }
      }
      // Reset to a default safe view after tour
      setSelectedView('featured');
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-brand-text mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                <div className="bg-red-900/50 border border-red-700 text-red-300 p-6 rounded-lg max-w-md">
                    <h3 className="text-xl font-bold mb-2">Analysis Failed</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    // Prioritize TrackView if selected, as it only needs a user
    if (selectedView === 'track' && user) {
        return <TrackView user={user} channelInfo={channelInfo} />;
    }

    if (!channelInfo) {
      return <WelcomeScreen user={user} onTrackClick={handleWelcomeScreenTrackClick} />;
    }

    switch (selectedView) {
      case 'featured':
        return <FeaturedView videos={videos} />;
      case 'calendar':
        return <CalendarView videos={videos} />;
      case 'analytics':
        return <AnalyticsView videos={videos} />;
      case 'playlist':
        return <PlaylistView playlists={playlists} />;
      case 'community':
        return <CommunityView videos={videos} />;
      // 'track' is handled above for logged-in users
      default:
        return <WelcomeScreen user={user} onTrackClick={handleWelcomeScreenTrackClick} />;
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-brand-bg">
        <svg className="animate-spin h-12 w-12 text-brand-text" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (showAuthScreen) {
    return <AuthScreen onBack={() => {
      setShowAuthScreen(false);
      setViewAfterAuth(null);
    }} />;
  }


  return (
    <div className="h-screen w-screen bg-brand-bg text-brand-text flex flex-col font-sans overflow-hidden">
      <Header 
        onAnalyze={handleAnalyze} 
        isLoading={isLoading} 
        channelInfo={channelInfo} 
        channelUrl={channelUrl}
        onMenuToggle={() => setIsMenuOpen(true)}
        user={user}
        onSignOut={handleSignOut}
      />
       {(channelInfo || user) && (
        <MobileMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          selectedView={selectedView}
          onSelectView={handleSelectView}
          user={user}
        />
       )}
      <div className="flex-1 flex overflow-hidden">
        {(channelInfo || user) && (
          <Sidebar 
            selectedView={selectedView} 
            onSelectView={handleSelectView} 
            user={user}
          />
        )}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-brand-bg relative">
          {renderContent()}
        </main>
      </div>

      {/* Onboarding Tour */}
      <OnboardingTour 
        isOpen={showTour} 
        onComplete={handleTourComplete} 
        onViewChange={(view) => setSelectedView(view)}
      />
    </div>
  );
}

export default App;
