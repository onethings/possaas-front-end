import React from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Users,
    ShoppingBag,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Dashboard = () => {
    const chartData = {
        labels: ['週一', '週二', '週三', '週四', '週五', '週六', '週日'],
        datasets: [
            {
                fill: true,
                label: '銷售額 ($)',
                data: [1500, 2300, 1800, 2800, 3200, 4500, 3800],
                borderColor: 'hsl(230, 80%, 60%)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
        },
        scales: {
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'hsl(0,0%,70%)' } },
            x: { grid: { display: false }, ticks: { color: 'hsl(0,0%,70%)' } },
        },
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="animate-fade-in"
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem' }}>控制台概覽</h2>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>數據最後更新：剛剛</span>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <StatCard icon={DollarSign} label="本日營收" value="$12,850" change="+12.5%" positive />
                <StatCard icon={ShoppingBag} label="訂單數量" value="48" change="+5.2%" positive />
                <StatCard icon={Users} label="新增客戶" value="12" change="-2.1%" />
                <StatCard icon={TrendingUp} label="平均客單價" value="$267" change="+8.0%" positive />
            </div>

            {/* Main Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        銷售趨勢 <ArrowUpRight size={18} color="var(--primary)" />
                    </h3>
                    <Line data={chartData} options={chartOptions} height={100} />
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>熱門產品</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <ProductItem name="原裝墨盒 P01" sales="124" price="$1,200" />
                        <ProductItem name="維修配件套裝" sales="89" price="$450" />
                        <ProductItem name="相紙 A4 50張" sales="65" price="$180" />
                        <ProductItem name="打印機噴頭" sales="42" price="$2,800" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const StatCard = ({ icon: Icon, label, value, change, positive }) => (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)' }}>
                <Icon size={20} color="var(--primary)" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: positive ? '#4ade80' : '#f87171', fontSize: '0.85rem', fontWeight: 600 }}>
                {change} {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            </div>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{value}</div>
    </div>
);

const ProductItem = ({ name, sales, price }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)' }}>
        <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>已售 {sales}</div>
        </div>
        <div style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{price}</div>
    </div>
);

export default Dashboard;
