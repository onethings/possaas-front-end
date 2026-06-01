import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

const TaxSettingsPage = () => {
    const { t } = useTranslation();
    const [taxes, setTaxes] = useState([{ id: '1', name: '5', applyToNew: false, rate: 5 }]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [newTax, setNewTax] = useState({ name: '', rate: '', type: 'EXCLUSIVE' });

    const handleCreate = (e) => {
        e.preventDefault();
        setTaxes(prev => [...prev, { id: Date.now().toString(), name: newTax.name, applyToNew: false, rate: parseFloat(newTax.rate) }]);
        setModalOpen(false);
        setNewTax({ name: '', rate: '', type: 'EXCLUSIVE' });
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem' }}>{t('tax_settings.title', '稅務設定')}</h3>
                <button onClick={() => setModalOpen(true)} className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Plus size={16} /> {t('tax_settings.add', '新增稅項')}
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('tax_settings.name', '名稱')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>{t('tax_settings.apply_to_new', '套用於新商品')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('tax_settings.rate', '稅率')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {taxes.map((tax, idx) => (
                                <tr key={tax.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{tax.name}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>{tax.applyToNew ? '是' : '否'}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{tax.rate}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-panel" style={{ padding: '2rem', width: '450px', maxWidth: '90vw' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>{t('tax_settings.create', '創建新的稅務名稱')}</h3>
                        <form onSubmit={handleCreate}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>{t('tax_settings.name', '名稱')}</label>
                                <input value={newTax.name} onChange={e => setNewTax(prev => ({ ...prev, name: e.target.value }))}
                                    style={{ width: '100%', padding: '0.6rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} required />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>{t('tax_settings.rate', '稅率, %')}</label>
                                <input type="number" step="0.01" value={newTax.rate} onChange={e => setNewTax(prev => ({ ...prev, rate: e.target.value }))}
                                    style={{ width: '100%', padding: '0.6rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} required />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>{t('tax_settings.type', '種類')}</label>
                                <select value={newTax.type} onChange={e => setNewTax(prev => ({ ...prev, type: e.target.value }))}
                                    style={{ width: '100%', padding: '0.6rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }}>
                                    <option value="EXCLUSIVE">{t('tax_settings.exclusive', '價外稅')}</option>
                                    <option value="INCLUSIVE">{t('tax_settings.inclusive', '價內稅')}</option>
                                </select>
                            </div>
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

export default TaxSettingsPage;
