import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GuidedTour from '../components/GuidedTour';
import { pageTours } from '../utils/pageTours';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Globe, Bell, Shield, CreditCard, Save, Loader2, Coins, Receipt } from 'lucide-react';
import { getMyTenant, updateTenantConfig } from '../api/tenants';

const Settings = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [config, setConfig] = useState({
        timezone: 'UTC',
        currency: 'USD',
        loyaltyEnabled: true,
        loyaltyRate: 10,
        taxRate: 5
    });

    // 監聽是否為手機螢幕，用來動態調整一些內聯的 padding
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        fetchSettings();
        
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        // 初始化檢查
        handleResize();
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
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
                alert(t('settings.save_success'));
            }
        } catch (error) {
            alert(t('settings.save_fail')); 
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
                <h2 style={{ fontSize: '1.5rem' }}>{t('settings.title')}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('settings.subtitle')}</p>
            </div>

            {/* 主佈局：使用 auto-fit。當寬度小於 768px 或空間不足時，自動切換為單欄上下排列 */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', 
                gap: isMobile ? '1rem' : '2rem',
                alignItems: 'start'
            }}>
                {/* 左側導覽列 - 手機端會自動變更排列方向（可選，目前維持垂直排列，亦可改為橫向滾動） */}
                <div className="glass-panel" style={{ 
                    padding: '1rem', 
                    display: 'flex', 
                    flexDirection: isMobile ? 'row' : 'column', 
                    gap: '0.5rem',
                    overflowX: isMobile ? 'auto' : 'visible',
                    whiteSpace: isMobile ? 'nowrap' : 'normal',
                    WebkitOverflowScrolling: 'touch'
                }}>
                    <button style={menuItemStyle(true, isMobile)}><SettingsIcon size={18} /> {t('settings.tabs.general')}</button>
                    <button style={menuItemStyle(false, isMobile)}><Coins size={18} /> {t('settings.tabs.loyalty')}</button>
                    <button style={menuItemStyle(false, isMobile)}><Receipt size={18} /> {t('settings.tabs.tax')}</button>
                    <button style={menuItemStyle(false, isMobile)}><Shield size={18} /> {t('settings.tabs.security')}</button>
                </div>

                {/* 右側內容區 */}
                <div className="glass-panel" style={{ 
                    padding: isMobile ? '1.25rem' : '2rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '2rem' 
                }}>
                    <section>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Coins size={18} color="var(--primary-light)" /> {t('settings.loyalty.title')}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div style={toggleRowStyle}>
                                <div style={{ paddingRight: '1rem' }}>
                                    <div style={{ fontWeight: 500 }}>{t('settings.loyalty.enable_points')}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('settings.loyalty.enable_desc')}</div>
                                </div>
                                <input id="settings-loyalty-enabled" name="settings-loyalty-enabled" type="checkbox" checked={config.loyaltyEnabled} onChange={(e) => setConfig({ ...config, loyaltyEnabled: e.target.checked })} />
                            </div>
                            <div className="input-group">
                                <label style={labelStyle}>{t('settings.loyalty.rate_label')}</label>
                                <input
                                    id="settings-loyalty-rate"
                                    name="settings-loyalty-rate"
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
                            <Receipt size={18} color="#fbbf24" /> {t('settings.tax.title')}
                        </h3>
                        <div className="input-group">
                            <label style={labelStyle}>{t('settings.tax.rate_label')}</label>
                            <input
                                id="settings-tax-rate"
                                name="settings-tax-rate"
                                type="number"
                                step="0.01"
                                style={inputStyle}
                                value={config.taxRate}
                                onChange={(e) => setConfig({ ...config, taxRate: parseFloat(e.target.value) })}
                            />
                        </div>
                    </section>

                    <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>{t('settings.regional.title')}</h3>
                        {/* 幣別與時區群組：手機端自動切換為單欄 */}
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', 
                            gap: '1rem' 
                        }}>
                            <div className="input-group">
                                <label style={labelStyle}>{t('settings.regional.currency_label')}</label>
                                <select 
                                    id="settings-currency"
                                    name="settings-currency"
                                    style={inputStyle} 
                                    value={config.currency} 
                                    onChange={(e) => setConfig({ ...config, currency: e.target.value })}
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="TWD">TWD (NT$)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="JPY">JPY (¥)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="CNY">CNY (¥)</option>
                                    <option value="KRW">KRW (₩)</option>
                                    <option value="MMK">MMK (Ks)</option>
                                    <option value="SGD">SGD (S$)</option>
                                    <option value="HKD">HKD (HK$)</option>
                                    <option value="AUD">AUD (A$)</option>
                                    <option value="CAD">CAD (C$)</option>
                                    <option value="₹">INR (₹)</option>
                                    <option value="BRL">BRL (R$)</option>
                                    <option value="ZAR">ZAR (R)</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label style={labelStyle}>{t('settings.regional.timezone_label')}</label>
                                <select id="settings-timezone" name="settings-timezone" style={inputStyle} value={config.timezone} onChange={(e) => setConfig({ ...config, timezone: e.target.value })}>
                                    <option value="Asia/Taipei">Asia/Taipei (GMT+8)</option>
                                    <option value="UTC">UTC</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* 按鈕改為手機端全寬，提升大拇指點擊體驗 */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button
                            onClick={handleSave}
                            disabled={submitting}
                            className="btn-primary"
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                gap: '0.5rem', 
                                padding: '0.8rem 2rem',
                                width: isMobile ? '100%' : 'auto'
                            }}
                        >
                            {submitting ? <Loader2 className="animate-spin" /> : <><Save size={18} /> {t('settings.save_btn')}</>}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const menuItemStyle = (active, isMobile) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: isMobile ? '0.6rem 1rem' : '0.75rem 1rem',
    background: active ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
    border: 'none',
    color: active ? 'var(--primary)' : 'var(--text-muted)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
    fontWeight: active ? '600' : 'normal',
    flex: isMobile ? '0 0 auto' : 'initial' // 手機端橫向滾動時防止按鈕被壓縮
});

const labelStyle = { display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' };
const inputStyle = { width: '100%', padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none', fontSize: '1rem', boxSizing: 'border-box' };
const toggleRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' };

            <GuidedTour tourId="settings" steps={pageTours.settings(t)} />

export default Settings;