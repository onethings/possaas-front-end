import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';
import { getDiscounts, createDiscount } from '../../api/discounts';
import { useTenant } from '../../contexts/TenantContext';

const DiscountMgmtPage = () => {
    const { t } = useTranslation();
    const { tenantConfig } = useTenant();
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [newDiscount, setNewDiscount] = useState({ name: '', type: 'PERCENTAGE', value: '' });

    useEffect(() => { fetchDiscounts(); }, []);

    const fetchDiscounts = async () => {
        setLoading(true);
        try {
            const result = await getDiscounts();
            if (result.success) setDiscounts(result.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const result = await createDiscount({ ...newDiscount, value: parseFloat(newDiscount.value) });
            if (result.success) {
                setDiscounts(prev => [...prev, result.data]);
                setModalOpen(false);
                setNewDiscount({ name: '', type: 'PERCENTAGE', value: '' });
            }
        } catch (err) { console.error(err); }
    };

    const displayDiscounts = discounts.length > 0 ? discounts : [
        { _id: '1', name: 'Discound', value: 500, restricted: false },
        { _id: '2', name: 'Discound', value: 1000, restricted: false },
        { _id: '3', name: 'discount', value: 15000, restricted: false },
        { _id: '4', name: 'Discount', value: 70000, restricted: false },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem' }}>{t('discounts.title', 'Title')}</h3>
                <button onClick={() => setModalOpen(true)} className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Plus size={16} /> {t('discounts.add', 'Add')}
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '0.75rem 0.5rem', width: '40px' }}></th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('discounts.name', 'Name')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('discounts.value', 'Value')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>{t('discounts.restricted', 'Restricted')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayDiscounts.map((d, idx) => (
                                <tr key={d._id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '0.75rem 0.5rem' }}>
                                        <input type="checkbox" style={{ accentColor: 'var(--primary)' }} />
                                    </td>
                                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{d.name}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                                        {d.type === 'PERCENTAGE' ? `${d.value}%` : `${tenantConfig.currency}${(d.value || 0).toLocaleString()}`}
                                    </td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>{d.restricted ? '是' : '否'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{t('common.page_info', { current: 1, total: Math.max(1, Math.ceil((discounts.length || displayDiscounts.length) / 10)) })}</span>
                    <select style={{ background: 'rgba(0,0,0,0.2)', border: 'none', color: 'var(--text-muted)', padding: '0.3rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                        <option>10 {t('common.rows', 'Rows')}</option>
                    </select>
                </div>
            </div>

            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-panel" style={{ padding: '2rem', width: '400px', maxWidth: '90vw' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>{t('discounts.create', 'Create')}</h3>
                        <form onSubmit={handleCreate}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>{t('discounts.name', 'Name')}</label>
                                <input value={newDiscount.name} onChange={e => setNewDiscount(prev => ({ ...prev, name: e.target.value }))}
                                    style={{ width: '100%', padding: '0.6rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>{t('discounts.type', 'Type')}</label>
                                <select value={newDiscount.type} onChange={e => setNewDiscount(prev => ({ ...prev, type: e.target.value }))}
                                    style={{ width: '100%', padding: '0.6rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }}>
                                    <option value="PERCENTAGE">{t('discounts.percentage', 'Percentage')}</option>
                                    <option value="FIXED">{t('discounts.fixed', 'Fixed')}</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>{t('discounts.value', 'Value')}</label>
                                <input type="number" value={newDiscount.value} onChange={e => setNewDiscount(prev => ({ ...prev, value: e.target.value }))}
                                    style={{ width: '100%', padding: '0.6rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button type="button" onClick={() => setModalOpen(false)}
                                    style={{ padding: '0.5rem 1.2rem', background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                    {t('common.cancel', 'Cancel')}
                                </button>
                                <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
                                    {t('common.save', 'Save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default DiscountMgmtPage;
