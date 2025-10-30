import React from 'react';

const Feature: React.FC<{ icon: React.ReactElement, title: string, description: string }> = ({ icon, title, description }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 bg-brand-surface-light p-3 rounded-lg text-brand-accent">
            {icon}
        </div>
        <div>
            <h4 className="font-bold text-brand-text">{title}</h4>
            <p className="text-sm text-brand-text-secondary">{description}</p>
        </div>
    </div>
);


export const WelcomeScreen: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full p-4 sm:p-8">
            <div className="w-full max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                    
                    {/* Left Column: Content */}
                    <div className="text-center lg:text-left">
                        <div className="relative inline-block mx-auto lg:mx-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="relative z-10 h-20 w-20 text-brand-accent" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                            </svg>
                             <div className="absolute inset-0 bg-brand-accent rounded-full opacity-20 animate-ping"></div>
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

                    {/* Right Column: Decoration (PC only) */}
                    <div className="hidden lg:block relative h-96">
                         {/* Blurred background shapes */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-accent/10 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute top-10 right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
                        
                        {/* Floating UI Card 1: Video Player */}
                        <div className="absolute top-10 left-0 w-80 bg-brand-surface/80 backdrop-blur-md border border-brand-surface-light rounded-2xl shadow-2xl p-4 transition-transform duration-500 hover:translate-y-[-10px] hover:rotate-[-3deg]">
                             <div className="w-full h-36 bg-brand-bg rounded-lg mb-3 flex items-center justify-center">
                                 <div className="w-12 h-12 bg-brand-accent/50 rounded-full flex items-center justify-center">
                                     <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
                                 </div>
                             </div>
                             <div className="h-4 bg-brand-bg rounded-full w-3/4"></div>
                             <div className="h-3 bg-brand-bg rounded-full w-1/2 mt-2"></div>
                        </div>

                        {/* Floating UI Card 2: Analytics */}
                         <div className="absolute bottom-10 right-0 w-60 bg-brand-surface/80 backdrop-blur-md border border-brand-surface-light rounded-2xl shadow-2xl p-4 transition-transform duration-500 hover:translate-y-[-10px] hover:rotate-[4deg]">
                            <p className="text-sm text-brand-text-secondary">Total Views</p>
                            <p className="text-3xl font-bold text-brand-text">1.2M</p>
                            <div className="flex -space-x-2 mt-2">
                                <div className="w-full h-2 bg-brand-accent rounded-l-full"></div>
                                <div className="w-1/2 h-2 bg-blue-500"></div>
                                <div className="w-1/4 h-2 bg-violet-500 rounded-r-full"></div>
                            </div>
                        </div>

                        {/* Floating UI Card 3: Calendar */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 bg-brand-surface/60 backdrop-blur-md border border-brand-surface-light rounded-2xl shadow-2xl p-3 transition-transform duration-500 hover:scale-110 z-10">
                             <div className="grid grid-cols-7 gap-1">
                                {Array.from({ length: 14 }).map((_, i) => (
                                    <div key={i} className={`w-5 h-5 rounded ${i === 3 || i === 8 || i === 10 ? 'bg-brand-accent/50' : 'bg-brand-bg'}`}></div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};