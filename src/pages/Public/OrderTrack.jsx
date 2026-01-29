import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Package, CheckCircle2, Clock, Phone } from 'lucide-react';

import { trackOrder } from '../../api/orders';

const OrderTrack = () => {
    const [orderId, setOrderId] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const apiResult = await trackOrder(orderId);
            if (apiResult.success) {
                // Map backend order to UI structure
                const order = apiResult.data;
                setResult({
                    id: order.orderNo,
                    status: order.status === 'paid' ? 'delivered' : 'pending',
                    customer: order.customerNameSnapshot || '客戶',
                    items: order.items.map(i => `${i.nameSnapshot || '產品'} x ${i.qty}`),
                    lastUpdate: new Date(order.updatedAt || order.createdAt).toLocaleString(),
                    location: '發貨分店' // Currently static or can be derived from storeId
                });
            } else {
                setError('找不到該訂單，請檢查單號是否正確');
            }
        } catch (err) {
            setError(err.response?.data?.message || '查詢失敗');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }} className="gradient-text">訂單進度查詢</h1>
                <p style={{ color: 'var(--text-muted)' }}>輸入您的訂單編號或手機號碼以追蹤狀態</p>
            </div>

            <form onSubmit={handleSearch} className="glass-panel" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="例如: ORD-1234 或 0912..."
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '1rem 1rem 1rem 45px',
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            outline: 'none',
                            fontSize: '1.1rem'
                        }}
                        required
                    />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '0 2rem' }} disabled={loading}>
                    {loading ? '查詢中...' : '查詢'}
                </button>
            </form>

            {error && (
                <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', marginBottom: '2rem', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass-panel"
                        style={{ padding: '2rem' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>訂單編號</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-light)' }}>#{result.id}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>最後更新</div>
                                <div style={{ fontSize: '1rem' }}>{result.lastUpdate}</div>
                            </div>
                        </div>

                        <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: 'rgba(255,255,255,0.1)' }}></div>

                            <div style={{ marginBottom: '2rem', position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '-2.4rem', top: 0, background: 'var(--primary)', padding: '6px', borderRadius: '50%', border: '4px solid var(--bg-dark)' }}>
                                    <CheckCircle2 size={16} />
                                </div>
                                <h3 style={{ fontSize: '1.1rem' }}>已送達</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>物品已送抵分店，請隨時前往取貨。</p>
                            </div>

                            <div style={{ marginBottom: '2rem', position: 'relative', opacity: 0.5 }}>
                                <div style={{ position: 'absolute', left: '-2.4rem', top: 0, background: 'gray', padding: '6px', borderRadius: '50%', border: '4px solid var(--bg-dark)' }}>
                                    <Package size={16} />
                                </div>
                                <h3 style={{ fontSize: '1.1rem' }}>運送中</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>正在前往目的地...</p>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: 'var(--primary-light)' }}>
                                <MapPin size={18} /> <span>取貨地點：{result.location}</span>
                            </div>
                            <div style={{ fontSize: '0.9rem' }}>
                                <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>訂購清單:</div>
                                {result.items.map((item, i) => <div key={i} style={{ color: 'var(--text-muted)' }}>• {item}</div>)}
                            </div>
                        </div>

                        <button className="btn-primary" style={{ width: '100%', marginTop: '2rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}>
                            <Phone size={18} style={{ marginRight: '8px' }} /> 聯絡客服
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OrderTrack;
