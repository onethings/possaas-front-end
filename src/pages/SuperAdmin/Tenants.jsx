import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Building,
    ShieldCheck,
    Calendar,
    MoreVertical,
    Plus,
    Loader2
} from 'lucide-react';
import { getTenants } from '../../api/tenants';
import { useAuth } from '../../contexts/AuthContext';

const Tenants = () => {
    const { user } = useAuth();
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user && user.role <= 2) {
            fetchTenants();
        } else {
            setError('權限不足，僅系統管理員可訪問');
            setLoading(false);
        }
    }, [user]);

    const fetchTenants = async () => {
        setLoading(true);
        try {
            const result = await getTenants();
            if (result.success) {
                setTenants(result.data);
            } else {
                setError('無法讀取租戶列表');
            }
        } catch (err) {
            setError('伺服器連線失敗');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="animate-fade-in"
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem' }}>租戶管理 (SuperAdmin)</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>管理系統內所有旗艦店、代理商及公司帳號</p>
                </div>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} /> 創建新租戶
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', minHeight: '300px' }}>
                {loading ? (
                    <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                        <Loader2 className="animate-spin" size={32} /> 讀取中...
                    </div>
                ) : error ? (
                    <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
                        {error}
                    </div>
                ) : tenants.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        目前沒有租戶數據
                    </div>
                ) : (
                    tenants.map(tenant => (
                        <div key={tenant._id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                                    <Building size={24} color="var(--primary)" />
                                </div>
                                <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><MoreVertical size={18} /></button>
                            </div>

                            <div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{tenant.name}</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>租戶核心已就緒: {tenant.status}</p>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                                    ID: {tenant._id?.substring(0, 8)}...
                                </span>
                                <span style={{
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    background: tenant.status === 'active' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                                    color: tenant.status === 'active' ? '#4ade80' : '#f87171'
                                }}>
                                    {tenant.status?.toUpperCase() || 'UNKNOWN'}
                                </span>
                            </div>

                            <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                <Calendar size={14} /> 創建於: {new Date(tenant.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))
                )}
            </div>

        </motion.div>
    );
};

export default Tenants;
