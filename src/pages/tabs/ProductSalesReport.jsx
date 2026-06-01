import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Download, Loader2, BarChart3, LineChart, PieChart, FileText, FileSpreadsheet, Settings2 } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement, PointElement, LineElement,
    ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { useTenant } from '../../contexts/TenantContext';
import { useReportFilters } from '../../contexts/ReportFilterContext';
import FilterBar from '../../components/FilterBar';
import { getRangeReport } from '../../api/reports';
import { exportCSV, exportPDF } from '../../utils/exportUtils';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const CHART_TYPES = ['bar', 'line', 'pie'];
const CHART_TYPE_ICONS = { bar: BarChart3, line: LineChart, pie: PieChart };

// ── 欄位定義 ──
const COLUMN_DEFS = [
  { key: 'name',         label: '商品',     align: 'left',  isCurrency: false,
    getVal: (p) => p.name },
  { key: 'sku',          label: 'SKU',       align: 'left',  isCurrency: false,
    getVal: (p) => p.sku || '—' },
  { key: 'category',     label: '類別',     align: 'left',  isCurrency: false,
    getVal: (p) => p.category || '—' },
  { key: 'qty',          label: '售出商品', align: 'right', isCurrency: false,
    getVal: (p) => p.qty },
  { key: 'totalRevenue', label: '銷售總額', align: 'right', isCurrency: true,
    getVal: (p) => p.totalRevenue || 0 },
  { key: 'returnQty',    label: '商品退還數量', align: 'right', isCurrency: false,
    getVal: (p) => p.returnQty || 0 },
  { key: 'refund',       label: '退款',     align: 'right', isCurrency: true,
    getVal: (p) => p.refund || 0 },
  { key: 'discount',     label: '折扣',     align: 'right', isCurrency: true,
    getVal: (p) => p.discount || 0 },
  { key: 'netSales',     label: '淨銷售額', align: 'right', isCurrency: true,
    getVal: (p) => p.netSales },
  { key: 'cost',         label: '銷售成本', align: 'right', isCurrency: true,
    getVal: (p) => p.cost },
  { key: 'grossProfit',  label: '毛利潤',   align: 'right', isCurrency: true,
    getVal: (p) => p.netSales - p.cost },
  { key: 'profitMargin', label: '利潤率',   align: 'right', isCurrency: false,
    getVal: (p) => p.profitMargin + '%' },
  { key: 'tax',          label: '稅務',     align: 'right', isCurrency: true,
    getVal: (p) => p.tax || 0 },
];

const DEFAULT_VISIBLE = {
  name: true,         // 商品
  sku: false,         // SKU
  category: true,     // 類別
  qty: true,          // 售出商品
  totalRevenue: false,// 銷售總額
  returnQty: false,   // 商品退還數量
  refund: false,      // 退款
  discount: false,    // 折扣
  netSales: true,     // 淨銷售額
  cost: false,        // 銷售成本
  grossProfit: true,  // 毛利潤
  profitMargin: true, // 利潤率
  tax: true,          // 稅務
};

const ProductSalesReport = () => {
    const { t } = useTranslation();
    const { tenantConfig } = useTenant();
    const { dateRange } = useReportFilters();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [dailyReports, setDailyReports] = useState([]);
    const [chartType, setChartType] = useState('bar');
    const [timeGrouping, setTimeGrouping] = useState('day');
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showColumnPicker, setShowColumnPicker] = useState(false);
    const [visibleCols, setVisibleCols] = useState(DEFAULT_VISIBLE);
    const exportRef = useRef(null);
    const colPickerRef = useRef(null);

    // 計算日期範圍天數
    const dateDiffDays = useMemo(() => {
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }, [dateRange]);

    // 根據日期範圍決定可用的時間分組選項
    const availableGroupings = useMemo(() => {
        const opts = [];
        if (dateDiffDays <= 1) opts.push('hour');
        if (dateDiffDays >= 1) opts.push('day');
        if (dateDiffDays >= 7) opts.push('week');
        if (dateDiffDays >= 28) opts.push('month');
        if (dateDiffDays >= 90) opts.push('quarter');
        if (dateDiffDays >= 365) opts.push('year');
        return opts;
    }, [dateDiffDays]);

    // 時間範圍變更時自動跳選合適的選項
    useEffect(() => {
        if (!availableGroupings.includes(timeGrouping)) {
            setTimeGrouping(availableGroupings[availableGroupings.length - 1] || 'day');
        }
    }, [availableGroupings]);

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    useEffect(() => {
        const handleClick = (e) => {
            if (exportRef.current && !exportRef.current.contains(e.target)) setShowExportMenu(false);
            if (colPickerRef.current && !colPickerRef.current.contains(e.target)) setShowColumnPicker(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await getRangeReport(dateRange.start, dateRange.end);
            if (result.success) {
                if (result.data.topProducts) {
                    const mapped = result.data.topProducts.map(p => ({
                        name: p.name || 'Unknown',
                        sku: p.sku || '',
                        category: p.category || '—',
                        qty: p.qty || 0,
                        totalRevenue: p.revenue || 0,
                        returnQty: 0,          // 後端尚無此欄位
                        refund: 0,              // 後端尚無此欄位
                        discount: 0,            // 後端尚無此欄位
                        netSales: p.revenue || 0,
                        cost: p.cost || 0,
                        grossProfit: (p.revenue || 0) - (p.cost || 0),
                        profitMargin: p.revenue ? (((p.revenue - (p.cost || 0)) / p.revenue) * 100).toFixed(1) : 0,
                        tax: 0,                 // 後端尚無此欄位
                    }));
                    setProducts(mapped);
                }
                if (result.data.reports) {
                    setDailyReports(result.data.reports);
                }
            }
        } catch (err) {
            console.error('Failed to fetch product sales:', err);
        } finally {
            setLoading(false);
        }
    };

    const top5 = products.slice(0, 5);

    // 依時間分組彙總每日報表
    const groupedTrend = useMemo(() => {
        if (!dailyReports.length) return [];
        const groups = {};
        dailyReports.forEach(r => {
            const d = new Date(r.date);
            let key;
            switch (timeGrouping) {
                case 'hour':
                    key = r.date;
                    break;
                case 'day':
                    key = r.date;
                    break;
                case 'week': {
                    const startOfWeek = new Date(d);
                    const day = d.getDay();
                    startOfWeek.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
                    key = startOfWeek.toISOString().split('T')[0];
                    break;
                }
                case 'month':
                    key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                    break;
                case 'quarter': {
                    const q = Math.floor(d.getMonth() / 3) + 1;
                    key = `${d.getFullYear()}-Q${q}`;
                    break;
                }
                case 'year':
                    key = `${d.getFullYear()}`;
                    break;
                default:
                    key = r.date;
            }
            if (!groups[key]) groups[key] = { label: key, totalRevenue: 0, totalCost: 0, orderCount: 0 };
            groups[key].totalRevenue += r.totalRevenue || 0;
            groups[key].totalCost += r.totalCost || 0;
            groups[key].orderCount += r.orderCount || 0;
        });
        return Object.values(groups).sort((a, b) => a.label.localeCompare(b.label));
    }, [dailyReports, timeGrouping]);

    // 前5名商品圖表資料
    const productChartData = useMemo(() => {
        if (top5.length === 0) return null;
        const colors = ['rgba(96,165,250,0.7)', 'rgba(74,222,128,0.7)', 'rgba(251,191,36,0.7)', 'rgba(167,139,250,0.7)', 'rgba(248,113,113,0.7)'];
        const bgColors = colors.slice(0, top5.length);
        const borderColors = bgColors.map(c => c.replace('0.7', '1'));

        const labels = top5.map(p => p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name);
        const values = top5.map(p => p.netSales);

        if (chartType === 'pie') {
            return {
                labels,
                datasets: [{
                    data: values,
                    backgroundColor: bgColors,
                    borderWidth: 0,
                }]
            };
        }
        return {
            labels,
            datasets: [{
                label: t('report.net_sales', '淨銷售額'),
                data: values,
                backgroundColor: bgColors,
                borderColor: borderColors,
                borderWidth: chartType === 'line' ? 2 : 0,
                borderRadius: chartType === 'bar' ? 6 : 0,
                tension: 0.4,
                fill: chartType === 'line',
            }]
        };
    }, [products, chartType]);

    // 趨勢圖表資料（依時間分組）
    const trendChartData = useMemo(() => {
        if (groupedTrend.length === 0) return null;
        const labels = groupedTrend.map(g => g.label);
        const colors = ['rgba(96,165,250,0.7)', 'rgba(74,222,128,0.7)'];

        if (chartType === 'pie') {
            return {
                labels,
                datasets: [{
                    data: groupedTrend.map(g => g.totalRevenue),
                    backgroundColor: ['rgba(96,165,250,0.7)', 'rgba(74,222,128,0.7)', 'rgba(251,191,36,0.7)', 'rgba(167,139,250,0.7)', 'rgba(248,113,113,0.7)'].slice(0, groupedTrend.length),
                    borderWidth: 0,
                }]
            };
        }
        return {
            labels,
            datasets: [
                {
                    label: t('report.net_sales', '淨銷售額'),
                    data: groupedTrend.map(g => g.totalRevenue),
                    backgroundColor: chartType === 'bar' ? colors[0] : 'rgba(96,165,250,0.1)',
                    borderColor: 'rgba(96,165,250,0.9)',
                    borderWidth: chartType === 'line' ? 2 : 0,
                    borderRadius: chartType === 'bar' ? 6 : 0,
                    tension: 0.4,
                    fill: chartType === 'line',
                },
            ]
        };
    }, [groupedTrend, chartType]);

    const getChartOptions = useCallback((isTrend = false) => {
        const base = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: chartType === 'pie' },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            if (chartType === 'pie') {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const pct = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${tenantConfig.currency}${context.parsed.toLocaleString()} (${pct}%)`;
                            }
                            return `${tenantConfig.currency}${context.parsed.y?.toLocaleString() || context.parsed.toLocaleString()}`;
                        }
                    }
                }
            },
        };
        if (chartType !== 'pie') {
            base.scales = {
                y: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: 'hsl(0,0%,70%)', callback: (value) => `${tenantConfig.currency}${value.toLocaleString()}` }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: 'hsl(0,0%,70%)', maxRotation: isTrend ? 45 : 30 }
                }
            };
        }
        return base;
    }, [chartType, tenantConfig, t]);

    const renderChart = (data, isTrend = false) => {
        if (!data) {
            return (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    {t('common.no_data', '暫無數據')}
                </div>
            );
        }
        const opts = getChartOptions(isTrend);
        switch (chartType) {
            case 'line': return <Line data={data} options={opts} />;
            case 'pie': return <Pie data={data} options={opts} />;
            default: return <Bar data={data} options={opts} />;
        }
    };

    const handleExport = (type) => {
        const activeCols = COLUMN_DEFS.filter(c => visibleCols[c.key]);
        const columns = [
            ...activeCols.map(c => ({
                label: c.label,
                value: (r) => c.getVal(r),
            }))
        ];
        const filename = `product_sales_${dateRange.start}_${dateRange.end}`;
        if (type === 'csv') exportCSV(columns, products, [], `${filename}.csv`);
        else exportPDF(t('report.product_details', '商品銷售明細'), columns, products, tenantConfig.currency);
    };

    const chartTypeLabels = { bar: t('report.chart_bar', '直方圖'), line: t('report.chart_line', '折線圖'), pie: t('report.chart_pie', '圓餅圖') };
    const groupingLabels = { hour: t('report.group_hour', '時'), day: t('report.group_day', '天'), week: t('report.group_week', '週'), month: t('report.group_month', '月'), quarter: t('report.group_quarter', '季度'), year: t('report.group_year', '年') };

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

            {/* Top 5 Products + Chart */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* 左邊：前5名商品列表 */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{t('report.top_5_products', '前 5 名商品')}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {top5.map((p, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: `hsl(${idx * 50}, 70%, 50%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                                        {idx + 1}
                                    </span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.name}</span>
                                </div>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-light)' }}>{tenantConfig.currency}{p.netSales.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 右邊：圖表 + 控制項 */}
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    {/* 圖表工具列 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {/* 圖表類型切換 */}
                        <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '3px' }}>
                            {CHART_TYPES.map(type => {
                                const Icon = CHART_TYPE_ICONS[type];
                                return (
                                    <button
                                        key={type}
                                        onClick={() => setChartType(type)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '4px',
                                            padding: '0.4rem 0.7rem', fontSize: '0.75rem', fontWeight: 600,
                                            border: 'none', borderRadius: '8px', cursor: 'pointer',
                                            background: chartType === type ? 'var(--primary)' : 'transparent',
                                            color: chartType === type ? '#fff' : 'var(--text-muted)',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        <Icon size={14} /> {chartTypeLabels[type]}
                                    </button>
                                );
                            })}
                        </div>
                        {/* 時間分組選擇 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('report.group_by', '按')}</span>
                            <select
                                value={timeGrouping}
                                onChange={e => setTimeGrouping(e.target.value)}
                                style={{
                                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'var(--text)', padding: '0.3rem 0.5rem', borderRadius: '8px',
                                    fontSize: '0.8rem', outline: 'none', cursor: 'pointer',
                                }}
                            >
                                {availableGroupings.map(g => (
                                    <option key={g} value={g}>{groupingLabels[g]}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {/* 圖表內容 */}
                    <div style={{ flex: 1, minHeight: '250px', height: '100%' }}>
                        {renderChart(productChartData)}
                    </div>
                </div>
            </div>

            {/* 銷售趨勢圖表（依時間分組） */}
            {groupedTrend.length > 1 && (
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{t('report.sales_trend_chart', '銷售趨勢圖表')}</h3>
                    <div style={{ height: '280px' }}>
                        {renderChart(trendChartData, true)}
                    </div>
                </div>
            )}

            {/* Product Detail Table */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>{t('report.product_details', '商品銷售明細')}</h3>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        {/* 欄位選擇 */}
                        <div ref={colPickerRef} style={{ position: 'relative' }}>
                            <button onClick={() => setShowColumnPicker(!showColumnPicker)}
                                style={{ padding: '0.4rem 0.7rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Settings2 size={14} /> {t('common.columns', '欄位')}
                            </button>
                            {showColumnPicker && (
                                <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 100, minWidth: '170px', padding: '0.5rem', overflow: 'hidden' }}>
                                    {COLUMN_DEFS.map(c => (
                                        <label key={c.key} style={{
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            padding: '0.4rem 0.4rem', cursor: 'pointer', borderRadius: '4px',
                                            fontSize: '0.8rem', color: '#ffffff', whiteSpace: 'nowrap',
                                        }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <input type="checkbox" checked={!!visibleCols[c.key]}
                                                onChange={() => setVisibleCols(prev => ({ ...prev, [c.key]: !prev[c.key] }))}
                                                style={{ accentColor: 'var(--primary)', cursor: 'pointer' }} />
                                            {c.label}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* 匯出 */}
                        <div ref={exportRef} style={{ position: 'relative' }}>
                            <button onClick={() => setShowExportMenu(!showExportMenu)} style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Download size={14} /> {t('common.export', '匯出')}
                            </button>
                            {showExportMenu && (
                                <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 100, minWidth: '140px', overflow: 'hidden' }}>
                                    <button onClick={() => { setShowExportMenu(false); handleExport('csv'); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', border: 'none', background: 'transparent', color: '#ffffff', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left' }}
                                        onMouseEnter={e=>e.target.style.background='rgba(255,255,255,0.05)'} onMouseLeave={e=>e.target.style.background='transparent'}>
                                        <FileSpreadsheet size={16} color="#4ade80" /> CSV
                                    </button>
                                    <button onClick={() => { setShowExportMenu(false); handleExport('pdf'); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', border: 'none', background: 'transparent', color: '#ffffff', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left' }}
                                        onMouseEnter={e=>e.target.style.background='rgba(255,255,255,0.05)'} onMouseLeave={e=>e.target.style.background='transparent'}>
                                        <FileText size={16} color="#f87171" /> PDF
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                {COLUMN_DEFS.filter(c => visibleCols[c.key]).map(c => (
                                    <th key={c.key} style={{ padding: '0.75rem 0.5rem', textAlign: c.align, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                        {c.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    {COLUMN_DEFS.filter(c => visibleCols[c.key]).map(c => {
                                        const rawVal = c.getVal(p);
                                        const isPercent = c.key === 'profitMargin';
                                        const isNumeric = c.isCurrency || c.key === 'qty' || c.key === 'returnQty';
                                        const displayVal = c.isCurrency
                                            ? `${tenantConfig.currency}${rawVal.toLocaleString()}`
                                            : rawVal;
                                        return (
                                            <td key={c.key} style={{
                                                padding: '0.75rem 0.5rem', textAlign: c.align,
                                                fontWeight: c.key === 'name' ? 600 : 400,
                                                color: isPercent ? '#4ade80' : (c.key === 'category' || c.key === 'sku' ? 'var(--text-muted)' : 'var(--text-main)'),
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {displayVal}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{t('common.page_info', { current: 1, total: Math.max(1, Math.ceil(products.length / 10)) })}</span>
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

export default ProductSalesReport;
