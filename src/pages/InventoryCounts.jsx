import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GuidedTour from '../components/GuidedTour';
import { pageTours } from '../utils/pageTours';
import { motion } from 'framer-motion';
import { ClipboardList, Plus, Search, AlertCircle, Loader2 } from 'lucide-react';
import { getProducts } from '../api/products';
import { createAdjustment } from '../api/inventoryAdjustments';

const InventoryCounts = () => {
    const { t } = useTranslation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // 監聽是否為手機螢幕的狀態 (小於 768px)
    const [isMobile, setIsMobile] = useState(false);

    const [adjustment, setAdjustment] = useState({
        productId: '',
        variantId: '',
        changeQty: 0,
        reason: 'correction',
        note: ''
    });

    useEffect(() => {
        fetchProducts();

        // 監聽螢幕寬度變化
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        handleResize(); // 初始化檢查
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const result = await getProducts();
            if (result.success) setProducts(result.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdjust = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = { ...adjustment };
            if (!payload.variantId) delete payload.variantId;

            const result = await createAdjustment(payload);
            if (result.success) {
                setModalOpen(false);
                setAdjustment({ productId: '', variantId: '', changeQty: 0, reason: 'correction', note: '' });
                fetchProducts();
            }
        } catch (error) {
            alert(t('inventory.alerts.adjust_fail'));
        } finally {
            setSubmitting(false);
        }
    };

    const selectedProduct = products.find(p => p._id === adjustment.productId);
    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // 動態響應式樣式
    const headerStyle = {
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: isMobile ? '1rem' : '0.5rem',
        marginBottom: '1.5rem'
    };

    const modalStyle = {
        width: '90%',
        maxWidth: '450px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: isMobile ? '1.5rem' : '2rem'
    };

    return (<>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: isMobile ? '0.5rem' : '0' }}>
            {/* 頂部標題與按鈕自適應 */}
            <div style={headerStyle}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{t('inventory.title')}</h2>
                <button 
                    data-tour-id="inv-add"
                    onClick={() => setModalOpen(true)} 
                    className="btn-primary" 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem 1rem' }}
                >
                    <Plus size={18} /> {t('inventory.add_adjustment')}
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        id="product-search"
                        name="product-search"
                        type="text"
                        data-tour-id="inv-search"
                        placeholder={t('inventory.search_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={searchStyle}
                    />
                </div>
            </div>

            {/* 表格自適應優化 */}
            <div className="glass-panel" style={{ overflowX: 'auto', border: isMobile ? 'none' : '1px solid rgba(255,255,255,0.05)', background: isMobile ? 'transparent' : '' }}>
                {isMobile ? (
                    // 手機端：卡片式佈局 (Card Layout)
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {filteredProducts.map(p => (
                            <div key={p._id} className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <span style={{ fontWeight: '600', fontSize: '1rem', color: '#fff' }}>{p.name}</span>
                                    <code>{p.sku}</code>
                                </div>
                                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0.5rem 0' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>{t('inventory.table.current_stock')}:</span>
                                    <span style={{ fontWeight: '600' }}>{p.stock} {p.soldBy === 'weight' ? 'kg' : 'pcs'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // 電腦端：傳統表格
                    <table data-tour-id="inv-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <th style={thStyle}>{t('inventory.table.product_name')}</th>
                                <th style={thStyle}>{t('inventory.table.sku')}</th>
                                <th style={thStyle}>{t('inventory.table.current_stock')}</th>
                                <th style={thStyle}>{t('inventory.table.unit')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(p => (
                                <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={tdStyle}>{p.name}</td>
                                    <td style={tdStyle}><code>{p.sku}</code></td>
                                    <td style={tdStyle}>{p.stock}</td>
                                    <td style={tdStyle}>{p.soldBy === 'weight' ? 'kg' : 'pcs'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* 彈窗自適應優化 */}
            {isModalOpen && (
                <div style={modalOverlayStyle}>
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        className="glass-panel" 
                        style={modalStyle}
                    >
                        <h3>{t('inventory.modal.title')}</h3>
                        {/* 這裡已修正大括號缺失問題 */}
                        <form onSubmit={handleAdjust} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="input-group">
                                <label htmlFor="adj-product">{t('inventory.modal.product')}</label>
                                <select 
                                    id="adj-product"
                                    name="productId"
                                    required 
                                    style={selectStyle} 
                                    value={adjustment.productId} 
                                    onChange={e => setAdjustment({ ...adjustment, productId: e.target.value, variantId: '' })}
                                >
                                    <option value="">{t('inventory.modal.select_product')}</option>
                                    {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                </select>
                            </div>

                            {selectedProduct?.hasVariants && (
                                <div className="input-group">
                                    <label>{t('inventory.modal.variant')}</label>
                                    <select 
                                        required 
                                        style={selectStyle} 
                                        value={adjustment.variantId} 
                                        onChange={e => setAdjustment({ ...adjustment, variantId: e.target.value })}
                                    >
                                        <option value="">{t('inventory.modal.select_variant')}</option>
                                        {selectedProduct.variants.map(v => (
                                            <option key={v._id} value={v._id}>
                                                {v.name} {t('inventory.modal.stock_display', { stock: v.stock })}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="input-group">
                                <label htmlFor="adj-qty">{t('inventory.modal.qty_label')}</label>
                                <input 
                                    id="adj-qty"
                                    name="changeQty"
                                    type="number" 
                                    step="1" 
                                    required 
                                    placeholder={t('inventory.modal.qty_placeholder', 'e.g. 10 or -5')}
                                    value={isNaN(adjustment.changeQty) ? '' : adjustment.changeQty} 
                                    onChange={e => {
                                        const val = e.target.value === '' ? 0 : Math.round(parseFloat(e.target.value));
                                        setAdjustment({ ...adjustment, changeQty: val });
                                    }} 
                                />
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                                    {t('inventory.modal.qty_hint', 'Qty Hint')}
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="adj-reason">原因</label>
                                <select 
                                    id="adj-reason"
                                    name="reason"
                                    style={selectStyle} 
                                    value={adjustment.reason} 
                                    onChange={e => setAdjustment({ ...adjustment, reason: e.target.value })}
                                >
                                    <option value="correction">{t('inventory.reasons.correction')}</option>
                                    <option value="damage">{t('inventory.reasons.damage')}</option>
                                    <option value="received">{t('inventory.reasons.received')}</option>
                                    <option value="inventory_count">{t('inventory.reasons.inventory_count')}</option>
                                    <option value="other">{t('inventory.reasons.other')}</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label htmlFor="adj-note">{t('inventory.modal.note')}</label>
                                <textarea 
                                    id="adj-note"
                                    name="note"
                                    style={{ ...selectStyle, height: '80px', resize: 'none' }} 
                                    value={adjustment.note} 
                                    onChange={e => setAdjustment({ ...adjustment, note: e.target.value })} 
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>{t('common.cancel')}</button>
                                <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1 }}>{submitting ? <Loader2 size={18} className="animate-spin" /> : t('inventory.modal.submit')}</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
        <GuidedTour tourId="inventoryCounts" steps={pageTours.inventoryCounts(t)} />
    </>
    );
};

const thStyle = { padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' };
const tdStyle = { padding: '1.2rem', fontSize: '0.95rem' };
const selectStyle = { padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none', width: '100%' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' };
const searchStyle = { padding: '0.8rem 1rem 0.8rem 40px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white', width: '100%', outline: 'none' };
export default InventoryCounts;