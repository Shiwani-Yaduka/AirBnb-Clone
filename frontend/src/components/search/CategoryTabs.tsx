import { CATEGORY_META } from "@/lib/constants";
import type { Category } from "@/lib/types";

const CATEGORIES = Object.keys(CATEGORY_META) as Category[];

interface CategoryTabsProps {
  selected: Category | null;
  onSelect: (category: Category | null) => void;
}

export function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  return (
    <div className="scrollbar-none flex gap-6 overflow-x-auto border-b border-line px-4 py-4 sm:px-8">
      <button
        onClick={() => onSelect(null)}
        className={`flex shrink-0 flex-col items-center gap-1.5 border-b-2 pb-2 text-xs font-medium transition ${
          selected === null ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-800"
        }`}
      >
        <span className="text-xl">🌐</span>
        All
      </button>
      {CATEGORIES.map((category) => {
        const meta = CATEGORY_META[category];
        const isActive = selected === category;
        return (
          <button
            key={category}
            onClick={() => onSelect(isActive ? null : category)}
            className={`flex shrink-0 flex-col items-center gap-1.5 border-b-2 pb-2 text-xs font-medium transition ${
              isActive ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <span className="text-xl">{meta.emoji}</span>
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}
