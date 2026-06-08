import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import GuidedTour from '../../components/GuidedTour';
import { pageTours } from '../../utils/pageTours';
import { motion } from 'framer-motion';
import { Download, Loader2, Search, FileText, FileSpreadsheet, Printer, X, ChevronRight, ChevronLeft, Calendar, User, ShoppingBag, CreditCard, Store, Hash, MapPin } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';
import { useReportFilters } from '../../contexts/ReportFilterContext';
import FilterBar from '../../components/FilterBar';
import { getReceipts } from '../../api/receipts';
import { exportCSV, exportPDF } from '../../utils/exportUtils';
import { SortArrow } from '../../utils/useSortable';
import { usePagination } from '../../utils/usePagination';

/** Helper: safely read a value from receipt map or rawData fallback */
const rv = (r, key, rawKey) => {
    const v = r[key];
    if (v !== null && v !== undefined && v !== '') return String(v);
    if (r.rawData && r.rawData[rawKey]) return String(r.rawData[rawKey]);
    return '';
};

const rn = (r, key) => {
    const v = r[key];
    if (v === null || v === undefined) return 0;
    return Number(v) || 0;
};

const ReceiptsReport = () => {
    const { t } = useTranslation();
    const { tenantConfig } = useTenant();
    const { dateRange } = useReportFilters();
    const [loading, setLoading] = useState(true);
    const [rawReceipts, setRawReceipts] = useState([]);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const exportRef = useRef(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 900);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    useEffect(() => {
        const handleClick = (e) => {
            if (exportRef.current && !exportRef.current.contains(e.target)) setShowExportMenu(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await getReceipts({ startDate: dateRange.start, endDate: dateRange.end, limit: 500 });
            if (result.success) {
                setRawReceipts(result.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch receipts:', err);
        } finally {
            setLoading(false);
        }
    };

    // Build display list (the mapped version for table)
    const receipts = rawReceipts.map(r => ({
        _id: r._id,
        raw: r,
        no: r.receiptNumber || '—',
        date: r.date ? new Date(r.date).toLocaleString() : '—',
        dateRaw: r.date || '',
        employee: r.employee || '—',
        customer: r.customer || '—',
        type: r.status === 'refund' || r.status === 'returned' ? t('report.refund', 'Refund') : t('report.sales', 'Sales'),
        total: r.totalAmount || 0,
        paymentType: r.paymentType || '',
        status: r.status || 'paid',
        items: r.items || '',
    }));

    // ── Sort ──
    const [sortKey, setSortKey] = useState('');
    const [sortDir, setSortDir] = useState('asc');
    const handleSort = (key) => {
        setSortKey(prev => { if (prev === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); return prev; } setSortDir('asc'); return key; });
    };
    const REC_SORT_GETTERS = {
        no: (r) => r.no || '',
        date: (r) => r.dateRaw || '',
        employee: (r) => r.employee || '',
        type: (r) => r.type || '',
        total: (r) => r.total || 0,
    };
    const sortedReceipts = useMemo(() => {
        if (!sortKey) return receipts;
        const getter = REC_SORT_GETTERS[sortKey] || ((r) => r[sortKey]);
        return [...receipts].sort((a, b) => {
            let va = getter(a); if (va == null) va = '';
            let vb = getter(b); if (vb == null) vb = '';
            if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
            return sortDir === 'asc' ? (va - vb) : (vb - va);
        });
    }, [receipts, sortKey, sortDir]);

    // ── Pagination ──
    const { page, setPage, pageSize, setPageSize, totalPages, pagedData } = usePagination(sortedReceipts, 10);

    const handlePrint = () => {
        if (!selectedReceipt) return;
        window.print();
    };

    if (loading) {
        return (
            <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <Loader2 className="animate-spin" size={32} /> {t('common.loading')}
            </div>
        );
    }

    const currency = tenantConfig?.currency || 'Ks ';

    return (<>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', height: '100%', overflow: 'hidden' }}
        >
            {/* Print-only styles */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .receipt-print-area, .receipt-print-area * { visibility: visible; }
                    .receipt-print-area { position: absolute; left: 0; top: 0; width: 100%; background: #fff; color: #000; }
                    .no-print { display: none !important; }
                }
            `}</style>

            {/* Header */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }} className="no-print">
                <FilterBar />
                <div className="glass-panel" style={{ padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'flex-end' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t('report.total_receipts', 'Total Receipts')}: {receipts.length}</span>
                </div>
            </div>

            {/* Master-Detail Layout */}
            <div style={{ display: 'flex', gap: '1rem', flex: 1, minHeight: 0 }}>
                {/* Left: Receipt Table */}
                <div className="glass-panel no-print" style={{
                    padding: '1rem',
                    flex: isMobile ? '1' : '0 0 55%',
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    overflow: 'hidden',
                }}>
                    {/* Toolbar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexShrink: 0 }}>
                        <div ref={exportRef} style={{ position: 'relative' }}>
                            <button onClick={() => setShowExportMenu(!showExportMenu)} style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Download size={14} /> {t('common.export', 'Export')}
                            </button>
                            {showExportMenu && (
                                <div style={{ position: 'absolute', left: 0, top: '100%', marginTop: '4px', background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 100, minWidth: '140px', overflow: 'hidden' }}>
                                    <button onClick={() => { setShowExportMenu(false); exportCSV(
                                        [{label:t('report.receipt_no', 'Receipt No'),value:'no'},{label:t('report.date', 'Date'),value:'date'},{label:t('report.employee', 'Employee'),value:'employee'},{label:t('report.customer', 'Customer'),value:'customer'},{label:t('report.type', 'Type'),value:'type'},{label:t('report.total', 'Total'),value:(r)=>r.total}],
                                        receipts, [], `receipts_${dateRange.start}_${dateRange.end}.csv`
                                    )}} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left' }}
                                        onMouseEnter={e=>e.target.style.background='rgba(255,255,255,0.05)'} onMouseLeave={e=>e.target.style.background='transparent'}>
                                        <FileSpreadsheet size={16} color="#4ade80" /> CSV
                                    </button>
                                    <button onClick={() => { setShowExportMenu(false); exportPDF(
                                        t('report.receipts_report', 'Receipts Report'),
                                        [{label:t('report.receipt_no', 'Receipt No'),value:'no'},{label:t('report.date', 'Date'),value:'date'},{label:t('report.employee', 'Employee'),value:'employee'},{label:t('report.customer', 'Customer'),value:'customer'},{label:t('report.type', 'Type'),value:'type'},{label:t('report.total', 'Total'),value:(r)=>r.total}],
                                        receipts, tenantConfig?.currency
                                    )}} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left' }}
                                        onMouseEnter={e=>e.target.style.background='rgba(255,255,255,0.05)'} onMouseLeave={e=>e.target.style.background='transparent'}>
                                        <FileText size={16} color="#f87171" /> PDF
                                    </button>
                                </div>
                            )}
                        </div>
                        <Search size={16} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
                    </div>

                    {/* Table */}
                    <div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
                        <table data-tour-id="receipts-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)', position: 'sticky', top: 0, background: 'var(--glass-bg)', zIndex: 1 }}>
                                    <th onClick={() => handleSort('no')} style={{ padding: '0.6rem 0.4rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, cursor: 'pointer', userSelect: 'none' }}>{t('report.receipt_no', 'Receipt No')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="no" /></th>
                                    <th onClick={() => handleSort('date')} style={{ padding: '0.6rem 0.4rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, cursor: 'pointer', userSelect: 'none' }}>{t('report.date', 'Date')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="date" /></th>
                                    <th onClick={() => handleSort('employee')} style={{ padding: '0.6rem 0.4rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, cursor: 'pointer', userSelect: 'none' }}>{t('report.employee', 'Employee')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="employee" /></th>
                                    <th onClick={() => handleSort('type')} style={{ padding: '0.6rem 0.4rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, cursor: 'pointer', userSelect: 'none' }}>{t('report.type', 'Type')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="type" /></th>
                                    <th onClick={() => handleSort('total')} style={{ padding: '0.6rem 0.4rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 500, cursor: 'pointer', userSelect: 'none' }}>{t('report.total', 'Total')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="total" /></th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagedData.map((r, idx) => {
                                    const isSelected = selectedReceipt && selectedReceipt._id === r._id;
                                    return (
                                        <tr
                                            key={idx}
                                            onClick={() => setSelectedReceipt(r.raw)}
                                            style={{
                                                borderBottom: '1px solid rgba(255,255,255,0.03)',
                                                cursor: 'pointer',
                                                background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                                                transition: 'background 0.15s',
                                            }}
                                            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--hover-bg)'; }}
                                            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            <td style={{ padding: '0.6rem 0.4rem', fontWeight: 600, color: 'var(--primary-light)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                    {isSelected && <div style={{ width: 3, height: 16, background: '#6366f1', borderRadius: 2 }} />}
                                                    {r.no}
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.6rem 0.4rem', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{r.date}</td>
                                            <td style={{ padding: '0.6rem 0.4rem', fontSize: '0.78rem' }}>{r.employee}</td>
                                            <td style={{ padding: '0.6rem 0.4rem' }}>
                                                <span style={{
                                                    background: r.status === 'returned' ? 'rgba(248, 113, 113, 0.15)' : 'rgba(74, 222, 128, 0.1)',
                                                    color: r.status === 'returned' ? '#f87171' : '#4ade80',
                                                    padding: '0.1rem 0.45rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 500,
                                                }}>{r.type}</span>
                                            </td>
                                            <td style={{ padding: '0.6rem 0.4rem', textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                {currency}{(r.total || 0).toLocaleString()}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {receipts.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>{t('common.no_data', 'No Data')}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                        <span>{t('common.page_info', { current: page, total: totalPages })}</span>
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                            <button onClick={() => setPage(page - 1)} disabled={page <= 1}
                                style={{ padding: '0.2rem 0.4rem', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: page <= 1 ? 'rgba(255,255,255,0.2)' : 'var(--text-muted)', cursor: page <= 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center' }}>
                                <ChevronLeft size={14} />
                            </button>
                            <button onClick={() => setPage(page + 1)} disabled={page >= totalPages}
                                style={{ padding: '0.2rem 0.4rem', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: page >= totalPages ? 'rgba(255,255,255,0.2)' : 'var(--text-muted)', cursor: page >= totalPages ? 'default' : 'pointer', display: 'flex', alignItems: 'center' }}>
                                <ChevronRight size={14} />
                            </button>
                        </div>
                        <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}
                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)', padding: '0.3rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>
                            <option value={10}>10 {t('common.rows', 'Rows')}</option>
                            <option value={25}>25 {t('common.rows', 'Rows')}</option>
                            <option value={50}>50 {t('common.rows', 'Rows')}</option>
                            <option value={100}>100 {t('common.rows', 'Rows')}</option>
                        </select>
                    </div>
                </div>

                {/* Right: Receipt Detail Panel (Desktop) — or Modal (Mobile) */}
                <div data-tour-id="receipts-detail">
                {!isMobile && (
                    <div className="glass-panel no-print" style={{
                        padding: '1rem',
                        flex: '1',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        minWidth: 0,
                    }}>
                        {selectedReceipt ? (
                            <ReceiptDetail
                                receipt={selectedReceipt}
                                currency={currency}
                                t={t}
                                onClose={() => setSelectedReceipt(null)}
                            />
                        ) : (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '0.75rem' }}>
                                <Hash size={40} opacity={0.3} />
                                <span style={{ fontSize: '0.9rem' }}>{t('report.select_receipt_hint', 'Select Receipt Hint')}</span>
                            </div>
                        )}
                    </div>
                )}
                </div>
            </div>

            {/* Mobile Modal for Detail */}
            {isMobile && selectedReceipt && (
                <div className="no-print" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 50, padding: '0.75rem',
                }}>
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{
                            background: 'var(--bg-surface)', border: '1px solid var(--glass-border)',
                            borderRadius: '16px', padding: '1rem', width: '100%', maxWidth: '480px',
                            maxHeight: '90vh', overflowY: 'auto', color: 'var(--text-main)',
                        }}
                    >
                        <ReceiptDetail
                            receipt={selectedReceipt}
                            currency={currency}
                            t={t}
                            onClose={() => setSelectedReceipt(null)}
                        />
                    </motion.div>
                </div>
            )}

            {/* Print-only area */}
            {selectedReceipt && (
                <div className="receipt-print-area" style={{ display: 'none', padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
                    <PrintReceipt receipt={selectedReceipt} currency={currency} t={t} />
                </div>
            )}
        </motion.div>

        <GuidedTour tourId="receiptsReport" steps={pageTours.receiptsReport(t)} />
        </>
    );
};

// ==================== Receipt Detail Component ====================

const ReceiptDetail = ({ receipt, currency, t, onClose }) => {
    const raw = receipt?.rawData || {};
    const rd = (key) => (raw[key] || '');

    // Extract all fields
    const receiptNumber = rv(receipt, 'receiptNumber', '收據號碼');
    const dateStr = rv(receipt, 'date', '日期');
    const employee = rv(receipt, 'employee', '收銀員名稱');
    const customer = rv(receipt, 'customer', '客戶名稱');
    const customerPhone = rd('客戶聯繫電話');
    const items = rv(receipt, 'items', '描述');
    const paymentType = rv(receipt, 'paymentType', '付款方式');
    const status = rv(receipt, 'status', '狀態');
    const receiptType = rd('收據類型');
    const grossSales = rd('銷售總額');
    const discountRaw = rd('折扣');
    const netSales = rd('淨銷售額');
    const taxRaw = rd('稅務');
    const totalCollected = rd('總收集');
    const costOfSales = rd('銷售成本');
    const grossProfit = rd('毛利潤');
    const orderType = rd('收據類型');
    const pos = rd('POS');
    const store = rd('商店');
    const totalAmount = rn(receipt, 'totalAmount');
    const discountAmount = rn(receipt, 'discountAmount');
    const taxAmount = rn(receipt, 'taxAmount');
    const netAmount = rn(receipt, 'netAmount');

    const handlePrint = () => {
        window.print();
    };

    const displayDate = dateStr ? (() => {
        try { return new Date(dateStr).toLocaleString(); } catch { return dateStr; }
    })() : '—';

    const isReturned = status === 'returned' || status === 'refund';

    const formatCurrency = (val) => `${currency}${Number(val).toLocaleString()}`;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
            {/* Top bar: Print + Close */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexShrink: 0 }}>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                    #{receiptNumber}
                </span>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                        onClick={handlePrint}
                        title={t('common.print', 'Print')}
                        style={{
                            background: 'var(--hover-bg-strong)', border: 'none', color: 'var(--text-muted)',
                            padding: '0.35rem', borderRadius: '6px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem',
                        }}
                    >
                        <Printer size={14} />
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            style={{
                                background: 'var(--hover-bg-strong)', border: 'none', color: 'var(--text-muted)',
                                padding: '0.35rem', borderRadius: '6px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center',
                            }}
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Receipt Paper Card */}
            <div style={{
                flex: 1, overflowY: 'auto',
                background: 'var(--glass)', border: '1px solid var(--glass-border)',
                borderRadius: '12px', padding: '1.25rem 1rem',
                fontFamily: '"SF Mono", "Fira Code", "Consolas", monospace',
                fontSize: '0.78rem', lineHeight: 1.7, color: 'var(--text-main)',
            }}>
                {/* --- Store Header --- */}
                <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>GR</div>
                    {store && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{store}</div>}
                </div>

                <div style={{ borderTop: '1px dashed var(--glass-border)', margin: '0.5rem 0' }} />

                {/* --- Info Rows --- */}
                <InfoRow icon={<Hash size={11} />} label={t('report.receipt_no', 'Receipt No')} value={`#${receiptNumber}`} />
                {receiptType && <InfoRow icon={<ShoppingBag size={11} />} label={t('report.type', 'Type')} value={receiptType} />}
                <InfoRow icon={<Calendar size={11} />} label={t('report.date', 'Date')} value={displayDate} />
                {employee && <InfoRow icon={<User size={11} />} label={t('report.employee', 'Employee')} value={employee} />}
                {customer && <InfoRow icon={<User size={11} />} label={t('report.customer', 'Customer')} value={customer} />}
                {customerPhone && <InfoRow icon={<MapPin size={11} />} label={t('report.phone', 'Phone')} value={customerPhone} />}
                {orderType && <InfoRow icon={<ShoppingBag size={11} />} label={t('report.order_type', 'Order Type')} value={orderType} />}
                {pos && <InfoRow icon={<Store size={11} />} label="POS" value={pos} />}

                <div style={{ borderTop: '1px dashed var(--glass-border)', margin: '0.5rem 0' }} />

                {/* --- Items --- */}
                {items && (
                    <>
                        <div style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem', fontSize: '0.75rem' }}>
                            {t('report.items', 'Items')}
                        </div>
                        <div style={{
                            background: 'var(--hover-bg)', borderRadius: '6px', padding: '0.5rem 0.6rem',
                            marginBottom: '0.5rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap', fontSize: '0.73rem',
                        }}>
                            {items}
                        </div>
                        <div style={{ borderTop: '1px dashed var(--glass-border)', margin: '0.5rem 0' }} />
                    </>
                )}

                {/* --- Financial Summary --- */}
                <AmountRow label={t('report.total_sales', 'Total Sales')} value={grossSales || formatCurrency(totalAmount)} bold />
                {(discountRaw && discountRaw !== '0.00') || discountAmount > 0 ? (
                    <AmountRow label={t('report.discount', 'Discount')} value={discountRaw || formatCurrency(discountAmount)} color="#f97316" />
                ) : null}
                <AmountRow label={t('report.net_sales', 'Net Sales')} value={netSales || formatCurrency(netAmount)} />
                {(taxRaw && taxRaw !== '0.00') || taxAmount > 0 ? (
                    <AmountRow label={t('report.tax', 'Tax')} value={taxRaw || formatCurrency(taxAmount)} />
                ) : null}
                {costOfSales && costOfSales !== '0.00' && (
                    <AmountRow label={t('report.cogs', 'Cogs')} value={costOfSales} color="var(--text-muted)" />
                )}
                {grossProfit && grossProfit !== '0.00' && (
                    <AmountRow label={t('report.gross_profit', 'Gross Profit')} value={grossProfit} color="#16a34a" />
                )}

                <div style={{ borderTop: '2px solid var(--glass-border)', margin: '0.5rem 0' }} />

                {/* --- Grand Total --- */}
                <AmountRow
                    label={t('report.total_collected', 'Total Collected')}
                    value={totalCollected || formatCurrency(netAmount)}
                    bold
                    large
                />

                <div style={{ borderTop: '1px dashed var(--glass-border)', margin: '0.5rem 0' }} />

                {/* --- Payment & Status --- */}
                {paymentType && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.15rem 0' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{t('report.payment_method', 'Payment Method')}</span>
                        <span style={{ color: 'var(--text-main)', fontWeight: 500, fontSize: '0.73rem' }}>
                            <CreditCard size={11} style={{ marginRight: 3, verticalAlign: 'middle' }} />
                            {paymentType}
                        </span>
                    </div>
                )}
                {status && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.15rem 0' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{t('report.status', 'Status')}</span>
                        <span style={{
                            padding: '0.1rem 0.5rem', borderRadius: '10px', fontSize: '0.68rem',
                            background: isReturned ? 'rgba(248,113,113,0.15)' : 'rgba(74,222,128,0.15)',
                            color: isReturned ? '#dc2626' : '#16a34a',
                            fontWeight: 600,
                        }}>
                            {status}
                        </span>
                    </div>
                )}

                <div style={{ borderTop: '1px dashed var(--glass-border)', margin: '0.75rem 0 0.5rem' }} />
                <div style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {t('report.receipt_footer', 'Receipt Footer')}
                </div>
            </div>
        </div>
    );
};

// ==================== Print-Only Receipt (White Background) ====================

const PrintReceipt = ({ receipt, currency, t }) => {
    const raw = receipt?.rawData || {};
    const rd = (key) => (raw[key] || '');

    const receiptNumber = rv(receipt, 'receiptNumber', '收據號碼');
    const dateStr = rv(receipt, 'date', '日期');
    const employee = rv(receipt, 'employee', '收銀員名稱');
    const customer = rv(receipt, 'customer', '客戶名稱');
    const items = rv(receipt, 'items', '描述');
    const paymentType = rv(receipt, 'paymentType', '付款方式');
    const status = rv(receipt, 'status', '狀態');
    const grossSales = rd('銷售總額');
    const discountRaw = rd('折扣');
    const netSales = rd('淨銷售額');
    const totalCollected = rd('總收集');
    const store = rd('商店');

    const displayDate = dateStr ? (() => {
        try { return new Date(dateStr).toLocaleString(); } catch { return dateStr; }
    })() : '—';

    return (
        <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#000', lineHeight: 1.6 }}>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 'bold', fontSize: 16 }}>GR</div>
                {store && <div style={{ fontSize: 11 }}>{store}</div>}
            </div>
            <hr style={{ border: 'none', borderTop: '1px dashed #999' }} />
            <div><strong>收據號碼:</strong> #{receiptNumber}</div>
            <div><strong>日期:</strong> {displayDate}</div>
            {employee && <div><strong>員工:</strong> {employee}</div>}
            {customer && <div><strong>客戶:</strong> {customer}</div>}
            <hr style={{ border: 'none', borderTop: '1px dashed #999' }} />
            {items && (
                <>
                    <div><strong>商品:</strong></div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{items}</div>
                    <hr style={{ border: 'none', borderTop: '1px dashed #999' }} />
                </>
            )}
            {grossSales && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>銷售總額:</span><span><strong>{grossSales}</strong></span></div>}
            {discountRaw && discountRaw !== '0.00' && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>折扣:</span><span>{discountRaw}</span></div>}
            {netSales && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>淨銷售額:</span><span>{netSales}</span></div>}
            <hr style={{ border: 'none', borderTop: '2px solid #000' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 16 }}>
                <span>總收集:</span><span>{totalCollected || `${currency}${(receipt?.netAmount || 0).toLocaleString()}`}</span>
            </div>
            <hr style={{ border: 'none', borderTop: '1px dashed #999' }} />
            {paymentType && <div><strong>付款方式:</strong> {paymentType}</div>}
            {status && <div><strong>狀態:</strong> {status}</div>}
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11 }}>感謝您的惠顧</div>
        </div>
    );
};

// ==================== Shared Sub-Components ====================

const InfoRow = ({ icon, label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.15rem 0' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {icon} {label}
        </span>
        <span style={{ color: 'var(--text-main)', fontWeight: 500, fontSize: '0.73rem', textAlign: 'right', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value || '—'}</span>
    </div>
);

const AmountRow = ({ label, value, bold, color, large }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.15rem 0' }}>
        <span style={{
            color: color || 'var(--text-muted)',
            fontWeight: bold ? 600 : 400,
            fontSize: large ? '0.9rem' : '0.72rem',
        }}>{label}</span>
        <span style={{
            color: color || 'var(--text-main)',
            fontWeight: bold ? 700 : 500,
            fontSize: large ? '1rem' : '0.78rem',
        }}>{value}</span>
    </div>
);


export default ReceiptsReport;
