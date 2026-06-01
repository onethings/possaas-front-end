import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Loader2, X, Shield } from 'lucide-react';
import { getRoles, createRole, updateRole, deleteRole } from '../../api/roles';

const AccessRightsPage = () => {
    const { t } = useTranslation();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({ level: '', roleName: '', permissions: '', description: '' });

    useEffect(() => { fetchRoles(); }, []);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const result = await getRoles();
            if (result.success) setRoles(result.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const openCreate = () => {
        setEditingRole(null);
        setFormData({ level: '', roleName: '', permissions: '', description: '' });
        setModalOpen(true);
    };

    const openEdit = (role) => {
        setEditingRole(role);
        setFormData({
            level: role.level.toString(),
            roleName: role.roleName,
            permissions: (role.permissions || []).join(', '),
            description: role.description || ''
        });
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('access_rights.confirm_delete', '確定刪除此角色？'))) return;
        try {
            const result = await deleteRole(id);
            if (result.success) fetchRoles();
        } catch (err) { console.error(err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                level: parseInt(formData.level),
                roleName: formData.roleName,
                permissions: formData.permissions.split(',').map(p => p.trim()).filter(Boolean),
                description: formData.description,
            };
            let result;
            if (editingRole) {
                result = await updateRole(editingRole._id, payload);
            } else {
                result = await createRole(payload);
            }
            if (result.success) {
                setModalOpen(false);
                fetchRoles();
            }
        } catch (err) {
            alert(err.response?.data?.message || t('common.error'));
        } finally { setSubmitting(false); }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={20} style={{ color: 'var(--primary-light)' }} />
                    {t('access_rights.title', '存取權限')}
                </h3>
                <button onClick={openCreate} className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Plus size={16} /> {t('access_rights.add_role', '新增角色')}
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}><Loader2 className="animate-spin" size={32} /></div>
            ) : (
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('access_rights.level', '層級')}</th>
                                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('access_rights.role', '角色')}</th>
                                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('access_rights.permissions', '權限')}</th>
                                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('access_rights.description', '說明')}</th>
                                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('common.actions', '操作')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roles.map((role) => (
                                    <tr key={role._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <td style={{ padding: '0.75rem 0.5rem' }}>
                                            <span style={{ background: 'var(--badge-bg)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                                                Lv.{role.level}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{role.roleName}</td>
                                        <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {(role.permissions || []).join(', ') || '—'}
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{role.description || '—'}</td>
                                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                                            <button onClick={() => openEdit(role)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.3rem', marginRight: '0.3rem' }}>
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(role._id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.3rem' }}>
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="glass-panel" style={{ padding: '2rem', width: '500px', maxWidth: '90vw' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3>{editingRole ? t('access_rights.edit_role', '編輯角色') : t('access_rights.add_role', '新增角色')}</h3>
                            <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('access_rights.level', '層級')}</label>
                                <input name="role-level" type="number" min="1" max="9" required
                                    style={{ width: '100%', padding: '0.6rem', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', outline: 'none' }}
                                    value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('access_rights.role', '角色名稱')}</label>
                                <input name="role-name" type="text" required
                                    style={{ width: '100%', padding: '0.6rem', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', outline: 'none' }}
                                    value={formData.roleName} onChange={(e) => setFormData({ ...formData, roleName: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('access_rights.permissions', '權限 (逗號分隔)')}</label>
                                <input name="role-permissions" type="text"
                                    style={{ width: '100%', padding: '0.6rem', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', outline: 'none' }}
                                    value={formData.permissions} onChange={(e) => setFormData({ ...formData, permissions: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('access_rights.description', '說明')}</label>
                                <textarea name="role-description"
                                    style={{ width: '100%', padding: '0.6rem', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', outline: 'none', resize: 'vertical', minHeight: '60px' }}
                                    value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <button type="submit" className="btn-primary" disabled={submitting}
                                style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: submitting ? 0.7 : 1 }}>
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : (editingRole ? t('common.update', '更新') : t('common.confirm_add', '新增'))}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default AccessRightsPage;
