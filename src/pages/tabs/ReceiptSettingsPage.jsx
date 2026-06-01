import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';

const ReceiptSettingsPage = () => {
    const { t } = useTranslation();

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
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>{t('receipt_settings.header', '頁首')} <span style={{ fontSize: '0.7rem' }}>0 / 500</span></label>
                    <textarea rows={3} style={{ width: '100%', padding: '0.6rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white', resize: 'vertical' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>{t('receipt_settings.footer', '頁尾')} <span style={{ fontSize: '0.7rem' }}>0 / 500</span></label>
                    <textarea rows={3} style={{ width: '100%', padding: '0.6rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white', resize: 'vertical' }} />
                </div>
            </div>

            {/* Toggles */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                        { label: t('receipt_settings.show_customer', '顯示客戶資訊'), key: 'showCustomer' },
                        { label: t('receipt_settings.show_notes', '顯示註釋'), key: 'showNotes' },
                    ].map((item) => (
                        <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)' }}>
                            <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
                            <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
                                <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} />
                                <span style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.1)', borderRadius: '12px', transition: '0.3s' }}>
                                    <span style={{ position: 'absolute', left: '2px', top: '2px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: '0.3s' }} />
                                </span>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Language & Save */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('receipt_settings.language', '收據語言')}:</span>
                    <select style={{ padding: '0.4rem 0.8rem', background: 'rgba(0,0,0,0.2)', border: 'none', borderRadius: 'var(--radius-md)', color: 'white', fontSize: '0.85rem' }}>
                        <option>中文（繁體）</option>
                        <option>English</option>
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
