import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Upload, Loader2 } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';

const RECEIPT_LANGUAGES = [
    { code: 'zh-TW', name: '中文（繁體）' },
    { code: 'zh-CN', name: '中文（简体）' },
    { code: 'en-US', name: 'English' },
    { code: 'ja-JP', name: '日本語' },
    { code: 'ko-KR', name: '한국어' },
    { code: 'vi-VN', name: 'Tiếng Việt' },
    { code: 'th-TH', name: 'ไทย' },
    { code: 'my-MM', name: 'မြန်မာ' },
    { code: 'de-DE', name: 'Deutsch' },
    { code: 'fr-FR', name: 'Français' },
    { code: 'es-ES', name: 'Español' },
    { code: 'pt-PT', name: 'Português' },
    { code: 'ru-RU', name: 'Русский' },
    { code: 'ar-SA', name: 'العربية' },
];

const ReceiptSettingsPage = () => {
    const { t } = useTranslation();
    const { tenantConfig } = useTenant();
    const [header, setHeader] = useState('');
    const [footer, setFooter] = useState('');
    const [language, setLanguage] = useState('zh-TW');
    const [showCustomer, setShowCustomer] = useState(true);
    const [showNotes, setShowNotes] = useState(false);

    useEffect(() => {
        const rc = tenantConfig?.receipt;
        if (rc) {
            setHeader(rc.header || '');
            setFooter(rc.footer || '');
            setLanguage(rc.language || 'zh-TW');
            setShowCustomer(rc.showCustomer !== false);
            setShowNotes(rc.showNotes || false);
        }
    }, [tenantConfig]);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}>
            <h3 style={{ fontSize: '1.1rem' }}>{t('receipt_settings.title', '收據設定')}</h3>

            {/* Logo Upload */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>{t('receipt_settings.email_logo', '電子郵件收據已傳送')}</h4>
                    <div style={{ width: '100%', height: '150px', border: '2px dashed var(--glass-border)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Upload size={32} color="var(--text-muted)" />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{t('receipt_settings.upload', '上傳商標')}</span>
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>{t('receipt_settings.print_logo', '收據列印')}</h4>
                    <div style={{ width: '100%', height: '150px', border: '2px dashed var(--glass-border)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Upload size={32} color="var(--text-muted)" />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{t('receipt_settings.upload', '上傳商標')}</span>
                    </div>
                </div>
            </div>

            {/* Text Fields */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>{t('receipt_settings.header', '頁首')} <span style={{ fontSize: '0.7rem' }}>{header.length} / 500</span></label>
                    <textarea id="receipt-header" name="receipt-header" rows={3} value={header} onChange={e => setHeader(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', resize: 'vertical' }} />
                </div>
                <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>{t('receipt_settings.footer', '頁尾')} <span style={{ fontSize: '0.7rem' }}>{footer.length} / 500</span></label>
                    <textarea id="receipt-footer" name="receipt-footer" rows={3} value={footer} onChange={e => setFooter(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', resize: 'vertical' }} />
                </div>
            </div>

            {/* Toggles */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                        { label: t('receipt_settings.show_customer', '顯示客戶資訊'), key: 'showCustomer', checked: showCustomer, onChange: setShowCustomer },
                        { label: t('receipt_settings.show_notes', '顯示註釋'), key: 'showNotes', checked: showNotes, onChange: setShowNotes },
                    ].map((item) => (
                        <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)' }}>
                            <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
                            <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={item.checked} onChange={e => item.onChange(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                                <span style={{ position: 'absolute', inset: 0, background: item.checked ? 'var(--primary)' : 'rgba(255,255,255,0.1)', borderRadius: '12px', transition: '0.3s' }}>
                                    <span style={{ position: 'absolute', left: item.checked ? '22px' : '2px', top: '2px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: '0.3s' }} />
                                </span>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Language & Save */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('receipt_settings.language', '收據語言')}:</span>
                    <select id="receipt-language" name="receipt-language" value={language} onChange={e => setLanguage(e.target.value)}
                        style={{ padding: '0.4rem 0.8rem', background: 'var(--input-bg)', border: 'none', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', fontSize: '0.85rem' }}>
                        {RECEIPT_LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                    </select>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button style={{ padding: '0.5rem 1.2rem', background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        {t('common.cancel', '取消')}
                    </button>
                    <button className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
                        {t('common.save', '儲存')}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ReceiptSettingsPage;
