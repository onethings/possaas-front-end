import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Download, Loader2 } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';

const ProductSalesReport = () => {
    const { t } = useTranslation();
    const { tenantConfig } = useTenant();
    const [loading, setLoading] = useState(false);
    const [products] = useState([
        { name: 'Epson L3250', category: 'Ink', qty: 120, netSales: 27710253, cost: 12000000, profitMargin: 55 },
        { name: 'Epson L3210', category: 'Ink', qty: 98, netSales: 21672222, cost: 10500000, profitMargin: 51.6 },
        { name: 'Epson L18050', category: 'Ink', qty: 45, netSales: 13660000, cost: 6200000, profitMargin: 54.6 },
        { name: 'Epson L8050', category: 'Ink', qty: 52, netSales: 12870000, cost: 6200000, profitMargin: 51.8 },
        { name: 'Epson L14150', category: 'Ink', qty: 28, netSales: 9415000, cost: 4200000, profitMargin: 55.4 },
        { name: '003 BK', category: 'Ink', qty: 85, netSales: 680000, cost: 306000, profitMargin: 55 },
        { name: '003 C', category: 'Ink', qty: 72, netSales: 576000, cost: 465000, profitMargin: 19.21 },
    ]);

    const top5 = products.slice(0, 5);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}
        >
            {/* Filter Bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('report.date_range', '日期範圍')}:</span>
                    <span style={{ fontSize: '0.85rem' }}>3 May 2026 – 1 Jun 2026</span>
                </div>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('report.all_day', '全天')}</span>
                </div>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('report.all_employees', '所有員工')}</span>
                </div>
            </div>

            {/* Top 5 Products */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{t('report.top_5_products', '前 5 名商品')}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {top5.map((p, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: `hsl(${idx * 50}, 70%, 50%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                                        {idx + 1}
                                    </span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.name}</span>
                                </div>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-light)' }}>{tenantConfig.currency}{p.netSales.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                        <p>{t('report.chart_placeholder', '按商品圖表顯示銷售')}</p>
                        <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>{t('report.chart_coming_soon', '圖表整合敬請期待')}</p>
                    </div>
                </div>
            </div>

            {/* Product Detail Table */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>{t('report.product_details', '商品銷售明細')}</h3>
                    <button style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Download size={14} /> {t('common.export', '匯出')}
                    </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('report.product', '商品')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('report.category', '類別')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('report.qty_sold', '售出商品')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('report.net_sales', '淨銷售額')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('report.gross_profit', '毛利潤')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('report.profit_margin', '利潤率')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{p.name}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>{p.category}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{p.qty}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{tenantConfig.currency}{p.netSales.toLocaleString()}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{tenantConfig.currency}{(p.netSales - p.cost).toLocaleString()}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#4ade80' }}>{p.profitMargin}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{t('common.page_info', '頁面：1 分之 17')}</span>
                    <select style={{ background: 'rgba(0,0,0,0.2)', border: 'none', color: 'var(--text-muted)', padding: '0.3rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                        <option>10 {t('common.rows', '行')}</option>
                        <option>25 {t('common.rows', '行')}</option>
                        <option>50 {t('common.rows', '行')}</option>
                    </select>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductSalesReport;
