import { useState, useEffect, useCallback, useRef } from 'react';
import type { Song, ApiResponse } from '../../../lib/index';

const API_URL = '/api/data';

type UseSongsParams = {
    seed: string;
    locale: string;
    likes: number;
    mode: 'infinite' | 'pagination';
    limit?: number;
};

export function useSongs({ seed, locale, likes, mode, limit = 20 }: UseSongsParams) {
    const [songs, setSongs] = useState<Song[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchBatch = useCallback(
        async (pageToFetch: number, isReplace: boolean) => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            const controller = new AbortController();
            abortControllerRef.current = controller;

            setIsLoading(true);

            try {
                const params = new URLSearchParams({
                    seed,
                    locale,
                    page: pageToFetch.toString(),
                    likes: likes.toString(),
                    limit: limit.toString(),
                });

                const res = await fetch(`${API_URL}?${params.toString()}`, {
                    signal: controller.signal,
                });

                if (!res.ok) throw new Error(`Fetch error: ${res.status.toString()}`);

                const data = (await res.json()) as unknown as ApiResponse;

                setSongs((prevSongs) => {
                    if (isReplace) return data.songs;
                    // Duplicate protection
                    const existingIds = new Set(prevSongs.map((s) => s.id));
                    const uniqueNewSongs = data.songs.filter((s) => !existingIds.has(s.id));
                    return [...prevSongs, ...uniqueNewSongs];
                });

                setHasMore(data.songs.length > 0);
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') {
                    console.log('Fetch aborted');
                    return;
                }
                console.error('Failed to load songs:', err);
            } finally {
                if (abortControllerRef.current === controller) {
                    setIsLoading(false);
                    abortControllerRef.current = null;
                }
            }
        },
        [seed, locale, likes, limit],
    );

    // Seed/locale change reset
    useEffect(() => {
        setPage(1);
        setHasMore(true);
        setSongs([]);
        void fetchBatch(1, true);
    }, [seed, locale, likes, mode, limit, fetchBatch]);

    const setPageManual = useCallback(
        (newPage: number) => {
            setPage(newPage);
            void fetchBatch(newPage, true);
        },
        [fetchBatch],
    );

    const loadMore = useCallback(() => {
        if (isLoading || !hasMore) return;

        setPage((currentPage) => {
            const nextPage = currentPage + 1;
            void fetchBatch(nextPage, false);
            return nextPage;
        });
    }, [isLoading, hasMore, fetchBatch]);

    return { songs, isLoading, page, hasMore, loadMore, setPageManual };
}
