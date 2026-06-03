import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Users,
    ShoppingBag,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Loader2
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getReportSummary } from '../api/reports';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import GuidedTour from '../components/GuidedTour';
import { pageTours } from '../utils/pageTours';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Dashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { tenantConfig } = useTenant();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // 監聽螢幕寬度，用來處理圖表 RWD 與特定內聯樣式
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize(); // 初始執行一次
        window.addEventListener('resize', handleResize);
        
        fetchSummary();

        const intervalId = setInterval(() => {
            fetchSummary();
        }, 60000);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearInterval(intervalId);
        };
    }, []);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const result = await getReportSummary();
            if (result.success) {
                setSummary(result.data);
            } else {
                setError(t('common.error_load_data'));
            }
        } catch (err) {
            setError(t('common.error_load_data'));
            console.error(err);
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

    if (error || !summary) {
        return (
            <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#f87171', gap: '1rem' }}>
                <p>{error || t('common.error_load_data')}</p>
                <button className="btn-secondary" onClick={fetchSummary}>{t('common.retry')}</button>
            </div>
        );
    }

    const systemStats = summary.systemStats || {};
    const agentStats = summary.agentStats || {};
    const businessData = summary.businessSummary || {};
    const salesTrend = summary?.salesTrend || [];

    let todaySales = businessData.latestSales || 0;

    if (salesTrend.length > 0) {
        const lastDayData = salesTrend[salesTrend.length - 1];
        if (lastDayData && typeof lastDayData.totalRevenue !== 'undefined') {
            todaySales = lastDayData.totalRevenue;
        }
    }

    const chartData = {
        labels: businessData.salesTrend?.map(d => d.date) || [],
        datasets: [
            {
                fill: true,
                label: t('dashboard.sales_trend'),
                data: businessData.salesTrend?.map(d => d.totalRevenue) || [],
                borderColor: 'hsl(230, 80%, 60%)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false, // 允許圖表根據容器自適應高度
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
                ticks: {
                    color: 'hsl(0,0%,70%)',
                    callback: (value) => `${tenantConfig.currency}${value.toLocaleString()}`
                }
            },
            x: { grid: { display: false }, ticks: { color: 'hsl(0,0%,70%)' } },
        },
    };

    return (<>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="animate-fade-in"
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: isMobile ? '0.5rem' : '0' }}
        >
            {/* Header 區塊在手機端改為上下排列 */}
            <div data-tour-id="dashboard-header" style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <h2 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem' }}>{summary.personal?.tenantId || user?.tenantId} {t('dashboard.title')}</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {t('common.last_update')}：{businessData.lastUpdate ? businessData.lastUpdate : t('common.no_data_today')}
                </span>
            </div>

            {/* Stats Grid: 手機端降為 1 或 2 欄，避免寬度卡死 */}
            <div data-tour-id="dashboard-stats" style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? 'repeat(auto-fit, minmax(140px, 1fr))' : 'repeat(auto-fit, minmax(240px, 1fr))', 
                gap: isMobile ? '0.75rem' : '1.5rem' 
            }}>
                {user?.role <= 2 ? (
                    <>
                        <StatCard icon={Users} label={t('dashboard.total_tenants')} value={systemStats.totalTenants || 0} change="System" positive isMobile={isMobile} />
                        <StatCard icon={Users} label={t('dashboard.active_tenants')} value={systemStats.activeTenants || 0} change="Live" positive isMobile={isMobile} />
                        <StatCard icon={ShoppingBag} label={t('dashboard.total_products')} value={systemStats.totalProducts || 0} change="Total" positive isMobile={isMobile} />
                        <StatCard icon={TrendingUp} label={t('dashboard.archive_progress')} value={`${systemStats.archivedProgress || 0}`} change="Stable" positive isMobile={isMobile} />
                    </>
                ) : user?.role === 3 ? (
                    <>
                        <StatCard icon={Users} label={t('dashboard.managed_tenants')} value={agentStats.subTenantCount || 0} change="+0" positive isMobile={isMobile} />
                        <StatCard icon={Users} label={t('dashboard.managed_accounts')} value={agentStats.totalUsersManaged || 0} change="+0" positive isMobile={isMobile} />
                        <StatCard icon={DollarSign} label={t('dashboard.est_inventory_value')} value={`${tenantConfig.currency}${businessData.inventory?.totalValue?.toLocaleString() || 0}`} change="Live" positive isMobile={isMobile} />
                        <StatCard icon={ShoppingBag} label={t('dashboard.managed_product_count')} value={businessData.inventory?.totalItems || 0} change="Items" positive isMobile={isMobile} />
                    </>
                ) : (
                    <>
                        <StatCard icon={DollarSign} label={t('dashboard.today_sales')} value={`${tenantConfig.currency}${todaySales.toLocaleString()}`} change="Live" positive isMobile={isMobile} />
                        <StatCard icon={TrendingUp} label={t('dashboard.inventory_total_value')} value={`${tenantConfig.currency}${businessData.inventory?.totalValue?.toLocaleString() || 0}`} change="Stock" positive isMobile={isMobile} />
                        <StatCard icon={ShoppingBag} label={t('dashboard.stock_count')} value={businessData.inventory?.totalItems || 0} change="Units" positive={businessData.inventory?.totalItems > 0} isMobile={isMobile} />
                        <StatCard icon={Users} label={t('dashboard.current_user')} value={summary.personal?.username || 'Admin'} change="Online" positive isMobile={isMobile} />
                    </>
                )}
            </div>

            {/* Main Row: 手機端寬度不足時自動切換為一整行（1fr） */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', 
                gap: isMobile ? '1rem' : '1.5rem' 
            }}>
                {/* 趨勢圖 */}
                <div data-tour-id="dashboard-chart" className="glass-panel" style={{ padding: isMobile ? '1rem' : '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
                        {t('dashboard.sales_trend')} <ArrowUpRight size={18} color="var(--primary)" />
                    </h3>
                    {/* 給予圖表固定或百分比高度，搭配 maintainAspectRatio: false 避免手機端壓扁 */}
                    <div style={{ height: isMobile ? '200px' : '300px', width: '100%' }}>
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>

                {/* 熱門商品 */}
                <div data-tour-id="dashboard-products" className="glass-panel" style={{ padding: isMobile ? '1rem' : '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: isMobile ? '1.1rem' : '1.25rem' }}>{t('dashboard.popular_products')}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {businessData.topProducts?.length > 0 ? (
                            businessData.topProducts.map((p, idx) => (
                                <ProductItem
                                    key={p.productId?._id || idx}
                                    name={p.productId?.name || 'Unknown'}
                                    sales={p.qty}
                                    price={`${tenantConfig.currency}${p.revenue?.toLocaleString()}`}
                                    t={t}
                                />
                            ))
                        ) : (
                            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                                {t('dashboard.no_popular_products')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>

        <GuidedTour tourId="dashboard" steps={pageTours.dashboard(t)} />
        </>
    );
};

// 數據卡片子元件優化 RWD 內距與字型大小
const StatCard = ({ icon: Icon, label, value, change, positive, isMobile }) => (
    <div className="glass-panel" style={{ padding: isMobile ? '1rem' : '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.4rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)' }}>
                <Icon size={isMobile ? 18 : 20} color="var(--primary)" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: positive ? '#4ade80' : '#f87171', fontSize: '0.75rem', fontWeight: 600 }}>
                {change} {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            </div>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: isMobile ? '0.8rem' : '0.9rem', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: isMobile ? '1.4rem' : '1.8rem', fontWeight: 700, wordBreak: 'break-all' }}>{value}</div>
    </div>
);

const ProductItem = ({ name, sales, price, t }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)' }}>
        <div style={{ minWidth: 0, flex: 1, marginRight: '0.5rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t('dashboard.sold')} {sales}</div>
        </div>
        <div style={{ fontWeight: 700, color: 'var(--primary-light)', fontSize: '0.9rem', flexShrink: 0 }}>{price}</div>
    </div>
);

export default Dashboard;