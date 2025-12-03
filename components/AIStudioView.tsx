import React from 'react';

interface AIStudioViewProps {
    user: any;
}

export const AIStudioView: React.FC<AIStudioViewProps> = ({ user }) => {
    return (
        // This div is positioned relative to the <main> tag in App.tsx.
        // `inset-0` makes it fill the entire main content area, ignoring the parent's padding.
        <div className="absolute inset-0 animate-entry">
            <iframe
                src="https://ai-youtube-title-generator.vercel.app/"
                title="AI YouTube Title Generator"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            ></iframe>
        </div>
    );
};
