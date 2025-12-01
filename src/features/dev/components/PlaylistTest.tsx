import React, { useState, useEffect } from 'react';
// Adjust path to point to your actual service file
import { 
    addToFavourites, 
    removeFromFavourites, 
    checkIsFavourite, 
    getFavouritePlaylists, 
    getFavouriteTracks 
} from '../../favourites/services/favourites_services';

// Adjust to match your types
type ItemType = 'track' | 'playlist' | 'album';

const FavouritesDebugger: React.FC = () => {
    // Inputs
    const [itemId, setItemId] = useState('1');
    const [itemType, setItemType] = useState<ItemType>('playlist');
    const [forceString, setForceString] = useState(true); // The fix we discussed

    // State
    const [isFav, setIsFav] = useState<boolean | null>(null);
    const [listResults, setListResults] = useState<string[]>([]);
    const [logs, setLogs] = useState<string[]>([]);

    // Helper to add logs with timestamps
    const addLog = (msg: string) => {
        const time = new Date().toLocaleTimeString();
        setLogs(prev => [`[${time}] ${msg}`, ...prev]);
    };

    // 1. Check Status
    const handleCheck = async () => {
        try {
            const finalId = forceString ? String(itemId) : itemId;
            addLog(`Checking status for ID: "${finalId}" (Type: ${typeof finalId})...`);
            
            const result = await checkIsFavourite(finalId, itemType);
            setIsFav(result);
            addLog(`Result: ${result ? 'Is Favourite (TRUE)' : 'Not Favourite (FALSE)'}`);
        } catch (err: any) {
            addLog(`Check Error: ${err.message}`);
        }
    };

    // 2. Add
    const handleAdd = async () => {
        try {
            const finalId = forceString ? String(itemId) : itemId;
            addLog(`Attempting ADD for ID: "${finalId}"...`);
            
            await addToFavourites(finalId, itemType);
            addLog('Success: Added to favourites.');
            handleCheck(); // Refresh status
        } catch (err: any) {
            console.error(err);
            addLog(`ADD Error: ${err.message || 'Check console for 400 details'}`);
        }
    };

    // 3. Remove
    const handleRemove = async () => {
        try {
            const finalId = forceString ? String(itemId) : itemId;
            addLog(`Attempting REMOVE for ID: "${finalId}"...`);
            
            await removeFromFavourites(finalId, itemType);
            addLog('Success: Removed from favourites.');
            handleCheck(); // Refresh status
        } catch (err: any) {
            addLog(`REMOVE Error: ${err.message}`);
        }
    };

    // 4. Get Lists
    const handleListPlaylists = async () => {
        try {
            addLog('Fetching all favourite playlists...');
            const ids = await getFavouritePlaylists();
            setListResults(ids);
            addLog(`Fetched ${ids.length} playlists.`);
        } catch (err: any) {
            addLog(`List Error: ${err.message}`);
        }
    };

    return (
        <div className="bg-[#1e1e1e] p-6 rounded-xl border border-gray-700 w-full max-w-3xl font-sans text-sm shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-[#FFD1D1]">Favourites System Tester</h2>

            {/* --- Controls --- */}
            <div className="bg-[#292929] p-4 rounded-lg mb-4 border border-gray-600">
                <div className="grid grid-cols-12 gap-3 mb-4">
                    {/* ID Input */}
                    <div className="col-span-5">
                        <label className="block text-gray-400 text-xs mb-1">Item ID</label>
                        <input
                            className="w-full bg-black border border-gray-600 p-2 rounded text-white focus:border-green-500 outline-none"
                            value={itemId}
                            onChange={e => setItemId(e.target.value)}
                            placeholder="e.g. 12 or uuid"
                        />
                    </div>

                    {/* Type Select */}
                    <div className="col-span-4">
                        <label className="block text-gray-400 text-xs mb-1">Item Type</label>
                        <select
                            className="w-full bg-black border border-gray-600 p-2 rounded text-white outline-none"
                            value={itemType}
                            onChange={e => setItemType(e.target.value as ItemType)}
                        >
                            <option value="playlist">Playlist</option>
                            <option value="track">Track</option>
                            <option value="album">Album</option>
                        </select>
                    </div>

                    {/* Check Status Button */}
                    <div className="col-span-3 flex items-end">
                        <button 
                            onClick={handleCheck} 
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white p-2 rounded font-bold transition"
                        >
                            Check Status
                        </button>
                    </div>
                </div>

                {/* Toggles & Actions */}
                <div className="flex justify-between items-center border-t border-gray-600 pt-4">
                     {/* The Fix Toggle */}
                    <label className="flex items-center space-x-2 cursor-pointer select-none">
                        <input 
                            type="checkbox" 
                            checked={forceString} 
                            onChange={e => setForceString(e.target.checked)}
                            className="form-checkbox text-green-500 rounded" 
                        />
                        <span className="text-gray-300">Force String ID (Fix 400)</span>
                    </label>

                    <div className="space-x-2">
                        <button 
                            onClick={handleAdd} 
                            className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white font-bold transition"
                        >
                            Add Fav
                        </button>
                        <button 
                            onClick={handleRemove} 
                            className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded text-white font-bold transition"
                        >
                            Remove Fav
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Results Area --- */}
            <div className="grid grid-cols-2 gap-4 h-64">
                
                {/* Left: Logs */}
                <div className="bg-black p-3 rounded border border-gray-700 overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-2 border-b border-gray-800 pb-2">
                        <h3 className="text-gray-400 font-bold uppercase text-xs">Console Logs</h3>
                        {isFav !== null && (
                            <span className={`text-xs px-2 py-1 rounded font-bold ${isFav ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
                                STATUS: {isFav ? '❤️ FAVOURITE' : '💔 NOT FAV'}
                            </span>
                        )}
                    </div>
                    <div className="overflow-y-auto flex-1 font-mono text-xs space-y-1">
                        {logs.length === 0 && <span className="text-gray-600 italic">Waiting for actions...</span>}
                        {logs.map((l, i) => (
                            <div key={i} className={`${l.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                                {l}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: List Data */}
                <div className="bg-gray-900 p-3 rounded border border-gray-700 flex flex-col">
                    <div className="flex justify-between items-center mb-2 border-b border-gray-800 pb-2">
                         <h3 className="text-gray-400 font-bold uppercase text-xs">Database Content</h3>
                         <button onClick={handleListPlaylists} className="text-xs text-blue-400 hover:text-blue-300 underline">
                             Fetch All Playlists
                         </button>
                    </div>
                    <div className="overflow-y-auto flex-1 font-mono text-xs text-gray-300">
                        {listResults.length === 0 ? (
                             <span className="text-gray-600 italic">Click fetch to see DB IDs...</span>
                        ) : (
                            <div className="space-y-1">
                                {listResults.map((id, i) => (
                                    <div key={i} className="flex gap-2">
                                        <span className="text-gray-500">{i+1}.</span>
                                        <span className="text-[#FFD1D1]">"{id}"</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FavouritesDebugger;