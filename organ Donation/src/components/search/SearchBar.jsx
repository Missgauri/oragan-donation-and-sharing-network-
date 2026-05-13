import React, { useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

/**
 * SearchBar
 *
 * Reusable search input with clear button and optional loading state.
 *
 * @param {string}   value        - controlled value
 * @param {Function} onChange     - (value: string) => void
 * @param {string}   placeholder  - input placeholder text
 * @param {boolean}  loading      - shows spinner instead of search icon
 * @param {boolean}  autoFocus    - focus on mount
 * @param {string}   size         - 'sm' | 'md' | 'lg'
 * @param {string}   className    - extra wrapper classes
 */
const SIZE_MAP = {
  sm: { wrap: 'h-9',  icon: 14, text: 'text-sm',  pl: 'pl-8',  pr: 'pr-8'  },
  md: { wrap: 'h-11', icon: 16, text: 'text-sm',  pl: 'pl-10', pr: 'pr-10' },
  lg: { wrap: 'h-12', icon: 18, text: 'text-base',pl: 'pl-11', pr: 'pr-11' },
};

const SearchBar = ({
  value = '',
  onChange,
  placeholder = 'Search donors, organs, locations…',
  loading = false,
  autoFocus = false,
  size = 'md',
  className = '',
}) => {
  const inputRef = useRef(null);
  const s = SIZE_MAP[size] || SIZE_MAP.md;

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Left icon */}
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        {loading
          ? <Loader2 size={s.icon} className="animate-spin text-blue-500" aria-hidden="true" />
          : <Search  size={s.icon} aria-hidden="true" />
        }
      </span>

      <input
        ref={inputRef}
        type="search"
        role="searchbox"
        aria-label={placeholder}
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full ${s.wrap} ${s.pl} ${s.pr} ${s.text}
          bg-white border border-slate-200 rounded-xl
          text-slate-800 placeholder:text-slate-400
          transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          hover:border-slate-300
        `}
      />

      {/* Clear button */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Clear search"
        >
          <X size={s.icon - 2} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
