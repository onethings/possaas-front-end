import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';

const AccessTokens = () => {
    const { t } = useTranslation();
    const [tokens, setTokens] = useState([
        { id: '1', name: 'test', expires: '01 Jun 2027' }
    ]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [newToken, setNewToken] = useState({ name: '', hasExpiry: true, expires: '' });

    const handleCreate = (e) => {
        e.preventDefault();
        setTokens(prev => [...prev, {
            id: Date.now().toString(),
            name: newToken.name,
            expires: newToken.hasExpiry ? newToken.expires || 'Permanent' : '永不失效'
        }]);
        setModalOpen(false);
        setNewToken({ name: '', hasExpiry: true, expires: '' });
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem' }}>{t('access_tokens.title', '存取憑證')}</h3>
                <button onClick={() => setModalOpen(true)} className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Plus size={16} /> {t('access_tokens.add', '添加訪問權限')}
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('access_tokens.name', '名稱')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('access_tokens.expires', '截止日期')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('common.actions', '操作')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tokens.map((token, idx) => (
                                <tr key={token.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{token.name}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', color: token.expires === '永不失效' ? '#4ade80' : 'var(--text-muted)' }}>{token.expires}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                                        <button style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.3rem' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-panel" style={{ padding: '2rem', width: '450px', maxWidth: '90vw' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>{t('access_tokens.create', '創建訪問權限')}</h3>
                        <form onSubmit={handleCreate}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>{t('access_tokens.name', '名稱')}</label>
                                <input value={newToken.name} onChange={e => setNewToken(prev => ({ ...prev, name: e.target.value }))}
                                    style={{ width: '100%', padding: '0.6rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} required />
                            </div>
                            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input type="checkbox" checked={newToken.hasExpiry} onChange={e => setNewToken(prev => ({ ...prev, hasExpiry: e.target.checked }))}
                                    style={{ accentColor: 'var(--primary)' }} />
                                <label style={{ fontSize: '0.85rem' }}>{t('access_tokens.has_expiry', '訪問權限有到期日期')}</label>
                            </div>
                            {newToken.hasExpiry && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>{t('access_tokens.expires', '截止日期')}</label>
                                    <input type="date" value={newToken.expires} onChange={e => setNewToken(prev => ({ ...prev, expires: e.target.value }))}
                                        style={{ width: '100%', padding: '0.6rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button type="button" onClick={() => setModalOpen(false)}
                                    style={{ padding: '0.5rem 1.2rem', background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                    {t('common.cancel', '取消')}
                                </button>
                                <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
                                    {t('common.save', '儲存')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default AccessTokens;
