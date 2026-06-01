import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Loader2, X } from 'lucide-react';
import { getStores, createStore, updateStore, deleteStore } from '../../api/stores';

const StoresPage = () => {
    const { t } = useTranslation();
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingStore, setEditingStore] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', address: '', phone: '' });

    useEffect(() => { fetchStores(); }, []);

    const fetchStores = async () => {
        setLoading(true);
        try {
            const result = await getStores();
            if (result.success) setStores(result.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const openCreate = () => {
        setEditingStore(null);
        setFormData({ name: '', address: '', phone: '' });
        setModalOpen(true);
    };

    const openEdit = (store) => {
        setEditingStore(store);
        setFormData({ name: store.name, address: store.address || '', phone: store.phone || '' });
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('stores.confirm_delete', '確定刪除此門店？'))) return;
        try {
            await deleteStore(id);
            fetchStores();
        } catch (err) { console.error(err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingStore) {
                await updateStore(editingStore._id, formData);
            } else {
                await createStore(formData);
            }
            setModalOpen(false);
            fetchStores();
        } catch (err) {
            alert(err.response?.data?.message || t('common.error'));
        } finally { setSubmitting(false); }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem' }}>{t('stores.title', '門店管理')}</h3>
                <button onClick={openCreate} className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Plus size={16} /> {t('stores.add', '新增門店')}
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}><Loader2 className="animate-spin" size={32} /></div>
            ) : (
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('stores.name', '名稱')}</th>
                                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('stores.address', '地址')}</th>
                                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('stores.phone', '電話')}</th>
                                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('stores.pos_count', 'POS 數目')}</th>
                                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('common.actions', '操作')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stores.map((store) => (
                                    <tr key={store._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{store.name}</td>
                                        <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>{store.address || '—'}</td>
                                        <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>{store.phone || '—'}</td>
                                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{store.posCount || 0}</td>
                                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                                            <button onClick={() => openEdit(store)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.3rem', marginRight: '0.3rem' }}>
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(store._id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.3rem' }}>
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {stores.length === 0 && (
                                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>{t('common.no_data', '暫無資料')}</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="glass-panel" style={{ padding: '2rem', width: '450px', maxWidth: '90vw' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3>{editingStore ? t('stores.edit', '編輯門店') : t('stores.add', '新增門店')}</h3>
                            <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('stores.name', '門店名稱')} *</label>
                                <input id="store-name" name="store-name" type="text" required
                                    style={{ width: '100%', padding: '0.6rem', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', outline: 'none' }}
                                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('stores.address', '地址')}</label>
                                <input id="store-address" name="store-address" type="text"
                                    style={{ width: '100%', padding: '0.6rem', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', outline: 'none' }}
                                    value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('stores.phone', '電話')}</label>
                                <input id="store-phone" name="store-phone" type="text"
                                    style={{ width: '100%', padding: '0.6rem', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', outline: 'none' }}
                                    value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <button type="submit" className="btn-primary" disabled={submitting}
                                style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: submitting ? 0.7 : 1 }}>
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : (editingStore ? t('common.update', '更新') : t('common.confirm_add', '新增'))}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default StoresPage;
