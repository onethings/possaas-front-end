import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GuidedTour from '../components/GuidedTour';
import { pageTours } from '../utils/pageTours';
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
            setError(t('orders.error_fetch', 'Error Fetch'));
        } finally {
            setLoading(false);
        }
    };

    const handleReturn = async (orderNo, item) => {
        const currentOrder = orders.find(o => o.orderNo === orderNo);
        if (!currentOrder) return;

        const maxAvailable = item.qty - (item.returnQty || 0);
        if (maxAvailable <= 0) {
            alert(t('orders.already_returned', 'Already Returned'));
            return;
        }

        const returnQtyStr = prompt(t('orders.enter_return_qty', `請輸入退貨數量 (最大 ${maxAvailable}):`), "1");
        if (!returnQtyStr) return;

        const returnQty = parseInt(returnQtyStr, 10);
        if (isNaN(returnQty) || returnQty <= 0 || returnQty > maxAvailable) {
            alert(t('orders.invalid_qty', 'Invalid Qty'));
            return;
        }

        const reason = prompt(t('orders.enter_return_reason', 'Enter Return Reason'), "");
        if (reason === null) return;

        try {
            setLoading(true);
            const currentShiftId = localStorage.getItem('current_shift_id') || currentOrder.shiftId;

            const payload = {
                orderNo: orderNo,
                reason: reason || 'Web 後台操作退貨',
                shiftId: currentShiftId,
                paymentMethod: 'cash',
                itemsToReturn: [{
                    productId: item.productId,
                    variantId: item.variantId || null,
                    qty: returnQty
                }]
            };

            const result = await processOrderReturn(payload);

            if (result.success) {
                setOrders(prevOrders => prevOrders.map(o => {
                    if (o.orderNo === orderNo) {
                        const updatedItems = o.items.map(i => {
                            const isMatch = i.productId === item.productId &&
                                (!item.variantId || i.variantId === item.variantId);
                            return isMatch ? { ...i, returnQty: (i.returnQty || 0) + returnQty } : i;
                        });

                        const updatedOrder = {
                            ...o,
                            items: updatedItems,
                            status: result.data.status,
                            finalAmount: result.data.finalAmount,
                            refundAmount: result.data.totalRefundAmount
                        };
                        
                        // 同步更新彈窗裡的詳情狀態
                        if (selectedOrder && selectedOrder.orderNo === orderNo) {
                            setSelectedOrder(updatedOrder);
                        }
                        
                        return updatedOrder;
                    }
                    return o;
                }));

                alert(t('orders.return_success', 'Return Success'));
            }
        } catch (err) {
            console.error('Return error:', err);
            alert(err.message || t('orders.return_failed', 'Return Failed'));
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            await exportOrdersCSV({ startDate, endDate, status: activeTab });
        } catch (err) {
            alert(t('orders.error_export', 'Error Export'));
        }
    };

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'all') return true;
        return order.status === activeTab;
    });

    const tabs = [
        { id: 'all', label: t('orders.status_all', 'Status All') }, // 手機端精簡字詞避免擠壓
        { id: 'paid', label: t('orders.status_paid', 'Status Paid') },
        { id: 'partially_returned', label: t('orders.status_partially_returned', 'Status Partially Returned') },
        { id: 'returned', label: t('orders.status_returned', 'Status Returned') },
        { id: 'cancelled', label: t('orders.status_cancelled', 'Status Cancelled') }
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#6366f1' }}>
                <Loader2 className="animate-spin" size={40} />
                <span style={{ marginLeft: '8px' }}>{t('orders.loading', 'Loading')}</span>
            </div>
        );
    }

    return (<>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="orders-page-container"
        >
            {/* 注入響應式自適應 CSS 補丁 */}
            <style>{`
                .orders-page-container {
                    padding: 2rem;
                    color: #f8fafc;
                }
                .orders-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    gap: 1rem;
                }
                .orders-header h1 {
                    font-size: 1.8rem;
                    font-weight: 700;
                    margin: 0;
                    color: #ffffff;
                }
                .filter-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                .tab-group {
                    display: flex;
                    gap: 4px;
                    background: rgba(15, 23, 42, 0.4);
                    padding: 4px;
                    border-radius: 8px;
                    overflow-x: auto;
                    scrollbar-width: none; /* Firefox */
                }
                .tab-group::-webkit-scrollbar {
                    display: none; /* Safari / Chrome */
                }
                .tab-btn {
                    padding: 6px 12px;
                    border-radius: 6px;
                    border: none;
                    font-size: 0.85rem;
                    font-weight: 500;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.2s;
                }
                .date-picker-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(15, 23, 42, 0.5);
                    padding: 6px 12px;
                    border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .date-input {
                    background: transparent;
                    border: none;
                    color: #fff;
                    font-size: 0.85rem;
                    outline: none;
                    color-scheme: dark; /* 讓手機端原生日期彈窗變深色 */
                }

                /* 桌機端傳統表格佈局 */
                .responsive-table-wrapper { display: block; overflow-x: auto; }
                .responsive-table { width: 100%; border-collapse: collapse; text-align: left; }
                .responsive-table th, .responsive-table td { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.04); }
                .mobile-card-list { display: none; }

                /* 行動端核心自適應斷點 */
                @media (max-width: 768px) {
                    .orders-page-container { padding: 1rem; }
                    .orders-header { flex-direction: column; align-items: flex-start; }
                    .orders-header button { width: 100%; justify-content: center; }
                    .filter-bar { flex-direction: column; align-items: stretch; }
                    .tab-group { width: 100%; }
                    .date-picker-wrapper { width: 100%; justify-content: center; }
                    .date-input { flex: 1; text-align: center; }
                    
                    /* 隱藏表格，開啟卡片流佈局 */
                    .responsive-table-wrapper { display: none; }
                    .mobile-card-list { display: flex; flex-direction: column; gap: 1rem; }
                    .mobile-order-card {
                        background: rgba(15, 23, 42, 0.3);
                        border: 1px solid rgba(255,255,255,0.05);
                        border-radius: 12px;
                        padding: 1rem;
                    }
                    .card-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 0.5rem;
                    }
                    .card-row:last-child { margin-bottom: 0; margin-top: 0.8rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.8rem; }
                }
                
                /* 彈窗內容自適應細節 */
                .modal-item-row {
                    background: rgba(15, 23, 42, 0.3);
                    padding: 12px;
                    border-radius: 8px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                }
                @media (max-width: 480px) {
                    .modal-item-row { flex-direction: column; align-items: flex-start; }
                    .modal-item-actions { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-top: 4px;}
                }
            `}</style>

            {/* 頂部標題區 */}
            <div className="orders-header">
                <div>
                    <h1>{t('orders.title')}</h1>
                </div>
                <button onClick={handleExport} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.2rem', background: '#4f46e5', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <Download size={16} />
                    {t('orders.export_summary', 'Export Summary')}
                </button>
            </div>

            {/* 深色主面板容器 */}
            <div style={{
                background: 'rgba(30, 41, 59, 0.7)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.2rem',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)'
            }}>
                {/* 篩選與工具列 */}
                <div className="filter-bar">
                    <div className="tab-group">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="tab-btn"
                                style={{
                                    background: activeTab === tab.id ? '#4f46e5' : 'transparent',
                                    color: activeTab === tab.id ? '#ffffff' : '#94a3b8',
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="date-picker-wrapper">
                        <Calendar size={16} color="#94a3b8" />
                        <input id="orders-start-date" name="orders-start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="date-input" />
                        <span style={{ color: '#64748b' }}>-</span>
                        <input id="orders-end-date" name="orders-end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="date-input" />
                    </div>
                </div>

                {/* 1. 桌機平板端：顯示傳統表格 (在行動端會自動 hidden) */}
                <div className="responsive-table-wrapper">
                    <table className="responsive-table">
                        <thead>
                            <tr style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                <th>{t('orders.csv_headers.no', 'No')}</th>
                                <th>{t('orders.anonymous_customer', 'Anonymous Customer')}</th>
                                <th>{t('orders.final_amount', 'Final Amount')}</th>
                                <th>{t('orders.csv_headers.status', 'Status')}</th>
                                <th>{t('orders.csv_headers.time', 'Time')}</th>
                                <th style={{ textAlign: 'right' }}>{t('orders.csv_headers.id', 'ID')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>{t('orders.no_data', 'No Data')}</td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order._id} style={{ fontSize: '0.9rem' }}>
                                        <td style={{ fontWeight: 600, color: '#38bdf8' }}>{order.orderNo}</td>
                                        <td style={{ color: '#e2e8f0' }}>{order.customerName || t('orders.anonymous_customer', 'Anonymous Customer')}</td>
                                        <td style={{ fontWeight: 700, color: '#f8fafc' }}>
                                            {tenantConfig.currency}{(order.finalAmount || 0).toLocaleString()}
                                        </td>
                                        <td>
                                            <StatusBadge status={order.status} t={t} />
                                        </td>
                                        <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                            {new Date(order.createdAt).toLocaleString()}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '6px 10px', borderRadius: '6px', color: '#cbd5e1', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                            >
                                                <Eye size={14} />
                                                <span>{t('orders.details_title', 'Details Title')}</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 2. 手機端：轉換為精緻卡片流 (在桌機平板端自動 hidden) */}
                <div className="mobile-card-list">
                    {filteredOrders.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>{t('orders.no_data', 'No Data')}</div>
                    ) : (
                        filteredOrders.map((order) => (
                            <div key={order._id} className="mobile-order-card">
                                <div className="card-row">
                                    <span style={{ fontWeight: 600, color: '#38bdf8', fontSize: '0.95rem' }}>{order.orderNo}</span>
                                    <StatusBadge status={order.status} t={t} />
                                </div>
                                <div className="card-row" style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                    <span>{order.customerName || t('orders.anonymous_customer', 'Anonymous Customer')}</span>
                                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="card-row">
                                    <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1.1rem' }}>
                                        {tenantConfig.currency}{(order.finalAmount || 0).toLocaleString()}
                                    </span>
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        style={{ background: 'rgba(255,255,255,0.08)', border: 'none', padding: '6px 12px', borderRadius: '6px', color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                                    >
                                        <Eye size={12} />
                                        <span>{t('orders.details_title', 'Details Title')}</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 詳情彈窗自適應 */}
            {selectedOrder && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50, padding: '0.75rem' }}>
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.2rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', color: '#f8fafc' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.8rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', wordBreak: 'break-all', paddingRight: '8px' }}>#{selectedOrder.orderNo}</h3>
                            <StatusBadge status={selectedOrder.status} t={t} />
                        </div>

                        {/* 商品明細 */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                            {selectedOrder.items?.map((item, index) => {
                                const maxAvailable = item.qty - (item.returnQty || 0);
                                return (
                                    <div key={index} className="modal-item-row">
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.nameSnapshot || item.productId}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                                                {t('orders.unit_price')}: {tenantConfig.currency}{item.priceSnapshot} | {t('orders.quantity')}: {item.qty}
                                                {item.returnQty > 0 && <span style={{ color: '#f97316', marginLeft: '4px' }}>(-{item.returnQty})</span>}
                                            </div>
                                        </div>
                                        <div className="modal-item-actions">
                                            <span style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                                                {t('orders.subtotal')}: {tenantConfig.currency}{((item.qty - (item.returnQty || 0)) * item.priceSnapshot).toLocaleString()}
                                            </span>
                                            {selectedOrder.status !== 'cancelled' && maxAvailable > 0 && (
                                                <button
                                                    onClick={() => handleReturn(selectedOrder.orderNo, item)}
                                                    style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#f97316', border: '1px solid rgba(249, 115, 22, 0.3)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', marginLeft: '8px' }}
                                                >
                                                    {t('orders.return_btn', 'Return Btn')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                            <button onClick={() => setSelectedOrder(null)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', width: '100%', maxWidth: '100px' }}>
                                {t('orders.close', 'Close')}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>

        <GuidedTour tourId="orders" steps={pageTours.orders(t)} />
    </>);
};

const StatusBadge = ({ status, t }) => {
    const configs = {
        paid: { color: '#4ade80', icon: CheckCircle, text: t('orders.status_paid', 'Status Paid') },
        pending: { color: '#fbbf24', icon: Clock, text: t('orders.status_pending', 'Status Pending') },
        cancelled: { color: '#f87171', icon: XCircle, text: t('orders.status_cancelled', 'Status Cancelled') },
        returned: { color: '#ef4444', icon: CheckCircle, text: t('orders.status_returned', 'Status Returned') },
        partially_returned: { color: '#f97316', icon: CheckCircle, text: t('orders.status_partially_returned', 'Status Partially Returned') },
    };
    const config = configs[status] || configs.pending;
    const Icon = config.icon;

    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px',
            borderRadius: '20px', background: `${config.color}15`, color: config.color,
            fontSize: '0.75rem', fontWeight: 500, whiteSpace: 'nowrap'
        }}>
            <Icon size={12} />
            <span>{config.text}</span>
        </div>
    );
};
export default Orders;