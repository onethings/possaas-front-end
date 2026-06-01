import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

const ModifiersPage = () => {
    const { t } = useTranslation();

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ fontSize: '1.1rem' }}>{t('modifiers.title', '商品修飾符')}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                        {t('modifiers.description', '創建可應用於商品的選項。')}
                        <a href="#" style={{ color: 'var(--primary-light)', marginLeft: '0.5rem' }}>{t('modifiers.learn_more', '了解更多')}</a>
                    </p>
                </div>
                <button className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Plus size={16} /> {t('modifiers.add', '新增修飾符')}
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>🔧</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{t('modifiers.no_modifiers', '尚無任何修飾符，點擊上方按鈕新增。')}</p>
            </div>
        </motion.div>
    );
};

export default ModifiersPage;
