import React from 'react';
import type { Song } from '../../../lib';
import { PlayerOverlay } from './PlayerOverlay';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCompactDisc, faHeart } from '@fortawesome/free-solid-svg-icons';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';

type SongRowCellsProps = {
    song: Song;
    index: number;
    isPlaying: boolean;
    isExpanded: boolean;
    onTogglePlay: () => void;
    onToggleExpand: () => void;
};

export const SongRowCells: React.FC<SongRowCellsProps> = ({
    song,
    index,
    isPlaying,
    isExpanded,
    onTogglePlay,
    onToggleExpand,
}) => {
    const isMetal = song.score.instrument === 'metal';
    const instrumentIcon: IconProp = isMetal ? faBell : faCompactDisc;

    // Expand return
    if (isExpanded) {
        return (
            <td colSpan={6} className="p-0 bg-blue-50/40 border-b border-blue-100">
                {/* Small content */}
                <div
                    onClick={onToggleExpand}
                    className="px-4 py-2 bg-blue-100/50 cursor-pointer hover:bg-blue-100 flex items-center gap-3 border-b border-blue-200"
                >
                    <span className="text-sm text-gray-400 font-mono w-8">{index}</span>
                    <span className="font-medium text-gray-900">{song.title}</span>
                    <span className="text-gray-500">by {song.artist}</span>
                    <span className="ml-auto text-xs text-blue-600">Click to collapse</span>
                </div>

                {/* Expanded content */}
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
                            <h4 className="text-2xl font-bold text-gray-800">{song.title}</h4>
                            <p className="text-lg text-blue-600 font-medium">{song.artist}</p>
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
                                <p className="text-gray-700 capitalize">{song.score.instrument}</p>
                            </div>
                        </div>

                        {/* "Review" */}
                        <div className="mt-auto p-4 bg-white rounded-lg border border-blue-100 text-sm text-gray-600 italic relative">
                            <span className="absolute -top-2 -left-2 text-4xl text-blue-200 leading-none">
                                "
                            </span>
                            <span>{song.review}</span>
                            <span className="absolute -bottom-4 -right-1 text-4xl text-blue-200 leading-none">
                                "
                            </span>
                        </div>
                    </div>
                </div>
            </td>
        );
    }

    // Normal row cells
    return (
        <>
            {/* Index */}
            <td
                onClick={onToggleExpand}
                className="px-4 py-3 text-sm text-gray-400 font-mono text-center cursor-pointer"
            >
                {index}
            </td>

            {/* Title + small cover pic */}
            <td onClick={onToggleExpand} className="px-4 py-3 cursor-pointer">
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded overflow-hidden shrink-0 bg-gray-200 group">
                        <img
                            src={song.cover}
                            alt="Small Cover"
                            className="w-full h-full object-cover"
                        />
                        <PlayerOverlay
                            isPlaying={isPlaying}
                            onToggle={onTogglePlay}
                            visible={isPlaying}
                        />
                    </div>
                    <div>
                        <div className="font-medium text-gray-900 line-clamp-1">{song.title}</div>
                        <div className="text-xs text-gray-500 md:hidden">{song.artist}</div>
                    </div>
                </div>
            </td>

            {/* Artist */}
            <td
                onClick={onToggleExpand}
                className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell cursor-pointer"
            >
                {song.artist}
            </td>

            {/* Album */}
            <td
                onClick={onToggleExpand}
                className="px-4 py-3 text-sm text-gray-500 hidden xl:table-cell cursor-pointer"
            >
                {song.album}
            </td>

            {/* Genre + instrument */}
            <td onClick={onToggleExpand} className="px-4 py-3 hidden lg:table-cell cursor-pointer">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{song.genre}</span>
                    <FontAwesomeIcon
                        icon={instrumentIcon}
                        className={isMetal ? 'text-slate-500' : 'text-yellow-500'}
                    />
                </div>
            </td>

            {/* Likes */}
            <td className="px-4 py-3 text-sm font-mono text-right">
                <div className="flex items-center justify-end gap-1 text-blue-600 font-bold">
                    <FontAwesomeIcon icon={faHeart} className="text-red-500" />
                    {song.likes}
                </div>
            </td>
        </>
    );
};
