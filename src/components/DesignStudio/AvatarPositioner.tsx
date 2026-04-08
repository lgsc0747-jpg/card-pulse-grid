import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Move, RotateCcw } from "lucide-react";

interface AvatarPosition {
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  scale: number; // 100 = normal
}

interface AvatarPositionerProps {
  src: string;
  position: AvatarPosition;
  onPositionChange: (pos: AvatarPosition) => void;
}

const DEFAULT_POSITION: AvatarPosition = { x: 50, y: 50, scale: 100 };

export function AvatarPositioner({ src, position, onPositionChange }: AvatarPositionerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const startRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(true);
    startRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [position.x, position.y]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - startRef.current.x) / rect.width) * 100;
    const dy = ((e.clientY - startRef.current.y) / rect.height) * 100;
    const newX = Math.max(0, Math.min(100, startRef.current.posX - dx));
    const newY = Math.max(0, Math.min(100, startRef.current.posY - dy));
    onPositionChange({ ...position, x: Math.round(newX), y: Math.round(newY) });
  }, [dragging, position, onPositionChange]);

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -5 : 5;
    const newScale = Math.max(100, Math.min(300, position.scale + delta));
    onPositionChange({ ...position, scale: newScale });
  }, [position, onPositionChange]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !showControls) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel, showControls]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Avatar Position</Label>
        <button
          type="button"
          className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
          onClick={() => setShowControls(!showControls)}
        >
          <Move className="w-3 h-3" />
          {showControls ? "Done" : "Adjust"}
        </button>
      </div>

      {showControls && (
        <div className="space-y-2">
          <div
            ref={containerRef}
            className="relative w-full h-32 rounded-xl overflow-hidden border-2 border-dashed border-primary/40 cursor-grab active:cursor-grabbing select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <img
              src={src}
              alt="Avatar"
              className="w-full h-full pointer-events-none"
              draggable={false}
              style={{
                objectFit: "cover",
                objectPosition: `${position.x}% ${position.y}%`,
                transform: `scale(${position.scale / 100})`,
                transformOrigin: `${position.x}% ${position.y}%`,
              }}
            />
            {/* Crosshair overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-2 border-white/50 shadow-lg" />
            </div>
            <div className="absolute bottom-1 left-1 right-1 text-center">
              <span className="text-[9px] bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                Drag to reposition • Scroll to zoom ({position.scale}%)
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              Position: {position.x}%, {position.y}%
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-[10px] gap-1"
              onClick={() => onPositionChange(DEFAULT_POSITION)}
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function getAvatarPosition(personaId: string): AvatarPosition {
  try {
    const stored = localStorage.getItem(`avatar_pos_${personaId}`);
    return stored ? JSON.parse(stored) : DEFAULT_POSITION;
  } catch {
    return DEFAULT_POSITION;
  }
}

export function saveAvatarPosition(personaId: string, pos: AvatarPosition) {
  localStorage.setItem(`avatar_pos_${personaId}`, JSON.stringify(pos));
}
