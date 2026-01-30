import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, FileText, CheckCircle, Clock, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { getPurchaseOrders, createPurchaseOrder, receivePurchaseOrder } from '../api/purchaseOrders';
import { getSuppliers } from '../api/suppliers';
import { getProducts } from '../api/products';

const PurchaseOrders = () => {
    const [pos, setPos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [newPO, setNewPO] = useState({
        supplierId: '',
        items: [{ productId: '', qty: 1, costPrice: 0 }]
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [poRes, supRes, prodRes] = await Promise.all([
                getPurchaseOrders(),
                getSuppliers(),
                getProducts()
            ]);
            if (poRes.success) setPos(poRes.data);
            if (supRes.success) setSuppliers(supRes.data);
            if (prodRes.success) setProducts(prodRes.data);
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
            const totalAmount = newPO.items.reduce((sum, item) => sum + (item.qty * item.costPrice), 0);
            const poData = {
                ...newPO,
                supplierId: newPO.supplierId || null,
                orderNo: `PO-${Date.now()}`,
                totalAmount,
                items: newPO.items.map(item => ({
                    ...item,
                    productId: item.productId || null
                }))
            };
            const result = await createPurchaseOrder(poData);
            if (result.success) {
                setModalOpen(false);
                fetchInitialData();
            }
        } catch (error) {
            alert('新增失敗');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReceive = async (id) => {
        if (!window.confirm('確認收貨？這將會更新相關產品庫存。')) return;
        try {
            const result = await receivePurchaseOrder(id);
            if (result.success) fetchInitialData();
        } catch (error) {
            alert('收貨失敗');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'received': return { icon: <CheckCircle size={14} />, color: '#4ade80', label: '已收貨' };
            case 'ordered': return { icon: <Clock size={14} />, color: '#fbbf24', label: '已下單' };
            case 'cancelled': return { icon: <XCircle size={14} />, color: '#f87171', label: '已取消' };
            default: return { icon: <FileText size={14} />, color: 'var(--text-muted)', label: '草稿' };
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem' }}>採購訂單</h2>
                <button onClick={() => setModalOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} /> 新增採購單
                </button>
            </div>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <th style={thStyle}>訂單編號</th>
                            <th style={thStyle}>供應商</th>
                            <th style={thStyle}>金額</th>
                            <th style={thStyle}>狀態</th>
                            <th style={thStyle}>日期</th>
                            <th style={thStyle}>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pos.map(po => {
                            const status = getStatusStyle(po.status);
                            return (
                                <tr key={po._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={tdStyle}><code>{po.orderNo}</code></td>
                                    <td style={tdStyle}>{po.supplierId?.name || '未知'}</td>
                                    <td style={tdStyle}>${po.totalAmount.toLocaleString()}</td>
                                    <td style={tdStyle}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: status.color, fontSize: '0.85rem' }}>
                                            {status.icon} {status.label}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>{new Date(po.createdAt).toLocaleDateString()}</td>
                                    <td style={tdStyle}>
                                        {po.status === 'draft' && (
                                            <button onClick={() => handleReceive(po._id)} className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.8rem', borderColor: '#4ade80', color: '#4ade80' }}>
                                                收貨進庫
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div style={modalOverlayStyle}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel" style={{ width: '600px', padding: '2rem' }}>
                        <h3>新增採購單</h3>
                        <form onSubmit={handleCreate} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="input-group">
                                <label>供應商</label>
                                <select required style={selectStyle} value={newPO.supplierId} onChange={e => setNewPO({ ...newPO, supplierId: e.target.value })}>
                                    <option value="">請選擇供應商</option>
                                    {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>產品明細</label>
                                {newPO.items.map((item, idx) => (
                                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 40px', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <select style={selectStyle} value={item.productId} onChange={e => {
                                            const items = [...newPO.items];
                                            items[idx].productId = e.target.value;
                                            setNewPO({ ...newPO, items });
                                        }}>
                                            <option value="">選擇產品</option>
                                            {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                        </select>
                                        <input type="number" placeholder="數量" value={item.qty} onChange={e => {
                                            const items = [...newPO.items];
                                            items[idx].qty = parseFloat(e.target.value);
                                            setNewPO({ ...newPO, items });
                                        }} />
                                        <input type="number" placeholder="進價" value={item.costPrice} onChange={e => {
                                            const items = [...newPO.items];
                                            items[idx].costPrice = parseFloat(e.target.value);
                                            setNewPO({ ...newPO, items });
                                        }} />
                                        <button type="button" onClick={() => setNewPO({ ...newPO, items: newPO.items.filter((_, i) => i !== idx) })} style={{ background: 'none', border: 'none', color: '#f87171' }}><XCircle size={18} /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => setNewPO({ ...newPO, items: [...newPO.items, { productId: '', qty: 1, costPrice: 0 }] })} className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>+ 新增品項</button>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>取消</button>
                                <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1 }}>{submitting ? <Loader2 size={18} className="animate-spin" /> : '建立草稿'}</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

const thStyle = { padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' };
const tdStyle = { padding: '1.2rem', fontSize: '0.95rem' };
const selectStyle = { padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none', width: '100%' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };

export default PurchaseOrders;
