import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GuidedTour from '../components/GuidedTour';
import { pageTours } from '../utils/pageTours';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Key, 
    Plus, 
    Trash2, 
    Copy, 
    Check, 
    Shield, 
    ExternalLink, 
    Code, 
    Terminal,
    AlertCircle,
    ShoppingBag,
    Globe,
    Database,
    Download,
    Link2,
    Unlink,
    RefreshCw,
    Clock,
    ChevronDown,
    ChevronUp,
    Loader,
    CheckCircle2,
    XCircle,
    Package,
    Users,
    Percent,
    Sliders,
    Truck,
    Receipt,
    ListTree
} from 'lucide-react';
import { getApiKeys, createApiKey, deleteApiKey } from '../api/developer';
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
    importAllLoyverse
} from '../api/loyverse';

const DeveloperSettings = () => {
    const { t } = useTranslation();
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [generatedKey, setGeneratedKey] = useState(null);
    const [copied, setCopied] = useState(false);

    // Loyverse state
    const [loyverseToken, setLoyverseToken] = useState('');
    const [loyverseConnected, setLoyverseConnected] = useState(false);
    const [loyverseLoading, setLoyverseLoading] = useState(false);
    const [loyverseImporting, setLoyverseImporting] = useState(null); // which import is running
    const [loyverseImportLogs, setLoyverseImportLogs] = useState([]);
    const [loyverseLogsExpanded, setLoyverseLogsExpanded] = useState(false);
    const [loyverseMessage, setLoyverseMessage] = useState(null);

    useEffect(() => {
        fetchKeys();
        checkLoyverse();
    }, []);

    // Loyverse functions
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
                setLoyverseMessage({ type: 'success', text: 'Loyverse 連線成功！' });
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
            if (res.success) {
                const msg = res.results
                    ? Object.entries(res.results).map(([k, v]) => `${k}: ${v.imported}/${v.total}`).join(' | ')
                    : `已匯入 ${res.imported || 0} 筆`;
                setLoyverseMessage({ type: 'success', text: `${label} 匯入完成！${msg}` });
                await checkLoyverse();
            }
        } catch (err) {
            setLoyverseMessage({ type: 'error', text: `${label} 匯入失敗：` + (err.response?.data?.error || err.message) });
        } finally {
            setLoyverseImporting(null);
        }
    };

    const importButtons = [
        { label: '分類 Categories', icon: ListTree, action: () => runImport(importLoyverseCategories, '分類'), color: 'border-l-blue-500' },
        { label: '商品 Items', icon: Package, action: () => runImport(importLoyverseItems, '商品'), color: 'border-l-green-500' },
        { label: '客戶 Customers', icon: Users, action: () => runImport(importLoyverseCustomers, '客戶'), color: 'border-l-yellow-500' },
        { label: '折扣 Discounts', icon: Percent, action: () => runImport(importLoyverseDiscounts, '折扣'), color: 'border-l-purple-500' },
        { label: '自訂選項 Modifiers', icon: Sliders, action: () => runImport(importLoyverseModifiers, '自訂選項'), color: 'border-l-pink-500' },
        { label: '供應商 Suppliers', icon: Truck, action: () => runImport(importLoyverseSuppliers, '供應商'), color: 'border-l-orange-500' },
        { label: '訂單/收據 Receipts', icon: Receipt, action: () => runImport(importLoyverseReceipts, '訂單'), color: 'border-l-red-500' },
    ];

    const fetchKeys = async () => {
        setLoading(true);
        try {
            const res = await getApiKeys();
            if (res.success) setKeys(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateKey = async (e) => {
        e.preventDefault();
        try {
            const res = await createApiKey(newKeyName);
            if (res.success) {
                setGeneratedKey(res.data.key);
                setNewKeyName('');
                fetchKeys();
            }
        } catch (err) {
            alert('生成失敗');
        }
    };

    const handleDeleteKey = async (id) => {
        if (!window.confirm('確定要撤銷此 API Key 嗎？這將立即中斷所有使用此 Key 的整合。')) return;
        try {
            const res = await deleteApiKey(id);
            if (res.success) fetchKeys();
        } catch (err) {
            alert('刪除失敗');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (<>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-6xl mx-auto"
        >
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">API 與整合平台</h1>
                    <p className="text-gray-400">管理授權碼並串接 Shopify、WooCommerce 等外部系統</p>
                </div>
                <button 
                    onClick={() => { setIsModalOpen(true); setGeneratedKey(null); }}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} /> 生成新授權碼
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Keys List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel p-6">
                        <div className="flex items-center gap-2 mb-6 text-xl font-semibold">
                            <Key className="text-primary-light" />
                            有效中的 API Keys
                        </div>

                        {loading ? (
                            <div className="flex justify-center p-12">
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                                    <Key className="text-gray-500" />
                                </motion.div>
                            </div>
                        ) : keys.length === 0 ? (
                            <div className="text-center p-12 bg-white/5 rounded-xl border border-dashed border-white/10">
                                <p className="text-gray-500 mb-4">尚未生成任何 API Key</p>
                                <button onClick={() => setIsModalOpen(true)} className="text-primary-light hover:underline">現在生成一個</button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {keys.map(key => (
                                    <div key={key._id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all">
                                        <div>
                                            <div className="font-semibold text-lg">{key.name}</div>
                                            <div className="text-sm text-gray-500 flex gap-4 mt-1">
                                                <span>建立於: {new Date(key.createdAt).toLocaleDateString()}</span>
                                                {key.lastUsed && (
                                                    <span className="text-green-400">最後使用: {new Date(key.lastUsed).toLocaleDateString()}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => copyToClipboard(key.key)}
                                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
                                                title="複製 Key"
                                            >
                                                <Copy size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteKey(key._id)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400"
                                                title="撤銷授權"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Integration Guides Area */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-panel p-6 border-l-4 border-l-blue-500">
                            <div className="flex items-center gap-3 mb-4">
                                <ShoppingBag className="text-blue-400" />
                                <h3 className="font-bold">Shopify 對接</h3>
                            </div>
                            <p className="text-sm text-gray-400 mb-4">使用我們的 Custom App 或 Webhooks 將訂單自動同步至 Super POS。</p>
                            <button className="text-xs text-blue-400 hover:underline flex items-center gap-1">查看配置文檔 <ExternalLink size={12} /></button>
                        </div>
                        <div className="glass-panel p-6 border-l-4 border-l-purple-500">
                            <div className="flex items-center gap-3 mb-4">
                                <Globe className="text-purple-400" />
                                <h3 className="font-bold">WooCommerce</h3>
                            </div>
                            <p className="text-sm text-gray-400 mb-4">透過 WooCommerce REST API 與此授權碼實現雙向庫存同步。</p>
                            <button className="text-xs text-purple-400 hover:underline flex items-center gap-1">下載插件套件 <ExternalLink size={12} /></button>
                        </div>
                    </div>

                    {/* Loyverse Integration */}
                    <div className="glass-panel p-6 border-l-4 border-l-cyan-500">
                        <div className="flex items-center gap-3 mb-4">
                            <Database className="text-cyan-400" />
                            <h3 className="font-bold text-lg">Loyverse API 整合</h3>
                            <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full">v1.0</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">
                            透過 Loyverse Personal Access Token 一鍵導入您的商品、客戶、訂單等資料。API 端點：<code className="text-cyan-300 bg-black/30 px-1.5 py-0.5 rounded text-xs">https://api.loyverse.com/v1.0</code>
                        </p>

                        {/* Token Input */}
                        {!loyverseConnected ? (
                            <div className="bg-black/30 rounded-xl p-5 border border-white/5">
                                <label className="block text-sm font-medium mb-2 text-gray-300">
                                    貼上 Loyverse Personal Access Token
                                </label>
                                <div className="flex gap-3">
                                    <input
                                        type="password"
                                        value={loyverseToken}
                                        onChange={e => setLoyverseToken(e.target.value)}
                                        placeholder="貼上您的 Loyverse Personal Access Token..."
                                        className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono text-gray-200 placeholder-gray-600 focus:border-cyan-500/50 focus:outline-none"
                                    />
                                    <button
                                        onClick={handleSaveLoyverseToken}
                                        disabled={loyverseLoading || !loyverseToken.trim()}
                                        className="btn-primary flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                                    >
                                        {loyverseLoading ? <Loader className="animate-spin" size={18} /> : <Link2 size={18} />}
                                        連線
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    可在 Loyverse 後台 &gt; 整合 &gt; Personal Access Token 頁面取得
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Connected Status */}
                                <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                        <div>
                                            <span className="text-green-400 font-medium">Loyverse 已連線</span>
                                            {loyverseImportLogs.length > 0 && (
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    最後匯入：{new Date(loyverseImportLogs[0].importedAt).toLocaleString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleDisconnectLoyverse}
                                        className="text-sm text-gray-400 hover:text-red-400 flex items-center gap-1.5 transition-colors"
                                    >
                                        <Unlink size={14} /> 斷開連線
                                    </button>
                                </div>

                                {/* Status Message */}
                                {loyverseMessage && (
                                    <div className={`flex items-center gap-2 text-sm mb-4 px-4 py-2.5 rounded-lg ${
                                        loyverseMessage.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    }`}>
                                        {loyverseMessage.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                        {loyverseMessage.text}
                                    </div>
                                )}

                                {/* Import Buttons */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                                            <Download size={16} className="text-cyan-400" />
                                            各類資料一鍵匯入
                                        </h4>
                                        <button
                                            onClick={() => runImport(importAllLoyverse, '全部資料')}
                                            disabled={loyverseImporting !== null}
                                            className="text-xs bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all disabled:opacity-50"
                                        >
                                            {loyverseImporting === '全部資料' ? (
                                                <Loader className="animate-spin" size={14} />
                                            ) : (
                                                <RefreshCw size={14} />
                                            )}
                                            一鍵匯入所有資料
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {importButtons.map(btn => (
                                            <button
                                                key={btn.label}
                                                onClick={btn.action}
                                                disabled={loyverseImporting !== null}
                                                className={`glass-panel p-3 border-l-4 ${btn.color} hover:bg-white/5 transition-all disabled:opacity-50 text-left`}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <btn.icon size={16} className="text-gray-400" />
                                                    <span className="text-sm font-medium">{btn.label}</span>
                                                </div>
                                                {loyverseImporting === btn.label.split(' ')[0] ? (
                                                    <div className="flex items-center gap-1.5 text-xs text-cyan-400 mt-1">
                                                        <Loader className="animate-spin" size={12} />
                                                        匯入中...
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-500">點擊匯入</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Import Logs */}
                                {loyverseImportLogs.length > 0 && (
                                    <div className="bg-black/30 rounded-xl border border-white/5 overflow-hidden">
                                        <button
                                            onClick={() => setLoyverseLogsExpanded(!loyverseLogsExpanded)}
                                            className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-400 hover:text-gray-200 transition-colors"
                                        >
                                            <span className="flex items-center gap-2">
                                                <Clock size={14} />
                                                匯入記錄 ({loyverseImportLogs.length})
                                            </span>
                                            {loyverseLogsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                        {loyverseLogsExpanded && (
                                            <div className="border-t border-white/5 max-h-64 overflow-y-auto">
                                                {loyverseImportLogs.map((log, idx) => (
                                                    <div key={idx} className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 last:border-b-0 text-xs">
                                                        <div className="flex items-center gap-2">
                                                            {log.status === 'success' ? (
                                                                <CheckCircle2 size={12} className="text-green-500" />
                                                            ) : log.status === 'failed' ? (
                                                                <XCircle size={12} className="text-red-500" />
                                                            ) : (
                                                                <AlertCircle size={12} className="text-yellow-500" />
                                                            )}
                                                            <span className="text-gray-300">{log.type}</span>
                                                            <span className="text-gray-500">{log.importedCount}/{log.totalCount}</span>
                                                        </div>
                                                        <span className="text-gray-600">{new Date(log.importedAt).toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Right: Security & Docs */}
                <div className="space-y-6">
                    <div className="glass-panel p-6 bg-gradient-to-br from-primary/10 to-transparent">
                        <div className="flex items-center gap-2 mb-4 font-bold text-lg">
                            <Shield className="text-primary-light" />
                            安全須知
                        </div>
                        <ul className="text-sm text-gray-400 space-y-3">
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-light mt-1.5 shrink-0" /> API Key 具備完全訪問權限，請勿分享給未經授權的第三方。</li>
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-light mt-1.5 shrink-0" /> 建議為每個不同的整合平台生成獨立的 Key。</li>
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-light mt-1.5 shrink-0" /> 若發現異常流量，請立即撤銷舊有金鑰。</li>
                        </ul>
                    </div>

                    <div className="glass-panel p-6">
                        <div className="flex items-center gap-2 mb-4 font-bold">
                            <Code className="text-gray-400" />
                            快速技術測試
                        </div>
                        <div className="bg-black/40 p-4 rounded-lg font-mono text-xs text-gray-300 break-all border border-white/5">
                            <div className="text-gray-500 mb-2"># 獲取產品清單</div>
                            curl -X GET \<br/>
                            &nbsp;&nbsp; 'https://api.superpos.com/api/public/v1/products' \<br/>
                            &nbsp;&nbsp; -H 'x-api-key: YOUR_KEY'
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-panel w-full max-w-md p-8"
                        >
                            {!generatedKey ? (
                                <>
                                    <h3 className="text-2xl font-bold mb-6">生成新 API 授權碼</h3>
                                    <form onSubmit={handleCreateKey} className="space-y-6">
                                        <div className="input-group">
                                            <label>給這個 Key 一個名稱</label>
                                            <input 
                                                type="text" 
                                                placeholder="例如: Shopify Shop ABC"
                                                value={newKeyName}
                                                onChange={e => setNewKeyName(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="flex gap-4">
                                            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">取消</button>
                                            <button type="submit" className="btn-primary flex-1">確認生成</button>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Shield className="text-green-500" size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">授權碼已生成</h3>
                                    <p className="text-sm text-gray-400 mb-6">這是預防洩露，您唯一一次能看到原始 Key 的機會，請妥善保存。</p>
                                    
                                    <div className="bg-black/40 p-4 rounded-lg flex items-center justify-between gap-4 border border-white/5 mb-8">
                                        <code className="text-primary-light font-bold text-lg break-all">{generatedKey}</code>
                                        <button 
                                            onClick={() => copyToClipboard(generatedKey)}
                                            className="shrink-0 p-2 hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            {copied ? <Check className="text-green-500" /> : <Copy />}
                                        </button>
                                    </div>

                                    <button onClick={() => setIsModalOpen(false)} className="btn-primary w-full">我已安全保存</button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
        <GuidedTour tourId="developerSettings" steps={pageTours.developerSettings(t)} />
    </>
    );
};
export default DeveloperSettings;
