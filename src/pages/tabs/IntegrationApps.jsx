import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const IntegrationApps = () => {
    const { t } = useTranslation();

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}>
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.3rem' }}>{t('integrations.title', '相關應用程式')}</h3>
                <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>
                    {t('integrations.description', '將會計，電子商務，營銷和其他應用程式連接到您的 Loyverse 帳戶')}
                </p>
                <button className="btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem', marginTop: '0.5rem' }}>
                    {t('integrations.go_to_store', '前往應用程式商店')}
                </button>
            </div>
        </motion.div>
    );
};

export default IntegrationApps;
