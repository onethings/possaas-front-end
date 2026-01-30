import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    ExternalLink,
    Filter,
    Loader2
} from 'lucide-react';
import { getProducts, createProduct } from '../api/products';

const Products = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({
        sku: '',
        name: '',
        price: '',
        stock: '',
        category: ''
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const result = await getProducts();
            if (result.success) {
                setProducts(result.data);
            } else {
                setError('無法讀取產品列表');
            }
        } catch (err) {
            setError('伺服器連線失敗');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            const result = await createProduct({
                ...newProduct,
                price: parseFloat(newProduct.price),
                stock: parseInt(newProduct.stock)
            });
            if (result.success) {
                setModalOpen(false);
                setNewProduct({ sku: '', name: '', price: '', stock: '', category: '' });
                fetchProducts();
            }
        } catch (error) {
            alert(error.response?.data?.message || '新增失敗');
        }
    };

    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );


    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="animate-fade-in"
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem' }}>產品目錄</h2>
                <button onClick={() => setModalOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} /> 新增產品
                </button>
            </div>

            {/* Filters */}
            <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="搜尋名稱或 SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={searchStyle}
                    />
                </div>
                <button className="glass-card" style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <Filter size={18} /> 篩選
                </button>
            </div>

            {/* Table */}
            <div className="glass-panel" style={{ overflow: 'hidden', minHeight: '200px', display: 'flex', flexDirection: 'column' }}>
                {loading ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                        <Loader2 className="animate-spin" size={24} /> 讀取中...
                    </div>
                ) : error ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
                        {error}
                    </div>
                ) : products.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '4rem', color: 'var(--text-muted)' }}>
                        <p>請先新增產品</p>
                        <button onClick={() => setModalOpen(true)} className="btn-secondary">立即新增</button>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <th style={thStyle}>SKU / 條碼</th>
                                <th style={thStyle}>產品名稱</th>
                                <th style={thStyle}>價格</th>
                                <th style={thStyle}>庫存</th>
                                <th style={thStyle}>分類</th>
                                <th style={thStyle}>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        找不到符合條件的產品
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((p) => (
                                    <tr key={p._id || p.sku} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={tdStyle}><code style={{ color: 'var(--primary-light)' }}>{p.sku || 'N/A'}</code></td>
                                        <td style={tdStyle}>{p.name}</td>
                                        <td style={tdStyle}>${p.price?.toLocaleString()}</td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '0.8rem',
                                                background: (p.stock || 0) < 10 ? 'rgba(248, 113, 113, 0.1)' : 'rgba(74, 222, 128, 0.1)',
                                                color: (p.stock || 0) < 10 ? '#f87171' : '#4ade80'
                                            }}>
                                                {p.stock || 0} 件
                                            </span>
                                        </td>
                                        <td style={tdStyle}>{p.category || '未分類'}</td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button style={actionBtnStyle}><Edit2 size={16} /></button>
                                                <button style={actionBtnStyle}><Trash2 size={16} color="#f87171" /></button>
                                                <button style={actionBtnStyle}><ExternalLink size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={modalOverlayStyle}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel" style={modalContentStyle}>
                        <h3 style={{ marginBottom: '1.5rem' }}>新增產品</h3>
                        <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="input-group">
                                <label>產品名稱</label>
                                <input type="text" required value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="例如: 經典美式咖啡" />
                            </div>
                            <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label>SKU / 條碼</label>
                                    <input type="text" required value={newProduct.sku} onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })} placeholder="SKU001" />
                                </div>
                                <div>
                                    <label>分類</label>
                                    <input type="text" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} placeholder="飲料" />
                                </div>
                            </div>
                            <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label>銷售價格</label>
                                    <input type="number" required value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="0.00" />
                                </div>
                                <div>
                                    <label>初始庫存</label>
                                    <input type="number" required value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} placeholder="0" />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>取消</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>確認新增</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContentStyle = { width: '500px', padding: '2rem' };
const thStyle = { padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)' };
const tdStyle = { padding: '1.2rem', fontSize: '0.95rem' };
const searchStyle = { padding: '0.6rem 1rem 0.6rem 40px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white', width: '100%', outline: 'none' };
const actionBtnStyle = { background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer', color: 'var(--text-muted)' };

export default Products;
