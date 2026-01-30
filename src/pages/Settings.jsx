import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Globe, Bell, Shield, CreditCard, Save } from 'lucide-react';

const Settings = () => {
    const [config, setConfig] = useState({
        storeName: '超級零售店',
        language: 'zh-TW',
        currency: 'TWD',
        emailNotifications: true,
        autoPrint: false
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="animate-fade-in"
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
            <div>
                <h2 style={{ fontSize: '1.5rem' }}>系統設置</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>自定義您的 POS 系統與商店配置</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button style={menuItemStyle(true)}><SettingsIcon size={18} /> 一般設置</button>
                    <button style={menuItemStyle(false)}><Globe size={18} /> 語言與地區</button>
                    <button style={menuItemStyle(false)}><Bell size={18} /> 通知設置</button>
                    <button style={menuItemStyle(false)}><Shield size={18} /> 安全與權限</button>
                    <button style={menuItemStyle(false)}><CreditCard size={18} /> 訂閱方案</button>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <section>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>店鋪基本資料</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div className="input-group">
                                <label style={labelStyle}>店鋪名稱</label>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    value={config.storeName}
                                    onChange={(e) => setConfig({ ...config, storeName: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <label style={labelStyle}>預設語言</label>
                                <select style={inputStyle} value={config.language} onChange={(e) => setConfig({ ...config, language: e.target.value })}>
                                    <option value="zh-TW">繁體中文 (Taiwan)</option>
                                    <option value="en">English (US)</option>
                                    <option value="ja">日本語</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>功能開關</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={toggleRowStyle}>
                                <div>
                                    <div style={{ fontWeight: 500 }}>郵件通知</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>當有新訂單或系統更新時發送郵件</div>
                                </div>
                                <input type="checkbox" checked={config.emailNotifications} onChange={(e) => setConfig({ ...config, emailNotifications: e.target.checked })} />
                            </div>
                            <div style={toggleRowStyle}>
                                <div>
                                    <div style={{ fontWeight: 500 }}>自動打印收據</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>結帳完成後自動打印小票</div>
                                </div>
                                <input type="checkbox" checked={config.autoPrint} onChange={(e) => setConfig({ ...config, autoPrint: e.target.checked })} />
                            </div>
                        </div>
                    </section>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Save size={18} /> 保存更改
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const menuItemStyle = (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    background: active ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
    border: 'none',
    color: active ? 'var(--primary)' : 'var(--text-muted)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
    fontWeight: active ? '600' : 'normal'
});

const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.85rem',
    color: 'var(--text-muted)'
};

const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 'var(--radius-md)',
    color: 'white',
    outline: 'none',
    fontSize: '1rem'
};

const toggleRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0'
};

export default Settings;
