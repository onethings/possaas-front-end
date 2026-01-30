import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, LogIn, LogOut, Loader2, Calendar, Timer } from 'lucide-react';
import { getMyTimecards, clockIn, clockOut } from '../api/timecards';

const Timecards = () => {
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
            alert(error.response?.data?.message || '操作失敗');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem' }}>出勤管理 (Timecard)</h2>

            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center' }}>
                <div style={statusCircleStyle(activeCard)}>
                    <Clock size={40} />
                </div>
                <div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{activeCard ? '目前正在上班中' : '目前尚未上班'}</h3>
                    {activeCard && (
                        <p style={{ color: 'var(--text-muted)' }}>
                            上線時間: {new Date(activeCard.clockIn).toLocaleString()}
                        </p>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    {!activeCard ? (
                        <button
                            onClick={() => handleClockAction('in')}
                            disabled={submitting}
                            className="btn-primary"
                            style={{ padding: '1rem 2.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.1rem' }}
                        >
                            {submitting ? <Loader2 className="animate-spin" /> : <><LogIn size={20} /> 打卡上班</>}
                        </button>
                    ) : (
                        <button
                            onClick={() => handleClockAction('out')}
                            disabled={submitting}
                            className="green-btn"
                            style={{ padding: '1rem 2.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.1rem', background: '#4ade80', color: 'black' }}
                        >
                            {submitting ? <Loader2 className="animate-spin" /> : <><LogOut size={20} /> 打卡下班</>}
                        </button>
                    )}
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h4 style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={18} /> 出勤歷史紀錄
                </h4>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}><Loader2 className="animate-spin" /></div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                <th style={{ padding: '1rem' }}>日期</th>
                                <th style={{ padding: '1rem' }}>上班時間</th>
                                <th style={{ padding: '1rem' }}>下班時間</th>
                                <th style={{ padding: '1rem' }}>總時數 (HR)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {timecards.map(tc => (
                                <tr key={tc._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem' }}>{new Date(tc.clockIn).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem' }}>{new Date(tc.clockIn).toLocaleTimeString()}</td>
                                    <td style={{ padding: '1rem' }}>{tc.clockOut ? new Date(tc.clockOut).toLocaleTimeString() : <span style={{ color: 'var(--primary-light)' }}>進行中...</span>}</td>
                                    <td style={{ padding: '1rem', fontWeight: 700 }}>{tc.totalHours ? tc.totalHours.toFixed(2) : '--'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
