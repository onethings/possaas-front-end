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
    Timer
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
    { icon: LayoutDashboard, label: '概覽', path: '/dashboard' },
    { icon: Ticket, label: '收銀終端 (POS)', path: '/pos' },
    { icon: Package, label: '產品管理', path: '/products' },
    { icon: ClipboardList, label: '庫存盤點', path: '/inventory/counts' },
    { icon: FileText, label: '採購進貨', path: '/inventory/purchase-orders' },
    { icon: Truck, label: '供應商', path: '/inventory/suppliers' },
    { icon: Tags, label: '折扣管理', path: '/discounts' },
    { icon: ShoppingCart, label: '訂單管理', path: '/orders' },
    { icon: Users, label: '客戶資料', path: '/customers' },
    { icon: UserCheck, label: '員工管理', path: '/staff' },
    { icon: Timer, label: '出勤打卡', path: '/staff/timecards' },
    { icon: BarChart, label: '員工績效', path: '/staff/reports' },
    { icon: Settings, label: '系統設置', path: '/settings' },
];




const DashboardLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();

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

                <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
                                    background: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
                                }}
                            >
                                <item.icon size={20} />
                                {isSidebarOpen && <span>{item.label}</span>}
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
                        {isSidebarOpen && <span>登出系統</span>}
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
                            type="text"
                            placeholder="搜尋訂單、產品..."
                            style={{ padding: '0.6rem 1rem 0.6rem 40px', background: 'rgba(0,0,0,0.2)', border: 'none', borderRadius: 'var(--radius-md)', color: 'white', width: '100%' }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
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
