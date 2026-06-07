import { useState, useMemo, useCallback } from 'react';

/**
 * Shared sort hook for report tables.
 * @param {Array} data - The data array to sort
 * @param {Object} options
 * @param {string} [options.defaultKey] - Initial sort column key
 * @param {'asc'|'desc'} [options.defaultDir='asc'] - Initial sort direction
 * @param {Object} [options.getters] - Map of column key → value getter function
 * @returns {{ sortedData: Array, sortKey: string, sortDir: string, handleSort: (key: string) => void }}
 */
export function useSortable(data, options = {}) {
    const { defaultKey = '', defaultDir = 'asc', getters = {} } = options;

    const [sortKey, setSortKey] = useState(defaultKey);
    const [sortDir, setSortDir] = useState(defaultDir);

    const handleSort = useCallback((key) => {
        setSortKey(prev => {
            if (prev === key) {
                setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
                return prev;
            }
            setSortDir('asc');
            return key;
        });
    }, []);

    const sortedData = useMemo(() => {
        if (!sortKey || !data || !data.length) return data;
        const getter = getters[sortKey] || ((item) => item[sortKey]);
        return [...data].sort((a, b) => {
            let va = getter(a);
            let vb = getter(b);
            if (va == null) va = '';
            if (vb == null) vb = '';
            if (typeof va === 'string') {
                return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
            }
            return sortDir === 'asc' ? (va - vb) : (vb - va);
        });
    }, [data, sortKey, sortDir, getters]);

    return { sortedData, sortKey, sortDir, handleSort };
}

/**
 * Renders a sort arrow icon for table headers.
 * @param {{ sortKey: string, sortDir: string, colKey: string }} props
 */
export function SortArrow({ sortKey, sortDir, colKey, size = 12 }) {
    const isActive = sortKey === colKey;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', marginLeft: '2px',
            color: isActive ? 'var(--primary-light)' : 'var(--text-muted)',
            fontSize: `${size}px`, opacity: isActive ? 1 : 0.3,
            transition: 'opacity 0.15s', verticalAlign: 'middle',
        }}>
            {isActive && sortDir === 'asc' ? '▲' : '▼'}
        </span>
    );
}
