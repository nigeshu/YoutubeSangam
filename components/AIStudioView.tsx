// FIX: Import 'useMemo' from 'react' to resolve the 'Cannot find name useMemo' error.
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../services/firebase';
import { GoogleGenAI, Type } from "@google/genai";

interface AIStudioViewProps {
    user: any;
}

const copyToClipboard = (text: string, onCopy: () => void) => {
    navigator.clipboard.writeText(text).then(onCopy);
};

const ErrorModal = ({ message, onClose }: { message: string; onClose: () => void }) => (
    <div 
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-entry"
        onClick={onClose}
    >
        <div
            className="bg-brand-surface border border-red-700 rounded-lg p-6 w-full max-w-md relative text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h3 className="text-xl font-bold text-brand-text mt-4">Generation Failed</h3>
            <p className="text-brand-text-secondary mt-2">{message}</p>
            <div className="mt-6">
                <button
                    onClick={onClose}
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-brand-surface-light px-4 py-2 bg-brand-surface-light text-base font-medium text-brand-text hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:w-auto sm:text-sm"
                >
                    OK
                </button>
            </div>
        </div>
    </div>
);


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
    const [error, setError] = useState<string | null>(null);
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
            setError("Could not save your sample. Please try again.");
        }
    };

    const handleGenerate = async () => {
        if (!contentRequirements.trim()) {
            setError("Please describe your video in the requirements box.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedContent(null);
        
        try {
            if (!process.env.API_KEY) {
                throw new Error("API_KEY environment variable not configured.");
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            const sampleDescriptionPrompt = isDescriptionLocked && sampleDescription
                ? `
**CRITICAL DESCRIPTION INSTRUCTIONS:**
You are a formatting expert. Your task is to populate the provided template. You MUST follow these rules without deviation:
1.  **TEMPLATE IS MANDATORY:** Use the following text as a strict, character-for-character template for the description.
2.  **PRESERVE WHITESPACE:** You MUST preserve all whitespace, including single line breaks (\`\\n\`) and especially empty lines between paragraphs (\`\\n\\n\`), exactly as they appear in the template. DO NOT collapse multiple line breaks into a single one. The spacing is intentional and must be replicated.
3.  **REPLACE PLACEHOLDERS:** Only replace placeholder text (like "[INSERT DETAILS HERE]", "[GAMEPLAY INFO]", "[SOCIAL LINKS]", etc.) with new content generated from the video requirements.
4.  **DO NOT CHANGE STATIC TEXT:** All other text, links, and formatting in the template must remain unchanged.

**MANDATORY DESCRIPTION TEMPLATE (Follow formatting exactly):**
---
${sampleDescription}
---
`
                : `For the description, create a well-formatted text with clear sections (e.g., an introduction, key moments or timestamps, a call to action, and links to social media). Ensure paragraphs are separated by an empty line for readability.`;

            const prompt = `
                You are an expert YouTube content strategist for gaming channels.
                Generate a compelling title, description, and tags for a new video.

                **VIDEO REQUIREMENTS:**
                ${contentRequirements}

                ${isTitleLocked && sampleTitle ? `**TITLE STYLE REFERENCE:**\nUse this as a strong reference for the title's style, but adapt it to the new video's content:\n${sampleTitle}` : ''}
                
                ${sampleDescriptionPrompt}

                **TAGS INSTRUCTIONS:**
                Provide a mix of broad and specific keywords relevant to the game, the video's content, and the channel's niche.

                **OUTPUT FORMAT:**
                Generate a response in a structured JSON format.
            `;
            
            const schema = {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    tags: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                },
                required: ["title", "description", "tags"]
            };

            const response = await ai.models.generateContent({
              model: "gemini-2.5-flash",
              contents: prompt,
              config: {
                responseMimeType: "application/json",
                responseSchema: schema,
              },
            });

            const jsonText = response.text?.trim();
            if (!jsonText) {
                throw new Error("Received an empty response from the AI. The API key might be invalid or the service may be temporarily down.");
            }

            // The AI might wrap the JSON in ```json ... ```, so clean it.
            const cleanedJsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
            
            try {
                const parsed = JSON.parse(cleanedJsonText);
                setGeneratedContent(parsed);
            } catch (parseError) {
                console.error("JSON Parsing Error:", parseError);
                console.error("Raw AI Response:", cleanedJsonText);
                throw new Error("The AI returned a response that could not be understood. Please try again.");
            }

        } catch (err) {
            if (err instanceof Error) {
                console.error("AI Generation Error:", err);
                setError(err.message);
            } else {
                 setError("An unknown error occurred during generation.");
            }
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
            {error && <ErrorModal message={error} onClose={() => setError(null)} />}
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
                        <div className="flex flex-col items-center justify-center h-full text-center text-brand-text-secondary">
                             <svg className="animate-spin h-8 w-8 text-brand-text mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                             <p>AI is thinking...</p>
                        </div>
                    )}
                    
                    {!isLoading && !generatedContent && (
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
        </div>
    );
};