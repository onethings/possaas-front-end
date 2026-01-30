import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, UserCheck, Shield, Trash2, ShieldAlert, Loader2 } from 'lucide-react';
import { getStaff, registerStaff, updateStaffStatus } from '../api/staff';

const StaffManagement = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newStaff, setNewStaff] = useState({ username: '', password: '', level: 5 });

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const result = await getStaff();
            if (result.success) setStaff(result.data);
        } catch (error) {
            console.error('Failed to fetch staff:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const result = await registerStaff(newStaff);
            if (result.success) {
                setModalOpen(false);
                setNewStaff({ username: '', password: '', level: 5 });
                fetchStaff();
            }
        } catch (error) {
            alert(error.response?.data?.message || '新增失敗');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
        try {
            await updateStaffStatus(id, newStatus);
            fetchStaff();
        } catch (error) {
            alert('更新狀態失敗');
        }
    };

    const getRoleName = (level) => {
        const roles = {
            1: '系統超管',
            2: '區域代理',
            3: '經銷商',
            4: '店東/經理',
            5: '收銀員',
            6: '庫存管理'
        };
        return roles[level] || '普通員工';
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem' }}>員工管理</h2>
                <button onClick={() => setModalOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} /> 新增員工
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '1rem' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="搜尋員工名稱..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={searchStyle}
                    />
                </div>
            </div>

            <div className="glass-panel" style={{ overflow: 'hidden', minHeight: '300px' }}>
                {loading ? (
                    <div style={centerStyle}><Loader2 className="animate-spin" /> 讀取中...</div>
                ) : staff.length === 0 ? (
                    <div style={centerStyle}>目前暫無員工資料</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <th style={thStyle}>姓名/帳號</th>
                                <th style={thStyle}>職位等級</th>
                                <th style={thStyle}>狀態</th>
                                <th style={thStyle}>加入時間</th>
                                <th style={thStyle}>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.filter(s => s.username.includes(searchTerm)).map((s) => (
                                <tr key={s._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <div style={avatarStyle}>{s.username[0].toUpperCase()}</div>
                                            {s.username}
                                        </div>
                                    </td>
                                    <td style={tdStyle}>{getRoleName(s.level)}</td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem',
                                            background: s.status === 'active' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                                            color: s.status === 'active' ? '#4ade80' : '#f87171'
                                        }}>
                                            {s.status === 'active' ? '在職' : '停用'}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>{new Date(s.createdAt).toLocaleDateString()}</td>
                                    <td style={tdStyle}>
                                        <button onClick={() => toggleStatus(s._id, s.status)} style={actionBtnStyle}>
                                            {s.status === 'active' ? <ShieldAlert size={16} color="#f87171" title="停用" /> : <Shield size={16} color="#4ade80" title="啟用" />}
                                        </button>
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
                        <h3>新增員工帳號</h3>
                        <form onSubmit={handleAddStaff} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                            <div className="input-group">
                                <label>登入帳號</label>
                                <input type="text" required value={newStaff.username} onChange={e => setNewStaff({ ...newStaff, username: e.target.value })} placeholder="例如: Cashier01" />
                            </div>
                            <div className="input-group">
                                <label>預設密碼</label>
                                <input type="password" required value={newStaff.password} onChange={e => setNewStaff({ ...newStaff, password: e.target.value })} placeholder="請輸入密碼" />
                            </div>
                            <div className="input-group">
                                <label>職位等級</label>
                                <select value={newStaff.level} onChange={e => setNewStaff({ ...newStaff, level: parseInt(e.target.value) })}>
                                    <option value={5}>一般收銀員</option>
                                    <option value={4}>店長/經理</option>
                                    <option value={6}>庫存主管</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" disabled={submitting} onClick={() => setModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>取消</button>
                                <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    {submitting ? <Loader2 size={18} className="animate-spin" /> : '確認新增'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

const thStyle = { padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textAlign: 'left' };
const tdStyle = { padding: '1.2rem', fontSize: '0.95rem' };
const searchStyle = { padding: '0.8rem 1rem 0.8rem 40px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white', width: '100%', outline: 'none' };
const centerStyle = { height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '0.5rem' };
const avatarStyle = { width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 };
const actionBtnStyle = { background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContentStyle = { width: '400px', padding: '2rem' };

export default StaffManagement;
