// src/components/AddTracksModal.tsx

import React, { useState } from 'react';
import { addTracksToSpotifyPlaylist } from '../services/spotify_services'; 

interface AddTracksModalProps {
  playlistId: string;
  playlistName: string;
  onClose: (didAdd: boolean) => void;
}

const AddTracksModal: React.FC<AddTracksModalProps> = ({ playlistId, playlistName, onClose }) => {
  // Mock URIs for initial testing
  const [trackInput, setTrackInput] = useState('spotify:track:11dFghVXANMlKmJXsNCcWG\nspotify:track:4n7jnflm2WzJtQ9h0w5cM6'); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple cleaning and validation
    const trackUris = trackInput
      .split(/[\n,]+/) 
      .map(uri => uri.trim())
      .filter(uri => uri.startsWith('spotify:track:') && uri.length > 25); 

    if (trackUris.length === 0) {
      setError('Please enter valid Spotify track URIs (e.g., spotify:track:ID).');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await addTracksToSpotifyPlaylist(
        playlistId,
        trackUris
      );
      
      console.log(`Tracks added to ${playlistName} successfully:`, response);
      alert(`${trackUris.length} tracks added to '${playlistName}'!`);
      
      onClose(true);

    } catch (err) {
      console.error('API Error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-[#292929] p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-2">Add Tracks to "{playlistName}"</h2>
        <p className="text-gray-400 mb-6 text-sm">Playlist ID: {playlistId}</p>
        <form onSubmit={handleSubmit}>
          
          <div className="mb-6">
            <label className="block text-gray-400 text-sm font-medium mb-2" htmlFor="trackUris">
              Spotify Track URIs (one per line)
            </label>
            <textarea
              id="trackUris"
              value={trackInput}
              onChange={(e) => setTrackInput(e.target.value)}
              className="w-full p-3 bg-[#1a1a1a] text-white rounded focus:ring-green-500 focus:border-green-500"
              rows={5}
              placeholder="e.g. spotify:track:1234567890..."
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-800/50 text-red-300 rounded text-sm">
              Error: {error}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-4 py-2 text-gray-400 rounded hover:bg-[#1a1a1a] transition"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-500 text-white rounded-full font-medium hover:bg-green-600 transition disabled:opacity-50"
              disabled={isLoading || trackInput.trim().length === 0}
            >
              {isLoading ? 'Adding...' : 'Add Tracks'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTracksModal;