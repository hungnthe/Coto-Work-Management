// src/pages/Admin/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, FileText, ClipboardList, CheckCircle2,
    Clock, Plus, TrendingUp, RefreshCw, AlertTriangle,
    BarChart2, Target, Zap,
} from 'lucide-react';
import taskService from '../../services/taskService';
import userService from '../../services/userService';

// ── Helpers ──────────────────────────────────────────────────
const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
const monthStart = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`;
};
const monthLabel = () => {
    const d = new Date();
    return `Tháng ${d.getMonth()+1}/${d.getFullYear()}`;
};

// ── Donut Chart ───────────────────────────────────────────────
const DonutChart = ({ value, max, color, size=120, stroke=14 }) => {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const pct = max > 0 ? Math.min(value / max, 1) : 0;
    const dash = pct * circ;

    return (
        <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
            <circle cx={size/2} cy={size/2} r={r} fill="none"
                    stroke={color} strokeWidth={stroke}
                    strokeDasharray={`${dash} ${circ}`}
                    strokeLinecap="round"
                    style={{ transition:'stroke-dasharray .6s ease' }}
            />
        </svg>
    );
};

// ── Bar Chart ─────────────────────────────────────────────────
const BarChart = ({ data, maxVal }) => {
    const BAR_H = 120;
    return (
        <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:BAR_H+32, padding:'0 4px' }}>
            {data.map((d, i) => {
                const h = maxVal > 0 ? Math.max(4, (d.value / maxVal) * BAR_H) : 4;
                return (
                    <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                        <div style={{ fontSize:10, color:'#94a3b8', fontWeight:600 }}>{d.value}</div>
                        <div style={{
                            width:'100%', height:h, borderRadius:'4px 4px 0 0',
                            background:d.color,
                            transition:'height .5s ease',
                            position:'relative',
                        }}>
                            <div style={{
                                position:'absolute', inset:0, borderRadius:'4px 4px 0 0',
                                background:'linear-gradient(to bottom, rgba(255,255,255,.2), transparent)',
                            }}/>
                        </div>
                        <div style={{ fontSize:10, color:'#64748b', textAlign:'center', lineHeight:1.2, fontWeight:500 }}>{d.label}</div>
                    </div>
                );
            })}
        </div>
    );
};

// ── Progress Ring label ───────────────────────────────────────
const RingCard = ({ label, value, max, color, icon }) => (
    <div style={{
        background:'white', borderRadius:14, border:'1px solid #f1f5f9',
        padding:'18px 16px', display:'flex', flexDirection:'column', alignItems:'center', gap:4,
        boxShadow:'0 2px 8px rgba(0,0,0,.05)',
    }}>
        <div style={{ position:'relative', width:88, height:88 }}>
            <DonutChart value={value} max={max} color={color} size={88} stroke={10} />
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontSize:16, fontWeight:800, color:'#0f172a' }}>{value}</span>
                <span style={{ fontSize:9, color:'#94a3b8', fontWeight:600 }}>/ {max}</span>
            </div>
        </div>
        <div style={{ fontSize:11.5, fontWeight:600, color:'#64748b', textAlign:'center' }}>{label}</div>
    </div>
);

// ── Stat Card ─────────────────────────────────────────────────
const StatCard = ({ label, value, change, Icon, color, bg }) => (
    <div style={{
        background:'white', borderRadius:14, padding:'20px 22px',
        border:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:16,
        boxShadow:'0 2px 8px rgba(0,0,0,.05)',
    }}>
        <div style={{ width:48, height:48, borderRadius:12, background:bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Icon size={22} color={color} />
        </div>
        <div>
            <div style={{ fontSize:12, color:'#64748b', marginBottom:2 }}>{label}</div>
            <div style={{ fontSize:26, fontWeight:800, color:'#0f172a', lineHeight:1 }}>{value}</div>
            <div style={{ fontSize:11, color: change?.startsWith('+') ? '#22c55e' : '#ef4444', fontWeight:600, marginTop:2 }}>
                <TrendingUp size={11} style={{ marginRight:3, display:'inline' }} />
                {change}
            </div>
        </div>
    </div>
);

// ── Main Dashboard ────────────────────────────────────────────
export default function AdminDashboard() {
    const navigate = useNavigate();
    const ACCENT = '#6366f1';

    const [stats,      setStats]      = useState(null);
    const [userCount,  setUserCount]  = useState('—');
    const [loading,    setLoading]    = useState(true);
    const [resetting,  setResetting]  = useState(false);
    const [period,     setPeriod]     = useState({ from: monthStart(), to: today() });
    const [lastReset,  setLastReset]  = useState(null);

    const loadStats = useCallback(async (from, to) => {
        setLoading(true);
        try {
            const [taskStats, users] = await Promise.all([
                taskService.getTaskStats(from, to),
                userService.getAllUsers().catch(() => []),
            ]);
            setStats(taskStats);
            const arr = Array.isArray(users) ? users : (users?.content || []);
            setUserCount(arr.length);
        } catch (e) {
            console.error('Dashboard load error:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadStats(period.from, period.to); }, []);

    // ── Reset tháng mới ──────────────────────────────────────────
    const handleReset = async () => {
        if (!window.confirm(`Bắt đầu tháng mới?\nSẽ đặt lại khoảng thống kê về ${monthLabel()}.`)) return;
        setResetting(true);
        const newFrom = monthStart();
        const newTo   = today();
        setPeriod({ from: newFrom, to: newTo });
        setLastReset(new Date().toLocaleString('vi-VN'));
        await loadStats(newFrom, newTo);
        setResetting(false);
    };

    // ── Refresh ──────────────────────────────────────────────────
    const handleRefresh = () => loadStats(period.from, period.to);

    // ── Derived ─────────────────────────────────────────────────
    const s = stats || {};
    const total      = s.total      || 0;
    const completed  = s.completed  || 0;
    const inProgress = s.inProgress || 0;
    const todo       = s.todo       || 0;
    const review     = s.review     || 0;
    const overdue    = s.overdue    || 0;
    const rate       = s.completionRate || 0;
    const byPriority = s.byPriority || {};

    const barData = [
        { label:'Hoàn thành', value: completed,  color:'#22c55e' },
        { label:'Đang làm',   value: inProgress,  color:'#6366f1' },
        { label:'Chờ',        value: todo,         color:'#f59e0b' },
        { label:'Review',     value: review,       color:'#8b5cf6' },
        { label:'Quá hạn',   value: overdue,      color:'#ef4444' },
    ];
    const maxBar = Math.max(...barData.map(b => b.value), 1);

    const priorityData = [
        { label:'Khẩn cấp', value: byPriority.URGENT || 0, color:'#ef4444' },
        { label:'Cao',       value: byPriority.HIGH   || 0, color:'#f97316' },
        { label:'Trung bình',value: byPriority.MEDIUM || 0, color:'#6366f1' },
        { label:'Thấp',      value: byPriority.LOW    || 0, color:'#22c55e' },
    ];
    const maxPriority = Math.max(...priorityData.map(d => d.value), 1);

    return (
        <div style={{ padding:28, fontFamily:"'Segoe UI',system-ui,sans-serif", background:'#f8fafc', minHeight:'100vh' }}>

            {/* ── Header ── */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
                <div>
                    <h2 style={{ fontSize:22, fontWeight:800, color:'#0f172a', margin:0 }}>Tổng quan hệ thống</h2>
                    <p style={{ color:'#64748b', fontSize:13, marginTop:4 }}>
                        Thống kê từ <strong>{period.from}</strong> đến <strong>{period.to}</strong>
                        {lastReset && <span style={{ marginLeft:8, color:'#94a3b8' }}>· Reset lúc {lastReset}</span>}
                    </p>
                </div>
                <div style={{ display:'flex', gap:10 }}>
                    <button onClick={handleRefresh} disabled={loading}
                            style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', border:'1.5px solid #e2e8f0', borderRadius:10, background:'white', cursor:'pointer', fontSize:13, fontWeight:600, color:'#64748b' }}>
                        <RefreshCw size={14} style={{ animation: loading ? 'spin .8s linear infinite' : 'none' }} />
                        Làm mới
                    </button>
                    <button onClick={handleReset} disabled={resetting}
                            style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 18px', border:'none', borderRadius:10, cursor:'pointer', fontSize:13, fontWeight:700,
                                background:'linear-gradient(135deg,#f59e0b,#d97706)', color:'white',
                                boxShadow:'0 3px 10px rgba(245,158,11,.35)', opacity: resetting ? .7 : 1 }}>
                        <RefreshCw size={14} style={{ animation: resetting ? 'spin .8s linear infinite' : 'none' }} />
                        🗓️ Bắt đầu tháng mới
                    </button>
                </div>
            </div>

            {/* ── Stat cards ── */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16, marginBottom:24 }}>
                <StatCard label="Tổng người dùng"      value={userCount}  change="+0%"  Icon={Users}        color="#6366f1" bg="#eef2ff" />
                <StatCard label="Tổng công việc tháng" value={total}      change="+0"   Icon={ClipboardList} color="#0ea5e9" bg="#e0f2fe" />
                <StatCard label="Đã hoàn thành"        value={completed}  change={`${rate}%`} Icon={CheckCircle2} color="#22c55e" bg="#dcfce7" />
                <StatCard label="Quá hạn"              value={overdue}    change={overdue > 0 ? `⚠️ ${overdue}` : '0'} Icon={AlertTriangle} color="#ef4444" bg="#fef2f2" />
            </div>

            {/* ── Main charts ── */}
            <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:20, marginBottom:20 }}>

                {/* Completion Rate — big donut */}
                <div style={{ background:'white', borderRadius:16, border:'1px solid #f1f5f9', padding:24, boxShadow:'0 2px 8px rgba(0,0,0,.05)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                        <div>
                            <h3 style={{ fontSize:15, fontWeight:700, color:'#0f172a', margin:0 }}>📊 Biểu đồ trạng thái</h3>
                            <div style={{ fontSize:12, color:'#94a3b8', marginTop:2 }}>{monthLabel()}</div>
                        </div>
                        <div style={{ textAlign:'right' }}>
                            <div style={{ fontSize:28, fontWeight:900, color: rate >= 70 ? '#22c55e' : rate >= 40 ? '#f59e0b' : '#ef4444' }}>
                                {rate}%
                            </div>
                            <div style={{ fontSize:11, color:'#94a3b8', fontWeight:500 }}>tỷ lệ hoàn thành</div>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ background:'#f1f5f9', borderRadius:8, height:12, marginBottom:20, overflow:'hidden' }}>
                        <div style={{
                            height:'100%', borderRadius:8,
                            background:`linear-gradient(90deg, #22c55e, #4ade80)`,
                            width:`${rate}%`,
                            transition:'width .8s ease',
                        }}/>
                    </div>

                    {/* Bar chart */}
                    <BarChart data={barData} maxVal={maxBar} />

                    {/* Legend */}
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'8px 16px', marginTop:8 }}>
                        {barData.map(d => (
                            <div key={d.label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11.5, color:'#64748b' }}>
                                <div style={{ width:8, height:8, borderRadius:2, background:d.color }} />
                                {d.label}: <strong>{d.value}</strong>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Priority breakdown */}
                <div style={{ background:'white', borderRadius:16, border:'1px solid #f1f5f9', padding:24, boxShadow:'0 2px 8px rgba(0,0,0,.05)' }}>
                    <h3 style={{ fontSize:15, fontWeight:700, color:'#0f172a', margin:'0 0 4px' }}>🎯 Theo độ ưu tiên</h3>
                    <div style={{ fontSize:12, color:'#94a3b8', marginBottom:20 }}>Phân bổ công việc</div>
                    <BarChart data={priorityData} maxVal={maxPriority} />

                    {/* Ring cards */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:16 }}>
                        <RingCard label="Hoàn thành"  value={completed}  max={total || 1}  color="#22c55e" />
                        <RingCard label="Đang làm"    value={inProgress} max={total || 1}  color="#6366f1" />
                    </div>
                </div>
            </div>

            {/* ── Bottom row ── */}
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20 }}>

                {/* Overdue warning */}
                {overdue > 0 && (
                    <div style={{
                        background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:14, padding:20,
                        display:'flex', alignItems:'center', gap:16,
                    }}>
                        <div style={{ width:48, height:48, borderRadius:12, background:'#fef3c7', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <AlertTriangle size={24} color="#d97706" />
                        </div>
                        <div style={{ flex:1 }}>
                            <div style={{ fontSize:14, fontWeight:700, color:'#92400e', marginBottom:4 }}>
                                ⚠️ {overdue} công việc quá hạn
                            </div>
                            <div style={{ fontSize:12.5, color:'#b45309', lineHeight:1.5 }}>
                                Có {overdue} công việc đã qua deadline nhưng chưa hoàn thành. Kiểm tra và xử lý ngay.
                            </div>
                        </div>
                        <button onClick={() => navigate('/tasks')}
                                style={{ padding:'8px 16px', border:'none', borderRadius:9, background:'#d97706', color:'white', fontSize:12.5, fontWeight:700, cursor:'pointer', flexShrink:0 }}>
                            Xem →
                        </button>
                    </div>
                )}

                {/* Quick actions */}
                <div style={{ background:'white', borderRadius:14, border:'1px solid #f1f5f9', padding:22, boxShadow:'0 2px 8px rgba(0,0,0,.05)' }}>
                    <h3 style={{ fontSize:14, fontWeight:700, color:'#0f172a', margin:'0 0 14px' }}>⚡ Thao tác nhanh</h3>
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        {[
                            { icon: Plus,          label:'Thêm người dùng',  path:'/admin/users/create', color:'#6366f1' },
                            { icon: ClipboardList, label:'Giao công việc',    path:'/tasks',              color:'#22c55e' },
                            { icon: Users,         label:'Quản lý đơn vị',   path:'/admin/units',        color:'#8b5cf6' },
                        ].map(a => (
                            <button key={a.label} onClick={() => a.path && navigate(a.path)}
                                    style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
                                        borderRadius:10, border:'1px solid #f1f5f9', background:'#f8fafc',
                                        cursor:'pointer', fontSize:13, fontWeight:500, color:'#334155', textAlign:'left',
                                        transition:'all .15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.background='#eef2ff'; e.currentTarget.style.borderColor=a.color; }}
                                    onMouseLeave={e => { e.currentTarget.style.background='#f8fafc'; e.currentTarget.style.borderColor='#f1f5f9'; }}
                            >
                                <a.icon size={15} color={a.color} />
                                {a.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* System info */}
                <div style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius:14, padding:22, color:'white', boxShadow:'0 4px 16px rgba(99,102,241,.3)' }}>
                    <h3 style={{ fontSize:14, fontWeight:700, margin:'0 0 12px' }}>🖥️ Hệ thống</h3>
                    <div style={{ fontSize:12.5, lineHeight:2 }}>
                        {[
                            ['Phiên bản',   '2.1.0'],
                            ['Cập nhật',    '26/03/2026'],
                            ['Uptime',      '99.9%'],
                            ['Người dùng',  String(userCount)],
                            ['Task tháng',  String(total)],
                        ].map(([k, v]) => (
                            <div key={k} style={{ display:'flex', justifyContent:'space-between', opacity:.9 }}>
                                <span>{k}:</span><strong>{v}</strong>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}