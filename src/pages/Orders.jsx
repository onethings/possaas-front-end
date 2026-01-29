import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    Calendar,
    Download,
    Eye,
    CheckCircle,
    Clock,
    XCircle
} from 'lucide-react';

const Orders = () => {
    const [activeTab, setActiveTab] = useState('all');

    const mockOrders = [
        { id: 'ORD-8821', customer: '張先生', total: 1850, status: 'paid', date: '2026-01-29 10:15' },
        { id: 'ORD-8822', customer: '李小姐', total: 450, status: 'pending', date: '2026-01-29 10:30' },
        { id: 'ORD-8823', customer: '王老闆', total: 2800, status: 'paid', date: '2026-01-29 10:45' },
        { id: 'ORD-8824', customer: '陳先生', total: 120, status: 'cancelled', date: '2026-01-29 09:12' },
    ];

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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {mockOrders.filter(o => activeTab === 'all' || o.status === activeTab).map(order => (
                    <div key={order.id} className="glass-panel" style={{ padding: '1.2rem', display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr 0.5fr', alignItems: 'center' }}>
                        <div style={{ fontWeight: 600, color: 'var(--primary-light)' }}>#{order.id}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>{order.customer[0]}</div>
                            {order.customer}
                        </div>
                        <div style={{ fontWeight: 700 }}>${order.total.toLocaleString()}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{order.date}</div>
                        <div>
                            <StatusBadge status={order.status} />
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Eye size={18} /></button>
                        </div>
                    </div>
                ))}
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
