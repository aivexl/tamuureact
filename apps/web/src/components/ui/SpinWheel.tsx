/**
 * SpinWheel - Canvas-based Spin Wheel Component
 * A proper wheel spinner using HTML5 Canvas
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface SpinWheelProps {
    segments: string[];
    onFinished: (winner: string) => void;
    isSpinning: boolean;
    onSpinStart: () => void;
    onSpinEnd: () => void;
    primaryColor?: string;
    secondaryColor?: string;
    buttonText?: string;
    size?: number;
}

const SpinWheel: React.FC<SpinWheelProps> = ({
    segments,
    onFinished,
    isSpinning,
    onSpinStart,
    onSpinEnd,
    primaryColor = '#8b5cf6',
    secondaryColor = '#6366f1',
    buttonText = 'SPIN',
    size = 280,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [rotation, setRotation] = useState(0);
    const animationRef = useRef<number | null>(null);

    const colors = [
        '#8b5cf6', '#6366f1', '#ec4899', '#7c3aed',
        '#a855f7', '#f43f5e', '#10b981', '#3b82f6'
    ];

    // Draw the wheel
    const drawWheel = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (segments.length === 0) {
            // Draw empty wheel
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.fillStyle = '#f1f5f9';
            ctx.fill();
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 4;
            ctx.stroke();

            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 14px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText('Tambahkan peserta', centerX, centerY);
            return;
        }

        const segmentAngle = (2 * Math.PI) / segments.length;

        // Draw segments
        segments.forEach((segment, i) => {
            const startAngle = rotation + i * segmentAngle - Math.PI / 2;
            const endAngle = startAngle + segmentAngle;

            // Segment
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Text
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + segmentAngle / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${segments.length > 8 ? 10 : segments.length > 4 ? 12 : 14}px system-ui`;
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            const displayText = segment.length > 10 ? segment.slice(0, 9) + '..' : segment;
            ctx.fillText(displayText, radius - 15, 4);
            ctx.restore();
        });

        // Center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 35, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 4;
        ctx.stroke();

        // Outer ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 6;
        ctx.stroke();

    }, [segments, rotation, primaryColor, colors]);

    // Draw wheel on mount and when rotation changes
    useEffect(() => {
        drawWheel();
    }, [drawWheel]);

    // Spin animation
    const spin = useCallback(() => {
        if (segments.length === 0) return;

        onSpinStart();

        const spinDuration = 4000;
        const startTime = Date.now();
        const startRotation = rotation;
        const spins = 5 + Math.random() * 3;
        const winnerIndex = Math.floor(Math.random() * segments.length);
        const segmentAngle = (2 * Math.PI) / segments.length;
        const targetRotation = startRotation + (spins * 2 * Math.PI) + (winnerIndex * segmentAngle);

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / spinDuration, 1);

            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentRotation = startRotation + (targetRotation - startRotation) * easeOut;

            setRotation(currentRotation);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                const winner = segments[winnerIndex];
                onFinished(winner);
                onSpinEnd();
            }
        };

        animationRef.current = requestAnimationFrame(animate);
    }, [segments, rotation, onSpinStart, onSpinEnd, onFinished]);

    // Cleanup animation on unmount
    useEffect(() => {
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return (
        <div className="relative flex flex-col items-center">
            {/* Pointer */}
            <div
                className="absolute z-10"
                style={{ top: -5 }}
            >
                <div
                    className="w-0 h-0"
                    style={{
                        borderLeft: '15px solid transparent',
                        borderRight: '15px solid transparent',
                        borderTop: `25px solid ${primaryColor}`,
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                    }}
                />
            </div>

            {/* Canvas Wheel */}
            <canvas
                ref={canvasRef}
                width={size}
                height={size}
                className="rounded-full shadow-2xl"
            />

            {/* Center button */}
            <button
                onClick={spin}
                disabled={isSpinning || segments.length === 0}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center font-black text-sm disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                style={{
                    color: primaryColor,
                    border: `3px solid ${primaryColor}`
                }}
            >
                {isSpinning ? '...' : buttonText}
            </button>
        </div>
    );
};

export default SpinWheel;
