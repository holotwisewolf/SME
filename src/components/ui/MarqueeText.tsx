import React, { useState, useRef, useEffect } from 'react';

interface MarqueeTextProps {
    text: string;
    className?: string;
    onClick?: () => void;
    maxWidth?: string;
}

/**
 * MarqueeText - A component that shows truncated text by default,
 * and scrolls the full text on hover (train station announcement style).
 */
export const MarqueeText: React.FC<MarqueeTextProps> = ({
    text,
    className = '',
    onClick,
    maxWidth = '100%'
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        // Check if text overflows container
        const checkOverflow = () => {
            if (containerRef.current && textRef.current) {
                setIsOverflowing(textRef.current.scrollWidth > containerRef.current.clientWidth);
            }
        };

        checkOverflow();
        window.addEventListener('resize', checkOverflow);
        return () => window.removeEventListener('resize', checkOverflow);
    }, [text]);

    const animationDuration = text.length * 0.1; // ~0.1s per character

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden whitespace-nowrap ${className}`}
            style={{ maxWidth }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            <span
                ref={textRef}
                className={`inline-block ${isHovered && isOverflowing ? 'animate-marquee' : ''}`}
                style={{
                    paddingRight: isHovered && isOverflowing ? '2rem' : '0',
                    animation: isHovered && isOverflowing
                        ? `marquee ${animationDuration}s linear infinite`
                        : 'none'
                }}
            >
                {text}
            </span>
            {/* Show ellipsis when not hovered and overflowing */}
            {!isHovered && isOverflowing && (
                <span className="absolute right-0 top-0 bg-gradient-to-l from-inherit to-transparent pl-4"
                    style={{ background: 'linear-gradient(to left, currentColor 20%, transparent)' }}>
                </span>
            )}
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-100%); }
                }
            `}</style>
        </div>
    );
};

export default MarqueeText;
