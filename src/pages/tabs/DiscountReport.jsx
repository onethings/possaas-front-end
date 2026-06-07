import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Download, Loader2 } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';
import FilterBar from '../../components/FilterBar';
import { getDiscounts } from '../../api/discounts';
import { SortArrow } from '../../utils/useSortable';

const DiscountReport = () => {
    const { t } = useTranslation();
    const { tenantConfig } = useTenant();
    const [loading, setLoading] = useState(true);
    const [discounts, setDiscounts] = useState([]);

    // ── Sort ──
    const [sortKey, setSortKey] = useState('');
    const [sortDir, setSortDir] = useState('asc');
    const handleSort = (key) => {
        setSortKey(prev => { if (prev === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); return prev; } setSortDir('asc'); return key; });
    };
    const DISC_SORT_GETTERS = {
        name: (d) => d.name || '',
        count: (d) => d.count || 0,
        amount: (d) => d.amount || 0,
    };
    const sortedDiscounts = useMemo(() => {
        if (!sortKey) return discounts;
        const getter = DISC_SORT_GETTERS[sortKey] || ((d) => d[sortKey]);
        return [...discounts].sort((a, b) => {
            let va = getter(a); if (va == null) va = '';
            let vb = getter(b); if (vb == null) vb = '';
            if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
            return sortDir === 'asc' ? (va - vb) : (vb - va);
        });
    }, [discounts, sortKey, sortDir]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await getDiscounts();
            if (result.success) {
                setDiscounts((result.data || []).map(d => ({
                    name: d.name || '—',
                    count: d.count || d.usageCount || 0,
                    amount: d.amount || d.totalDiscount || 0,
                })));
            }
        } catch (err) {
            console.error('Failed to fetch discounts:', err);
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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}
        >
            <FilterBar />

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>{t('report.discount_report', 'Discount Report')}</h3>
                    <button style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Download size={14} /> {t('common.export', 'Export')}
                    </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <th onClick={() => handleSort('name')} style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>{t('report.name', 'Name')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="name" /></th>
                                <th onClick={() => handleSort('count')} style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>{t('report.discount_applied', 'Discount Applied')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="count" /></th>
                                <th onClick={() => handleSort('amount')} style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>{t('report.discount_amount', 'Discount Amount')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="amount" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedDiscounts.map((d, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{d.name}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{d.count}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{tenantConfig.currency}{d.amount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{t('common.page_info', { current: 1, total: Math.max(1, Math.ceil(sortedDiscounts.length / 10)) })}</span>
                    <select style={{ background: 'rgba(0,0,0,0.2)', border: 'none', color: 'var(--text-muted)', padding: '0.3rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                        <option>10 {t('common.rows', 'Rows')}</option>
                        <option>25 {t('common.rows', 'Rows')}</option>
                        <option>50 {t('common.rows', 'Rows')}</option>
                    </select>
                </div>
            </div>
        </motion.div>
    );
};

export default DiscountReport;
