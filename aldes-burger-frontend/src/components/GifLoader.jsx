import React from 'react';
import { useTranslation } from '../context/LanguageContext';
import loadingGif from '../assets/loading_animation.gif';
import { useDelayedLoading } from '../hooks/useDelayedLoading';

export default function GifLoader({ isLoading, delay = 300, fullScreen = false, size = 'w-64 sm:w-80 drop-shadow-xl', text = '' }) {
    const { t } = useTranslation();
    const show = useDelayedLoading(isLoading, delay);

    if (!show) return null;

    const content = (
        <div className="flex flex-col items-center justify-center gap-3">
            <img src={loadingGif} alt="Loading..." className={`object-contain ${size}`} />
            {text && <p className="font-black text-sm uppercase text-gray-500 animate-pulse">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm flex items-center justify-center">
                {content}
            </div>
        );
    }

    return content;
}
