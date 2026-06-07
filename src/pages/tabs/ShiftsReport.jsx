import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Download, Loader2 } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';
import { useReportFilters } from '../../contexts/ReportFilterContext';
import FilterBar from '../../components/FilterBar';
import { SortArrow } from '../../utils/useSortable';

const ShiftsReport = () => {
    const { t } = useTranslation();
    const { tenantConfig } = useTenant();
    const { dateRange } = useReportFilters();
    const [loading, setLoading] = useState(true);
    const [shifts, setShifts] = useState([]);

    // ── Sort ──
    const [sortKey, setSortKey] = useState('');
    const [sortDir, setSortDir] = useState('asc');
    const handleSort = (key) => {
        setSortKey(prev => { if (prev === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); return prev; } setSortDir('asc'); return key; });
    };
    const SHIFT_SORT_GETTERS = {
        date: (s) => new Date(s.clockIn).toISOString().split('T')[0],
        employee: (s) => (s.staffName || s.userId || ''),
        startTime: (s) => new Date(s.clockIn).getTime(),
        endTime: (s) => s.clockOut ? new Date(s.clockOut).getTime() : 0,
        totalHours: (s) => s.totalHours || 0,
    };
    const sortedShifts = useMemo(() => {
        if (!sortKey) return shifts;
        const getter = SHIFT_SORT_GETTERS[sortKey] || ((s) => s[sortKey]);
        return [...shifts].sort((a, b) => {
            let va = getter(a); if (va == null) va = '';
            let vb = getter(b); if (vb == null) vb = '';
            if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
            return sortDir === 'asc' ? (va - vb) : (vb - va);
        });
    }, [shifts, sortKey, sortDir]);

    useEffect(() => {
        fetchShifts();
    }, [dateRange]);

    const fetchShifts = async () => {
        setLoading(true);
        try {
            // Fetch timecards for the date range as shift data
            const { getMyTimecards } = await import('../../api/timecards');
            const result = await getMyTimecards();
            if (result.success) {
                const filtered = (result.data || []).filter(tc => {
                    const d = new Date(tc.clockIn).toISOString().split('T')[0];
                    return d >= dateRange.start && d <= dateRange.end;
                });
                setShifts(filtered);
            }
        } catch (err) {
            console.error('Failed to fetch shifts:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', overflow: 'auto' }}
        >
            <FilterBar />

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>{t('report.shifts', 'Shifts')}</h3>
                    <button style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Download size={14} /> {t('common.export', 'Export')}
                    </button>
                </div>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}><Loader2 className="animate-spin" size={32} /></div>
                ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <th onClick={() => handleSort('date')} style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>{t('report.date', 'Date')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="date" /></th>
                                <th onClick={() => handleSort('employee')} style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>{t('report.employee', 'Employee')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="employee" /></th>
                                <th onClick={() => handleSort('startTime')} style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>{t('report.start_time', 'Start Time')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="startTime" /></th>
                                <th onClick={() => handleSort('endTime')} style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>{t('report.end_time', 'End Time')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="endTime" /></th>
                                <th onClick={() => handleSort('totalHours')} style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>{t('report.total_hours', 'Total Hours')} <SortArrow sortKey={sortKey} sortDir={sortDir} colKey="totalHours" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedShifts.length > 0 ? sortedShifts.map((s, idx) => (
                                <tr key={s._id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>{new Date(s.clockIn).toLocaleDateString()}</td>
                                    <td style={{ padding: '0.75rem 0.5rem' }}>{s.staffName || s.userId || t('common.unknown', 'Unknown')}</td>
                                    <td style={{ padding: '0.75rem 0.5rem' }}>{new Date(s.clockIn).toLocaleTimeString()}</td>
                                    <td style={{ padding: '0.75rem 0.5rem' }}>{s.clockOut ? new Date(s.clockOut).toLocaleTimeString() : '—'}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>
                                        {s.totalHours ? `${s.totalHours.toFixed(2)}h` : '—'}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.3 }}>🕐</div>
                                        <p>{t('report.no_shift_data', 'No Shift Data')}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                )}
            </div>
        </motion.div>
    );
};

export default ShiftsReport;
