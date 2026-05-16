import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
    Search, Calendar, Download, Eye, CheckCircle, Clock, XCircle, Loader2
} from 'lucide-react';
import { getOrders, exportOrdersCSV, processOrderReturn } from '../api/orders';
import { useTenant } from '../contexts/TenantContext';

const Orders = () => {
    const { t } = useTranslation();
    const { tenantConfig } = useTenant();
    const [activeTab, setActiveTab] = useState('all');
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const result = await getOrders();
            if (result.success) {
                setOrders(result.data);
            }
        } catch (err) {
            setError('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    // 處理部分退貨邏輯
    const handleReturn = async (orderNo, item) => {
        const maxAvailable = item.qty - (item.returnQty || 0);
        if (maxAvailable <= 0) return;

        const returnCount = prompt(`${t('orders.return_qty_prompt', '請輸入退貨數量')} (Max: ${maxAvailable}):`, '1');
        if (!returnCount) return;

        const qtyToReturn = parseInt(returnCount, 10);
        if (isNaN(qtyToReturn) || qtyToReturn <= 0 || qtyToReturn > maxAvailable) {
            alert(t('orders.invalid_qty', '無效的數量'));
            return;
        }

        try {
            const returnData = {
                items: [{
                    productId: item.productId,
                    sku: item.productId,
                    qty: qtyToReturn
                }]
            };
            const result = await processOrderReturn(orderNo, returnData);
            if (result.success) {
                alert(t('orders.return_success', '退貨成功'));
                fetchOrders();
                setSelectedOrder(null);
            } else {
                alert(result.message || 'Return failed');
            }
        } catch (err) {
            alert('Error processing return');
        }
    };

    const handleExport = async () => {
        try {
            await exportOrdersCSV({ startDate, endDate, status: activeTab });
        } catch (err) {
            alert('Export failed');
        }
    };

    // 過濾標籤頁訂單
    const filteredOrders = orders.filter(order => {
        if (activeTab === 'all') return true;
        return order.status === activeTab;
    });

    const tabs = [
        { id: 'all', label: t('orders.tab_all') },
        { id: 'paid', label: t('orders.tab_paid') },
        { id: 'partially_returned', label: t('orders.tab_partially_returned') },
        { id: 'returned', label: t('orders.tab_returned') },
        { id: 'cancelled', label: t('orders.tab_cancelled') }
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#6366f1' }}>
                <Loader2 className="animate-spin" size={40} />
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="orders-container"
            style={{ padding: '2rem', color: '#f8fafc' }}
        >
            {/* 頂部標題區 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>{t('orders.title')}</h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>{t('orders.subtitle')}</p>
                </div>
                <button onClick={handleExport} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.2rem', background: '#4f46e5', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>
                    <Download size={16} />
                    {t('orders.export')}
                </button>
            </div>

            {/* 自訂深色面板容器 (替代找不到的 glass-panel) */}
            <div style={{ 
                background: 'rgba(30, 41, 59, 0.7)', 
                backdropFilter: 'blur(12px)', 
                border: '1px solid rgba(255, 255, 255, 0.08)', 
                borderRadius: '16px', 
                padding: '1.5rem',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)'
            }}>
                {/* 篩選與工具列 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '8px', background: 'rgba(15, 23, 42, 0.4)', padding: '4px', borderRadius: '8px' }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '6px 12px', borderRadius: '6px', border: 'none', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer',
                                    background: activeTab === tab.id ? '#4f46e5' : 'transparent',
                                    color: activeTab === tab.id ? '#ffffff' : '#94a3b8',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(15, 23, 42, 0.5)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <Calendar size={16} color="#94a3b8" />
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.85rem', outline: 'none' }} />
                            <span style={{ color: '#64748b' }}>-</span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.85rem', outline: 'none' }} />
                        </div>
                    </div>
                </div>

                {/* 訂單表格區 */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '0.85rem' }}>
                                <th style={{ padding: '12px' }}>{t('orders.order_no')}</th>
                                <th style={{ padding: '12px' }}>{t('orders.customer')}</th>
                                <th style={{ padding: '12px' }}>{t('orders.amount')}</th>
                                <th style={{ padding: '12px' }}>{t('orders.status')}</th>
                                <th style={{ padding: '12px' }}>{t('orders.date')}</th>
                                <th style={{ padding: '12px', textAlign: 'right' }}>{t('orders.action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No orders found</td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.9rem', hover: { background: 'rgba(255,255,255,0.02)' } }}>
                                        <td style={{ padding: '14px 12px', fontWeight: 600, color: '#38bdf8' }}>{order.orderNo}</td>
                                        <td style={{ padding: '14px 12px', color: '#e2e8f0' }}>{order.customerName || t('orders.guest')}</td>
                                        <td style={{ padding: '14px 12px', fontWeight: 700, color: '#f8fafc' }}>
                                            {tenantConfig.currency}{(order.finalAmount || 0).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '14px 12px' }}>
                                            <StatusBadge status={order.status} t={t} />
                                        </td>
                                        <td style={{ padding: '14px 12px', color: '#94a3b8', fontSize: '0.85rem' }}>
                                            {new Date(order.createdAt).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                                            <button 
                                                onClick={() => setSelectedOrder(order)}
                                                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '6px 10px', borderRadius: '6px', color: '#cbd5e1', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                            >
                                                <Eye size={14} />
                                                {t('orders.view', '詳情')}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 詳情彈窗彈出層 */}
            {selectedOrder && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50, padding: '1rem' }}>
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '600px', maxHeight: '85vh', overflowY: 'auto', color: '#f8fafc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.8rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{t('orders.order_no')}: {selectedOrder.orderNo}</h3>
                            <StatusBadge status={selectedOrder.status} t={t} />
                        </div>

                        {/* 商品明細項目清單 */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem' }}>
                            {selectedOrder.items?.map((item, index) => {
                                const maxAvailable = item.qty - (item.returnQty || 0);
                                return (
                                    <div key={index} style={{ background: 'rgba(15, 23, 42, 0.3)', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{item.nameSnapshot || item.productId}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                                                {tenantConfig.currency}{item.priceSnapshot} × {item.qty} 
                                                {item.returnQty > 0 && <span style={{ color: '#f97316', marginLeft: '8px' }}>({t('orders.returned_count', '已退')} {item.returnQty})</span>}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontWeight: 600 }}>{tenantConfig.currency}{((item.qty - (item.returnQty || 0)) * item.priceSnapshot).toLocaleString()}</span>
                                            {selectedOrder.status !== 'cancelled' && maxAvailable > 0 && (
                                                <button 
                                                    onClick={() => handleReturn(selectedOrder.orderNo, item)}
                                                    style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#f97316', border: '1px solid rgba(249, 115, 22, 0.3)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                                                >
                                                    {t('orders.action_return', '退貨')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                            <button onClick={() => setSelectedOrder(null)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                                {t('orders.close')}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

const StatusBadge = ({ status, t }) => {
    const configs = {
        paid: { color: '#4ade80', icon: CheckCircle, text: t('orders.status_paid', '已支付') },
        pending: { color: '#fbbf24', icon: Clock, text: t('orders.status_pending', '待付款') },
        cancelled: { color: '#f87171', icon: XCircle, text: t('orders.status_cancelled', '已取消') },
        returned: { color: '#ef4444', icon: CheckCircle, text: t('orders.status_returned', '已退貨') },
        partially_returned: { color: '#f97316', icon: CheckCircle, text: t('orders.status_partially_returned', '部分退貨') },
    };
    const config = configs[status] || configs.pending;
    const Icon = config.icon;

    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px',
            borderRadius: '20px', background: `${config.color}15`, color: config.color,
            fontSize: '0.8rem', fontWeight: 500
        }}>
            <Icon size={14} />
            <span>{config.text}</span>
        </div>
    );
};

export default Orders;