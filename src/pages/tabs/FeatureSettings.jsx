import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const FeatureSettings = () => {
    const { t } = useTranslation();

    const features = [
        { label: t('settings.shift_management', '值班管理'), key: 'shifts' },
        { label: t('settings.clock_in', '考勤打卡'), key: 'clockIn' },
        { label: t('settings.negative_stock', '負庫存警告'), key: 'negativeStock' },
        { label: t('settings.loyalty', '客戶忠誠度計劃'), key: 'loyalty' },
        { label: t('settings.inventory', '進階庫存管理'), key: 'inventory' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}>
            <h3 style={{ fontSize: '1.1rem' }}>{t('settings.features', '功能設定')}</h3>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {features.map((f, idx) => (
                        <div key={f.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)' }}>
                            <span style={{ fontSize: '0.9rem' }}>{f.label}</span>
                            <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
                                <input type="checkbox" defaultChecked={idx < 2} style={{ opacity: 0, width: 0, height: 0 }} />
                                <span style={{
                                    position: 'absolute', inset: 0, background: idx < 2 ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                    borderRadius: '12px', transition: '0.3s',
                                }}>
                                    <span style={{
                                        position: 'absolute', left: idx < 2 ? '22px' : '2px', top: '2px',
                                        width: '20px', height: '20px', borderRadius: '50%', background: 'white',
                                        transition: '0.3s'
                                    }} />
                                </span>
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default FeatureSettings;
