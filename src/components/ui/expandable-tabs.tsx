"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOnClickOutside } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface Tab {
  title: string;
  icon: LucideIcon;
  id: string; // Add id to associate tabs with view keys
  type?: never;
}

interface Separator {
  type: "separator";
  title?: never;
  icon?: never;
  id?: never;
}

type TabItem = Tab | Separator;

interface ExpandableTabsProps {
  tabs: TabItem[];
  activeTabId?: string | null; // Controlled mode with tab IDs
  className?: string;
  activeColor?: string;
  onChange?: (id: string | null) => void;
}

const buttonVariants = {
  initial: {
    gap: 0,
    paddingLeft: ".4rem",
    paddingRight: ".4rem",
  },
  animate: (isSelected: boolean) => ({
    gap: isSelected ? ".4rem" : 0,
    paddingLeft: isSelected ? ".75rem" : ".4rem",
    paddingRight: isSelected ? ".75rem" : ".4rem",
  }),
};

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

const transition = { delay: 0.1, type: "spring", bounce: 0, duration: 0.6 };

export function ExpandableTabs({
  tabs,
  activeTabId = null,
  className,
  activeColor = "text-primary",
  onChange,
}: ExpandableTabsProps) {
  // Find index of the active tab ID
  const activeIndex = React.useMemo(() => {
    if (!activeTabId) return null;
    const idx = tabs.findIndex(t => t.id === activeTabId);
    return idx !== -1 ? idx : null;
  }, [tabs, activeTabId]);

  const [selected, setSelected] = React.useState<number | null>(activeIndex);
  const outsideClickRef = React.useRef(null);

  // Sync selected index with activeTabId prop when it changes
  React.useEffect(() => {
    setSelected(activeIndex);
  }, [activeIndex]);

  useOnClickOutside(outsideClickRef, () => {
    setSelected(null);
    onChange?.(null);
  });

  const handleSelect = (index: number) => {
    const tab = tabs[index];
    if (tab && tab.id) {
      setSelected(index);
      onChange?.(tab.id);
    }
  };

  const Separator = () => (
    <div className="mx-1 h-[24px] w-[1.2px] bg-slate-200" aria-hidden="true" />
  );

  return (
    <div
      ref={outsideClickRef}
      className={cn(
        "flex flex-nowrap items-center gap-1 rounded-2xl border bg-white p-1 shadow-xs border-slate-200",
        className
      )}
    >
      {tabs.map((tab, index) => {
        if (tab.type === "separator") {
          return <Separator key={`separator-${index}`} />;
        }

        const Icon = tab.icon;
        const isSelected = selected === index;
        return (
          <motion.button
            key={tab.title}
            variants={buttonVariants}
            initial={false}
            animate="animate"
            custom={isSelected}
            onClick={() => handleSelect(index)}
            transition={transition}
            className={cn(
              "relative flex items-center rounded-xl px-2 py-1 md:px-2.5 md:py-1.5 text-[11px] md:text-xs font-bold transition-colors duration-250 cursor-pointer select-none",
              isSelected
                ? cn("bg-slate-100", activeColor)
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            )}
          >
            <Icon size={20} />
            <AnimatePresence initial={false}>
              {isSelected && (
                <motion.span
                  variants={spanVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="overflow-hidden whitespace-nowrap text-xs md:text-sm font-extrabold pr-1"
                >
                  {tab.title}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
