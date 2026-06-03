import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GuidedTour from '../components/GuidedTour';
import { pageTours } from '../utils/pageTours';
import { motion } from 'framer-motion';
import { BarChart, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import { getRangeReport } from '../api/reports';
import { useReportFilters } from '../contexts/ReportFilterContext';
import FilterBar from '../components/FilterBar';
import { useTenant } from '../contexts/TenantContext';

const StaffReports = () => {
    const { t } = useTranslation();
    const { tenantConfig } = useTenant();
    const { dateRange } = useReportFilters();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // 增加 RWD 狀態監聽，小於 768px 視為行動端
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        fetchReport();

        // 處理視窗大小改變
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        // 初始執行一次
        handleResize();
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [dateRange]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const result = await getRangeReport(dateRange.start, dateRange.end);
            if (result.success) setReport(result.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Map staffSummary from range report to the expected format
    const staffPerformance = report?.staffSummary ? Object.values(report.staffSummary).map(s => ({
        staffName: s.name || 'Unknown',
        orderCount: s.orderCount || 0,
        revenue: s.revenue || 0,
    })) : (report?.staffPerformance || []);

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="animate-fade-in" 
            style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1.5rem',
                padding: isMobile ? '0.5rem' : '0' // 行動端稍微縮減外邊距
            }}
        >
            {/* Header 區塊自適應 */}
            <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row', 
                justifyContent: 'space-between', 
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: '1rem' 
            }}>
                <h2 style={{ fontSize: isMobile ? '1.3rem' : '1.5rem', margin: 0 }}>
                    {t('staff_reports.title')}
                </h2>
                <FilterBar />
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}><Loader2 className="animate-spin" size={32} /></div>
            ) : !report ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {t('staff_reports.no_data')}
                </div>
            ) : (
                <>
                    {/* Stats Grid - 自動適應縮放 */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))', 
                        gap: '1.5rem' 
                    }}>
                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>{t('staff_reports.stats.total_revenue')}</span>
                                <DollarSign size={20} color="var(--primary-light)" />
                            </div>
                            <div style={{ fontSize: isMobile ? '1.6rem' : '1.8rem', fontWeight: 800 }}>
                                {tenantConfig.currency}{report.totalRevenue?.toLocaleString()}
                            </div>
                        </div>
                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>{t('staff_reports.stats.total_orders')}</span>
                                <TrendingUp size={20} color="#4ade80" />
                            </div>
                            <div style={{ fontSize: isMobile ? '1.6rem' : '1.8rem', fontWeight: 800 }}>{report.orderCount}</div>
                        </div>
                    </div>

                    {/* Performance Table / Cards - 行動端卡片化 */}
                    <div className="glass-panel" style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <BarChart size={20} /> {t('staff_reports.table.title')}
                        </div>

                        {!isMobile ? (
                            /* ---------------- Desktop 傳統表格模式 ---------------- */
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
                                    {staffPerformance.length > 0 ? staffPerformance.map((stat, idx) => (
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
                        ) : (
                            /* ---------------- Mobile 響應式卡片模式 ---------------- */
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {staffPerformance.length > 0 ? staffPerformance.map((stat, idx) => (
                                    <div 
                                        key={idx} 
                                        style={{ 
                                            padding: '1.2rem', 
                                            borderBottom: idx === staffPerformance.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.8rem'
                                        }}
                                    >
                                        {/* 員工姓名與名次 */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '0.5rem' }}>
                                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                                                {idx + 1}
                                            </div>
                                            <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                                                {stat.staffName || t('staff_reports.table.fallback_name', { index: idx + 1 })}
                                            </span>
                                        </div>
                                        
                                        {/* 數據細項對齊 */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.9rem' }}>
                                            <div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.2rem' }}>{t('staff_reports.table.order_count')}</div>
                                                <div>{stat.orderCount} {t('staff_reports.table.order_unit')}</div>
                                            </div>
                                            <div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.2rem' }}>{t('staff_reports.table.revenue')}</div>
                                                <div style={{ fontWeight: 700, color: 'var(--primary-light)' }}>
                                                    {tenantConfig.currency}{stat.revenue?.toLocaleString()}
                                                </div>
                                            </div>
                                            <div style={{ gridColumn: 'span 2', marginTop: '0.2rem' }}>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.2rem' }}>{t('staff_reports.table.avg_order_value')}</div>
                                                <div>
                                                    {tenantConfig.currency}{(stat.revenue / stat.orderCount || 0).toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        {t('staff_reports.table.empty')}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </motion.div>
    );
};

            <GuidedTour tourId="staffReports" steps={pageTours.staffReports(t)} />

export default StaffReports;