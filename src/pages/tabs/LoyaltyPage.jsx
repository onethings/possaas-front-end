import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const LoyaltyPage = () => {
    const { t } = useTranslation();
    const [rate, setRate] = useState('0.00');

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}>
            <h3 style={{ fontSize: '1.1rem' }}>{t('loyalty.title', 'Title')}</h3>
            <div className="glass-panel" style={{ padding: '1.5rem', maxWidth: '500px' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                        {t('loyalty.earning_rate', 'Earning Rate')}
                    </label>
                    <input type="number" step="0.01" value={rate} onChange={e => setRate(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white', fontSize: '1.1rem' }} />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                        {t('loyalty.earning_rate_desc', 'Earning Rate Desc')}
                    </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button style={{ padding: '0.5rem 1.2rem', background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        {t('common.cancel', 'Cancel')}
                    </button>
                    <button className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
                        {t('common.save', 'Save')}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default LoyaltyPage;
