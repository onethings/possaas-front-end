import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Download, Loader2 } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';
import { getRangeReport } from '../../api/reports';

const PaymentTypeReport = () => {
    const { t } = useTranslation();
    const { tenantConfig } = useTenant();
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await getRangeReport('2026-05-03', '2026-06-01');
            if (result.success) {
                const d = result.data;
                const totalRevenue = d.totalRevenue || 0;
                const totalRefunds = d.totalRefunds || 0;
                setPayments([{
                    method: t('report.cash', '現金'),
                    transactions: d.totalOrders || 0,
                    amount: totalRevenue,
                    refundTrans: 0,
                    refundAmount: totalRefunds,
                    net: totalRevenue - totalRefunds,
                }]);
            }
        } catch (err) {
            console.error('Failed to fetch payment types:', err);
        } finally {
            setLoading(false);
        }
    };

    const totals = payments.reduce((acc, p) => ({
        transactions: acc.transactions + p.transactions,
        amount: acc.amount + p.amount,
        refundTrans: acc.refundTrans + p.refundTrans,
        refundAmount: acc.refundAmount + p.refundAmount,
        net: acc.net + p.net,
    }), { transactions: 0, amount: 0, refundTrans: 0, refundAmount: 0, net: 0 });

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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
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

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>{t('report.payment_type', '付款方式')}</h3>
                    <button style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Download size={14} /> {t('common.export', '匯出')}
                    </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('report.payment_method', '付款方式')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('report.payment_transactions', '付款交易')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('report.payment_amount', '支付金額')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('report.refund_transactions', '退款交易')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('report.refund_amount', '退款金額')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('report.net_amount', '淨額')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((p, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{p.method}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{p.transactions}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{tenantConfig.currency}{p.amount.toLocaleString()}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: p.refundTrans > 0 ? '#f87171' : 'inherit' }}>{p.refundTrans}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{tenantConfig.currency}{p.refundAmount.toLocaleString()}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>{tenantConfig.currency}{p.net.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr style={{ borderTop: '2px solid var(--glass-border)', fontWeight: 700 }}>
                                <td style={{ padding: '0.75rem 0.5rem' }}>{t('report.total', '總計')}</td>
                                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{totals.transactions}</td>
                                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{tenantConfig.currency}{totals.amount.toLocaleString()}</td>
                                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{totals.refundTrans}</td>
                                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{tenantConfig.currency}{totals.refundAmount.toLocaleString()}</td>
                                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{tenantConfig.currency}{totals.net.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{t('common.page_info', { current: 1, total: 1 })}</span>
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

export default PaymentTypeReport;
