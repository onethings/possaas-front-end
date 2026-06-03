import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GuidedTour from '../components/GuidedTour';
import { pageTours } from '../utils/pageTours';
import { motion } from 'framer-motion';
import { Plus, Search, FileText, CheckCircle, Clock, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { getPurchaseOrders, createPurchaseOrder, receivePurchaseOrder } from '../api/purchaseOrders';
import { getSuppliers } from '../api/suppliers';
import { getProducts } from '../api/products';
import { useTenant } from '../contexts/TenantContext';

const PurchaseOrders = () => {
    const { t } = useTranslation();
    const { tenantConfig } = useTenant();
    const [pos, setPos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [newPO, setNewPO] = useState({
        supplierId: '',
        items: [{ productId: '', qty: 1, costPrice: 0 }]
    });
    const [expandedPO, setExpandedPO] = useState(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [poRes, supRes, prodRes] = await Promise.all([
                getPurchaseOrders(),
                getSuppliers(),
                getProducts()
            ]);
            if (poRes.success) setPos(poRes.data);
            if (supRes.success) setSuppliers(supRes.data);
            if (prodRes.success) setProducts(prodRes.data);
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
            const totalAmount = newPO.items.reduce((sum, item) => sum + (item.qty * item.costPrice), 0);
            const poData = {
                ...newPO,
                supplierId: newPO.supplierId || null,
                orderNo: `PO-${Date.now()}`,
                totalAmount,
                items: newPO.items.map(item => ({
                    ...item,
                    productId: item.productId || null
                }))
            };
            const result = await createPurchaseOrder(poData);
            if (result.success) {
                setModalOpen(false);
                fetchInitialData();
            }
        } catch (error) {
            alert(t('purchase_orders.add_failed'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleReceive = async (id) => {
        if (!window.confirm(t('purchase_orders.confirm_receive'))) return;
        try {
            const result = await receivePurchaseOrder(id);
            if (result.success) fetchInitialData();
        } catch (error) {
            alert(t('purchase_orders.receive_failed'));
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'received': return { icon: <CheckCircle size={14} />, color: '#4ade80', label: t('purchase_orders.status_received') };
            case 'ordered': return { icon: <Clock size={14} />, color: '#fbbf24', label: t('purchase_orders.status_ordered') };
            case 'cancelled': return { icon: <XCircle size={14} />, color: '#f87171', label: t('purchase_orders.status_cancelled') };
            default: return { icon: <FileText size={14} />, color: 'var(--text-muted)', label: t('purchase_orders.status_draft') };
        }
    };

    return (<>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* 樣式注入：處理 RWD 的 Table 滾動與響應式排版 */}
            <style>{`
                .po-header {
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center; 
                    margin-bottom: 1.5rem;
                    gap: 1rem;
                }
                .po-table-container {
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }
                .po-table {
                    width: 100%;
                    border-collapse: collapse;
                    min-width: 650px; /* 確保在手機上不會被擠壓，而是提供橫向滾動 */
                }
                .po-modal {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 1rem;
                    padding: 1.5rem;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                .po-item-row {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 40px;
                    gap: 0.5rem;
                    margin-bottom: 0.75rem;
                    align-items: center;
                }
                @media (max-width: 576px) {
                    .po-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .po-header button {
                        width: 100%;
                        justify-content: center;
                    }
                    .po-item-row {
                        grid-template-columns: 1fr 1fr;
                        background: rgba(255,255,255,0.02);
                        padding: 0.75rem;
                        border-radius: var(--radius-md);
                        border: 1px solid rgba(255,255,255,0.05);
                    }
                    .po-item-product {
                        grid-column: span 2;
                    }
                    .po-item-delete {
                        grid-column: span 2;
                        text-align: right;
                        justify-self: end;
                        padding-top: 0.25rem;
                    }
                }
            `}</style>

            <div className="po-header">
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{t('purchase_orders.title')}</h2>
                <button onClick={() => setModalOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} /> {t('purchase_orders.add')}
                </button>
            </div>

            {/* 外層包覆 RWD Container，防止手機端破版 */}
            <div className="glass-panel po-table-container" style={{ overflow: 'hidden' }}>
                <table className="po-table">
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <th style={thStyle}>{t('purchase_orders.order_no')}</th>
                            <th style={thStyle}>{t('purchase_orders.suppliers')}</th>
                            <th style={thStyle}>{t('purchase_orders.amount')}</th>
                            <th style={thStyle}>{t('purchase_orders.status')}</th>
                            <th style={thStyle}>{t('purchase_orders.date')}</th>
                            <th style={thStyle}>{t('purchase_orders.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pos.map(po => {
                            const status = getStatusStyle(po.status);
                            const isExpanded = expandedPO === po._id;
                            return (
                                <React.Fragment key={po._id}>
                                    <tr 
                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                                        onClick={() => setExpandedPO(isExpanded ? null : po._id)}
                                    >
                                        <td style={tdStyle}><code>{po.orderNo}</code></td>
                                        <td style={tdStyle}>{po.supplierId?.name || t('common.unknown')}</td>
                                        <td style={tdStyle}>{tenantConfig.currency}{(po.totalAmount || 0).toLocaleString()}</td>
                                        <td style={tdStyle}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: status.color, fontSize: '0.85rem' }}>
                                                {status.icon} {status.label}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>{new Date(po.createdAt).toLocaleDateString()}</td>
                                        <td style={tdStyle}>
                                            {po.status === 'draft' && (
                                                <button onClick={(e) => { e.stopPropagation(); handleReceive(po._id); }} className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.8rem', borderColor: '#4ade80', color: '#4ade80' }}>
                                                    {t('purchase_orders.receive')}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr>
                                            <td colSpan={6} style={{ padding: '0 1.2rem 1.2rem 1.2rem', background: 'rgba(255,255,255,0.02)' }}>
                                                <div style={{ fontSize: '0.85rem' }}>
                                                    <strong style={{ color: 'var(--text-muted)' }}>{t('purchase_orders.items', 'Items')}:</strong>
                                                    {po.items && po.items.length > 0 ? (
                                                        <table style={{ width: '100%', marginTop: '0.5rem', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                                            <thead>
                                                                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                                    <th style={{ padding: '0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('purchase_orders.product', 'Product')}</th>
                                                                    <th style={{ padding: '0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('purchase_orders.quantity', 'Quantity')}</th>
                                                                    <th style={{ padding: '0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('purchase_orders.cost_price', 'Cost Price')}</th>
                                                                    <th style={{ padding: '0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('purchase_orders.subtotal', 'Subtotal')}</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {po.items.map((item, i) => (
                                                                    <tr key={i}>
                                                                        <td style={{ padding: '0.5rem', fontWeight: 500 }}>{item.productId?.name || item.productName || `#${item.productId}`}</td>
                                                                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>{item.qty}</td>
                                                                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>{tenantConfig.currency}{(item.costPrice || 0).toLocaleString()}</td>
                                                                        <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 600 }}>{tenantConfig.currency}{((item.qty || 0) * (item.costPrice || 0)).toLocaleString()}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    ) : (
                                                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{t('common.no_data', 'No Data')}</p>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div style={modalOverlayStyle}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel po-modal">
                        <h3 style={{ marginTop: 0 }}>{t('purchase_orders.add')}</h3>
                        <form onSubmit={handleCreate} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="input-group">
                                <label htmlFor="po-supplier">{t('purchase_orders.supplier')}</label>
                                <select id="po-supplier" name="supplierId" required style={selectStyle} value={newPO.supplierId} onChange={e => setNewPO({ ...newPO, supplierId: e.target.value })}>
                                    <option value="">{t('purchase_orders.select_supplier')}</option>
                                    {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>{t('purchase_orders.items')}</label>
                                {newPO.items.map((item, idx) => (
                                    <div key={idx} className="po-item-row">
                                        <div className="po-item-product" style={{ display: 'flex', gap: '0.5rem' }}>
                                            <select 
                                                id={`po-prod-${idx}`}
                                                name="productId"
                                                style={selectStyle} 
                                                value={item.productId} 
                                                onChange={e => {
                                                    const items = [...newPO.items];
                                                    items[idx].productId = e.target.value;                                                    // Auto-fill costPrice from selected product
                                                    const prod = products.find(p => p._id === e.target.value);
                                                    if (prod) items[idx].costPrice = prod.cost || 0;                                                    setNewPO({ ...newPO, items });
                                                }}
                                            >
                                                <option value="">{t('purchase_orders.select_product')}</option>
                                                {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => window.open('/products', '_blank')}
                                                title={t('purchase_orders.add_product')}
                                                style={{ background: 'var(--primary)', border: 'none', borderRadius: '4px', width: '42px', height: '42px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                         <input 
                                             id={`po-qty-${idx}`}
                                             name={`qty-${idx}`}
                                             type="number" 
                                             placeholder={t('purchase_orders.quantity')} 
                                             value={item.qty} 
                                             onChange={e => {
                                                 const items = [...newPO.items];
                                                 items[idx].qty = parseFloat(e.target.value);
                                                 setNewPO({ ...newPO, items });
                                             }} 
                                             style={inputStyle} 
                                         />
                                         <input 
                                             id={`po-cost-${idx}`}
                                             name={`costPrice-${idx}`}
                                             type="number" 
                                             placeholder={t('purchase_orders.cost_price')} 
                                             value={item.costPrice} 
                                             onChange={e => {
                                                 const items = [...newPO.items];
                                                 items[idx].costPrice = parseFloat(e.target.value);
                                                 setNewPO({ ...newPO, items });
                                             }} 
                                             style={inputStyle} 
                                         />
                                        <div className="po-item-delete">
                                            <button type="button" onClick={() => setNewPO({ ...newPO, items: newPO.items.filter((_, i) => i !== idx) })} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><XCircle size={18} /></button>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={() => setNewPO({ ...newPO, items: [...newPO.items, { productId: '', qty: 1, costPrice: 0 }] })} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', marginTop: '0.25rem' }}>+ {t('purchase_orders.add_item')}</button>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>{t('common.cancel')}</button>
                                <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1 }}>{submitting ? <Loader2 size={18} className="animate-spin" /> : t('purchase_orders.create_draft')}</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
        <GuidedTour tourId="purchaseOrders" steps={pageTours.purchaseOrders(t)} />
    </>
    );
};

const thStyle = { padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' };
const tdStyle = { padding: '1.2rem', fontSize: '0.95rem' };
const inputStyle = { padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none', width: '100%', boxSizing: 'border-box' };
const selectStyle = { padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none', width: '100%', boxSizing: 'border-box' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
export default PurchaseOrders;