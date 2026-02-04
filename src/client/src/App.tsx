import React, { useState, useMemo } from 'react';
import { VirtuosoGrid, TableVirtuoso } from 'react-virtuoso';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTh,
    faList,
    faMusic,
    faSpinner,
    faChevronLeft,
    faChevronRight,
} from '@fortawesome/free-solid-svg-icons';

import { useSongs } from './hooks/useSongs';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useSongExport } from './hooks/useSongExport';

import { Toolbar } from './components/Toolbar';
import { SongCard } from './components/SongCard';
import { SongRowCells } from './components/SongRowCells';

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
    const [limit, setLimit] = useState<number>(20);

    // Data hooks
    const { songs, isLoading, page, setPageManual, loadMore } = useSongs({
        seed,
        locale,
        likes,
        mode: viewMode === 'grid' ? 'infinite' : 'pagination',
        limit,
    });
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

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLimit(Number(e.target.value));
        setPageManual(1);
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
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4"
                    />
                ),
            ),
            Footer: () =>
                isLoading ? (
                    <div className="py-8 flex justify-center text-blue-600">
                        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                    </div>
                ) : null,
        }),
        [isLoading],
    );

    // Table view
    const tableHeaderContent = () => (
        <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            <th className="py-3 px-4 w-16 text-center">#</th>
            <th className="py-3 px-4">Title</th>
            <th className="py-3 px-4 w-1/5 hidden sm:table-cell">Artist</th>
            <th className="py-3 px-4 w-1/5 hidden xl:table-cell">Album</th>
            <th className="py-3 px-4 w-1/6 hidden lg:table-cell">Genre</th>
            <th className="py-3 px-4 w-28 text-right">Likes</th>
        </tr>
    );

    const tableFooterContent = () => (
        <tr>
            <td colSpan={6} className="py-4">
                <div className="flex justify-center items-center gap-4">
                    <button
                        onClick={() => {
                            setPageManual(Math.max(1, page - 1));
                        }}
                        disabled={page === 1 || isLoading}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 font-medium text-sm flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={faChevronLeft} /> Prev
                    </button>
                    <span className="flex items-center font-mono text-gray-600">Page {page}</span>
                    <button
                        onClick={() => {
                            setPageManual(page + 1);
                        }}
                        disabled={isLoading}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 font-medium text-sm flex items-center gap-2"
                    >
                        Next <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>
            </td>
        </tr>
    );

    const tableComponents = useMemo(
        () => ({
            Table: React.forwardRef<HTMLTableElement, React.TableHTMLAttributes<HTMLTableElement>>(
                (props, ref) => (
                    <table
                        {...props}
                        ref={ref}
                        className="w-full text-left border-collapse table-auto xl:table-fixed [&_tbody_tr:hover_td]:bg-gray-50"
                    />
                ),
            ),
            TableHead: React.forwardRef<
                HTMLTableSectionElement,
                React.HTMLAttributes<HTMLTableSectionElement>
            >((props, ref) => (
                <thead {...props} ref={ref} className="sticky top-0 z-10 bg-gray-50" />
            )),
        }),
        [],
    );

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
                <div className="border-b border-gray-200 bg-white">
                    <div className="max-w-7xl mx-auto bg-white px-4 py-2 flex justify-between items-center text-xs font-medium text-gray-500">
                        {/* Left */}
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faMusic} className="text-blue-500" />
                            <span>{songs.length} songs loaded</span>
                        </div>

                        {/* Right */}
                        <div className="flex items-center gap-4">
                            {viewMode === 'table' && (
                                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                                    <span className="hidden sm:inline">Rows:</span>
                                    <select
                                        value={limit}
                                        onChange={handleLimitChange}
                                        className="bg-white border border-gray-300 text-gray-700 text-xs rounded focus:ring-blue-500 focus:border-blue-500 block p-1 py-1.5 cursor-pointer shadow-sm"
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>
                            )}

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
                    </div>
                </div>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-hidden relative bg-white">
                {songs.length === 0 && !isLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                        <p>No songs found...</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="max-w-7xl mx-auto w-full h-full">
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
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto w-full h-full">
                        <TableVirtuoso
                            data={songs}
                            fixedHeaderContent={tableHeaderContent}
                            components={tableComponents}
                            itemContent={(_, song) => (
                                <SongRowCells
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
                            fixedFooterContent={tableFooterContent}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
