import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GuidedTour from '../components/GuidedTour';
import { pageTours } from '../utils/pageTours';
import { motion } from 'framer-motion';
import { Plus, Search, Shield, ShieldAlert, Loader2, Edit2, Lock, Calendar, User } from 'lucide-react';
import { getStaff, registerStaff, updateStaff, updateStaffStatus, resetStaffPassword } from '../api/staff';
import { useAuth } from '../contexts/AuthContext';

const StaffManagement = () => {
    const { t } = useTranslation();
    const { user: currentUser } = useAuth();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newStaff, setNewStaff] = useState({ username: '', name: '', password: '', level: 5 });
    const [editingId, setEditingId] = useState(null);

    const roles = [
        { level: 1, name: t('staff.roles.level_1') },
        { level: 2, name: t('staff.roles.level_2') },
        { level: 3, name: t('staff.roles.level_3') },
        { level: 4, name: t('staff.roles.level_4') },
        { level: 5, name: t('staff.roles.level_5') },
        { level: 6, name: t('staff.roles.level_6') }
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
        if (window.confirm(t('staff.alerts.reset_confirm', { name }))) {
            try {
                const result = await resetStaffPassword(id);
                if (result.success) alert(t('staff.alerts.reset_success'));
            } catch (error) {
                alert(error.response?.data?.message || t('staff.alerts.reset_fail'));
            }
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
        try {
            await updateStaffStatus(id, newStatus);
            fetchStaff();
        } catch (error) {
            alert(error.response?.data?.message || t('staff.alerts.reset_fail'));
        }
    };

    const getRoleDisplayName = (level) => {
        const role = roles.find(r => r.level === level);
        return role ? role.name : t('staff.roles.default');
    };

    const filteredStaff = staff.filter(s => 
        s.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const assignableRoles = roles.filter(r => r.level > currentUser.role);

    // 抽離出操作按鈕組件，方便在 Table 與 Mobile Card 兩處重複使用
    const ActionButtons = ({ item }) => (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => handleOpenModal(item)} style={actionBtnStyle} title={t('staff.actions.edit')}>
                <Edit2 size={16} color="var(--text-muted)" />
            </button>
            
            {item._id !== currentUser.id && item.level > currentUser.role && (
                <>
                    <button onClick={() => toggleStatus(item._id, item.status)} style={actionBtnStyle}>
                        {item.status === 'active' ? (
                            <ShieldAlert size={16} color="#f87171" title={t('staff.actions.disable')} />
                        ) : (
                            <Shield size={16} color="#4ade80" title={t('staff.actions.enable')} />
                        )}
                    </button>
                    <button onClick={() => handleResetPwd(item._id, item.name || item.username)} style={actionBtnStyle} title={t('staff.actions.reset_password')}>
                        <Lock size={16} color="#fbbf24" />
                    </button>
                </>
            )}
        </div>
    );

    return (<>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '100vw', boxSizing: 'border-box' }}>
            {/* 標題與按鈕：在手機端改為上下排列 */}
            <div style={headerWrapperStyle}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{t('staff.title')}</h2>
                <button onClick={() => handleOpenModal()} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: 'auto', padding: '0.6rem 1.2rem' }}>
                    <Plus size={18} /> {t('staff.add_staff')}
                </button>
            </div>

            {/* 搜尋欄防爆版型 */}
            <div className="glass-panel" style={{ padding: '0.8rem' }}>
                <div style={{ position: 'relative', width: '100%' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        id="staff-search"
                        name="staff-search"
                        type="text"
                        placeholder={t('staff.search_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={searchStyle}
                    />
                </div>
            </div>

            {/* 主要資料展示區 */}
            <div className="glass-panel" style={{ overflow: 'hidden', minHeight: '300px', width: '100%' }}>
                {loading ? (
                    <div style={centerStyle}><Loader2 className="animate-spin" /> {t('common.loading')}</div>
                ) : filteredStaff.length === 0 ? (
                    <div style={centerStyle}>{t('staff.no_data')}</div>
                ) : (
                    <>
                        {/* 電腦端：顯示傳統表格 (利用 CSS Class 控制顯示隱藏) */}
                        <div className="hidden-mobile" style={{ overflowX: 'auto', width: '100%' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                        <th style={thStyle}>{t('staff.table.name')}</th>
                                        <th style={thStyle}>{t('staff.table.account')}</th>
                                        <th style={thStyle}>{t('staff.table.role')}</th>
                                        <th style={thStyle}>{t('staff.table.status')}</th>
                                        <th style={thStyle}>{t('staff.table.joined_at')}</th>
                                        <th style={thStyle}>{t('staff.table.actions')}</th>
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
                                                    {s.status === 'active' ? t('staff.status.active') : t('staff.status.disabled')}
                                                </span>
                                            </td>
                                            <td style={tdStyle}>{new Date(s.createdAt).toLocaleDateString()}</td>
                                            <td style={tdStyle}>
                                                <ActionButtons item={s} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* 手機端：轉換為響應式卡片佈局 */}
                        <div className="visible-mobile" style={mobileCardListStyle}>
                            {filteredStaff.map((s) => (
                                <div key={s._id} style={mobileCardStyle}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem', marginBottom: '0.8rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                            <div style={avatarStyle}>{(s.name || s.username)[0].toUpperCase()}</div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '1rem', color: '#fff' }}>{s.name || s.username}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <User size={12} /> {s.username}
                                                </div>
                                            </div>
                                        </div>
                                        <span style={{
                                            padding: '3px 8px', borderRadius: '12px', fontSize: '0.7rem',
                                            background: s.status === 'active' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                                            color: s.status === 'active' ? '#4ade80' : '#f87171'
                                        }}>
                                            {s.status === 'active' ? t('staff.status.active') : t('staff.status.disabled')}
                                        </span>
                                    </div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Shield size={14} color="var(--primary)" />
                                            <span>{t('staff.table.role')}: <strong style={{ color: '#eee' }}>{getRoleDisplayName(s.level)}</strong></span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Calendar size={14} />
                                            <span>{t('staff.table.joined_at')}: {new Date(s.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end' }}>
                                        <ActionButtons item={s} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Modal 快顯視窗響應式優化 */}
            {isModalOpen && (
                <div style={modalOverlayStyle}>
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        className="glass-panel" 
                        style={modalContentStyle}
                    >
                        <h3 style={{ margin: 0 }}>{editingId ? t('staff.modal.title_edit') : t('staff.modal.title_add')}</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                            <div className="input-group">
                                <label style={labelStyle}>{t('staff.modal.label_name')}</label>
                                <input type="text" required value={newStaff.name} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })} placeholder={t('staff.modal.placeholder_name')} style={inputStyle} />
                            </div>
                            <div className="input-group">
                                <label style={labelStyle}>{t('staff.modal.label_username')}</label>
                                <input type="text" required value={newStaff.username} onChange={e => setNewStaff({ ...newStaff, username: e.target.value })} placeholder={t('staff.modal.placeholder_username')} style={inputStyle} />
                            </div>
                            <div className="input-group">
                                <label style={labelStyle}>{editingId ? t('staff.modal.label_password_edit') : t('staff.modal.label_password_add')}</label>
                                <input type="password" required={!editingId} value={newStaff.password} onChange={e => setNewStaff({ ...newStaff, password: e.target.value })} placeholder={editingId ? t('staff.modal.placeholder_password_edit') : t('staff.modal.placeholder_password_add')} style={inputStyle} />
                            </div>
                            
                            {editingId !== currentUser.id && (
                                <div className="input-group">
                                    <label style={labelStyle}>{t('staff.modal.label_role')}</label>
                                    <select value={newStaff.level} onChange={e => setNewStaff({ ...newStaff, level: parseInt(e.target.value) })} style={selectStyle}>
                                        {assignableRoles.map(r => (
                                            <option key={r.level} value={r.level}>{r.name}</option>
                                        ))}
                                        {!assignableRoles.some(r => r.level === newStaff.level) && (
                                            <option value={newStaff.level} disabled>{getRoleDisplayName(newStaff.level)} (不可更改)</option>
                                        )}
                                    </select>
                                </div>
                            )}
                            
                            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                                <button type="button" disabled={submitting} onClick={() => setModalOpen(false)} className="btn-secondary" style={{ flex: 1, minWidth: '100px' }}>{t('common.cancel')}</button>
                                <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1, minWidth: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    {submitting ? <Loader2 size={18} className="animate-spin" /> : (editingId ? t('common.confirm_update') : t('common.confirm_add'))}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* 注入響應式所需的 CSS Media Queries 樣式 */}
            <style>{`
                .hidden-mobile { display: block; }
                .visible-mobile { display: none; }
                
                @media (max-width: 768px) {
                    .hidden-mobile { display: none !important; }
                    .visible-mobile { display: block !important; }
                }
            `}</style>
        </motion.div>
        <GuidedTour tourId="staffManagement" steps={pageTours.staffManagement(t)} />
    </>
    );
};

/* --- 調整與新增的樣式物件 --- */
const headerWrapperStyle = { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap' // 當螢幕過窄時，自動換行
};

const mobileCardListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '0.8rem',
    boxSizing: 'border-box'
};

const mobileCardStyle = {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column'
};

const thStyle = { padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textAlign: 'left' };
const tdStyle = { padding: '1.2rem', fontSize: '0.95rem' };
const searchStyle = { padding: '0.8rem 1rem 0.8rem 40px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white', width: '100%', outline: 'none', boxSizing: 'border-box' };
const centerStyle = { height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '0.5rem' };
const avatarStyle = { width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 };
const actionBtnStyle = { background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '4px', padding: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };

// Modal 彈窗滿版自適應
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' };
const modalContentStyle = { width: '100%', maxWidth: '400px', padding: '1.5rem', boxSizing: 'border-box' };

// 統一規範 Modal 內建 input/select 寬度，避免跑版
const labelStyle = { display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' };
const inputStyle = { width: '100%', boxSizing: 'border-box' };
const selectStyle = { width: '100%', boxSizing: 'border-box', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' };
export default StaffManagement;