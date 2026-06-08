import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Loader2, ChevronLeft, ChevronRight, Package, ArrowDown, ArrowUp, Search } from 'lucide-react';
import { getStockLedger } from '../../api/ledgers';
import { usePagination } from '../../utils/usePagination';
import { useTenant } from '../../contexts/TenantContext';
import { SortArrow } from '../../utils/useSortable';

const REASON_LABELS = {
    sale: 'report.sale', restock: 'report.restock', return: 'report.return_item',
    adjustment: 'report.adjustment', initial_stock: 'report.initial_stock',
    purchase_order: 'report.purchase_order', sale_composite: 'report.sale_composite',
    sale_variant: 'report.sale_variant'
};

const InventoryHistory = () => {
    const { t } = useTranslation();
    const { tenantConfig } = useTenant();
    const [ledger, setLedger] = useState([]);
    const [loading, setLoading] = useState(true);

    // Sort
    const [sortKey, setSortKey] = useState('');
    const [sortDir, setSortDir] = useState('asc');
    const handleSort = (key) => {
        setSortKey(prev => { if (prev === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); return prev; } setSortDir('asc'); return key; });
    };
    const sortedLedger = useMemo(() => {
        if (!sortKey) return ledger;
        const getters = {
            date: (l) => new Date(l.createdAt).getTime(),
            product: (l) => (l.productId?.name || ''),
            changeQty: (l) => l.changeQty,
            reason: (l) => l.reason || '',
        };
        const getter = getters[sortKey] || ((l) => l[sortKey]);
        return [...ledger].sort((a, b) => {
            let va = getter(a); if (va == null) va = '';
            let vb = getter(b); if (vb == null) vb = '';
            if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
            return sortDir === 'asc' ? (va - vb) : (vb - va);
        });
    }, [ledger, sortKey, sortDir]);

    const { page, setPage, pageSize, setPageSize, totalPages, pagedData } = usePagination(sortedLedger, 20);

    useEffect(() => { fetchLedger(); }, []);

    const fetchLedger = async () => {
        setLoading(true);
        try {
            const result = await getStockLedger({ limit: 500 });
            if (result.success) setLedger(result.data || []);
        } catch (err) {
            console.error('Failed to fetch stock ledger:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <Loader2 className="animate-spin" size={32} /> {t('common.loading')}
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{t('report.inventory_history', 'Inventory History')}</h2>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <th onClick={() => handleSort('date')} style={thStyle}>{t('report.date', 'Date')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="date" /></th>
                                <th onClick={() => handleSort('product')} style={thStyle}>{t('report.product', 'Product')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="product" /></th>
                                <th onClick={() => handleSort('changeQty')} style={{ ...thStyle, textAlign: 'right' }}>{t('report.qty_change', 'Qty Change')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="changeQty" /></th>
                                <th onClick={() => handleSort('reason')} style={thStyle}>{t('report.reason', 'Reason')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="reason" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagedData.map((entry, idx) => (
                                <tr key={entry._id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={tdStyle}>{new Date(entry.createdAt).toLocaleString()}</td>
                                    <td style={{ ...tdStyle, fontWeight: 600 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <Package size={14} /> {entry.productId?.name || '—'}
                                        </div>
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: entry.changeQty > 0 ? '#4ade80' : '#f87171', fontWeight: 600 }}>
                                            {entry.changeQty > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                                            {entry.changeQty > 0 ? '+' : ''}{entry.changeQty}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>{t(REASON_LABELS[entry.reason] || entry.reason, entry.reason || '—')}</td>
                                </tr>
                            ))}
                            {pagedData.length === 0 && (
                                <tr><td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>{t('common.no_data')}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{t('common.page_info', { current: page, total: totalPages })}</span>
                    <button onClick={() => setPage(page - 1)} disabled={page <= 1} style={btnStyle(page <= 1)}><ChevronLeft size={14} /></button>
                    <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} style={btnStyle(page >= totalPages)}><ChevronRight size={14} /></button>
                    <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} style={selectStyle}>
                        <option value={10}>10 {t('common.rows', 'Rows')}</option>
                        <option value={20}>20 {t('common.rows', 'Rows')}</option>
                        <option value={50}>50 {t('common.rows', 'Rows')}</option>
                        <option value={100}>100 {t('common.rows', 'Rows')}</option>
                    </select>
                </div>
            </div>
        </motion.div>
    );
};

const thStyle = { padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' };
const tdStyle = { padding: '0.75rem 0.5rem', whiteSpace: 'nowrap' };
const btnStyle = (disabled) => ({ padding: '0.2rem 0.4rem', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: disabled ? 'rgba(255,255,255,0.2)' : 'var(--text-muted)', cursor: disabled ? 'default' : 'pointer', display: 'flex', alignItems: 'center' });
const selectStyle = { background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)', padding: '0.3rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' };

export default InventoryHistory;
