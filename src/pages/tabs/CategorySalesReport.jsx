import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Download, Loader2, FileText, FileSpreadsheet } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';
import { useReportFilters } from '../../contexts/ReportFilterContext';
import FilterBar from '../../components/FilterBar';
import { getRangeReport } from '../../api/reports';
import { exportCSV, exportPDF } from '../../utils/exportUtils';

const CategorySalesReport = () => {
    const { t } = useTranslation();
    const { tenantConfig } = useTenant();
    const { dateRange } = useReportFilters();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const exportRef = useRef(null);

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
            if (result.success && result.data.categorySummary) {
                const mapped = result.data.categorySummary.map(c => ({
                    name: c.categoryName || 'Unknown',
                    qty: c.qty || 0,
                    netSales: c.revenue || 0,
                    cost: c.cost || 0,
                    margin: c.revenue ? (((c.revenue - (c.cost || 0)) / c.revenue) * 100).toFixed(1) : 0,
                }));
                setCategories(mapped);
            }
        } catch (err) {
            console.error('Failed to fetch category sales:', err);
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
                    <h3 style={{ fontSize: '1.1rem' }}>{t('report.category_sales', '類別銷售')}</h3>
                    <div ref={exportRef} style={{ position: 'relative' }}>
                        <button onClick={() => setShowExportMenu(!showExportMenu)} style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Download size={14} /> {t('common.export', '匯出')}
                        </button>
                        {showExportMenu && (
                            <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 100, minWidth: '140px', overflow: 'hidden' }}>
                                <button onClick={() => { setShowExportMenu(false); exportCSV(
                                    [{label:t('report.category','類別'),value:'name'},{label:t('report.qty_sold','售出商品'),value:'qty'},{label:t('report.net_sales','淨銷售額'),value:(r)=>r.netSales},{label:t('report.cost','銷售成本'),value:(r)=>r.cost},{label:t('report.gross_profit','毛利潤'),value:(r)=>r.netSales-r.cost},{label:t('report.profit_margin','利潤率'),value:(r)=>r.margin+'%'}],
                                    categories, [], `category_sales_${dateRange.start}_${dateRange.end}.csv`
                                )}} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', border: 'none', background: 'transparent', color: 'var(--text)', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left' }}
                                    onMouseEnter={e=>e.target.style.background='rgba(255,255,255,0.05)'} onMouseLeave={e=>e.target.style.background='transparent'}>
                                    <FileSpreadsheet size={16} color="#4ade80" /> CSV
                                </button>
                                <button onClick={() => { setShowExportMenu(false); exportPDF(
                                    t('report.category_sales','類別銷售'),
                                    [{label:t('report.category','類別'),value:'name'},{label:t('report.qty_sold','售出商品'),value:'qty'},{label:t('report.net_sales','淨銷售額'),value:(r)=>r.netSales},{label:t('report.cost','銷售成本'),value:(r)=>r.cost},{label:t('report.gross_profit','毛利潤'),value:(r)=>r.netSales-r.cost},{label:t('report.profit_margin','利潤率'),value:(r)=>r.margin+'%'}],
                                    categories, tenantConfig.currency
                                )}} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', border: 'none', background: 'transparent', color: 'var(--text)', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left' }}
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
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('report.category', '類別')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('report.qty_sold', '售出商品')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('report.net_sales', '淨銷售額')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('report.cost', '銷售成本')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('report.gross_profit', '毛利潤')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('report.profit_margin', '利潤率')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{cat.name}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{cat.qty}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{tenantConfig.currency}{cat.netSales.toLocaleString()}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{tenantConfig.currency}{cat.cost.toLocaleString()}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{tenantConfig.currency}{(cat.netSales - cat.cost).toLocaleString()}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#4ade80' }}>{cat.margin}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{t('common.page_info', { current: 1, total: Math.max(1, Math.ceil(categories.length / 10)) })}</span>
                    <select style={{ background: 'rgba(0,0,0,0.2)', border: 'none', color: 'var(--text-muted)', padding: '0.3rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                        <option>10 {t('common.rows', '行')}</option>
                        <option>25 {t('common.rows', '行')}</option>
                        <option>50 {t('common.rows', '行')}</option>
                    </select>
                </div>
            </div>
        </motion.div>
    );
};

export default CategorySalesReport;
