import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../services/firebase';
import type { Goal, RawgGame, LibraryGame } from '../types';

interface TrackViewProps {
    user: any; // Firebase user object
}

const RAWG_API_KEY = '6b079d937bdd41559fd6680995dcac9d';

const GoalTracker: React.FC<{ user: any }> = ({ user }) => {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [newGoalText, setNewGoalText] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const goalsCollection = db.collection('goals');

     useEffect(() => {
        if (!user) return;

        setLoading(true);
        const unsubscribe = goalsCollection
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .onSnapshot((snapshot: any) => {
                const fetchedGoals: Goal[] = snapshot.docs.map((doc: any) => ({
                    id: doc.id,
                    ...doc.data()
                } as Goal));
                setGoals(fetchedGoals);
                setLoading(false);
            }, (err: any) => {
                console.error('Firestore subscription error:', err);
                let detailedError = 'Failed to fetch goals. Please check your internet connection and permissions.';
                if (err.code === 'failed-precondition') {
                    detailedError = 'A database index is required. In your Firebase console, create a composite index for the "goals" collection on: "userId" (ascending) and "createdAt" (descending).';
                } else if (err.code === 'permission-denied') {
                    detailedError = 'You do not have permission to view goals. Please check your Firestore security rules.';
                }
                setError(detailedError);
                setLoading(false);
            });
        
        return () => unsubscribe();
    }, [user]);

    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newGoalText.trim() === '') return;
        try {
            await goalsCollection.add({
                text: newGoalText,
                userId: user.uid,
                isCompleted: false,
                createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
            });
            setNewGoalText('');
        } catch (err) {
            console.error(err);
            setError('Failed to add goal.');
        }
    };
    
    const handleToggleGoal = async (id: string, isCompleted: boolean) => {
        try {
            await goalsCollection.doc(id).update({ isCompleted: !isCompleted });
        } catch (err) {
            console.error(err);
            setError('Failed to update goal.');
        }
    };
    
    const handleDeleteGoal = async (id: string) => {
         try {
            await goalsCollection.doc(id).delete();
        } catch (err) {
            console.error(err);
            setError('Failed to delete goal.');
        }
    };
    return (
        <div className="space-y-6">
            <div className="bg-brand-surface border border-brand-surface-light rounded-lg p-4 sm:p-6">
                <form onSubmit={handleAddGoal} className="flex items-center gap-4">
                    <input
                        type="text"
                        value={newGoalText}
                        onChange={(e) => setNewGoalText(e.target.value)}
                        placeholder="e.g., Reach 10k subscribers"
                        className="flex-1 bg-brand-bg border border-brand-surface-light rounded-md py-2 px-4 text-brand-text placeholder-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                    <button type="submit" className="px-5 py-2 bg-brand-accent text-gray-900 rounded-md font-semibold hover:bg-brand-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-accent">
                        Add Goal
                    </button>
                </form>
            </div>

            {error && <p className="text-red-400 text-center py-2">{error}</p>}

            <div className="bg-brand-surface border border-brand-surface-light rounded-lg p-4 sm:p-6">
                <h3 className="text-lg font-bold mb-4">Your Goals</h3>
                {loading ? (
                    <p className="text-brand-text-secondary">Loading goals...</p>
                ) : goals.length === 0 ? (
                    <p className="text-brand-text-secondary">You haven't set any goals yet. Add one above to get started!</p>
                ) : (
                    <ul className="space-y-3">
                        {goals.map((goal, index) => (
                            <li
                                key={goal.id}
                                className="flex items-center justify-between bg-brand-bg p-4 rounded-md border border-brand-surface-light animate-entry"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleToggleGoal(goal.id, goal.isCompleted)}>
                                    <div className={`w-6 h-6 rounded-full border-2 ${goal.isCompleted ? 'bg-brand-accent border-brand-accent' : 'border-brand-text-secondary'} flex items-center justify-center transition-all`}>
                                        {goal.isCompleted && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                    <span className={`transition-colors ${goal.isCompleted ? 'line-through text-brand-text-secondary' : 'text-brand-text'}`}>{goal.text}</span>
                                </div>
                                <button onClick={() => handleDeleteGoal(goal.id)} className="p-2 text-brand-text-secondary hover:text-red-400 rounded-full hover:bg-red-500/10 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

const GameSearch: React.FC<{
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    searchResults: RawgGame[];
    isSearching: boolean;
    handleSearch: (e: React.FormEvent) => void;
    handleCloseSearch: () => void;
    handleAddGame: (game: RawgGame) => void;
    libraryGameIds: Set<number>;
    error: string | null;
}> = ({ searchQuery, setSearchQuery, searchResults, isSearching, handleSearch, handleCloseSearch, handleAddGame, libraryGameIds, error }) => {
    return (
        <div className="space-y-6">
            <div className="bg-brand-surface border border-brand-surface-light rounded-lg p-4 sm:p-6">
                <form onSubmit={handleSearch} className="flex items-center gap-4">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for a game to add..."
                        className="flex-1 bg-brand-bg border border-brand-surface-light rounded-md py-2 px-4 text-brand-text placeholder-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                    <button type="submit" disabled={isSearching} className="px-5 py-2 bg-brand-accent text-gray-900 rounded-md font-semibold hover:bg-brand-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-accent disabled:opacity-50">
                        {isSearching ? '...' : 'Search'}
                    </button>
                </form>
            </div>
            {isSearching && <p className="text-center text-brand-text-secondary">Searching...</p>}
            {error && <p className="text-red-400 text-center py-2 bg-red-900/50 border border-red-700 rounded-lg">{error}</p>}
            {searchResults.length > 0 && (
                <div className="bg-brand-surface border border-brand-surface-light rounded-lg p-4 sm:p-6 animate-entry">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Search Results</h3>
                        <button 
                            onClick={handleCloseSearch}
                            className="p-2 text-brand-text-secondary hover:text-white rounded-full hover:bg-brand-surface-light transition-colors"
                            aria-label="Close search results"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {searchResults.map(game => (
                            <div key={game.id} className="bg-brand-surface-light rounded-lg overflow-hidden flex flex-col">
                            <img src={game.background_image} alt={game.name} className="w-full h-32 object-cover" />
                            <div className="p-4 flex-1 flex flex-col justify-between">
                                <div>
                                        <h4 className="font-bold text-brand-text">{game.name}</h4>
                                        <p className="text-sm text-brand-text-secondary">Released: {game.released}</p>
                                </div>
                                <button 
                                    onClick={() => handleAddGame(game)}
                                    disabled={libraryGameIds.has(game.id)}
                                    className="mt-4 w-full px-4 py-2 bg-brand-accent text-gray-900 rounded-md font-semibold hover:bg-brand-accent-hover disabled:bg-gray-600 disabled:cursor-not-allowed"
                                >
                                {libraryGameIds.has(game.id) ? 'In Library' : 'Add to Library'}
                                </button>
                            </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const StarRating: React.FC<{ rating: number; onRate: (rating: number) => void }> = ({ rating, onRate }) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div className="flex items-center flex-shrink-0">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    onClick={() => onRate(star === rating ? 0 : star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none p-0.5"
                    aria-label={`Rate ${star} stars`}
                >
                    <svg
                        className={`w-5 h-5 transition-colors ${
                            (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-brand-text-secondary'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.05 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                    </svg>
                </button>
            ))}
        </div>
    );
};


const GameLibrary: React.FC<{
    library: LibraryGame[];
    isLoadingLibrary: boolean;
    deletingGameId: string | null;
    handleRemoveGame: (id: string) => void;
    handleStatusChange: (id: string, status: LibraryGame['status']) => void;
    handleRatingChange: (id: string, rating: number) => void;
    error: string | null;
}> = ({ library, isLoadingLibrary, deletingGameId, handleRemoveGame, handleStatusChange, handleRatingChange, error }) => {
    const gameStatuses: LibraryGame['status'][] = ['Playing', 'Planned', 'Completed', 'Pause', 'Gave Up'];

    const gamesByStatus = useMemo(() => {
        const customOrder: LibraryGame['status'][] = ['Playing', 'Planned', 'Completed', 'Pause', 'Gave Up'];
        const grouped: { [key in LibraryGame['status']]?: LibraryGame[] } = {};
        library.forEach(game => {
            if (!grouped[game.status]) {
                grouped[game.status] = [];
            }
            grouped[game.status]!.push(game);
        });

        const orderedEntries = Object.entries(grouped).sort(([statusA], [statusB]) => {
            return customOrder.indexOf(statusA as LibraryGame['status']) - customOrder.indexOf(statusB as LibraryGame['status']);
        });

        return orderedEntries;

    }, [library]);

    return (
        <div className="space-y-6">
            {error && <p className="text-red-400 text-center py-2 bg-red-900/50 border border-red-700 rounded-lg">{error}</p>}
             {isLoadingLibrary ? (
                <p className="text-center text-brand-text-secondary">Loading your library...</p>
             ) : gamesByStatus.length === 0 ? (
                <div className="bg-brand-surface border border-brand-surface-light rounded-lg p-8 text-center">
                    <p className="text-brand-text-secondary">Your game library is empty. Go to the "Game Search" tab to add games!</p>
                </div>
             ) : (
                gamesByStatus.map(([status, games]) => (
                    <div key={status} className="bg-brand-surface border border-brand-surface-light rounded-lg p-4 sm:p-6 animate-entry">
                        <h3 className="text-lg font-bold mb-4">{status} ({games.length})</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {games.map(game => (
                                <div key={game.id} className="flex items-start gap-4 bg-brand-bg p-3 rounded-lg border border-brand-surface-light">
                                    <img src={game.backgroundImage} alt={game.name} className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="font-semibold text-brand-text pr-2 flex-1 truncate" title={game.name}>{game.name}</p>
                                            <StarRating 
                                                rating={game.rating || 0}
                                                onRate={(newRating) => handleRatingChange(game.id, newRating)}
                                            />
                                        </div>
                                        <select 
                                            value={game.status} 
                                            onChange={(e) => handleStatusChange(game.id, e.target.value as LibraryGame['status'])}
                                            className="mt-1 w-full bg-brand-surface-light border border-brand-surface-light rounded-md py-1 px-2 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent"
                                        >
                                            {gameStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <button 
                                            onClick={() => handleRemoveGame(game.id)}
                                            disabled={deletingGameId === game.id}
                                            className="mt-2 w-full text-center px-3 py-1 bg-red-800/50 text-red-300 rounded-md text-sm font-semibold hover:bg-red-700/50 disabled:opacity-50 disabled:cursor-wait"
                                        >
                                            {deletingGameId === game.id ? 'Removing...' : 'Remove'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
             )}
        </div>
    );
};


export const TrackView: React.FC<TrackViewProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<'goals' | 'gameSearch' | 'gameLibrary'>('goals');
    
    // State and logic from GameManager
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<RawgGame[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [library, setLibrary] = useState<LibraryGame[]>([]);
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(true);
    const [deletingGameId, setDeletingGameId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const gamesCollection = db.collection('games');

    useEffect(() => {
        if (!user) return;
        setIsLoadingLibrary(true);
        const unsubscribe = gamesCollection
            .where('userId', '==', user.uid)
            .orderBy('addedAt', 'desc')
            .onSnapshot((snapshot: any) => {
                const games = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as LibraryGame));
                setLibrary(games);
                setIsLoadingLibrary(false);
            }, (err: any) => {
                console.error('Firestore subscription error:', err);
                let detailedError = 'Failed to load game library. Please check your internet connection and Firestore permissions.';
                if (err.code === 'failed-precondition') {
                    detailedError = 'A database index is required. Please create a composite index in Firebase for the "games" collection on: "userId" (ascending) and "addedAt" (descending).';
                } else if (err.code === 'permission-denied') {
                    detailedError = 'You do not have permission to view this library. Please check your Firestore security rules.';
                }
                setError(detailedError);
                setIsLoadingLibrary(false);
            });
        return () => unsubscribe();
    }, [user]);

    const libraryGameIds = useMemo(() => new Set(library.map(g => g.gameId)), [library]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        };
        setIsSearching(true);
        setSearchResults([]);
        setError(null);
        try {
            const response = await fetch(`https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(searchQuery)}&page_size=12`);
            if (!response.ok) throw new Error('RAWG search error: Failed to fetch');
            const data = await response.json();
            setSearchResults(data.results);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSearching(false);
        }
    };
    
    const handleCloseSearch = () => {
        setSearchResults([]);
    };

    const handleAddGame = async (game: RawgGame) => {
        setError(null);
        try {
            await gamesCollection.add({
                userId: user.uid,
                gameId: game.id,
                name: game.name,
                backgroundImage: game.background_image,
                released: game.released,
                status: 'Planned',
                rating: 0,
                addedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
            });
        } catch(err: any) {
            setError(`Could not add game. Error: ${err.message}`);
        }
    };
    
    const handleRemoveGame = async (gameDocId: string) => {
        setDeletingGameId(gameDocId);
        setError(null);
        try {
            await gamesCollection.doc(gameDocId).delete();
        } catch (err: any) {
            console.error("Failed to remove game from library:", err);
            setError(`Could not remove game. This is often due to database security rules. Details: ${err.message}`);
        } finally {
            setDeletingGameId(null);
        }
    };

    const handleStatusChange = async (gameDocId: string, newStatus: LibraryGame['status']) => {
        setError(null);
        try {
            await gamesCollection.doc(gameDocId).update({ status: newStatus });
        } catch (err: any) {
             setError(`Could not update game status. Error: ${err.message}`);
        }
    };

    const handleRatingChange = async (gameDocId: string, newRating: number) => {
        setError(null);
        try {
            await gamesCollection.doc(gameDocId).update({ rating: newRating });
        } catch (err: any) {
             setError(`Could not update game rating. Error: ${err.message}`);
        }
    };


    const tabInfo = {
        goals: {
            title: 'Goal Tracker',
            description: 'Set and manage your content creation goals to stay on track.',
        },
        gameSearch: {
            title: 'Game Search',
            description: "Search for games to add to your library and track your progress.",
        },
        gameLibrary: {
            title: 'Game Library',
            description: "View and manage your collection of games."
        }
    };
    const currentTab = tabInfo[activeTab];

    return (
      <div className="space-y-6 sm:space-y-8 animate-entry">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-text mb-1">{currentTab.title}</h2>
            <p className="text-brand-text-secondary">{currentTab.description}</p>
          </div>

          <div className="flex border-b border-brand-surface-light">
              <button
                  onClick={() => setActiveTab('goals')}
                  className={`px-4 py-2 text-sm font-semibold transition-colors focus:outline-none ${
                      activeTab === 'goals'
                          ? 'border-b-2 border-brand-accent text-brand-text'
                          : 'text-brand-text-secondary hover:text-brand-text'
                  }`}
              >
                  Goals
              </button>
              <button
                  onClick={() => setActiveTab('gameSearch')}
                  className={`px-4 py-2 text-sm font-semibold transition-colors focus:outline-none ${
                      activeTab === 'gameSearch'
                          ? 'border-b-2 border-brand-accent text-brand-text'
                          : 'text-brand-text-secondary hover:text-brand-text'
                  }`}
              >
                  Game Search
              </button>
              <button
                  onClick={() => setActiveTab('gameLibrary')}
                  className={`px-4 py-2 text-sm font-semibold transition-colors focus:outline-none ${
                      activeTab === 'gameLibrary'
                          ? 'border-b-2 border-brand-accent text-brand-text'
                          : 'text-brand-text-secondary hover:text-brand-text'
                  }`}
              >
                  Game Library
              </button>
          </div>

          <div className="space-y-6">
              {activeTab === 'goals' && <GoalTracker user={user} />}
              {activeTab === 'gameSearch' && (
                <GameSearch 
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    searchResults={searchResults}
                    isSearching={isSearching}
                    handleSearch={handleSearch}
                    handleCloseSearch={handleCloseSearch}
                    handleAddGame={handleAddGame}
                    libraryGameIds={libraryGameIds}
                    error={error}
                />
              )}
              {activeTab === 'gameLibrary' && (
                <GameLibrary 
                    library={library}
                    isLoadingLibrary={isLoadingLibrary}
                    deletingGameId={deletingGameId}
                    handleRemoveGame={handleRemoveGame}
                    handleStatusChange={handleStatusChange}
                    handleRatingChange={handleRatingChange}
                    error={error}
                />
              )}
          </div>
        </div>
    );
};