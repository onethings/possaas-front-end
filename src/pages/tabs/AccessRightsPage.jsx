import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

const AccessRightsPage = () => {
    const { t } = useTranslation();

    const roles = [
        { name: '所有者', access: '後台管理和 POS', employees: 1, key: 'owner' },
        { name: '管理員', access: '後台管理和 POS', employees: 0, key: 'admin' },
        { name: '經理', access: '後台管理和 POS', employees: 0, key: 'manager' },
        { name: '收銀員', access: 'POS', employees: 0, key: 'cashier' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 'var(--radius-md)', padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <p>{t('access_rights.trial_message', 'Empower your business with employee management subscription — manage access rights, track timecards and sales by employee.')}</p>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                    <button style={{ padding: '0.3rem 0.8rem', background: 'rgba(59, 130, 246, 0.2)', border: 'none', borderRadius: 'var(--radius-md)', color: '#60a5fa', cursor: 'pointer', fontSize: '0.8rem' }}>{t('common.learn_more', '了解更多')}</button>
                    <button style={{ padding: '0.3rem 0.8rem', background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>{t('common.got_it', '瞭解了')}</button>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem' }}>{t('access_rights.title', '存取權限')}</h3>
                <button className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Plus size={16} /> {t('access_rights.add_role', '新增角色')}
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('access_rights.role', '角色')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('access_rights.access', '存取')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('access_rights.employees', '員工')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map((role, idx) => (
                                <tr key={role.key} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{role.name}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>{role.access}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{role.employees}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{t('common.page_info', '頁面：1 分之 1')}</span>
                    <select style={{ background: 'rgba(0,0,0,0.2)', border: 'none', color: 'var(--text-muted)', padding: '0.3rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                        <option>10 {t('common.rows', '行')}</option>
                    </select>
                </div>
            </div>
        </motion.div>
    );
};

export default AccessRightsPage;
