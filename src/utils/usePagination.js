import { useState, useMemo } from 'react';

/**
 * 通用分頁 Hook
 * @param {Array} data - 原始資料陣列
 * @param {number} defaultPageSize - 預設每頁筆數
 * @returns {{ page, setPage, pageSize, setPageSize, totalPages, pagedData }}
 */
export function usePagination(data = [], defaultPageSize = 10) {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(defaultPageSize);

    const totalPages = useMemo(() => Math.max(1, Math.ceil(data.length / pageSize)), [data, pageSize]);

    // 當資料或 pageSize 變更時，確保 page 不超出範圍
    const safePage = useMemo(() => Math.min(page, totalPages), [page, totalPages]);

    const pagedData = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return data.slice(start, start + pageSize);
    }, [data, safePage, pageSize]);

    const goToPage = (p) => {
        const target = Math.max(1, Math.min(p, totalPages));
        setPage(target);
    };

    const handlePageSizeChange = (newSize) => {
        setPageSize(newSize);
        setPage(1); // 切換每頁筆數時回到第一頁
    };

    return {
        page: safePage,
        setPage: goToPage,
        pageSize,
        setPageSize: handlePageSizeChange,
        totalPages,
        pagedData,
    };
}
