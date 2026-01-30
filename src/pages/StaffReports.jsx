import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Users, TrendingUp, DollarSign, Loader2, Calendar } from 'lucide-react';
import { getReportSummary } from '../api/reports';

const StaffReports = () => {
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
                <h2 style={{ fontSize: '1.5rem' }}>員工績效報表 (Staff Performance)</h2>
                <div className="glass-panel" style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <Calendar size={18} /> 今日概況
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}><Loader2 className="animate-spin" size={32} /></div>
            ) : !report ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>尚未產生數據</div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>總銷售額</span>
                                <DollarSign size={20} color="var(--primary-light)" />
                            </div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>${report.totalRevenue?.toLocaleString()}</div>
                        </div>
                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>總訂單數</span>
                                <TrendingUp size={20} color="#4ade80" />
                            </div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{report.orderCount}</div>
                        </div>
                    </div>

                    {/* Performance Table */}
                    <div className="glass-panel" style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <BarChart size={20} /> 員工銷售排行榜
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    <th style={{ padding: '1.2rem' }}>員工姓名</th>
                                    <th style={{ padding: '1.2rem' }}>訂單數</th>
                                    <th style={{ padding: '1.2rem' }}>總銷售金額</th>
                                    <th style={{ padding: '1.2rem' }}>平均客單價</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.staffPerformance?.length > 0 ? report.staffPerformance.map((stat, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                                                {idx + 1}
                                            </div>
                                            {stat.staffName || '員工 ' + (idx + 1)}
                                        </td>
                                        <td style={{ padding: '1.2rem' }}>{stat.orderCount} 筆</td>
                                        <td style={{ padding: '1.2rem', fontWeight: 700, color: 'var(--primary-light)' }}>${stat.revenue?.toLocaleString()}</td>
                                        <td style={{ padding: '1.2rem' }}>${(stat.revenue / stat.orderCount || 0).toFixed(2)}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>目前無員工銷售數據</td>
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
