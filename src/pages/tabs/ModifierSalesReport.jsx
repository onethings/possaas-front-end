import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';

const ModifierSalesReport = () => {
    const { t } = useTranslation();
    const { tenantConfig } = useTenant();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}
        >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>3 May 2026 – 1 Jun 2026</span>
                </div>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('report.all_day', 'All Day')}</span>
                </div>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('report.all_employees', 'All Employees')}</span>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>{t('report.modifier_sales', 'Modifier Sales')}</h3>
                    <button style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Download size={14} /> {t('common.export', 'Export')}
                    </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{t('report.modifier', 'Modifier')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('report.qty_sold', 'Qty Sold')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('report.total_sales', 'Total Sales')}</th>
                                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t('report.net_sales', 'Net Sales')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.3 }}>📭</div>
                                    <p>{t('report.no_modifier_data', 'No Modifier Data')}</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{t('common.page_info', { current: 1, total: 1 })}</span>
                    <select style={{ background: 'rgba(0,0,0,0.2)', border: 'none', color: 'var(--text-muted)', padding: '0.3rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                        <option>10 {t('common.rows', 'Rows')}</option>
                    </select>
                </div>
            </div>
        </motion.div>
    );
};

export default ModifierSalesReport;
