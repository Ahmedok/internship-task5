import type React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faStop } from '@fortawesome/free-solid-svg-icons';
import type { Icon } from '@fortawesome/fontawesome-svg-core';

type PlayerOverlayProps = {
    isPlaying: boolean;
    onToggle: () => void;
    visible?: boolean;
};

export const PlayerOverlay: React.FC<PlayerOverlayProps> = ({
    isPlaying,
    onToggle,
    visible = false,
}) => {
    const icon = (isPlaying ? faStop : faPlay) as Icon;

    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                onToggle();
            }}
            className={`absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] transition-all duration-300 cursor-pointer ${visible || isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        >
            <button
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
                <FontAwesomeIcon icon={icon} className="w-5 h-5 ml-0.5" />
            </button>
        </div>
    );
};
