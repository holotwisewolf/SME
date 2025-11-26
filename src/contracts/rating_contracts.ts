import type { Rating, ItemType } from '../types/app';

export interface IRatingService {
    submitPersonalRating(userId: string, itemId: string, itemType: ItemType, ratingValue: number, isPublic: boolean): Promise<Rating[]>;
    updateRating(ratingId: string, newRating: number): Promise<Rating[]>;
    deleteRating(ratingId: string): Promise<void>;
    getPersonalRating(userId: string, itemId: string, itemType: ItemType): Promise<Rating | null>;
    toggleRatingPrivacy(ratingId: string): Promise<Rating[]>;
    getRatingHistory(userId: string, page?: number, limit?: number): Promise<any[]>;
    subscribeToRatingUpdates(itemId: string, itemType: ItemType, callback: (payload: { old: Rating | null; new: Rating | null; eventType: 'UPDATE' | 'INSERT' | 'DELETE'; }) => void): any;
}
