import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Tag, Trash2, Loader2, Percent, DollarSign } from 'lucide-react';
import { getDiscounts, createDiscount, deleteDiscount } from '../api/discounts';

const Discounts = () => {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [newDiscount, setNewDiscount] = useState({ name: '', type: 'PERCENTAGE', value: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchDiscounts();
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
            alert('新增失敗');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('確定刪除此折扣？')) return;
        try {
            await deleteDiscount(id);
            fetchDiscounts();
        } catch (error) {
            alert('刪除失敗');
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem' }}>折扣管理</h2>
                <button onClick={() => setModalOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} /> 新增折扣
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {loading ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}><Loader2 className="animate-spin" /></div>
                ) : discounts.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>尚未建立任何折扣</div>
                ) : (
                    discounts.map(d => (
                        <div key={d._id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: '12px', color: 'var(--primary-light)' }}>
                                    {d.type === 'PERCENTAGE' ? <Percent size={24} /> : <DollarSign size={24} />}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{d.name}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        {d.type === 'PERCENTAGE' ? `${d.value}% 折扣` : `固定金額 -$${d.value}`}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(d._id)} style={actionBtnStyle}><Trash2 size={18} color="#f87171" /></button>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <div style={modalOverlayStyle}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel" style={{ width: '400px', padding: '2rem' }}>
                        <h3>新增折扣</h3>
                        <form onSubmit={handleCreate} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="input-group">
                                <label>名稱</label>
                                <input required value={newDiscount.name} onChange={e => setNewDiscount({ ...newDiscount, name: e.target.value })} placeholder="例如: 週末特惠" />
                            </div>
                            <div className="input-group">
                                <label>類型</label>
                                <select style={selectStyle} value={newDiscount.type} onChange={e => setNewDiscount({ ...newDiscount, type: e.target.value })}>
                                    <option value="PERCENTAGE">百分比 (%)</option>
                                    <option value="FIXED">固定金額 ($)</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>數值</label>
                                <input type="number" step="0.01" required value={newDiscount.value} onChange={e => setNewDiscount({ ...newDiscount, value: e.target.value })} placeholder="例如: 10" />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>取消</button>
                                <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1 }}>{submitting ? <Loader2 size={18} className="animate-spin" /> : '確認'}</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

const selectStyle = { padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none', width: '100%' };
const actionBtnStyle = { background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '4px', padding: '8px', cursor: 'pointer' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };

export default Discounts;
