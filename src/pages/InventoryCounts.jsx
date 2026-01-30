import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Plus, Search, AlertCircle, Loader2 } from 'lucide-react';
import { getProducts } from '../api/products';
import { createAdjustment } from '../api/inventoryAdjustments';

const InventoryCounts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [adjustment, setAdjustment] = useState({
        productId: '',
        variantId: '',
        changeQty: 0,
        reason: 'correction',
        note: ''
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const result = await getProducts();
            if (result.success) setProducts(result.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdjust = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const result = await createAdjustment(adjustment);
            if (result.success) {
                setModalOpen(false);
                setAdjustment({ productId: '', variantId: '', changeQty: 0, reason: 'correction', note: '' });
                fetchProducts();
            }
        } catch (error) {
            alert('調整失敗');
        } finally {
            setSubmitting(false);
        }
    };

    const selectedProduct = products.find(p => p._id === adjustment.productId);
    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem' }}>庫存盤點與調整</h2>
                <button onClick={() => setModalOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} /> 新增調整
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="搜尋產品以查看庫存..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={searchStyle}
                    />
                </div>
            </div>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <th style={thStyle}>產品名稱</th>
                            <th style={thStyle}>SKU</th>
                            <th style={thStyle}>當前庫存</th>
                            <th style={thStyle}>單位</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(p => (
                            <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={tdStyle}>{p.name}</td>
                                <td style={tdStyle}><code>{p.sku}</code></td>
                                <td style={tdStyle}>{p.stock}</td>
                                <td style={tdStyle}>{p.soldBy === 'weight' ? 'kg' : 'pcs'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div style={modalOverlayStyle}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel" style={{ width: '450px', padding: '2rem' }}>
                        <h3>新增庫存調整</h3>
                        <form onSubmit={handleAdjust} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="input-group">
                                <label>產品</label>
                                <select required style={selectStyle} value={adjustment.productId} onChange={e => setAdjustment({ ...adjustment, productId: e.target.value, variantId: '' })}>
                                    <option value="">選擇產品</option>
                                    {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                </select>
                            </div>

                            {selectedProduct?.hasVariants && (
                                <div className="input-group">
                                    <label>規格 (Variant)</label>
                                    <select required style={selectStyle} value={adjustment.variantId} onChange={e => setAdjustment({ ...adjustment, variantId: e.target.value })}>
                                        <option value="">選擇規格</option>
                                        {selectedProduct.variants.map(v => <option key={v._id} value={v._id}>{v.name} (庫存: {v.stock})</option>)}
                                    </select>
                                </div>
                            )}

                            <div className="input-group">
                                <label>調整數量 (正值增加，負值減少)</label>
                                <input type="number" step="0.01" required value={adjustment.changeQty} onChange={e => setAdjustment({ ...adjustment, changeQty: parseFloat(e.target.value) })} />
                            </div>

                            <div className="input-group">
                                <label>原因</label>
                                <select style={selectStyle} value={adjustment.reason} onChange={e => setAdjustment({ ...adjustment, reason: e.target.value })}>
                                    <option value="correction">盤點更正</option>
                                    <option value="damage">產品損耗/報廢</option>
                                    <option value="received">收到品項</option>
                                    <option value="inventory_count">庫存盤點</option>
                                    <option value="other">其他</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label>備註</label>
                                <textarea style={{ ...selectStyle, height: '80px', resize: 'none' }} value={adjustment.note} onChange={e => setAdjustment({ ...adjustment, note: e.target.value })} />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>取消</button>
                                <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1 }}>{submitting ? <Loader2 size={18} className="animate-spin" /> : '確認調整'}</button>
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
const searchStyle = { padding: '0.8rem 1rem 0.8rem 40px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white', width: '100%', outline: 'none' };

export default InventoryCounts;
