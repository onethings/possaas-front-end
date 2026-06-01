import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

const POSDevicesPage = () => {
    const { t } = useTranslation();

    const devices = [
        { name: 'POS 1', status: t('pos_devices.enabled', '已啟用') },
        { name: 'POS 2', status: t('pos_devices.enabled', '已啟用') },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem' }}>{t('pos_devices.title', 'POS 設備')}</h3>
                <button className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Plus size={16} /> {t('pos_devices.add', '新增 POS')}
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('pos_devices.name', '名稱')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('pos_devices.status', '狀態')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {devices.map((device, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{device.name}</td>
                                    <td style={{ padding: '0.75rem 0.5rem' }}>
                                        <span style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>{device.status}</span>
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

export default POSDevicesPage;
