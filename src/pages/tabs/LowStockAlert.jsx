import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Loader2, AlertTriangle, Package } from 'lucide-react';
import { getLowStockProducts } from '../../api/products';
import { useTenant } from '../../contexts/TenantContext';

const LowStockAlert = () => {
    const { t } = useTranslation();
    const { tenantConfig } = useTenant();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await getLowStockProducts();
            if (result.success) setProducts(result.data || []);
        } catch (err) {
            console.error('Failed to fetch low stock products:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <Loader2 className="animate-spin" size={32} /> {t('common.loading')}
            </div>
        );
    }

    const totalLowStockItems = products.reduce((acc, p) => {
        if (p.hasVariants && p.variants) return acc + p.variants.length;
        return acc + 1;
    }, 0);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{t('report.low_stock_alert', 'Low Stock Alert')}</h2>
                {totalLowStockItems > 0 && (
                    <span style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                        <AlertTriangle size={14} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />
                        {totalLowStockItems} {t('report.items_below_threshold', 'items below threshold')}
                    </span>
                )}
            </div>

            {totalLowStockItems === 0 ? (
                <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>✅</div>
                    <p>{t('report.all_stock_healthy', 'All Stock Healthy')}</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {products.map(p => (
                        <div key={p._id} className="glass-panel" style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: p.hasVariants && p.variants?.length > 0 ? '0.75rem' : '0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Package size={18} />
                                    <span style={{ fontWeight: 600 }}>{p.name}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.sku}</span>
                                </div>
                                {!p.hasVariants && (
                                    <span style={{ color: '#f87171', fontWeight: 600, fontSize: '0.9rem' }}>
                                        {p.stock} / {p.lowStockThreshold || 0}
                                    </span>
                                )}
                            </div>
                            {p.hasVariants && p.variants?.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                                    {p.variants.map((v, vIdx) => (
                                        <div key={vIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                                            <span style={{ fontSize: '0.85rem' }}>{v.name} ({v.sku})</span>
                                            <span style={{ color: '#f87171', fontWeight: 600, fontSize: '0.85rem' }}>
                                                {v.stock} / {v.lowStockThreshold || 0}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default LowStockAlert;
