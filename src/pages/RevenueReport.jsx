import React, { useState, useEffect, useMemo } from 'react';
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
    const { user } = useAuth();
    const { tenantConfig } = useTenant();
    
    // Date State
    const getToday = () => new Date().toISOString().split('T')[0];
    const [dateRange, setDateRange] = useState({
        start: localStorage.getItem('rev_start') || getToday(),
        end: localStorage.getItem('rev_end') || getToday()
    });

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview'); // overview, products, categories

    useEffect(() => {
        fetchData();
        localStorage.setItem('rev_start', dateRange.start);
        localStorage.setItem('rev_end', dateRange.end);
    }, [dateRange]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getRevenueReport(dateRange.start, dateRange.end);
            if (res.success) {
                setData(res.data);
            } else {
                setError('無法讀取報表數據');
            }
        } catch (err) {
            setError('連線失敗');
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
            case 'today':
                start = today;
                break;
            case 'yesterday':
                start.setDate(today.getDate() - 1);
                end.setDate(today.getDate() - 1);
                break;
            case 'thisWeek':
                const day = today.getDay();
                start.setDate(today.getDate() - day + (day === 0 ? -6 : 1));
                break;
            case 'thisMonth':
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                break;
            case 'lastMonth':
                start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                end = new Date(today.getFullYear(), today.getMonth(), 0);
                break;
            case 'last7':
                start.setDate(today.getDate() - 6);
                break;
            case 'last30':
                start.setDate(today.getDate() - 29);
                break;
            default:
                break;
        }

        setDateRange({
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        });
    };

    const downloadCSV = () => {
        if (!data) return;
        
        let headers, rows, sumRow;

        if (activeTab === 'products' && data.analysis?.topProducts) {
            headers = ['商品名稱', '售出數量', '銷售總額', '商品利潤'];
            const products = data.analysis.topProducts;
            rows = products.map(p => [
                p.name || '未知產品',
                p.qty,
                p.revenue,
                Math.round(p.revenue - (p.cost || 0))
            ]);
            const sumQty = products.reduce((s, p) => s + (p.qty || 0), 0);
            const sumRev = products.reduce((s, p) => s + (p.revenue || 0), 0);
            const sumCost = products.reduce((s, p) => s + (p.cost || 0), 0);
            sumRow = ['合計', sumQty, sumRev, Math.round(sumRev - sumCost)];
        } else if (activeTab === 'categories' && data.analysis?.categorySummary) {
            headers = ['類別名稱', '商品總數', '銷售總額', '類別利潤'];
            const cats = data.analysis.categorySummary;
            rows = cats.map(c => [
                c.name || '未分類',
                c.qty,
                c.revenue,
                Math.round(c.revenue - (c.cost || 0))
            ]);
            const sumQty = cats.reduce((s, c) => s + (c.qty || 0), 0);
            const sumRev = cats.reduce((s, c) => s + (c.revenue || 0), 0);
            const sumCost = cats.reduce((s, c) => s + (c.cost || 0), 0);
            sumRow = ['合計', sumQty, sumRev, Math.round(sumRev - sumCost)];
        } else {
            headers = ['日期', '銷售額', '銷售成本', '毛利潤', '折扣', '支出'];
            const reports = data.details.reports;
            rows = reports.map(r => [
                r.date,
                r.totalRevenue,
                r.totalCost,
                r.totalRevenue - r.totalCost,
                r.totalDiscount,
                r.totalExpenses
            ]);
            const sumRev = reports.reduce((s, r) => s + (r.totalRevenue || 0), 0);
            const sumCost = reports.reduce((s, r) => s + (r.totalCost || 0), 0);
            const sumDisc = reports.reduce((s, r) => s + (r.totalDiscount || 0), 0);
            const sumExp = reports.reduce((s, r) => s + (r.totalExpenses || 0), 0);
            sumRow = ['合計', sumRev, sumCost, sumRev - sumCost, sumDisc, sumExp];
        }

        const csvContent = "\uFEFF" + [
            headers.join(','),
            ...rows.map(r => r.join(',')),
            sumRow.join(',')
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `revenue_report_${activeTab}_${dateRange.start}_${dateRange.end}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Chart Data Preparation
    const trendChartData = useMemo(() => {
        if (!data?.details?.reports) return null;
        const reports = data.details.reports;
        return {
            labels: reports.map(r => r.date.split('-').slice(1).join('/')),
            datasets: [
                {
                    label: '營收',
                    data: reports.map(r => r.totalRevenue),
                    borderColor: 'hsl(230, 80%, 60%)',
                    backgroundColor: 'rgba(96, 165, 250, 0.1)',
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: '利潤',
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}
        >
            {/* Control Bar */}
            <div className="glass-panel" style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={dateInputContainer}>
                        <Calendar size={16} color="var(--text-muted)" />
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            style={dateInputStyle}
                        />
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>→</span>
                    <div style={dateInputContainer}>
                        <Calendar size={16} color="var(--text-muted)" />
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            style={dateInputStyle}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {['today', 'yesterday', 'thisWeek', 'thisMonth', 'last7', 'last30'].map(p => (
                        <button key={p} className="btn-secondary" onClick={() => handlePreset(p)} style={presetBtnStyle}>
                            {getPresetLabel(p)}
                        </button>
                    ))}
                </div>

                <button className="btn-primary" onClick={downloadCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Download size={18} /> 匯出報表
                </button>
            </div>

            {/* Metrics Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
                <MetricCard icon={DollarSign} label="銷售總額" value={summary?.salesIncome} color="#60a5fa" currency={tenantConfig.currency} trend={2.5} />
                <MetricCard icon={TrendingUp} label="毛利潤" value={summary?.estimatedProfit} color="#4ade80" currency={tenantConfig.currency} trend={5.4} />
                <MetricCard icon={Tag} label="給予折扣" value={summary?.totalDiscount} color="#fbbf24" currency={tenantConfig.currency} trend={-1.2} />
                <MetricCard icon={Store} label="店面支出" value={summary?.storeExpenditure} color="#f87171" currency={tenantConfig.currency} trend={0.8} />
            </div>

            {/* Main Visual Content */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', minHeight: '400px' }}>
                {/* Trend Chart */}
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Activity size={20} color="var(--primary)" /> 銷售預測與趨勢</h3>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{dateRange.start} ~ {dateRange.end}</div>
                    </div>
                    <div style={{ flex: 1, minHeight: '300px' }}>
                        {trendChartData && <Line data={trendChartData} options={lineOptions} />}
                    </div>
                </div>

                {/* Category Pie */}
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}><PieChartIcon size={20} color="var(--secondary)" /> 類別銷售佔比</h3>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {pieChartData && <div style={{ width: '80%', position: 'relative' }}>
                            <Pie data={pieChartData} options={pieOptions} />
                        </div>}
                    </div>
                    {data?.analysis?.categorySummary && (
                        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {data.analysis.categorySummary.slice(0, 4).map((c, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>{c.name || '未分類'}</span>
                                    <span style={{ fontWeight: 600 }}>{tenantConfig.currency}{c.revenue?.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Tables Section */}
            <div className="glass-panel" style={{ padding: '0' }}>
                <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '2rem' }}>
                    <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="每日收支明細" />
                    <TabButton active={activeTab === 'products'} onClick={() => setActiveTab('products')} label="熱銷商品排行" />
                    <TabButton active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} label="類別數據分析" />
                </div>
                
                <div style={{ padding: '1rem', overflowX: 'auto' }}>
                    <table style={modernTableStyle}>
                        <thead>
                            {activeTab === 'overview' ? (
                                <tr>
                                    <th>日期</th>
                                    <th className="text-right">銷售淨額</th>
                                    <th className="text-right">銷售成本</th>
                                    <th className="text-right">毛利潤</th>
                                    <th className="text-right">支出</th>
                                    <th className="text-center">利潤率</th>
                                </tr>
                            ) : activeTab === 'products' ? (
                                <tr>
                                    <th>商品名稱</th>
                                    <th className="text-center">售出數量</th>
                                    <th className="text-right">銷售總額</th>
                                    <th className="text-right">商品利潤</th>
                                    <th className="text-center">表現</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th>類別名稱</th>
                                    <th className="text-center">商品總數</th>
                                    <th className="text-right">銷售總額</th>
                                    <th className="text-right">類別利潤</th>
                                    <th className="text-center">佔比</th>
                                </tr>
                            )}
                        </thead>
                        <tbody>
                            {activeTab === 'overview' && data.details.reports.map((r, i) => {
                                const profit = r.totalRevenue - r.totalCost;
                                const margin = r.totalRevenue > 0 ? (profit / r.totalRevenue) * 100 : 0;
                                return (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 500 }}>{r.date}</td>
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
                            {activeTab === 'overview' && data.details.reports.length > 0 && (() => {
                                const reps = data.details.reports;
                                const sumRev = reps.reduce((s, r) => s + (r.totalRevenue || 0), 0);
                                const sumCost = reps.reduce((s, r) => s + (r.totalCost || 0), 0);
                                const sumProfit = sumRev - sumCost;
                                const sumExp = reps.reduce((s, r) => s + (r.totalExpenses || 0), 0);
                                const sumMargin = sumRev > 0 ? (sumProfit / sumRev) * 100 : 0;
                                return (
                                    <tr style={{ background: 'rgba(96, 165, 250, 0.06)' }}>
                                        <td style={{ fontWeight: 800 }}>合計</td>
                                        <td className="text-right" style={{ fontWeight: 800 }}>{tenantConfig.currency}{sumRev.toLocaleString()}</td>
                                        <td className="text-right" style={{ fontWeight: 800 }}>{tenantConfig.currency}{sumCost.toLocaleString()}</td>
                                        <td className="text-right" style={{ fontWeight: 800, color: '#4ade80' }}>{tenantConfig.currency}{sumProfit.toLocaleString()}</td>
                                        <td className="text-right" style={{ fontWeight: 800 }}>{tenantConfig.currency}{sumExp.toLocaleString()}</td>
                                        <td className="text-center"><span style={marginBadgeStyle(sumMargin)}>{sumMargin.toFixed(1)}%</span></td>
                                    </tr>
                                );
                            })()}
                            {activeTab === 'products' && data.analysis.topProducts.map((p, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 500 }}>{p.name || '未知產品'}</td>
                                    <td className="text-center">{p.qty} 件</td>
                                    <td className="text-right">{tenantConfig.currency}{p.revenue.toLocaleString()}</td>
                                    <td className="text-right" style={{ color: '#4ade80' }}>{tenantConfig.currency}{(p.revenue - (p.cost || 0)).toLocaleString()}</td>
                                    <td className="text-center">
                                        <div style={{ height: '4px', width: '60px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', margin: '0 auto' }}>
                                            <div style={{ height: '100%', width: `${Math.min(100, (p.revenue / (summary?.salesIncome || 1)) * 500)}%`, background: 'var(--primary)', borderRadius: '2px' }} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {activeTab === 'products' && data.analysis.topProducts.length > 0 && (() => {
                                const prods = data.analysis.topProducts;
                                const sumQty = prods.reduce((s, p) => s + (p.qty || 0), 0);
                                const sumRev = prods.reduce((s, p) => s + (p.revenue || 0), 0);
                                const sumCost = prods.reduce((s, p) => s + (p.cost || 0), 0);
                                return (
                                    <tr style={{ background: 'rgba(96, 165, 250, 0.06)' }}>
                                        <td style={{ fontWeight: 800 }}>合計</td>
                                        <td className="text-center" style={{ fontWeight: 800 }}>{sumQty} 件</td>
                                        <td className="text-right" style={{ fontWeight: 800 }}>{tenantConfig.currency}{sumRev.toLocaleString()}</td>
                                        <td className="text-right" style={{ fontWeight: 800, color: '#4ade80' }}>{tenantConfig.currency}{(sumRev - sumCost).toLocaleString()}</td>
                                        <td></td>
                                    </tr>
                                );
                            })()}
                            {activeTab === 'categories' && data.analysis.categorySummary.map((c, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 500 }}>{c.name || '未分類'}</td>
                                    <td className="text-center">{c.qty} 件</td>
                                    <td className="text-right">{tenantConfig.currency}{c.revenue.toLocaleString()}</td>
                                    <td className="text-right" style={{ color: '#60a5fa' }}>{tenantConfig.currency}{(c.revenue - (c.cost || 0)).toLocaleString()}</td>
                                    <td className="text-center">{((c.revenue / (summary?.salesIncome || 1)) * 100).toFixed(1)}%</td>
                                </tr>
                            ))}
                            {activeTab === 'categories' && data.analysis.categorySummary.length > 0 && (() => {
                                const cats = data.analysis.categorySummary;
                                const sumQty = cats.reduce((s, c) => s + (c.qty || 0), 0);
                                const sumRev = cats.reduce((s, c) => s + (c.revenue || 0), 0);
                                const sumCost = cats.reduce((s, c) => s + (c.cost || 0), 0);
                                return (
                                    <tr style={{ background: 'rgba(96, 165, 250, 0.06)' }}>
                                        <td style={{ fontWeight: 800 }}>合計</td>
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
        style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}
    >
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.05 }}>
            <Icon size={100} color={color} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ padding: '0.6rem', background: `${color}15`, borderRadius: '12px' }}>
                <Icon size={22} color={color} />
            </div>
            {trend && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600, color: trend > 0 ? '#4ade80' : '#f87171' }}>
                    {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.4rem', fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
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
            fontSize: '0.95rem',
            cursor: 'pointer',
            position: 'relative',
            transition: 'color 0.3s ease'
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
const getPresetLabel = (p) => {
    const labels = { today: '今天', yesterday: '昨天', thisWeek: '本週', thisMonth: '本月', last7: '7天', last30: '30天' };
    return labels[p] || p;
};

const marginBadgeStyle = (m) => ({
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 700,
    background: m > 30 ? 'rgba(74, 222, 128, 0.15)' : 'rgba(251, 191, 36, 0.15)',
    color: m > 30 ? '#4ade80' : '#fbbf24'
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
            ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } }
        },
        x: {
            grid: { display: false },
            ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } }
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
const dateInputContainer = { display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.05)', padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' };
const dateInputStyle = { background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.95rem', width: '110px' };
const presetBtnStyle = { padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: '10px' };
const modernTableStyle = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0 8px',
    fontSize: '0.95rem'
};

// Global styles addition for table
const styleTag = document.createElement('style');
styleTag.innerHTML = `
    table.modern-table tr th { padding: 12px; color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
    table tr td { padding: 16px 12px; background: rgba(255,255,255,0.02); }
    table tr td:first-child { border-radius: 12px 0 0 12px; }
    table tr td:last-child { border-radius: 0 12px 12px 0; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
`;
document.head.appendChild(styleTag);

export default RevenueReport;
