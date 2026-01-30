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
    ShoppingBag
} from 'lucide-react';
import { getProducts } from '../api/products';
import { getCustomers } from '../api/customers';
import { getDiscounts } from '../api/discounts';
import { createOrder } from '../api/orders';
import { getMyTenant } from '../api/tenants';
import { getCategories } from '../api/categories';

const POS = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [customers, setCustomers] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [tenantConfig, setTenantConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [custSearchTerm, setCustSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [prodRes, catRes, custRes, discRes, tenantRes] = await Promise.all([
                getProducts(),
                getCategories(),
                getCustomers(),
                getDiscounts(),
                getMyTenant()
            ]);
            if (prodRes.success) setProducts(prodRes.data);
            if (catRes.success) setCategories(catRes.data);
            if (custRes.success) setCustomers(custRes.data);
            if (discRes.success) setDiscounts(discRes.data);
            if (tenantRes.success) setTenantConfig(tenantRes.data.config);
        } catch (error) {
            console.error('Data loading error:', error);
        } finally {
            console.log('Categories loaded:', categories);
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


    const handleCheckout = async (status = 'paid') => {
        if (cart.length === 0) return;
        setSubmitting(true);
        try {
            const orderData = {
                storeId: localStorage.getItem('storeId') || products[0]?.storeId || 'MAIN',
                orderNo: `POS-${Date.now()}`,
                items: cart.map(item => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    qty: item.qty,
                    nameSnapshot: item.name,
                    variantNameSnapshot: item.variantName,
                    priceSnapshot: item.price,
                    subtotal: item.price * item.qty
                })),
                totalAmount: subtotal,
                taxAmount: taxAmount,
                discountAmount: discountAmount,
                finalAmount: total,
                customerId: selectedCustomer?._id,
                pointsEarned: tenantConfig?.loyaltyEnabled
                    ? Math.floor(total / (tenantConfig?.loyaltyRate || 10))
                    : 0,
                status: status
            };


            const result = await createOrder(orderData);
            if (result.success) {
                setShowSuccess(true);
                setCart([]);
                setAppliedDiscount(null);
                setSelectedCustomer(null);
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch (error) {
            alert('結帳失敗');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'all' || p.categoryId === activeCategory || p.categoryId?._id === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', height: 'calc(100vh - 120px)' }}>
            {/* Product Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
                <div className="glass-panel" style={{ padding: '0.8rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            placeholder="搜尋產品或掃描條碼..."
                            style={searchStyle}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Category Bar */}
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px' }} className="no-scrollbar">
                    <button
                        onClick={() => setActiveCategory('all')}
                        style={{
                            ...categoryPillStyle,
                            background: activeCategory === 'all' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                            color: activeCategory === 'all' ? 'white' : 'var(--text-muted)'
                        }}
                    >
                        <ShoppingBag size={14} /> 全部
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat._id}
                            onClick={() => setActiveCategory(cat._id)}
                            style={{
                                ...categoryPillStyle,
                                background: activeCategory === cat._id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                color: activeCategory === cat._id ? 'white' : 'var(--text-muted)'
                            }}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', paddingRight: '0.5rem' }}>
                    {loading ? (
                        <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                            <Loader2 className="animate-spin" />
                        </div>
                    ) : (
                        filteredProducts.map(p => (
                            <motion.div
                                key={p._id}
                                className="glass-panel"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => !p.hasVariants && addToCart(p)}
                                style={{ padding: '1rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}
                            >
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, height: '2.4rem', overflow: 'hidden' }}>{p.name}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                    <span style={{ color: 'var(--primary-light)', fontWeight: 700 }}>${p.price || p.variants?.[0]?.price}</span>
                                    {p.hasVariants && <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>多規格</span>}
                                </div>
                                {p.hasVariants && (
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', opacity: 0, transition: '0.3s', display: 'flex', flexDirection: 'column', gap: '4px', padding: '0.5rem', overflowY: 'auto' }} className="variant-overlay">
                                        {p.variants.map(v => (
                                            <button key={v._id} onClick={(e) => { e.stopPropagation(); addToCart(p, v); }} style={variantButtonStyle}>
                                                {v.name} (${v.price})
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ))
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
                                    <div style={{ fontSize: '0.85rem', color: 'var(--primary-light)' }}>${item.price}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '2px 8px' }}>
                                    <button onClick={() => updateQty(item.cartKey, -1)} style={qtyButtonStyle}><Minus size={14} /></button>
                                    <span style={{ minWidth: '20px', textAlign: 'center', fontSize: '0.9rem' }}>{item.qty}</span>
                                    <button onClick={() => updateQty(item.cartKey, 1)} style={qtyButtonStyle}><Plus size={14} /></button>
                                </div>
                                <div style={{ fontWeight: 600, minWidth: '50px', textAlign: 'right' }}>${(item.price * item.qty).toLocaleString()}</div>
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
                            <span>${subtotal.toLocaleString()}</span>
                        </div>
                        {appliedDiscount && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f87171' }}>
                                <span>折扣 ({appliedDiscount.name})</span>
                                <span>-${discountAmount.toLocaleString()}</span>
                            </div>
                        )}
                        {taxAmount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                                <span>稅額 ({tenantConfig?.taxRate || 0}%)</span>
                                <span>+${taxAmount.toLocaleString()}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, marginTop: '0.4rem' }}>
                            <span>總計</span>
                            <span style={{ color: 'var(--primary-light)' }}>${total.toLocaleString()}</span>
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
const categoryPillStyle = { padding: '6px 14px', borderRadius: '20px', border: 'none', fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s' };
const successToastStyle = { position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', padding: '1rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', zIndex: 2000 };

export default POS;
