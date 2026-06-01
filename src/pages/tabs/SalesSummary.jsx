import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
    TrendingUp, Users, ShoppingBag, DollarSign,
    ArrowUpRight, ArrowDownRight, Loader2, Download
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement, LineElement,
    Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getReportSummary } from '../../api/reports';
import { useTenant } from '../../contexts/TenantContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const SalesSummary = () => {
    const { t } = useTranslation();
    const { tenantConfig } = useTenant();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dateRange, setDateRange] = useState({ start: '2026-05-03', end: '2026-06-01' });
    const [timeFilter, setTimeFilter] = useState('all');
    const [employeeFilter, setEmployeeFilter] = useState('all');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        fetchSummary();
        const interval = setInterval(fetchSummary, 60000);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearInterval(interval);
        };
    }, []);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const result = await getReportSummary();
            if (result.success) setSummary(result.data);
            else setError(t('common.error_load_data'));
        } catch (err) {
            setError(t('common.error_load_data'));
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

    const businessData = summary?.businessSummary || {};
    const salesTrend = businessData.salesTrend || [];

    const chartData = {
        labels: salesTrend.map(d => d.date) || [],
        datasets: [{
            fill: true,
            label: t('dashboard.sales_trend'),
            data: salesTrend.map(d => d.totalRevenue) || [],
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
            tooltip: {
                callbacks: {
                    label: (context) => `${t('dashboard.sales_trend')}: ${tenantConfig.currency}${context.parsed.y.toLocaleString()}`
                }
            }
        },
        scales: {
            y: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: 'hsl(0,0%,70%)', callback: (value) => `${tenantConfig.currency}${value.toLocaleString()}` }
            },
            x: { grid: { display: false }, ticks: { color: 'hsl(0,0%,70%)' } },
        },
    };

    const kpiCards = [
        { label: t('dashboard.today_sales', '銷售總額'), value: `${tenantConfig.currency}${(businessData.latestSales || 0).toLocaleString()}`, change: '+58.56%', positive: true },
        { label: t('dashboard.refund', '退款'), value: `${tenantConfig.currency}0`, change: '-100%', positive: false },
        { label: t('dashboard.discount', '折扣'), value: `${tenantConfig.currency}${(businessData.totalDiscount || 811000).toLocaleString()}`, change: '-54.78%', positive: false },
        { label: t('dashboard.net_sales', '淨銷售額'), value: `${tenantConfig.currency}${(businessData.netSales || 159935000).toLocaleString()}`, change: '+60.61%', positive: true },
        { label: t('dashboard.gross_profit', '毛利潤'), value: `${tenantConfig.currency}${(businessData.grossProfit || 32257900).toLocaleString()}`, change: '+46.61%', positive: true },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}
        >
            {/* Filter Bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('report.date_range', '日期範圍')}:</span>
                    <span style={{ fontSize: '0.85rem' }}>3 May 2026 – 1 Jun 2026</span>
                </div>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('report.time', '時間段')}:</span>
                    <span style={{ fontSize: '0.85rem' }}>{t('report.all_day', '全天')}</span>
                </div>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('report.employee', '員工')}:</span>
                    <span style={{ fontSize: '0.85rem' }}>{t('report.all_employees', '所有員工')}</span>
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                {kpiCards.map((kpi, idx) => (
                    <div key={idx} className="glass-panel" style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{kpi.label}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: kpi.positive ? '#4ade80' : '#f87171', fontSize: '0.75rem', fontWeight: 600 }}>
                                {kpi.change} {kpi.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            </span>
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
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>

            {/* Daily Detail Table */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>{t('report.daily_detail', '每日明細')}</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)' }}>
                            <Download size={14} /> {t('common.export', '匯出')}
                        </button>
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
                            {salesTrend.slice(0, 10).map((row, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '0.75rem 0.5rem' }}>{row.date || `Day ${idx + 1}`}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{tenantConfig.currency}{(row.totalRevenue || 0).toLocaleString()}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{tenantConfig.currency}{(row.cost || 0).toLocaleString()}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{tenantConfig.currency}{((row.totalRevenue || 0) - (row.cost || 0)).toLocaleString()}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#4ade80' }}>
                                        {row.totalRevenue ? ((((row.totalRevenue - (row.cost || 0)) / row.totalRevenue) * 100).toFixed(1)) : 0}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{t('common.page_info', '頁面：1 分之 1')}</span>
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

export default SalesSummary;
