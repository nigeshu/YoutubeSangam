
import React, { useState } from 'react';
import { auth, db } from '../services/firebase';

interface AuthScreenProps {
    onBack?: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onBack }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [channelUrl, setChannelUrl] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLogin && !channelUrl.trim()) {
            setError("Please provide your YouTube channel URL.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            if (isLogin) {
                const persistence = rememberMe
                    ? window.firebase.auth.Auth.Persistence.LOCAL
                    : window.firebase.auth.Auth.Persistence.SESSION;
                await auth.setPersistence(persistence);
                await auth.signInWithEmailAndPassword(email, password);
            } else {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                if (userCredential.user) {
                    // Save channel URL to a new 'users' collection
                    await db.collection('users').doc(userCredential.user.uid).set({
                        channelUrl: channelUrl,
                        createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
                    });
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen w-screen bg-brand-bg">
            <div className="w-full max-w-md p-8 space-y-6 bg-brand-surface rounded-lg border border-brand-surface-light animate-entry relative">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="absolute top-4 left-4 p-2 rounded-full hover:bg-brand-surface-light text-brand-text-secondary hover:text-brand-text transition-colors"
                        title="Go Back"
                        aria-label="Go Back"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                )}
                <div className="text-center pt-2">
                    <h1 className="text-3xl font-bold text-brand-text">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-brand-text-secondary mt-2">
                        {isLogin ? 'Sign in to access your dashboard' : 'Sign up to get started'}
                    </p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-brand-text-secondary">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-brand-bg border border-brand-surface-light rounded-md text-brand-text placeholder-brand-text-secondary focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password"  className="text-sm font-medium text-brand-text-secondary">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete={isLogin ? "current-password" : "new-password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-brand-bg border border-brand-surface-light rounded-md text-brand-text placeholder-brand-text-secondary focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                            placeholder="••••••••"
                        />
                    </div>
                    {!isLogin && (
                        <div>
                            <label htmlFor="channelUrl" className="text-sm font-medium text-brand-text-secondary">YouTube Channel URL</label>
                            <input
                                id="channelUrl"
                                name="channelUrl"
                                type="url"
                                autoComplete="url"
                                required
                                value={channelUrl}
                                onChange={(e) => setChannelUrl(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-brand-bg border border-brand-surface-light rounded-md text-brand-text placeholder-brand-text-secondary focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                                placeholder="https://youtube.com/@handle"
                            />
                        </div>
                    )}
                     {isLogin && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 text-brand-accent bg-brand-bg border-brand-surface-light rounded focus:ring-brand-accent"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-brand-text-secondary">
                                    Remember me
                                </label>
                            </div>
                        </div>
                    )}
                    {error && <p className="text-sm text-red-400">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-gray-900 bg-brand-accent hover:bg-brand-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent disabled:bg-gray-500 disabled:text-white disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                        </button>
                    </div>
                </form>
                <p className="text-sm text-center text-brand-text-secondary">
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}
                    <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="font-medium text-brand-accent hover:text-brand-accent-hover ml-1">
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthScreen;
