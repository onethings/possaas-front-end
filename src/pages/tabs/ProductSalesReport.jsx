import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Download, Loader2, BarChart3, LineChart, PieChart, FileText, FileSpreadsheet } from 'lucide-react';
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
    const exportRef = useRef(null);

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
                        category: p.category || '—',
                        qty: p.qty || 0,
                        netSales: p.revenue || 0,
                        cost: p.cost || 0,
                        profitMargin: p.revenue ? (((p.revenue - (p.cost || 0)) / p.revenue) * 100).toFixed(1) : 0,
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>{t('report.product_details', '商品銷售明細')}</h3>
                    <div ref={exportRef} style={{ position: 'relative' }}>
                        <button onClick={() => setShowExportMenu(!showExportMenu)} style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Download size={14} /> {t('common.export', '匯出')}
                        </button>
                        {showExportMenu && (
                            <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 100, minWidth: '140px', overflow: 'hidden' }}>
                                <button onClick={() => { setShowExportMenu(false); exportCSV(
                                    [{label:t('report.product','商品'),value:'name'},{label:t('report.category','類別'),value:'category'},{label:t('report.qty_sold','售出商品'),value:'qty'},{label:t('report.net_sales','淨銷售額'),value:(r)=>r.netSales},{label:t('report.gross_profit','毛利潤'),value:(r)=>r.netSales-r.cost},{label:t('report.profit_margin','利潤率'),value:(r)=>r.profitMargin+'%'}],
                                    products, [], `product_sales_${dateRange.start}_${dateRange.end}.csv`
                                )}} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', border: 'none', background: 'transparent', color: 'var(--text)', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left' }}
                                    onMouseEnter={e=>e.target.style.background='rgba(255,255,255,0.05)'} onMouseLeave={e=>e.target.style.background='transparent'}>
                                    <FileSpreadsheet size={16} color="#4ade80" /> CSV
                                </button>
                                <button onClick={() => { setShowExportMenu(false); exportPDF(
                                    t('report.product_details','商品銷售明細'),
                                    [{label:t('report.product','商品'),value:'name'},{label:t('report.category','類別'),value:'category'},{label:t('report.qty_sold','售出商品'),value:'qty'},{label:t('report.net_sales','淨銷售額'),value:(r)=>r.netSales},{label:t('report.gross_profit','毛利潤'),value:(r)=>r.netSales-r.cost},{label:t('report.profit_margin','利潤率'),value:(r)=>r.profitMargin+'%'}],
                                    products, tenantConfig.currency
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
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('report.product', '商品')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('report.category', '類別')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('report.qty_sold', '售出商品')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('report.net_sales', '淨銷售額')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('report.gross_profit', '毛利潤')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('report.profit_margin', '利潤率')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{p.name}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>{p.category}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{p.qty}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{tenantConfig.currency}{p.netSales.toLocaleString()}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{tenantConfig.currency}{(p.netSales - p.cost).toLocaleString()}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#4ade80' }}>{p.profitMargin}%</td>
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
