import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Loader2, X } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';

const POSDevicesPage = () => {
    const { t } = useTranslation();
    const { tenantConfig } = useTenant();
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingIdx, setEditingIdx] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '' });

    useEffect(() => {
        if (tenantConfig?.posDevices) setDevices(tenantConfig.posDevices);
        else setDevices([]);
        setLoading(false);
    }, [tenantConfig]);

    const openCreate = () => {
        setEditingIdx(null);
        setFormData({ name: '' });
        setModalOpen(true);
    };
    const openEdit = (idx) => {
        setEditingIdx(idx);
        setFormData({ name: devices[idx].name });
        setModalOpen(true);
    };
    const handleDelete = (idx) => {
        if (!window.confirm(t('pos_devices.confirm_delete', '確定刪除此 POS？'))) return;
        setDevices(prev => prev.filter((_, i) => i !== idx));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        const entry = { name: formData.name, status: t('pos_devices.enabled', '已啟用') };
        if (editingIdx !== null) {
            const updated = [...devices];
            updated[editingIdx] = { ...updated[editingIdx], ...entry };
            setDevices(updated);
        } else {
            setDevices(prev => [...prev, entry]);
        }
        setModalOpen(false);
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}><Loader2 className="animate-spin" size={32} /></div>;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem' }}>{t('pos_devices.title', 'POS 設備')}</h3>
                <button onClick={openCreate} className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
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
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('common.actions', '操作')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {devices.map((device, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{device.name}</td>
                                    <td style={{ padding: '0.75rem 0.5rem' }}>
                                        <span style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>{device.status}</span>
                                    </td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                                        <button onClick={() => openEdit(idx)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.3rem', marginRight: '0.3rem' }}>
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(idx)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.3rem' }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {devices.length === 0 && (
                                <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>{t('common.no_data', '暫無資料')}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="glass-panel" style={{ padding: '2rem', width: '450px', maxWidth: '90vw' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3>{editingIdx !== null ? t('pos_devices.edit', '編輯 POS') : t('pos_devices.add', '新增 POS')}</h3>
                            <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>{t('pos_devices.name', 'POS 名稱')} *</label>
                                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.6rem', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)' }} />
                            </div>
                            <button type="submit" className="btn-primary" disabled={submitting}
                                style={{ width: '100%', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: submitting ? 0.7 : 1 }}>
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : (editingIdx !== null ? t('common.update', '更新') : t('common.confirm_add', '新增'))}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default POSDevicesPage;
