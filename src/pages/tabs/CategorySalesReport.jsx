import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Download, Loader2, FileText, FileSpreadsheet, Settings2 } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';
import { useReportFilters } from '../../contexts/ReportFilterContext';
import FilterBar from '../../components/FilterBar';
import { getRangeReport } from '../../api/reports';
import { exportCSV, exportPDF } from '../../utils/exportUtils';

// ── 欄位定義 ──
const COLUMN_DEFS = [
  { key: 'name',         label: '類別',     align: 'left',  isCurrency: false,
    getVal: (c) => c.name },
  { key: 'qty',          label: '售出商品', align: 'right', isCurrency: false,
    getVal: (c) => c.qty },
  { key: 'totalRevenue', label: '銷售總額', align: 'right', isCurrency: true,
    getVal: (c) => c.totalRevenue || 0 },
  { key: 'returnQty',    label: '商品退還數量', align: 'right', isCurrency: false,
    getVal: (c) => c.returnQty || 0 },
  { key: 'refund',       label: '退款',     align: 'right', isCurrency: true,
    getVal: (c) => c.refund || 0 },
  { key: 'discount',     label: '折扣',     align: 'right', isCurrency: true,
    getVal: (c) => c.discount || 0 },
  { key: 'netSales',     label: '淨銷售額', align: 'right', isCurrency: true,
    getVal: (c) => c.netSales },
  { key: 'cost',         label: '銷售成本', align: 'right', isCurrency: true,
    getVal: (c) => c.cost },
  { key: 'grossProfit',  label: '毛利潤',   align: 'right', isCurrency: true,
    getVal: (c) => c.netSales - c.cost },
  { key: 'profitMargin', label: '利潤率',   align: 'right', isCurrency: false,
    getVal: (c) => c.margin + '%' },
  { key: 'tax',          label: '稅務',     align: 'right', isCurrency: true,
    getVal: (c) => c.tax || 0 },
];

const DEFAULT_VISIBLE = {
  name: true,          // 類別
  qty: true,           // 售出商品
  totalRevenue: false, // 銷售總額
  returnQty: false,    // 商品退還數量
  refund: false,       // 退款
  discount: false,     // 折扣
  netSales: true,      // 淨銷售額
  cost: true,          // 銷售成本
  grossProfit: true,   // 毛利潤
  profitMargin: true,  // 利潤率
  tax: false,          // 稅務
};

const CategorySalesReport = () => {
    const { t } = useTranslation();
    const { tenantConfig } = useTenant();
    const { dateRange } = useReportFilters();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showColumnPicker, setShowColumnPicker] = useState(false);
    const [visibleCols, setVisibleCols] = useState(DEFAULT_VISIBLE);
    const exportRef = useRef(null);
    const colPickerRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    useEffect(() => {
        const handleClick = (e) => {
            if (exportRef.current && !exportRef.current.contains(e.target)) setShowExportMenu(false);
            if (colPickerRef.current && !colPickerRef.current.contains(e.target)) setShowColumnPicker(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await getRangeReport(dateRange.start, dateRange.end);
            if (result.success && result.data.categorySummary) {
                const mapped = result.data.categorySummary.map(c => ({
                    name: c.categoryName || 'Unknown',
                    qty: c.qty || 0,
                    totalRevenue: c.revenue || 0,
                    returnQty: 0,
                    refund: 0,
                    discount: 0,
                    netSales: c.revenue || 0,
                    cost: c.cost || 0,
                    grossProfit: (c.revenue || 0) - (c.cost || 0),
                    margin: c.revenue ? (((c.revenue - (c.cost || 0)) / c.revenue) * 100).toFixed(1) : 0,
                    tax: 0,
                }));
                setCategories(mapped);
            }
        } catch (err) {
            console.error('Failed to fetch category sales:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = (type) => {
        const activeCols = COLUMN_DEFS.filter(c => visibleCols[c.key]);
        const columns = activeCols.map(c => ({ label: c.label, value: (r) => c.getVal(r) }));
        const filename = `category_sales_${dateRange.start}_${dateRange.end}`;
        if (type === 'csv') exportCSV(columns, categories, [], `${filename}.csv`);
        else exportPDF(t('report.category_sales', '類別銷售'), columns, categories, tenantConfig.currency);
    };

    if (loading) {
        return (
            <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <Loader2 className="animate-spin" size={32} /> {t('common.loading')}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}
        >
            <FilterBar />

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>{t('report.category_sales', '類別銷售')}</h3>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        {/* 欄位選擇 */}
                        <div ref={colPickerRef} style={{ position: 'relative' }}>
                            <button onClick={() => setShowColumnPicker(!showColumnPicker)}
                                style={{ padding: '0.4rem 0.7rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Settings2 size={14} /> {t('common.columns', '欄位')}
                            </button>
                            {showColumnPicker && (
                                <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 100, minWidth: '170px', padding: '0.5rem', overflow: 'hidden' }}>
                                    {COLUMN_DEFS.map(c => (
                                        <label key={c.key} style={{
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            padding: '0.4rem 0.4rem', cursor: 'pointer', borderRadius: '4px',
                                            fontSize: '0.8rem', color: 'var(--text-main)', whiteSpace: 'nowrap',
                                        }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <input type="checkbox" checked={!!visibleCols[c.key]}
                                                onChange={() => setVisibleCols(prev => ({ ...prev, [c.key]: !prev[c.key] }))}
                                                style={{ accentColor: 'var(--primary)', cursor: 'pointer' }} />
                                            {c.label}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* 匯出 */}
                        <div ref={exportRef} style={{ position: 'relative' }}>
                            <button onClick={() => setShowExportMenu(!showExportMenu)} style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Download size={14} /> {t('common.export', '匯出')}
                            </button>
                            {showExportMenu && (
                                <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 100, minWidth: '140px', overflow: 'hidden' }}>
                                    <button onClick={() => { setShowExportMenu(false); handleExport('csv'); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left' }}
                                        onMouseEnter={e=>e.target.style.background='rgba(255,255,255,0.05)'} onMouseLeave={e=>e.target.style.background='transparent'}>
                                        <FileSpreadsheet size={16} color="#4ade80" /> CSV
                                    </button>
                                    <button onClick={() => { setShowExportMenu(false); handleExport('pdf'); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left' }}
                                        onMouseEnter={e=>e.target.style.background='rgba(255,255,255,0.05)'} onMouseLeave={e=>e.target.style.background='transparent'}>
                                        <FileText size={16} color="#f87171" /> PDF
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                {COLUMN_DEFS.filter(c => visibleCols[c.key]).map(c => (
                                    <th key={c.key} style={{ padding: '0.75rem 0.5rem', textAlign: c.align, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                        {c.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    {COLUMN_DEFS.filter(c => visibleCols[c.key]).map(c => {
                                        const rawVal = c.getVal(cat);
                                        const isPercent = c.key === 'profitMargin';
                                        const displayVal = c.isCurrency
                                            ? `${tenantConfig.currency}${rawVal.toLocaleString()}`
                                            : rawVal;
                                        return (
                                            <td key={c.key} style={{
                                                padding: '0.75rem 0.5rem', textAlign: c.align,
                                                fontWeight: c.key === 'name' ? 600 : 400,
                                                color: isPercent ? '#4ade80' : 'var(--text-main)',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {displayVal}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{t('common.page_info', { current: 1, total: Math.max(1, Math.ceil(categories.length / 10)) })}</span>
                    <select style={{ background: 'rgba(0,0,0,0.2)', border: 'none', color: 'var(--text-muted)', padding: '0.3rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                        <option>10 {t('common.rows', '行')}</option>
                        <option>25 {t('common.rows', '行')}</option>
                        <option>50 {t('common.rows', '行')}</option>
                    </select>
                </div>
            </div>
        </motion.div>
    );
};

export default CategorySalesReport;
