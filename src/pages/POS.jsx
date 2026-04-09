import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    ShoppingCart,
    User,
    Tag,
    Plus,
    Minus,
    Trash2,
    CreditCard,
    Ticket,
    History,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ShoppingBag,
    LayoutGrid,
    List,
    RefreshCw
} from 'lucide-react';
import { getProducts } from '../api/products';
import { getCustomers } from '../api/customers';
import { getDiscounts } from '../api/discounts';
import { createOrder } from '../api/orders';
import { getMyTenant } from '../api/tenants';
import { getCategories } from '../api/categories';
import { useTenant } from '../contexts/TenantContext';

const POS = () => {
    const { tenantConfig } = useTenant();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [customers, setCustomers] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [custSearchTerm, setCustSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [viewMode, setViewMode] = useState(() => localStorage.getItem('posViewMode') || 'grid');
    const CACHE_KEY_PRODUCTS = 'pos_cache_products';
    const CACHE_KEY_CATEGORIES = 'pos_cache_categories';
    const CACHE_TIME = 24 * 60 * 60 * 1000; // 24小時（毫秒）



    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        localStorage.setItem('posViewMode', viewMode);
    }, [viewMode]);

    const fetchData = async () => {
        setLoading(true);
        const now = Date.now();
        console.log("🔍 [第31版] 韌性同步啟動：確保產品優先顯示");

        // 1. 先宣告一個變數存 ID
        let finalId = localStorage.getItem('storeId');

        try {
            // --- 嘗試抓租戶 ID，失敗也不要影響後面 ---
            try {
                const tenantRes = await getMyTenant();
                if (tenantRes.success && tenantRes.data?._id) {
                    finalId = tenantRes.data._id;
                    console.log("🏢 [Debug] 從 Tenant 獲取 ID:", finalId);
                }
            } catch (tenantErr) {
                console.warn("⚠️ [Debug] Tenant API 炸了 (500)，跳過...");
            }

            // --- 2. 抓取其他數據 (這部分必須成功) ---
            const [prodRes, catRes, custRes, discRes] = await Promise.all([
                getProducts().catch(e => ({ success: false, data: [] })),
                getCategories().catch(e => ({ success: false, data: [] })),
                getCustomers().catch(e => ({ success: false, data: [] })),
                getDiscounts().catch(e => ({ success: false, data: [] }))
            ]);

            // 處理產品顯示
            if (prodRes.success && prodRes.data.length > 0) {
                console.log("📦 [Debug] 產品載入成功，數量:", prodRes.data.length);
                setProducts(prodRes.data);

                // 補救措施：如果 Tenant 失敗，嘗試從產品的 tenantId 補位
                if (!finalId || finalId === 'undefined') {
                    finalId = prodRes.data[0].tenantId;
                    console.log("🕵️ [Debug] 補救成功：從產品數據提取 tenantId:", finalId);
                }
            }

            // 存入正確的 ID 到 localStorage
            if (finalId && finalId !== 'undefined') {
                localStorage.setItem('storeId', finalId);
            }

            // 設定其餘資料
            if (catRes.success) setCategories(catRes.data);
            if (custRes.success) setCustomers(custRes.data);
            if (discRes.success) setDiscounts(discRes.data);

        } catch (e) {
            console.error("🔥 [Debug] fetchData 核心流程出錯:", e);
        } finally {
            setLoading(false);
            console.log("🏁 [Debug] 同步流程結束，目前 ID:", localStorage.getItem('storeId'));
        }
    };

    const addToCart = (product, variant = null) => {
        const cartKey = variant ? `${product._id}-${variant._id}` : product._id;
        const existing = cart.find(item => item.cartKey === cartKey);

        if (existing) {
            setCart(cart.map(item =>
                item.cartKey === cartKey ? { ...item, qty: item.qty + 1 } : item
            ));
        } else {
            setCart([...cart, {
                cartKey,
                productId: product._id,
                variantId: variant?._id,
                name: product.name,
                variantName: variant?.name,
                price: variant ? variant.price : product.price,
                qty: 1
            }]);
        }
    };

    const updateQty = (cartKey, delta) => {
        setCart(cart.map(item => {
            if (item.cartKey === cartKey) {
                const newQty = Math.max(0, item.qty + delta);
                return { ...item, qty: newQty };
            }
            return item;
        }).filter(item => item.qty > 0));
    };

    const calculateTotals = () => {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        let discountAmount = 0;
        if (appliedDiscount) {
            discountAmount = appliedDiscount.type === 'PERCENTAGE'
                ? (subtotal * appliedDiscount.value) / 100
                : appliedDiscount.value;
        }

        const discountedSubtotal = Math.max(0, subtotal - discountAmount);
        const taxRate = tenantConfig?.taxRate || 0;
        const taxAmount = (discountedSubtotal * taxRate) / 100;
        const total = discountedSubtotal + taxAmount;

        return { subtotal, discountAmount, taxAmount, total };
    };

    const { subtotal, discountAmount, taxAmount, total } = calculateTotals();


    const handleCheckout = async (status = 'paid') => {
        const finalStoreId = localStorage.getItem('storeId');
        if (!finalStoreId || finalStoreId === 'undefined') {
            alert("無法獲取商店 ID，請刷新頁面重試。");
            return;
        }

        setSubmitting(true);
        try {
            // 生成單號 (符合你資料庫看到的格式)
            const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            const generatedOrderNo = `ORD-${datePart}-${randomPart}`;

            const orderData = {
                storeId: finalStoreId,
                orderNo: generatedOrderNo,
                // 修正點：items 必須包含 nameSnapshot, priceSnapshot, subtotal
                items: cart.map(item => ({
                    productId: item.productId,
                    qty: Number(item.qty),
                    nameSnapshot: item.name, // <--- 補上這個
                    variantNameSnapshot: item.variantName, // <--- 修正：不強制空字串，讓它為 undefined (JSON.stringify 會自動忽略)
                    priceSnapshot: Number(item.price), // <--- 補上這個
                    subtotal: Number((item.price * item.qty).toFixed(2)) // <--- 補上這個
                })),
                totalAmount: Number(subtotal.toFixed(2)),
                discountAmount: Number(discountAmount.toFixed(2)),
                finalAmount: Number(total.toFixed(2))
            };

            console.log("📤 正式提交數據:", orderData);

            const result = await createOrder(orderData);

            if (result.success) {
                setCart([]);
                setSelectedCustomer(null);
                setAppliedDiscount(null);
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
                console.log("✅ 結帳成功！單號：", generatedOrderNo);
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message;
            // 如果還有欄位報錯，我們會在這裡看到它是哪個欄位
            alert(`API 驗證失敗: ${JSON.stringify(msg)}`);
            console.error("❌ 報錯詳情:", error.response?.data);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku?.toLowerCase().includes(searchTerm.toLowerCase());

        // 取得產品的分類 ID (兼容字串或物件格式)
        const prodCatId = typeof p.categoryId === 'object' ? p.categoryId?._id : p.categoryId;

        const matchesCategory = activeCategory === 'all' || prodCatId === activeCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', height: 'calc(100vh - 120px)' }}>
            {/* Product Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>

                {/* 搜尋與控制列 */}
                <div className="glass-panel" style={{ padding: '0.8rem 1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            placeholder="搜尋產品或掃描條碼..."
                            style={searchStyle}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* 按鈕組：確保有獨立空間 */}
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '15px' }}>
                        <button
                            onClick={() => { localStorage.removeItem('cache_products'); localStorage.removeItem('cache_categories'); fetchData(); }}
                            style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
                            title="同步數據"
                        >
                            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        </button>
                        <button onClick={() => setViewMode('grid')} style={{ background: 'none', border: 'none', color: viewMode === 'grid' ? 'var(--primary)' : '#666', cursor: 'pointer' }}>
                            <LayoutGrid size={20} />
                        </button>
                        <button onClick={() => setViewMode('list')} style={{ background: 'none', border: 'none', color: viewMode === 'list' ? 'var(--primary)' : '#666', cursor: 'pointer' }}>
                            <List size={20} />
                        </button>
                    </div>
                </div>

                {/* Category Bar */}
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    overflowX: 'auto',
                    padding: '8px 0',
                    minHeight: '40px', // 確保有固定高度防止塌陷
                    width: '100%'
                }} className="no-scrollbar">
                    <button
                        onClick={() => setActiveCategory('all')}
                        style={{
                            ...categoryPillStyle,
                            background: activeCategory === 'all' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                            color: 'white'
                        }}
                    >
                        <ShoppingBag size={14} /> 全部
                    </button>

                    {/* 加入一個簡單的檢查，若沒資料時顯示提示 */}
                    {categories.length === 0 && <span style={{ color: 'gray', fontSize: '0.8rem' }}>載入中...</span>}

                    {categories.map(cat => (
                        <button
                            key={cat._id}
                            onClick={() => setActiveCategory(cat._id)}
                            style={{
                                ...categoryPillStyle,
                                background: activeCategory === cat._id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                color: activeCategory === cat._id ? 'white' : 'rgba(255,255,255,0.6)'
                            }}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>


                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'grid',
                    // 這裡改為根據 viewMode 動態調整網格
                    gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(180px, 1fr))' : '1fr',
                    gap: '1rem',
                    paddingRight: '0.5rem'
                }}>
                    {loading ? (
                        <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                            <Loader2 className="animate-spin" />
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filteredProducts.map(p => (
                                <motion.div
                                    key={p._id}
                                    layout
                                    className="glass-panel"
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => {
                                        // 重點：如果沒有多規格，點擊卡片直接加入購物車
                                        if (!p.hasVariants) {
                                            addToCart(p);
                                        }
                                    }}
                                    style={{
                                        padding: '1rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: viewMode === 'grid' ? 'column' : 'row',
                                        justifyContent: viewMode === 'grid' ? 'center' : 'space-between',
                                        alignItems: 'center',
                                        gap: '8px',
                                        position: 'relative',
                                        aspectRatio: viewMode === 'grid' ? '1 / 1' : 'auto',
                                        minHeight: viewMode === 'grid' ? 'auto' : '64px',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {/* 內容區：名稱 */}
                                    <div style={{
                                        textAlign: viewMode === 'grid' ? 'center' : 'left',
                                        flex: viewMode === 'grid' ? 'none' : 1,
                                    }}>
                                        <div style={{
                                            fontSize: '0.9rem',
                                            fontWeight: 600,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {p.name}
                                        </div>
                                        {viewMode === 'list' && p.sku && (
                                            <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>SKU: {p.sku}</div>
                                        )}
                                    </div>

                                    {/* 內容區：價格 */}
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: viewMode === 'grid' ? 'center' : 'flex-end'
                                    }}>
                                        <span style={{ color: 'var(--primary-light)', fontWeight: 700, fontSize: '1.1rem' }}>
                                            {tenantConfig.currency}{p.price || p.variants?.[0]?.price}
                                        </span>
                                        {p.hasVariants && (
                                            <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', marginTop: '4px' }}>
                                                多規格
                                            </span>
                                        )}
                                    </div>

                                    {/* 多規格覆蓋層 (Variant Overlay) */}
                                    {p.hasVariants && (
                                        <div
                                            className="variant-overlay"
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                background: 'rgba(0,0,0,0.85)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '4px',
                                                padding: '0.5rem',
                                                zIndex: 10,
                                                // 讓它在 Hover 時由 CSS 顯示 (或直接顯示，視您的設計而定)
                                            }}
                                        >
                                            {p.variants.map(v => (
                                                <button
                                                    key={v._id}
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // 阻止事件冒泡到外層 onClick
                                                        addToCart(p, v);
                                                    }}
                                                    style={variantButtonStyle}
                                                >
                                                    {v.name} ({tenantConfig.currency}{v.price})
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>



            </div>

            {/* Cart Section */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                        <ShoppingCart size={20} /> 購物車 ({cart.reduce((a, b) => a + b.qty, 0)})
                    </div>
                    <button onClick={() => setCart([])} style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '0.8rem', cursor: 'pointer' }}>清空</button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {cart.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: '1rem' }}>
                            <ShoppingCart size={40} opacity={0.2} />
                            <span>尚未加入任何商品</span>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.cartKey} style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.name}</div>
                                    {item.variantName && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.variantName}</div>}
                                    <div style={{ fontSize: '0.85rem', color: 'var(--primary-light)' }}>{tenantConfig.currency}{item.price}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '2px 8px' }}>
                                    <button onClick={() => updateQty(item.cartKey, -1)} style={qtyButtonStyle}><Minus size={14} /></button>
                                    <span style={{ minWidth: '20px', textAlign: 'center', fontSize: '0.9rem' }}>{item.qty}</span>
                                    <button onClick={() => updateQty(item.cartKey, 1)} style={qtyButtonStyle}><Plus size={14} /></button>
                                </div>
                                <div style={{ fontWeight: 600, minWidth: '50px', textAlign: 'right' }}>{tenantConfig.currency}{(item.price * item.qty).toLocaleString()}</div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Controls */}
                <div style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ position: 'relative' }}>
                            <User size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                            <input
                                placeholder="搜尋客戶姓名..."
                                style={{ ...miniSelectStyle, paddingLeft: '30px', width: '100%' }}
                                value={custSearchTerm}
                                onChange={(e) => setCustSearchTerm(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <select
                                style={miniSelectStyle}
                                value={selectedCustomer?._id || ''}
                                onChange={(e) => {
                                    const cust = customers.find(c => c._id === e.target.value);
                                    setSelectedCustomer(cust);
                                }}
                            >
                                <option value="">選擇客戶 (結果: {customers.filter(c => c.name.toLowerCase().includes(custSearchTerm.toLowerCase())).length})</option>
                                {customers
                                    .filter(c => c.name.toLowerCase().includes(custSearchTerm.toLowerCase()))
                                    .map(c => <option key={c._id} value={c._id}>{c.name} ({c.points || 0}pt)</option>)
                                }
                            </select>
                            <select
                                style={miniSelectStyle}
                                value={appliedDiscount?._id || ''}
                                onChange={(e) => {
                                    const disc = discounts.find(d => d._id === e.target.value);
                                    setAppliedDiscount(disc);
                                }}
                            >
                                <option value="">選擇折扣</option>
                                {discounts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>小計</span>
                            <span>{tenantConfig.currency}{subtotal.toLocaleString()}</span>
                        </div>
                        {appliedDiscount && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f87171' }}>
                                <span>折扣 ({appliedDiscount.name})</span>
                                <span>-{tenantConfig.currency}{discountAmount.toLocaleString()}</span>
                            </div>
                        )}
                        {taxAmount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                                <span>稅額 ({tenantConfig?.taxRate || 0}%)</span>
                                <span>+{tenantConfig.currency}{taxAmount.toLocaleString()}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, marginTop: '0.4rem' }}>
                            <span>總計</span>
                            <span style={{ color: 'var(--primary-light)' }}>{tenantConfig.currency}{total.toLocaleString()}</span>
                        </div>
                    </div>


                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                        <button
                            disabled={submitting || cart.length === 0}
                            onClick={() => handleCheckout('pending')}
                            className="btn-secondary"
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                        >
                            <History size={18} /> 掛單
                        </button>
                        <button onClick={() => console.log(calculateTotals())}>檢查計算數據</button>
                        <button
                            disabled={submitting || cart.length === 0}
                            onClick={() => handleCheckout('paid')}
                            className="btn-primary"
                            style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', py: '1rem' }}
                        >
                            {submitting ? <Loader2 className="animate-spin" /> : <><CreditCard size={18} /> 立即結帳</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Success Overlay */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        style={successToastStyle}
                    >
                        <CheckCircle2 size={24} color="#4ade80" />
                        <div>
                            <div style={{ fontWeight: 700 }}>結帳成功</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>訂單已成立並更新庫存</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const searchStyle = { padding: '0.6rem 1rem 0.6rem 40px', background: 'rgba(0,0,0,0.2)', border: 'none', borderRadius: 'var(--radius-md)', color: 'white', width: '100%', outline: 'none' };
const variantButtonStyle = { width: '100%', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', color: 'white', padding: '6px', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left' };
const qtyButtonStyle = { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const miniSelectStyle = { flex: 1, padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white', fontSize: '0.75rem', outline: 'none' };
const categoryPillStyle = {
    padding: '6px 14px',
    borderRadius: '20px',
    border: 'none',
    fontSize: '0.85rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap', // 防止文字換行
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: '0.2s',
    flexShrink: 0  // <--- 關鍵：防止按鈕在捲動列中被壓縮
};
const successToastStyle = { position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', padding: '1rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', zIndex: 2000 };

export default POS;
