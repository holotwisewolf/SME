import type { Rating } from '../type/rating_types';
import type { ItemType } from '../../../types/global';

export interface IRatingService {
    // Removed 'isPublic' argument
    submitPersonalRating(userId: string, itemId: string, itemType: ItemType, ratingValue: number): Promise<Rating[]>;
    
    updateRating(ratingId: string, newRating: number): Promise<Rating[]>;
    
    deleteRating(ratingId: string): Promise<void>;
    
    getPersonalRating(userId: string, itemId: string, itemType: ItemType): Promise<Rating | null>;
    
    // REMOVED: toggleRatingPrivacy 
    // Reason: Rating privacy is inherited from the User Profile, so you can't toggle specific ratings.
    
    getRatingHistory(userId: string, page?: number, limit?: number): Promise<any[]>;
    
    subscribeToRatingUpdates(itemId: string, itemType: ItemType, callback: (payload: { old: Rating | null; new: Rating | null; eventType: 'UPDATE' | 'INSERT' | 'DELETE'; }) => void): any;
}