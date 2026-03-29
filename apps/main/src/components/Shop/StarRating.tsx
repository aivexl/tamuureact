import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
    rating: number;
    count?: number;
    size?: number;
    showCount?: boolean;
    className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({ 
    rating = 0, 
    count = 0, 
    size = 16, 
    showCount = true,
    className = ""
}) => {
    const roundedRating = Math.round(rating * 2) / 2;
    
    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={size}
                        className={`${
                            star <= roundedRating 
                                ? "fill-yellow-400 text-yellow-400" 
                                : star - 0.5 === roundedRating
                                    ? "fill-yellow-400 text-yellow-400 opacity-50"
                                    : "text-gray-300"
                        }`}
                    />
                ))}
            </div>
            {showCount && (
                <span className="text-xs text-gray-500 font-medium">
                    {rating > 0 ? rating.toFixed(1) : "0.0"} ({count})
                </span>
            )}
        </div>
    );
};
