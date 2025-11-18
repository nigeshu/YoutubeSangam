
import React, { useState, useEffect } from 'react';

interface OnboardingTourProps {
    isOpen: boolean;
    onComplete: () => void;
    onViewChange: (view: any) => void; // Using 'any' to avoid circular dependency with View type in App.tsx
}

const TOUR_STEPS = [
    {
        viewId: 'featured',
        title: 'Content Dashboard',
        description: 'This is your central command center. Filter your videos, live streams, and shorts. Use the search bar to find specific content and click on any row to inspect details or watch the video.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-12v4m-2-2h4m5 4v4m-2-2h4M17 3h4M19 5v-2m-3 14h4m-2 2v-4" /></svg>
        )
    },
    {
        viewId: 'calendar',
        title: 'Visual Calendar',
        description: 'Visualize your consistency at a glance. This interactive calendar maps out your entire upload history. Click on any date to see exactly what you posted and how it performed that day.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        )
    },
    {
        viewId: 'analytics',
        title: 'Deep Analytics',
        description: 'Go beyond the basics. Track your channel\'s growth trends, monitor total views and likes, and visualize your content distribution between videos, lives, and shorts.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        )
    },
    {
        viewId: 'playlist',
        title: 'Playlists Manager',
        description: 'Review your channel\'s public playlists. We\'ve added a handy quick-copy button to each card so you can instantly share playlist links with your community.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
        )
    },
    {
        viewId: 'track',
        title: 'Goal Tracker',
        description: 'Exclusive to logged-in users. Define your channel milestones, manage a backlog of games or topics you want to cover, and keep track of your progress in one place.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.5 12a9.5 9.5 0 009.5 9.5 9.5 9.5 0 009.5-9.5A9.5 9.5 0 0012 2.5 9.5 9.5 0 002.5 12z" /></svg>
        )
    },
    {
        viewId: 'community',
        title: 'Community Engagement',
        description: 'Stay connected with your audience. View the latest comments across your channel and reply directly via YouTube links. Never miss a conversation again.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
        )
    }
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onComplete, onViewChange }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    useEffect(() => {
        if (isOpen) {
            // Switch the view to match the current step so the user sees what we are talking about
            onViewChange(TOUR_STEPS[currentStepIndex].viewId);
        }
    }, [currentStepIndex, isOpen, onViewChange]);

    if (!isOpen) return null;

    const currentStep = TOUR_STEPS[currentStepIndex];
    const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            onComplete();
        } else {
            setCurrentStepIndex(prev => prev + 1);
        }
    };

    // Calculate top position for desktop sidebar alignment
    // Base offset (Header + Padding) approx 80px. 
    // Stride per menu item approx 56-60px.
    const desktopTopPosition = 85 + (currentStepIndex * 60);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center md:block">
            {/* Dark Backdrop */}
            <div className="absolute inset-0 bg-black/20" onClick={onComplete}></div>

            {/* Tour Card */}
            <div 
                className="relative bg-brand-surface border border-brand-surface-light rounded-xl p-6 md:p-8 max-w-lg w-full shadow-2xl animate-entry flex flex-col gap-4 z-50 mx-4 md:mx-0 md:absolute md:left-[17rem] transition-all duration-300 ease-out"
                style={{ 
                    top: window.innerWidth >= 768 ? `${desktopTopPosition}px` : 'auto'
                }}
            >
                
                {/* Stylish Sharp Arrow (Desktop only) */}
                <div className="hidden md:block absolute -left-2.5 top-8 w-5 h-5 bg-brand-surface border-l border-b border-brand-surface-light transform rotate-45"></div>
                
                <div className="flex items-start justify-between">
                    <div className="p-3 bg-brand-surface-light rounded-lg">
                        {currentStep.icon}
                    </div>
                    <div className="text-xs font-bold text-brand-text-secondary bg-brand-surface-light px-2 py-1 rounded uppercase tracking-wider">
                        Step {currentStepIndex + 1} of {TOUR_STEPS.length}
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl font-bold text-brand-text mb-2">{currentStep.title}</h3>
                    <p className="text-brand-text-secondary leading-relaxed">
                        {currentStep.description}
                    </p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-brand-surface-light">
                    <button 
                        onClick={onComplete}
                        className="text-brand-text-secondary hover:text-brand-text text-sm font-medium transition-colors"
                    >
                        Skip Tour
                    </button>
                    
                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-6 py-2.5 bg-brand-accent text-gray-900 rounded-md font-bold hover:bg-brand-accent-hover transition-all transform hover:scale-105 shadow-lg shadow-brand-accent/10"
                    >
                        {isLastStep ? "Get Started" : "Next"}
                        {!isLastStep && (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
