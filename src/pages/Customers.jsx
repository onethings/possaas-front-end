import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, Mail, Phone, Edit2, Trash2, Loader2, Square, CheckSquare } from 'lucide-react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api/customers';

const Customers = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [editId, setEditId] = useState(null);
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        phone: '',
        email: '',
        address: ''
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const result = await getCustomers();
            if (result.success) setCustomers(result.data);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let result;
            if (editId) {
                result = await updateCustomer(editId, newCustomer);
            } else {
                result = await createCustomer(newCustomer);
            }

            if (result.success) {
                setModalOpen(false);
                setNewCustomer({ name: '', phone: '', email: '', address: '' });
                setEditId(null);
                fetchCustomers();
            }
        } catch (error) {
            alert(error.response?.data?.message || (editId ? '更新失敗' : '新增失敗'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleBatchDelete = async () => {
        if (!confirm(`確定刪除選中的 ${selectedIds.length} 位客戶？`)) return;
        try {
            await Promise.all(selectedIds.map(id => deleteCustomer(id)));
            setSelectedIds([]);
            fetchCustomers();
        } catch (error) {
            alert('刪除失敗');
        }
    };

    const handleEdit = (customer) => {
        setEditId(customer._id);
        setNewCustomer({
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            address: customer.address
        });
        setModalOpen(true);
    };

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const filteredCustomers = customers.filter(c =>
        (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.phone && c.phone.includes(searchTerm))
    );

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="animate-fade-in"
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem' }}>客戶資料管理</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {selectedIds.length > 0 && (
                        <button onClick={handleBatchDelete} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', borderColor: '#f87171' }}>
                            <Trash2 size={18} /> 刪除 ({selectedIds.length})
                        </button>
                    )}
                    <button onClick={() => { setEditId(null); setNewCustomer({ name: '', phone: '', email: '', address: '' }); setModalOpen(true); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={18} /> 新增客戶
                    </button>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="搜尋客戶姓名或電話..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={searchStyle}
                    />
                </div>
            </div>

            <div className="glass-panel" style={{ overflow: 'hidden', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
                {loading ? (
                    <div style={centerStyle}><Loader2 className="animate-spin" /> 讀取中...</div>
                ) : customers.length === 0 ? (
                    <div style={centerStyle}>目前無資料</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <th style={{ padding: '1.2rem', width: '40px' }}>
                                    <button onClick={() => setSelectedIds(selectedIds.length === filteredCustomers.length ? [] : filteredCustomers.map(c => c._id))} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                                        {selectedIds.length === filteredCustomers.length && filteredCustomers.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                                    </button>
                                </th>
                                <th style={thStyle}>姓名</th>
                                <th style={thStyle}>聯絡電話</th>
                                <th style={thStyle}>Email</th>
                                <th style={thStyle}>通訊地址</th>
                                <th style={thStyle}>累積點數</th>
                                <th style={thStyle}>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map((c) => (
                                <tr key={c._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: selectedIds.includes(c._id) ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
                                    <td style={{ padding: '1.2rem' }}>
                                        <button onClick={() => toggleSelect(c._id)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                                            {selectedIds.includes(c._id) ? <CheckSquare size={18} color="var(--primary)" /> : <Square size={18} color="var(--text-muted)" />}
                                        </button>
                                    </td>
                                    <td style={tdStyle}>{c.name}</td>
                                    <td style={tdStyle}>{c.phone || 'N/A'}</td>
                                    <td style={tdStyle}>{c.email || 'N/A'}</td>
                                    <td style={tdStyle}>{c.address || 'N/A'}</td>
                                    <td style={tdStyle}>
                                        <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{c.points || 0} pt</span>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => handleEdit(c)} style={actionBtnStyle}><Edit2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={modalOverlayStyle}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel" style={modalContentStyle}>
                        <h3 style={{ marginBottom: '1.5rem' }}>{editId ? '編輯客戶' : '新增客戶'}</h3>
                        <form onSubmit={handleCreateOrUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="input-group">
                                <label>客戶姓名</label>
                                <input type="text" required value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} placeholder="例如: 王小明" />
                            </div>
                            <div className="input-group">
                                <label>聯絡電話</label>
                                <input type="text" value={newCustomer.phone} onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })} placeholder="0912345678" />
                            </div>
                            <div className="input-group">
                                <label>Email</label>
                                <input type="email" value={newCustomer.email} onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} placeholder="example@mail.com" />
                            </div>
                            <div className="input-group">
                                <label>通訊地址</label>
                                <input type="text" value={newCustomer.address} onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })} placeholder="台北市..." />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" disabled={submitting} onClick={() => setModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>取消</button>
                                <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    {submitting ? <Loader2 size={18} className="animate-spin" /> : (editId ? '確認更新' : '確認新增')}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContentStyle = { width: '450px', padding: '2rem' };
const thStyle = { padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textAlign: 'left' };
const tdStyle = { padding: '1.2rem', fontSize: '0.95rem' };
const searchStyle = { padding: '0.8rem 1rem 0.8rem 40px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white', width: '100%', outline: 'none' };
const centerStyle = { height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '0.5rem' };
const actionBtnStyle = { background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer', color: 'var(--text-muted)' };

export default Customers;
