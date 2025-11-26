import type { Tag, TagType, ItemType } from '../types/app';

export interface ITagService {
    getAllTags(): Promise<Tag[]>;
    getPreMadeTags(): Promise<Tag[]>;
    getUserCustomTags(): Promise<Tag[]>;
    createTag(tagName: string, type?: TagType): Promise<Tag>;
    assignTagToItem(itemId: string, itemType: ItemType, tagId: string): Promise<void>;
    removeTagFromItem(itemId: string, itemType: ItemType, tagId: string): Promise<void>;
    getItemTags(itemId: string, itemType: ItemType): Promise<Tag[]>;
    searchTags(query: string): Promise<Tag[]>;
    createCustomTag(name: string): Promise<Tag>;
}
