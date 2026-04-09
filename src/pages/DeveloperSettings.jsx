import React, { useState, useEffect } from 'react';
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
    Globe
} from 'lucide-react';
import { getApiKeys, createApiKey, deleteApiKey } from '../api/developer';

const DeveloperSettings = () => {
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [generatedKey, setGeneratedKey] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchKeys();
    }, []);

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

    return (
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
    );
};

export default DeveloperSettings;
