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

const EmployeeSalesReport = () => {
    const { t } = useTranslation();
    const { tenantConfig } = useTenant();
    const { dateRange } = useReportFilters();
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const exportRef = useRef(null);

    // ── Sort ──
    const [sortKey, setSortKey] = useState('');
    const [sortDir, setSortDir] = useState('asc');
    const handleSort = (key) => {
        setSortKey(prev => { if (prev === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); return prev; } setSortDir('asc'); return key; });
    };
    const EMP_SORT_GETTERS = {
        name: (e) => e.name || '',
        totalSales: (e) => e.totalSales || 0,
        refund: (e) => e.refund || 0,
        discount: (e) => e.discount || 0,
        netSales: (e) => e.netSales || 0,
        receipts: (e) => e.receipts || 0,
        avgSale: (e) => e.avgSale || 0,
        registeredCustomers: (e) => e.registeredCustomers || 0,
    };
    const sortedEmployees = useMemo(() => {
        if (!sortKey) return employees;
        const getter = EMP_SORT_GETTERS[sortKey] || ((e) => e[sortKey]);
        return [...employees].sort((a, b) => {
            let va = getter(a); if (va == null) va = '';
            let vb = getter(b); if (vb == null) vb = '';
            if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
            return sortDir === 'asc' ? (va - vb) : (vb - va);
        });
    }, [employees, sortKey, sortDir]);

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
            if (result.success && result.data.staffPerformance) {
                const mapped = result.data.staffPerformance.map(s => ({
                    name: s.staffName || 'Unknown',
                    totalSales: s.revenue || 0,
                    refund: 0,
                    discount: 0,
                    netSales: s.revenue || 0,
                    receipts: s.orderCount || 0,
                    avgSale: s.orderCount ? Math.round((s.revenue || 0) / s.orderCount) : 0,
                    registeredCustomers: 0,
                }));
                setEmployees(mapped);
            }
        } catch (err) {
            console.error('Failed to fetch employee sales:', err);
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
                    <h3 style={{ fontSize: '1.1rem' }}>{t('report.employee_sales', 'Employee Sales')}</h3>
                    <div ref={exportRef} style={{ position: 'relative' }}>
                        <button onClick={() => setShowExportMenu(!showExportMenu)} style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Download size={14} /> {t('common.export', 'Export')}
                        </button>
                        {showExportMenu && (
                            <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 100, minWidth: '140px', overflow: 'hidden' }}>
                                <button onClick={() => { setShowExportMenu(false); exportCSV(
                                    [{label:t('report.employee_name', 'Employee Name'),value:'name'},{label:t('report.total_sales', 'Total Sales'),value:(r)=>r.totalSales},{label:t('report.net_sales', 'Net Sales'),value:(r)=>r.netSales},{label:t('report.receipts', 'Receipts'),value:'receipts'},{label:t('report.avg_sale', 'Avg Sale'),value:(r)=>r.avgSale}],
                                    employees, [], `employee_sales_${dateRange.start}_${dateRange.end}.csv`
                                )}} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left' }}
                                    onMouseEnter={e=>e.target.style.background='rgba(255,255,255,0.05)'} onMouseLeave={e=>e.target.style.background='transparent'}>
                                    <FileSpreadsheet size={16} color="#4ade80" /> CSV
                                </button>
                                <button onClick={() => { setShowExportMenu(false); exportPDF(
                                    t('report.employee_sales', 'Employee Sales'),
                                    [{label:t('report.employee_name', 'Employee Name'),value:'name'},{label:t('report.total_sales', 'Total Sales'),value:(r)=>r.totalSales},{label:t('report.net_sales', 'Net Sales'),value:(r)=>r.netSales},{label:t('report.receipts', 'Receipts'),value:'receipts'},{label:t('report.avg_sale', 'Avg Sale'),value:(r)=>r.avgSale}],
                                    employees, tenantConfig.currency
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
                                <th onClick={() => handleSort('name')} style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>{t('report.employee_name', 'Employee Name')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="name" /></th>
                                <th onClick={() => handleSort('totalSales')} style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>{t('report.total_sales', 'Total Sales')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="totalSales" /></th>
                                <th onClick={() => handleSort('refund')} style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>{t('report.refund', 'Refund')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="refund" /></th>
                                <th onClick={() => handleSort('discount')} style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>{t('report.discount', 'Discount')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="discount" /></th>
                                <th onClick={() => handleSort('netSales')} style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>{t('report.net_sales', 'Net Sales')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="netSales" /></th>
                                <th onClick={() => handleSort('receipts')} style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>{t('report.receipts', 'Receipts')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="receipts" /></th>
                                <th onClick={() => handleSort('avgSale')} style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>{t('report.avg_sale', 'Avg Sale')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="avgSale" /></th>
                                <th onClick={() => handleSort('registeredCustomers')} style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>{t('report.registered_customers', 'Registered Customers')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="registeredCustomers" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedEmployees.map((emp, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{emp.name}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{tenantConfig.currency}{emp.totalSales.toLocaleString()}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: emp.refund > 0 ? '#f87171' : 'inherit' }}>{tenantConfig.currency}{emp.refund.toLocaleString()}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{tenantConfig.currency}{emp.discount.toLocaleString()}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>{tenantConfig.currency}{emp.netSales.toLocaleString()}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{emp.receipts}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{tenantConfig.currency}{emp.avgSale.toLocaleString()}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{emp.registeredCustomers}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{t('common.page_info', { current: 1, total: Math.max(1, Math.ceil(sortedEmployees.length / 10)) })}</span>
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

export default EmployeeSalesReport;
