import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, GripVertical } from 'lucide-react';

const PaymentMethodsPage = () => {
    const { t } = useTranslation();

    const methods = ['現金', '卡'];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem' }}>{t('payment_methods.title', 'Title')}</h3>
                <button className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Plus size={16} /> {t('payment_methods.add', 'Add')}
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '0.75rem 0.5rem', width: '40px' }}></th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('payment_methods.name', 'Name')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', width: '40px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {methods.map((method, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '0.75rem 0.5rem' }}>
                                        <input type="checkbox" style={{ accentColor: 'var(--primary)' }} />
                                    </td>
                                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{method}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)', cursor: 'grab' }}>
                                        <GripVertical size={16} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default PaymentMethodsPage;
