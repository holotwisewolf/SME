// RecommendationSection - horizontal scrollable section of recommendations

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import RecommendationCard from './RecommendationCard';
import type { RecommendedItem } from '../types/recommendation_types';

interface RecommendationSectionProps {
    title: string;
    subtitle?: string;
    items: RecommendedItem[];
    onItemClick?: (item: RecommendedItem) => void;
    onAddToFavourites?: (item: RecommendedItem) => void;
    onAddToPlaylist?: (item: RecommendedItem) => void;
}

const RecommendationSection: React.FC<RecommendationSectionProps> = ({
    title,
    subtitle,
    items,
    onItemClick,
    onAddToFavourites,
    onAddToPlaylist
}) => {
    if (items.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
        >
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold text-[#D1D1D1]">{title}</h2>
                    {subtitle && (
                        <p className="text-sm text-[#D1D1D1]/60 mt-0.5">{subtitle}</p>
                    )}
                </div>
                {items.length > 6 && (
                    <button className="text-[#D1D1D1]/60 hover:text-[#FFD1D1] text-sm flex items-center gap-1 transition-colors">
                        See all <ChevronRight className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Horizontal Scroll Container */}
            <div className="relative -mx-2">
                <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-thin scrollbar-thumb-[#696969] scrollbar-track-transparent">
                    {items.map((item, index) => (
                        <div key={item.id} className="flex-shrink-0 w-[180px]">
                            <RecommendationCard
                                item={item}
                                index={index}
                                onClick={onItemClick}
                                onAddToFavourites={onAddToFavourites}
                                onAddToPlaylist={onAddToPlaylist}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default RecommendationSection;
