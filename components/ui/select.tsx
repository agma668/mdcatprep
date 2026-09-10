"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  useMemo,
} from "react";
import { ChevronDown, Loader2, Search, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SelectSize = "sm" | "md" | "lg";

export interface SelectOption {
  /** Unique value for the option */
  value: string;
  /** Display label */
  label: string;
  /** Whether this option is disabled */
  disabled?: boolean;
}

export interface SelectProps {
  /** List of available options */
  options: SelectOption[];
  /** Currently selected value (controlled mode) */
  value?: string;
  /** Default selected value (uncontrolled mode) */
  defaultValue?: string;
  /** Callback fired when the selection changes */
  onChange?: (value: string) => void;
  /** Size variant */
  size?: SelectSize;
  /** Placeholder text shown when nothing is selected */
  placeholder?: string;
  /** Label rendered above the trigger */
  label?: React.ReactNode;
  /** Supporting description below the label */
  description?: React.ReactNode;
  /** Error message below the trigger */
  error?: React.ReactNode;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Whether to show a loading spinner */
  loading?: boolean;
  /** Enable type-ahead filtering inside the dropdown */
  searchable?: boolean;
  /** HTML name attribute (a hidden input carries the value for forms) */
  name?: string;
  /** Additional class names for the root wrapper */
  className?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const sizeConfig: Record<
  SelectSize,
  { trigger: string; text: string; icon: string; option: string; desc: string }
> = {
  sm: {
    trigger: "h-8 px-3",
    text: "text-sm",
    icon: "h-3.5 w-3.5",
    option: "px-3 py-1.5",
    desc: "text-xs",
  },
  md: {
    trigger: "h-10 px-3.5",
    text: "text-sm",
    icon: "h-4 w-4",
    option: "px-3.5 py-2",
    desc: "text-xs",
  },
  lg: {
    trigger: "h-12 px-4",
    text: "text-base",
    icon: "h-5 w-5",
    option: "px-4 py-2.5",
    desc: "text-sm",
  },
};

const dropdownVariants = {
  hidden: { opacity: 0, y: -4, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

// ---------------------------------------------------------------------------
// Select
// ---------------------------------------------------------------------------

export function Select({
  options,
  value,
  defaultValue,
  onChange,
  size = "md",
  placeholder = "Select an option",
  label,
  description,
  error,
  disabled = false,
  loading = false,
  searchable = false,
  name,
  className = "",
}: SelectProps) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState("");

  const isControlled = typeof value === "string";
  const selectedValue = isControlled ? value : internalValue;

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery) return options;
    const query = searchQuery.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(query));
  }, [options, searchable, searchQuery]);

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  // -- Close on click outside --
  useEffect(() => {
    if (!isOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isOpen]);

  // -- Focus search input when dropdown opens --
  useEffect(() => {
    if (isOpen && searchable) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [isOpen, searchable]);

  // -- Scroll highlighted option into view --
  const scrollToIndex = useCallback((index: number) => {
    if (!listRef.current) return;
    const items =
      listRef.current.querySelectorAll<HTMLLIElement>('[role="option"]');
    items[index]?.scrollIntoView({ block: "nearest" });
  }, []);

  // -- Select an option --
  const selectOption = useCallback(
    (opt: SelectOption) => {
      if (opt.disabled) return;
      if (!isControlled) {
        setInternalValue(opt.value);
      }
      onChange?.(opt.value);
      setIsOpen(false);
      setSearchQuery("");
      triggerRef.current?.focus();
    },
    [isControlled, onChange],
  );

  // -- Search handler --
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setHighlightedIndex(0);
  };

  // -- Find next enabled index in a direction --
  const findEnabledIndex = useCallback(
    (start: number, direction: 1 | -1): number => {
      const len = filteredOptions.length;
      if (len === 0) return -1;
      let idx = start;
      let attempts = 0;
      while (attempts < len) {
        if (!filteredOptions[idx]?.disabled) return idx;
        idx = (idx + direction + len) % len;
        attempts++;
      }
      return -1;
    },
    [filteredOptions],
  );

  // -- Keyboard handling --
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled || loading) return;

      if (!isOpen) {
        if (
          e.key === "ArrowDown" ||
          e.key === "ArrowUp" ||
          e.key === "Enter" ||
          e.key === " "
        ) {
          e.preventDefault();
          setIsOpen(true);
          const startIdx =
            e.key === "ArrowUp" ? filteredOptions.length - 1 : 0;
          setHighlightedIndex(findEnabledIndex(startIdx, 1));
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          const next = (highlightedIndex + 1) % filteredOptions.length;
          const idx = findEnabledIndex(next, 1);
          setHighlightedIndex(idx);
          scrollToIndex(idx);
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const prev =
            (highlightedIndex - 1 + filteredOptions.length) %
            filteredOptions.length;
          const idx = findEnabledIndex(prev, -1);
          setHighlightedIndex(idx);
          scrollToIndex(idx);
          break;
        }
        case "Enter": {
          e.preventDefault();
          if (
            highlightedIndex >= 0 &&
            highlightedIndex < filteredOptions.length
          ) {
            selectOption(filteredOptions[highlightedIndex]);
          }
          break;
        }
        case " ": {
          if (!searchable) {
            e.preventDefault();
            if (
              highlightedIndex >= 0 &&
              highlightedIndex < filteredOptions.length
            ) {
              selectOption(filteredOptions[highlightedIndex]);
            }
          }
          break;
        }
        case "Escape": {
          e.preventDefault();
          setIsOpen(false);
          setSearchQuery("");
          triggerRef.current?.focus();
          break;
        }
        case "Tab": {
          setIsOpen(false);
          setSearchQuery("");
          break;
        }
        case "Home": {
          e.preventDefault();
          const first = findEnabledIndex(0, 1);
          setHighlightedIndex(first);
          scrollToIndex(first);
          break;
        }
        case "End": {
          e.preventDefault();
          const last = findEnabledIndex(filteredOptions.length - 1, -1);
          setHighlightedIndex(last);
          scrollToIndex(last);
          break;
        }
      }
    },
    [
      disabled,
      loading,
      isOpen,
      highlightedIndex,
      filteredOptions,
      searchable,
      findEnabledIndex,
      selectOption,
      scrollToIndex,
    ],
  );

  // -- Toggle open --
  const toggleOpen = () => {
    if (disabled || loading) return;
    if (!isOpen) {
      const idx = filteredOptions.findIndex(
        (opt) => opt.value === selectedValue,
      );
      setHighlightedIndex(idx >= 0 ? idx : 0);
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  const { trigger, text, icon, option: optionCls, desc: descCls } =
    sizeConfig[size];
  const labelId = label ? `${id}-label` : undefined;
  const descriptionId = description ? `${id}-desc` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const listboxId = `${id}-listbox`;

  const triggerBorder = error
    ? "border-rose-400 dark:border-rose-500"
    : isOpen
      ? "border-navy dark:border-gold"
      : "border-white/10 dark:border-slate-600 hover:border-navy/50 dark:hover:border-slate-400";

  const ariaDescribedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  const activeDescendant =
    isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]
      ? `${id}-option-${filteredOptions[highlightedIndex].value}`
      : undefined;

  return (
    <div ref={containerRef} className={`flex flex-col gap-1.5 ${className}`}>
      {/* Label */}
      {label && (
        <label
          id={labelId}
          htmlFor={`${id}-trigger`}
          className={`${text} font-medium text-navy dark:text-white`}
        >
          {label}
        </label>
      )}

      {/* Description */}
      {description && (
        <span
          id={descriptionId}
          className={`${descCls} text-slate-500 dark:text-slate-400`}
        >
          {description}
        </span>
      )}

      {/* Hidden input for form submission */}
      {name && <input type="hidden" name={name} value={selectedValue} />}

      {/* Trigger + Dropdown wrapper */}
      <div className="relative" onKeyDown={handleKeyDown}>
        <button
          ref={triggerRef}
          type="button"
          id={`${id}-trigger`}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-labelledby={labelId}
          aria-describedby={ariaDescribedBy}
          aria-activedescendant={activeDescendant}
          aria-invalid={error ? true : undefined}
          disabled={disabled}
          onClick={toggleOpen}
          className={`w-full ${trigger} ${text} rounded-lg border bg-[#141414] flex items-center justify-between gap-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 ${
            error
              ? "focus-visible:ring-rose-200 dark:focus-visible:ring-rose-800"
              : "focus-visible:ring-navy/20 dark:focus-visible:ring-slate-400/20"
          } ${triggerBorder} ${
            disabled
              ? "cursor-not-allowed bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
              : "cursor-pointer"
          }`}
        >
          <span
            className={`truncate ${
              selectedOption
                ? "text-navy dark:text-white"
                : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {selectedOption?.label ?? placeholder}
          </span>
          {loading ? (
            <Loader2
              className={`${icon} text-slate-400 animate-spin flex-shrink-0`}
              aria-hidden="true"
            />
          ) : (
            <ChevronDown
              className={`${icon} text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          )}
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="absolute z-50 mt-1 w-full rounded-lg border border-white/10 bg-[#141414] shadow-lg"
            >
              {/* Search */}
              {searchable && (
                <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <Search
                    className="h-4 w-4 text-slate-400 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search…"
                    className="w-full bg-transparent text-sm text-navy dark:text-white placeholder:text-slate-400 focus:outline-none"
                    aria-autocomplete="list"
                    aria-controls={listboxId}
                  />
                </div>
              )}

              {/* Option list */}
              <ul
                ref={listRef}
                id={listboxId}
                role="listbox"
                aria-labelledby={labelId}
                className="max-h-60 overflow-y-auto py-1"
              >
                {filteredOptions.length === 0 ? (
                  <li
                    className={`${optionCls} ${text} text-slate-400 dark:text-slate-500 text-center select-none`}
                  >
                    No options found
                  </li>
                ) : (
                  filteredOptions.map((opt, index) => {
                    const isSelected = opt.value === selectedValue;
                    const isHighlighted = index === highlightedIndex;

                    return (
                      <li
                        key={opt.value}
                        id={`${id}-option-${opt.value}`}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={opt.disabled || undefined}
                        onMouseEnter={() =>
                          !opt.disabled && setHighlightedIndex(index)
                        }
                        onClick={() => selectOption(opt)}
                        className={`${optionCls} ${text} flex items-center justify-between gap-2 transition-colors duration-100 select-none ${
                          opt.disabled
                            ? "text-slate-300 cursor-not-allowed dark:text-slate-600"
                            : isHighlighted
                              ? "bg-slate-100 text-navy dark:bg-slate-800 dark:text-white cursor-pointer"
                              : "text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        <span className="truncate">{opt.label}</span>
                        {isSelected && (
                          <Check
                            className={`${icon} text-navy dark:text-gold flex-shrink-0`}
                            aria-hidden="true"
                          />
                        )}
                      </li>
                    );
                  })
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error */}
      {error && (
        <span id={errorId} className="text-xs text-rose-500 dark:text-rose-400">
          {error}
        </span>
      )}
    </div>
  );
}

export default Select;
