import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Search,
    MoreVertical,
    Edit2,
    Trash2,
    ExternalLink,
    Filter
} from 'lucide-react';

const Products = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const mockProducts = [
        { sku: 'P010214', name: '原裝墨盒 P01', price: 1200, stock: 45, category: '配件' },
        { sku: 'P120556', name: '維修配件套裝', price: 450, stock: 12, category: '套裝' },
        { sku: 'P884102', name: '打印機噴頭', price: 2800, stock: 5, category: '配件' },
        { sku: 'S001124', name: '相紙 A4 50張', price: 180, stock: 120, category: '耗材' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="animate-fade-in"
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem' }}>產品目錄</h2>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
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
                        {mockProducts.map((p) => (
                            <tr key={p.sku} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={tdStyle}><code style={{ color: 'var(--primary-light)' }}>{p.sku}</code></td>
                                <td style={tdStyle}>{p.name}</td>
                                <td style={tdStyle}>${p.price.toLocaleString()}</td>
                                <td style={tdStyle}>
                                    <span style={{
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '0.8rem',
                                        background: p.stock < 10 ? 'rgba(248, 113, 113, 0.1)' : 'rgba(74, 222, 128, 0.1)',
                                        color: p.stock < 10 ? '#f87171' : '#4ade80'
                                    }}>
                                        {p.stock} 件
                                    </span>
                                </td>
                                <td style={tdStyle}>{p.category}</td>
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button style={actionBtnStyle}><Edit2 size={16} /></button>
                                        <button style={actionBtnStyle}><Trash2 size={16} color="#f87171" /></button>
                                        <button style={actionBtnStyle}><ExternalLink size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

const thStyle = { padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)' };
const tdStyle = { padding: '1.2rem', fontSize: '0.95rem' };
const searchStyle = { padding: '0.6rem 1rem 0.6rem 40px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white', width: '100%', outline: 'none' };
const actionBtnStyle = { background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer', color: 'var(--text-muted)' };

export default Products;
