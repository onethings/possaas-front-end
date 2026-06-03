import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Tag, Trash2, Loader2, Percent, DollarSign } from 'lucide-react';
import { getDiscounts, createDiscount, deleteDiscount } from '../api/discounts';
import { useTenant } from '../contexts/TenantContext';

const Discounts = () => {
    const { t } = useTranslation();
    const { tenantConfig } = useTenant();
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [newDiscount, setNewDiscount] = useState({ name: '', type: 'PERCENTAGE', value: '' });
    const [submitting, setSubmitting] = useState(false);
    
    // 監聽螢幕寬度，處理複雜的組件響應式佈局
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        fetchDiscounts();
        
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 640);
        };
        handleResize(); // 初始化檢查
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchDiscounts = async () => {
        setLoading(true);
        try {
            const result = await getDiscounts();
            if (result.success) setDiscounts(result.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const result = await createDiscount({
                ...newDiscount,
                value: parseFloat(newDiscount.value)
            });
            if (result.success) {
                setModalOpen(false);
                setNewDiscount({ name: '', type: 'PERCENTAGE', value: '' });
                fetchDiscounts();
            }
        } catch (error) {
            console.error('Create Discount Error:', error);
            const msg = error.response?.data?.message || error.message || t('common.error');
            alert(t('discounts.alerts.add_fail', { msg }));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('discounts.alerts.delete_confirm'))) return;
        try {
            await deleteDiscount(id);
            fetchDiscounts();
        } catch (error) {
            alert(t('discounts.alerts.delete_fail'));
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: isMobile ? '0.5rem' : '0' }}>
            {/* 頁頭：手機端自動改為垂直排列或緊湊佈局 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexDirection: isMobile ? 'row' : 'row' }}>
                <h2 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', margin: 0 }}>{t('discounts.title')}</h2>
                <button onClick={() => setModalOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: isMobile ? '0.5rem 1rem' : '0.75rem 1.2rem' }}>
                    <Plus size={18} /> {!isMobile && t('discounts.add_btn')}
                </button>
            </div>

            {/* 網格列表：調整 minmax 確保在小螢幕（如 320px）下不會爆版 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: isMobile ? '1rem' : '1.5rem' }}>
                {loading ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}><Loader2 className="animate-spin" /></div>
                ) : discounts.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>{t('discounts.empty_state')}</div>
                ) : (
                    discounts.map(d => (
                        <div key={d._id} className="glass-panel" style={{ padding: isMobile ? '1rem' : '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.75rem' : '1rem', minWidth: 0, flex: 1 }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: isMobile ? '0.6rem' : '0.8rem', borderRadius: '12px', color: 'var(--primary-light)', flexShrink: 0 }}>
                                    {d.type === 'PERCENTAGE' ? <Percent size={isMobile ? 20 : 24} /> : <DollarSign size={isMobile ? 20 : 24} />}
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: isMobile ? '1rem' : '1.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                       {d.type === 'PERCENTAGE' 
                                            ? t('discounts.types.desc_percentage', { value: d.value }) 
                                            : t('discounts.types.desc_fixed', { currency: tenantConfig.currency, value: d.value })
                                        }
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(d._id)} style={actionBtnStyle}><Trash2 size={18} color="#f87171" /></button>
                        </div>
                    ))
                )}
            </div>

            {/* 彈窗：優化寬度適配 */}
            {isModalOpen && (
                <div style={modalOverlayStyle}>
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        className="glass-panel" 
                        style={{ 
                            width: '90%', 
                            maxWidth: '400px', 
                            padding: isMobile ? '1.5rem' : '2rem',
                            boxSizing: 'border-box'
                        }}
                    >
                        <h3 style={{ margin: 0, fontSize: isMobile ? '1.2rem' : '1.5rem' }}>{t('discounts.modal.title')}</h3>
                        <form onSubmit={handleCreate} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="input-group">
                                <label htmlFor="disc-name">{t('discounts.modal.label_name')}</label>
                                <input id="disc-name" name="name" required value={newDiscount.name} onChange={e => setNewDiscount({ ...newDiscount, name: e.target.value })} placeholder="例如: 週末特惠" style={{ width: '100%', boxSizing: 'border-box' }} />
                            </div>
                            <div className="input-group">
                                <label htmlFor="disc-type">{t('discounts.modal.label_type')}</label>
                                <select id="disc-type" name="type" style={selectStyle} value={newDiscount.type} onChange={e => setNewDiscount({ ...newDiscount, type: e.target.value })}>
                                    <option value="PERCENTAGE">{t('discounts.types.percentage')}</option>
                                    <option value="FIXED">{t('discounts.types.fixed', { currency: tenantConfig.currency })}</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label htmlFor="disc-value">{t('discounts.modal.label_value')}</label>
                                <input id="disc-value" name="value" type="number" step="0.01" required value={newDiscount.value} onChange={e => setNewDiscount({ ...newDiscount, value: e.target.value })} placeholder={t('discounts.modal.placeholder_value')} style={{ width: '100%', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary" style={{ flex: 1, padding: '0.75rem' }}>{t('common.cancel')}</button>
                                <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1, padding: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{submitting ? <Loader2 size={18} className="animate-spin" /> : t('common.confirm')}</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

const selectStyle = { padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none', width: '100%', boxSizing: 'border-box' };
const actionBtnStyle = { background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '4px', padding: '8px', cursor: 'pointer', flexShrink: 0 };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' };
export default Discounts;