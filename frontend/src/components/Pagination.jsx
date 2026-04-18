/**
 * Pagination — numbered page controls
 */

import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;

  const getRange = () => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) {
      range.push(i);
    }
    return range;
  };

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="p-2 rounded-lg border border-dark-200 text-dark-600 hover:bg-dark-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <FiChevronLeft size={16} />
      </button>

      {page > 3 && (
        <>
          <PageBtn n={1} current={page} onChange={onPageChange} />
          {page > 4 && <span className="text-dark-400 text-sm px-1">…</span>}
        </>
      )}

      {getRange().map((n) => (
        <PageBtn key={n} n={n} current={page} onChange={onPageChange} />
      ))}

      {page < pages - 2 && (
        <>
          {page < pages - 3 && <span className="text-dark-400 text-sm px-1">…</span>}
          <PageBtn n={pages} current={page} onChange={onPageChange} />
        </>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        className="p-2 rounded-lg border border-dark-200 text-dark-600 hover:bg-dark-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <FiChevronRight size={16} />
      </button>
    </div>
  );
}

function PageBtn({ n, current, onChange }) {
  return (
    <button
      onClick={() => onChange(n)}
      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
        n === current
          ? 'bg-dark-900 text-white'
          : 'border border-dark-200 text-dark-600 hover:bg-dark-50'
      }`}
    >
      {n}
    </button>
  );
}
