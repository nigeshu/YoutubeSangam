import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import type { Goal } from '../types';


const Feature: React.FC<{ icon: React.ReactElement, title: string, description: string }> = ({ icon, title, description }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 bg-brand-surface-light p-3 rounded-md text-brand-accent">
            {icon}
        </div>
        <div>
            <h4 className="font-bold text-brand-text">{title}</h4>
            <p className="text-sm text-brand-text-secondary">{description}</p>
        </div>
    </div>
);

const GoalTracker: React.FC<{ user: any; onTrackClick: () => void }> = ({ user, onTrackClick }) => {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [newGoalText, setNewGoalText] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const goalsCollection = user ? db.collection('goals') : null;

    useEffect(() => {
        if (!user || !goalsCollection) {
            setLoading(false);
            setGoals([]);
            return;
        }

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
                console.error(err);
                setError('Failed to fetch goals.');
                setLoading(false);
            });
        
        return () => unsubscribe();
    }, [user]);

    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newGoalText.trim() === '' || !goalsCollection) return;

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
        if (!goalsCollection) return;
        try {
            await goalsCollection.doc(id).update({ isCompleted: !isCompleted });
        } catch (err) {
            console.error(err);
            setError('Failed to update goal.');
        }
    };
    
    const handleDeleteGoal = async (id: string) => {
        if (!goalsCollection) return;
         try {
            await goalsCollection.doc(id).delete();
        } catch (err) {
            console.error(err);
            setError('Failed to delete goal.');
        }
    };

    if (!user) {
        return (
            <div className="text-center bg-brand-surface border border-brand-surface-light rounded-lg p-8">
                <h3 className="text-2xl font-bold text-brand-text mb-2">Track Your Channel Goals</h3>
                <p className="text-brand-text-secondary mb-6">Log in or create an account to set, manage, and track your content creation goals.</p>
                <button
                    onClick={onTrackClick}
                    className="px-6 py-3 bg-brand-accent text-gray-900 rounded-md font-semibold hover:bg-brand-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-accent transition-colors"
                >
                    Sign In to Get Started
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-brand-text mb-1">Track Your Goals</h2>
                <p className="text-brand-text-secondary">Set and manage your content creation goals to stay on track.</p>
            </div>
            
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

            {error && <p className="text-red-400 text-center">{error}</p>}

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
}

interface WelcomeScreenProps {
    user: any;
    onTrackClick: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ user, onTrackClick }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full p-4 sm:p-8 overflow-y-auto">
            <div className="w-full max-w-4xl mx-auto">
                <div className="grid lg:grid-cols-5 gap-8 lg:gap-16 items-center">
                    
                    {/* Left Column: Content */}
                    <div className="lg:col-span-3 text-center lg:text-left">
                        <div className="relative inline-block mx-auto lg:mx-0">
                             <svg xmlns="http://www.w3.org/2000/svg" className="relative z-10 h-20 w-20 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.5,12a3.5,3.5 0 1,1 -7,0a3.5,3.5 0 1,1 7,0" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12,2.5a9.5,9.5 0 1,0 0,19a9.5,9.5 0 1,0 0,-19" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12,7.5 L12,12 L14.5,14.5" />
                            </svg>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-brand-text mt-6 mb-3">Welcome to Youtube Sangam</h2>
                        <p className="text-lg text-brand-text-secondary mb-8">
                            Paste a channel link above to unlock insights. Discover content patterns, dive deep into performance analytics, and browse a complete content library.
                        </p>
                        <div className="space-y-6">
                            <Feature 
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                                title="Performance Analytics"
                                description="Track total views, likes, and content breakdown with easy-to-read charts."
                            />
                             <Feature 
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V10zM15 10a1 1 0 011-1h2a1 1 0 011 1v10a1 1 0 01-1 1h-2a1 1 0 01-1-1V10z" /></svg>}
                                title="Content Browser"
                                description="Filter and paginate through the last 200 videos, shorts, and live streams."
                            />
                             <Feature 
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                                title="Visual Calendar"
                                description="See the channel's entire posting schedule on an interactive monthly calendar."
                            />
                        </div>
                    </div>
                     <div className="lg:col-span-2">
                        {/* The GoalTracker can be placed here or below for a different layout */}
                     </div>
                </div>

                <div className="mt-16 animate-entry" style={{ animationDelay: '300ms' }}>
                    <GoalTracker user={user} onTrackClick={onTrackClick} />
                </div>
            </div>
        </div>
    );
};