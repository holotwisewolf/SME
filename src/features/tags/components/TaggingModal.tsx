// src/components/TaggingModal.tsx
import React, { useState, useEffect } from 'react';
// Import service functions for database operations
import { getAllTags, createTag, assignTagToItem, removeTagFromItem, getItemTags } from '../services/tag_services';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

// Manually define the Tag interface to ensure type safety locally
interface Tag {
  id: string;
  name: string;
  type?: 'premade' | 'custom';
  creator_id?: string | null;
}

interface TaggingModalProps {
  spotifyId: string;    // The ID of the song/album
  itemType: string;     // 'track', 'album', or 'playlist'
  itemName: string;     // Display name of the item
  isOpen: boolean;      // Controls modal visibility
  onClose: () => void;  // Function to close the modal
}

const TaggingModal: React.FC<TaggingModalProps> = ({ spotifyId, itemType, itemName, isOpen, onClose }) => {
  // State for all available tags in the system
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  // State for tags currently assigned to this specific item
  const [assignedTags, setAssignedTags] = useState<Tag[]>([]);
  // State for the input field
  const [newTagName, setNewTagName] = useState('');
  // State for loading spinner
  const [loading, setLoading] = useState(false);

  // Cast itemType to the specific union type expected by the backend service
  const safeItemType = itemType as "track" | "album" | "playlist";

  // Load data whenever the modal opens or the item changes
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, spotifyId]);

  /**
   * Fetch all tags and the specific tags for this item
   */
  const loadData = async () => {
    setLoading(true);
    try {
      const all = await getAllTags();
      // Fetch tags specifically assigned to this item ID
      const assigned = await getItemTags(spotifyId, safeItemType);

      // Cast data to our local Tag interface and update state
      setAvailableTags((all || []) as Tag[]);
      setAssignedTags((assigned || []) as Tag[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle creating a new custom tag
   */
  const handleCreate = async () => {
    if (!newTagName.trim()) return; // Validation: Don't create empty tags
    try {
      // Create the tag in the database (defaults to 'custom' type)
      const newTag = await createTag(newTagName);

      if (newTag) {
        // Optimistic update: Add to list immediately
        setAvailableTags(prev => [...prev, newTag as Tag]);
        setNewTagName(''); // Clear input
      }
    } catch (error) {
      alert("Tag creation failed.");
    }
  };

  /**
   * Toggle tag assignment (Add or Remove)
   */
  const toggleTag = async (tag: Tag) => {
    if (!tag || !tag.id) return;

    // Check if the tag is already assigned to this item
    const isAssigned = assignedTags.some(t => t.id === tag.id);

    try {
      if (isAssigned) {
        // If assigned -> Remove it
        await removeTagFromItem(spotifyId, safeItemType, tag.id);
        setAssignedTags(prev => prev.filter(t => t.id !== tag.id));
      } else {
        // If not assigned -> Add it
        await assignTagToItem(spotifyId, safeItemType, tag.id);
        setAssignedTags(prev => [...prev, tag]);
      }
    } catch (error) {
      console.error("Toggle tag error:", error);
    }
  };

  // Don't render anything if modal is closed
  if (!isOpen) return null;

  return (
    // Overlay Background
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">

      {/* Modal Content Box */}
      <div className="bg-[#292929] w-96 p-6 rounded-xl border border-[#444] shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#BAFFB5]">Manage Tags</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        <p className="text-sm text-gray-400 mb-4">Item: <span className="text-white">{itemName}</span></p>

        {/* Input Section for New Tags */}
        <div className="flex gap-2 mb-4 border-b border-[#444] pb-4">
          <input
            type="text"
            placeholder="New tag name..."
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="flex-1 bg-[#1a1a1a] text-white px-3 py-2 rounded outline-none border border-[#444] focus:border-[#BAFFB5]"
          />
          <button onClick={handleCreate} className="bg-[#BAFFB5] text-black px-4 py-2 rounded font-bold">Add</button>
        </div>

        {/* Scrollable Tag List */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center p-4">
              <LoadingSpinner />
            </div>
          ) : (
            availableTags.map(tag => {
              // Check if this specific tag is selected
              const isSelected = assignedTags.some(t => t.id === tag.id);
              return (
                <div
                  key={tag.id}
                  onClick={() => toggleTag(tag)}
                  className={`
                    cursor-pointer p-2 rounded flex justify-between items-center transition 
                    ${isSelected ? 'bg-[#BAFFB5] bg-opacity-20 border border-[#BAFFB5]' : 'bg-[#333] hover:bg-[#444]'}
                  `}
                >
                  <span className={isSelected ? 'text-[#BAFFB5]' : 'text-gray-300'}>{tag.name}</span>
                  {isSelected && <span className="text-[#BAFFB5]">✓</span>}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default TaggingModal;