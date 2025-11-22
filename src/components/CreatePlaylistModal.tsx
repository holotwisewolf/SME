// src/components/CreatePlaylistModal.tsx

import React, { useState } from 'react';
import { createSpotifyPlaylist } from '../services/spotify_services'; 

interface CreatePlaylistModalProps {
  onClose: (didCreate: boolean) => void;
  // NOTE: This mock ID must be replaced with the actual current user's ID
  mockUserId: string; 
}

const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ onClose, mockUserId }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await createSpotifyPlaylist(
        mockUserId,
        name,
        description,
        isPublic
      );
      
      console.log('Playlist Created successfully:', response);
      alert(`Playlist '${name}' created! ID: ${response.id}`);
      
      // Close modal and indicate success
      onClose(true);

    } catch (err) {
      console.error('API Error:', err);
      // Display the error message from the service function
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-[#292929] p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6">Create New Spotify Playlist</h2>
        <form onSubmit={handleSubmit}>
          
          <div className="mb-4">
            <label className="block text-gray-400 text-sm font-medium mb-2" htmlFor="name">
              Playlist Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-[#1a1a1a] text-white rounded focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-400 text-sm font-medium mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-[#1a1a1a] text-white rounded focus:ring-green-500 focus:border-green-500"
              rows={3}
            />
          </div>

          <div className="mb-6 flex items-center">
            <input
              id="public"
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
            />
            <label className="ml-2 text-gray-400 text-sm font-medium" htmlFor="public">
              Public Playlist (if unchecked, it's private)
            </label>
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
              disabled={isLoading || !name}
            >
              {isLoading ? 'Creating...' : 'Create Playlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlaylistModal;