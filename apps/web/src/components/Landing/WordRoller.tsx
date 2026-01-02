import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WordRollerProps {
    words: string[];
    className?: string;
}

export const WordRoller: React.FC<WordRollerProps> = ({ words, className }) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [words]);

    return (
        <span className={`relative inline-flex h-[1.2em] overflow-hidden ${className}`}>
            <AnimatePresence mode="wait">
                <motion.span
                    key={index}
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    exit={{ y: '-100%', opacity: 0 }}
                    transition={{
                        type: 'spring',
                        stiffness: 100,
                        damping: 20,
                        duration: 0.8
                    }}
                    className="flex text-premium-accent italic underline decoration-premium-accent/20 underline-offset-8"
                >
                    {words[index]}
                </motion.span>
            </AnimatePresence>
        </span>
    );
};
