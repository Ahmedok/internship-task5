import React from 'react';
import type { Song } from '../../../lib';
import { PlayerOverlay } from './PlayerOverlay';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCompactDisc, faHeart } from '@fortawesome/free-solid-svg-icons';
import type { Icon } from '@fortawesome/fontawesome-svg-core';

type SongCardProps = {
    song: Song;
    isPlaying: boolean;
    onToggle: () => void;
};

export const SongCard: React.FC<SongCardProps> = ({ song, isPlaying, onToggle }) => {
    const isMetal = song.score.instrument === 'metal';
    const instrumentIcon = (isMetal ? faBell : faCompactDisc) as Icon;

    return (
        <div className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all h-full flex flex-col">
            {/* Cover area */}
            <div className="relative aspect-square bg-gray-100">
                {/* Picture */}
                <img
                    src={song.cover}
                    alt={song.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                />

                {/* Overlay */}
                <PlayerOverlay isPlaying={isPlaying} onToggle={onToggle} />

                {/* Badges */}
                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                    {/* Likes */}
                    <div className="bg-white/90 backdrop-blur px-2 py-0.5 rounded-full text-xs font-bold text-gray-700 shadow-sm flex items-center gap-1">
                        <FontAwesomeIcon icon={faHeart} color="red" /> {song.likes}
                    </div>
                    {/* Instrument */}
                    <div className="px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-wider text-white">
                        <FontAwesomeIcon
                            icon={instrumentIcon}
                            color={isMetal ? 'slate' : 'yellow'}
                        />
                    </div>
                </div>
            </div>

            {/* Info area */}
            <div className="p-3 flex flex-col flex-1">
                <h3
                    className="font-bold text-gray-900 leading-tight line-clamp-1"
                    title={song.title}
                >
                    {song.title}
                </h3>
                <p className="text-sm text-gray-500 font-medium mb-1 truncate">{song.artist}</p>

                <div className="mt-auto pt-2 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                    <span className="truncate max-w-[50%]">{song.genre}</span>
                    <span className="truncate max-w-[50%]">{song.album}</span>
                </div>
            </div>
        </div>
    );
};
