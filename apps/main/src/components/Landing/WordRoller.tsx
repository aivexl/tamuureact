"use client";

import React, { useState, useEffect } from 'react';

const eventTypes = [
    "Pernikahan",
    "Pertunangan",
    "Aqiqah",
    "Sunatan",
    "Syukuran",
    "Tahlilan",
    "Ulang Tahun",
    "Peresmian",
    "Event",
    "Rapat"
];
const ITEM_HEIGHT_EM = 1.7;

export const WordRoller: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [transitionEnabled, setTransitionEnabled] = useState(true);
    const displayList = [...eventTypes, eventTypes[0]];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex(prev => {
                if (prev < eventTypes.length) {
                    return prev + 1;
                }
                return prev;
            });
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (currentIndex === eventTypes.length) {
            const timeout = setTimeout(() => {
                setTransitionEnabled(false);
                setCurrentIndex(0);

                requestAnimationFrame(() => {
                    setTimeout(() => {
                        setTransitionEnabled(true);
                    }, 50);
                });
            }, 800);
            return () => clearTimeout(timeout);
        }
    }, [currentIndex]);

    return (
        <div className="flex items-center justify-center lg:justify-start overflow-visible" style={{ height: `${ITEM_HEIGHT_EM}em` }}>
            <span className="relative overflow-hidden inline-flex flex-col items-center lg:items-start min-w-[200px] sm:min-w-[400px]" style={{ height: `${ITEM_HEIGHT_EM}em` }}>
                <span
                    className={`flex flex-col w-full whitespace-nowrap ${transitionEnabled ? 'transition-transform duration-700 ease-in-out' : ''}`}
                    style={{ transform: `translateY(-${currentIndex * ITEM_HEIGHT_EM}em)` }}
                >
                    {displayList.map((event, i) => (
                        <span
                            key={i}
                            className="flex items-center justify-center lg:justify-start text-[#FFBF00] font-black"
                            style={{ height: `${ITEM_HEIGHT_EM}em` }}
                        >
                            {event}
                        </span>
                    ))}
                </span>
            </span>
        </div>
    );
};
