import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const BillingPage = () => {
    const { t } = useTranslation();

    const subscriptions = [
        { name: t('billing.unlimited_history', '無限銷售歷史記錄'), desc: t('billing.unlimited_history_desc', '查看任何時段的銷售報告並將資料匯出至試算表'), trial: true },
        { name: t('billing.employee_management', '員工管理'), desc: t('billing.employee_management_desc', '管理員工的存取權限，追蹤時間卡和銷售'), trial: false },
        { name: t('billing.advanced_inventory', '進階庫存管理'), desc: t('billing.advanced_inventory_desc', '創建採購訂單，查看存貨計價報告和管理庫存'), trial: false },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}>
            <h3 style={{ fontSize: '1.1rem' }}>{t('billing.title', '計費和訂閱')}</h3>

            {/* Subscriptions */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('billing.subscriptions', '訂閱')}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {subscriptions.map((sub, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)' }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{sub.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{sub.desc}</div>
                            </div>
                            <button style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: sub.trial ? 'transparent' : 'var(--primary)', border: sub.trial ? '1px solid var(--primary)' : 'none', borderRadius: 'var(--radius-md)', color: 'white', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                {sub.trial ? t('billing.free_trial', '免費嘗試') : t('billing.subscribe', '訂閱')}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment Methods */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{t('billing.payment_methods', '付款方法')}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('billing.no_card', '目前沒有儲存的信用卡')}</p>
                    </div>
                    <a href="#" style={{ color: 'var(--primary-light)', fontSize: '0.85rem' }}>{t('billing.add_payment', '新增付款方法')}</a>
                </div>
            </div>

            {/* Billing Details */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{t('billing.billing_details', '計費明細')}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('billing.billing_details_desc', '新增要顯示在發票上的資訊')}</p>
                    </div>
                    <a href="#" style={{ color: 'var(--primary-light)', fontSize: '0.85rem' }}>{t('billing.edit', '帳單詳細資訊')}</a>
                </div>
            </div>
        </motion.div>
    );
};

export default BillingPage;
