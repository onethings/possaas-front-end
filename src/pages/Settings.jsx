import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Globe, Bell, Shield, CreditCard, Save, Loader2, Coins, Receipt } from 'lucide-react';
import { getMyTenant, updateTenantConfig } from '../api/tenants';

const Settings = () => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [config, setConfig] = useState({
        timezone: 'UTC',
        currency: 'USD',
        loyaltyEnabled: true,
        loyaltyRate: 10,
        taxRate: 5
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const result = await getMyTenant();
            if (result.success && result.data.config) {
                setConfig({
                    ...config,
                    ...result.data.config
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSubmitting(true);
        try {
            const result = await updateTenantConfig(config);
            if (result.success) {
                alert('設置已成功保存！');
            }
        } catch (error) {
            alert('保存失敗');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}><Loader2 className="animate-spin" /></div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="animate-fade-in"
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
            <div>
                <h2 style={{ fontSize: '1.5rem' }}>系統設置</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>管理您的商店規則與忠誠度計畫</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button style={menuItemStyle(true)}><SettingsIcon size={18} /> 一般設置</button>
                    <button style={menuItemStyle(false)}><Coins size={18} /> 忠誠度計畫</button>
                    <button style={menuItemStyle(false)}><Receipt size={18} /> 稅務設置</button>
                    <button style={menuItemStyle(false)}><Shield size={18} /> 安全與權限</button>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <section>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Coins size={18} color="var(--primary-light)" /> 忠誠度計畫 (Loyalty)
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div style={toggleRowStyle}>
                                <div>
                                    <div style={{ fontWeight: 500 }}>啟用消費回饋點數</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>客戶每筆消費將根據金額獲得點數</div>
                                </div>
                                <input type="checkbox" checked={config.loyaltyEnabled} onChange={(e) => setConfig({ ...config, loyaltyEnabled: e.target.checked })} />
                            </div>
                            <div className="input-group">
                                <label style={labelStyle}>回饋比例 (花費多少換 1 點)</label>
                                <input
                                    type="number"
                                    style={inputStyle}
                                    value={config.loyaltyRate}
                                    onChange={(e) => setConfig({ ...config, loyaltyRate: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                    </section>

                    <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Receipt size={18} color="#fbbf24" /> 稅務配置 (Taxes)
                        </h3>
                        <div className="input-group">
                            <label style={labelStyle}>預設稅率 (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                style={inputStyle}
                                value={config.taxRate}
                                onChange={(e) => setConfig({ ...config, taxRate: parseFloat(e.target.value) })}
                            />
                        </div>
                    </section>

                    <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>地區與貨幣</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-group">
                                <label style={labelStyle}>貨幣符號</label>
                                <input style={inputStyle} value={config.currency} onChange={(e) => setConfig({ ...config, currency: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label style={labelStyle}>時區</label>
                                <select style={inputStyle} value={config.timezone} onChange={(e) => setConfig({ ...config, timezone: e.target.value })}>
                                    <option value="Asia/Taipei">Asia/Taipei (GMT+8)</option>
                                    <option value="UTC">UTC</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button
                            onClick={handleSave}
                            disabled={submitting}
                            className="btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 2rem' }}
                        >
                            {submitting ? <Loader2 className="animate-spin" /> : <><Save size={18} /> 保存更改</>}
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

const labelStyle = { display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' };
const inputStyle = { width: '100%', padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none', fontSize: '1rem' };
const toggleRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' };

export default Settings;
