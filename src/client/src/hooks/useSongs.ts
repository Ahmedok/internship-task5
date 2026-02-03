import { useState, useEffect, useCallback, useRef } from 'react';
import type { Song, ApiResponse } from '../../../lib/index';

const API_URL = '/api/data';

type UseSongsParams = {
    seed: string;
    locale: string;
    likes: number;
};

export function useSongs({ seed, locale, likes }: UseSongsParams) {
    const [songs, setSongs] = useState<Song[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pageRef = useRef(1);
    const isFetchingRef = useRef(false);

    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchBatch = useCallback(
        async (pageToFetch: number, resetList = false) => {
            if (isFetchingRef.current && !resetList) return;

            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            const controller = new AbortController();
            abortControllerRef.current = controller;

            isFetchingRef.current = true;
            setIsLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams({
                    seed,
                    locale,
                    page: pageToFetch.toString(),
                    likes: likes.toString(),
                });

                const res = await fetch(`${API_URL}?${params.toString()}`);
                if (!res.ok) throw new Error('Network response was not OK');

                const data = (await res.json()) as unknown as ApiResponse;

                setSongs((prev) => {
                    if (resetList) return data.songs;
                    // Duplicate protection
                    const newIds = new Set(data.songs.map((s) => s.id));
                    const filteredPrev = prev.filter((s) => !newIds.has(s.id));
                    return [...filteredPrev, ...data.songs];
                });
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') {
                    console.log('Fetch aborted');
                    return;
                }

                console.log(err);
                setError('Failed to load songs');
            } finally {
                if (abortControllerRef.current === controller) {
                    setIsLoading(false);
                    isFetchingRef.current = false;
                    abortControllerRef.current = null;
                }
            }
        },
        [seed, locale, likes],
    );

    // Seed/locale change reset
    useEffect(() => {
        pageRef.current = 1;
        void fetchBatch(1, true);

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [seed, locale, likes, fetchBatch]);

    const loadMore = useCallback(() => {
        if (!isFetchingRef.current) {
            pageRef.current += 1;
            void fetchBatch(pageRef.current, false);
        }
    }, [fetchBatch]);

    return { songs, isLoading, error, loadMore };
}
