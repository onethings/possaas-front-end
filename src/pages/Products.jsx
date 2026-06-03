import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Filter,
    Loader2,
    Download,
    Upload,
    X
} from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProducts, exportProductsCSV, importProductsCSV, uploadImage } from '../api/products';
import { getCategories, createCategory } from '../api/categories';
import { getModifiers, createModifier } from '../api/modifiers';
import { useTenant } from '../contexts/TenantContext';

const Products = () => {
    const { t } = useTranslation();
    const { tenantConfig } = useTenant();
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [modifiers, setModifiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isIdModalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: '', color: '#6366f1' });
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const [csvFile, setCsvFile] = useState(null);

    const [newProduct, setNewProduct] = useState({
        name: '',
        sku: '',
        price: '',
        repairPrice: '',
        image: '',
        stock: '',
        categoryId: '',
        description: '',
        barcode: '',
        soldBy: 'each',
        hasVariants: false,
        variants: [],
        modifiers: [],
        isComposite: false,
        components: []
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [prodRes, catRes, modRes] = await Promise.all([
                getProducts(),
                getCategories(),
                getModifiers()
            ]);
            if (prodRes.success) setProducts(prodRes.data);
            if (catRes.success) setCategories(catRes.data);
            if (modRes.success) setModifiers(modRes.data);
        } catch (err) {
            setError(t('common.error_load_data'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const productData = {
                ...newProduct,
                categoryId: newProduct.categoryId || null,
                price: parseFloat(newProduct.price) || 0,
                repairPrice: parseFloat(newProduct.repairPrice) || 0,
                stock: parseInt(newProduct.stock) || 0,
                variants: newProduct.variants.map(v => ({
                    ...v,
                    price: parseFloat(v.price) || 0,
                    repairPrice: parseFloat(v.repairPrice) || 0,
                    stock: parseInt(v.stock) || 0
                }))
            };

            let result;
            if (editingProduct) {
                result = await updateProduct(editingProduct._id, productData);
            } else {
                result = await createProduct(productData);
            }

            if (result.success) {
                setModalOpen(false);
                resetForm();
                setEditingProduct(null);
                fetchInitialData();
            }
        } catch (error) {
            alert(error.response?.data?.message || (editingProduct ? t('products.update_failed') : t('products.add_failed')));
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setNewProduct({
            name: '',
            sku: '',
            price: '',
            repairPrice: '',
            image: '',
            stock: '',
            categoryId: '',
            description: '',
            barcode: '',
            soldBy: 'each',
            hasVariants: false,
            variants: [],
            modifiers: [],
            isComposite: false,
            components: []
        });
        setEditingProduct(null);
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setNewProduct({
            name: product.name || '',
            sku: product.sku || '',
            price: product.price || '',
            repairPrice: product.repairPrice || '',
            image: product.image || '',
            stock: product.stock || '',
            categoryId: (typeof product.categoryId === 'object' && product.categoryId !== null) 
                        ? product.categoryId._id 
                        : (product.categoryId || ''),
            description: product.description || '',
            barcode: product.barcode || '',
            soldBy: product.soldBy || 'each',
            hasVariants: product.hasVariants || false,
            variants: product.variants || [],
            modifiers: product.modifiers || [],
            isComposite: product.isComposite || false,
            components: product.components || []
        });
        setModalOpen(true);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSubmitting(true);
        try {
            const result = await uploadImage(file);
            if (result.success && result.url) {
                setNewProduct({ ...newProduct, image: result.url });
            }
        } catch (error) {
            alert(t('products.image_upload_failed'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try {
            const result = await createCategory(newCategory);
            if (result.success) {
                setCategories([...categories, result.data]);
                setNewProduct({ ...newProduct, categoryId: result.data._id });
                setCategoryModalOpen(false);
                setNewCategory({ name: '', color: '#6366f1' });
            }
        } catch (error) {
            alert(t('products.add_category_failed'));
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedProducts.length === 0) return;
        if (!window.confirm(t('products.delete_selected_confirm', { count: selectedProducts.length }))) return;

        try {
            const result = await deleteProducts(selectedProducts);
            if (result.success) {
                setSelectedProducts([]);
                fetchInitialData();
                alert(result.message);
            }
        } catch (error) {
            alert(t('products.delete_failed'));
        }
    };

    const handleExportCSV = async () => {
        try {
            const blob = await exportProductsCSV();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            alert(t('products.export_failed'));
        }
    };

    const handleImportCSV = async () => {
        if (!csvFile) {
            alert(t('products.select_csv_msg'));
            return;
        }

        setSubmitting(true);
        try {
            const result = await importProductsCSV(csvFile);
            if (result.success) {
                setImportModalOpen(false);
                setCsvFile(null);
                fetchInitialData();
                alert(result.message);
            }
        } catch (error) {
            alert(t('products.import_failed') + ': ' + (error.response?.data?.message || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedProducts.length === filteredProducts.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(filteredProducts.map(p => p._id));
        }
    };

    const toggleSelectProduct = (productId) => {
        if (selectedProducts.includes(productId)) {
            setSelectedProducts(selectedProducts.filter(id => id !== productId));
        } else {
            setSelectedProducts([...selectedProducts, productId]);
        }
    };

    const addVariant = () => {
        setNewProduct({
            ...newProduct,
            variants: [...newProduct.variants, { name: '', sku: '', price: '', repairPrice: '', stock: '' }]
        });
    };

    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="animate-fade-in"
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
            {/* Header 區塊自適應 */}
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{t('products.title')}</h2>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', width: '100%', smWidth: 'auto', justifyContent: 'flex-start' }} className="responsive-action-bar">
                    <button onClick={() => setImportModalOpen(true)} className="btn-secondary" style={headerBtnStyle}>
                        <Upload size={18} /> <span className="btn-text">{t('products.import_csv')}</span>
                    </button>
                    <button onClick={handleExportCSV} className="btn-secondary" style={headerBtnStyle}>
                        <Download size={18} /> <span className="btn-text">{t('products.export_csv')}</span>
                    </button>
                    {selectedProducts.length > 0 && (
                        <button onClick={handleDeleteSelected} className="btn-secondary" style={{ ...headerBtnStyle, borderColor: '#f87171', color: '#f87171' }}>
                            <Trash2 size={18} /> <span>{t('common.delete')} ({selectedProducts.length})</span>
                        </button>
                    )}
                    <button onClick={() => setModalOpen(true)} className="btn-primary" style={{ ...headerBtnStyle, marginLeft: 'auto' }}>
                        <Plus size={18} /> <span>{t('products.add_product')}</span>
                    </button>
                </div>
            </div>

            {/* Filters 區塊自適應 */}
            <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'row', gap: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        id="product-search"
                        name="product-search"
                        type="text"
                        autoComplete="off"
                        placeholder={t('products.search_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={searchStyle}
                    />
                </div>
                <button className="glass-card" style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', height: '100%', whiteSpace: 'nowrap' }}>
                    <Filter size={18} /> <span className="btn-text">{t('common.filter')}</span>
                </button>
            </div>

            {/* Table 區塊加上 X 軸滾動防破版 */}
            <div className="glass-panel" style={{ overflow: 'hidden', minHeight: '200px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ overflowX: 'auto', width: '100%' }}>
                    {loading ? (
                        <div style={{ padding: '4rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                            <Loader2 className="animate-spin" size={24} /> {t('common.loading')}
                        </div>
                    ) : error ? (
                        <div style={{ padding: '4rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
                            {error}
                        </div>
                    ) : products.length === 0 ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '4rem', color: 'var(--text-muted)' }}>
                            <p>{t('products.no_products_msg')}</p>
                            <button onClick={() => setModalOpen(true)} className="btn-secondary">{t('products.add_now')}</button>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                    <th style={{ ...thStyle, width: '50px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                                            onChange={toggleSelectAll}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </th>
                                    <th style={thStyle}>{t('products.sku_barcode')}</th>
                                    <th style={thStyle}>{t('products.product_name')}</th>
                                    <th style={thStyle}>{t('products.price')}</th>
                                    <th style={thStyle}>{t('products.stock')}</th>
                                    <th style={thStyle}>{t('products.category')}</th>
                                    <th style={thStyle}>{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                            {t('products.no_match_msg')}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((p) => (
                                        <tr key={p._id || p.sku} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={tdStyle}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProducts.includes(p._id)}
                                                    onChange={() => toggleSelectProduct(p._id)}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </td>
                                            <td style={tdStyle}><code style={{ color: 'var(--primary-light)' }}>{p.sku || 'N/A'}</code></td>
                                            <td style={tdStyle}>{p.name}</td>
                                            <td style={tdStyle}>{tenantConfig.currency}{p.price?.toLocaleString()}</td>
                                            <td style={tdStyle}>
                                                <span style={{
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.8rem',
                                                    background: (p.stock || 0) < 10 ? 'rgba(248, 113, 113, 0.1)' : 'rgba(74, 222, 128, 0.1)',
                                                    color: (p.stock || 0) < 10 ? '#f87171' : '#4ade80',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {p.stock || 0} {t('products.units')}
                                                </span>
                                            </td>
                                            <td style={tdStyle}>{(typeof p.categoryId === 'object' ? p.categoryId?.name : categories.find(c => c._id === p.categoryId)?.name) || t('products.uncategorized')}</td>
                                            <td style={tdStyle}>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => handleEditProduct(p)} style={actionBtnStyle} title={t('products.edit_product')}><Edit2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* 新增/編輯產品 Modal (自適應優化) */}
            {isIdModalOpen && createPortal(
                <div style={modalOverlayStyle}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel" style={modalContentStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                            <h3>{editingProduct ? t('products.edit_product') : t('products.add_product')}</h3>
                            <button onClick={resetForm} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>{t('common.reset')}</button>
                        </div>
                        <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '75vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            <div className="input-group">
                                <label htmlFor="prod-name">{t('products.product_name')}</label>
                                <input id="prod-name" name="name" type="text" autoComplete="off" required value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} placeholder={t('products.name_placeholder')} />
                            </div>

                            <div className="input-group">
                                <label>{t('products.product_image')}</label>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    {newProduct.image && (
                                        <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }}>
                                            <img src={newProduct.image} alt={t('common.preview')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ flex: 1, minWidth: '180px', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
                                </div>
                            </div>

                            <div className="input-group flex-responsive-row" style={{ gap: '1rem' }}>
                                <div style={{ flex: 1, minWidth: '140px' }}>
                                    <label htmlFor="prod-category">{t('products.category')}</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <select
                                            id="prod-category"
                                            name="categoryId"
                                            value={newProduct.categoryId}
                                            onChange={e => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                                            style={{ ...selectStyle, flex: 1 }}
                                        >
                                            <option value="">{t('products.select_category')}</option>
                                            {categories.map(cat => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setCategoryModalOpen(true)}
                                            className="btn-secondary"
                                            style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '40px' }}
                                            title={t('products.add_category')}
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div style={{ flex: 1, minWidth: '140px' }}>
                                    <label htmlFor="prod-unit">{t('products.sold_by')}</label>
                                    <select
                                        id="prod-unit"
                                        name="soldBy"
                                        value={newProduct.soldBy}
                                        onChange={e => setNewProduct({ ...newProduct, soldBy: e.target.value })}
                                        style={selectStyle}
                                    >
                                        <option value="each">{t('products.sold_each')}</option>
                                        <option value="weight">{t('products.sold_weight')}</option>
                                    </select>
                                </div>
                            </div>

                            {!newProduct.hasVariants && (
                                <div className="input-group grid-responsive-3" style={{ gap: '1rem' }}>
                                    <div>
                                        <label htmlFor="prod-sku">{t('products.sku_barcode')}</label>
                                        <input id="prod-sku" name="sku" type="text" required value={newProduct.sku} onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })} placeholder="SKU001" />
                                    </div>
                                    <div>
                                        <label htmlFor="prod-price">{t('products.price')}</label>
                                        <input id="prod-price" name="price" type="number" required value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="0.00" />
                                    </div>
                                    <div>
                                        <label htmlFor="prod-repair-price">{t('products.repair_price')}</label>
                                        <input id="prod-repair-price" name="repairPrice" type="number" value={newProduct.repairPrice} onChange={e => setNewProduct({ ...newProduct, repairPrice: e.target.value })} placeholder="0.00" />
                                    </div>
                                </div>
                            )}

                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={newProduct.hasVariants}
                                        onChange={e => setNewProduct({ ...newProduct, hasVariants: e.target.checked })}
                                    />
                                    <span>{t('products.has_variants_msg')}</span>
                                </label>
                            </div>

                            {newProduct.hasVariants && (
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', overflowX: 'auto' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                                        <h4 style={{ fontSize: '0.9rem', margin: 0 }}>{t('products.variants')}</h4>
                                        <button type="button" onClick={addVariant} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>+ {t('products.add_variant')}</button>
                                    </div>
                                    <div style={{ minWidth: '450px' }}>
                                        {newProduct.variants.map((v, idx) => (
                                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 40px', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                <input placeholder={t('products.variant_name')} value={v.name} onChange={e => {
                                                    const vts = [...newProduct.variants];
                                                    vts[idx].name = e.target.value;
                                                    setNewProduct({ ...newProduct, variants: vts });
                                                }} />
                                                <input placeholder="SKU" value={v.sku} onChange={e => {
                                                    const vts = [...newProduct.variants];
                                                    vts[idx].sku = e.target.value;
                                                    setNewProduct({ ...newProduct, variants: vts });
                                                }} />
                                                <input placeholder={t('products.price')} type="number" value={v.price} onChange={e => {
                                                    const vts = [...newProduct.variants];
                                                    vts[idx].price = e.target.value;
                                                    setNewProduct({ ...newProduct, variants: vts });
                                                }} />
                                                <input placeholder={t('products.repair_price')} type="number" value={v.repairPrice || ''} onChange={e => {
                                                    const vts = [...newProduct.variants];
                                                    vts[idx].repairPrice = e.target.value;
                                                    setNewProduct({ ...newProduct, variants: vts });
                                                }} />
                                                <button type="button" onClick={() => {
                                                    const vts = newProduct.variants.filter((_, i) => i !== idx);
                                                    setNewProduct({ ...newProduct, variants: vts });
                                                }} style={{ background: 'none', border: 'none', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={16} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" disabled={submitting} onClick={() => { setModalOpen(false); resetForm(); }} className="btn-secondary" style={{ flex: 1 }}>{t('common.cancel')}</button>
                                <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    {submitting ? <Loader2 size={18} className="animate-spin" /> : (editingProduct ? t('common.confirm_update') : t('common.confirm_add'))}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>,
                document.body
            )}

            {/* 分類 Modal */}
            {isCategoryModalOpen && createPortal(
                <div style={modalOverlayStyle}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel" style={smallModalStyle}>
                        <h3 style={{ marginBottom: '1.5rem' }}>{t('products.add_category')}</h3>
                        <form onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="input-group">
                                <label>{t('products.category_name')}</label>
                                <input
                                    type="text"
                                    required
                                    value={newCategory.name}
                                    onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                                    placeholder={t('products.category_placeholder')}
                                />
                            </div>
                            <div className="input-group">
                                <label>{t('products.color_tag')}</label>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input
                                        type="color"
                                        value={newCategory.color}
                                        onChange={e => setNewCategory({ ...newCategory, color: e.target.value })}
                                        style={{ width: '60px', height: '40px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', cursor: 'pointer' }}
                                    />
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{newCategory.color}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => { setCategoryModalOpen(false); setNewCategory({ name: '', color: '#6366f1' }); }} className="btn-secondary" style={{ flex: 1 }}>{t('common.cancel')}</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{t('common.confirm_add')}</button>
                            </div>
                        </form>
                    </motion.div>
                </div>,
                document.body
            )}

            {/* CSV 匯入 Modal (已整合多國語系陣列處理) */}
            {isImportModalOpen && createPortal(
                <div style={modalOverlayStyle}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel" style={smallModalStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3>{t('products.import.title')}</h3>
                            <button onClick={() => { setImportModalOpen(false); setCsvFile(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="input-group">
                                <label>{t('products.import.select_file')}</label>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => setCsvFile(e.target.files[0])}
                                    style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white', width: '100%' }}
                                />
                            </div>
                            {csvFile && (
                                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                                        {t('products.import.file_name')} <span style={{ color: 'white' }}>{csvFile.name}</span>
                                    </p>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem', margin: '0.5rem 0 0 0' }}>
                                        {t('products.import.file_size')} <span style={{ color: 'white' }}>{(csvFile.size / 1024).toFixed(2)} KB</span>
                                    </p>
                                </div>
                            )}
                            <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                                <p style={{ fontSize: '0.85rem', color: '#a5b4fc', marginBottom: '0.5rem', fontWeight: 600 }}>{t('products.import.supported_formats', '支援格式')}</p>
                                <div style={{ fontSize: '0.8rem', color: '#a5b4fc', lineHeight: '1.6' }}>
                                    <p style={{ margin: '0 0 0.3rem 0' }}><strong>標準格式：</strong>SKU, Name, Category, Price, Cost, Stock</p>
                                    <p style={{ margin: '0' }}><strong>Loyverse：</strong>SKU, Name, Category, Description, Cost, Barcode, Price [GR], In stock [GR], Low stock [GR], Track stock, Available for sale [GR]</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => { setImportModalOpen(false); setCsvFile(null); }} className="btn-secondary" style={{ flex: 1 }}>
                                    {t('common.cancel')}
                                </button>
                                <button onClick={handleImportCSV} disabled={submitting || !csvFile} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    {submitting ? <Loader2 size={18} className="animate-spin" /> : t('products.import.submit')}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>,
                document.body
            )}
        </motion.div>
    );
};

/* 基礎全域樣式設定 */
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' };
const thStyle = { padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' };
const tdStyle = { padding: '1.2rem', fontSize: '0.95rem' };
const searchStyle = { padding: '0.6rem 1rem 0.6rem 40px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white', width: '100%', outline: 'none' };
const actionBtnStyle = { background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer', color: 'var(--text-muted)' };
const selectStyle = { padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none', width: '100%' };

/* 回應式彈性按鈕與視窗擴充樣式 */
const headerBtnStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flex: '1 1 auto', minWidth: 'max-content', padding: '0.6rem 1rem' };
const modalContentStyle = { width: '100%', maxWidth: '600px', padding: '1.5rem', boxSizing: 'border-box' };
const smallModalStyle = { width: '100%', maxWidth: '450px', padding: '1.5rem', boxSizing: 'border-box' };
export default Products;