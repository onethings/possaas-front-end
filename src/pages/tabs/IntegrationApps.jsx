import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const IntegrationApps = () => {
    const { t } = useTranslation();

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}>
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.3rem' }}>{t('integrations.title', 'Title')}</h3>
                <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>
                    {t('integrations.description', 'Description')}
                </p>
                <button className="btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem', marginTop: '0.5rem' }}>
                    {t('integrations.go_to_store', 'Go To Store')}
                </button>
            </div>
        </motion.div>
    );
};

export default IntegrationApps;
