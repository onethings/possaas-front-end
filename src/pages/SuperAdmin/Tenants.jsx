import React from 'react';
import { motion } from 'framer-motion';
import {
    Building,
    ShieldCheck,
    Calendar,
    MoreVertical,
    Plus
} from 'lucide-react';

const Tenants = () => {
    const mockTenants = [
        { id: 'T-101', name: '快印王專業店', email: 'owner1@fastprint.com', status: 'active', expiry: '2026-12-31' },
        { id: 'T-102', name: '超星連鎖店', email: 'boss@superstar.com', status: 'active', expiry: '2026-08-15' },
        { id: 'T-103', name: '測試工作室', email: 'test@lab.com', status: 'pending', expiry: '2026-02-01' },
        { id: 'T-104', name: '舊版客戶 A', email: 'old@archive.com', status: 'disabled', expiry: '2025-10-10' },
    ];

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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {mockTenants.map(tenant => (
                    <div key={tenant.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                                <Building size={24} color="var(--primary)" />
                            </div>
                            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><MoreVertical size={18} /></button>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{tenant.name}</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{tenant.email}</p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                                ID: {tenant.id}
                            </span>
                            <span style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                background: tenant.status === 'active' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                                color: tenant.status === 'active' ? '#4ade80' : '#f87171'
                            }}>
                                {tenant.status.toUpperCase()}
                            </span>
                        </div>

                        <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            <Calendar size={14} /> 到期日: {tenant.expiry}
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default Tenants;
