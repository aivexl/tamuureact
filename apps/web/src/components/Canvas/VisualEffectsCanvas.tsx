import React, { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';

interface VisualEffectsCanvasProps {
    mode?: 'scoped' | 'global';
    className?: string;
}

// ============================================
// TYPES
// ============================================
interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string | string[];
    alpha: number;
    life: number;
    maxLife: number;
    rotation: number;
    rotationSpeed: number;
    // 3D Simulation
    tilt: number;
    tiltAngle: number;
    tiltSpeed: number;
    // Physics
    gravity: number;
    drag: number;
    wind: number;
    // Specifics
    type: 'circle' | 'rect' | 'image' | 'text' | 'shape' | 'pulse';
    shapeType?: 'petal' | 'heart' | 'feather' | 'star' | 'streamer';
    text?: string;
}

export const VisualEffectsCanvas: React.FC<VisualEffectsCanvasProps> = ({
    mode = 'global',
    className = ''
}) => {
    const { activeEffects, removeActiveEffect } = useStore();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Track active particles
    const particles = useRef<Particle[]>([]);
    const animationFrame = useRef<number>(0);
    const lastTime = useRef<number>(0);
    const processedEffectIds = useRef<Set<string>>(new Set());

    // ============================================
    // PARTICLE FACTORY
    // ============================================
    const createBurst = (effect: any, canvasWidth: number, canvasHeight: number) => {
        const { type, origin } = effect;
        console.log(`[VisualEffects] Creating Burst | Type: ${type} | Origin:`, origin);
        // Origin Logic: 
        // We assume 'origin' is Screen-Normalized (0-1 relative to Viewport).
        // we need to convert this to Local Canvas Coordinates.

        let burstOriginX = canvasWidth / 2;
        let burstOriginY = canvasHeight / 2;

        if (origin) {
            const canvasRect = canvasRef.current?.getBoundingClientRect();
            if (canvasRect && canvasRect.width > 0 && canvasRect.height > 0) {
                // Convert Screen Normalized -> Screen Px
                const screenX = origin.x * window.innerWidth;
                const screenY = origin.y * window.innerHeight;

                // CTO FIX: Calculate Local Px accounting for CSS Scaling
                // (screenX - rect.left) gives visual px offset.
                // We multiply by (canvas.width / rect.width) to get internal canvas px.
                const scaleX = canvasWidth / canvasRect.width;
                const scaleY = canvasHeight / canvasRect.height;

                burstOriginX = (screenX - canvasRect.left) * scaleX;
                burstOriginY = (screenY - canvasRect.top) * scaleY;

                console.log('[VisualEffects] Burst Origin Calced:', {
                    origin,
                    screen: { x: screenX, y: screenY },
                    local: { x: burstOriginX, y: burstOriginY },
                    scale: { x: scaleX, y: scaleY }
                });
            } else {
                // Fallback (e.g. initial render or invisible)
                burstOriginX = origin.x * canvasWidth;
                burstOriginY = origin.y * canvasHeight;
            }
        }

        const newParticles: Particle[] = [];
        const config = getEffectConfig(type);
        const count = config.count;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * config.speedBase + config.speedVar;

            // Spatial Distribution
            let startX = burstOriginX;
            let startY = burstOriginY;


            if (config.isGlobal) {
                startX = Math.random() * canvasWidth;
                // CTO: For global effects, distribute vertically on initial burst so screen isn't empty at start
                startY = Math.random() * canvasHeight - 50;

                // Rain/Snow wide distribution for angled wind
                if (['rain', 'snow', 'blizzard', 'mist'].includes(type) && Math.random() > 0.5) {
                    startX = Math.random() * canvasWidth * 1.5 - (canvasWidth * 0.25);
                }
                // Party Poppers side launch
                if (type === 'party_poppers') {
                    startX = Math.random() > 0.5 ? 0 : canvasWidth;
                    startY = canvasHeight * 0.9;
                }
            }

            // Velocity Calculation
            let vx = Math.cos(angle) * velocity;
            let vy = Math.sin(angle) * velocity;

            if (config.isGlobal) {
                vx = (Math.random() - 0.5) * 2;
                vy = Math.random() * 5 + 2;
                if (type === 'snow' || type === 'blizzard') {
                    vx = (Math.random() - 0.5) * (type === 'blizzard' ? 15 : 2);
                }
            }
            if (type === 'party_poppers') {
                vx = (startX === 0 ? 1 : -1) * (Math.random() * 15 + 10);
                vy = -(Math.random() * 20 + 15);
            }
            if (type === 'fireworks') {
                vx *= 2; // Explode faster
                vy *= 2;
            }

            const chosenColor = Array.isArray(config.colors)
                ? config.colors[Math.floor(Math.random() * config.colors.length)]
                : config.colors;

            newParticles.push({
                x: startX,
                y: startY,
                vx,
                vy,
                size: Math.random() * (config.sizeMax - config.sizeMin) + config.sizeMin,
                color: chosenColor,
                alpha: 1,
                life: config.life,
                maxLife: config.life,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                tilt: Math.random() * 10,
                tiltAngle: Math.random() * Math.PI * 2,
                tiltSpeed: Math.random() * 0.1 + 0.05,
                gravity: config.gravity,
                drag: config.drag,
                wind: config.wind,
                type: config.shape as any,
                shapeType: config.shapeType as any,
                text: type === 'matrix' ? String.fromCharCode(0x30A0 + Math.random() * 96) : undefined
            });
        }
        return newParticles;
    };


    // ============================================
    // EFFECTS WATCHER
    // ============================================
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Reset dimensions for spawning
        if (mode === 'scoped' && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        } else if (mode === 'global') {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        activeEffects.forEach(effect => {
            if (!processedEffectIds.current.has(effect.id)) {
                processedEffectIds.current.add(effect.id);
                console.log(`[VisualEffects] Spawning new effect: ${effect.type} (${effect.id})`);
                particles.current.push(...createBurst(effect, canvas.width, canvas.height));
            }
        });

        // Cleanup
        const activeIds = new Set(activeEffects.map(e => e.id));
        processedEffectIds.current.forEach(id => {
            if (!activeIds.has(id)) processedEffectIds.current.delete(id);
        });
    }, [activeEffects, mode]);


    // ============================================
    // ANIMATION LOOP
    // ============================================
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let running = true;

        const loop = (timestamp: number) => {
            if (!running) return;
            if (!lastTime.current) lastTime.current = timestamp;
            const dt = 1; // Simplified delta for robustness

            // Resize Logic
            if (mode === 'global') {
                if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                }
            } else {
                const rect = containerRef.current?.getBoundingClientRect();
                if (rect && (canvas.width !== rect.width || canvas.height !== rect.height)) {
                    canvas.width = rect.width;
                    canvas.height = rect.height;
                }
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Particles
            for (let i = particles.current.length - 1; i >= 0; i--) {
                const p = particles.current[i];

                // Physics
                p.tiltAngle += p.tiltSpeed;
                p.rotation += p.rotationSpeed;

                // Advanced Movement
                if (p.type === 'shape' || p.shapeType === 'streamer') {
                    // Flutter Physics
                    p.y += (Math.cos(p.tiltAngle) + 1 + p.size / 20) * (p.gravity * 2);
                    p.x += Math.sin(p.tiltAngle) * 2 - p.wind;
                } else {
                    // Standard Physics
                    p.x += p.vx + p.wind;
                    p.y += p.vy;
                    p.vy += p.gravity;
                    p.vx *= (1 - p.drag);
                    p.vy *= (1 - p.drag);
                }

                // Decay
                // Aurora decays slower for atmospheric feel
                p.life -= p.type === 'pulse' ? 0.002 : 0.005;

                // Bounds Check
                if (p.life <= 0 || p.y > canvas.height + 100) {
                    particles.current.splice(i, 1);
                    continue;
                }

                // Rendering
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation * Math.PI / 180);

                // 3D Flip
                const flipScale = Math.cos(p.tiltAngle);
                ctx.scale(1, p.type === 'circle' ? 1 : flipScale);

                ctx.globalAlpha = p.alpha * (p.life < 0.2 ? p.life * 5 : 1);
                ctx.fillStyle = Array.isArray(p.color) ? p.color[0] : p.color;

                // SHAPE DRAWING
                if (p.type === 'rect') {
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                }
                else if (p.type === 'circle') {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                else if (p.type === 'text' && p.text) {
                    ctx.font = `bold ${p.size}px monospace`;
                    ctx.fillText(p.text, -p.size / 2, p.size / 2); // Center align approx
                }
                else if (p.type === 'shape') {
                    if (p.shapeType === 'petal') {
                        ctx.beginPath();
                        ctx.ellipse(0, 0, p.size, p.size / 1.5, 0, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    else if (p.shapeType === 'heart') {
                        ctx.beginPath();
                        const topCurveHeight = p.size * 0.3;
                        ctx.moveTo(0, topCurveHeight);
                        ctx.bezierCurveTo(0, 0, -p.size / 2, 0, -p.size / 2, topCurveHeight);
                        ctx.bezierCurveTo(-p.size / 2, (p.size + topCurveHeight) / 2, 0, p.size, 0, p.size);
                        ctx.bezierCurveTo(0, p.size, p.size / 2, (p.size + topCurveHeight) / 2, p.size / 2, topCurveHeight);
                        ctx.bezierCurveTo(p.size / 2, 0, 0, 0, 0, topCurveHeight);
                        ctx.fill();
                    }
                    else if (p.shapeType === 'feather') {
                        ctx.beginPath();
                        ctx.ellipse(0, 0, p.size / 3, p.size, 0, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    else if (p.shapeType === 'streamer') {
                        ctx.fillRect(-p.size / 4, -p.size * 2, p.size / 2, p.size * 4);
                    }
                }
                else if (p.type === 'pulse') {
                    // Pulse rendered as expansive circle (no translate)
                    ctx.restore(); // Undo translate
                    ctx.save();
                    // Aurora grows as life goes from 1 to 0
                    const progress = 1 - p.life;
                    const grad = ctx.createRadialGradient(
                        canvas.width / 2, canvas.height / 2, 0,
                        canvas.width / 2, canvas.height / 2, canvas.width * progress
                    );
                    grad.addColorStop(0, Array.isArray(p.color) ? p.color[0] : p.color);
                    grad.addColorStop(0.5, Array.isArray(p.color) ? p.color[0] : p.color);
                    grad.addColorStop(1, 'transparent');
                    ctx.fillStyle = grad;
                    ctx.globalAlpha = p.alpha * (p.life > 0.8 ? (1 - p.life) * 5 : p.life * 1.25);
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                ctx.restore();
            }

            animationFrame.current = requestAnimationFrame(loop);
        };

        animationFrame.current = requestAnimationFrame(loop);
        return () => {
            running = false;
            cancelAnimationFrame(animationFrame.current);
        };
    }, [mode]);

    return (
        <div
            ref={containerRef}
            className={`pointer-events-none z-[9999] overflow-hidden ${mode === 'global' ? 'fixed inset-0' : 'absolute inset-0'} ${className}`}
        >
            <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
    );
};


// ============================================
// CONFIGURATOR
// ============================================
const getEffectConfig = (type: string): any => {
    // defaults
    const cfg = {
        count: 50, speedBase: 5, speedVar: 5, sizeMin: 5, sizeMax: 10,
        colors: ['#FFD700', '#FF0000', '#FFFFFF'] as any,
        gravity: 0.1, drag: 0.01, wind: 0, life: 1,
        shape: 'rect', shapeType: '', isGlobal: false
    };

    switch (type) {
        // CELEBRATION
        case 'confetti':
        case 'party_poppers':
            cfg.count = 150;
            cfg.colors = ['#FFD700', '#FF69B4', '#00BFFF', '#7CFC00', '#FF4500'];
            cfg.gravity = 0.2;
            break;
        case 'gold_rain':
            cfg.count = 200;
            cfg.colors = ['#FFD700', '#DAA520', '#B8860B'];
            cfg.isGlobal = true;
            cfg.gravity = 0.3;
            break;
        case 'streamers':
            cfg.count = 80;
            cfg.shape = 'shape';
            cfg.shapeType = 'streamer';
            cfg.colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];
            cfg.gravity = 0.3;
            break;
        case 'fireworks':
            cfg.count = 200;
            cfg.colors = ['#FF0000', '#FFD700', '#FFFFFF', '#00FF00'];
            cfg.shape = 'circle';
            cfg.gravity = 0.1;
            break;

        // NATURE
        case 'rose_petals':
            cfg.count = 40;
            cfg.colors = '#e0115f';
            cfg.shape = 'shape';
            cfg.shapeType = 'petal';
            cfg.isGlobal = true;
            cfg.sizeMin = 10;
            cfg.sizeMax = 15;
            cfg.gravity = 0.08;
            cfg.wind = 0.5;
            break;
        case 'sakura':
            cfg.count = 50;
            cfg.colors = '#ffb7c5';
            cfg.shape = 'shape';
            cfg.shapeType = 'petal';
            cfg.isGlobal = true;
            cfg.gravity = 0.06;
            cfg.wind = 0.3;
            break;
        case 'hearts':
            cfg.shape = 'shape';
            cfg.shapeType = 'heart';
            cfg.colors = ['#ff0000', '#ff69b4', '#db7093'];
            cfg.gravity = 0.05;
            break;

        // ATMOSPHERIC
        case 'snow':
        case 'blizzard':
            cfg.count = 300;
            cfg.colors = '#FFFFFF';
            cfg.shape = 'circle';
            cfg.isGlobal = true;
            cfg.gravity = 0.05;
            cfg.wind = type === 'blizzard' ? 5 : 1;
            cfg.sizeMax = 4;
            break;
        case 'rain':
            cfg.count = 500;
            cfg.colors = 'rgba(174, 194, 224, 0.5)';
            cfg.shape = 'rect'; // Long rects
            cfg.sizeMin = 1;
            cfg.sizeMax = 2;
            cfg.isGlobal = true;
            cfg.gravity = 15; // Fast
            break;

        // TECH
        case 'matrix':
            cfg.count = 100;
            cfg.colors = '#00FF00';
            cfg.shape = 'text';
            cfg.isGlobal = true;
            cfg.gravity = 5;
            cfg.sizeMin = 14;
            break;

        // MAGIC
        case 'stars':
        case 'fireflies':
            cfg.count = 100;
            cfg.colors = type === 'stars' ? '#FFFFFF' : '#ccff00';
            cfg.shape = 'circle';
            cfg.isGlobal = true;
            cfg.gravity = 0;
            cfg.speedBase = 0.5;
            break;

        case 'aurora':
            cfg.count = 2;
            cfg.shape = 'pulse';
            cfg.colors = 'rgba(0, 255, 150, 0.15)';
            cfg.life = 1.0;
            break;
    }
    return cfg;
};

export default VisualEffectsCanvas;
