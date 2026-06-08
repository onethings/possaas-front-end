import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
    TrendingUp, DollarSign, Loader2, Download, FileText, FileSpreadsheet,
    BarChart3, LineChart, Settings2
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement, LineElement, BarElement,
    Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { getRangeReport } from '../../api/reports';
import { useTenant } from '../../contexts/TenantContext';
import { useReportFilters } from '../../contexts/ReportFilterContext';
import FilterBar from '../../components/FilterBar';
import { exportCSV, exportPDF } from '../../utils/exportUtils';
import { SortArrow } from '../../utils/useSortable';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

// ── Aggregation Helpers ──────────────────────────────
function getWeekId(dateStr) {
  const d = new Date(dateStr);
  const start = new Date(d); start.setDate(d.getDate() - d.getDay());
  return start.toISOString().slice(0, 10);
}

function getMonthId(dateStr) { return dateStr.slice(0, 7); }

function getQuarterId(dateStr) {
  const m = parseInt(dateStr.slice(5, 7), 10);
  const q = Math.floor((m - 1) / 3) + 1;
  return `${dateStr.slice(0, 4)}-Q${q}`;
}

function getYearId(dateStr) { return dateStr.slice(0, 4); }

const GRANULARITIES = (t) => [
  { key: 'day',     label: t('report.period_day', 'Day'),     groupFn: (d) => d,              labelFn: (d) => d },
  { key: 'week',    label: t('report.period_week', 'Week'),   groupFn: getWeekId,             labelFn: (id) => id },
  { key: 'month',   label: t('report.period_month', 'Month'),  groupFn: getMonthId,            labelFn: (id) => id },
  { key: 'quarter', label: t('report.period_quarter', 'Quarter'), groupFn: getQuarterId,          labelFn: (id) => id },
  { key: 'year',    label: t('report.period_year', 'Year'),    groupFn: getYearId,             labelFn: (id) => id },
];

const METRICS = (t) => [
  { key: 'totalRevenue', label: t('report.total_sales', 'Total Sales'), color: 'hsl(230, 80%, 60%)', bg: 'rgba(99,102,241,0.15)',
    get: (r) => (r.totalRevenue || 0) },
  { key: 'refunds',      label: t('report.refunds', 'Refunds'),       color: 'hsl(0, 70%, 60%)',   bg: 'rgba(239,68,68,0.15)',
    get: (r) => (r.totalRefunds || 0) },
  { key: 'discount',     label: t('report.discount', 'Discount'),     color: 'hsl(35, 90%, 55%)',  bg: 'rgba(251,146,60,0.15)',
    get: (r) => (r.totalDiscount || 0) },
  { key: 'netSales',     label: t('report.net_sales', 'Net Sales'),   color: 'hsl(160, 70%, 45%)', bg: 'rgba(52,211,153,0.15)',
    get: (r) => ((r.totalRevenue || 0) - (r.totalRefunds || 0) - (r.totalDiscount || 0)) },
  { key: 'grossProfit',  label: t('report.gross_profit', 'Gross Profit'), color: 'hsl(280, 70%, 60%)', bg: 'rgba(168,85,247,0.15)',
    get: (r) => ((r.totalRevenue || 0) - (r.totalRefunds || 0) - (r.totalDiscount || 0) - (r.totalCost || 0)) },
];

const COLUMN_DEFS = (t) => [
  { key: 'totalRevenue', label: t('report.total_sales', 'Total Sales'), align: 'right',
    render: (r, cur) => cur + (r.totalRevenue || 0).toLocaleString() },
  { key: 'totalRefunds', label: t('report.refunds', 'Refunds'),       align: 'right',
    render: (r, cur) => cur + (r.totalRefunds || 0).toLocaleString() },
  { key: 'totalDiscount',label: t('report.discount', 'Discount'),     align: 'right',
    render: (r, cur) => cur + (r.totalDiscount || 0).toLocaleString() },
  { key: 'netSales',     label: t('report.net_sales', 'Net Sales'),   align: 'right',
    render: (r, cur) => cur + ((r.totalRevenue || 0) - (r.totalRefunds || 0) - (r.totalDiscount || 0)).toLocaleString() },
  { key: 'totalCost',    label: t('report.cost_of_sales', 'Cost of Sales'), align: 'right',
    render: (r, cur) => cur + (r.totalCost || 0).toLocaleString() },
  { key: 'grossProfit',  label: t('report.gross_profit', 'Gross Profit'), align: 'right',
    render: (r, cur) => cur + ((r.totalRevenue || 0) - (r.totalRefunds || 0) - (r.totalDiscount || 0) - (r.totalCost || 0)).toLocaleString() },
  { key: 'profitMargin', label: t('report.profit_margin', 'Profit Margin'), align: 'right',
    render: (r, cur) => {
      const netSales = (r.totalRevenue || 0) - (r.totalRefunds || 0) - (r.totalDiscount || 0);
      return cur + (netSales > 0
        ? ((((netSales - (r.totalCost || 0)) / netSales) * 100).toFixed(1)) + '%'
        : '0%');
    } },
  { key: 'tax',          label: t('report.tax', 'Tax'),               align: 'right',
    render: (r, cur) => cur + (r.totalTax || 0).toLocaleString() },
];

// ── Component ────────────────────────────────────────
const SalesSummary = () => {
    const { t } = useTranslation();
    const { tenantConfig } = useTenant();
    const { dateRange } = useReportFilters();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showTrendExport, setShowTrendExport] = useState(false);
    const [showColumnPicker, setShowColumnPicker] = useState(false);

    // Chart state
    const [chartType, setChartType] = useState('line');      // 'line' | 'bar'
    const [granularity, setGranularity] = useState('day');
    const [chartMetric, setChartMetric] = useState('totalRevenue');

    // Column visibility
    const [visibleCols, setVisibleCols] = useState({
        totalRevenue: true,
        totalRefunds: false,
        totalDiscount: false,
        netSales: true,
        totalCost: true,
        grossProfit: true,
        profitMargin: true,
        tax: false,
    });

    const exportRef = useRef(null);
    const trendExportRef = useRef(null);
    const colPickerRef = useRef(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchSummary();
    }, [dateRange]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (exportRef.current && !exportRef.current.contains(e.target)) setShowExportMenu(false);
            if (trendExportRef.current && !trendExportRef.current.contains(e.target)) setShowTrendExport(false);
            if (colPickerRef.current && !colPickerRef.current.contains(e.target)) setShowColumnPicker(false);
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

    // ── Aggregated chart data ──
    const allGranularities = GRANULARITIES(t);
    const allMetrics = METRICS(t);
    const allColumns = COLUMN_DEFS(t);

    // ── Sort ──
    const [sortKey, setSortKey] = useState('date');
    const [sortDir, setSortDir] = useState('desc');
    const handleSort = (key) => {
        setSortKey(prev => { if (prev === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); return prev; } setSortDir('asc'); return key; });
    };
    const SORT_GETTERS = {
        date: (r) => r.date || r._id || '',
        totalRevenue: (r) => r.totalRevenue || 0,
        totalRefunds: (r) => r.totalRefunds || 0,
        totalDiscount: (r) => r.totalDiscount || 0,
        netSales: (r) => (r.totalRevenue || 0) - (r.totalRefunds || 0) - (r.totalDiscount || 0),
        totalCost: (r) => r.totalCost || 0,
        grossProfit: (r) => (r.totalRevenue || 0) - (r.totalRefunds || 0) - (r.totalDiscount || 0) - (r.totalCost || 0),
        profitMargin: (r) => {
            const netSales = (r.totalRevenue || 0) - (r.totalRefunds || 0) - (r.totalDiscount || 0);
            return netSales > 0 ? (((netSales - (r.totalCost || 0)) / netSales) * 100) : 0;
        },
        tax: (r) => r.totalTax || 0,
    };
    const granularDef = allGranularities.find(g => g.key === granularity) || allGranularities[0];
    const metricDef = allMetrics.find(m => m.key === chartMetric) || allMetrics[0];

    const aggregatedChartData = useMemo(() => {
        const reports = summary?.reports || [];
        if (reports.length === 0) return { labels: [], values: [] };

        const groups = {};
        reports.forEach(r => {
            const gid = granularDef.groupFn(r.date || r._id);
            if (!groups[gid]) groups[gid] = 0;
            groups[gid] += metricDef.get(r);
        });

        const sortedKeys = Object.keys(groups).sort();
        return {
            labels: sortedKeys.map(k => granularDef.labelFn(k)),
            values: sortedKeys.map(k => groups[k]),
        };
    }, [summary, granularity, chartMetric]);

    const chartData = {
        labels: aggregatedChartData.labels,
        datasets: [{
            fill: true,
            label: metricDef.label,
            data: aggregatedChartData.values,
            borderColor: metricDef.color,
            backgroundColor: chartType === 'bar' ? metricDef.color : metricDef.bg,
            tension: 0.4,
            borderRadius: chartType === 'bar' ? 4 : undefined,
        }],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => `${metricDef.label}: ${tenantConfig.currency}${context.parsed.y.toLocaleString()}`
                }
            }
        },
        scales: {
            y: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: {
                    color: 'hsl(0,0%,70%)',
                    callback: (value) => `${tenantConfig.currency}${value.toLocaleString()}`
                }
            },
            x: { grid: { display: false }, ticks: { color: 'hsl(0,0%,70%)' } },
        },
    };

    // ── Sort computed data (must be before early return) ──
    const sortedTrend = useMemo(() => {
        const trend = summary?.reports || [];
        if (!sortKey || !trend.length) return trend;
        const getter = SORT_GETTERS[sortKey] || ((r) => r[sortKey]);
        return [...trend].sort((a, b) => {
            let va = getter(a); if (va == null) va = '';
            let vb = getter(b); if (vb == null) vb = '';
            if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
            return sortDir === 'asc' ? (va - vb) : (vb - va);
        });
    }, [summary, sortKey, sortDir]);

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
        { label: t('dashboard.total_sales', 'Total Sales'), value: `${tenantConfig.currency}${totalRevenue.toLocaleString()}` },
        { label: t('dashboard.refund', 'Refund'), value: `${tenantConfig.currency}${totalRefunds.toLocaleString()}` },
        { label: t('dashboard.discount', 'Discount'), value: `${tenantConfig.currency}${totalDiscount.toLocaleString()}` },
        { label: t('dashboard.net_sales', 'Net Sales'), value: `${tenantConfig.currency}${(totalRevenue - totalRefunds - totalDiscount).toLocaleString()}` },
        { label: t('dashboard.gross_profit', 'Gross Profit'), value: `${tenantConfig.currency}${(totalRevenue - totalRefunds - totalDiscount - totalCost).toLocaleString()}` },
    ];

    const salesTrend = d.reports || [];
    const totalPages = Math.max(1, Math.ceil(sortedTrend.length / pageSize));
    const pagedData = sortedTrend.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // ── Export ──
    const handleExport = (type) => {
        setShowExportMenu(false);
        const activeCols = allColumns.filter(c => visibleCols[c.key]);
        const columns = [
            { label: t('report.date', 'Date'), value: 'date' },
            ...activeCols.map(c => ({
                label: c.label,
                value: (r) => {
                    if (c.key === 'netSales') return (r.totalRevenue || 0) - (r.totalRefunds || 0) - (r.totalDiscount || 0);
                    if (c.key === 'grossProfit') return (r.totalRevenue || 0) - (r.totalRefunds || 0) - (r.totalDiscount || 0) - (r.totalCost || 0);
                    if (c.key === 'profitMargin') return r.totalRevenue ? ((((r.totalRevenue - (r.totalRefunds || 0) - (r.totalCost || 0)) / r.totalRevenue) * 100).toFixed(1) + '%') : '0%';
                    if (c.key === 'tax') return r.totalTax || 0;
                    return r[c.key] || 0;
                }
            }))
        ];
        const filename = `daily_detail_${dateRange.start}_${dateRange.end}`;
        if (type === 'csv') exportCSV(columns, salesTrend, [], `${filename}.csv`);
        else exportPDF(t('report.daily_detail', 'Daily Detail'), columns, salesTrend, tenantConfig.currency);
    };

    const handleTrendExport = (type) => {
        setShowTrendExport(false);
        const columns = [
            { label: t('report.date', 'Date'), value: 'date' },
            { label: metricDef.label, value: (r) => metricDef.get(r) },
        ];
        const filename = `sales_trend_${dateRange.start}_${dateRange.end}`;
        if (type === 'csv') exportCSV(columns, salesTrend, [], `${filename}.csv`);
        else exportPDF(t('dashboard.sales_trend', 'Sales Trend'), columns, salesTrend, tenantConfig.currency);
    };

    const toggleCol = (key) => {
        setVisibleCols(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // ── Style helpers ──
    const btnBase = {
        padding: '0.3rem 0.6rem', fontSize: '0.75rem', border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s',
        background: 'transparent', color: 'var(--text-muted)', whiteSpace: 'nowrap',
    };
    const btnActive = { ...btnBase, background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' };

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

            {/* Filter Bar */}
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

            {/* ═══ Sales Trend Chart ═══ */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                {/* Header row: title + chart type + granularity + metric + export */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginRight: 'auto' }}>{t('dashboard.sales_trend')}</h3>

                    {/* Chart type toggle */}
                    <div className="glass-panel" style={{ display: 'flex', padding: '2px', gap: '2px' }}>
                        <button onClick={() => setChartType('line')} style={chartType === 'line' ? btnActive : btnBase}
                            title="面積圖">
                            <LineChart size={16} />
                        </button>
                        <button onClick={() => setChartType('bar')} style={chartType === 'bar' ? btnActive : btnBase}
                            title="直方圖">
                            <BarChart3 size={16} />
                        </button>
                    </div>

                    {/* Granularity */}
                    <div className="glass-panel" style={{ display: 'flex', padding: '2px', gap: '2px' }}>
                        {allGranularities.map(g => (
                            <button key={g.key} onClick={() => setGranularity(g.key)}
                                style={granularity === g.key ? btnActive : btnBase}>
                                {g.label}
                            </button>
                        ))}
                    </div>

                    {/* Metric selector */}
                    <div className="glass-panel" style={{ display: 'flex', padding: '2px', gap: '2px' }}>
                        {allMetrics.map(m => (
                            <button key={m.key} onClick={() => setChartMetric(m.key)}
                                style={{
                                    ...(chartMetric === m.key ? btnActive : btnBase),
                                    borderLeft: chartMetric === m.key ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                                }}>
                                {m.label}
                            </button>
                        ))}
                    </div>

                    {/* Export */}
                    <div ref={trendExportRef} style={{ position: 'relative' }}>
                        <button onClick={() => setShowTrendExport(!showTrendExport)}
                            style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Download size={14} />
                        </button>
                        {showTrendExport && (
                            <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 100, minWidth: '140px', overflow: 'hidden' }}>
                                <button onClick={() => handleExport('csv')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', border: 'none', background: 'transparent', color: '#ffffff', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left' }}
                                    onMouseEnter={e=>e.target.style.background='rgba(255,255,255,0.05)'} onMouseLeave={e=>e.target.style.background='transparent'}>
                                    <FileSpreadsheet size={16} color="#4ade80" /> CSV
                                </button>
                                <button onClick={() => handleTrendExport('pdf')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', border: 'none', background: 'transparent', color: '#ffffff', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left' }}
                                    onMouseEnter={e=>e.target.style.background='rgba(255,255,255,0.05)'} onMouseLeave={e=>e.target.style.background='transparent'}>
                                    <FileText size={16} color="#f87171" /> PDF
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chart */}
                <div style={{ height: '300px' }}>
                    {aggregatedChartData.labels.length > 0 ? (
                        chartType === 'bar'
                            ? <Bar data={chartData} options={chartOptions} />
                            : <Line data={chartData} options={chartOptions} />
                    ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            {t('common.no_data', 'No data')}
                        </div>
                    )}
                </div>
            </div>

            {/* ═══ Daily Detail Table ═══ */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>{t('report.daily_detail', 'Daily Detail')}</h3>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        {/* Column visibility toggle */}
                        <div ref={colPickerRef} style={{ position: 'relative' }}>
                            <button onClick={() => setShowColumnPicker(!showColumnPicker)}
                                style={{ padding: '0.4rem 0.7rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Settings2 size={14} /> {t('common.columns', 'Columns')}
                            </button>
                            {showColumnPicker && (
                                <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 100, minWidth: '170px', padding: '0.5rem', overflow: 'hidden' }}>
                                    {allColumns.map(c => (
                                        <label key={c.key} style={{
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            padding: '0.4rem 0.4rem', cursor: 'pointer', borderRadius: '4px',
                                            fontSize: '0.8rem', color: '#ffffff', whiteSpace: 'nowrap',
                                        }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <input type="checkbox" checked={!!visibleCols[c.key]}
                                                onChange={() => toggleCol(c.key)}
                                                style={{ accentColor: 'var(--primary)', cursor: 'pointer' }} />
                                            {c.label}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Export */}
                        <div ref={exportRef} style={{ position: 'relative' }}>
                            <button onClick={() => setShowExportMenu(!showExportMenu)}
                                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.3rem', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <Download size={14} /> {t('common.export', 'Export')}
                            </button>
                            {showExportMenu && (
                                <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 100, minWidth: '140px', overflow: 'hidden' }}>
                                    <button onClick={() => handleExport('csv')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', border: 'none', background: 'transparent', color: '#ffffff', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left' }}
                                        onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.target.style.background = 'transparent'}>
                                        <FileSpreadsheet size={16} color="#4ade80" /> CSV
                                    </button>
                                    <button onClick={() => handleExport('pdf')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', border: 'none', background: 'transparent', color: '#ffffff', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left' }}
                                        onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.target.style.background = 'transparent'}>
                                        <FileText size={16} color="#f87171" /> PDF
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <th onClick={() => handleSort('date')} style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }}>
                                    {t('report.date', 'Date')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="date" />
                                </th>
                                {allColumns.filter(c => visibleCols[c.key]).map(c => (
                                    <th key={c.key} onClick={() => handleSort(c.key)} style={{ padding: '0.75rem 0.5rem', textAlign: c.align, color: 'var(--text-muted)', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }}>
                                        {c.label} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey={c.key} />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {pagedData.length > 0 ? pagedData.map((row, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '0.75rem 0.5rem', whiteSpace: 'nowrap' }}>
                                        {row.date || row._id || `Day ${idx + 1}`}
                                    </td>
                                    {allColumns.filter(c => visibleCols[c.key]).map(c => {
                                        let val;
                                        if (c.key === 'netSales') val = (row.totalRevenue || 0) - (row.totalRefunds || 0) - (row.totalDiscount || 0);
                                        else if (c.key === 'grossProfit') val = (row.totalRevenue || 0) - (row.totalRefunds || 0) - (row.totalDiscount || 0) - (row.totalCost || 0);
                                        else if (c.key === 'profitMargin') {
                                            const netSales = (row.totalRevenue || 0) - (row.totalRefunds || 0) - (row.totalDiscount || 0);
                                            val = netSales > 0
                                                ? ((((netSales - (row.totalCost || 0)) / netSales) * 100).toFixed(1)) + '%'
                                                : '0%';
                                        }
                                        else if (c.key === 'tax') val = row.totalTax || 0;
                                        else val = row[c.key] || 0;

                                        const isPercent = c.key === 'profitMargin';
                                        return (
                                            <td key={c.key} style={{
                                                padding: '0.75rem 0.5rem', textAlign: c.align,
                                                color: isPercent ? '#4ade80' : 'var(--text-main)',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {isPercent ? val : `${tenantConfig.currency}${typeof val === 'number' ? val.toLocaleString() : val}`}
                                            </td>
                                        );
                                    })}
                                </tr>
                            )) : (
                                <tr><td colSpan={Object.keys(visibleCols).filter(k => visibleCols[k]).length + 1}
                                    style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    {t('common.no_data', 'No data')}</td></tr>
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
                        <option value={10}>10 {t('common.rows', 'Rows')}</option>
                        <option value={25}>25 {t('common.rows', 'Rows')}</option>
                        <option value={50}>50 {t('common.rows', 'Rows')}</option>
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
