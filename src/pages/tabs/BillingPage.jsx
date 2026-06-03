import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const BillingPage = () => {
    const { t } = useTranslation();

    const subscriptions = [
        { name: t('billing.unlimited_history', 'Unlimited History'), desc: t('billing.unlimited_history_desc', 'Unlimited History Desc'), trial: true },
        { name: t('billing.employee_management', 'Employee Management'), desc: t('billing.employee_management_desc', 'Employee Management Desc'), trial: false },
        { name: t('billing.advanced_inventory', 'Advanced Inventory'), desc: t('billing.advanced_inventory_desc', 'Advanced Inventory Desc'), trial: false },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}>
            <h3 style={{ fontSize: '1.1rem' }}>{t('billing.title', 'Title')}</h3>

            {/* Subscriptions */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('billing.subscriptions', 'Subscriptions')}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {subscriptions.map((sub, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)' }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{sub.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{sub.desc}</div>
                            </div>
                            <button style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: sub.trial ? 'transparent' : 'var(--primary)', border: sub.trial ? '1px solid var(--primary)' : 'none', borderRadius: 'var(--radius-md)', color: 'white', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                {sub.trial ? t('billing.free_trial', 'Free Trial') : t('billing.subscribe', 'Subscribe')}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment Methods */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{t('billing.payment_methods', 'Payment Methods')}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('billing.no_card', 'No Card')}</p>
                    </div>
                    <a href="#" style={{ color: 'var(--primary-light)', fontSize: '0.85rem' }}>{t('billing.add_payment', 'Add Payment')}</a>
                </div>
            </div>

            {/* Billing Details */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{t('billing.billing_details', 'Billing Details')}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('billing.billing_details_desc', 'Billing Details Desc')}</p>
                    </div>
                    <a href="#" style={{ color: 'var(--primary-light)', fontSize: '0.85rem' }}>{t('billing.edit', 'Edit')}</a>
                </div>
            </div>
        </motion.div>
    );
};

export default BillingPage;
