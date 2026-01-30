import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Building2, User, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { registerTenant } from '../api/tenants';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
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
            setError('密碼不一致');
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
            setError(err.response?.data?.message || '註冊失敗，請重試');
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
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>註冊成功！</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    您的公司帳號已成功建立。正在為您跳轉至登入頁面...
                </p>
                <button
                    onClick={() => navigate('/login')}
                    className="btn-primary"
                    style={{ width: '100%' }}
                >
                    立即登入
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="glass-panel animate-fade-in"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ padding: '2.5rem', width: '100%', maxWidth: '500px' }}
        >
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                    開始您的 <span className="gradient-text">POS SaaS</span> 旅程
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>註冊您的公司帳號以開始使用</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="input-group">
                    <label style={labelStyle}>公司名稱</label>
                    <div style={{ position: 'relative' }}>
                        <Building2 size={18} style={iconStyle} />
                        <input
                            type="text"
                            placeholder="例如: 超級零售集團"
                            style={inputStyle}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label style={labelStyle}>公司編號 (Tenant ID)</label>
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={iconStyle} />
                        <input
                            type="text"
                            placeholder="例如: superstore-01 (唯一識別碼)"
                            style={inputStyle}
                            value={formData.tenantId}
                            onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label style={labelStyle}>管理員 Email</label>
                    <div style={{ position: 'relative' }}>
                        <Mail size={18} style={iconStyle} />
                        <input
                            type="email"
                            placeholder="admin@example.com"
                            style={inputStyle}
                            value={formData.adminEmail}
                            onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label style={labelStyle}>設置密碼</label>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={iconStyle} />
                        <input
                            type="password"
                            placeholder="••••••••"
                            style={inputStyle}
                            value={formData.adminPassword}
                            onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label style={labelStyle}>確認密碼</label>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={iconStyle} />
                        <input
                            type="password"
                            placeholder="••••••••"
                            style={inputStyle}
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', fontSize: '0.9rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                    style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1 }}
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : '立即註冊'}
                    {!loading && <ArrowRight size={18} />}
                </button>

                <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>已有帳號？ </span>
                    <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>直接登入</Link>
                </div>
            </form>
        </motion.div>
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
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 'var(--radius-md)',
    color: 'white',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontSize: '1rem'
};

export default RegisterPage;
