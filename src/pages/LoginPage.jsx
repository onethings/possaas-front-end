import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Lock, User, Building2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { login } from '../api/auth';
import GuidedTour from '../components/GuidedTour';

const LoginPage = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar-SA';

    const languageNames = {
        'en-US': 'English',
        'zh-TW': '繁體中文',
        'zh-CN': '简体中文',
        'de-DE': 'Deutsch',
        'ar-SA': 'العربية',
        'es-ES': 'Español',
        'fr-FR': 'Français',
        'hi-IN': 'हिन्दी',
        'id-ID': 'Bahasa Indonesia',
        'it-IT': 'Italiano',
        'ja-JP': '日本語',
        'ko-KR': '한국어',
        'my-MM': 'မြန်မာဘာသာ',
        'nl-NL': 'Nederlands',
        'pt-PT': 'Português',
        'ru-RU': 'Русский',
        'th-TH': 'ไทย',
        'tr-TR': 'Türkçe',
        'vi-VN': 'Tiếng Việt'
    };
    const supportedLanguages = Object.keys(i18n.options.resources || {});
    const navigate = useNavigate();
    const { loginUser } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showTenant, setShowTenant] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };
    
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        tenantId: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            console.log("Submitting login for:", formData.username, "tenant:", formData.tenantId);
            const result = await login(formData.username, formData.password, formData.tenantId || null);
            console.log("Login result:", result);

            if (result && result.success) {
                loginUser(result.user, result.token);
                navigate('/dashboard');
            } else {
                console.warn("Login result was not successful:", result);
                setError(result?.message || '登入失敗，伺服器回傳錯誤');
                if (result?.requireTenant) {
                    setShowTenant(true);
                }
            }
        } catch (err) {
            console.error("Login caught error:", err);
            const data = err.response?.data;
            if (data?.requireTenant) {
                setShowTenant(true);
                setError(data.message);
            } else {
                setError(data?.message || err.message || '登入失敗，請檢查您的帳號、密碼或公司編號');
            }
        } finally {
            setLoading(false);
        }
    };

    // 動態輸入框樣式：完美支援 LTR 與 RTL
    const dynamicInputStyle = {
        ...inputStyle,
        padding: isRtl ? '0.75rem 40px 0.75rem 1rem' : '0.75rem 1rem 0.75rem 40px',
        textAlign: isRtl ? 'right' : 'left'
    };

    return (
        <div style={{ width: '100%', padding: '0 1rem', boxSizing: 'border-box' }}>
            <motion.div
                dir={isRtl ? 'rtl' : 'ltr'}
                className="glass-panel animate-fade-in"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                    padding: '2.5rem 1.75rem', // 縮減內襯，對手機更友善
                    width: '100%',
                    maxWidth: '440px',          // 限制最大寬度，大螢幕不變形
                    margin: '0 auto',          // 居中
                    boxSizing: 'border-box',
                    position: 'relative',
                    textAlign: isRtl ? 'right' : 'left'
                }}
            >
                {/* 語言切換器選單 */}
                <div data-tour-id="login-lang" style={{
                    position: 'absolute',
                    top: '1rem',
                    // 根據 RTL 動態調換左右邊定位
                    [isRtl ? 'left' : 'right']: '1rem'
                }}>
                    <select
                        id="login-language"
                        name="login-language"
                        onChange={(e) => changeLanguage(e.target.value)}
                        value={i18n.language}
                        style={selectStyle}
                    >
                        {supportedLanguages.map((lng) => (
                            <option key={lng} value={lng}>
                                {languageNames[lng] || lng}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '2.5rem', marginTop: '1rem' }} data-tour-id="login-welcome">
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: 700, letterSpacing: '-0.025em' }}>
                        {t('login.welcome')} <span className="gradient-text">Kevin POS</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{t('login.subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    {/* 帳號欄位 */}
                    <div className="input-group" data-tour-id="login-username">
                        <label htmlFor="username" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('login.email')}</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ 
                                position: 'absolute', 
                                [isRtl ? 'right' : 'left']: '12px', 
                                top: '50%', 
                                transform: 'translateY(-50%)', 
                                color: 'var(--primary)' 
                            }} />
                            <input
                                id="username"
                                name="username"
                                type="text"
                                placeholder="admin@example.com"
                                style={dynamicInputStyle}
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                autoComplete="username"
                                required
                            />
                        </div>
                    </div>

                    {/* 密碼欄位 */}
                    <div className="input-group" data-tour-id="login-password">
                        <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('login.password')}</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ 
                                position: 'absolute', 
                                [isRtl ? 'right' : 'left']: '12px', 
                                top: '50%', 
                                transform: 'translateY(-50%)', 
                                color: 'var(--primary)' 
                            }} />
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                style={{
                                    ...dynamicInputStyle,
                                    padding: isRtl ? '0.75rem 40px 0.75rem 40px' : '0.75rem 40px 0.75rem 40px' // 兩邊都留空給眼睛和鎖頭圖標
                                }}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                autoComplete="current-password"
                                required
                            />
                            <div
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ 
                                    position: 'absolute', 
                                    [isRtl ? 'left' : 'right']: '12px', 
                                    top: '50%', 
                                    transform: 'translateY(-50%)', 
                                    cursor: 'pointer', 
                                    color: 'var(--text-muted)',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </div>
                        </div>
                    </div>

                    {/* 公司編號欄位 */}
                    {showTenant && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="input-group"
                        >
                            <label htmlFor="tenantId" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>公司編號 (Company ID)</label>
                            <div style={{ position: 'relative' }}>
                                <Building2 size={18} style={{ 
                                    position: 'absolute', 
                                    [isRtl ? 'right' : 'left']: '12px', 
                                    top: '50%', 
                                    transform: 'translateY(-50%)', 
                                    color: 'var(--primary)' 
                                }} />
                                <input
                                    id="tenantId"
                                    name="tenantId"
                                    type="text"
                                    placeholder="例如: superstore-01"
                                    style={dynamicInputStyle}
                                    value={formData.tenantId}
                                    onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                                    autoComplete="off"
                                    required
                                />
                            </div>
                        </motion.div>
                    )}

                    {!showTenant && (
                        <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
                            <button
                                type="button"
                                onClick={() => setShowTenant(true)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}
                            >
                                {t('login.loginWithCompanyId')}
                            </button>
                        </div>
                    )}

                    {error && (
                        <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', fontSize: '0.9rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    {/* 登入按鈕 */}
                    <div data-tour-id="login-submit" style={{ width: '100%' }}>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ 
                            marginTop: '0.5rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '0.5rem', 
                            opacity: loading ? 0.7 : 1,
                            width: '100%',
                            padding: '0.75rem'
                        }}
                    >
                        {loading ? t('login.loading') : t('login.signIn')} 
                        <ArrowRight
                            size={18}
                            style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }}
                        />
                    </button>
                    </div>

                    {/* 頁尾連結：RWD 彈性排版 */}
                    <div style={{ 
                        textAlign: 'center', 
                        marginTop: '1rem', 
                        fontSize: '0.85rem', 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        gap: '1rem',
                        flexWrap: 'wrap' // 當手機寬度不夠時自動換行
                    }}>
                        <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{t('login.forgotPassword')}</a>
                        <Link to="/register" data-tour-id="login-register-link" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>{t('login.applyTrial')}</Link>
                    </div>
                </form>
            </motion.div>

            {/* 互動式引導教學 */}
            <GuidedTour
                tourId="login"
                steps={loginTourSteps(t)}
            />
        </div>
    );
};

const inputStyle = {
    width: '100%',
    background: 'var(--input-bg)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-main)',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontSize: '1rem',
    boxSizing: 'border-box' // 確保 padding 不會撐開總寬度
};

const selectStyle = {
    background: 'var(--input-bg)',
    color: 'var(--text-main)',
    border: '1px solid var(--glass-border)',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '0.8rem',
    outline: 'none',
    cursor: 'pointer'
};

// 引導教學步驟定義
const loginTourSteps = (t) => [
    {
        target: 'login-welcome',
        title: t('tour.login_welcome_title', 'Login Welcome Title'),
        content: t('tour.login_welcome_content', 'Login Welcome Content'),
        placement: 'bottom',
    },
    {
        target: 'login-username',
        title: t('tour.login_username_title', 'Login Username Title'),
        content: t('tour.login_username_content', 'Login Username Content'),
        placement: 'right',
    },
    {
        target: 'login-password',
        title: t('tour.login_password_title', 'Login Password Title'),
        content: t('tour.login_password_content', 'Login Password Content'),
        placement: 'right',
    },
    {
        target: 'login-submit',
        title: t('tour.login_submit_title', 'Login Submit Title'),
        content: t('tour.login_submit_content', 'Login Submit Content'),
        placement: 'top',
    },
    {
        target: 'login-register-link',
        title: t('tour.login_register_title', 'Login Register Title'),
        content: t('tour.login_register_content', 'Login Register Content'),
        placement: 'top',
    },
    {
        target: 'login-lang',
        title: t('tour.login_lang_title', 'Login Lang Title'),
        content: t('tour.login_lang_content', 'Login Lang Content'),
        placement: 'bottom',
    },
];

export default LoginPage;