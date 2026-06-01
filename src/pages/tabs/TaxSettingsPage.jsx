import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Trash2, Loader2, X } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';

const TaxSettingsPage = () => {
    const { t } = useTranslation();
    const { tenantConfig } = useTenant();
    const [taxes, setTaxes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [formData, setFormData] = useState({ name: '', rate: '', type: 'EXCLUSIVE' });

    useEffect(() => {
        if (tenantConfig?.taxes) setTaxes(tenantConfig.taxes);
        else setTaxes([{ name: 'VAT 5%', rate: 5, type: 'EXCLUSIVE', applyToNew: false }]);
        setLoading(false);
    }, [tenantConfig]);

    const openCreate = () => {
        setEditingIndex(null);
        setFormData({ name: '', rate: '', type: 'EXCLUSIVE' });
        setModalOpen(true);
    };
    const openEdit = (idx) => {
        setEditingIndex(idx);
        setFormData({ name: taxes[idx].name, rate: taxes[idx].rate.toString(), type: taxes[idx].type || 'EXCLUSIVE' });
        setModalOpen(true);
    };
    const handleDelete = (idx) => {
        if (!window.confirm(t('tax_settings.confirm_delete', '確定刪除？'))) return;
        setTaxes(prev => prev.filter((_, i) => i !== idx));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        const entry = { name: formData.name, rate: parseFloat(formData.rate), type: formData.type, applyToNew: false };
        if (editingIndex !== null) {
            setTaxes(prev => { const n = [...prev]; n[editingIndex] = entry; return n; });
        } else {
            setTaxes(prev => [...prev, entry]);
        }
        setModalOpen(false);
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}><Loader2 className="animate-spin" size={32} /></div>;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem' }}>{t('tax_settings.title', '稅務設定')}</h3>
                <button onClick={openCreate} className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Plus size={16} /> {t('tax_settings.add', '新增稅項')}
                </button>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('tax_settings.name', '名稱')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('tax_settings.rate', '稅率')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>{t('tax_settings.type', '種類')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('common.actions', '操作')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {taxes.map((tax, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, cursor: 'pointer' }} onClick={() => openEdit(idx)}>{tax.name}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{tax.rate}%</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>{tax.type === 'INCLUSIVE' ? t('tax_settings.inclusive', '價內稅') : t('tax_settings.exclusive', '價外稅')}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                                        <button onClick={() => handleDelete(idx)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.3rem' }}>
                                            <Trash2 size={14} />
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3>{editingIndex !== null ? t('tax_settings.edit', '編輯稅項') : t('tax_settings.create', '新增稅項')}</h3>
                            <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>{t('tax_settings.name', '名稱')}</label>
                                <input id="tax-name" name="tax-name" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    style={{ width: '100%', padding: '0.6rem', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)' }} required />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>{t('tax_settings.rate', '稅率, %')}</label>
                                <input id="tax-rate" name="tax-rate" type="number" step="0.01" value={formData.rate} onChange={e => setFormData(prev => ({ ...prev, rate: e.target.value }))}
                                    style={{ width: '100%', padding: '0.6rem', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)' }} required />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>{t('tax_settings.type', '種類')}</label>
                                <select id="tax-type" name="tax-type" value={formData.type} onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                    style={{ width: '100%', padding: '0.6rem', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)' }}>
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
                                    {editingIndex !== null ? t('common.update', '更新') : t('common.save', '新增')}
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
