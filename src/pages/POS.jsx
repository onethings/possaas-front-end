import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
    RefreshCw,
    Calendar,
    X
} from 'lucide-react';
import { getProducts } from '../api/products';
import { getCategories } from '../api/categories';
import { getCustomers } from '../api/customers';
import { getDiscounts } from '../api/discounts';
import { createOrder } from '../api/orders';
import { getMyTenant } from '../api/tenants';
import { useTenant } from '../contexts/TenantContext';

const POS = () => {
    const { t } = useTranslation();
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
    const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
    
    // 📱 新增行動裝置偵測與購物車彈窗控制
    const [isMobile, setIsMobile] = useState(false);
    const [showMobileCart, setShowMobileCart] = useState(false);

    // 監聽螢幕寬度以切換手機模式
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        localStorage.setItem('posViewMode', viewMode);
    }, [viewMode]);

    const fetchData = async () => {
        setLoading(true);
        let finalId = localStorage.getItem('storeId');

        try {
            try {
                const tenantRes = await getMyTenant();
                if (tenantRes.success && tenantRes.data?._id) {
                    finalId = tenantRes.data._id;
                }
            } catch (tenantErr) {
                console.warn("⚠️ Tenant API 異常，跳過...");
            }

            const [prodRes, catRes, custRes, discRes] = await Promise.all([
                getProducts().catch(e => ({ success: false, data: [] })),
                getCategories().catch(e => ({ success: false, data: [] })),
                getCustomers().catch(e => ({ success: false, data: [] })),
                getDiscounts().catch(e => ({ success: false, data: [] }))
            ]);

            if (prodRes.success && prodRes.data.length > 0) {
                setProducts(prodRes.data);
                if (!finalId || finalId === 'undefined') {
                    finalId = prodRes.data[0].tenantId;
                }
            }

            if (finalId && finalId !== 'undefined') {
                localStorage.setItem('storeId', finalId);
            }

            if (catRes.success) setCategories(catRes.data);
            if (custRes.success) setCustomers(custRes.data);
            if (discRes.success) setDiscounts(discRes.data);

        } catch (e) {
            console.error("🔥 fetchData 出錯:", e);
        } finally {
            setLoading(false);
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
    const cartTotalQty = cart.reduce((a, b) => a + b.qty, 0);

    const handleCheckout = async (status = 'paid') => {
        const finalStoreId = localStorage.getItem('storeId');
        if (!finalStoreId || finalStoreId === 'undefined') {
            alert(t('pos.error_no_store_id', '無法獲取商店 ID，請刷新頁面重試。'));
            return;
        }

        setSubmitting(true);
        try {
            const datePart = orderDate.replace(/-/g, '');
            const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            const generatedOrderNo = `ORD-${datePart}-${randomPart}`;

            const orderData = {
                storeId: finalStoreId,
                orderNo: generatedOrderNo,
                items: cart.map(item => ({
                    productId: item.productId,
                    qty: Number(item.qty),
                    nameSnapshot: item.name,
                    variantNameSnapshot: item.variantName,
                    priceSnapshot: Number(item.price),
                    subtotal: Number((item.price * item.qty).toFixed(2))
                })),
                totalAmount: Number(subtotal.toFixed(2)),
                discountAmount: Number(discountAmount.toFixed(2)),
                finalAmount: Number(total.toFixed(2)),
                customDate: orderDate
            };

            const result = await createOrder(orderData);

            if (result.success) {
                setCart([]);
                setSelectedCustomer(null);
                setAppliedDiscount(null);
                setShowMobileCart(false); // 結帳成功關閉手機購物車彈窗
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message;
            alert(`${t('pos.checkout_failed', '結帳失敗')}: ${JSON.stringify(msg)}`);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
        const prodCatId = typeof p.categoryId === 'object' ? p.categoryId?._id : p.categoryId;
        const matchesCategory = activeCategory === 'all' || prodCatId === activeCategory;
        return matchesSearch && matchesCategory;
    });

    // 🛒 抽離出購物車內部 UI，方便雙端複用
    const renderCartContent = () => (
        <>
            <div style={{ padding: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                    <ShoppingCart size={20} /> {t('pos.cart', '購物車')} ({cartTotalQty})
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => setCart([])} style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '0.8rem', cursor: 'pointer' }}>{t('common.clear', '清空')}</button>
                    {isMobile && (
                        <button onClick={() => setShowMobileCart(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {cart.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: '1rem', minHeight: '200px' }}>
                        <ShoppingCart size={40} opacity={0.2} />
                        <span>{t('pos.cart_empty', '尚未加入任何商品')}</span>
                    </div>
                ) : (
                    cart.map(item => (
                        <div key={item.cartKey} style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.name}</div>
                                {item.variantName && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.variantName}</div>}
                                <div style={{ fontSize: '0.85rem', color: 'var(--primary-light)' }}>{tenantConfig?.currency}{item.price}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '2px 8px' }}>
                                <button onClick={() => updateQty(item.cartKey, -1)} style={qtyButtonStyle}><Minus size={14} /></button>
                                <span style={{ minWidth: '20px', textAlign: 'center', fontSize: '0.9rem' }}>{item.qty}</span>
                                <button onClick={() => updateQty(item.cartKey, 1)} style={qtyButtonStyle}><Plus size={14} /></button>
                            </div>
                            <div style={{ fontWeight: 600, minWidth: '50px', textAlign: 'right', fontSize: '0.9rem' }}>{tenantConfig?.currency}{(item.price * item.qty).toLocaleString()}</div>
                        </div>
                    ))
                )}
            </div>

            <div style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ position: 'relative' }}>
                        <User size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                        <input
                            id="pos-customer-search"
                            name="custSearchTerm"
                            placeholder={t('pos.search_customer', '搜尋客戶姓名...')}
                            style={{ ...miniSelectStyle, paddingLeft: '30px', width: '100%' }}
                            value={custSearchTerm}
                            onChange={(e) => setCustSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select
                            id="pos-customer-select"
                            name="customerSelection"
                            style={miniSelectStyle}
                            value={selectedCustomer?._id || ''}
                            onChange={(e) => {
                                const cust = customers.find(c => c._id === e.target.value);
                                setSelectedCustomer(cust);
                            }}
                        >
                            <option value="">{t('pos.select_customer', '選擇客戶')} ({customers.filter(c => c.name.toLowerCase().includes(custSearchTerm.toLowerCase())).length})</option>
                            {customers
                                .filter(c => c.name.toLowerCase().includes(custSearchTerm.toLowerCase()))
                                .map(c => <option key={c._id} value={c._id}>{c.name} ({c.points || 0}pt)</option>)
                            }
                        </select>
                        <select
                            id="pos-discount-select"
                            name="discountSelection"
                            style={miniSelectStyle}
                            value={appliedDiscount?._id || ''}
                            onChange={(e) => {
                                const disc = discounts.find(d => d._id === e.target.value);
                                setAppliedDiscount(disc);
                            }}
                        >
                            <option value="">{t('pos.select_discount', '選擇折扣')}</option>
                            {discounts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '8px' }}>
                        <Calendar size={14} style={{ opacity: 0.6 }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{t('pos.checkout_date', '結帳日期')}</span>
                        <input
                            type="date"
                            value={orderDate}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setOrderDate(e.target.value)}
                            style={{ ...miniSelectStyle, border: 'none', background: 'transparent', width: '100%' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{t('pos.subtotal', '小計')}</span>
                        <span>{tenantConfig?.currency}{subtotal.toLocaleString()}</span>
                    </div>
                    {appliedDiscount && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f87171' }}>
                            <span>{t('pos.discount', '折扣')} ({appliedDiscount.name})</span>
                            <span>-{tenantConfig?.currency}{discountAmount.toLocaleString()}</span>
                        </div>
                    )}
                    {taxAmount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                            <span>{t('pos.tax_amount', '稅額')} ({tenantConfig?.taxRate || 0}%)</span>
                            <span>+{tenantConfig?.currency}{taxAmount.toLocaleString()}</span>
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, marginTop: '0.4rem' }}>
                        <span>{t('pos.total', '總計')}</span>
                        <span style={{ color: 'var(--primary-light)' }}>{tenantConfig?.currency}{total.toLocaleString()}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem' }}>
                    <button
                        disabled={submitting || cart.length === 0}
                        onClick={() => handleCheckout('pending')}
                        className="btn-secondary"
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem' }}
                    >
                        <History size={18} /> {t('pos.hold_order', '掛單')}
                    </button>
                    <button
                        disabled={submitting || cart.length === 0}
                        onClick={() => handleCheckout('paid')}
                        className="btn-primary"
                        style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem' }}
                    >
                        {submitting ? <Loader2 className="animate-spin" /> : <><CreditCard size={18} /> {t('pos.checkout_now', '立即結帳')}</>}
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', // 📱 手機端自動變單欄
            gap: isMobile ? '0.8rem' : '1.5rem',
            height: isMobile ? 'calc(100vh - 140px)' : 'calc(100vh - 120px)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Product Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', overflow: 'hidden' }}>

                {/* 搜尋與控制列 */}
                <div className="glass-panel" style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            id="pos-product-search"
                            name="searchTerm"
                            placeholder={t('pos.search_placeholder', '搜尋產品...')}
                            style={searchStyle}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '10px' }}>
                        <button
                            onClick={() => { localStorage.removeItem('cache_products'); localStorage.removeItem('cache_categories'); fetchData(); }}
                            style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
                            title={t('common.sync_data', '同步數據')}
                        >
                            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        </button>
                        {/* 📱 手機端隱藏不必要的切換按鈕以節省空間 */}
                        {!isMobile && (
                            <>
                                <button onClick={() => setViewMode('grid')} style={{ background: 'none', border: 'none', color: viewMode === 'grid' ? 'var(--primary)' : '#666', cursor: 'pointer' }}>
                                    <LayoutGrid size={20} />
                                </button>
                                <button onClick={() => setViewMode('list')} style={{ background: 'none', border: 'none', color: viewMode === 'list' ? 'var(--primary)' : '#666', cursor: 'pointer' }}>
                                    <List size={20} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Category Bar */}
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '4px 0', minHeight: '38px', width: '100%' }} className="no-scrollbar">
                    <button
                        onClick={() => setActiveCategory('all')}
                        style={{
                            ...categoryPillStyle,
                            background: activeCategory === 'all' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                            color: 'white'
                        }}
                    >
                        <ShoppingBag size={14} /> {t('pos.category_all', '全部')}
                    </button>

                    {categories.length === 0 && <span style={{ color: 'gray', fontSize: '0.8rem' }}>{t('common.loading')}</span>}

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

                {/* Products Container */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'grid',
                    // 📱 手機端固定使用 2 欄 Grid，避免原先寫死的寬度縮小到極限時字疊在一起
                    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : (viewMode === 'grid' ? 'repeat(auto-fill, minmax(180px, 1fr))' : '1fr'),
                    gap: isMobile ? '0.6rem' : '1rem',
                    paddingRight: '0.2rem'
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
                                    whileHover={isMobile ? {} : { scale: 1.02 }}
                                    onClick={() => {
                                        if (!p.hasVariants) {
                                            addToCart(p);
                                        }
                                    }}
                                    style={{
                                        padding: isMobile ? '0.8rem' : '1rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: (isMobile || viewMode === 'grid') ? 'column' : 'row',
                                        justifyContent: (isMobile || viewMode === 'grid') ? 'space-between' : 'space-between',
                                        alignItems: 'center',
                                        gap: '8px',
                                        position: 'relative',
                                        aspectRatio: (isMobile || viewMode === 'grid') ? '1 / 1' : 'auto',
                                        minHeight: (isMobile || viewMode === 'grid') ? 'auto' : '64px',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div style={{ textAlign: (isMobile || viewMode === 'grid') ? 'center' : 'left', flex: (isMobile || viewMode === 'grid') ? 'none' : 1, width: '100%' }}>
                                        <div style={{ fontSize: isMobile ? '0.8rem' : '0.9rem', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {p.name}
                                        </div>
                                        {!isMobile && viewMode === 'list' && p.sku && (
                                            <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>SKU: {p.sku}</div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: (isMobile || viewMode === 'grid') ? 'center' : 'flex-end' }}>
                                        <span style={{ color: 'var(--primary-light)', fontWeight: 700, fontSize: isMobile ? '1rem' : '1.1rem' }}>
                                            {tenantConfig?.currency}{p.price || p.variants?.[0]?.price}
                                        </span>
                                        {p.hasVariants && (
                                            <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', marginTop: '4px' }}>
                                                {t('pos.multi_variants', '多規格')}
                                            </span>
                                        )}
                                    </div>

                                    {p.hasVariants && (
                                        <div className="variant-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', gap: '4px', padding: '0.4rem', zIndex: 10, overflowY: 'auto' }}>
                                            {p.variants.map(v => (
                                                <button
                                                    key={v._id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addToCart(p, v);
                                                    }}
                                                    style={{ ...variantButtonStyle, padding: isMobile ? '4px' : '6px', fontSize: isMobile ? '0.7rem' : '0.75rem' }}
                                                >
                                                    {v.name} ({tenantConfig?.currency}{v.price})
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

            {/* Desktop Cart Section */}
            {/* 🖥️ 桌機端正常顯示右側購物車 */}
            {!isMobile && (
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {renderCartContent()}
                </div>
            )}

            {/* Mobile Bottom Float Bar */}
            {/* 📱 手機端底部懸浮點擊條（當購物車有東西時浮現） */}
            {isMobile && cartTotalQty > 0 && (
                <div 
                    onClick={() => setShowMobileCart(true)}
                    style={{
                        position: 'fixed',
                        bottom: '4.5rem',
                        left: '1rem',
                        right: '1rem',
                        background: 'var(--primary, #3b82f6)',
                        borderRadius: '30px',
                        padding: '0.8rem 1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: 'white',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                        zIndex: 90,
                        cursor: 'pointer'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
                        <ShoppingCart size={20} />
                        <span>已選 {cartTotalQty} 件商品</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                        {tenantConfig?.currency}{total.toLocaleString()} ❯
                    </div>
                </div>
            )}

            {/* Mobile Cart Drawer Overlay */}
            {/* 📱 手機端抽屜式購物車彈窗 */}
            <AnimatePresence>
                {isMobile && showMobileCart && (
                    <>
                        {/* 遮罩背景 */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowMobileCart(false)}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'black',
                                zIndex: 1000
                            }}
                        />
                        {/* 購物車本體 */}
                        <motion.div 
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            style={{
                                position: 'fixed',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: '85vh',
                                background: '#121214', // 接軌你的黑系 glass 風格背景
                                borderTopLeftRadius: '20px',
                                borderTopRightRadius: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                zIndex: 1001,
                                boxShadow: '0 -10px 30px rgba(0,0,0,0.5)',
                                border: '1px solid rgba(255,255,255,0.08)'
                            }}
                        >
                            {renderCartContent()}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

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
                            <div style={{ fontWeight: 700 }}>{t('pos.checkout_success', '結帳成功')}</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t('pos.order_created_msg', '訂單已成立並更新庫存')}</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// 樣式保持不變，額外增加健全度防護
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
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: '0.2s',
    flexShrink: 0
};
const successToastStyle = { position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', padding: '1rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', zIndex: 2000 };

export default POS;