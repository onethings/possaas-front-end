import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GuidedTour from '../components/GuidedTour';
import { pageTours } from '../utils/pageTours';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, Mail, Phone, Edit2, Trash2, Loader2, Square, CheckSquare } from 'lucide-react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api/customers';

const Customers = () => {
    const { t } = useTranslation();
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
            alert(error.response?.data?.message || (editId ? t('update_failed') : t('create_failed')));
        } finally {
            setSubmitting(false);
        }
    };

    const handleBatchDelete = async () => {
        if (!confirm(t('delete_selected_confirm', { count: selectedIds.length }))) return;
        try {
            await Promise.all(selectedIds.map(id => deleteCustomer(id)));
            setSelectedIds([]);
            fetchCustomers();
        } catch (error) {
            alert(error.response?.data?.message || t('delete_failed'));
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

    return (<>
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="animate-fade-in"
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
            {/* 頂部動作欄：在手機端改為垂直排列 */}
            <div className="header-action-container">
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{t('customer_management')}</h2>
                <div style={{ display: 'flex', gap: '0.75rem', width: '100%', justifyContent: 'flex-end' }} className="mobile-buttons">
                    {selectedIds.length > 0 && (
                        <button onClick={handleBatchDelete} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#f87171', borderColor: '#f87171', flex: '1' }}>
                            <Trash2 size={18} /> <span className="hide-on-mobile">{t('delete')}</span> ({selectedIds.length})
                        </button>
                    )}
                    <button onClick={() => { setEditId(null); setNewCustomer({ name: '', phone: '', email: '', address: '' }); setModalOpen(true); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flex: '1' }}>
                        <Plus size={18} /> {t('add_customer')}
                    </button>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        id="customer-search"
                        name="customer-search"
                        type="text"
                        placeholder={t('search_placeholder_name_phone')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={searchStyle}
                    />
                </div>
            </div>

            {/* 表格容器：大螢幕正常表格，小螢幕隱藏非核心欄位，並允許橫向微滾動防止破版 */}
            <div className="glass-panel" style={{ overflowX: 'auto', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
                {loading ? (
                    <div style={centerStyle}><Loader2 className="animate-spin" /> {t('loading')}</div>
                ) : customers.length === 0 ? (
                    <div style={centerStyle}>{t('no_data')}</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '320px' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <th style={{ padding: '1rem 0.5rem', width: '40px', textAlign: 'center' }}>
                                    <button onClick={() => setSelectedIds(selectedIds.length === filteredCustomers.length ? [] : filteredCustomers.map(c => c._id))} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                                        {selectedIds.length === filteredCustomers.length && filteredCustomers.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                                    </button>
                                </th>
                                <th style={thStyle}>{t('name')}</th>
                                <th style={thStyle}>{t('phone')}</th>
                                <th style={thStyle} className="hide-on-mobile">{t('email')}</th>
                                <th style={thStyle} className="hide-on-mobile">{t('address')}</th>
                                <th style={thStyle} className="hide-on-tablet">{t('points')}</th>
                                <th style={{ ...thStyle, textAlign: 'right', paddingRight: '1rem' }}>{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map((c) => (
                                <tr key={c._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: selectedIds.includes(c._id) ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
                                    <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                                        <button onClick={() => toggleSelect(c._id)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                                            {selectedIds.includes(c._id) ? <CheckSquare size={18} color="var(--primary)" /> : <Square size={18} color="var(--text-muted)" />}
                                        </button>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: 500 }}>{c.name}</div>
                                        {/* 手機端把積分直接掛在名字下面展示，省去一欄 */}
                                        <div className="show-on-tablet" style={{ fontSize: '0.8rem', color: 'var(--primary-light)', marginTop: '2px' }}>
                                            {c.points || 0} pt
                                        </div>
                                    </td>
                                    <td style={tdStyle}>{c.phone || 'N/A'}</td>
                                    <td style={tdStyle} className="hide-on-mobile">{c.email || 'N/A'}</td>
                                    <td style={tdStyle} className="hide-on-mobile">{c.address || 'N/A'}</td>
                                    <td style={tdStyle} className="hide-on-tablet">
                                        <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{c.points || 0} pt</span>
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'right', paddingRight: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button onClick={() => handleEdit(c)} style={actionBtnStyle}><Edit2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal - 寬度自適應 */}
            {isModalOpen && (
                <div style={modalOverlayStyle}>
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        className="glass-panel responsive-modal" 
                        style={modalContentStyle}
                    >
                        <h3 style={{ marginBottom: '1.5rem' }}>
                            {editId ? t('edit_customer') : t('add_customer')}
                        </h3>

                        <form onSubmit={handleCreateOrUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="input-group">
                                <label htmlFor="cust-name">{t('name')}</label>
                                <input
                                    id="cust-name"
                                    name="name"
                                    type="text"
                                    required
                                    value={newCustomer.name}
                                    onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                    placeholder={t('placeholder_name_example')}
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="cust-phone">{t('phone')}</label>
                                <input
                                    id="cust-phone"
                                    name="phone"
                                    type="text"
                                    value={newCustomer.phone}
                                    onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                    placeholder={t('placeholder_phone')}
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="cust-email">{t('email')}</label>
                                <input
                                    id="cust-email"
                                    name="email"
                                    type="email"
                                    value={newCustomer.email}
                                    onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                    placeholder={t('placeholder_email')}
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="cust-address">{t('address')}</label>
                                <input
                                    id="cust-address"
                                    name="address"
                                    type="text"
                                    value={newCustomer.address}
                                    onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                    placeholder={t('placeholder_address')}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" disabled={submitting} onClick={() => setModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>
                                    {t('cancel')}
                                </button>
                                <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    {submitting ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        editId ? t('confirm_update') : t('confirm_add')
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
        <GuidedTour tourId="customers" steps={pageTours.customers(t)} />
    </>
    );
};

// 樣式調整
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' };
const modalContentStyle = { width: '100%', maxWidth: '450px', padding: '1.5rem' };
const thStyle = { padding: '1rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textAlign: 'left' };
const tdStyle = { padding: '1rem 0.75rem', fontSize: '0.9rem' };
const searchStyle = { padding: '0.8rem 1rem 0.8rem 40px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white', width: '100%', outline: 'none' };
const centerStyle = { height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '0.5rem' };
const actionBtnStyle = { background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '4px', padding: '8px', cursor: 'pointer', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center' };
export default Customers;