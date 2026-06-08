import React, { useState, useEffect } from 'react';
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
    Globe,
    TrendingUp,
    Percent,
    Receipt,
    Moon,
    Sun,
    HelpCircle,
    MessageCircle,
    UsersRound,
    KeyRound,
    CreditCard,
    Gift,
    Store,
    Monitor,
    BookOpen,
    Split,
    Layers,
    Handshake,
    ArrowLeftRight,
    ScrollText,
    TimerReset,
    Building2,
    AppWindow,
    Database,
    AlertTriangle,
    History,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTabs } from '../contexts/TabContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import TabBar from '../components/TabBar';
import TabContent from '../components/TabContent';

// ========== Page Imports ==========
import Dashboard from '../pages/Dashboard';
import Products from '../pages/Products';
import Orders from '../pages/Orders';
import Customers from '../pages/Customers';
import StaffManagement from '../pages/StaffManagement';
import SettingsPage from '../pages/Settings';
import Discounts from '../pages/Discounts';
import InventoryCounts from '../pages/InventoryCounts';
import PurchaseOrders from '../pages/PurchaseOrders';
import Suppliers from '../pages/Suppliers';
import Timecards from '../pages/Timecards';
import StaffReports from '../pages/StaffReports';
import RevenueReport from '../pages/RevenueReport';
import DeveloperSettings from '../pages/DeveloperSettings';
import POS from '../pages/POS';
// Report tab components
import SalesSummaryPage from '../pages/tabs/SalesSummary';
import ProductSalesReport from '../pages/tabs/ProductSalesReport';
import CategorySalesReport from '../pages/tabs/CategorySalesReport';
import EmployeeSalesReport from '../pages/tabs/EmployeeSalesReport';
import PaymentTypeReport from '../pages/tabs/PaymentTypeReport';
import ReceiptsReport from '../pages/tabs/ReceiptsReport';
import ModifierSalesReport from '../pages/tabs/ModifierSalesReport';
import DiscountReport from '../pages/tabs/DiscountReport';
import TaxReport from '../pages/tabs/TaxReport';
import ShiftsReport from '../pages/tabs/ShiftsReport';
// Product tab components
import CategoriesPage from '../pages/tabs/CategoriesPage';
import ModifiersPage from '../pages/tabs/ModifiersPage';
import DiscountMgmtPage from '../pages/tabs/DiscountMgmtPage';
// Employee tab components
import AccessRightsPage from '../pages/tabs/AccessRightsPage';
// Integration tab components
import IntegrationApps from '../pages/tabs/IntegrationApps';
import AccessTokens from '../pages/tabs/AccessTokens';
import ApiDocsPage from '../pages/tabs/ApiDocsPage';
import LoyversePage from '../pages/tabs/LoyversePage';
// Settings tab components
import FeatureSettings from '../pages/tabs/FeatureSettings';
import BillingPage from '../pages/tabs/BillingPage';
import PaymentMethodsPage from '../pages/tabs/PaymentMethodsPage';
import LoyaltyPage from '../pages/tabs/LoyaltyPage';
import TaxSettingsPage from '../pages/tabs/TaxSettingsPage';
import ReceiptSettingsPage from '../pages/tabs/ReceiptSettingsPage';
import StoresPage from '../pages/tabs/StoresPage';
import POSDevicesPage from '../pages/tabs/POSDevicesPage';
// Help tab components
import HelpCenter from '../pages/tabs/HelpCenter';
// Inventory management pages
import InventoryHistory from '../pages/tabs/InventoryHistory';
import LowStockAlert from '../pages/tabs/LowStockAlert';

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

// ========== Sidebar Navigation Groups ==========
const sidebarGroups = [
    {
        label: 'navGroup.reports',
        items: [
            { id: 'sales-summary',      icon: TrendingUp,   title: 'nav.sales_summary',     component: SalesSummaryPage },
            { id: 'product-sales',       icon: Package,      title: 'nav.product_sales',     component: ProductSalesReport },
            { id: 'category-sales',      icon: Layers,       title: 'nav.category_sales',    component: CategorySalesReport },
            { id: 'employee-sales',      icon: Users,        title: 'nav.employee_sales',    component: EmployeeSalesReport },
            { id: 'payment-type-sales',  icon: CreditCard,   title: 'nav.payment_sales',     component: PaymentTypeReport },
            { id: 'receipts-report',     icon: Receipt,      title: 'nav.receipts_report',   component: ReceiptsReport },
            { id: 'modifier-sales',      icon: Split,        title: 'nav.modifier_sales',    component: ModifierSalesReport },
            { id: 'discount-report',     icon: Percent,      title: 'nav.discount_report',   component: DiscountReport },
            { id: 'tax-report',          icon: ScrollText,   title: 'nav.tax_report',        component: TaxReport },
            { id: 'shifts-report',       icon: TimerReset,   title: 'nav.shifts_report',     component: ShiftsReport },
        ]
    },
    {
        label: 'navGroup.products',
        items: [
            { id: 'product-list',       icon: Package,      title: 'nav.product_list',      component: Products },
            { id: 'categories',         icon: Layers,       title: 'nav.categories',        component: CategoriesPage },
            { id: 'modifiers',          icon: Split,        title: 'nav.modifiers',         component: ModifiersPage },
            { id: 'discount-mgmt',      icon: Tags,         title: 'nav.discount_mgmt',     component: DiscountMgmtPage },
        ]
    },
    {
        label: 'navGroup.inventory',
        items: [
            { id: 'inventory-mgmt',     icon: ClipboardList, title: 'nav.inventory_overview', component: InventoryCounts },
            { id: 'purchase-orders',    icon: FileText,     title: 'nav.purchase_order',    component: PurchaseOrders },
            { id: 'suppliers',          icon: Truck,        title: 'nav.suppliers',         component: Suppliers },
            { id: 'inventory-counts',   icon: ClipboardList, title: 'nav.inventory_count',   component: InventoryCounts },
            { id: 'inventory-history',  icon: History,      title: 'nav.inventory_history', component: InventoryHistory },
            { id: 'low-stock-alert',    icon: AlertTriangle,title: 'nav.low_stock_alert',   component: LowStockAlert },
        ]
    },
    {
        label: 'navGroup.employees',
        items: [
            { id: 'employee-list',     icon: Users,        title: 'nav.employee_list',     component: StaffManagement },
            { id: 'access-rights',     icon: KeyRound,     title: 'nav.access_rights',     component: AccessRightsPage },
            { id: 'timecards',         icon: Timer,        title: 'nav.attendance',        component: Timecards },
            { id: 'staff-reports',     icon: BarChart,     title: 'nav.staff_performance', component: StaffReports },
        ]
    },
    {
        label: 'navGroup.customers',
        items: [
            { id: 'customers',         icon: UsersRound,   title: 'nav.customer_data',     component: Customers },
        ]
    },
    {
        label: 'navGroup.integrations',
        items: [
            { id: 'integration-apps',  icon: AppWindow,    title: 'nav.integration_apps',  component: IntegrationApps },
            { id: 'access-tokens',     icon: KeyRound,     title: 'nav.access_tokens',     component: AccessTokens },
            { id: 'api-docs',           icon: BookOpen,     title: 'nav.api_docs',          component: ApiDocsPage },
            { id: 'loyverse',           icon: Database,     title: 'nav.loyverse',          component: LoyversePage },
        ]
    },
    {
        label: 'navGroup.settings',
        items: [
            { id: 'feature-settings',    icon: Settings,     title: 'nav.feature_settings',    component: FeatureSettings },
            { id: 'billing',             icon: CreditCard,   title: 'nav.billing',             component: BillingPage },
            { id: 'payment-methods',     icon: CreditCard,   title: 'nav.payment_methods',     component: PaymentMethodsPage },
            { id: 'loyalty',             icon: Gift,         title: 'nav.loyalty',             component: LoyaltyPage },
            { id: 'tax-settings',        icon: ScrollText,   title: 'nav.tax_settings',        component: TaxSettingsPage },
            { id: 'receipt-settings',    icon: Receipt,      title: 'nav.receipt_settings',    component: ReceiptSettingsPage },
            { id: 'stores',              icon: Store,        title: 'nav.stores',              component: StoresPage },
            { id: 'pos-devices',         icon: Monitor,      title: 'nav.pos_devices',         component: POSDevicesPage },
        ]
    },
    {
        label: 'navGroup.help',
        items: [
            { id: 'help-center',    icon: HelpCircle,   title: 'nav.help_center',  component: HelpCenter },
            { id: 'community',      icon: MessageCircle, title: 'nav.community',    component: HelpCenter },
            { id: 'live-chat',      icon: MessageCircle, title: 'nav.live_chat',   component: HelpCenter },
        ]
    },
];


const DashboardLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const { addTab, activeTabId } = useTabs();
    const { toggleTheme, isLight } = useTheme();
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [expandedGroups, setExpandedGroups] = useState({});
    const { t, i18n } = useTranslation();

    const changeLanguage = (e) => {
        const newLang = e.target.value;
        i18n.changeLanguage(newLang);
        document.dir = newLang === 'ar-SA' ? 'rtl' : 'ltr';
    };

    const toggleGroup = (groupLabel) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupLabel]: !prev[groupLabel]
        }));
    };

    // Open the overview tab by default on first mount
    useEffect(() => {
        addTab('sales-summary', {
            title: t('nav.sales_summary'),
            icon: TrendingUp,
            component: SalesSummaryPage,
        });
    }, []);

    const handleNavClick = (item) => {
        addTab(item.id, {
            title: t(item.title),
            icon: item.icon,
            component: item.component,
        });
    };

    return (
        <div style={{ display: 'flex', height: '100vh', minHeight: '100vh', backgroundColor: 'var(--bg-dark)', overflow: 'hidden' }}>
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
                {/* Logo & Toggle */}
                <div style={{
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isSidebarOpen ? 'space-between' : 'center',
                    borderBottom: '1px solid var(--glass-border)'
                }}>
                    {isSidebarOpen && (
                        <span className="gradient-text" style={{ fontWeight: 800, fontSize: '1.2rem' }}>
                            Kevin POS
                        </span>
                    )}
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} style={iconBtnStyle}>
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav style={{
                    flex: 1,
                    padding: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    overflowY: 'auto',
                    scrollbarWidth: 'none'
                }}>
                    {sidebarGroups.map((group) => (
                        <div key={group.label} style={{ marginBottom: '0.25rem' }}>
                            {/* Group Header */}
                            {isSidebarOpen && (
                                <div
                                    onClick={() => toggleGroup(group.label)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        cursor: 'pointer',
                                        color: 'var(--text-muted)',
                                        fontSize: '1.0rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        transition: 'color 0.2s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                                >
                                    <span>{t(group.label)}</span>
                                    <span style={{ fontSize: '0.6rem', transform: expandedGroups[group.label] ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                                        ▶
                                    </span>
                                </div>
                            )}

                            {/* Group Items */}
                            {(expandedGroups[group.label] || !isSidebarOpen) && group.items.map((item) => {
                                const isActive = activeTabId === item.id;
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => handleNavClick(item)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '0.55rem 0.75rem',
                                            borderRadius: 'var(--radius-md)',
                                            cursor: 'pointer',
                                            color: isActive ? 'var(--primary-light)' : 'var(--text-muted)',
                                            gap: '0.75rem',
                                            transition: 'all 0.2s ease',
                                            background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                            whiteSpace: 'nowrap',
                                            marginLeft: isSidebarOpen ? '0.5rem' : '0',
                                            fontSize: '0.85rem',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isActive) e.currentTarget.style.background = 'var(--hover-bg)';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive) e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        <item.icon size={18} style={{ minWidth: '18px', flexShrink: 0 }} />
                                        <AnimatePresence mode="wait">
                                            {isSidebarOpen && (
                                                <motion.span
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -10 }}
                                                    transition={{ duration: 0.15 }}
                                                    style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                                                >
                                                    {t(item.title)}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* Logout */}
                <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)' }}>
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
                            gap: '1rem',
                            fontSize: '0.85rem',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 77, 77, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span>{t('logout', '登出系統')}</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: '1rem',
                gap: '0.5rem',
                maxHeight: '100vh',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <header className="glass-panel" style={{
                    padding: '0.75rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            id="global-search"
                            name="global-search"
                            type="text"
                            placeholder={t('search_placeholder', '搜尋訂單、產品...')}
                            style={{
                                padding: '0.5rem 1rem 0.5rem 40px',
                                background: 'var(--input-bg)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--text-main)',
                                width: '100%',
                                fontSize: '0.85rem',
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                            style={{
                                background: 'var(--badge-bg)',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                padding: '0.4rem',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                            {isLight ? <Moon size={18} /> : <Sun size={18} />}
                        </button>

                        {/* Language Switcher */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'var(--badge-bg)',
                            padding: '0.3rem 0.8rem',
                            borderRadius: 'var(--radius-md)'
                        }}>
                            <Globe size={16} color="var(--text-muted)" />
                            <select
                                id="header-language"
                                name="header-language"
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
                                    <option key={lang.code} value={lang.code} style={{ background: 'var(--select-bg)', color: 'var(--text-main)' }}>
                                        {lang.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ position: 'relative', cursor: 'pointer' }}>
                            <Bell size={18} color="var(--text-muted)" />
                            <div style={{
                                position: 'absolute',
                                top: -2,
                                right: -2,
                                width: 8,
                                height: 8,
                                background: 'var(--primary)',
                                borderRadius: '50%'
                            }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                            <div style={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                            }}>
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.username}</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user?.tenantId}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Tab Bar */}
                <TabBar />

                {/* Tab Content */}
                <section style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                    <TabContent />
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
