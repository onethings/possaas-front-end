import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    UserCheck,
    ClipboardList,
    Truck,
    FileText,
    Ticket,
    Tags,
    BarChart,
    Timer,
    Code,
    Globe
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const languages = [
    { code: 'en-US', name: 'English' },
    { code: 'zh-TW', name: '繁體中文' },
    { code: 'zh-CN', name: '简体中文' },
    { code: 'de-DE', name: 'Deutsch' },
    { code: 'ar-SA', name: 'العربية' },
    { code: 'es-ES', name: 'Español' },
    { code: 'fr-FR', name: 'Français' },
    { code: 'hi-IN', name: 'हिन्दी' },
    { code: 'id-ID', name: 'Bahasa Indonesia' },
    { code: 'it-IT', name: 'Italiano' },
    { code: 'ja-JP', name: '日本語' },
    { code: 'ko-KR', name: '한국어' },
    { code: 'my-MM', name: 'မြန်မာ' },
    { code: 'nl-NL', name: 'Nederlands' },
    { code: 'pt-PT', name: 'Português' },
    { code: 'ru-RU', name: 'Русский' },
    { code: 'th-TH', name: 'ไทย' },
    { code: 'tr-TR', name: 'Türkçe' },
    { code: 'vi-VN', name: 'Tiếng Việt' }
];

const navItems = [
    { icon: LayoutDashboard, label: 'nav.overview', path: '/dashboard' },
    { icon: Ticket, label: 'nav.pos', path: '/pos' },
    { icon: Package, label: 'nav.product_mgmt', path: '/products' },
    { icon: ClipboardList, label: 'nav.inventory_count', path: '/inventory/counts' },
    { icon: FileText, label: 'nav.purchase_order', path: '/inventory/purchase-orders' },
    { icon: Truck, label: 'nav.suppliers', path: '/inventory/suppliers' },
    { icon: Tags, label: 'nav.discount_mgmt', path: '/discounts' },
    { icon: ShoppingCart, label: 'nav.order_mgmt', path: '/orders' },
    { icon: BarChart, label: 'nav.revenue_report', path: '/revenue-report' },
    { icon: Users, label: 'nav.customer_data', path: '/customers' },
    { icon: UserCheck, label: 'nav.staff_mgmt', path: '/staff' },
    { icon: Timer, label: 'nav.attendance', path: '/staff/timecards' },
    { icon: BarChart, label: 'nav.staff_performance', path: '/staff/reports' },
    { icon: Settings, label: 'nav.system_settings', path: '/settings' },
    { icon: Code, label: 'nav.api_integration', path: '/developer' },
];




const DashboardLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const { t, i18n } = useTranslation();

    const changeLanguage = (e) => {
        const newLang = e.target.value;
        i18n.changeLanguage(newLang);
        // 可選：切換 RTL (如阿拉伯語)
        document.dir = newLang === 'ar-SA' ? 'rtl' : 'ltr';
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-dark)' }}>
            {/* Sidebar */}
            <motion.aside
                className="glass-panel"
                initial={false}
                animate={{ width: isSidebarOpen ? '260px' : '80px' }}
                style={{
                    margin: '1rem',
                    marginRight: '0',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 100
                }}
            >
                <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center' }}>
                    {isSidebarOpen && <span className="gradient-text" style={{ fontWeight: 800, fontSize: '1.2rem' }}>POS SAAS</span>}
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} style={iconBtnStyle}>
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav style={{
                    flex: 1,
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    overflowY: 'auto', // 允許滾動
                    scrollbarWidth: 'none' // 隱藏標準捲軸 (Firefox)
                }}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={isActive ? 'glass-card' : ''}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0.8rem',
                                    borderRadius: 'var(--radius-md)',
                                    textDecoration: 'none',
                                    color: isActive ? 'var(--primary-light)' : 'var(--text-muted)',
                                    gap: '1rem',
                                    transition: 'background 0.3s ease',
                                    background: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                                    whiteSpace: 'nowrap' // 建議加上這個，防止文字在動畫時換行
                                }}
                            >
                                <item.icon size={20} style={{ minWidth: '20px' }} />

                                {/* 放在這裡：取代原本的 {isSidebarOpen && <span>...</span>} */}
                                <AnimatePresence mode="wait">
                                    {isSidebarOpen && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.2 }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            {t(item.label)}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </Link>
                        );
                    })}
                </nav>

                <div style={{ padding: '1rem' }}>
                    <button
                        onClick={logout}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.8rem',
                            borderRadius: 'var(--radius-md)',
                            background: 'transparent',
                            border: 'none',
                            color: '#ff4d4d',
                            cursor: 'pointer',
                            gap: '1rem'
                        }}>
                        <LogOut size={20} />
                        {isSidebarOpen && <span>{t('logout', '登出系統')}</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem', gap: '1rem', maxHeight: '100vh', overflowY: 'auto' }}>
                {/* Header */}
                <header className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            id="global-search"
                            name="global-search"
                            type="text"
                            placeholder={t('search_placeholder', '搜尋訂單、產品...')}
                            style={{ padding: '0.6rem 1rem 0.6rem 40px', background: 'rgba(0,0,0,0.2)', border: 'none', borderRadius: 'var(--radius-md)', color: 'white', width: '100%' }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        {/* Language Switcher */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)' }}>
                            <Globe size={18} color="var(--text-muted)" />
                            <select
                                value={i18n.language}
                                onChange={changeLanguage}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    fontSize: '0.85rem',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                {languages.map(lang => (
                                    <option key={lang.code} value={lang.code} style={{ background: '#1a1a1a', color: 'white' }}>
                                        {lang.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ position: 'relative', cursor: 'pointer' }}>
                            <Bell size={20} color="var(--text-muted)" />
                            <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: 'var(--primary)', borderRadius: '50%' }}></div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.username}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.tenantId}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <section style={{ flex: 1 }}>
                    {children}
                </section>
            </main>
        </div>
    );
};

const iconBtnStyle = {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    borderRadius: '4px'
};

export default DashboardLayout;
