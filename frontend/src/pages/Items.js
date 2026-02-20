import React, { useEffect, useRef, useCallback, useState, forwardRef } from 'react';
import { List as VirtualList } from 'react-window';
import { Link } from 'react-router-dom';
import { useData } from '../state/DataContext';

const ROW_HEIGHT = 52;
const LIST_HEIGHT = 520;

const ItemRow = forwardRef(({ index, style, data }, ref) => {
  const item = data[index];
  if (!item) return null;
  return (
    <div ref={ref} style={{ ...style, display: 'flex', alignItems: 'center', padding: '0 16px', boxSizing: 'border-box', overflow: 'hidden' }} role="listitem">
      <Link
        to={`/items/${item.id}`}
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          textDecoration: 'none',
          color: 'inherit',
          height: '100%',
          borderBottom: '1px solid #eee',
          padding: '0 4px',
        }}
      >
        <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 12 }}>{item.name}</span>
        <span style={{ color: '#666', fontSize: 14, flexShrink: 0, whiteSpace: 'nowrap' }}>
          {item.category} &middot; ${item.price}
        </span>
      </Link>
    </div>
  );
});

function Items() {
  const {
    items,
    total,
    page,
    totalPages,
    loading,
    error,
    query,
    fetchItems,
    setQuery,
    setPage,
  } = useData();

  const [searchInput, setSearchInput] = useState('');
  const debounceRef = useRef(null);

  const handleSearch = useCallback(
    (value) => {
      setSearchInput(value);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setQuery(value);
      }, 300);
    },
    [setQuery],
  );

  useEffect(() => {
    fetchItems(page, query);
  }, [page, query, fetchItems]);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  return (
    <div style={{ padding: 16, maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Items</h1>

      <input
        type="search"
        aria-label="Search items"
        placeholder="Search by name…"
        value={searchInput}
        onChange={(e) => handleSearch(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 14px',
          fontSize: 16,
          border: '1px solid #ccc',
          borderRadius: 6,
          marginBottom: 16,
          boxSizing: 'border-box',
        }}
      />

      {error && (
        <p role="alert" style={{ color: '#d32f2f', marginBottom: 12 }}>
          Something went wrong: {error}
        </p>
      )}

      {loading && items.length === 0 && (
        <div aria-busy="true" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: ROW_HEIGHT - 12,
                borderRadius: 4,
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
          ))}
          <style>{`@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <p style={{ color: '#666', textAlign: 'center', marginTop: 32 }}>
          No items found{query ? ` matching "${query}"` : ''}.
        </p>
      )}

      {items.length > 0 && (
        <div role="list" aria-label="Items list" style={{ border: '1px solid #eee', borderRadius: 6, marginBottom: 16, height: Math.min(LIST_HEIGHT, items.length * ROW_HEIGHT), overflow: 'hidden' }}>
          <VirtualList
            rowComponent={ItemRow}
            rowCount={items.length}
            rowHeight={ROW_HEIGHT}
            rowProps={{ data: items }}
          />
        </div>
      )}

      {totalPages > 1 && (
        <nav aria-label="Pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 8 }}>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
            style={paginationButtonStyle}
          >
            &larr; Prev
          </button>

          <span style={{ fontSize: 14, color: '#555' }}>
            Page {page} of {totalPages} &middot; {total} items
          </span>

          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
            style={paginationButtonStyle}
          >
            Next &rarr;
          </button>
        </nav>
      )}
    </div>
  );
}

const paginationButtonStyle = {
  padding: '8px 16px',
  fontSize: 14,
  border: '1px solid #ccc',
  borderRadius: 4,
  background: '#fff',
  cursor: 'pointer',
};

export default Items;
