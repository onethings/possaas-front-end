import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // 確保啟用
import { motion } from 'framer-motion';
import {
    Search, Calendar, Download, Eye, CheckCircle, Clock, XCircle, Loader2
} from 'lucide-react';
import { getOrders, exportOrdersCSV, processOrderReturn } from '../api/orders';
import { useTenant } from '../contexts/TenantContext';

const Orders = () => {
    const { t } = useTranslation(); // 初始化 t 函數
    const { tenantConfig } = useTenant();
    const [activeTab, setActiveTab] = useState('all');
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleReturn = async (orderNo, item) => {
        if (!window.confirm(t('orders.confirm_return_msg'))) return;

        try {
            setLoading(true);
            // 注意：請確保你的 ../api/orders.js 有導出 processOrderReturn
            const result = await processOrderReturn({
                orderNo: orderNo,
                itemsToReturn: [{
                    productId: item.productId,
                    qty: item.qty,
                    nameSnapshot: item.nameSnapshot
                }],
                reason: "Web Dashboard Return"
            });

            if (result.success) {
                alert(t('orders.return_success'));
                fetchOrders(); // 重新整理列表
                setSelectedOrder(null); // 關閉 Modal
            }
        } catch (err) {
            alert(err.message || "Return failed");
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        setLoading(true);
        try {
            const blob = await exportOrdersCSV(startDate, endDate);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `orders_${startDate || 'all'}_${endDate || ''}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            alert(t('orders.error_export'));
        } finally {
            setLoading(false);
        }
    };

    const handleExportDetails = async () => {
        setLoading(true);
        try {
            const filteredOrders = orders.filter(filterDate);
            // CSV 表頭也支持多語言
            const headers = [
                t('orders.csv_headers.id'),
                t('orders.csv_headers.no'),
                t('orders.csv_headers.time'),
                t('orders.product_name'),
                t('orders.csv_headers.cost'),
                t('orders.unit_price'),
                t('orders.quantity'),
                t('orders.subtotal'),
                t('orders.csv_headers.status')
            ];

            const rows = filteredOrders.flatMap(order =>
                order.items.map(item => [
                    order._id,
                    order.orderNo,
                    new Date(order.createdAt).toLocaleString(),
                    item.nameSnapshot,
                    item.costSnapshot || 0,
                    item.priceSnapshot || 0,
                    item.qty,
                    item.subtotal,
                    t(`orders.status_${order.status}`) // 狀態也要多語言
                ])
            );

            const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `order_details_${startDate || 'all'}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            alert(t('orders.error_export'));
        } finally {
            setLoading(false);
        }
    };

    const filterDate = (order) => {
        if (!startDate && !endDate) return true;
        const orderDate = new Date(order.createdAt);
        const start = startDate ? new Date(startDate) : new Date('2000-01-01');
        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59);
        return orderDate >= start && orderDate <= end;
    };

    // 判斷是否在 7 天退貨期限內
    const isWithinReturnPeriod = (orderDateStr) => {
        const orderDate = new Date(orderDateStr);
        const now = new Date();
        const diffDays = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
    };

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
                setError(t('orders.error_fetch'));
            }
        } catch (err) {
            setError(t('orders.error_server'));
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
                <h2 style={{ fontSize: '1.5rem' }}>{t('orders.title')}</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.2rem 0.5rem' }}>
                        <Calendar size={16} style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }} />
                        <input
                            type="date"
                            style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.9rem' }}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <span style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }}>-</span>
                        <input
                            type="date"
                            style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.9rem' }}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <button onClick={handleExport} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Download size={18} /> {t('orders.export_summary')}
                    </button>
                    <button onClick={handleExportDetails} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Download size={18} /> {t('orders.export_details')}
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
                            fontWeight: activeTab === tab ? 600 : 400
                        }}
                    >
                        {t(`orders.status_${tab}`)}
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
                        <Loader2 className="animate-spin" size={24} /> {t('orders.loading')}
                    </div>
                ) : error ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
                        {error}
                    </div>
                ) : orders.filter(o => (activeTab === 'all' || o.status === activeTab) && filterDate(o)).length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                        {t('orders.no_data')}
                    </div>
                ) : (
                    orders.filter(o => (activeTab === 'all' || o.status === activeTab) && filterDate(o)).map(order => (
                        <div key={order._id} className="glass-panel" style={{ padding: '1.2rem', display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 0.5fr', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <div style={{ fontWeight: 600, color: 'var(--primary-light)' }}>#{order.orderNo}</div>
                                {order.isBackdated && (
                                    <span style={{ fontSize: '0.65rem', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                        {t('orders.backdate_label')}
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                                    {(order.customerNameSnapshot || 'N')[0]}
                                </div>
                                {order.customerNameSnapshot || t('orders.anonymous_customer')}
                            </div>
                            <div style={{ fontWeight: 700 }}>{tenantConfig.currency}{order.finalAmount?.toLocaleString()}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(order.createdAt).toLocaleString()}</div>
                            <div>
                                <StatusBadge status={order.status} t={t} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button
                                    onClick={() => setSelectedOrder(order)}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                >
                                    <Eye size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}
                    onClick={() => setSelectedOrder(null)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="glass-panel"
                        style={{ width: '100%', maxWidth: '600px', maxHeight: '85vh', overflow: 'hidden', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{t('orders.details_title')} #{selectedOrder.orderNo}</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                                <XCircle size={20} />
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                <div>{t('orders.product_name')}</div>
                                <div style={{ textAlign: 'center' }}>{t('orders.unit_price')}</div>
                                <div style={{ textAlign: 'center' }}>{t('orders.quantity')}</div>
                                <div style={{ textAlign: 'right' }}>{t('orders.subtotal')}</div>
                            </div>
                            {selectedOrder.items?.map((item, idx) => (
                                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', gap: '1rem', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
                                    <div style={{ fontSize: '0.95rem' }}>{item.nameSnapshot}</div>
                                    <div style={{ textAlign: 'center' }}>{tenantConfig.currency}{(item.priceSnapshot || 0).toLocaleString()}</div>
                                    <div style={{ textAlign: 'center' }}>{item.qty}</div>
                                    <div style={{
                                        textAlign: 'right',
                                        display: 'flex',           // 使用 flex 讓金額和按鈕水平排列
                                        alignItems: 'center',      // 垂直居中對齊
                                        justifyContent: 'flex-end',// 靠右對齊
                                        gap: '12px'                // 金額與按鈕之間的間距
                                    }}>
                                        {/* 顯示小計金額 */}
                                        <span>{tenantConfig.currency}{(item.subtotal || 0).toLocaleString()}</span>

                                        {/* 在金額後面加入退貨按鈕 */}
                                        {selectedOrder.status === 'paid' && isWithinReturnPeriod(selectedOrder.createdAt) && (
                                            <button
                                                onClick={() => handleReturn(selectedOrder.orderNo, item)}
                                                style={{
                                                    background: '#ef444420',
                                                    color: '#ef4444',
                                                    border: 'none',
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.75rem',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {t('orders.return_btn')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                                <span>{t('orders.subtotal')}</span>
                                <span>{tenantConfig.currency}{(selectedOrder.totalAmount || 0).toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f87171' }}>
                                <span>{t('orders.discount')}</span>
                                <span>-{tenantConfig.currency}{(selectedOrder.discountAmount || 0).toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700, marginTop: '0.5rem' }}>
                                <span>{t('orders.final_amount')}</span>
                                <span style={{ color: 'var(--primary-light)' }}>{tenantConfig.currency}{(selectedOrder.finalAmount || 0).toLocaleString()}</span>
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
        returned: { color: '#ef4444', icon: XCircle, text: t('orders.status_returned') },
        partially_returned: { color: '#f97316', icon: Clock, text: t('orders.status_partially_returned') },
    };
    const config = configs[status] || configs.pending;
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