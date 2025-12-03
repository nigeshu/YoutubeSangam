import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../services/firebase';

interface AIStudioViewProps {
    user: any;
}

interface ErrorModalProps {
    message: string;
    onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ message, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4 animate-entry" onClick={onClose}>
            <div
                className="bg-brand-surface border border-red-700 rounded-lg p-6 w-full max-w-md relative text-center shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-800/20 text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-red-300 mt-4">Generation Error</h3>
                <p className="text-red-400 mt-2 whitespace-pre-wrap text-sm">{message}</p>
                <div className="mt-6">
                    <button
                        onClick={onClose}
                        className="w-full inline-flex justify-center rounded-md border border-transparent px-4 py-2 bg-brand-accent text-base font-medium text-gray-900 hover:bg-brand-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent sm:w-auto sm:text-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const copyToClipboard = (text: string, onCopy: () => void) => {
    navigator.clipboard.writeText(text).then(onCopy);
};

const GeneratedSection: React.FC<{ title: string; content: string | string[]; onCopy: () => void }> = ({ title, content, onCopy }) => (
    <div>
        <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-brand-text-secondary">{title}</h4>
            <button
                onClick={onCopy}
                className="p-1.5 text-brand-text-secondary hover:text-brand-text hover:bg-brand-surface-light rounded-md transition-colors"
                title={`Copy ${title}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
        </div>
        {typeof content === 'string' ? (
            <p className="bg-brand-bg border border-brand-surface-light rounded-md p-3 text-brand-text whitespace-pre-wrap">{content}</p>
        ) : (
            <div className="flex flex-wrap gap-2">
                {content.map((tag, i) => (
                    <span key={i} className="bg-brand-surface-light text-brand-text text-sm px-2.5 py-1 rounded-full">{tag}</span>
                ))}
            </div>
        )}
    </div>
);

export const AIStudioView: React.FC<AIStudioViewProps> = ({ user }) => {
    // Inputs
    const [contentRequirements, setContentRequirements] = useState('');
    const [sampleTitle, setSampleTitle] = useState('');
    const [sampleDescription, setSampleDescription] = useState('');
    const [isTitleLocked, setIsTitleLocked] = useState(false);
    const [isDescriptionLocked, setIsDescriptionLocked] = useState(false);

    // API State
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [streamingResponse, setStreamingResponse] = useState('');
    const [generatedContent, setGeneratedContent] = useState<{ title: string; description: string; tags: string[] } | null>(null);

    // UI State
    const [copiedItem, setCopiedItem] = useState<string | null>(null);

    const userDocRef = useMemo(() => user ? db.collection('users').doc(user.uid) : null, [user]);

    // Load locked samples on mount
    useEffect(() => {
        if (userDocRef) {
            userDocRef.get().then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    if (data?.sampleTitle) {
                        setSampleTitle(data.sampleTitle);
                        setIsTitleLocked(true);
                    }
                    if (data?.sampleDescription) {
                        setSampleDescription(data.sampleDescription);
                        setIsDescriptionLocked(true);
                    }
                }
            }).catch(console.error);
        }
    }, [userDocRef]);

    const handleToggleLock = async (type: 'title' | 'description') => {
        if (!userDocRef) return;
        
        const isLocking = type === 'title' ? !isTitleLocked : !isDescriptionLocked;
        const fieldKey = type === 'title' ? 'sampleTitle' : 'sampleDescription';
        const value = type === 'title' ? sampleTitle : sampleDescription;

        try {
            if (isLocking && value.trim()) {
                await userDocRef.set({ [fieldKey]: value }, { merge: true });
            } else {
                await userDocRef.update({ [fieldKey]: window.firebase.firestore.FieldValue.delete() });
            }
            if (type === 'title') setIsTitleLocked(isLocking);
            else setIsDescriptionLocked(isLocking);
        } catch (err) {
            console.error("Failed to update lock status:", err);
            setApiError("Could not save your sample. Please try again.");
        }
    };
    
    const parseFinalResponse = (fullResponse: string) => {
        const titleMatch = fullResponse.match(/<TITLE>(.*?)<\/TITLE>/s);
        const descriptionMatch = fullResponse.match(/<DESCRIPTION>(.*?)<\/DESCRIPTION>/s);
        const tagsMatch = fullResponse.match(/<TAGS>(.*?)<\/TAGS>/s);

        const title = titleMatch ? titleMatch[1].trim() : "Title not generated";
        const description = descriptionMatch ? descriptionMatch[1].trim() : "Description not generated";
        const tags = tagsMatch ? tagsMatch[1].trim().split(',').map(tag => tag.trim()).filter(Boolean) : [];
        
        setGeneratedContent({ title, description, tags });
    };

    const handleGenerate = async () => {
        if (!contentRequirements.trim()) {
            setApiError("Please describe your video in the requirements box.");
            return;
        }
        
        // This check is crucial for deployed environments where process.env might not be available.
        if (typeof process === 'undefined' || !process.env.API_KEY) {
            setApiError("API key is not configured. Please set the 'API_KEY' environment variable in your deployment settings.");
            return;
        }

        setIsLoading(true);
        setApiError(null);
        setGeneratedContent(null);
        setStreamingResponse('');
        
        const sampleDescriptionPrompt = isDescriptionLocked && sampleDescription
            ? `**CRITICAL DESCRIPTION INSTRUCTIONS:**
Use the following text as a strict, character-for-character template. Preserve all whitespace and line breaks exactly. Only replace placeholder text (like "[INSERT DETAILS HERE]").

**MANDATORY DESCRIPTION TEMPLATE:**
---
${sampleDescription}
---
`
            : `For the description, create a well-formatted text with an introduction, key moments, a call to action, and social links. Separate paragraphs with an empty line.`;

        const prompt = `
You are an expert YouTube content strategist for gaming channels.
Generate a compelling title, description, and tags for a new video based on the requirements.
Output your response inside XML-like tags: <TITLE>...</TITLE>, <DESCRIPTION>...</DESCRIPTION>, and <TAGS>...</TAGS>.
The tags should be a single comma-separated string.

**VIDEO REQUIREMENTS:**
${contentRequirements}

${isTitleLocked && sampleTitle ? `**TITLE STYLE REFERENCE:**\nUse this as a strong reference for the title's style:\n${sampleTitle}` : ''}

${sampleDescriptionPrompt}
        `;

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "x-ai/grok-4.1-fast:free",
                    messages: [
                        { role: "user", content: prompt }
                    ],
                    stream: true
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error("Could not read stream from response.");
            
            const decoder = new TextDecoder();
            let fullResponse = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.substring(6);
                        if (dataStr.trim() === '[DONE]') break;
                        try {
                            const data = JSON.parse(dataStr);
                            const content = data.choices[0]?.delta?.content;
                            if (content) {
                                fullResponse += content;
                                setStreamingResponse(prev => prev + content);
                            }
                        } catch (e) {
                            // Ignore parsing errors for incomplete JSON chunks
                        }
                    }
                }
            }

            parseFinalResponse(fullResponse);

        } catch (err: any) {
            console.error("API call failed:", err);
            setApiError(err.message || "An unknown error occurred during generation.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = (item: string) => {
        setCopiedItem(item);
        setTimeout(() => setCopiedItem(null), 2000);
    }
    
    return (
        <div className="space-y-6 sm:space-y-8 animate-entry">
            <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-brand-text mb-1">AI Studio</h2>
                <p className="text-brand-text-secondary">Generate optimized titles, descriptions, and tags for your gaming videos.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Column */}
                <div className="bg-brand-surface border border-brand-surface-light rounded-lg p-6 space-y-6">
                    <div>
                        <label htmlFor="requirements" className="block text-sm font-bold text-brand-text mb-2">Content Requirements</label>
                        <textarea
                            id="requirements"
                            value={contentRequirements}
                            onChange={(e) => setContentRequirements(e.target.value)}
                            rows={5}
                            className="w-full bg-brand-bg border border-brand-surface-light rounded-md p-3 text-brand-text placeholder-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-accent"
                            placeholder="e.g., A video about defeating the 'Fire Giant' boss in Elden Ring using a mage build. Show the best spells to use..."
                        />
                    </div>
                    <div>
                         <label htmlFor="sample-title" className="block text-sm font-bold text-brand-text mb-2">Sample Title (Optional)</label>
                         <div className="flex items-center gap-2">
                            <input
                                id="sample-title"
                                value={sampleTitle}
                                onChange={(e) => setSampleTitle(e.target.value)}
                                disabled={isTitleLocked}
                                className="flex-1 w-full bg-brand-bg border border-brand-surface-light rounded-md p-3 text-brand-text placeholder-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-accent disabled:bg-brand-surface/50 disabled:cursor-not-allowed disabled:opacity-70 transition-colors"
                                placeholder="e.g., GAME NAME | My Epic Battle Against..."
                            />
                            <button onClick={() => handleToggleLock('title')} className={`p-3 rounded-md transition-colors ${isTitleLocked ? 'bg-brand-accent text-gray-900' : 'bg-brand-surface-light text-brand-text-secondary hover:bg-brand-surface-light/80'}`} title={isTitleLocked ? "Unlock Sample" : "Lock Sample"}>
                                {isTitleLocked ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2V7a5 5 0 00-5-5zm0 9a1 1 0 100-2 1 1 0 000 2z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2V7a5 5 0 00-5-5zm-3 5V7a3 3 0 016 0v2H7zm6 3a1 1 0 10-2 0v1a1 1 0 102 0v-1z" /></svg>}
                            </button>
                         </div>
                    </div>
                     <div>
                         <label htmlFor="sample-description" className="block text-sm font-bold text-brand-text mb-2">Sample Description (Optional)</label>
                         <div className="flex items-start gap-2">
                             <textarea
                                id="sample-description"
                                value={sampleDescription}
                                onChange={(e) => setSampleDescription(e.target.value)}
                                disabled={isDescriptionLocked}
                                rows={5}
                                className="flex-1 w-full bg-brand-bg border border-brand-surface-light rounded-md p-3 text-brand-text placeholder-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-accent disabled:bg-brand-surface/50 disabled:cursor-not-allowed disabled:opacity-70 transition-colors"
                                placeholder="e.g., In this video...\n\nFollow me on social media:\n- Twitter: ..."
                            />
                             <button onClick={() => handleToggleLock('description')} className={`p-3 rounded-md transition-colors ${isDescriptionLocked ? 'bg-brand-accent text-gray-900' : 'bg-brand-surface-light text-brand-text-secondary hover:bg-brand-surface-light/80'}`} title={isDescriptionLocked ? "Unlock Sample" : "Lock Sample"}>
                                {isDescriptionLocked ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2V7a5 5 0 00-5-5zm0 9a1 1 0 100-2 1 1 0 000 2z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2V7a5 5 0 00-5-5zm-3 5V7a3 3 0 016 0v2H7zm6 3a1 1 0 10-2 0v1a1 1 0 102 0v-1z" /></svg>}
                            </button>
                         </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-accent text-gray-900 rounded-md font-bold hover:bg-brand-accent-hover transition-all transform hover:scale-105 shadow-lg shadow-brand-accent/10 disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                         {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Generating...
                            </>
                         ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                                Generate
                            </>
                         )}
                    </button>
                </div>

                {/* Output Column */}
                <div className="bg-brand-surface border border-brand-surface-light rounded-lg p-6 space-y-6">
                    {isLoading && (
                        <div className="flex flex-col h-full text-brand-text-secondary">
                             <h4 className="text-sm font-bold uppercase tracking-wider text-brand-text-secondary mb-2">Live Response</h4>
                             <p className="flex-1 bg-brand-bg border border-brand-surface-light rounded-md p-3 text-brand-text whitespace-pre-wrap">{streamingResponse}<span className="animate-pulse">|</span></p>
                        </div>
                    )}
                    
                    {!isLoading && !apiError && !generatedContent && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-brand-text-secondary">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p>Your generated content will appear here.</p>
                        </div>
                    )}
                    {generatedContent && (
                        <>
                            <GeneratedSection
                                title="Generated Title"
                                content={generatedContent.title}
                                onCopy={() => { copyToClipboard(generatedContent.title, () => handleCopy('title')); }}
                            />
                             <GeneratedSection
                                title="Generated Description"
                                content={generatedContent.description}
                                onCopy={() => { copyToClipboard(generatedContent.description, () => handleCopy('description')); }}
                            />
                             <GeneratedSection
                                title="Generated Tags"
                                content={generatedContent.tags}
                                onCopy={() => { copyToClipboard(generatedContent.tags.join(', '), () => handleCopy('tags')); }}
                            />
                        </>
                    )}
                </div>
            </div>
            {copiedItem && (
                 <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold animate-entry shadow-lg">
                    Copied {copiedItem}!
                </div>
            )}
            {apiError && <ErrorModal message={apiError} onClose={() => setApiError(null)} />}
        </div>
    );
};
