import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, Building2, Eye, EyeOff, ArrowRight } from 'lucide-react';

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        tenantId: '',
        username: '',
        password: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Logging in with:', formData);
        // Logic will be added here
    };

    return (
        <motion.div
            className="glass-panel animate-fade-in"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ padding: '3rem 2.5rem', width: '100%' }}
        >
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    歡迎回來 <span className="gradient-text">POS SaaS</span>
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>登錄您的管理後台以繼續</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>租戶 ID / 公司編號</label>
                    <div style={{ position: 'relative' }}>
                        <Building2 size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                        <input
                            type="text"
                            placeholder="例如: superstore-01"
                            style={inputStyle}
                            value={formData.tenantId}
                            onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>帳號 / Email</label>
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                        <input
                            type="text"
                            placeholder="admin@example.com"
                            style={inputStyle}
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>密碼</label>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            style={inputStyle}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

                <button type="submit" className="btn-primary" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    登入系統 <ArrowRight size={18} />
                </button>

                <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem' }}>
                    <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none' }}>忘記密碼？</a>
                </div>
            </form>
        </motion.div>
    );
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

export default LoginPage;
