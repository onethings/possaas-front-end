import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';
import FilterBar from '../../components/FilterBar';
import { usePagination } from '../../utils/usePagination';

const ModifierSalesReport = () => {
    const { t } = useTranslation();
    const { tenantConfig } = useTenant();
    const [modifiers] = useState([]);
    const { page, setPage, pageSize, setPageSize, totalPages, pagedData } = usePagination(modifiers, 10);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}
        >
            <FilterBar />

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
                    <span>{t('common.page_info', { current: page, total: totalPages })}</span>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button onClick={() => setPage(page - 1)} disabled={page <= 1}
                            style={{ padding: '0.2rem 0.4rem', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: page <= 1 ? 'rgba(255,255,255,0.2)' : 'var(--text-muted)', cursor: page <= 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center' }}>
                            <ChevronLeft size={14} />
                        </button>
                        <button onClick={() => setPage(page + 1)} disabled={page >= totalPages}
                            style={{ padding: '0.2rem 0.4rem', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: page >= totalPages ? 'rgba(255,255,255,0.2)' : 'var(--text-muted)', cursor: page >= totalPages ? 'default' : 'pointer', display: 'flex', alignItems: 'center' }}>
                            <ChevronRight size={14} />
                        </button>
                    </div>
                    <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}
                        style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)', padding: '0.3rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>
                        <option value={10}>10 {t('common.rows', 'Rows')}</option>
                        <option value={25}>25 {t('common.rows', 'Rows')}</option>
                        <option value={50}>50 {t('common.rows', 'Rows')}</option>
                        <option value={100}>100 {t('common.rows', 'Rows')}</option>
                    </select>
                </div>
            </div>
        </motion.div>
    );
};

export default ModifierSalesReport;
