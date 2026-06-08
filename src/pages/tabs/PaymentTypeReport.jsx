import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Download, Loader2, FileText, FileSpreadsheet } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';
import { useReportFilters } from '../../contexts/ReportFilterContext';
import FilterBar from '../../components/FilterBar';
import { getRangeReport } from '../../api/reports';
import { exportCSV, exportPDF } from '../../utils/exportUtils';
import { SortArrow } from '../../utils/useSortable';

const PaymentTypeReport = () => {
    const { t } = useTranslation();
    const { tenantConfig } = useTenant();
    const { dateRange } = useReportFilters();
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState([]);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const exportRef = useRef(null);

    // ── Sort ──
    const [sortKey, setSortKey] = useState('');
    const [sortDir, setSortDir] = useState('asc');
    const handleSort = (key) => {
        setSortKey(prev => { if (prev === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); return prev; } setSortDir('asc'); return key; });
    };
    const PAY_SORT_GETTERS = {
        method: (p) => p.method || '',
        transactions: (p) => p.transactions || 0,
        amount: (p) => p.amount || 0,
        refundTrans: (p) => p.refundTrans || 0,
        refundAmount: (p) => p.refundAmount || 0,
        net: (p) => p.net || 0,
    };
    const sortedPayments = useMemo(() => {
        if (!sortKey) return payments;
        const getter = PAY_SORT_GETTERS[sortKey] || ((p) => p[sortKey]);
        return [...payments].sort((a, b) => {
            let va = getter(a); if (va == null) va = '';
            let vb = getter(b); if (vb == null) vb = '';
            if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
            return sortDir === 'asc' ? (va - vb) : (vb - va);
        });
    }, [payments, sortKey, sortDir]);

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    useEffect(() => {
        const handleClick = (e) => {
            if (exportRef.current && !exportRef.current.contains(e.target)) setShowExportMenu(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await getRangeReport(dateRange.start, dateRange.end);
            if (result.success) {
                const d = result.data;
                const totalRevenue = d.totalRevenue || 0;
                const totalRefunds = d.totalRefunds || 0;
                setPayments([{
                    method: t('report.cash', 'Cash'),
                    transactions: d.totalOrders || 0,
                    amount: totalRevenue,
                    refundTrans: 0,
                    refundAmount: totalRefunds,
                    net: totalRevenue - totalRefunds,
                }]);
            }
        } catch (err) {
            console.error('Failed to fetch payment types:', err);
        } finally {
            setLoading(false);
        }
    };

    const totals = payments.reduce((acc, p) => ({
        transactions: acc.transactions + p.transactions,
        amount: acc.amount + p.amount,
        refundTrans: acc.refundTrans + p.refundTrans,
        refundAmount: acc.refundAmount + p.refundAmount,
        net: acc.net + p.net,
    }), { transactions: 0, amount: 0, refundTrans: 0, refundAmount: 0, net: 0 });

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
                    <h3 style={{ fontSize: '1.1rem' }}>{t('report.payment_type', 'Payment Type')}</h3>
                    <div ref={exportRef} style={{ position: 'relative' }}>
                        <button onClick={() => setShowExportMenu(!showExportMenu)} style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Download size={14} /> {t('common.export', 'Export')}
                        </button>
                        {showExportMenu && (
                            <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 100, minWidth: '140px', overflow: 'hidden' }}>
                                <button onClick={() => { setShowExportMenu(false); exportCSV(
                                    [{label:t('report.payment_method', 'Payment Method'),value:'method'},{label:t('report.payment_transactions', 'Payment Transactions'),value:'transactions'},{label:t('report.payment_amount', 'Payment Amount'),value:(r)=>r.amount},{label:t('report.refund_transactions', 'Refund Transactions'),value:'refundTrans'},{label:t('report.refund_amount', 'Refund Amount'),value:(r)=>r.refundAmount},{label:t('report.net_amount', 'Net Amount'),value:(r)=>r.net}],
                                    payments, [], `payment_sales_${dateRange.start}_${dateRange.end}.csv`
                                )}} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left' }}
                                    onMouseEnter={e=>e.target.style.background='rgba(255,255,255,0.05)'} onMouseLeave={e=>e.target.style.background='transparent'}>
                                    <FileSpreadsheet size={16} color="#4ade80" /> CSV
                                </button>
                                <button onClick={() => { setShowExportMenu(false); exportPDF(
                                    t('report.payment_type', 'Payment Type'),
                                    [{label:t('report.payment_method', 'Payment Method'),value:'method'},{label:t('report.payment_transactions', 'Payment Transactions'),value:'transactions'},{label:t('report.payment_amount', 'Payment Amount'),value:(r)=>r.amount},{label:t('report.refund_transactions', 'Refund Transactions'),value:'refundTrans'},{label:t('report.refund_amount', 'Refund Amount'),value:(r)=>r.refundAmount},{label:t('report.net_amount', 'Net Amount'),value:(r)=>r.net}],
                                    payments, tenantConfig.currency
                                )}} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left' }}
                                    onMouseEnter={e=>e.target.style.background='rgba(255,255,255,0.05)'} onMouseLeave={e=>e.target.style.background='transparent'}>
                                    <FileText size={16} color="#f87171" /> PDF
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <th onClick={() => handleSort('method')} style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>{t('report.payment_method', 'Payment Method')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="method" /></th>
                                <th onClick={() => handleSort('transactions')} style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>{t('report.payment_transactions', 'Payment Transactions')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="transactions" /></th>
                                <th onClick={() => handleSort('amount')} style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>{t('report.payment_amount', 'Payment Amount')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="amount" /></th>
                                <th onClick={() => handleSort('refundTrans')} style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>{t('report.refund_transactions', 'Refund Transactions')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="refundTrans" /></th>
                                <th onClick={() => handleSort('refundAmount')} style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>{t('report.refund_amount', 'Refund Amount')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="refundAmount" /></th>
                                <th onClick={() => handleSort('net')} style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>{t('report.net_amount', 'Net Amount')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="net" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedPayments.map((p, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{p.method}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{p.transactions}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{tenantConfig.currency}{p.amount.toLocaleString()}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: p.refundTrans > 0 ? '#f87171' : 'inherit' }}>{p.refundTrans}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{tenantConfig.currency}{p.refundAmount.toLocaleString()}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>{tenantConfig.currency}{p.net.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr style={{ borderTop: '2px solid var(--glass-border)', fontWeight: 700 }}>
                                <td style={{ padding: '0.75rem 0.5rem' }}>{t('report.total', 'Total')}</td>
                                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{totals.transactions}</td>
                                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{tenantConfig.currency}{totals.amount.toLocaleString()}</td>
                                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{totals.refundTrans}</td>
                                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{tenantConfig.currency}{totals.refundAmount.toLocaleString()}</td>
                                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{tenantConfig.currency}{totals.net.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{t('common.page_info', { current: 1, total: 1 })}</span>
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

export default PaymentTypeReport;
