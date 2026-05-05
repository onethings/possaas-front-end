import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // 1. 引入翻譯 Hook
import { motion } from 'framer-motion';
import { BarChart, TrendingUp, DollarSign, Loader2, Calendar } from 'lucide-react';
import { getReportSummary } from '../api/reports';
import { useTenant } from '../contexts/TenantContext';

const StaffReports = () => {
    const { t } = useTranslation(); // 2. 初始化 t 函式
    const { tenantConfig } = useTenant();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const result = await getReportSummary();
            if (result.success) setReport(result.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem' }}>{t('staff_reports.title')}</h2>
                <div className="glass-panel" style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <Calendar size={18} /> {t('staff_reports.today_overview')}
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}><Loader2 className="animate-spin" size={32} /></div>
            ) : !report ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {t('staff_reports.no_data')}
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>{t('staff_reports.stats.total_revenue')}</span>
                                <DollarSign size={20} color="var(--primary-light)" />
                            </div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                                {tenantConfig.currency}{report.totalRevenue?.toLocaleString()}
                            </div>
                        </div>
                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>{t('staff_reports.stats.total_orders')}</span>
                                <TrendingUp size={20} color="#4ade80" />
                            </div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{report.orderCount}</div>
                        </div>
                    </div>

                    {/* Performance Table */}
                    <div className="glass-panel" style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <BarChart size={20} /> {t('staff_reports.table.title')}
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    <th style={{ padding: '1.2rem' }}>{t('staff_reports.table.staff_name')}</th>
                                    <th style={{ padding: '1.2rem' }}>{t('staff_reports.table.order_count')}</th>
                                    <th style={{ padding: '1.2rem' }}>{t('staff_reports.table.revenue')}</th>
                                    <th style={{ padding: '1.2rem' }}>{t('staff_reports.table.avg_order_value')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.staffPerformance?.length > 0 ? report.staffPerformance.map((stat, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                                                {idx + 1}
                                            </div>
                                            {stat.staffName || t('staff_reports.table.fallback_name', { index: idx + 1 })}
                                        </td>
                                        <td style={{ padding: '1.2rem' }}>{stat.orderCount} {t('staff_reports.table.order_unit')}</td>
                                        <td style={{ padding: '1.2rem', fontWeight: 700, color: 'var(--primary-light)' }}>
                                            {tenantConfig.currency}{stat.revenue?.toLocaleString()}
                                        </td>
                                        <td style={{ padding: '1.2rem' }}>
                                            {tenantConfig.currency}{(stat.revenue / stat.orderCount || 0).toFixed(2)}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            {t('staff_reports.table.empty')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </motion.div>
    );
};

export default StaffReports;