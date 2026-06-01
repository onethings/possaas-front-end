import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
    TrendingUp, DollarSign, Loader2, Download, FileText, FileSpreadsheet
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement, LineElement,
    Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getRangeReport } from '../../api/reports';
import { useTenant } from '../../contexts/TenantContext';
import { useReportFilters } from '../../contexts/ReportFilterContext';
import FilterBar from '../../components/FilterBar';
import { exportCSV, exportPDF } from '../../utils/exportUtils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const SalesSummary = () => {
    const { t } = useTranslation();
    const { tenantConfig } = useTenant();
    const { dateRange, setDateRange } = useReportFilters();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const exportRef = useRef(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchSummary();
    }, [dateRange]);

    // 點擊外部關閉匯出選單
    useEffect(() => {
        const handleClick = (e) => {
            if (exportRef.current && !exportRef.current.contains(e.target)) setShowExportMenu(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const fetchSummary = async (range) => {
        const d = range || dateRange;
        setLoading(true);
        setError('');
        try {
            const result = await getRangeReport(d.start, d.end, true);
            if (result.success) setSummary(result.data);
            else setError(t('common.error_load_data'));
        } catch (err) {
            setError(t('common.error_load_data'));
        } finally {
            setLoading(false);
        }
    };

    if (loading && !summary) {
        return (
            <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <Loader2 className="animate-spin" size={32} /> {t('common.loading')}
            </div>
        );
    }

    const d = summary || {};
    const totalRevenue = d.totalRevenue || 0;
    const totalCost = d.totalCost || 0;
    const totalDiscount = d.totalDiscount || 0;
    const totalRefunds = d.totalRefunds || 0;
    const totalOrders = d.totalOrders || 0;

    const kpiCards = [
        { label: t('dashboard.total_sales', '銷售總額'), value: `${tenantConfig.currency}${totalRevenue.toLocaleString()}` },
        { label: t('dashboard.refund', '退款'), value: `${tenantConfig.currency}${totalRefunds.toLocaleString()}` },
        { label: t('dashboard.discount', '折扣'), value: `${tenantConfig.currency}${totalDiscount.toLocaleString()}` },
        { label: t('dashboard.net_sales', '淨銷售額'), value: `${tenantConfig.currency}${(totalRevenue - totalRefunds).toLocaleString()}` },
        { label: t('dashboard.gross_profit', '毛利潤'), value: `${tenantConfig.currency}${(totalRevenue - totalCost).toLocaleString()}` },
    ];

    const salesTrend = d.reports || [];
    // If range report doesn't include daily trend, derive from DailyReport array
    const chartLabels = salesTrend.length > 0 ? salesTrend.map(s => s.date || s._id) : [];
    const chartDataValues = salesTrend.length > 0 ? salesTrend.map(s => s.totalRevenue || 0) : [];

    const chartData = {
        labels: chartLabels,
        datasets: [{
            fill: true,
            label: t('dashboard.sales_trend'),
            data: chartDataValues,
            borderColor: 'hsl(230, 80%, 60%)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.4,
        }],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (context) => `${t('dashboard.sales_trend')}: ${tenantConfig.currency}${context.parsed.y.toLocaleString()}` } }
        },
        scales: {
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'hsl(0,0%,70%)', callback: (value) => `${tenantConfig.currency}${value.toLocaleString()}` } },
            x: { grid: { display: false }, ticks: { color: 'hsl(0,0%,70%)' } },
        },
    };

    const totalPages = Math.max(1, Math.ceil(salesTrend.length / pageSize));
    const pagedData = salesTrend.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleExport = (type) => {
        setShowExportMenu(false);
        const columns = [
            { label: t('report.date', '日期'), value: 'date' },
            { label: t('report.net_sales', '淨銷售額'), value: (r) => r.totalRevenue || 0 },
            { label: t('report.cost', '銷售成本'), value: (r) => r.totalCost || 0 },
            { label: t('report.gross_profit', '毛利潤'), value: (r) => (r.totalRevenue || 0) - (r.totalCost || 0) },
            { label: t('report.profit_margin', '利潤率'), value: (r) => r.totalRevenue ? ((((r.totalRevenue - (r.totalCost || 0)) / r.totalRevenue) * 100).toFixed(1) + '%') : '0%' },
        ];
        const filename = `daily_detail_${dateRange.start}_${dateRange.end}`;
        if (type === 'csv') {
            exportCSV(columns, salesTrend, [], `${filename}.csv`);
        } else {
            exportPDF(t('report.daily_detail', '每日明細'), columns, salesTrend, tenantConfig.currency);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}
        >
            {/* Error Banner */}
            {error && (
                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', fontSize: '0.9rem' }}>
                    {error}
                </div>
            )}

            {/* Filter Bar - Shared across all report tabs */}
            <FilterBar onFilter={(range) => fetchSummary(range)} />

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                {kpiCards.map((kpi, idx) => (
                    <div key={idx} className="glass-panel" style={{ padding: '1.25rem' }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{kpi.label}</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{kpi.value}</div>
                    </div>
                ))}
            </div>

            {/* Sales Trend Chart */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>{t('dashboard.sales_trend')}</h3>
                    <button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                        <Download size={14} /> {t('common.export', '匯出')}
                    </button>
                </div>
                <div style={{ height: '300px' }}>
                    {chartLabels.length > 0 ? <Line data={chartData} options={chartOptions} /> : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            {t('common.no_data', '暫無數據')}
                        </div>
                    )}
                </div>
            </div>

            {/* Daily Detail Table */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>{t('report.daily_detail', '每日明細')}</h3>
                    <div ref={exportRef} style={{ position: 'relative' }}>
                        <button onClick={() => setShowExportMenu(!showExportMenu)} className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.3rem', border: 'none', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <Download size={14} /> {t('common.export', '匯出')}
                        </button>
                        {showExportMenu && (
                            <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 100, minWidth: '140px', overflow: 'hidden' }}>
                                <button onClick={() => handleExport('csv')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left' }}
                                    onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.target.style.background = 'transparent'}>
                                    <FileSpreadsheet size={16} color="#4ade80" /> CSV
                                </button>
                                <button onClick={() => handleExport('pdf')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left' }}
                                    onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.target.style.background = 'transparent'}>
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
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('report.date', '日期')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('report.net_sales', '淨銷售額')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('report.cost', '銷售成本')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('report.gross_profit', '毛利潤')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('report.profit_margin', '利潤率')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagedData.length > 0 ? pagedData.map((row, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '0.75rem 0.5rem' }}>{row.date || row._id || `Day ${idx + 1}`}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{tenantConfig.currency}{(row.totalRevenue || 0).toLocaleString()}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{tenantConfig.currency}{(row.totalCost || 0).toLocaleString()}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{tenantConfig.currency}{((row.totalRevenue || 0) - (row.totalCost || 0)).toLocaleString()}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#4ade80' }}>
                                        {row.totalRevenue ? ((((row.totalRevenue - (row.totalCost || 0)) / row.totalRevenue) * 100).toFixed(1)) : 0}%
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>{t('common.no_data', '暫無數據')}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{t('common.page_info', { current: currentPage, total: totalPages })}</span>
                    <select
                        value={pageSize}
                        onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                        style={{ background: 'rgba(0,0,0,0.2)', border: 'none', color: 'var(--text-muted)', padding: '0.3rem', borderRadius: '4px', fontSize: '0.8rem' }}
                    >
                        <option value={10}>10 {t('common.rows', '行')}</option>
                        <option value={25}>25 {t('common.rows', '行')}</option>
                        <option value={50}>50 {t('common.rows', '行')}</option>
                    </select>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}
                            style={{ padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-muted)', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer', opacity: currentPage <= 1 ? 0.4 : 1 }}>
                            ◀
                        </button>
                        <span style={{ padding: '0.2rem 0.5rem' }}>{currentPage} / {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}
                            style={{ padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-muted)', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', opacity: currentPage >= totalPages ? 0.4 : 1 }}>
                            ▶
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SalesSummary;
