import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    ChevronRight,
    Download,
    TrendingUp,
    DollarSign,
    Tag,
    RotateCcw,
    Store,
    ShoppingBag,
    BarChart2,
    PieChart as PieChartIcon,
    Activity,
    X,
    Loader2,
    ArrowUpRight,
    ArrowDownRight,
    Search
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { getRevenueReport } from '../api/reports';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const RevenueReport = () => {
    // 1. Hooks 宣告
    const { user } = useAuth();
    const { tenantConfig } = useTenant();
    const { t } = useTranslation();

    // 2. 需要用到 t 的輔助函式
    const getPresetLabel = (p) => t(`reports.presets.${p}`);

    // 3. 狀態宣告
    const getToday = () => new Date().toISOString().split('T')[0];
    const [dateRange, setDateRange] = useState({
        start: localStorage.getItem('rev_start') || getToday(),
        end: localStorage.getItem('rev_end') || getToday()
    });

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    // 4. 副作用處理 (Effects) & RWD 樣式注入
    useEffect(() => {
        fetchData();
        localStorage.setItem('rev_start', dateRange.start);
        localStorage.setItem('rev_end', dateRange.end);
    }, [dateRange]);

    useEffect(() => {
        const styleTag = document.createElement('style');
        styleTag.id = 'revenue-report-styles';
        styleTag.innerHTML = `
            table tr th { padding: 12px; color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
            table tr td { padding: 16px 12px; background: rgba(255,255,255,0.02); }
            table tr td:first-child { border-radius: 12px 0 0 12px; }
            table tr td:last-child { border-radius: 0 12px 12px 0; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            
            /* ===== RWD 手機端響應式優化 ===== */
            @media (max-width: 1024px) {
                .responsive-grid-visual {
                    grid-template-columns: 1fr !important; /* 圖表改為上下單欄排列 */
                }
            }
            
            @media (max-width: 768px) {
                .responsive-ctrl-bar {
                    flex-direction: column !important;
                    align-items: stretch !important;
                }
                .responsive-date-picker {
                    width: 100% !important;
                    justify-content: space-between !important;
                }
                .responsive-date-container {
                    flex: 1 !important;
                }
                .responsive-date-input {
                    width: 100% !important;
                }
                .responsive-presets {
                    justify-content: flex-start !important;
                    overflow-x: auto !important; /* 讓快捷按鈕在手機端可以橫向滑動，不擠壓變形 */
                    white-space: nowrap !important;
                    padding-bottom: 4px;
                    -webkit-overflow-scrolling: touch;
                }
                .responsive-presets::-webkit-scrollbar {
                    display: none; /* 隱藏滾動條保持美觀 */
                }
                .responsive-table-header {
                    flex-direction: column !important;
                    align-items: stretch !important;
                    gap: 1rem !important;
                }
                .responsive-table-header > div {
                    justify-content: space-between !important;
                }
                .responsive-table-header button {
                    width: 100% !important;
                    justify-content: center !important;
                }
            }
        `;
        document.head.appendChild(styleTag);

        return () => {
            const tag = document.getElementById('revenue-report-styles');
            if (tag) tag.remove();
        };
    }, []);

    // 5. 資料請求與事件處理
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getRevenueReport(dateRange.start, dateRange.end);
            if (res.success) {
                setData(res.data);
            } else {
                setError(t('reports.errors.load_fail'));
            }
        } catch (err) {
            setError(t('reports.errors.connection_fail'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePreset = (type) => {
        const today = new Date();
        let start = new Date();
        let end = new Date();

        switch (type) {
            case 'today': start = today; break;
            case 'yesterday':
                start.setDate(today.getDate() - 1);
                end.setDate(today.getDate() - 1);
                break;
            case 'thisWeek':
                const day = today.getDay();
                start.setDate(today.getDate() - day + (day === 0 ? -6 : 1));
                break;
            case 'thisMonth': start = new Date(today.getFullYear(), today.getMonth(), 1); break;
            case 'lastMonth':
                start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                end = new Date(today.getFullYear(), today.getMonth(), 0);
                break;
            case 'last7': start.setDate(today.getDate() - 6); break;
            case 'last30': start.setDate(today.getDate() - 29); break;
            default: break;
        }

        setDateRange({
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        });
    };

    const _downloadCSV = (headers, rows, sumRow, filename) => {
        const csvContent = "\uFEFF" + [
            headers.join(','),
            ...rows.map(r => r.join(',')),
            sumRow.join(',')
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportOverviewCSV = () => {
        if (!data?.details?.reports) return;
        const reports = data.details.reports;
        const headers = [
            t('reports.table.date'), 
            t('reports.table.net_sales'), 
            t('reports.table.cost'), 
            t('reports.table.profit'), 
            t('reports.metrics.discounts'), 
            t('reports.table.expenses')
        ];
        const rows = reports.map(r => [r.date, r.totalRevenue, r.totalCost, r.totalRevenue - r.totalCost, r.totalDiscount, r.totalExpenses]);
        const sumRev = reports.reduce((s, r) => s + (r.totalRevenue || 0), 0);
        const sumCost = reports.reduce((s, r) => s + (r.totalCost || 0), 0);
        const sumDisc = reports.reduce((s, r) => s + (r.totalDiscount || 0), 0);
        const sumExp = reports.reduce((s, r) => s + (r.totalExpenses || 0), 0);
        _downloadCSV(headers, rows, ['合計', sumRev, sumCost, sumRev - sumCost, sumDisc, sumExp], `daily_report_${dateRange.start}_${dateRange.end}.csv`);
    };

    const exportProductsCSV = () => {
        if (!data?.analysis?.topProducts) return;
        const products = data.analysis.topProducts;
        const headers = ['商品名稱', '售出數量', '銷售總額', '商品利潤'];
        const rows = products.map(p => [p.name || '未知產品', p.qty, p.revenue, Math.round(p.revenue - (p.cost || 0))]);
        const sumQty = products.reduce((s, p) => s + (p.qty || 0), 0);
        const sumRev = products.reduce((s, p) => s + (p.revenue || 0), 0);
        const sumCost = products.reduce((s, p) => s + (p.cost || 0), 0);
        _downloadCSV(headers, rows, ['合計', sumQty, sumRev, Math.round(sumRev - sumCost)], `product_report_${dateRange.start}_${dateRange.end}.csv`);
    };

    const exportCategoriesCSV = () => {
        if (!data?.analysis?.categorySummary) return;
        const cats = data.analysis.categorySummary;
        const headers = ['類別名稱', '商品總數', '銷售總額', '類別利潤'];
        const rows = cats.map(c => [c.name || '未分類', c.qty, c.revenue, Math.round(c.revenue - (c.cost || 0))]);
        const sumQty = cats.reduce((s, c) => s + (c.qty || 0), 0);
        const sumRev = cats.reduce((s, c) => s + (c.revenue || 0), 0);
        const sumCost = cats.reduce((s, c) => s + (c.cost || 0), 0);
        _downloadCSV(headers, rows, ['合計', sumQty, sumRev, Math.round(sumRev - sumCost)], `category_report_${dateRange.start}_${dateRange.end}.csv`);
    };

    // 6. 圖表資料準備
    const trendChartData = useMemo(() => {
        if (!data?.details?.reports) return null;
        const reports = data.details.reports;
        return {
            labels: reports.map(r => r.date.split('-').slice(1).join('/')),
            datasets: [
                {
                    label: t('reports.charts.revenue'),
                    data: reports.map(r => r.totalRevenue),
                    borderColor: 'hsl(230, 80%, 60%)',
                    backgroundColor: 'rgba(96, 165, 250, 0.1)',
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: t('reports.charts.profit'),
                    data: reports.map(r => r.totalRevenue - r.totalCost),
                    borderColor: '#4ade80',
                    backgroundColor: 'transparent',
                    borderDash: [5, 5],
                    tension: 0.4,
                }
            ]
        };
    }, [data]);

    const pieChartData = useMemo(() => {
        if (!data?.analysis?.categorySummary) return null;
        const cats = data.analysis.categorySummary.filter(c => c.revenue > 0);
        return {
            labels: cats.map(c => c.name || '未分類'),
            datasets: [{
                data: cats.map(c => c.revenue),
                backgroundColor: [
                    'rgba(96, 165, 250, 0.7)',
                    'rgba(74, 222, 128, 0.7)',
                    'rgba(251, 191, 36, 0.7)',
                    'rgba(167, 139, 250, 0.7)',
                    'rgba(248, 113, 113, 0.7)',
                    'rgba(45, 212, 191, 0.7)',
                ],
                borderWidth: 0,
            }]
        };
    }, [data]);

    if (loading && !data) {
        return (
            <div style={fullCenterStyle}>
                <Loader2 className="animate-spin" size={40} color="var(--primary)" />
            </div>
        );
    }

    const { summary } = data || {};

    // 8. 渲染 JSX
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem', width: '100%' }}
        >
            {/* Control Bar (加上了 responsive class 處理手機端換行) */}
            <div className="glass-panel responsive-ctrl-bar" style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.2rem' }}>
                <div className="responsive-date-picker" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', width: 'auto' }}>
                    <div className="responsive-date-container" style={dateInputContainer}>
                        <Calendar size={16} color="var(--text-muted)" />
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="responsive-date-input"
                            style={dateInputStyle}
                        />
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>→</span>
                    <div className="responsive-date-container" style={dateInputContainer}>
                        <Calendar size={16} color="var(--text-muted)" />
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="responsive-date-input"
                            style={dateInputStyle}
                        />
                    </div>
                </div>

                {/* 快捷預設按鈕區：手機端支援橫向滑動 */}
                <div className="responsive-presets" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'nowrap', width: '100%', justifyContent: 'flex-end' }}>
                    {['today', 'yesterday', 'thisWeek', 'thisMonth', 'lastMonth', 'last7', 'last30'].map(p => (
                        <button key={p} className="btn-secondary" onClick={() => handlePreset(p)} style={presetBtnStyle}>
                            {getPresetLabel(p)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Metrics Dashboard (優化最小寬度為 140px，讓手機端能完美呈現 2x2 網格) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                <MetricCard icon={DollarSign} label={t('reports.metrics.total_revenue')} value={summary?.salesIncome} color="#60a5fa" currency={tenantConfig.currency} trend={2.5} />
                <MetricCard icon={TrendingUp} label={t('reports.metrics.gross_profit')} value={summary?.estimatedProfit} color="#4ade80" currency={tenantConfig.currency} trend={5.4} />
                <MetricCard icon={Tag} label={t('reports.metrics.discounts')} value={summary?.totalDiscount} color="#fbbf24" currency={tenantConfig.currency} trend={-1.2} />
                <MetricCard icon={Store} label={t('reports.metrics.expenditure')} value={summary?.storeExpenditure} color="#f87171" currency={tenantConfig.currency} trend={0.8} />
            </div>

            {/* Main Visual Content (加上面平板/手機自動切換單欄 class) */}
            <div className="responsive-grid-visual" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                {/* Trend Chart */}
                <div className="glass-panel" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}><Activity size={20} color="var(--primary)" /> {t('reports.charts.trend_title')}</h3>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{dateRange.start} ~ {dateRange.end}</div>
                    </div>
                    <div style={{ flex: 1, minHeight: '260px', height: '100%' }}>
                        {trendChartData && <Line data={trendChartData} options={lineOptions} />}
                    </div>
                </div>

                {/* Category Pie */}
                <div className="glass-panel" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', fontSize: '1.1rem' }}><PieChartIcon size={20} color="var(--secondary)" /> {t('reports.charts.category_pie')}</h3>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                        {pieChartData && <div style={{ width: '70%', maxWidth: '220px', position: 'relative' }}>
                            <Pie data={pieChartData} options={pieOptions} />
                        </div>}
                    </div>
                    {data?.analysis?.categorySummary && (
                        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {data.analysis.categorySummary.slice(0, 4).map((c, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginRight: '8px' }}>{c.name || '未分類'}</span>
                                    <span style={{ fontWeight: 600, flexShrink: 0 }}>{tenantConfig.currency}{c.revenue?.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Data Table Section */}
            <div className="glass-panel" style={{ padding: '0', minWidth: 0 }}>
                <div className="responsive-table-header" style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label={t('reports.tabs.daily_detail')} />
                        <TabButton active={activeTab === 'products'} onClick={() => setActiveTab('products')} label={t('reports.tabs.hot_products')} />
                        <TabButton active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} label={t('reports.tabs.category_analysis')} />
                    </div>
                    <button
                        className="btn-primary"
                        onClick={activeTab === 'products' ? exportProductsCSV : activeTab === 'categories' ? exportCategoriesCSV : exportOverviewCSV}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    >
                        <Download size={16} /> 
                        {t('reports.export.button', { 
                            type: t(`reports.export.type_${activeTab === 'products' ? 'product' : activeTab === 'categories' ? 'category' : 'detail'}`) 
                        })}
                    </button>
                </div>
                
                {/* 滾動條容器，在小螢幕自動啟用橫向手勢滑動表格 */}
                <div style={{ padding: '0.5rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table style={modernTableStyle}>
                        <thead>
                            {activeTab === 'overview' ? (
                                <tr>
                                    <th>{t('reports.table.date')}</th>
                                    <th className="text-right">{t('reports.table.net_sales')}</th>
                                    <th className="text-right">{t('reports.table.cost')}</th>
                                    <th className="text-right">{t('reports.table.profit')}</th>
                                    <th className="text-right">{t('reports.table.expenses')}</th>
                                    <th className="text-center">{t('reports.table.margin')}</th>
                                </tr>
                            ) : activeTab === 'products' ? (
                                <tr>
                                    <th>{t('reports.table.product_name')}</th>
                                    <th className="text-center">{t('reports.table.qty_sold')}</th>
                                    <th className="text-right">{t('reports.table.total_sales')}</th>
                                    <th className="text-right">{t('reports.table.profit')}</th>
                                    <th className="text-center">{t('reports.table.performance')}</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th>{t('reports.table.category_name')}</th>
                                    <th className="text-center">{t('reports.table.total_items')}</th>
                                    <th className="text-right">{t('reports.table.total_sales')}</th>
                                    <th className="text-right">{t('reports.table.profit')}</th>
                                    <th className="text-center">{t('reports.table.share')}</th>
                                </tr>
                            )}
                        </thead>
                        <tbody>
                            {activeTab === 'overview' && data?.details?.reports?.map((r, i) => {
                                const profit = r.totalRevenue - r.totalCost;
                                const margin = r.totalRevenue > 0 ? (profit / r.totalRevenue) * 100 : 0;
                                return (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{r.date}</td>
                                        <td className="text-right">{tenantConfig.currency}{r.totalRevenue.toLocaleString()}</td>
                                        <td className="text-right" style={{ color: 'var(--text-muted)' }}>{tenantConfig.currency}{r.totalCost.toLocaleString()}</td>
                                        <td className="text-right" style={{ color: '#4ade80', fontWeight: 600 }}>{tenantConfig.currency}{profit.toLocaleString()}</td>
                                        <td className="text-right">{tenantConfig.currency}{r.totalExpenses.toLocaleString()}</td>
                                        <td className="text-center">
                                            <span style={marginBadgeStyle(margin)}>{margin.toFixed(1)}%</span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {activeTab === 'overview' && data?.details?.reports?.length > 0 && (() => {
                                const reps = data.details.reports;
                                const sumRev = reps.reduce((s, r) => s + (r.totalRevenue || 0), 0);
                                const sumCost = reps.reduce((s, r) => s + (r.totalCost || 0), 0);
                                const sumProfit = sumRev - sumCost;
                                const sumExp = reps.reduce((s, r) => s + (r.totalExpenses || 0), 0);
                                const sumMargin = sumRev > 0 ? (sumProfit / sumRev) * 100 : 0;
                                return (
                                    <tr style={{ background: 'rgba(96, 165, 250, 0.06)' }}>
                                        <td style={{ fontWeight: 800 }}>{t('reports.table.total')}</td>
                                        <td className="text-right" style={{ fontWeight: 800 }}>{tenantConfig.currency}{sumRev.toLocaleString()}</td>
                                        <td className="text-right" style={{ fontWeight: 800 }}>{tenantConfig.currency}{sumCost.toLocaleString()}</td>
                                        <td className="text-right" style={{ fontWeight: 800, color: '#4ade80' }}>{tenantConfig.currency}{sumProfit.toLocaleString()}</td>
                                        <td className="text-right" style={{ fontWeight: 800 }}>{tenantConfig.currency}{sumExp.toLocaleString()}</td>
                                        <td className="text-center"><span style={marginBadgeStyle(sumMargin)}>{sumMargin.toFixed(1)}%</span></td>
                                    </tr>
                                );
                            })()}
                            {activeTab === 'products' && data?.analysis?.topProducts?.map((p, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 500, minWidth: '120px' }}>{p.name || t('reports.table.unknown_product')}</td>
                                    <td className="text-center" style={{ whiteSpace: 'nowrap' }}>{p.qty} {t('reports.table.unit')}</td>
                                    <td className="text-right">{tenantConfig.currency}{p.revenue.toLocaleString()}</td>
                                    <td className="text-right" style={{ color: '#4ade80' }}>{tenantConfig.currency}{(p.revenue - (p.cost || 0)).toLocaleString()}</td>
                                    <td className="text-center">
                                        <div style={{ height: '4px', width: '50px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', margin: '0 auto' }}>
                                            <div style={{ height: '100%', width: `${Math.min(100, (p.revenue / (summary?.salesIncome || 1)) * 500)}%`, background: 'var(--primary)', borderRadius: '2px' }} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {activeTab === 'products' && data?.analysis?.topProducts?.length > 0 && (() => {
                                const prods = data.analysis.topProducts;
                                const sumQty = prods.reduce((s, p) => s + (p.qty || 0), 0);
                                const sumRev = prods.reduce((s, p) => s + (p.revenue || 0), 0);
                                const sumCost = prods.reduce((s, p) => s + (p.cost || 0), 0);
                                return (
                                    <tr style={{ background: 'rgba(96, 165, 250, 0.06)' }}>
                                        <td style={{ fontWeight: 800 }}>{t('reports.table.total')}</td>
                                        <td className="text-center" style={{ fontWeight: 800 }}>{sumQty} 件</td>
                                        <td className="text-right" style={{ fontWeight: 800 }}>{tenantConfig.currency}{sumRev.toLocaleString()}</td>
                                        <td className="text-right" style={{ fontWeight: 800, color: '#4ade80' }}>{tenantConfig.currency}{(sumRev - sumCost).toLocaleString()}</td>
                                        <td></td>
                                    </tr>
                                );
                            })()}
                            {activeTab === 'categories' && data?.analysis?.categorySummary?.map((c, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{c.name || '未分類'}</td>
                                    <td className="text-center" style={{ whiteSpace: 'nowrap' }}>{c.qty} 件</td>
                                    <td className="text-right">{tenantConfig.currency}{c.revenue.toLocaleString()}</td>
                                    <td className="text-right" style={{ color: '#60a5fa' }}>{tenantConfig.currency}{(c.revenue - (c.cost || 0)).toLocaleString()}</td>
                                    <td className="text-center">{((c.revenue / (summary?.salesIncome || 1)) * 100).toFixed(1)}%</td>
                                </tr>
                            ))}
                            {activeTab === 'categories' && data?.analysis?.categorySummary?.length > 0 && (() => {
                                const cats = data.analysis.categorySummary;
                                const sumQty = cats.reduce((s, c) => s + (c.qty || 0), 0);
                                const sumRev = cats.reduce((s, c) => s + (c.revenue || 0), 0);
                                const sumCost = cats.reduce((s, c) => s + (c.cost || 0), 0);
                                return (
                                    <tr style={{ background: 'rgba(96, 165, 250, 0.06)' }}>
                                        <td style={{ fontWeight: 800 }}>{t('reports.table.total')}</td>
                                        <td className="text-center" style={{ fontWeight: 800 }}>{sumQty} 件</td>
                                        <td className="text-right" style={{ fontWeight: 800 }}>{tenantConfig.currency}{sumRev.toLocaleString()}</td>
                                        <td className="text-right" style={{ fontWeight: 800, color: '#60a5fa' }}>{tenantConfig.currency}{(sumRev - sumCost).toLocaleString()}</td>
                                        <td className="text-center" style={{ fontWeight: 800 }}>100%</td>
                                    </tr>
                                );
                            })()}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

// Sub-components
const MetricCard = ({ icon: Icon, label, value, color, currency, trend }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        className="glass-panel animate-fade-in"
        style={{ padding: '1rem', position: 'relative', overflow: 'hidden' }}
    >
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.03 }}>
            <Icon size={80} color={color} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
            <div style={{ padding: '0.5rem', background: `${color}15`, borderRadius: '10px' }}>
                <Icon size={18} color={color} />
            </div>
            {trend && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.75rem', fontWeight: 600, color: trend > 0 ? '#4ade80' : '#f87171' }}>
                    {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.2rem', fontWeight: 500, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{label}</div>
        <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.5px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {currency}{value?.toLocaleString() || 0}
        </div>
    </motion.div>
);

const TabButton = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        style={{
            background: 'transparent',
            border: 'none',
            padding: '0.5rem 0',
            color: active ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            position: 'relative',
            transition: 'color 0.3s ease',
            whiteSpace: 'nowrap'
        }}
    >
        {label}
        {active && (
            <motion.div
                layoutId="tab-underline"
                style={{ position: 'absolute', bottom: '-1.25rem', left: 0, right: 0, height: '3px', background: 'var(--primary)', borderRadius: '3px 3px 0 0' }}
            />
        )}
    </button>
);

// Helpers
const marginBadgeStyle = (m) => ({
    padding: '3px 6px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 700,
    background: m > 30 ? 'rgba(74, 222, 128, 0.15)' : 'rgba(251, 191, 36, 0.15)',
    color: m > 30 ? '#4ade80' : '#fbbf24',
    whiteSpace: 'nowrap'
});

// Chart Options
const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: 12,
            titleFont: { size: 14 },
            bodyFont: { size: 13 },
            displayColors: false
        }
    },
    scales: {
        y: {
            grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
            ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } }
        },
        x: {
            grid: { display: false },
            ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } }
        }
    }
};

const pieOptions = {
    plugins: {
        legend: { display: false }
    },
    maintainAspectRatio: true,
};

// Inline Styles
const fullCenterStyle = { height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const dateInputContainer = { display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 0.8rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' };
const dateInputStyle = { background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.9rem', width: '105px' };
const presetBtnStyle = { padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '10px', flexShrink: 0 };
const modernTableStyle = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0 8px',
    fontSize: '0.9rem'
};
export default RevenueReport;