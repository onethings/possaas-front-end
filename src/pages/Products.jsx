import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    ExternalLink,
    Filter,
    Loader2,
    Tag,
    Layers,
    Sliders,
    ChevronDown,
    ChevronUp,
    Download,
    Upload,
    X
} from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProducts, exportProductsCSV, importProductsCSV } from '../api/products';
import { getCategories, createCategory } from '../api/categories';
import { getModifiers, createModifier } from '../api/modifiers';

const Products = () => {
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
            setError('伺服器連線失敗');
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
                stock: parseInt(newProduct.stock) || 0,
                variants: newProduct.variants.map(v => ({
                    ...v,
                    price: parseFloat(v.price) || 0,
                    stock: parseInt(v.stock) || 0
                }))
            };

            let result;
            if (editingProduct) {
                // Update existing product
                result = await updateProduct(editingProduct._id, productData);
            } else {
                // Create new product
                result = await createProduct(productData);
            }

            if (result.success) {
                setModalOpen(false);
                resetForm();
                setEditingProduct(null);
                fetchInitialData();
            }
        } catch (error) {
            alert(error.response?.data?.message || (editingProduct ? '更新失敗' : '新增失敗'));
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setNewProduct({
            name: '',
            sku: '',
            price: '',
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
            stock: product.stock || '',
            categoryId: product.categoryId || '',
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
            alert('新增分類失敗');
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedProducts.length === 0) return;

        if (!window.confirm(`確定要刪除選中的 ${selectedProducts.length} 個產品嗎？`)) return;

        try {
            const result = await deleteProducts(selectedProducts);
            if (result.success) {
                setSelectedProducts([]);
                fetchInitialData();
                alert(result.message);
            }
        } catch (error) {
            alert('刪除失敗');
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
            alert('匯出失敗');
        }
    };

    const handleImportCSV = async () => {
        if (!csvFile) {
            alert('請選擇 CSV 檔案');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const csvData = e.target.result;
                const result = await importProductsCSV(csvData);
                if (result.success) {
                    setImportModalOpen(false);
                    setCsvFile(null);
                    fetchInitialData();
                    alert(result.message);
                }
            } catch (error) {
                alert('匯入失敗: ' + (error.response?.data?.message || error.message));
            }
        };
        reader.readAsText(csvFile);
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
            variants: [...newProduct.variants, { name: '', sku: '', price: '', stock: '' }]
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem' }}>產品目錄</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => setImportModalOpen(true)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Upload size={18} /> 匯入 CSV
                    </button>
                    <button onClick={handleExportCSV} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Download size={18} /> 匯出 CSV
                    </button>
                    {selectedProducts.length > 0 && (
                        <button onClick={handleDeleteSelected} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: '#f87171', color: '#f87171' }}>
                            <Trash2 size={18} /> 刪除 ({selectedProducts.length})
                        </button>
                    )}
                    <button onClick={() => setModalOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={18} /> 新增產品
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="搜尋名稱或 SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={searchStyle}
                    />
                </div>
                <button className="glass-card" style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <Filter size={18} /> 篩選
                </button>
            </div>

            {/* Table */}
            <div className="glass-panel" style={{ overflow: 'hidden', minHeight: '200px', display: 'flex', flexDirection: 'column' }}>
                {loading ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                        <Loader2 className="animate-spin" size={24} /> 讀取中...
                    </div>
                ) : error ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
                        {error}
                    </div>
                ) : products.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '4rem', color: 'var(--text-muted)' }}>
                        <p>請先新增產品</p>
                        <button onClick={() => setModalOpen(true)} className="btn-secondary">立即新增</button>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
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
                                <th style={thStyle}>SKU / 條碼</th>
                                <th style={thStyle}>產品名稱</th>
                                <th style={thStyle}>價格</th>
                                <th style={thStyle}>庫存</th>
                                <th style={thStyle}>分類</th>
                                <th style={thStyle}>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        找不到符合條件的產品
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
                                        <td style={tdStyle}>${p.price?.toLocaleString()}</td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '0.8rem',
                                                background: (p.stock || 0) < 10 ? 'rgba(248, 113, 113, 0.1)' : 'rgba(74, 222, 128, 0.1)',
                                                color: (p.stock || 0) < 10 ? '#f87171' : '#4ade80'
                                            }}>
                                                {p.stock || 0} 件
                                            </span>
                                        </td>
                                        <td style={tdStyle}>{categories.find(c => c._id === p.categoryId)?.name || '未分類'}</td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleEditProduct(p)} style={actionBtnStyle} title="編輯產品"><Edit2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {isIdModalOpen && (
                <div style={modalOverlayStyle}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel" style={modalContentStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                            <h3>{editingProduct ? '編輯產品' : '新增產品'}</h3>
                            <button onClick={resetForm} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>重置</button>
                        </div>
                        <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            <div className="input-group">
                                <label>產品名稱</label>
                                <input type="text" required value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="例如: 經典美式咖啡" />
                            </div>

                            <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label>分類</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <select
                                            value={newProduct.categoryId}
                                            onChange={e => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                                            style={{ ...selectStyle, flex: 1 }}
                                        >
                                            <option value="">請選擇分類</option>
                                            {categories.map(cat => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setCategoryModalOpen(true)}
                                            className="btn-secondary"
                                            style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '40px' }}
                                            title="新增分類"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label>銷售單位</label>
                                    <select
                                        value={newProduct.soldBy}
                                        onChange={e => setNewProduct({ ...newProduct, soldBy: e.target.value })}
                                        style={selectStyle}
                                    >
                                        <option value="each">按件銷售</option>
                                        <option value="weight">按重量銷售</option>
                                    </select>
                                </div>
                            </div>

                            {!newProduct.hasVariants && (
                                <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label>SKU / 條碼</label>
                                        <input type="text" required value={newProduct.sku} onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })} placeholder="SKU001" />
                                    </div>
                                    <div>
                                        <label>銷售價格</label>
                                        <input type="number" required value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="0.00" />
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
                                    <span>此產品有多種規格 (如尺寸、顏色)</span>
                                </label>
                            </div>

                            {newProduct.hasVariants && (
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <h4 style={{ fontSize: '0.9rem' }}>產品規格 (Variants)</h4>
                                        <button type="button" onClick={addVariant} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>+ 新增規格</button>
                                    </div>
                                    {newProduct.variants.map((v, idx) => (
                                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 40px', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <input placeholder="規格名稱" value={v.name} onChange={e => {
                                                const vts = [...newProduct.variants];
                                                vts[idx].name = e.target.value;
                                                setNewProduct({ ...newProduct, variants: vts });
                                            }} />
                                            <input placeholder="SKU" value={v.sku} onChange={e => {
                                                const vts = [...newProduct.variants];
                                                vts[idx].sku = e.target.value;
                                                setNewProduct({ ...newProduct, variants: vts });
                                            }} />
                                            <input placeholder="價格" type="number" value={v.price} onChange={e => {
                                                const vts = [...newProduct.variants];
                                                vts[idx].price = e.target.value;
                                                setNewProduct({ ...newProduct, variants: vts });
                                            }} />
                                            <button type="button" onClick={() => {
                                                const vts = newProduct.variants.filter((_, i) => i !== idx);
                                                setNewProduct({ ...newProduct, variants: vts });
                                            }} style={{ background: 'none', border: 'none', color: '#f87171' }}><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" disabled={submitting} onClick={() => { setModalOpen(false); resetForm(); }} className="btn-secondary" style={{ flex: 1 }}>取消</button>
                                <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    {submitting ? <Loader2 size={18} className="animate-spin" /> : (editingProduct ? '確認更新' : '確認新增')}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Category Modal */}
            {isCategoryModalOpen && (
                <div style={modalOverlayStyle}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel" style={{ width: '400px', padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>新增分類</h3>
                        <form onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="input-group">
                                <label>分類名稱</label>
                                <input
                                    type="text"
                                    required
                                    value={newCategory.name}
                                    onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                                    placeholder="例如: 飲料、甜點"
                                />
                            </div>
                            <div className="input-group">
                                <label>顏色標籤</label>
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
                                <button type="button" onClick={() => { setCategoryModalOpen(false); setNewCategory({ name: '', color: '#6366f1' }); }} className="btn-secondary" style={{ flex: 1 }}>取消</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>確認新增</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* CSV Import Modal */}
            {isImportModalOpen && (
                <div style={modalOverlayStyle}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel" style={{ width: '500px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3>匯入產品 CSV</h3>
                            <button onClick={() => { setImportModalOpen(false); setCsvFile(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="input-group">
                                <label>選擇 CSV 檔案</label>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => setCsvFile(e.target.files[0])}
                                    style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white' }}
                                />
                            </div>
                            {csvFile && (
                                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        檔案名稱: <span style={{ color: 'white' }}>{csvFile.name}</span>
                                    </p>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                        檔案大小: <span style={{ color: 'white' }}>{(csvFile.size / 1024).toFixed(2)} KB</span>
                                    </p>
                                </div>
                            )}
                            <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                                <p style={{ fontSize: '0.85rem', color: '#a5b4fc', marginBottom: '0.5rem' }}>CSV 格式要求：</p>
                                <p style={{ fontSize: '0.8rem', color: '#a5b4fc' }}>SKU,產品名稱,價格,成本,庫存,分類,描述,條碼,銷售單位</p>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => { setImportModalOpen(false); setCsvFile(null); }} className="btn-secondary" style={{ flex: 1 }}>取消</button>
                                <button onClick={handleImportCSV} disabled={!csvFile} className="btn-primary" style={{ flex: 1 }}>確認匯入</button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContentStyle = { width: '600px', padding: '2rem' };
const thStyle = { padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)' };
const tdStyle = { padding: '1.2rem', fontSize: '0.95rem' };
const searchStyle = { padding: '0.6rem 1rem 0.6rem 40px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white', width: '100%', outline: 'none' };
const actionBtnStyle = { background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer', color: 'var(--text-muted)' };
const selectStyle = { padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none', width: '100%' };

export default Products;

