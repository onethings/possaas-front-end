import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
    Database,
    Link2,
    Unlink,
    Download,
    RefreshCw,
    Loader,
    CheckCircle2,
    XCircle,
    Clock,
    ChevronDown,
    ChevronUp,
    Package,
    Users,
    Percent,
    Sliders,
    Truck,
    Receipt,
    ListTree,
    AlertCircle,
    Shield,
    Upload,
    CheckSquare,
    HelpCircle,
    Loader2
} from 'lucide-react';
import {
    getLoyverseToken,
    saveLoyverseToken,
    disconnectLoyverse,
    importLoyverseCategories,
    importLoyverseItems,
    importLoyverseCustomers,
    importLoyverseDiscounts,
    importLoyverseModifiers,
    importLoyverseSuppliers,
    importLoyverseReceipts,
    importLoyverseInventory,
    importAllLoyverse,
    fixLoyverseOrderDates,
    reimportLoyverseReceipts,
    getLoyverseTaskStatus,
    importLoyverseCsv,
    convertCsvReceipts
} from '../../api/loyverse';

const LoyversePage = () => {
    const { t } = useTranslation();
    const [loyverseToken, setLoyverseToken] = useState('');
    const [loyverseConnected, setLoyverseConnected] = useState(false);
    const [loyverseLoading, setLoyverseLoading] = useState(false);
    const [loyverseImporting, setLoyverseImporting] = useState(null);
    const [loyverseImportLogs, setLoyverseImportLogs] = useState([]);
    const [loyverseLogsExpanded, setLoyverseLogsExpanded] = useState(false);
    const [loyverseMessage, setLoyverseMessage] = useState(null);
    const [showGuide, setShowGuide] = useState(true);

    useEffect(() => {
        checkLoyverse();
    }, []);

    const checkLoyverse = async () => {
        try {
            const res = await getLoyverseToken();
            if (res.success) {
                setLoyverseConnected(res.data.hasToken);
                setLoyverseImportLogs(res.data.importLogs || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveLoyverseToken = async () => {
        if (!loyverseToken.trim()) return;
        setLoyverseLoading(true);
        setLoyverseMessage(null);
        try {
            const res = await saveLoyverseToken(loyverseToken.trim());
            if (res.success) {
                setLoyverseConnected(true);
                setLoyverseMessage({ type: 'success', text: t('loyverse.connect_success', 'Loyverse Connected\!') });
                await checkLoyverse();
            }
        } catch (err) {
            setLoyverseMessage({ type: 'error', text: '連線失敗：' + (err.response?.data?.error || err.message) });
        } finally {
            setLoyverseLoading(false);
        }
    };

    const handleDisconnectLoyverse = async () => {
        if (!window.confirm('確定要斷開 Loyverse 連線嗎？')) return;
        try {
            const res = await disconnectLoyverse();
            if (res.success) {
                setLoyverseConnected(false);
                setLoyverseToken('');
                setLoyverseImportLogs([]);
                setLoyverseMessage({ type: 'success', text: '已斷開 Loyverse 連線' });
            }
        } catch (err) {
            setLoyverseMessage({ type: 'error', text: '斷開失敗：' + (err.response?.data?.error || err.message) });
        }
    };

    const runImport = async (importFn, label) => {
        setLoyverseImporting(label);
        setLoyverseMessage(null);
        try {
            const res = await importFn();
            if (!res.success) {
                setLoyverseMessage({ type: 'error', text: `${label} 匯入失敗：` + (res.error || 'Unknown error') });
                setLoyverseImporting(null);
                return;
            }

            // If the response has a taskId, it's an async background task — poll for completion
            if (res.taskId) {
                setLoyverseMessage({ type: 'info', text: `${label} 背景匯入中，請稍候...` });
                let attempts = 0;
                const maxAttempts = 120; // 2 minutes max
                const poll = async () => {
                    try {
                        const status = await getLoyverseTaskStatus(res.taskId);
                        if (status.success && status.data) {
                            if (status.data.status === 'completed') {
                                const result = status.data.result;
                                let msg;
                                if (result) {
                                    msg = Object.entries(result).map(([k, v]) => {
                                        if (v.error) return `${k}: ❌ ${v.error}`;
                                        return `${k}: ${v.imported ?? 0}/${v.total ?? 0}`;
                                    }).join(' | ');
                                } else {
                                    msg = '完成';
                                }
                                setLoyverseMessage({ type: 'success', text: `${label} 匯入完成！${msg}` });
                                setLoyverseImporting(null);
                                await checkLoyverse();
                                return;
                            } else if (status.data.status === 'failed') {
                                setLoyverseMessage({ type: 'error', text: `${label} 匯入失敗：${status.data.error || 'Unknown error'}` });
                                setLoyverseImporting(null);
                                return;
                            } else {
                                // Still running — update progress
                                if (status.data.progress) {
                                    setLoyverseMessage({ type: 'info', text: `${label} ${status.data.progress}` });
                                }
                                attempts++;
                                if (attempts < maxAttempts) {
                                    setTimeout(poll, 1000);
                                } else {
                                    setLoyverseMessage({ type: 'info', text: `${label} 仍在背景執行中，請稍後重整頁面查看結果` });
                                    setLoyverseImporting(null);
                                }
                            }
                        }
                    } catch (pollErr) {
                        attempts++;
                        if (attempts < maxAttempts) {
                            setTimeout(poll, 1000);
                        } else {
                            setLoyverseMessage({ type: 'info', text: `${label} 已在背景啟動，請稍後重整頁面` });
                            setLoyverseImporting(null);
                        }
                    }
                };
                poll();
            } else {
                // Synchronous result
                let msg;
                if (res.results) {
                    msg = Object.entries(res.results).map(([k, v]) => {
                        if (v.error) return `${k}: ❌ ${v.error}`;
                        return `${k}: ${v.imported ?? 0}/${v.total ?? 0}`;
                    }).join(' | ');
                } else {
                    msg = `已匯入 ${res.imported || 0} 筆`;
                }
                setLoyverseMessage({ type: 'success', text: `${label} 匯入完成！${msg}` });
                setLoyverseImporting(null);
                await checkLoyverse();
            }
        } catch (err) {
            setLoyverseMessage({ type: 'error', text: `${label} 匯入失敗：` + (err.response?.data?.error || err.message) });
            setLoyverseImporting(null);
        }
    };

    const importButtons = [
        { label: '分類 Categories', icon: ListTree, action: () => runImport(importLoyverseCategories, t('loyverse.categories', 'Categories')), color: 'var(--blue-500)' },
        { label: '商品 Items', icon: Package, action: () => runImport(importLoyverseItems, t('loyverse.products', 'Products')), color: 'var(--green-500)' },
        { label: '庫存 Inventory', icon: Package, action: () => runImport(importLoyverseInventory, '庫存'), color: 'var(--teal-500)' },
        { label: '客戶 Customers', icon: Users, action: () => runImport(importLoyverseCustomers, t('loyverse.customers', 'Customers')), color: 'var(--yellow-500)' },
        { label: '折扣 Discounts', icon: Percent, action: () => runImport(importLoyverseDiscounts, '折扣'), color: 'var(--purple-500)' },
        { label: '自訂選項 Modifiers', icon: Sliders, action: () => runImport(importLoyverseModifiers, '自訂選項'), color: 'var(--pink-500)' },
        { label: t('loyverse.suppliers', 'Suppliers'), icon: Truck, action: () => runImport(importLoyverseSuppliers, t('loyverse.suppliers', 'Suppliers')), color: 'var(--orange-500)' },
        { label: '訂單/收據 Receipts', icon: Receipt, action: () => runImport(importLoyverseReceipts, '訂單'), color: 'var(--red-500)' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                padding: '1.5rem',
                height: '100%',
                overflow: 'auto'
            }}
        >
            {/* Interactive Guide */}
            <div className="glass-panel" style={{
                padding: '1.25rem',
                border: '1px solid rgba(99,102,241,0.2)',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(6,182,212,0.04))'
            }}>
                <div
                    onClick={() => setShowGuide(!showGuide)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                        <HelpCircle size={18} style={{ color: 'var(--primary-light)' }} />
                        導入引導教學
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>點擊展開/收合</span>
                    </div>
                    {showGuide ? <ChevronUp size={18} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />}
                </div>

                {showGuide && (
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {[
                            {
                                step: 1,
                                title: '取得 Loyverse 存取憑證',
                                desc: '登入 Loyverse 後台 → 設定 → 整合 → Personal Access Token → 複製 Token',
                                done: false,
                                action: t('loyverse.go_to_loyverse', 'Go to Loyverse Back Office')
                            },
                            {
                                step: 2,
                                title: '連線到 Loyverse',
                                desc: '將 Token 貼到下方的輸入框中，點擊「連線」按鈕',
                                done: loyverseConnected,
                                action: null
                            },
                            {
                                step: 3,
                                title: t('loyverse.one_click_import', 'One-Click Import Products & Customers'),
                                desc: '點擊「一鍵匯入所有資料」，自動匯入分類、商品、庫存、客戶、折扣等',
                                done: loyverseImportLogs.some(log => log.type === 'items' && log.status === 'success'),
                                action: '開始匯入'
                            },
                            {
                                step: 4,
                                title: '匯入訂單/收據',
                                desc: '將 Loyverse 的銷售訂單匯入本系統（需訂閱 Unlimited Sales History）',
                                done: loyverseImportLogs.some(log => log.type === 'receipts' && log.status === 'success' && log.importedCount > 0),
                                action: '匯入訂單'
                            },
                            {
                                step: 5,
                                title: t('loyverse.upload_sales_csv', 'Upload Sales Report CSV'),
                                desc: '從 Loyverse 後台匯出銷售摘要 CSV，使用下方「手動匯入報告報表 CSV」上傳',
                                done: loyverseImportLogs.length > 0,
                                action: t('loyverse.upload_csv', 'Upload CSV')
                            },
                            {
                                step: 6,
                                title: '檢視報告報表',
                                desc: t('loyverse.go_to_reports_desc', 'View sales summary, product sales, category sales analysis in the Reports section'),
                                done: false,
                                action: t('loyverse.go_to_reports', 'Go to Reports')
                            }
                        ].map(item => {
                            const isDone = item.done;
                            return (
                                <div key={item.step} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: isDone ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${isDone ? 'rgba(34,197,94,0.15)' : 'var(--glass-border)'}`,
                                    opacity: isDone ? 0.7 : 1
                                }}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: isDone ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.15)',
                                        color: isDone ? '#22c55e' : 'var(--primary-light)',
                                        fontSize: '0.8rem', fontWeight: 700, flexShrink: 0
                                    }}>
                                        {isDone ? <CheckCircle2 size={16} /> : item.step}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: '0.9rem', fontWeight: 600,
                                            color: isDone ? 'var(--text-muted)' : 'var(--text-main)',
                                            textDecoration: isDone ? 'line-through' : 'none'
                                        }}>
                                            {item.title}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                            {item.desc}
                                        </div>
                                    </div>
                                    {item.action && !isDone && (
                                        <span style={{
                                            fontSize: '0.75rem', color: 'var(--primary-light)',
                                            whiteSpace: 'nowrap', flexShrink: 0, marginTop: '0.1rem'
                                        }}>
                                            {item.action} →
                                        </span>
                                    )}
                                    {isDone && (
                                        <span style={{
                                            fontSize: '0.75rem', color: '#22c55e',
                                            whiteSpace: 'nowrap', flexShrink: 0, marginTop: '0.1rem'
                                        }}>
                                            已完成 ✓
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Header */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <Database size={24} style={{ color: 'var(--primary-light)' }} />
                    <div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Loyverse API 整合</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            透過 Loyverse Personal Access Token 一鍵導入您的商品、客戶、訂單等資料
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{
                        fontSize: '0.75rem',
                        background: 'rgba(6, 182, 212, 0.15)',
                        color: 'rgb(34, 211, 238)',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '999px',
                        fontFamily: 'monospace'
                    }}>
                        https://api.loyverse.com/v1.0
                    </span>
                </div>

                {/* Token Input / Connected Status */}
                {!loyverseConnected ? (
                    <div style={{
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1.25rem',
                        border: '1px solid var(--glass-border)'
                    }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                            貼上 Loyverse Personal Access Token
                        </label>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <input
                                type="password"
                                value={loyverseToken}
                                onChange={e => setLoyverseToken(e.target.value)}
                                placeholder="貼上您的 Loyverse Personal Access Token..."
                                style={{
                                    flex: 1,
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '0.65rem 1rem',
                                    fontSize: '0.85rem',
                                    fontFamily: 'monospace',
                                    color: 'var(--text-main)',
                                    outline: 'none'
                                }}
                                onFocus={e => e.target.style.borderColor = 'var(--primary-light)'}
                                onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
                            />
                            <button
                                onClick={handleSaveLoyverseToken}
                                disabled={loyverseLoading || !loyverseToken.trim()}
                                className="btn-primary"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.25rem', opacity: loyverseLoading || !loyverseToken.trim() ? 0.5 : 1 }}
                            >
                                {loyverseLoading ? <Loader size={16} className="spin" /> : <Link2 size={16} />}
                                連線
                            </button>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            可在 Loyverse 後台 &gt; 整合 &gt; Personal Access Token 頁面取得
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Connected Status */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.2)',
                            borderRadius: 'var(--radius-md)',
                            padding: '1rem 1.25rem',
                            marginBottom: '1.25rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.5)' }} />
                                <div>
                                    <span style={{ color: '#22c55e', fontWeight: 600, fontSize: '0.9rem' }}>Loyverse 已連線</span>
                                    {loyverseImportLogs.length > 0 && (
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                            最後匯入：{new Date(loyverseImportLogs[0].importedAt).toLocaleString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={handleDisconnectLoyverse}
                                style={{
                                    fontSize: '0.8rem',
                                    color: 'var(--text-muted)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem'
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                            >
                                <Unlink size={14} /> 斷開連線
                            </button>
                        </div>

                        {/* Status Message */}
                        {loyverseMessage && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.85rem',
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '1.25rem',
                                background: loyverseMessage.type === 'success' ? 'rgba(34,197,94,0.1)' : loyverseMessage.type === 'info' ? 'rgba(6,182,212,0.1)' : 'rgba(239,68,68,0.1)',
                                border: `1px solid ${loyverseMessage.type === 'success' ? 'rgba(34,197,94,0.2)' : loyverseMessage.type === 'info' ? 'rgba(6,182,212,0.2)' : 'rgba(239,68,68,0.2)'}`,
                                color: loyverseMessage.type === 'success' ? '#22c55e' : loyverseMessage.type === 'info' ? '#06b6d4' : '#ef4444'
                            }}>
                                {loyverseMessage.type === 'success' ? <CheckCircle2 size={16} /> : loyverseMessage.type === 'info' ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <XCircle size={16} />}
                                {loyverseMessage.text}
                            </div>
                        )}

                        {/* Import Buttons */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Download size={16} style={{ color: 'var(--primary-light)' }} />
                                    各類資料一鍵匯入
                                </h4>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={async () => {
                                        setLoyverseImporting('fix-dates');
                                        setLoyverseMessage(null);
                                        try {
                                            const res = await fixLoyverseOrderDates();
                                            if (res.success) {
                                                setLoyverseMessage({ type: 'success', text: `已修復 ${res.fixed} 筆訂單日期，並重新彙整 ${res.reportDates?.length || 0} 天的報表` });
                                                await checkLoyverse();
                                            }
                                        } catch (err) {
                                            setLoyverseMessage({ type: 'error', text: t('loyverse.fix_failed', 'Repair Failed: ') + (err.response?.data?.error || err.message) });
                                        } finally {
                                            setLoyverseImporting(null);
                                        }
                                    }}
                                    disabled={loyverseImporting !== null}
                                    style={{
                                        fontSize: '0.8rem',
                                        padding: '0.4rem 1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: 'var(--radius-md)',
                                        color: 'var(--text-muted)',
                                        cursor: loyverseImporting !== null ? 'not-allowed' : 'pointer',
                                        opacity: loyverseImporting !== null ? 0.5 : 1
                                    }}
                                >
                                    {loyverseImporting === 'fix-dates' ? <Loader size={14} className="spin" /> : <RefreshCw size={14} />}
                                    修復訂單日期
                                </button>
                                <button
                                    onClick={async () => {
                                        setLoyverseImporting('reimport');
                                        setLoyverseMessage(null);
                                        try {
                                            const res = await reimportLoyverseReceipts();
                                            if (res.success) {
                                                setLoyverseMessage({ type: 'success', text: `已刪除 ${res.deleted} 筆舊訂單，重新匯入 ${res.imported} 筆新訂單` });
                                                await checkLoyverse();
                                            }
                                        } catch (err) {
                                            setLoyverseMessage({ type: 'error', text: '重新匯入失敗：' + (err.response?.data?.error || err.message) });
                                        } finally {
                                            setLoyverseImporting(null);
                                        }
                                    }}
                                    disabled={loyverseImporting !== null}
                                    style={{
                                        fontSize: '0.8rem',
                                        padding: '0.4rem 1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        background: 'rgba(239,68,68,0.15)',
                                        border: '1px solid rgba(239,68,68,0.3)',
                                        borderRadius: 'var(--radius-md)',
                                        color: '#ef4444',
                                        cursor: loyverseImporting !== null ? 'not-allowed' : 'pointer',
                                        opacity: loyverseImporting !== null ? 0.5 : 1
                                    }}
                                >
                                    {loyverseImporting === 'reimport' ? <Loader size={14} className="spin" /> : <RefreshCw size={14} />}
                                    重新匯入訂單
                                </button>
                                <button
                                    onClick={() => runImport(importAllLoyverse, t('loyverse.all_data', 'All Data'))}
                                    disabled={loyverseImporting !== null}
                                    className="btn-primary"
                                    style={{
                                        fontSize: '0.8rem',
                                        padding: '0.4rem 1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        opacity: loyverseImporting !== null ? 0.5 : 1
                                    }}
                                >
                                    {loyverseImporting === t('loyverse.all_data', 'All Data') ? (
                                        <Loader size={14} className="spin" />
                                    ) : (
                                        <RefreshCw size={14} />
                                    )}
                                    一鍵匯入所有資料
                                </button>
                            </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                gap: '0.65rem'
                            }}>
                                {importButtons.map(btn => (
                                    <button
                                        key={btn.label}
                                        onClick={btn.action}
                                        disabled={loyverseImporting !== null}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.35rem',
                                            padding: '0.85rem 1rem',
                                            borderRadius: 'var(--radius-md)',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid var(--glass-border)',
                                            borderLeft: `3px solid ${btn.color}`,
                                            cursor: loyverseImporting !== null ? 'not-allowed' : 'pointer',
                                            opacity: loyverseImporting !== null && loyverseImporting !== btn.label.split(' ')[0] ? 0.5 : 1,
                                            textAlign: 'left',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={e => {
                                            if (loyverseImporting === null) {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                            }
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <btn.icon size={16} style={{ color: 'var(--text-muted)' }} />
                                            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{btn.label}</span>
                                        </div>
                                        {loyverseImporting === btn.label.split(' ')[0] ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--primary-light)' }}>
                                                <Loader size={12} className="spin" />
                                                匯入中...
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>點擊匯入</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Import Logs */}
                        {loyverseImportLogs.length > 0 && (
                            <div style={{
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--glass-border)',
                                overflow: 'hidden'
                            }}>
                                <button
                                    onClick={() => setLoyverseLogsExpanded(!loyverseLogsExpanded)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.75rem 1rem',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Clock size={14} />
                                        匯入記錄 ({loyverseImportLogs.length})
                                    </span>
                                    {loyverseLogsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                {loyverseLogsExpanded && (
                                    <div style={{ borderTop: '1px solid var(--glass-border)', maxHeight: '16rem', overflowY: 'auto' }}>
                                        {loyverseImportLogs.map((log, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '0.6rem 1rem',
                                                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                                                    fontSize: '0.8rem'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    {log.status === 'success' ? (
                                                        <CheckCircle2 size={12} style={{ color: '#22c55e' }} />
                                                    ) : log.status === 'failed' ? (
                                                        <XCircle size={12} style={{ color: '#ef4444' }} />
                                                    ) : (
                                                        <AlertCircle size={12} style={{ color: '#eab308' }} />
                                                    )}
                                                    <span style={{ color: 'var(--text-main)' }}>{log.type}</span>
                                                    <span style={{ color: 'var(--text-muted)' }}>{log.importedCount}/{log.totalCount}</span>
                                                </div>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                                    {new Date(log.importedAt).toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* CSV Manual Import */}
            <div className="glass-panel" style={{
                padding: '1.25rem',
                border: '1px solid var(--glass-border)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 700 }}>
                    <Upload size={18} style={{ color: 'var(--primary-light)' }} />
                    手動匯入報告報表 CSV
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    從 Loyverse 後台匯出 CSV 報告檔，手動上傳至本系統
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.65rem' }}>
                    {[
                        { label: '銷售摘要', key: 'sales_summary', ref: React.createRef() },
                        { label: '按商品銷售', key: 'item_sales', ref: React.createRef() },
                        { label: '按分類銷售', key: 'category_sales', ref: React.createRef() },
                        { label: '按員工銷售', key: 'employee_sales', ref: React.createRef() },
                        { label: '小票收據', key: 'receipts', ref: React.createRef() },
                        { label: '按加料/自訂項銷售', key: 'modifier_sales', ref: React.createRef() },
                        { label: '折扣報告', key: 'discount', ref: React.createRef() },
                        { label: '稅務報告', key: 'tax', ref: React.createRef() },
                        { label: '交接班', key: 'shift', ref: React.createRef() }
                    ].map(item => (
                        <React.Fragment key={item.key}>
                            <button
                                onClick={() => document.getElementById(`csv-${item.key}`).click()}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid var(--glass-border)',
                                    cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                            >
                                <Upload size={16} style={{ color: 'var(--text-muted)' }} />
                                <span>{item.label}</span>
                                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--primary-light)' }}>匯入</span>
                            </button>
                            <input
                                id={`csv-${item.key}`}
                                type="file"
                                accept=".csv"
                                style={{ display: 'none' }}
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setLoyverseImporting(item.key);
                                    setLoyverseMessage({ type: 'info', text: `正在匯入 ${item.label}...` });
                                    try {
                                        const res = await importLoyverseCsv(file);
                                        if (res.success) {
                                            setLoyverseMessage({ type: 'success', text: `${item.label} CSV 匯入完成！${res.imported} 筆` });
                                            await checkLoyverse();
                                        } else {
                                            setLoyverseMessage({ type: 'error', text: `${item.label} 匯入失敗：${res.error}` });
                                        }
                                    } catch (err) {
                                        setLoyverseMessage({ type: 'error', text: `${item.label} 匯入失敗：${err.response?.data?.error || err.message}` });
                                    }
                                    setLoyverseImporting(null);
                                    e.target.value = '';
                                }}
                            />
                        </React.Fragment>
                    ))}
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={async () => {
                            setLoyverseImporting('convert-receipts');
                            setLoyverseMessage({ type: 'info', text: '正在轉換現有 CSV 收據資料為訂單...' });
                            try {
                                const res = await convertCsvReceipts();
                                if (res.success) {
                                    setLoyverseMessage({ type: 'success', text: `CSV 收據轉換完成！${res.converted} 筆已轉換，${res.skipped} 筆略過` });
                                } else {
                                    setLoyverseMessage({ type: 'error', text: `轉換失敗：${res.error}` });
                                }
                            } catch (err) {
                                setLoyverseMessage({ type: 'error', text: `轉換失敗：${err.response?.data?.error || err.message}` });
                            }
                            setLoyverseImporting(null);
                        }}
                        disabled={loyverseImporting === 'convert-receipts'}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)',
                            background: 'rgba(251,191,36,0.1)',
                            border: '1px solid rgba(251,191,36,0.25)',
                            cursor: 'pointer', fontSize: '0.8rem',
                            transition: 'all 0.2s',
                            opacity: loyverseImporting === 'convert-receipts' ? 0.6 : 1
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(251,191,36,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(251,191,36,0.1)'}
                    >
                        {loyverseImporting === 'convert-receipts' ? (
                            <><Loader2 className="animate-spin" size={16} /> 轉換中...</>
                        ) : (
                            <><RefreshCw size={16} /> 修復現有 CSV 收據 → 訂單</>
                        )}
                    </button>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ⚠️ 如之前已匯入小票收據 CSV 但未顯示在訂單頁，點此修復
                    </span>
                </div>
            </div>

            {/* Security Note */}
            <div className="glass-panel" style={{
                padding: '1.25rem',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.08), transparent)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontWeight: 700 }}>
                    <Shield size={18} style={{ color: 'var(--primary-light)' }} />
                    安全須知
                </div>
                <ul style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1rem' }}>
                    <li>Personal Access Token 具備 Loyverse 帳戶的完全訪問權限，請勿分享給第三方。</li>
                    <li>Token 僅儲存在您的帳戶設定中，傳輸過程使用 HTTPS 加密。</li>
                    <li>匯入操作僅新增資料，不會修改或刪除您原有的 Loyverse 資料。</li>
                </ul>
            </div>
        </motion.div>
    );
};

export default LoyversePage;
