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

    // --- ✨ 核心修改：處理部分退貨邏輯 ✨ ---
    const handleReturn = async (orderNo, item) => {
        // 1. 計算剩餘可退數量
        const maxAvailable = item.qty - (item.returnQty || 0);
        
        if (maxAvailable <= 0) {
            alert(t('orders.all_returned_msg') || "此商品已全部退貨");
            return;
        }

        // 2. 詢問退貨數量
        const returnQtyStr = window.prompt(`${t('orders.enter_return_qty') || '請輸入退貨數量'} (Max: ${maxAvailable})`, maxAvailable);
        const returnQty = parseInt(returnQtyStr);

        if (isNaN(returnQty) || returnQty <= 0 || returnQty > maxAvailable) {
            alert(t('orders.invalid_qty_msg') || "無效的退貨數量");
            return;
        }

        if (!window.confirm(t('orders.confirm_return_msg'))) return;

        try {
            setLoading(true);
            const result = await processOrderReturn({
                orderNo: orderNo,
                itemsToReturn: [{
                    productId: item.productId,
                    qty: returnQty,
                    nameSnapshot: item.nameSnapshot
                }],
                reason: "Web Console Partial Return"
            });

            if (result.success) {
                alert(t('orders.return_success'));
                fetchOrders(); // 刷新列表
                setSelectedOrder(null); // 關閉詳情
            }
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const data = await exportOrdersCSV(startDate, endDate);
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            alert('Export failed');
        }
    };

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'all') return true;
        return order.status === activeTab;
    });

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="p-6"
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{t('orders.title')}</h2>
                    <p style={{ color: '#666' }}>{t('orders.subtitle')}</p>
                </div>
                <button onClick={handleExport} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Download size={18} /> {t('orders.export')}
                </button>
            </div>

            {/* 篩選欄 */}
            <div style={{ background: 'white', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} size={18} />
                    <input type="text" placeholder={t('orders.search_placeholder')} style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #ddd' }} />
                </div>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
            </div>

            {/* Tab 切換 */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                {['all', 'paid', 'partially_returned', 'returned', 'cancelled'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '8px 16px', borderRadius: '20px', border: 'none',
                            background: activeTab === tab ? tenantConfig.primaryColor || '#007AFF' : '#eee',
                            color: activeTab === tab ? 'white' : '#666',
                            cursor: 'pointer', fontWeight: 500
                        }}
                    >
                        {t(`orders.tab_${tab}`)}
                    </button>
                ))}
            </div>

            {/* 訂單列表 */}
            <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f9f9f9', textAlign: 'left', borderBottom: '1px solid #eee' }}>
                            <th style={{ padding: '16px' }}>{t('orders.order_no')}</th>
                            <th style={{ padding: '16px' }}>{t('orders.customer')}</th>
                            <th style={{ padding: '16px' }}>{t('orders.amount')}</th>
                            <th style={{ padding: '16px' }}>{t('orders.status')}</th>
                            <th style={{ padding: '16px' }}>{t('orders.date')}</th>
                            <th style={{ padding: '16px' }}>{t('orders.action')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" /></td></tr>
                        ) : filteredOrders.map(order => (
                            <tr key={order._id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '16px', fontWeight: 500 }}>{order.orderNo}</td>
                                <td style={{ padding: '16px' }}>{order.customerNameSnapshot || t('orders.guest')}</td>
                                <td style={{ padding: '16px' }}>${order.finalAmount}</td>
                                <td style={{ padding: '16px' }}><StatusBadge status={order.status} t={t} /></td>
                                <td style={{ padding: '16px', color: '#666' }}>{new Date(order.paidAt).toLocaleString()}</td>
                                <td style={{ padding: '16px' }}>
                                    <button onClick={() => setSelectedOrder(order)} className="btn-icon"><Eye size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 訂單詳情彈窗 */}
            {selectedOrder && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }}
                        style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '600px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3>{t('orders.detail_title')} - {selectedOrder.orderNo}</h3>
                            <StatusBadge status={selectedOrder.status} t={t} />
                        </div>

                        {/* ✨ 關鍵修改：訂單項目表格 ✨ */}
                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ marginBottom: '12px' }}>{t('orders.items')}</h4>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', fontSize: '0.9rem', color: '#666' }}>
                                        <th style={{ padding: '10px 0' }}>{t('orders.item')}</th>
                                        <th style={{ padding: '10px 0', textAlign: 'right' }}>{t('orders.subtotal')}</th>
                                        <th style={{ padding: '10px 0', textAlign: 'right' }}>{t('orders.action')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.items.map((item, index) => {
                                        const remainingQty = item.qty - (item.returnQty || 0);
                                        return (
                                            <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={{ padding: '12px 0' }}>
                                                    <div style={{ fontWeight: 500 }}>{item.nameSnapshot}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>
                                                        {item.qty} {t('units.pcs')}
                                                        {item.returnQty > 0 && (
                                                            <span style={{ color: '#ef4444', marginLeft: '8px', fontWeight: 'bold' }}>
                                                                ({t('orders.returned') || '已退'} {item.returnQty})
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px 0', textAlign: 'right' }}>
                                                    ${item.priceSnapshot * remainingQty}
                                                </td>
                                                <td style={{ padding: '12px 0', textAlign: 'right' }}>
                                                    {remainingQty > 0 ? (
                                                        <button 
                                                            onClick={() => handleReturn(selectedOrder.orderNo, item)}
                                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
                                                        >
                                                            {t('orders.return_item') || '退貨'}
                                                        </button>
                                                    ) : (
                                                        <span style={{ fontSize: '0.8rem', color: '#999' }}>{t('orders.fully_returned') || '已全退'}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span>{t('orders.total_amount')}</span>
                                <span>${selectedOrder.totalAmount}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', color: tenantConfig.primaryColor }}>
                                <span>{t('orders.final_amount')}</span>
                                <span>${selectedOrder.finalAmount}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => setSelectedOrder(null)} className="btn-secondary">{t('orders.close')}</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

const StatusBadge = ({ status, t }) => {
    const configs = {
        paid: { color: '#4ade80', icon: CheckCircle, text: t('orders.status_paid') },
        pending: { color: '#fbbf24', icon: Clock, text: t('orders.status_pending') },
        cancelled: { color: '#f87171', icon: XCircle, text: t('orders.status_cancelled') },
        returned: { color: '#ef4444', icon: CheckCircle, text: t('orders.status_returned') },
        partially_returned: { color: '#f97316', icon: CheckCircle, text: t('orders.status_partially_returned') },
    };
    const config = configs[status] || configs.pending;
    const Icon = config.icon;

    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px',
            borderRadius: '20px', background: `${config.color}15`, color: config.color,
            fontSize: '0.8rem', fontWeight: 500
        }}>
            <Icon size={14} /> {config.text}
        </div>
    );
};

export default Orders;