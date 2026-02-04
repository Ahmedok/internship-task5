import React from 'react';
import type { Song } from '../../../lib';
import { PlayerOverlay } from './PlayerOverlay';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCompactDisc, faHeart } from '@fortawesome/free-solid-svg-icons';
import type { Icon } from '@fortawesome/fontawesome-svg-core';

type SongRowProps = {
    song: Song;
    index: number;
    isPlaying: boolean;
    isExpanded: boolean;
    onTogglePlay: () => void;
    onToggleExpand: () => void;
};

export const SongRow: React.FC<SongRowProps> = ({
    song,
    index,
    isPlaying,
    isExpanded,
    onTogglePlay,
    onToggleExpand,
}) => {
    const isMetal = song.score.instrument === 'metal';
    const instrumentIcon = (isMetal ? faBell : faCompactDisc) as Icon;

    return (
        <>
            {/* MAIN */}
            <tr
                onClick={onToggleExpand}
                className={`cursor-pointer transition-colors border-b border-gray-100 ${isExpanded ? 'bg-blue-50/60' : 'hover:bg-gray-50'}`}
            >
                {/* Index */}
                <td className="px-4 py-3 text-sm text-gray-400 font-mono text-center w-12">
                    {index}
                </td>

                {/* Title + small cover pic */}
                <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded overflow-hidden shrink-0 bg-gray-200 group">
                            <img
                                src={song.cover}
                                alt="Small Cover image"
                                className="w-full h-full object-cover"
                            />
                            <PlayerOverlay
                                isPlaying={isPlaying}
                                onToggle={onTogglePlay}
                                visible={isPlaying}
                            />
                        </div>
                        <div>
                            <div className="font-medium text-gray-900 line-clamp-1">
                                {song.title}
                            </div>
                            {/* Mobile-only artist info */}
                            <div className="text-xs text-gray-500 md:hidden">{song.artist}</div>
                        </div>
                    </div>
                </td>

                {/* Artist (tablet+) */}
                <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                    {song.artist}
                </td>

                {/* Album (desktop only) */}
                <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">
                    {song.album}
                </td>

                {/* Genre + instrument */}
                <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{song.genre}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded">
                            <FontAwesomeIcon
                                icon={instrumentIcon}
                                color={isMetal ? 'slate' : 'yellow'}
                            />
                        </span>
                    </div>
                </td>

                {/* Likes */}
                <td className="px-4 py-3 text-sm font-mono text-right w-24">
                    <div className="flex items-center justify-end gap-1 text-blue-600 font-bold">
                        <FontAwesomeIcon icon={faHeart} color="red" />
                        {song.likes}
                    </div>
                </td>
            </tr>

            {/* EXPANDED */}
            {isExpanded && (
                <tr className="bg-blue-50/40 border-b border-blue-100">
                    <td colSpan={6} className="p-0">
                        <div className="p-6 flex flex-col sm:flex-row gap-6 animate-in slide-in-from-top-2 duration-200">
                            {/* Big cover pic */}
                            <div className="relative w-48 h-48 shrink-0 rounded-lg overflow-hidden shadow-md bg-gray-200 self-center sm:self-start group">
                                <img
                                    src={song.cover}
                                    alt={song.title}
                                    className="w-full h-full object-cover"
                                />
                                <PlayerOverlay isPlaying={isPlaying} onToggle={onTogglePlay} />
                            </div>

                            {/* Info */}
                            <div className="flex flex-col gap-4 flex-1">
                                <div>
                                    <h4 className="text-2xl font-bold text-gray-800">
                                        {song.title}
                                    </h4>
                                    <p className="text-lg text-blue-600 font-medium">
                                        {song.artist}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                    <div>
                                        <span className="text-xs font-bold text-gray-400 uppercase">
                                            Album
                                        </span>
                                        <p className="text-gray-700">{song.album}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-gray-400 uppercase">
                                            Genre
                                        </span>
                                        <p className="text-gray-700">{song.genre}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-gray-400 uppercase">
                                            BPM
                                        </span>
                                        <p className="text-gray-700 font-mono">{song.score.bpm}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-gray-400 uppercase">
                                            Instrument
                                        </span>
                                        <p className="text-gray-700 capitalize">
                                            {song.score.instrument}
                                        </p>
                                    </div>
                                </div>

                                {/* "Review" */}
                                <div className="mt-auto p-4 bg-white rounded-lg border border-blue-100 text-sm text-gray-600 italic relative">
                                    <span className="absolute -top-2 -left-2 text-4xl text-blue-200 leading-none">
                                        “
                                    </span>
                                    A stunning {song.score.instrument} performance. The rhythm at{' '}
                                    {song.score.bpm} BPM creates a unique atmosphere typical for{' '}
                                    {song.genre}.
                                    <span className="absolute -bottom-4 -right-1 text-4xl text-blue-200 leading-none">
                                        ”
                                    </span>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};
