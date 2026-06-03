import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GuidedTour from '../components/GuidedTour';
import { pageTours } from '../utils/pageTours';
import { motion } from 'framer-motion';
import { Plus, Search, Truck, Phone, Mail, MapPin, Loader2, Edit2, Trash2 } from 'lucide-react';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../api/suppliers';

const Suppliers = () => {
    const { t } = useTranslation(); 
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [newSupplier, setNewSupplier] = useState({ name: '', contactPerson: '', email: '', phone: '', address: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const result = await getSuppliers();
            if (result.success) setSuppliers(result.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let result;
            if (newSupplier._id) {
                result = await updateSupplier(newSupplier._id, newSupplier);
            } else {
                result = await createSupplier(newSupplier);
            }

            if (result.success) {
                setModalOpen(false);
                setNewSupplier({ name: '', contactPerson: '', email: '', phone: '', address: '' });
                fetchSuppliers();
            }
        } catch (error) {
            console.error('Create/Update Supplier Error:', error);
            const msg = error.response?.data?.message || error.message || t('common.error');
            alert(t('suppliers.alerts.action_fail', { msg }));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(t('suppliers.alerts.delete_confirm'))) return;
        try {
            const result = await deleteSupplier(id);
            if (result.success) fetchSuppliers();
        } catch (error) {
            alert(t('suppliers.alerts.delete_fail'));
        }
    };

    const handleEdit = (s) => {
        setNewSupplier(s);
        setModalOpen(true);
    };

    const filtered = suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (<>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-fade-in" style={containerStyle}>
            {/* 頂部標題列：手機端改為上下排列或自動換行 */}
            <div style={headerStyle}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{t('suppliers.title')}</h2>
                <button 
                    data-tour-id="suppliers-add"
                    onClick={() => { setNewSupplier({ name: '', contactPerson: '', email: '', phone: '', address: '' }); setModalOpen(true); }} 
                    className="btn-primary" 
                    style={addBtnStyle}
                >
                    <Plus size={18} /> {t('suppliers.add_btn')}
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '1rem' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        id="supplier-search"
                        name="supplier-search"
                        type="text"
                        data-tour-id="suppliers-search"
                        placeholder={t('suppliers.search_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={searchStyle}
                    />
                </div>
            </div>

            {/* 卡片網格佈局：利用 minmax 自動適應寬度，手機端會自動單列顯示 */}
            <div data-tour-id="suppliers-grid" style={gridStyle}>
                {loading ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}><Loader2 className="animate-spin" /></div>
                ) : filtered.map(s => (
                    <div key={s._id} className="glass-panel" style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                                <div style={{ background: 'var(--primary-light)', padding: '0.5rem', borderRadius: '8px', color: 'var(--primary)', flexShrink: 0 }}><Truck size={20} /></div>
                                <h3 style={{ fontSize: '1.1rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</h3>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                <button onClick={() => handleEdit(s)} style={actionBtnStyle}><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(s._id)} style={actionBtnStyle}><Trash2 size={16} color="#f87171" /></button>
                            </div>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem', wordBreak: 'break-word' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14} style={{ flexShrink: 0 }} /> {s.phone || 'N/A'}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={14} style={{ flexShrink: 0 }} /> {s.email || 'N/A'}</div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}><MapPin size={14} style={{ flexShrink: 0, marginTop: '2px' }} /> {s.address || 'N/A'}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 彈窗：優化了手機端寬度和內邊距 */}
            {isModalOpen && (
                <div style={modalOverlayStyle}>
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        className="glass-panel" 
                        style={modalContentStyle}
                    >
                        <h3 style={{ margin: 0 }}>{newSupplier._id ? t('suppliers.modal.title_edit') : t('suppliers.modal.title_add')}</h3>
                        <form onSubmit={handleCreate} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="input-group">
                                <label htmlFor="sup-name">{t('suppliers.modal.label_name')}</label>
                                <input id="sup-name" name="name" required value={newSupplier.name} onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label htmlFor="sup-contact">{t('suppliers.modal.label_contact')}</label>
                                <input id="sup-contact" name="contactPerson" value={newSupplier.contactPerson} onChange={e => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label htmlFor="sup-phone">{t('suppliers.modal.label_phone')}</label>
                                <input id="sup-phone" name="phone" value={newSupplier.phone} onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label htmlFor="sup-email">{t('suppliers.modal.label_email')}</label>
                                <input id="sup-email" name="email" type="email" value={newSupplier.email} onChange={e => setNewSupplier({ ...newSupplier, email: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label htmlFor="sup-address">{t('suppliers.modal.label_address')}</label>
                                <input id="sup-address" name="address" value={newSupplier.address} onChange={e => setNewSupplier({ ...newSupplier, address: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>{t('common.cancel')}</button>
                                <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1 }}>{submitting ? <Loader2 size={18} className="animate-spin" /> : (newSupplier._id ? t('common.update') : t('common.confirm'))}</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
        <GuidedTour tourId="suppliers" steps={pageTours.suppliers(t)} />
    </>
    );
};

// 響應式與優化後的樣式對象
const containerStyle = { display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' };
const addBtnStyle = { display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' };

const searchStyle = { padding: '0.8rem 1rem 0.8rem 40px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white', width: '100%', outline: 'none', boxSizing: 'border-box' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' };
const cardStyle = { padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 };
const actionBtnStyle = { background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 };

// 彈窗自適應核心：用 width: '90%' 配合 maxWidth，確保大螢幕不放大、小螢幕不破版
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' };
const modalContentStyle = { width: '90%', maxWidth: '420px', padding: '1.5rem', boxSizing: 'border-box', maxHeight: '90vh', overflowY: 'auto' };
export default Suppliers;