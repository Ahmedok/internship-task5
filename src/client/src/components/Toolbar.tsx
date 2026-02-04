import type React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDice, faDownload, faSpinner, faChevronDown } from '@fortawesome/free-solid-svg-icons';

type ToolbarProps = {
    seed: string;
    setSeed: (val: string) => void;
    locale: string;
    setLocale: (val: string) => void;
    likes: number;
    setLikes: (val: number) => void;
    onExport: () => void;
    isExporting: boolean;
};

const LOCALES = [
    { value: 'en_US', label: 'English (USA)' },
    { value: 'ru', label: 'Russian' },
];

export const Toolbar: React.FC<ToolbarProps> = ({
    seed,
    setSeed,
    locale,
    setLocale,
    likes,
    setLikes,
    onExport,
    isExporting,
}) => {
    // Option to generate seed
    const handleRandomSeed = () => {
        const array = new Uint32Array(2);
        window.crypto.getRandomValues(array);

        const view = new DataView(array.buffer);
        const bigIntVal = view.getBigUint64(0, true);

        setSeed(bigIntVal.toString());
    };

    return (
        // Container
        <div className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-4 md:gap-8">
                {/* Region select */}
                <div className="flex flex-col gap-1 min-w-[150px]">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Region
                    </label>
                    <div className="relative">
                        <select
                            value={locale}
                            onChange={(e) => {
                                setLocale(e.target.value);
                            }}
                            className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2 pr-8 font-medium cursor-pointer transition-all hover:bg-white"
                        >
                            {LOCALES.map((loc) => (
                                <option key={loc.value} value={loc.value}>
                                    {loc.label}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                            <FontAwesomeIcon icon={faChevronDown} size="xs" />
                        </div>
                    </div>
                </div>

                {/* Seed */}
                <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Seed (64-bit)
                    </label>
                    <div className="flex rounded-md shadow-sm">
                        <input
                            type="text"
                            value={seed}
                            onChange={(e) => {
                                setSeed(e.target.value);
                            }}
                            placeholder="12345..."
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400"
                        />
                        <button
                            type="button"
                            onClick={handleRandomSeed}
                            className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-600 rounded-r-md hover:bg-gray-100 hover:text-blue-600 transition-colors active:bg-gray-200"
                            title="Generate Random 64-bit Seed"
                        >
                            <FontAwesomeIcon icon={faDice} size="lg" />
                        </button>
                    </div>
                </div>

                {/* Like slider */}
                <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
                    <div className="flex justify-between items-end mb-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Avg Likes
                        </label>
                        <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            {likes}
                        </span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={10}
                        step={0.1}
                        value={likes}
                        onChange={(e) => {
                            setLikes(parseFloat(e.target.value));
                        }}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                </div>

                {/* Export button */}
                <div className="ml-auto pl-4 border-l border-gray-200">
                    <button
                        onClick={onExport}
                        disabled={isExporting}
                        className="bg-gray-900 hover:bg-purple-800 text-white text-sm font-medium py-2 px-4 rounded-md shadow-sm cursor-pointer transition-all disabled:opacity-70 disabled:cursor-wait flex items-center gap-2"
                    >
                        {isExporting ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faDownload} />
                                Export
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
