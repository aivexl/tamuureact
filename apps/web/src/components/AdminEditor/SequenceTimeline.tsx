import React, { useRef } from "react";
import { m } from "framer-motion";
import {
  Play,
  Pause,
  Square,
  Search,
  Plus,
  Layers,
  ChevronRight,
  RotateCcw,
  Scissors,
  MousePointer2,
  Magnet,
  Eye,
  EyeOff,
  Lock,
  Unlock,
} from "lucide-react";
import { useStore } from "@/store/useStore";

/**
 * SequenceTimeline Component
 *
 * A professional-grade, high-precision motion graphics timeline.
 * Adheres to the "Citadel Onyx" aesthetic: Matte, Minimalist, Enterprise.
 */
const TIMELINE_GRID_STYLE = {
  backgroundImage:
    "linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px)",
  backgroundSize: "40px 100%",
};

export const SequenceTimeline: React.FC = () => {
  const {
    playhead,
    duration,
    isPlaying,
    togglePlayback,
    setPlayhead,
    setDuration,
    resetClock,
    sections,
    activeSectionId,
    updateElementInSection,
    timelineZoom,
    isSnappingEnabled,
    activeTimelineTool,
    snapLine,
    setTimelineZoom,
    setSnappingEnabled,
    setActiveTimelineTool,
    setSnapLine,
  } = useStore();

  const timelineRef = useRef<HTMLDivElement>(null);
  const leftSidebarRef = useRef<HTMLDivElement>(null);
  const activeSection = sections.find((s) => s.id === activeSectionId);

  const { orbit, updateOrbitElement } = useStore();

  const layers = React.useMemo(() => {
    const sectionLayers = activeSection?.elements || [];
    const orbitLeftLayers = orbit?.left?.elements?.map(l => ({ ...l, _orbit: 'left' })) || [];
    const orbitRightLayers = orbit?.right?.elements?.map(l => ({ ...l, _orbit: 'right' })) || [];
    return [...sectionLayers, ...orbitLeftLayers, ...orbitRightLayers];
  }, [activeSection?.elements, orbit?.left?.elements, orbit?.right?.elements]);

  const updateTimelineElement = React.useCallback((layerId: string, updates: Partial<typeof layers[0]>) => {
    const el = layers.find(l => l.id === layerId) as any;
    if (el?._orbit === 'left') {
      updateOrbitElement('left', layerId, updates);
    } else if (el?._orbit === 'right') {
      updateOrbitElement('right', layerId, updates);
    } else if (activeSectionId) {
      updateElementInSection(activeSectionId, layerId, updates);
    }
  }, [layers, updateOrbitElement, updateElementInSection, activeSectionId]);

  // Group layers into Tracks based on trackId
  const tracks = React.useMemo(() => {
    const trackMap = new Map<string, typeof layers>();
    layers.forEach((layer) => {
      const tId = layer.trackId || layer.id;
      if (!trackMap.has(tId)) trackMap.set(tId, []);
      trackMap.get(tId)!.push(layer);
    });

    return Array.from(trackMap.values()).map((trackLayers) => {
      // Sort track layers by start time
      trackLayers.sort(
        (a, b) => (a.sequence?.startTime || 0) - (b.sequence?.startTime || 0),
      );
      return {
        id: trackLayers[0].trackId || trackLayers[0].id,
        primaryLayer: trackLayers[0],
        layers: trackLayers,
      };
    });
  }, [layers]);

  // Dynamically adjust timeline duration relative to longest track
  React.useEffect(() => {
    let maxMs = 5000; // minimum duration 5s
    layers.forEach((l) => {
      const el = l as any;
      const end = (el.sequence?.startTime || 0) + (el.sequence?.duration || 2000);
      if (end > maxMs) maxMs = end;
    });
    if (duration !== maxMs) {
      setDuration(maxMs);
    }
  }, [layers, duration, setDuration]);

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  // Derived Anchor Points for Snapping
  const snapPoints = React.useMemo(() => {
    const points = new Set<number>();
    points.add(playhead);

    // Snap to whole seconds (up to duration)
    for (let i = 0; i <= duration; i += 1000) {
      points.add(i);
    }

    layers.forEach((l) => {
      const start = l.sequence?.startTime || 0;
      const end = start + (l.sequence?.duration || 2000);
      points.add(start);
      points.add(end);
    });

    return Array.from(points).sort((a, b) => a - b);
  }, [layers, duration, playhead]);

  // Base pxPerMs is 0.1, multiplied by user's timelineZoom setting
  const pxPerMs = 0.1 * timelineZoom;
  const timelineWidth = duration * pxPerMs;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor(ms % 1000);
    return `${seconds}.${milliseconds.toString().padStart(3, "0")}s`;
  };

  const handleScrub = (e: React.MouseEvent | React.TouchEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    const offsetX = x - rect.left;
    const newTime = offsetX / pxPerMs;
    setPlayhead(newTime);
  };

  return (
    <div className="w-full bg-[#020617] border-t border-white/5 flex flex-col h-72 select-none font-outfit">
      {/* 1. TIMELINE HEADER (Controls) */}
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0f172a]/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
            <button
              onClick={resetClock}
              className="p-2 hover:bg-white/10 text-slate-400 rounded-lg transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (playhead >= duration) {
                  setPlayhead(0);
                }
                togglePlayback();
              }}
              className="w-10 h-10 flex items-center justify-center bg-[#0D99FF] hover:bg-[#0D99FF]/80 text-white rounded-lg shadow-lg shadow-[#0D99FF]/20 transition-all active:scale-95"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
            <button
              onClick={resetClock}
              className="p-2 hover:bg-white/10 text-slate-400 rounded-lg transition-all"
              title="Stop & Reset"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          </div>

          <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl">
            <span className="text-sm font-mono font-bold text-[#0D99FF]">
              {formatTime(playhead)}
            </span>
            <span className="text-slate-600 mx-2">/</span>
            <span className="text-sm font-mono font-medium text-slate-500">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* NEW ENTERPRISE TOOLS: Toolbar Right */}
        <div className="flex items-center gap-3">
          {/* Tool Selection (Pointer vs Razor) */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/5 p-1 rounded-lg">
            <button
              onClick={() => setActiveTimelineTool("pointer")}
              title="Selection Tool (V)"
              className={`p-2 rounded-md transition-colors ${activeTimelineTool === "pointer" ? "bg-[#0D99FF] text-white" : "text-slate-400 hover:text-white hover:bg-white/10"}`}
            >
              <MousePointer2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (selectedIds.size > 0 && activeSectionId) {
                  let didSplit = false;
                  selectedIds.forEach((id) => {
                    const el = layers.find((l) => l.id === id);
                    if (!el || el.isLocked) return;
                    const start = el.sequence?.startTime || 0;
                    const end = start + (el.sequence?.duration || 2000);
                    if (playhead > start && playhead < end) {
                      const elInfo = el as any;
                      if (!elInfo._orbit) {
                        useStore
                          .getState()
                          .splitElement(activeSectionId, el.id, playhead);
                        didSplit = true;
                      }
                    }
                  });
                  if (didSplit) {
                    setActiveTimelineTool("pointer");
                    return;
                  }
                }
                setActiveTimelineTool("razor");
              }}
              title="Split Tool (C)"
              className={`p-2 rounded-md transition-colors ${activeTimelineTool === "razor" ? "bg-[#0D99FF] text-white" : "text-slate-400 hover:text-white hover:bg-white/10"}`}
            >
              <Scissors className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-white/5 mx-1" />

          {/* Snap Toggle */}
          <button
            onClick={() => setSnappingEnabled(!isSnappingEnabled)}
            title="Magnetic Snapping (S)"
            className={`p-2 rounded-md transition-colors border ${isSnappingEnabled ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"}`}
          >
            <Magnet className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-white/5 mx-1" />

          {/* Zoom Slider */}
          <div className="flex items-center gap-2 group" title="Timeline Zoom">
            <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={timelineZoom}
              onChange={(e) => setTimelineZoom(parseFloat(e.target.value))}
              className="w-24 accent-[#0D99FF] cursor-ew-resize h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0D99FF]"
            />
          </div>
        </div>
      </div>

      {/* 2. TIMELINE BODY */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: LAYER NAMES */}
        <div className="w-64 flex-shrink-0 border-r border-white/5 bg-[#020617] flex flex-col">
          {/* Header Spacer to align with Time Ruler */}
          <div className="h-8 border-b border-white/5 bg-[#0f172a]/30 flex-shrink-0" />

          <div
            ref={leftSidebarRef}
            className="flex-1 overflow-y-hidden no-scrollbar"
          >
            {tracks.map((track) => {
              const layer = track.primaryLayer;
              const isTrackSelected = track.layers.some((l) =>
                selectedIds.has(l.id),
              );

              return (
                <div
                  key={`track-label-${track.id}`}
                  className={`h-10 border-b border-white/5 flex items-center justify-between px-4 hover:bg-white/5 transition-colors cursor-pointer group ${isTrackSelected ? "bg-[#0D99FF]/10" : ""}`}
                  onClick={(e) => {
                    const newSet = new Set(e.shiftKey ? selectedIds : []);
                    const allTrackIds = track.layers.map((l) => l.id);
                    const hasAny = allTrackIds.some((id) => newSet.has(id));

                    allTrackIds.forEach((id) => {
                      if (hasAny) newSet.delete(id);
                      else newSet.add(id);
                    });
                    setSelectedIds(newSet);
                  }}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <ChevronRight
                      className={`w-3 h-3 shrink-0 transition-colors ${isTrackSelected ? "text-[#0D99FF]" : "text-slate-600 group-hover:text-indigo-400"}`}
                    />
                    <span
                      className={`text-[11px] font-bold truncate tracking-tight uppercase transition-colors ${isTrackSelected ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                    >
                      {((layer as any)?._orbit ? `[Orbit ${(layer as any)._orbit}] ` : '') + (layer.name.replace(/ \(Part \d+\)$/, "") || layer.type)}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1 shrink-0 transition-opacity ${layer.isLocked || layer.isVisible === false ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newState = layer.isVisible === false ? true : false;
                        track.layers.forEach((l) => {
                          updateTimelineElement(l.id, { isVisible: newState });
                        });
                      }}
                      className={`p-1 hover:bg-white/10 rounded transition-colors ${layer.isVisible === false ? "text-slate-600" : "text-slate-400 hover:text-white"}`}
                      title={
                        layer.isVisible === false ? "Show Track" : "Hide Track"
                      }
                    >
                      {layer.isVisible === false ? (
                        <EyeOff className="w-3 h-3" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newState = !layer.isLocked;
                        track.layers.forEach((l) => {
                          updateTimelineElement(l.id, { isLocked: newState });
                        });
                      }}
                      className={`p-1 hover:bg-white/10 rounded transition-colors ${layer.isLocked ? "text-red-400 hover:text-red-300" : "text-slate-400 hover:text-white"}`}
                      title={layer.isLocked ? "Unlock Track" : "Lock Track"}
                    >
                      {layer.isLocked ? (
                        <Lock className="w-3 h-3" />
                      ) : (
                        <Unlock className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
            {tracks.length === 0 && (
              <div className="h-full flex items-center justify-center p-8 text-center">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  No active tracks
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: TRACK AREA + RULER */}
        <div
          className="flex-1 overflow-auto no-scrollbar bg-[#050b18]"
          onScroll={(e) => {
            if (leftSidebarRef.current) {
              leftSidebarRef.current.scrollTop = e.currentTarget.scrollTop;
            }
          }}
        >
          <div className="relative min-h-full w-max">
            {/* VIRTUAL SNAP GUIDE (NEON LINE) */}
            {snapLine !== null && (
              <div
                className="absolute top-0 bottom-0 w-px bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)] z-50 pointer-events-none"
                style={{ left: snapLine * pxPerMs }}
              />
            )}

            {/* TIME RULER */}
            <div
              ref={timelineRef}
              onMouseDown={handleScrub}
              className="h-8 border-b border-white/5 bg-[#0f172a]/30 sticky top-0 z-20 cursor-crosshair"
              style={{
                width: Math.max(timelineWidth, 1000),
                ...TIMELINE_GRID_STYLE,
              }}
            >
              {/* RULER TICKS (Simple logic for now) */}
              {Array.from({ length: Math.ceil(duration / 1000) + 1 }).map(
                (_, i) => (
                  <div
                    key={`tick-${i}`}
                    className="absolute top-0 flex flex-col items-center"
                    style={{ left: i * 1000 * pxPerMs }}
                  >
                    <div className="h-2 w-px bg-slate-700" />
                    <span className="text-[9px] font-mono text-slate-500 mt-1">
                      {i}s
                    </span>
                  </div>
                ),
              )}
            </div>

            {/* TRACKS GRID */}
            <div
              className="relative"
              style={{
                width: Math.max(timelineWidth, 1000),
                ...TIMELINE_GRID_STYLE,
              }}
            >
              {tracks.map((track) => (
                <div
                  key={`track-area-${track.id}`}
                  className="h-10 border-b border-white/5 relative group/track"
                >
                  {/* CLIPS IN TRACK */}
                  {track.layers.map((layer) => {
                    const sequence = layer.sequence || {
                      startTime: 0,
                      duration: 2000,
                    };
                    const layerKeyframes = layer.keyframes || [];

                    return (
                      <React.Fragment key={`frag-${layer.id}`}>
                        <m.div
                          key={`clip-${layer.id}`}
                          className={`absolute top-1 bottom-1 bg-[#0D99FF]/10 border ${selectedIds.has(layer.id) ? "border-white z-10 shadow-[0_0_10px_rgba(255,255,255,0.3)]" : "border-[#0D99FF]/20"} rounded-md backdrop-blur-sm transition-colors flex items-center px-1 overflow-visible group/seq ${activeTimelineTool === "razor" ? "cursor-cell hover:bg-[#0D99FF]/30" : "cursor-grab active:cursor-grabbing hover:bg-[#0D99FF]/20"} ${layer.isLocked ? "pointer-events-none opacity-50" : ""}`}
                          style={{
                            left: (sequence.startTime || 0) * pxPerMs,
                            width: (sequence.duration || 2000) * pxPerMs,
                          }}
                          onClick={(e) => {
                            if (
                              activeTimelineTool === "razor" &&
                              activeSectionId
                            ) {
                              e.stopPropagation();
                              if (
                                selectedIds.has(layer.id) &&
                                selectedIds.size > 1
                              ) {
                                // Split all selected elements exactly at playhead
                                selectedIds.forEach((id) => {
                                  const el = layers.find(
                                    (el) => el.id === id,
                                  );
                                  if (!el || el.isLocked) return;
                                  const start = el.sequence?.startTime || 0;
                                  const end =
                                    start + (el.sequence?.duration || 2000);
                                  if (playhead > start && playhead < end) {
                                    const elInfo = el as any;
                                    if (!elInfo._orbit) {
                                      useStore
                                        .getState()
                                        .splitElement(
                                          activeSectionId,
                                          el.id,
                                          playhead,
                                        );
                                    }
                                  }
                                });
                              } else {
                                // Ask Store to split this single element exactly at playhead
                                if (!layer.isLocked) {
                                  const elInfo = layer as any;
                                  if (elInfo._orbit) {
                                    console.warn("Splitting orbit layers is not supported");
                                  } else {
                                    useStore
                                      .getState()
                                      .splitElement(
                                        activeSectionId,
                                        layer.id,
                                        playhead,
                                      );
                                  }
                                }
                              }
                              setActiveTimelineTool("pointer");
                            } else if (activeTimelineTool === "pointer") {
                              e.stopPropagation();
                              const newSet = new Set(
                                e.shiftKey ? selectedIds : [],
                              );
                              if (newSet.has(layer.id)) newSet.delete(layer.id);
                              else newSet.add(layer.id);
                              setSelectedIds(newSet);
                            }
                          }}
                          onMouseDown={(e) => {
                            if (
                              activeTimelineTool === "razor" ||
                              layer.isLocked
                            )
                              return; // Don't drag if razor is active

                            e.stopPropagation();
                            const startX = e.clientX;
                            const origStart = sequence.startTime || 0;
                            const origDuration = sequence.duration || 2000;

                            const onMouseMove = (moveEvent: MouseEvent) => {
                              const deltaMs =
                                (moveEvent.clientX - startX) / pxPerMs;
                              let newStart = Math.max(0, origStart + deltaMs);

                              // MAGNET SNAPPING LOGIC
                              if (isSnappingEnabled) {
                                const snapRadiusMs = 100 / timelineZoom; // Adjust radius based on zoom
                                let closestSnap: number | null = null;
                                let minDiff = Infinity;
                                const currentEnd = newStart + origDuration;

                                for (const pt of snapPoints) {
                                  const diffStart = Math.abs(pt - newStart);
                                  const diffEnd = Math.abs(pt - currentEnd);

                                  if (
                                    diffStart < snapRadiusMs &&
                                    diffStart < minDiff
                                  ) {
                                    minDiff = diffStart;
                                    closestSnap = pt;
                                    newStart = pt;
                                  } else if (
                                    diffEnd < snapRadiusMs &&
                                    diffEnd < minDiff
                                  ) {
                                    minDiff = diffEnd;
                                    closestSnap = pt;
                                    newStart = pt - origDuration;
                                  }
                                }

                                setSnapLine(closestSnap);
                              }

                              updateTimelineElement(layer.id, {
                                sequence: { ...sequence, startTime: newStart }
                              });
                            };

                            const onMouseUp = () => {
                              setSnapLine(null); // Clear snap guide
                              window.removeEventListener(
                                "mousemove",
                                onMouseMove,
                              );
                              window.removeEventListener("mouseup", onMouseUp);
                            };

                            window.addEventListener("mousemove", onMouseMove);
                            window.addEventListener("mouseup", onMouseUp);
                          }}
                        >
                          <div className="w-1 h-full bg-[#0D99FF]/40 rounded-full mr-1 shrink-0" />

                          {/* RESIZE HANDLE (Left) */}
                          <div
                            className={`absolute left-0 top-0 bottom-0 w-2 hover:bg-[#0D99FF]/30 z-50 rounded-l-md ${activeTimelineTool === "razor" ? "cursor-cell" : "cursor-ew-resize"}`}
                            onMouseDown={(e) => {
                              if (
                                activeTimelineTool === "razor" ||
                                layer.isLocked
                              )
                                return;
                              e.stopPropagation();
                              const startX = e.clientX;
                              const origStart = sequence.startTime || 0;
                              const origDuration = sequence.duration || 2000;
                              const origEnd = origStart + origDuration;

                              const onMouseMove = (moveEvent: MouseEvent) => {
                                const deltaMs =
                                  (moveEvent.clientX - startX) / pxPerMs;
                                let newStart = Math.max(
                                  0,
                                  Math.min(origEnd - 100, origStart + deltaMs),
                                );

                                // MAGNET SNAPPING LOGIC (Left Edge)
                                if (isSnappingEnabled) {
                                  const snapRadiusMs = 100 / timelineZoom;
                                  let closestSnap: number | null = null;
                                  let minDiff = Infinity;
                                  for (const pt of snapPoints) {
                                    const diff = Math.abs(pt - newStart);
                                    if (diff < snapRadiusMs && diff < minDiff) {
                                      minDiff = diff;
                                      closestSnap = pt;
                                      newStart = Math.min(origEnd - 100, pt);
                                    }
                                  }
                                  setSnapLine(closestSnap);
                                }

                                const newDuration = origEnd - newStart;
                                updateTimelineElement(layer.id, {
                                  sequence: { ...sequence, startTime: newStart, duration: newDuration }
                                });
                              };

                              const onMouseUp = () => {
                                setSnapLine(null);
                                window.removeEventListener(
                                  "mousemove",
                                  onMouseMove,
                                );
                                window.removeEventListener(
                                  "mouseup",
                                  onMouseUp,
                                );
                              };

                              window.addEventListener("mousemove", onMouseMove);
                              window.addEventListener("mouseup", onMouseUp);
                            }}
                          />

                          {/* RESIZE HANDLE (Right) */}
                          <div
                            className={`absolute right-0 top-0 bottom-0 w-2 hover:bg-[#0D99FF]/30 z-50 rounded-r-md ${activeTimelineTool === "razor" ? "cursor-cell" : "cursor-ew-resize"}`}
                            onMouseDown={(e) => {
                              if (
                                activeTimelineTool === "razor" ||
                                layer.isLocked
                              )
                                return;
                              e.stopPropagation();
                              const startX = e.clientX;
                              const origStart = sequence.startTime || 0;
                              const origDuration = sequence.duration || 2000;

                              const onMouseMove = (moveEvent: MouseEvent) => {
                                const deltaMs =
                                  (moveEvent.clientX - startX) / pxPerMs;
                                let newDuration = Math.max(
                                  100,
                                  origDuration + deltaMs,
                                );

                                // MAGNET SNAPPING LOGIC (Right Edge)
                                if (isSnappingEnabled) {
                                  const snapRadiusMs = 100 / timelineZoom;
                                  let closestSnap: number | null = null;
                                  let minDiff = Infinity;
                                  const currentEnd = origStart + newDuration;

                                  for (const pt of snapPoints) {
                                    const diff = Math.abs(pt - currentEnd);
                                    if (diff < snapRadiusMs && diff < minDiff) {
                                      minDiff = diff;
                                      closestSnap = pt;
                                      newDuration = Math.max(
                                        100,
                                        pt - origStart,
                                      );
                                    }
                                  }
                                  setSnapLine(closestSnap);
                                }

                                updateTimelineElement(layer.id, {
                                  sequence: { ...sequence, duration: newDuration }
                                });
                              };

                              const onMouseUp = () => {
                                setSnapLine(null);
                                window.removeEventListener(
                                  "mousemove",
                                  onMouseMove,
                                );
                                window.removeEventListener(
                                  "mouseup",
                                  onMouseUp,
                                );
                              };

                              window.addEventListener("mousemove", onMouseMove);
                              window.addEventListener("mouseup", onMouseUp);
                            }}
                          />

                          {/* KEYFRAME MARKERS (Diamonds) */}
                          <div className="absolute inset-0 pointer-events-none">
                            {layerKeyframes.map((kf) => (
                              <div
                                key={kf.id}
                                className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#0D99FF] rotate-45 border border-white/20 shadow-[0_0_10px_rgba(13,153,255,0.5)] pointer-events-auto cursor-pointer hover:scale-125 transition-transform"
                                style={{ left: kf.time * pxPerMs }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPlayhead(kf.time);
                                }}
                              >
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#020617] text-white text-[8px] px-1.5 py-0.5 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                  {kf.property}:{" "}
                                  {typeof kf.value === "number"
                                    ? kf.value.toFixed(1)
                                    : kf.value}
                                </div>
                              </div>
                            ))}
                          </div>

                          <span className="text-[8px] font-black text-[#0D99FF]/30 uppercase truncate pointer-events-none">
                            {layer.name || layer.type}
                          </span>
                        </m.div>

                        {/* ADD KEYFRAME BUTTON ON HOVER */}
                        <button
                          onClick={() => {
                            const id = `kf-${Date.now()}`;
                            const startTime = layer.sequence?.startTime || 0;
                            const effectiveTime = Math.max(
                              0,
                              playhead - startTime,
                            );

                            useStore.getState().addKeyframe(layer.id, {
                              id,
                              time: effectiveTime,
                              property: "opacity",
                              value: 1,
                              easing: "ease-in-out",
                            });
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-white/5 opacity-0 group-hover/track:opacity-100 hover:bg-[#0D99FF]/20 rounded transition-all z-40"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#0D99FF]" />
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* PLAYHEAD */}
            <div
              className="absolute top-0 bottom-0 w-px bg-[#0D99FF] z-[100] cursor-ew-resize group/playhead hover:bg-white transition-colors"
              style={{ left: playhead * pxPerMs }}
              onMouseDown={(e) => {
                e.stopPropagation();
                const onMouseMove = (moveEvent: MouseEvent) => {
                  if (!timelineRef.current) return;
                  const rect = timelineRef.current.getBoundingClientRect();
                  const x = moveEvent.clientX;
                  const offsetX = x - rect.left;
                  const newTime = Math.max(
                    0,
                    Math.min(duration, offsetX / pxPerMs),
                  );
                  setPlayhead(newTime);
                };
                const onMouseUp = () => {
                  window.removeEventListener("mousemove", onMouseMove);
                  window.removeEventListener("mouseup", onMouseUp);
                };
                window.addEventListener("mousemove", onMouseMove);
                window.addEventListener("mouseup", onMouseUp);
              }}
            >
              <div className="absolute -top-1 -left-1.5 w-3 h-4 bg-[#0D99FF] group-hover/playhead:bg-white transition-colors rotate-45 border-2 border-[#020617] shadow-lg cursor-ew-resize pointer-events-none" />
              <div className="absolute inset-0 w-4 -left-2 bg-[#0D99FF]/5 group-hover/playhead:bg-white/10 blur-sm pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
