import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Shield, ShieldAlert, Loader2, Edit2, Lock, Key } from 'lucide-react';
import { getStaff, registerStaff, updateStaff, updateStaffStatus, resetStaffPassword } from '../api/staff';
import { useAuth } from '../contexts/AuthContext';

const StaffManagement = () => {
    const { user: currentUser } = useAuth();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newStaff, setNewStaff] = useState({ username: '', name: '', password: '', level: 5 });
    const [editingId, setEditingId] = useState(null);

    const roles = [
        { level: 1, name: '系統超管' },
        { level: 2, name: '區域代理' },
        { level: 3, name: '經銷商' },
        { level: 4, name: '店長/經理' },
        { level: 5, name: '一般收銀員' },
        { level: 6, name: '庫存主管' }
    ];

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

    const handleOpenModal = (s = null) => {
        if (s) {
            setEditingId(s._id);
            setNewStaff({ username: s.username, name: s.name || s.username, password: '', level: s.level });
        } else {
            setEditingId(null);
            setNewStaff({ username: '', name: '', password: '', level: 5 });
        }
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let result;
            if (editingId) {
                // 如果是編輯，密碼可為空（表示不修改）
                const updateData = { ...newStaff };
                if (!updateData.password) delete updateData.password;
                result = await updateStaff(editingId, updateData);
            } else {
                result = await registerStaff(newStaff);
            }

            if (result.success) {
                setModalOpen(false);
                fetchStaff();
            }
        } catch (error) {
            alert(error.response?.data?.message || '操作失敗');
        } finally {
            setSubmitting(false);
        }
    };

    const handleResetPwd = async (id, name) => {
        if (window.confirm(`確定要將員工「${name}」的密碼重置為 Aa1357 嗎？`)) {
            try {
                const result = await resetStaffPassword(id);
                if (result.success) alert('密碼已重置為 Aa1357');
            } catch (error) {
                alert(error.response?.data?.message || '重置失敗');
            }
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
        try {
            await updateStaffStatus(id, newStatus);
            fetchStaff();
        } catch (error) {
            alert(error.response?.data?.message || '更新狀態失敗');
        }
    };

    const getRoleDisplayName = (level) => {
        const role = roles.find(r => r.level === level);
        return role ? role.name : '普通員工';
    };

    const filteredStaff = staff.filter(s => 
        s.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // 過濾出目前登入者可以指派的等級 (只能指派比自己低的)
    const assignableRoles = roles.filter(r => r.level > currentUser.role);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem' }}>員工管理</h2>
                <button onClick={() => handleOpenModal()} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} /> 新增員工
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '1rem' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        id="staff-search"
                        name="staff-search"
                        type="text"
                        placeholder="搜尋姓名或帳號..."
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
                                <th style={thStyle}>姓名</th>
                                <th style={thStyle}>登入帳號</th>
                                <th style={thStyle}>職稱</th>
                                <th style={thStyle}>狀態</th>
                                <th style={thStyle}>加入時間</th>
                                <th style={thStyle}>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStaff.map((s) => (
                                <tr key={s._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <div style={avatarStyle}>{(s.name || s.username)[0].toUpperCase()}</div>
                                            <span style={{ fontWeight: 500 }}>{s.name || s.username}</span>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>{s.username}</td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Shield size={14} color="var(--primary)" />
                                            {getRoleDisplayName(s.level)}
                                        </div>
                                    </td>
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
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => handleOpenModal(s)} style={actionBtnStyle} title="編輯資訊">
                                                <Edit2 size={16} color="var(--text-muted)" />
                                            </button>
                                            
                                            {/* 禁止對自己或同級/高階進行停用操作 */}
                                            {s._id !== currentUser.id && s.level > currentUser.role && (
                                                <>
                                                    <button onClick={() => toggleStatus(s._id, s.status)} style={actionBtnStyle}>
                                                        {s.status === 'active' ? <ShieldAlert size={16} color="#f87171" title="停用" /> : <Shield size={16} color="#4ade80" title="啟用" />}
                                                    </button>
                                                    <button onClick={() => handleResetPwd(s._id, s.name || s.username)} style={actionBtnStyle} title="重置密碼為 Aa1357">
                                                        <Lock size={16} color="#fbbf24" />
                                                    </button>
                                                </>
                                            )}
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
                        <h3>{editingId ? '編輯員工資訊' : '新增員工帳號'}</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                            <div className="input-group">
                                <label>員工姓名</label>
                                <input type="text" required value={newStaff.name} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })} placeholder="例如: 王小明" />
                            </div>
                            <div className="input-group">
                                <label>登入帳號 (Username)</label>
                                <input type="text" required value={newStaff.username} onChange={e => setNewStaff({ ...newStaff, username: e.target.value })} placeholder="例如: xiaoming_pos" />
                            </div>
                            <div className="input-group">
                                <label>{editingId ? '修改密碼 (若不修改請留空)' : '預設密碼'}</label>
                                <input type="password" required={!editingId} value={newStaff.password} onChange={e => setNewStaff({ ...newStaff, password: e.target.value })} placeholder={editingId ? "輸入新密碼" : "請輸入密碼"} />
                            </div>
                            
                            {/* 只有在新增或是編輯他人時可以改等級，且本人不能改自己的等級 */}
                            {(editingId !== currentUser.id) && (
                                <div className="input-group">
                                    <label>職位等級</label>
                                    <select value={newStaff.level} onChange={e => setNewStaff({ ...newStaff, level: parseInt(e.target.value) })}>
                                        {assignableRoles.map(r => (
                                            <option key={r.level} value={r.level}>{r.name}</option>
                                        ))}
                                        {/* 如果目前等級不在可選範圍內（例如同級編輯但不可升降），顯示目前等級供參考但不可選？ 
                                            不過我們後端已限制不能修改同級，所以這裡只顯示比自己低的 */}
                                        {!assignableRoles.some(r => r.level === newStaff.level) && (
                                            <option value={newStaff.level} disabled>{getRoleDisplayName(newStaff.level)} (不可更改)</option>
                                        )}
                                    </select>
                                </div>
                            )}
                            
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" disabled={submitting} onClick={() => setModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>取消</button>
                                <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    {submitting ? <Loader2 size={18} className="animate-spin" /> : (editingId ? '確認更新' : '確認新增')}
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
