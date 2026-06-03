import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GuidedTour from '../components/GuidedTour';
import { pageTours } from '../utils/pageTours';
import { motion } from 'framer-motion';
import { Clock, LogIn, LogOut, Loader2, Calendar } from 'lucide-react';
import { getMyTimecards, clockIn, clockOut } from '../api/timecards';

const Timecards = () => {
    const { t } = useTranslation();
    const [timecards, setTimecards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [activeCard, setActiveCard] = useState(null);

    useEffect(() => {
        fetchTimecards();
    }, []);

    const fetchTimecards = async () => {
        setLoading(true);
        try {
            const result = await getMyTimecards();
            if (result.success) {
                setTimecards(result.data);
                const active = result.data.find(tc => !tc.clockOut);
                setActiveCard(active);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleClockAction = async (action) => {
        setSubmitting(true);
        try {
            const result = action === 'in' ? await clockIn() : await clockOut();
            if (result.success) {
                fetchTimecards();
            }
        } catch (error) {
            alert(error.response?.data?.message || t('timecards.alerts.action_fail'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="animate-fade-in flex flex-col gap-4 md:gap-6 p-4 md:p-0"
        >
            <h2 className="text-xl md:text-2xl font-semibold">{t('timecards.title')}</h2>

            {/* 打卡主控制面板 */}
            <div className="glass-panel p-6 md:p-8 flex flex-col items-center gap-4 md:gap-6 text-center">
                <div style={statusCircleStyle(activeCard)}>
                    <Clock size={40} />
                </div>
                <div>
                    <h3 className="text-xl md:text-2xl font-medium mb-2">
                        {activeCard ? t('timecards.status.working') : t('timecards.status.off_duty')}
                    </h3>
                    {activeCard && (
                        <p style={{ color: 'var(--text-muted)' }} className="text-sm md:text-base">
                            {t('timecards.status.clock_in_time', { time: new Date(activeCard.clockIn).toLocaleString() })}
                        </p>
                    )}
                </div>

                <div className="w-full flex justify-center px-4 md:px-0">
                    {!activeCard ? (
                        <button
                            onClick={() => handleClockAction('in')}
                            disabled={submitting}
                            className="btn-primary w-full sm:w-auto px-8 py-3.5 flex items-center justify-center gap-3 text-base md:text-lg"
                        >
                            {submitting ? <Loader2 className="animate-spin" /> : <><LogIn size={20} /> {t('timecards.buttons.clock_in')}</>}
                        </button>
                    ) : (
                        <button
                            onClick={() => handleClockAction('out')}
                            disabled={submitting}
                            className="green-btn w-full sm:w-auto px-8 py-3.5 flex items-center justify-center gap-3 text-base md:text-lg rounded-md"
                            style={{ background: '#4ade80', color: 'black' }}
                        >
                            {submitting ? <Loader2 className="animate-spin" /> : <><LogOut size={20} /> {t('timecards.buttons.clock_out')}</>}
                        </button>
                    )}
                </div>
            </div>

            {/* 歷史記錄區塊 */}
            <div className="glass-panel p-4 md:p-6">
                <h4 className="text-base md:text-lg font-medium mb-4 flex items-center gap-2">
                    <Calendar size={18} /> {t('timecards.history.title')}
                </h4>
                
                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                ) : (
                    <>
                        {/* 1. 桌面端顯示的表格 (md 以上顯示) */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="text-left border-b border-white/10 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                                        <th className="p-4">{t('timecards.history.table.date')}</th>
                                        <th className="p-4">{t('timecards.history.table.clock_in')}</th>
                                        <th className="p-4">{t('timecards.history.table.clock_out')}</th>
                                        <th className="p-4">{t('timecards.history.table.total_hours')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {timecards.map(tc => (
                                        <tr key={tc._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-4">{new Date(tc.clockIn).toLocaleDateString()}</td>
                                            <td className="p-4">{new Date(tc.clockIn).toLocaleTimeString()}</td>
                                            <td className="p-4">
                                                {tc.clockOut ? new Date(tc.clockOut).toLocaleTimeString() : <span style={{ color: 'var(--primary-light)' }}>{t('timecards.status.in_progress')}</span>}
                                            </td>
                                            <td className="p-4 font-bold">{tc.totalHours ? tc.totalHours.toFixed(2) : '--'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* 2. 手機端顯示的卡片清單 (md 以下顯示) */}
                        <div className="block md:hidden flex flex-col gap-3">
                            {timecards.map(tc => (
                                <div key={tc._id} className="border border-white/10 rounded-lg p-4 bg-white/5 flex flex-col gap-2 text-sm">
                                    <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-1">
                                        <span className="font-medium text-white/90">{new Date(tc.clockIn).toLocaleDateString()}</span>
                                        <span className="font-bold text-base text-emerald-400">
                                            {tc.totalHours ? `${tc.totalHours.toFixed(2)} hrs` : '--'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span style={{ color: 'var(--text-muted)' }}>{t('timecards.history.table.clock_in')}</span>
                                        <span>{new Date(tc.clockIn).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span style={{ color: 'var(--text-muted)' }}>{t('timecards.history.table.clock_out')}</span>
                                        <span>
                                            {tc.clockOut ? new Date(tc.clockOut).toLocaleTimeString() : <span style={{ color: 'var(--primary-light)' }}>{t('timecards.status.in_progress')}</span>}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
};

const statusCircleStyle = (active) => ({
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: active ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255, 255, 255, 0.05)',
    color: active ? '#4ade80' : 'var(--text-muted)',
    border: `2px solid ${active ? '#4ade80' : 'rgba(255,255,255,0.1)'}`,
    boxShadow: active ? '0 0 20px rgba(74, 222, 128, 0.2)' : 'none'
});


export default Timecards;