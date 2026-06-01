import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Download, Loader2, Search } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';
import { getOrders } from '../../api/orders';

const ReceiptsReport = () => {
    const { t } = useTranslation();
    const { tenantConfig } = useTenant();
    const [loading, setLoading] = useState(true);
    const [receipts, setReceipts] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await getOrders({ start: '2026-05-03', end: '2026-06-01' });
            if (result.success) {
                const mapped = (result.data || []).slice(0, 10).map(order => ({
                    no: order.orderNo || '—',
                    date: order.createdAt ? new Date(order.createdAt).toLocaleString() : '—',
                    employee: order.staffName || '—',
                    customer: order.customerName || '—',
                    type: order.status === 'returned' ? t('report.refund', '退款') : t('report.sales', '銷售'),
                    total: order.finalAmount || 0,
                }));
                setReceipts(mapped);
            }
        } catch (err) {
            console.error('Failed to fetch receipts:', err);
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}
        >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="glass-panel" style={{ padding: '0.5rem 1rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>3 May 2026 – 1 Jun 2026</span>
                    </div>
                    <div className="glass-panel" style={{ padding: '0.5rem 1rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('report.all_day', '全天')}</span>
                    </div>
                    <div className="glass-panel" style={{ padding: '0.5rem 1rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('report.all_employees', '所有員工')}</span>
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t('report.total_receipts', '所有收據')}: 858</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('report.sales', '銷售')}: 858</span>
                    <span style={{ fontSize: '0.8rem', color: '#f87171' }}>{t('report.refund', '退款')}: 0</span>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <button style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Download size={14} /> {t('common.export', '匯出')}
                    </button>
                    <Search size={16} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('report.receipt_no', '收據號碼')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('report.date', '日期')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('report.employee', '員工')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('report.customer', '客戶')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('report.type', '種類')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('report.total', '總計')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {receipts.map((r, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: 'var(--primary-light)' }}>{r.no}</td>
                                    <td style={{ padding: '0.75rem 0.5rem' }}>{r.date}</td>
                                    <td style={{ padding: '0.75rem 0.5rem' }}>{r.employee}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>{r.customer}</td>
                                    <td style={{ padding: '0.75rem 0.5rem' }}>
                                        <span style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>{r.type}</span>
                                    </td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>{tenantConfig.currency}{r.total.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{t('common.page_info', { current: 1, total: Math.max(1, Math.ceil(receipts.length / 10)) })}</span>
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

export default ReceiptsReport;
