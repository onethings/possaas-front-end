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
    const { user } = useAuth();
    const { tenantConfig } = useTenant();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { t } = useTranslation();

    useEffect(() => {
        fetchSummary();
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
    const businessData = summary.businessSummary || {}; // 確保後端返回的結構一致

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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="animate-fade-in"
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem' }}>{summary.personal?.tenantId || user?.tenantId} {t('dashboard.title')}</h2>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {t('common.last_update')}：{businessData.lastUpdate ? businessData.lastUpdate : t('common.no_data_today')}
                </span>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                {user?.role <= 2 ? (
                    <>
                        <StatCard icon={Users} label={t('dashboard.total_tenants')} value={systemStats.totalTenants || 0} change="System" positive />
                        <StatCard icon={Users} label={t('dashboard.active_tenants')} value={systemStats.activeTenants || 0} change="Live" positive />
                        <StatCard icon={ShoppingBag} label={t('dashboard.total_products')} value={systemStats.totalProducts || 0} change="Total" positive />
                        <StatCard icon={TrendingUp} label={t('dashboard.archive_progress')} value={`${systemStats.archivedProgress || 0}`} change="Stable" positive />
                    </>
                ) : user?.role === 3 ? (
                    <>
                        <StatCard icon={Users} label={t('dashboard.managed_tenants')} value={agentStats.subTenantCount || 0} change="+0" positive />
                        <StatCard icon={Users} label={t('dashboard.managed_accounts')} value={agentStats.totalUsersManaged || 0} change="+0" positive />
                        <StatCard icon={DollarSign} label={t('dashboard.est_inventory_value')} value={`${tenantConfig.currency}${businessData.inventory?.totalValue?.toLocaleString() || 0}`} change="Live" positive />
                        <StatCard icon={ShoppingBag} label={t('dashboard.managed_product_count')} value={businessData.inventory?.totalItems || 0} change="Items" positive />
                    </>
                ) : (
                    <>
                        <StatCard icon={DollarSign} label={t('dashboard.today_sales')} value={`${tenantConfig.currency}${businessData.latestSales?.toLocaleString() || 0}`} change="Live" positive />
                        <StatCard icon={TrendingUp} label={t('dashboard.inventory_total_value')} value={`${tenantConfig.currency}${businessData.inventory?.totalValue?.toLocaleString() || 0}`} change="Stock" positive />
                        <StatCard icon={ShoppingBag} label={t('dashboard.stock_count')} value={businessData.inventory?.totalItems || 0} change="Units" positive={businessData.inventory?.totalItems > 0} />
                        <StatCard icon={Users} label={t('dashboard.current_user')} value={summary.personal?.username || 'Admin'} change="Online" positive />
                    </>
                )}
            </div>


            {/* Main Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {t('dashboard.sales_trend')} <ArrowUpRight size={18} color="var(--primary)" />
                    </h3>
                    <Line data={chartData} options={chartOptions} height={100} />
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>{t('dashboard.popular_products')}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
    );
};

const StatCard = ({ icon: Icon, label, value, change, positive }) => (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)' }}>
                <Icon size={20} color="var(--primary)" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: positive ? '#4ade80' : '#f87171', fontSize: '0.85rem', fontWeight: 600 }}>
                {change} {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            </div>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{value}</div>
    </div>
);

const ProductItem = ({ name, sales, price, t }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)' }}>
        <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('dashboard.sold')} {sales}</div>
        </div>
        <div style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{price}</div>
    </div>
);

export default Dashboard;
