import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ExternalLink, BookOpen, Shield, Code, Server, Key, Globe } from 'lucide-react';

const ApiDocsPage = () => {
    const { t } = useTranslation();
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const sections = [
        {
            icon: BookOpen,
            title: t('api_docs.swagger_ui', 'Swagger UI'),
            desc: t('api_docs.swagger_desc', 'Swagger Desc'),
            url: `${apiBaseUrl}/api-docs`,
        },
        {
            icon: Shield,
            title: t('api_docs.auth', 'Auth'),
            desc: t('api_docs.auth_desc', 'Auth Desc'),
            code: 'Authorization: Bearer <your_token>',
        },
        {
            icon: Code,
            title: t('api_docs.endpoints', 'Endpoints'),
            desc: t('api_docs.endpoints_desc', 'Endpoints Desc'),
        },
        {
            icon: Server,
            title: t('api_docs.base_url', 'Base URL'),
            desc: t('api_docs.base_url_desc', 'Base URL Desc'),
            code: apiBaseUrl,
        },
        {
            icon: Key,
            title: t('api_docs.api_keys', 'API Keys'),
            desc: t('api_docs.api_keys_desc', 'Api Keys Desc'),
        },
        {
            icon: Globe,
            title: t('api_docs.public_api', 'Public Api'),
            desc: t('api_docs.public_api_desc', 'Public Api Desc'),
            code: 'x-api-key: <your_api_key>',
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.3rem' }}>{t('api_docs.title', 'Title')}</h3>
                <a
                    href={`${apiBaseUrl}/api-docs`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
                >
                    <ExternalLink size={16} />
                    {t('api_docs.open_swagger', 'Open Swagger')}
                </a>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                {sections.map((section, idx) => {
                    const Icon = section.icon;
                    return (
                        <div key={idx} className="glass-panel" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Icon size={20} style={{ color: 'var(--primary-light)' }} />
                                </div>
                                <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{section.title}</h4>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: section.code ? '0.75rem' : 0 }}>{section.desc}</p>
                            {section.code && (
                                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--input-bg)', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--primary-light)', wordBreak: 'break-all' }}>
                                    {section.code}
                                </div>
                            )}
                            {section.url && (
                                <a
                                    href={section.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}
                                >
                                    <ExternalLink size={14} />
                                    {t('api_docs.open', 'Open')}
                                </a>
                            )}
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default ApiDocsPage;
