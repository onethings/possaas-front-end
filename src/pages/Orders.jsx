import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    Calendar,
    Download,
    Eye,
    CheckCircle,
    Clock,
    XCircle,
    Loader2
} from 'lucide-react';
import { getOrders } from '../api/orders';

const Orders = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const result = await getOrders();
            if (result.success) {
                setOrders(result.data);
            } else {
                setError('無法讀取訂單列表');
            }
        } catch (err) {
            setError('伺服器連線失敗');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="animate-fade-in"
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem' }}>訂單管理</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="glass-card" style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <Calendar size={18} />日期範疇
                    </button>
                    <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Download size={18} /> 匯出報表
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                {['all', 'paid', 'pending', 'cancelled'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: activeTab === tab ? 'var(--primary-light)' : 'var(--text-muted)',
                            padding: '0.5rem 1rem',
                            cursor: 'pointer',
                            position: 'relative',
                            textTransform: 'capitalize',
                            fontWeight: activeTab === tab ? 600 : 400
                        }}
                    >
                        {tab === 'all' ? '全部訂單' : tab === 'paid' ? '已支付' : tab === 'pending' ? '待處理' : '已取消'}
                        {activeTab === tab && (
                            <motion.div layoutId="tab-underline" style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, background: 'var(--primary)' }} />
                        )}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '300px' }}>
                {loading ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                        <Loader2 className="animate-spin" size={24} /> 讀取中...
                    </div>
                ) : error ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
                        {error}
                    </div>
                ) : orders.filter(o => activeTab === 'all' || o.status === activeTab).length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                        找不到符合條件的訂單
                    </div>
                ) : (
                    orders.filter(o => activeTab === 'all' || o.status === activeTab).map(order => (
                        <div key={order._id} className="glass-panel" style={{ padding: '1.2rem', display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr 0.5fr', alignItems: 'center' }}>
                            <div style={{ fontWeight: 600, color: 'var(--primary-light)' }}>#{order.orderNo}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                                    {(order.customerNameSnapshot || 'N')[0]}
                                </div>
                                {order.customerNameSnapshot || '匿名客戶'}
                            </div>
                            <div style={{ fontWeight: 700 }}>${order.finalAmount?.toLocaleString()}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(order.createdAt).toLocaleString()}</div>
                            <div>
                                <StatusBadge status={order.status} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Eye size={18} /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>

        </motion.div>
    );
};

const StatusBadge = ({ status }) => {
    const configs = {
        paid: { color: '#4ade80', icon: CheckCircle, text: '已支付' },
        pending: { color: '#fbbf24', icon: Clock, text: '待處理' },
        cancelled: { color: '#f87171', icon: XCircle, text: '已取消' }
    };
    const config = configs[status];
    const Icon = config.icon;

    return (
        <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '20px',
            background: `${config.color}15`,
            color: config.color,
            fontSize: '0.8rem',
            fontWeight: 500
        }}>
            <Icon size={14} /> {config.text}
        </div>
    );
};

export default Orders;
