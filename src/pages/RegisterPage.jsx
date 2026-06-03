import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Lock, Mail, Building2, User, ArrowRight, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { registerTenant } from '../api/tenants';
import GuidedTour from '../components/GuidedTour';

const RegisterPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        tenantId: '',
        adminEmail: '',
        adminPassword: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.adminPassword !== formData.confirmPassword) {
            setError(t('register.error_password_mismatch')); // 密碼不一致
            return;
        }

        setLoading(true);
        setError('');
        try {
            const result = await registerTenant({
                name: formData.name,
                tenantId: formData.tenantId,
                adminEmail: formData.adminEmail,
                adminPassword: formData.adminPassword
            });

            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || t('register.error_default')); // 註冊失敗
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <motion.div
                className="glass-panel animate-fade-in"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ padding: '3rem 2.5rem', textAlign: 'center', maxWidth: '500px' }}
            >
                <div style={{ marginBottom: '1.5rem', color: '#4ade80' }}>
                    <CheckCircle2 size={64} style={{ margin: '0 auto' }} />
                </div>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                    {t('register.success_title')}
                </h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    {t('register.success_msg')}
                </p>
                <button
                    onClick={() => navigate('/login')}
                    className="btn-primary"
                    style={{ width: '100%' }}
                >
                    {t('register.goto_login')}
                </button>
            </motion.div>
        );
    }

    return (
        <>
        <motion.div
            className="glass-panel animate-fade-in"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ padding: '2.5rem', width: '100%', maxWidth: '500px' }}
        >
            <div style={{ textAlign: 'center', marginBottom: '2rem' }} data-tour-id="register-welcome">
                <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                    {/* 處理漸層文字：開始您的 Kevin POS 旅程 */}
                    {t('register.title_prefix', 'Title Prefix')}
                    <span className="gradient-text">Kevin POS</span>
                    {t('register.title_suffix', 'Title Suffix')}
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>{t('register.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* 公司名稱 */}
                <div className="input-group" data-tour-id="register-name">
                    <label htmlFor="reg-name" style={labelStyle}>{t('register.company_name')}</label>
                    <div style={{ position: 'relative' }}>
                        <Building2 size={18} style={iconStyle} />
                        <input
                            id="reg-name"
                            type="text"
                            placeholder={t('register.company_name_placeholder')}
                            style={inputStyle}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                </div>

                {/* 公司編號 */}
                <div className="input-group" data-tour-id="register-tenantId">
                    <label htmlFor="reg-tenantId" style={labelStyle}>{t('register.tenant_id')}</label>
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={iconStyle} />
                        <input
                            id="reg-tenantId"
                            type="text"
                            placeholder={t('register.tenant_id_placeholder')}
                            style={inputStyle}
                            value={formData.tenantId}
                            onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                            required
                        />
                    </div>
                </div>

                {/* 管理員 Email */}
                <div className="input-group" data-tour-id="register-email">
                    <label htmlFor="reg-adminEmail" style={labelStyle}>{t('register.admin_email')}</label>
                    <div style={{ position: 'relative' }}>
                        <Mail size={18} style={iconStyle} />
                        <input
                            id="reg-adminEmail"
                            type="email"
                            placeholder={t('register.admin_email_placeholder')}
                            style={inputStyle}
                            value={formData.adminEmail}
                            onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                            required
                        />
                    </div>
                </div>

                {/* 密碼 */}
                <div className="input-group" data-tour-id="register-password">
                    <label htmlFor="reg-adminPassword" style={labelStyle}>{t('register.password')}</label>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={iconStyle} />
                        <input
                            id="reg-adminPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder={t('register.password_placeholder')}
                            style={inputStyle}
                            value={formData.adminPassword}
                            onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                            required
                        />
                        <div
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)' }}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </div>
                    </div>
                </div>

                {/* 確認密碼 */}
                <div className="input-group" data-tour-id="register-confirm">
                    <label htmlFor="reg-confirmPassword" style={labelStyle}>{t('register.confirm_password')}</label>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={iconStyle} />
                        <input
                            id="reg-confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder={t('register.password_placeholder')}
                            style={inputStyle}
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                        />
                        <div
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)' }}
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </div>
                    </div>
                </div>

                {error && (
                    <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', fontSize: '0.9rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <div data-tour-id="register-submit" style={{ width: '100%' }}>
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                    style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1, width: '100%' }}
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : t('register.submit')}
                    {!loading && <ArrowRight size={18} />}
                </button>
                </div>

                <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t('register.has_account')} </span>
                    <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                        {t('register.login_now')}
                    </Link>
                </div>
            </form>
        </motion.div>

        {/* 互動式引導教學 */}
        <GuidedTour
            tourId="register"
            steps={registerTourSteps(t)}
        />
        </>
    );
};
    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.85rem',
        color: 'var(--text-muted)'
    };

    const iconStyle = {
        position: 'absolute',
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'var(--primary)'
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem 1rem 0.75rem 40px',
        background: 'var(--input-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-main)',
        outline: 'none',
        transition: 'all 0.3s ease',
        fontSize: '1rem'
    };

    export default RegisterPage;

// 引導教學步驟定義
const registerTourSteps = (t) => [
    {
        target: 'register-welcome',
        title: t('tour.register_welcome_title', 'Register Welcome Title'),
        content: t('tour.register_welcome_content', 'Register Welcome Content'),
        placement: 'bottom',
    },
    {
        target: 'register-name',
        title: t('tour.register_name_title', 'Register Name Title'),
        content: t('tour.register_name_content', 'Register Name Content'),
        placement: 'right',
    },
    {
        target: 'register-tenantId',
        title: t('tour.register_tenant_title', 'Register Tenant Title'),
        content: t('tour.register_tenant_content', 'Register Tenant Content'),
        placement: 'right',
    },
    {
        target: 'register-email',
        title: t('tour.register_email_title', 'Register Email Title'),
        content: t('tour.register_email_content', 'Register Email Content'),
        placement: 'right',
    },
    {
        target: 'register-password',
        title: t('tour.register_password_title', 'Register Password Title'),
        content: t('tour.register_password_content', 'Register Password Content'),
        placement: 'right',
    },
    {
        target: 'register-confirm',
        title: t('tour.register_confirm_title', 'Register Confirm Title'),
        content: t('tour.register_confirm_content', 'Register Confirm Content'),
        placement: 'right',
    },
    {
        target: 'register-submit',
        title: t('tour.register_submit_title', 'Register Submit Title'),
        content: t('tour.register_submit_content', 'Register Submit Content'),
        placement: 'top',
    },
];
