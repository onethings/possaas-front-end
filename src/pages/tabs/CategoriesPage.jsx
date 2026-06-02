import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';
import { getCategories, createCategory } from '../../api/categories';

const CategoriesPage = () => {
    const { t } = useTranslation();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: '', color: '#6366f1' });

    useEffect(() => { fetchCategories(); }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const result = await getCategories();
            if (result.success) setCategories(result.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const result = await createCategory(newCategory);
            if (result.success) {
                setCategories(prev => [...prev, result.data]);
                setModalOpen(false);
                setNewCategory({ name: '', color: '#6366f1' });
            }
        } catch (err) { console.error(err); }
    };

    if (loading) {
        return <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <Loader2 className="animate-spin" size={32} />
        </div>;
    }

    const displayCategories = categories.length > 0 ? categories : [];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem' }}>{t('categories.title', '類別')}</h3>
                <button onClick={() => setModalOpen(true)} className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Plus size={16} /> {t('categories.add', '新增類別')}
                </button>
            </div>

            {displayCategories.length === 0 ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{t('categories.no_categories', '尚無任何類別')}</p>
                </div>
            ) : (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '0.75rem 0.5rem', width: '40px' }}></th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('categories.name', '類別名稱')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('categories.product_count', '商品數量')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayCategories.map((cat, idx) => (
                                <tr key={cat._id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '0.75rem 0.5rem' }}>
                                        <input type="checkbox" style={{ accentColor: 'var(--primary)' }} />
                                    </td>
                                    <td style={{ padding: '0.75rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: cat.color || '#808080', flexShrink: 0 }} />
                                        <span style={{ fontWeight: 600 }}>{cat.name}</span>
                                    </td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{cat.productCount || 0} {t('categories.products', '商品')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{t('common.page_info', { current: 1, total: Math.max(1, Math.ceil((displayCategories.length || 1) / 10)) })}</span>
                    <select style={{ background: 'rgba(0,0,0,0.2)', border: 'none', color: 'var(--text-muted)', padding: '0.3rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                        <option>10 {t('common.rows', '行')}</option>
                    </select>
                </div>
            </div>
            )}

            {/* Create Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-panel" style={{ padding: '2rem', width: '400px', maxWidth: '90vw' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>{t('categories.create', '新增類別')}</h3>
                        <form onSubmit={handleCreate}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>{t('categories.name', '類別名稱')}</label>
                                <input value={newCategory.name} onChange={e => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                                    style={{ width: '100%', padding: '0.6rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>{t('categories.color', '顏色')}</label>
                                <input type="color" value={newCategory.color} onChange={e => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                                    style={{ width: '100%', height: '40px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }} />
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

export default CategoriesPage;
