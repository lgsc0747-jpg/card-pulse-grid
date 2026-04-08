import { cn } from "@/lib/utils";

interface PublicPageNavProps {
  pages: { id: string; title: string; slug: string; is_homepage: boolean; page_icon: string | null }[];
  activePageId: string;
  onPageChange: (pageId: string) => void;
  accentColor: string;
  textColor: string;
}

export function PublicPageNav({ pages, activePageId, onPageChange, accentColor, textColor }: PublicPageNavProps) {
  if (pages.length <= 1) return null;

  return (
    <nav className="sticky top-0 z-30 backdrop-blur-xl border-b" style={{ borderColor: `${textColor}15`, backgroundColor: `${textColor}08` }}>
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
          {pages.map(page => (
            <button
              key={page.id}
              onClick={() => onPageChange(page.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                activePageId === page.id
                  ? "text-white"
                  : "opacity-60 hover:opacity-90"
              )}
              style={{
                backgroundColor: activePageId === page.id ? accentColor : "transparent",
                color: activePageId === page.id ? "#fff" : textColor,
              }}
            >
              {page.page_icon && <span>{page.page_icon}</span>}
              {page.title}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
