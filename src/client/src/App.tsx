import React, { useState, useMemo } from 'react';
import { VirtuosoGrid, Virtuoso } from 'react-virtuoso';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTh, faList, faMusic, faSpinner } from '@fortawesome/free-solid-svg-icons';

import { useSongs } from './hooks/useSongs';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useSongExport } from './hooks/useSongExport';

import { Toolbar } from './components/Toolbar';
import { SongCard } from './components/SongCard';
import { SongRow } from './components/SongRow';

import type { Song } from '../../lib';

function App() {
    // States and hooks
    // RGN params
    const [seed, setSeed] = useState<string>('test');
    const [locale, setLocale] = useState<string>('en_US');
    const [likes, setLikes] = useState<number>(0);

    // UI states
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

    // Data hooks
    const { songs, isLoading, loadMore } = useSongs({ seed, locale, likes });
    const { isPlaying, currentSongId, play, stop } = useAudioPlayer();
    const { exportZip, isExporting } = useSongExport();

    // Handlers
    const handlePlayToggle = (song: Song) => {
        if (currentSongId === song.id && isPlaying) {
            stop();
        } else {
            void play(song);
        }
    };

    const handleRowExpand = (id: string) => {
        setExpandedRowId((prev) => (prev === id ? null : id));
    };

    const handleExport = () => {
        void exportZip(songs);
    };

    // Virtuoso config
    // Grid view
    const gridComponents = useMemo(
        () => ({
            List: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
                (props, ref) => (
                    <div
                        {...props}
                        ref={ref}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4 pb-20"
                    />
                ),
            ),
            Item: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
                (props, ref) => (
                    <div {...props} ref={ref} className="h-full" /> // Height wrapper
                ),
            ),
            Footer: () =>
                isLoading ? (
                    <div className="col-span-full py-8 flex justify-center text-blue-600">
                        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                    </div>
                ) : null,
        }),
        [isLoading],
    );

    // Table view
    const tableComponents = useMemo(
        () => ({
            List: React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>((props, ref) => (
                <table
                    {...props}
                    ref={ref as React.Ref<HTMLTableElement>}
                    className="w-full text-left border-collapse table-fixed"
                />
            )),
            Item: React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>((props, ref) => (
                <tbody
                    {...props}
                    ref={ref as React.Ref<HTMLTableSectionElement>}
                    className="group"
                />
            )),

            Footer: () =>
                isLoading ? (
                    <tbody>
                        <tr>
                            <td colSpan={6} className="py-8 text-center text-blue-600">
                                <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                            </td>
                        </tr>
                    </tbody>
                ) : null,
        }),
        [isLoading],
    );

    // THE render
    return (
        <div className="flex flex-col h-screen bg-gray-50 text-gray-900 overflow-hidden font-sans">
            {/* Header */}
            <div className="flex-none z-20 shadow-sm">
                {/* The toolbar */}
                <Toolbar
                    seed={seed}
                    setSeed={setSeed}
                    locale={locale}
                    setLocale={setLocale}
                    likes={likes}
                    setLikes={setLikes}
                    onExport={handleExport}
                    isExporting={isExporting}
                />

                {/* Sub-header */}
                <div className="bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center text-xs font-medium text-gray-500">
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faMusic} className="text-blue-500" />
                        <span>{songs.length} songs loaded</span>
                    </div>

                    <div className="flex bg-gray-100 rounded-lg p-0.5">
                        <button
                            onClick={() => {
                                setViewMode('table');
                            }}
                            className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-all ${viewMode === 'table' ? 'bg-white shadow text-blue-600' : 'hover:text-gray-700'}`}
                        >
                            <FontAwesomeIcon icon={faList} />
                            <span className="hidden sm:inline">Table</span>
                        </button>
                        <button
                            onClick={() => {
                                setViewMode('grid');
                            }}
                            className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-all ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'hover:text-gray-700'}`}
                        >
                            <FontAwesomeIcon icon={faTh} />
                            <span className="hidden sm:inline">Gallery</span>
                        </button>
                    </div>
                </div>

                {/* Table header (for table view) */}
                {viewMode === 'table' && (
                    <div className="bg-gray-50 border-b border-gray-200 px-4 pr-6">
                        <table className="w-full text-left table-fixed">
                            <thead>
                                <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <th className="py-3 px-4 w-12 text-center">#</th>
                                    <th className="py-3 px-4">Title</th>
                                    <th className="py-3 px-4 hidden md:table-cell">Artist</th>
                                    <th className="py-3 px-4 hidden lg:table-cell">Album</th>
                                    <th className="py-3 px-4 hidden sm:table-cell">Genre</th>
                                    <th className="py-3 px-4 text-right w-24">Likes</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                )}
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-hidden relative">
                {songs.length === 0 && !isLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                        <p>No songs found...</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <VirtuosoGrid
                        data={songs}
                        endReached={loadMore}
                        overscan={200}
                        components={gridComponents}
                        itemContent={(_, song) => (
                            <SongCard
                                song={song}
                                isPlaying={currentSongId === song.id && isPlaying}
                                onToggle={() => {
                                    handlePlayToggle(song);
                                }}
                            />
                        )}
                    />
                ) : (
                    <Virtuoso
                        data={songs}
                        endReached={loadMore}
                        overscan={200}
                        components={tableComponents}
                        itemContent={(_, song) => (
                            <SongRow
                                index={song.index}
                                song={song}
                                isPlaying={currentSongId === song.id && isPlaying}
                                isExpanded={expandedRowId === song.id}
                                onTogglePlay={() => {
                                    handlePlayToggle(song);
                                }}
                                onToggleExpand={() => {
                                    handleRowExpand(song.id);
                                }}
                            />
                        )}
                    />
                )}
            </div>
        </div>
    );
}

export default App;
