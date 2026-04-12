import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Maximize2, Minimize2 } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";

interface SortableChartCardProps {
  id: string;
  children: React.ReactNode;
  editMode?: boolean;
  className?: string;
}

const LS_KEY = "nfc_chart_sizes";

function loadSizes(): Record<string, { w: number; h: number }> {
  try {
    const s = localStorage.getItem(LS_KEY);
    return s ? JSON.parse(s) : {};
  } catch {
    return {};
  }
}

function saveSizes(sizes: Record<string, { w: number; h: number }>) {
  localStorage.setItem(LS_KEY, JSON.stringify(sizes));
}

export function resetChartSizes() {
  localStorage.removeItem(LS_KEY);
}

export function SortableChartCard({ id, children, className }: SortableChartCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const [customHeight, setCustomHeight] = useState<number | null>(() => {
    const sizes = loadSizes();
    return sizes[id]?.h ?? null;
  });
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{ startY: number; startH: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const h = cardRef.current?.getBoundingClientRect().height ?? 200;
    resizeRef.current = { startY: clientY, startH: h };
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!resizeRef.current) return;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const diff = clientY - resizeRef.current.startY;
      const newH = Math.max(120, resizeRef.current.startH + diff);
      setCustomHeight(newH);
    };
    const handleEnd = () => {
      setIsResizing(false);
      if (customHeight) {
        const sizes = loadSizes();
        sizes[id] = { w: 0, h: customHeight };
        saveSizes(sizes);
      }
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", handleEnd);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isResizing, customHeight, id]);

  const resetSize = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomHeight(null);
    const sizes = loadSizes();
    delete sizes[id];
    saveSizes(sizes);
  }, [id]);

  return (
    <div ref={setNodeRef} style={style} className={`relative group ${className ?? ""}`}>
      <div
        ref={cardRef}
        style={customHeight ? { height: customHeight, overflow: "auto" } : undefined}
      >
        <div {...attributes} {...listeners} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab touch-none z-10 flex items-center gap-1">
          {customHeight && (
            <button onClick={resetSize} className="p-0.5 hover:text-primary transition-colors" title="Reset size">
              <Minimize2 className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
          <GripVertical className="w-3 h-3 text-muted-foreground" />
        </div>
        {children}
      </div>
      {/* Resize handle at bottom */}
      <div
        className="absolute bottom-0 left-1/4 right-1/4 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center"
        onMouseDown={handleResizeStart}
        onTouchStart={handleResizeStart}
      >
        <div className="w-8 h-1 rounded-full bg-muted-foreground/30" />
      </div>
    </div>
  );
}
