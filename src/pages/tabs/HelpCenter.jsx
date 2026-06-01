import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { HelpCircle, MessageCircle, Users } from 'lucide-react';

const HelpCenter = () => {
    const { t } = useTranslation();

    const sections = [
        { icon: HelpCircle, title: t('help.help_center', '幫助中心'), desc: t('help.help_center_desc', '瀏覽常見問題與使用指南'), color: 'var(--primary)' },
        { icon: Users, title: t('help.community', '社群'), desc: t('help.community_desc', '與其他用戶交流經驗'), color: '#4ade80' },
        { icon: MessageCircle, title: t('help.live_chat', '實時聊天'), desc: t('help.live_chat_desc', '聯繫客服獲取即時支援'), color: '#f59e0b' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}>
            <h3 style={{ fontSize: '1.1rem' }}>{t('help.title', '幫助')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {sections.map((section, idx) => {
                    const Icon = section.icon;
                    return (
                        <div key={idx} className="glass-panel" style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer' }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ width: 60, height: 60, borderRadius: '50%', background: `${section.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                <Icon size={28} color={section.color} />
                            </div>
                            <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{section.title}</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{section.desc}</p>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default HelpCenter;
