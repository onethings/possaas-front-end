import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    ChevronDown,
    Download,
    TrendingUp,
    DollarSign,
    Tag,
    RotateCcw,
    Store,
    ShoppingBag,
    BarChart2,
    PieChart,
    Activity,
    X,
    Loader2
} from 'lucide-react';
import { getRevenueReport } from '../api/reports';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';

const RevenueReport = () => {
    const { user } = useAuth();
    const { tenantConfig } = useTenant();
    
    // Date State
    const getToday = () => new Date().toISOString().split('T')[0];
    const [dateRange, setDateRange] = useState({
        start: localStorage.getItem('rev_start') || getToday(),
        end: localStorage.getItem('rev_end') || getToday()
    });

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedMetric, setSelectedMetric] = useState(null); // For detail modal

    useEffect(() => {
        fetchData();
        localStorage.setItem('rev_start', dateRange.start);
        localStorage.setItem('rev_end', dateRange.end);
    }, [dateRange]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getRevenueReport(dateRange.start, dateRange.end);
            if (res.success) {
                setData(res.data);
            } else {
                setError('無法讀取報表數據');
            }
        } catch (err) {
            setError('連線失敗');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePreset = (type) => {
        const today = new Date();
        let start = new Date();
        let end = new Date();

        switch (type) {
            case 'today':
                start = today;
                break;
            case 'yesterday':
                start.setDate(today.getDate() - 1);
                end.setDate(today.getDate() - 1);
                break;
            case 'thisWeek':
                const day = today.getDay();
                start.setDate(today.getDate() - day + (day === 0 ? -6 : 1)); // Monday
                break;
            case 'thisMonth':
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                break;
            case 'lastMonth':
                start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                end = new Date(today.getFullYear(), today.getMonth(), 0);
                break;
            case 'last7':
                start.setDate(today.getDate() - 6);
                break;
            case 'last30':
                start.setDate(today.getDate() - 29);
                break;
            default:
                break;
        }

        setDateRange({
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        });
    };

    const downloadCSV = (metricType) => {
        if (!data) return;
        
        let headers = [];
        let rows = [];
        let fileName = `revenue_${metricType}_${dateRange.start}_to_${dateRange.end}.csv`;

        if (metricType === 'sales') {
            headers = ['日期', '銷售額', '毛利 (淨利)', '折扣'];
            rows = data.details.reports.map(r => [
                r.date,
                r.totalRevenue,
                r.totalRevenue - r.totalCost,
                r.totalDiscount
            ]);
        } else {
            // General export for summary
            headers = ['指標', '數值'];
            rows = [
                ['預估利潤', data.summary.estimatedProfit],
                ['銷售收入', data.summary.salesIncome],
                ['總折扣', data.summary.totalDiscount],
                ['退貨支出', data.summary.returnExpenditure],
                ['店面支出', data.summary.storeExpenditure],
                ['進貨支出', data.summary.stockPurchaseExpenditure]
            ];
        }

        const csvContent = "uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading && !data) {
        return (
            <div style={fullCenterStyle}>
                <Loader2 className="animate-spin" size={40} color="var(--primary)" />
            </div>
        );
    }

    const { summary } = data || {};

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}
        >
            {/* Header with Date Selectors */}
            <div className="glass-panel" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={dateInputContainer}>
                            <Calendar size={16} color="var(--text-muted)" />
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                style={dateInputStyle}
                            />
                        </div>
                        <span style={{ color: 'var(--text-muted)' }}>至</span>
                        <div style={dateInputContainer}>
                            <Calendar size={16} color="var(--text-muted)" />
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                style={dateInputStyle}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button className="btn-secondary" onClick={() => handlePreset('today')} style={presetBtnStyle}>今天</button>
                        <button className="btn-secondary" onClick={() => handlePreset('yesterday')} style={presetBtnStyle}>昨天</button>
                        <button className="btn-secondary" onClick={() => handlePreset('thisWeek')} style={presetBtnStyle}>本周</button>
                        <button className="btn-secondary" onClick={() => handlePreset('thisMonth')} style={presetBtnStyle}>本月</button>
                        <button className="btn-secondary" onClick={() => handlePreset('lastMonth')} style={presetBtnStyle}>上個月</button>
                        <button className="btn-secondary" onClick={() => handlePreset('last7')} style={presetBtnStyle}>過去7天</button>
                        <button className="btn-secondary" onClick={() => handlePreset('last30')} style={presetBtnStyle}>過去30天</button>
                    </div>

                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                        <button className="glass-card" style={reportLinkStyle} title="商品銷售分析" onClick={() => setSelectedMetric('product_analysis')}><ShoppingBag size={18} /></button>
                        <button className="glass-card" style={reportLinkStyle} title="類別銷售分析" onClick={() => setSelectedMetric('category_analysis')}><PieChart size={18} /></button>
                        <button className="glass-card" style={reportLinkStyle} title="銷售趨勢與報表" onClick={() => setSelectedMetric('trend_analysis')}><Activity size={18} /></button>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
                <MetricCard
                    icon={TrendingUp}
                    label="預估利潤"
                    value={summary?.estimatedProfit}
                    color="var(--primary)"
                    currencySymbol={tenantConfig.currency}
                    onClick={() => setSelectedMetric('profit')}
                />
                <MetricCard
                    icon={DollarSign}
                    label="銷售收入"
                    value={summary?.salesIncome}
                    color="#60a5fa"
                    currencySymbol={tenantConfig.currency}
                    onClick={() => setSelectedMetric('sales')}
                />
                <MetricCard
                    icon={Tag}
                    label="總折扣"
                    value={summary?.totalDiscount}
                    color="#fbbf24"
                    currencySymbol={tenantConfig.currency}
                    onClick={() => setSelectedMetric('discount')}
                />
                <MetricCard
                    icon={RotateCcw}
                    label="退貨支出"
                    value={summary?.returnExpenditure}
                    color="#f87171"
                    currencySymbol={tenantConfig.currency}
                    onClick={() => setSelectedMetric('return')}
                />
                <MetricCard
                    icon={Store}
                    label="店面支出"
                    value={summary?.storeExpenditure}
                    color="#a78bfa"
                    currencySymbol={tenantConfig.currency}
                    onClick={() => setSelectedMetric('store')}
                />
                <MetricCard
                    icon={ShoppingBag}
                    label="進貨支出"
                    value={summary?.stockPurchaseExpenditure}
                    color="#2dd4bf"
                    currencySymbol={tenantConfig.currency}
                    onClick={() => setSelectedMetric('stock')}
                />
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedMetric && (
                    <div style={modalOverlayStyle} onClick={() => setSelectedMetric(null)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-panel"
                            style={modalContentStyle}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={modalHeaderStyle}>
                                <h3>{getMetricLabel(selectedMetric)} 明細</h3>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn-secondary" onClick={() => downloadCSV(selectedMetric)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Download size={14} /> 下載 CSV
                                    </button>
                                    <button onClick={() => setSelectedMetric(null)} style={closeBtnStyle}><X size={20} /></button>
                                </div>
                            </div>
                            
                            <div style={modalTableContainer}>
                                <table style={tableStyle}>
                                    <thead>
                                        {selectedMetric === 'product_analysis' ? (
                                            <tr>
                                                <th>產品名稱</th>
                                                <th>銷售數量</th>
                                                <th>銷售總額</th>
                                            </tr>
                                        ) : selectedMetric === 'category_analysis' ? (
                                            <tr>
                                                <th>類別名稱</th>
                                                <th>銷售數量</th>
                                                <th>銷售總額</th>
                                            </tr>
                                        ) : selectedMetric === 'trend_analysis' ? (
                                            <tr>
                                                <th>日期</th>
                                                <th>銷售金額</th>
                                                <th>預期利潤</th>
                                            </tr>
                                        ) : (
                                            <tr>
                                                <th>日期</th>
                                                {selectedMetric === 'sales' && <th>銷售額</th>}
                                                {selectedMetric === 'sales' && <th>毛利 (淨利)</th>}
                                                {selectedMetric === 'sales' && <th>折扣</th>}
                                                {selectedMetric !== 'sales' && <th>金額</th>}
                                            </tr>
                                        )}
                                    </thead>
                                    <tbody>
                                        {selectedMetric === 'product_analysis' ? (
                                            data.analysis.topProducts.map((p, i) => (
                                                <tr key={i}>
                                                    <td>{p.name || '未知產品'}</td>
                                                    <td>{p.qty} 件</td>
                                                    <td>{tenantConfig.currency}{p.revenue.toLocaleString()}</td>
                                                </tr>
                                            ))
                                        ) : selectedMetric === 'category_analysis' ? (
                                            data.analysis.categorySummary.map((c, i) => (
                                                <tr key={i}>
                                                    <td>{c.name || '未分類'}</td>
                                                    <td>{c.qty} 件</td>
                                                    <td>{tenantConfig.currency}{c.revenue.toLocaleString()}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            data.details.reports.map((r, i) => (
                                                <tr key={i}>
                                                    <td>{r.date}</td>
                                                    {selectedMetric === 'sales' && <td>{tenantConfig.currency}{r.totalRevenue.toLocaleString()}</td>}
                                                    {selectedMetric === 'sales' && <td style={{ color: '#4ade80' }}>{tenantConfig.currency}{(r.totalRevenue - r.totalCost).toLocaleString()}</td>}
                                                    {selectedMetric === 'sales' && <td style={{ color: '#fbbf24' }}>{tenantConfig.currency}{r.totalDiscount.toLocaleString()}</td>}
                                                    {selectedMetric === 'profit' && <td>{tenantConfig.currency}{(r.totalRevenue - r.totalCost - r.totalExpenses).toLocaleString()}</td>}
                                                    {selectedMetric === 'trend_analysis' && <td>{tenantConfig.currency}{r.totalRevenue.toLocaleString()}</td>}
                                                    {selectedMetric === 'trend_analysis' && <td style={{ color: '#4ade80' }}>{tenantConfig.currency}{(r.totalRevenue - r.totalCost - r.totalExpenses).toLocaleString()}</td>}
                                                    {selectedMetric === 'discount' && <td>{tenantConfig.currency}{r.totalDiscount.toLocaleString()}</td>}
                                                    {selectedMetric === 'return' && <td>{tenantConfig.currency}{(r.returnAmount || 0).toLocaleString()}</td>}
                                                    {selectedMetric === 'store' && <td>{tenantConfig.currency}{(r.totalExpenses).toLocaleString()}</td>}
                                                    {selectedMetric === 'stock' && <td>{tenantConfig.currency}{(r.stockExpense || 0).toLocaleString()}</td>}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const MetricCard = ({ icon: Icon, label, value, color, currencySymbol, onClick }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="glass-panel"
        style={{ padding: '1.5rem', cursor: 'pointer', borderLeft: `4px solid ${color}` }}
        onClick={onClick}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.5rem', background: `${color}15`, borderRadius: 'var(--radius-md)' }}>
                <Icon size={20} color={color} />
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{label}</span>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 800 }}>
            {currencySymbol}{value?.toLocaleString() || 0}
        </div>
        <div style={{ marginTop: '0.8rem', display: 'flex', justifyContent: 'flex-end' }}>
            <ChevronDown size={18} color="var(--text-muted)" style={{ opacity: 0.5 }} />
        </div>
    </motion.div>
);

const getMetricLabel = (m) => {
    const labels = {
        profit: '預估利潤',
        sales: '銷售收入',
        discount: '總折扣',
        return: '退貨支出',
        store: '店面支出',
        stock: '進貨支出'
    };
    return labels[m] || '';
};

// Styles
const fullCenterStyle = { height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const dateInputContainer = { display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-md)' };
const dateInputStyle = { background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.9rem' };
const presetBtnStyle = { padding: '0.4rem 0.8rem', fontSize: '0.85rem', borderRadius: 'var(--radius-md)' };
const reportLinkStyle = { width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' };
const modalContentStyle = { width: '100%', maxWidth: '800px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: '1.5rem', background: 'var(--bg-card)' };
const modalHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' };
const closeBtnStyle = { background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' };
const modalTableContainer = { flex: 1, overflowY: 'auto' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };

export default RevenueReport;
