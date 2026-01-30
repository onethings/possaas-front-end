import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Filter, Plus, Mail, Phone, MoreVertical } from 'lucide-react';

const Customers = () => {
    const [search, setSearch] = useState('');

    // Mock data for demonstration
    const customers = [
        { id: 1, name: '陳小明', email: 'ming@example.com', phone: '0912-345-678', lastOrder: '2024-01-28', totalSpent: '$1,200' },
        { id: 2, name: '李美華', email: 'hua@example.com', phone: '0922-111-222', lastOrder: '2024-01-29', totalSpent: '$850' },
        { id: 3, name: '張大千', email: 'qian@example.com', phone: '0933-555-444', lastOrder: '2024-01-25', totalSpent: '$2,500' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="animate-fade-in"
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem' }}>客戶管理</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>檢視並管理您的客戶資料與消費記錄</p>
                </div>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} /> 新增客戶
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="搜尋客戶姓名、電話或 Email..."
                        style={inputStyle}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Filter size={18} /> 篩選
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                            <th style={thStyle}>客戶</th>
                            <th style={thStyle}>聯繫方式</th>
                            <th style={thStyle}>最後訂單</th>
                            <th style={thStyle}>累計消費</th>
                            <th style={thStyle}>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map(customer => (
                            <tr key={customer.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                            {customer.name.charAt(0)}
                                        </div>
                                        {customer.name}
                                    </div>
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ fontSize: '0.85rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} color="var(--text-muted)" /> {customer.email}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} color="var(--text-muted)" /> {customer.phone}</div>
                                    </div>
                                </td>
                                <td style={tdStyle}>{customer.lastOrder}</td>
                                <td style={tdStyle}>{customer.totalSpent}</td>
                                <td style={tdStyle}>
                                    <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                        <MoreVertical size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

const inputStyle = {
    width: '100%',
    padding: '0.6rem 1rem 0.6rem 40px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 'var(--radius-md)',
    color: 'white',
    outline: 'none',
    fontSize: '0.9rem'
};

const thStyle = {
    padding: '1rem',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: 'normal'
};

const tdStyle = {
    padding: '1rem',
    fontSize: '0.9rem'
};

export default Customers;
