// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import taskService from '../services/taskService';
import ASSETS from '../config/assets';

// ── Mock data ────────────────────────────────────────────────
const ANNOUNCEMENTS = [
    {
        id: 1,
        type: 'info',
        title: 'Lịch nghỉ lễ 30/4 - 1/5',
        content: 'Toàn thể cán bộ, nhân viên được nghỉ từ 28/04 đến 01/05/2026. Chúc mọi người kỳ nghỉ vui vẻ!',
        author: 'Ban Quản trị',
        date: '22/03/2026',
        pinned: true,
    },
    {
        id: 2,
        type: 'warning',
        title: 'Cập nhật quy trình phê duyệt tài liệu',
        content: 'Kể từ 01/04/2026, tất cả tài liệu nội bộ cần được phê duyệt qua hệ thống trước khi gửi ra ngoài.',
        author: 'Phòng HC',
        date: '18/03/2026',
        pinned: false,
    },
    {
        id: 3,
        type: 'success',
        title: 'Ra mắt tính năng giao việc online',
        content: 'Hệ thống đã cập nhật tính năng giao việc trực tuyến với thông báo realtime. Mời mọi người trải nghiệm!',
        author: 'Phòng CNTT',
        date: '15/03/2026',
        pinned: false,
    },
    {
        id: 4,
        type: 'info',
        title: 'Đào tạo sử dụng hệ thống mới',
        content: 'Buổi đào tạo hướng dẫn sử dụng hệ thống quản lý công việc sẽ diễn ra vào 10h sáng thứ 6 tuần này.',
        author: 'Phòng CNTT',
        date: '10/03/2026',
        pinned: false,
    },
];

const URGENT_TASKS_MOCK = [
    { id:1, title:'Báo cáo tiến độ dự án CNTT', priority:'URGENT', dueDate:'2026-03-27', status:'IN_PROGRESS' },
    { id:2, title:'Kiểm tra hạ tầng server backup', priority:'HIGH', dueDate:'2026-03-28', status:'TODO' },
    { id:3, title:'Hoàn thiện tài liệu hướng dẫn', priority:'HIGH', dueDate:'2026-03-29', status:'IN_PROGRESS' },
    { id:4, title:'Review code sprint 5', priority:'URGENT', dueDate:'2026-03-27', status:'REVIEW' },
    { id:5, title:'Cập nhật quy trình bảo mật', priority:'HIGH', dueDate:'2026-03-30', status:'TODO' },
];

// ── Helpers ──────────────────────────────────────────────────
const PRIORITY_CFG = {
    URGENT: { label:'Khẩn cấp', bg:'#fef2f2', color:'#dc2626', dot:'#ef4444' },
    HIGH:   { label:'Cao',      bg:'#fff7ed', color:'#c2410c', dot:'#f97316' },
    MEDIUM: { label:'TB',       bg:'#eff6ff', color:'#1d4ed8', dot:'#3b82f6' },
    LOW:    { label:'Thấp',     bg:'#f0fdf4', color:'#15803d', dot:'#22c55e' },
};
const STATUS_CFG = {
    TODO:        { label:'Chưa làm',    bg:'#f1f5f9', color:'#64748b' },
    IN_PROGRESS: { label:'Đang làm',   bg:'#eff6ff', color:'#1d4ed8' },
    REVIEW:      { label:'Chờ duyệt',  bg:'#faf5ff', color:'#7c3aed' },
    COMPLETED:   { label:'Hoàn thành', bg:'#f0fdf4', color:'#15803d' },
};
const ANNOUNCE_CFG = {
    info:    { icon:'📢', border:'#bfdbfe', bg:'#eff6ff', badge:'#1d4ed8', badgeBg:'#dbeafe' },
    warning: { icon:'⚠️', border:'#fed7aa', bg:'#fff7ed', badge:'#c2410c', badgeBg:'#ffedd5' },
    success: { icon:'✅', border:'#bbf7d0', bg:'#f0fdf4', badge:'#15803d', badgeBg:'#dcfce7' },
};

const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`;
};
const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Chào buổi sáng';
    if (h < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
};

// ── Feedback Modal ────────────────────────────────────────────
const FeedbackModal = ({ onClose }) => {
    const [form, setForm] = useState({ type:'bug', title:'', content:'' });
    const [sent, setSent] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.content.trim()) return;
        // TODO: gọi API gửi feedback
        console.log('Feedback:', form);
        setSent(true);
        setTimeout(onClose, 1800);
    };

    return (
        <>
            <div style={{position:'fixed',inset:0,background:'rgba(15,23,42,.45)',backdropFilter:'blur(4px)',zIndex:1000}} onClick={onClose}/>
            <div style={{position:'fixed',inset:0,zIndex:1001,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
                <div style={{background:'white',borderRadius:20,width:'100%',maxWidth:480,boxShadow:'0 24px 64px rgba(0,0,0,.18)',overflow:'hidden'}}
                     onClick={e=>e.stopPropagation()}>

                    <div style={{padding:'20px 24px 16px',borderBottom:'1px solid #f1f5f9',background:'linear-gradient(135deg,#6366f1,#8b5cf6)'}}>
                        <div style={{fontSize:18,fontWeight:800,color:'white',marginBottom:4}}>🐛 Báo lỗi & Góp ý</div>
                        <div style={{fontSize:12.5,color:'rgba(255,255,255,.8)'}}>Phản hồi của bạn giúp chúng tôi cải thiện hệ thống</div>
                    </div>

                    {sent ? (
                        <div style={{padding:40,textAlign:'center'}}>
                            <div style={{fontSize:48,marginBottom:12}}>✅</div>
                            <div style={{fontSize:16,fontWeight:700,color:'#16a34a'}}>Cảm ơn bạn đã góp ý!</div>
                            <div style={{fontSize:13,color:'#64748b',marginTop:4}}>Chúng tôi sẽ xem xét sớm nhất có thể.</div>
                        </div>
                    ) : (
                        <form onSubmit={submit} style={{padding:24,display:'flex',flexDirection:'column',gap:14}}>
                            <div>
                                <label style={{fontSize:12,fontWeight:600,color:'#64748b',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:'.04em'}}>Loại phản hồi</label>
                                <div style={{display:'flex',gap:8}}>
                                    {[{v:'bug',l:'🐛 Báo lỗi'},{v:'feature',l:'💡 Đề xuất'},{v:'other',l:'💬 Khác'}].map(({v,l})=>(
                                        <button key={v} type="button" onClick={()=>setForm(p=>({...p,type:v}))}
                                                style={{flex:1,padding:'8px 0',borderRadius:8,border:`1.5px solid ${form.type===v?'#6366f1':'#e2e8f0'}`,
                                                    background:form.type===v?'#eef2ff':'white',color:form.type===v?'#4f46e5':'#64748b',
                                                    fontSize:12.5,fontWeight:600,cursor:'pointer'}}>
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label style={{fontSize:12,fontWeight:600,color:'#64748b',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:'.04em'}}>Tiêu đề *</label>
                                <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}
                                       placeholder="Mô tả ngắn gọn vấn đề..."
                                       style={{width:'100%',padding:'9px 12px',border:'1.5px solid #e2e8f0',borderRadius:9,fontSize:13.5,outline:'none',boxSizing:'border-box'}}/>
                            </div>
                            <div>
                                <label style={{fontSize:12,fontWeight:600,color:'#64748b',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:'.04em'}}>Chi tiết *</label>
                                <textarea value={form.content} onChange={e=>setForm(p=>({...p,content:e.target.value}))} rows={4}
                                          placeholder="Mô tả chi tiết... Nếu báo lỗi, hãy nêu rõ các bước tái hiện."
                                          style={{width:'100%',padding:'9px 12px',border:'1.5px solid #e2e8f0',borderRadius:9,fontSize:13.5,outline:'none',resize:'vertical',boxSizing:'border-box',fontFamily:'inherit'}}/>
                            </div>
                            <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
                                <button type="button" onClick={onClose}
                                        style={{padding:'9px 20px',border:'1.5px solid #e2e8f0',borderRadius:9,fontSize:13.5,fontWeight:600,cursor:'pointer',background:'white',color:'#64748b'}}>
                                    Hủy
                                </button>
                                <button type="submit"
                                        style={{padding:'9px 24px',border:'none',borderRadius:9,fontSize:13.5,fontWeight:700,cursor:'pointer',
                                            background:'linear-gradient(135deg,#6366f1,#4f46e5)',color:'white'}}>
                                    Gửi phản hồi
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
};

// ── Main ─────────────────────────────────────────────────────
const HomePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [stats,      setStats]      = useState(null);
    const [urgentTasks,setUrgent]     = useState(URGENT_TASKS_MOCK);
    const [showAll,    setShowAll]    = useState(false);
    const [feedback,   setFeedback]   = useState(false);
    const [expandedAnn,setExpandedAnn]= useState(null);

    // Load real stats
    useEffect(() => {
        taskService.getTaskStats(today(), todayStr())
            .then(s => setStats(s))
            .catch(() => {});
        // Load urgent tasks from calendar API
        taskService.getMyCalendar(today(), todayStr())
            .then(tasks => {
                const urgent = (tasks || [])
                    .filter(t => (t.priority==='URGENT'||t.priority==='HIGH') && t.status!=='COMPLETED')
                    .sort((a,b) => {
                        if (a.priority==='URGENT' && b.priority!=='URGENT') return -1;
                        if (b.priority==='URGENT' && a.priority!=='URGENT') return  1;
                        return (a.dueDate||'').localeCompare(b.dueDate||'');
                    })
                    .slice(0, 5);
                if (urgent.length > 0) setUrgent(urgent);
            })
            .catch(() => {});
    }, []);

    const todo      = stats ? (stats.todo + stats.inProgress) : 8;
    const overdue   = stats ? stats.overdue    : 2;
    const completed = stats ? stats.completed  : 15;
    const rate      = stats ? stats.completionRate : 65;

    const displayName = user?.fullName || user?.username || 'bạn';
    const displayTasks = showAll ? urgentTasks : urgentTasks.slice(0, 5);

    return (
        <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",maxWidth:1100,margin:'0 auto'}}>

            {/* ── Hero greeting ── */}
            <div style={{
                borderRadius:20, padding:'28px 32px', marginBottom:24,
                display:'flex', justifyContent:'space-between', alignItems:'center',
                position:'relative', overflow:'hidden', minHeight:140,
                boxShadow:'0 8px 32px rgba(0,0,0,.25)',
                // ── Ảnh nền — chỉ thay ASSETS.HOME_HERO_BG để đổi ảnh ──
                backgroundImage: `url(${ASSETS.HOME_HERO_BG})`,
                backgroundSize:'cover',
                backgroundPosition:'center 60%',
            }}>
                {/* Gradient overlay — giữ text dễ đọc */}
                <div style={{
                    position:'absolute', inset:0, borderRadius:20,
                    background:'linear-gradient(100deg, rgba(49,46,129,.75) 0%, rgba(79,70,229,.55) 40%, rgba(139,92,246,.25) 75%, rgba(0,0,0,.1) 100%)',
                }}/>

                {/* bg decoration circles */}
                <div style={{position:'absolute',right:-40,top:-40,width:200,height:200,borderRadius:'50%',background:'rgba(255,255,255,.06)'}}/>
                <div style={{position:'absolute',right:60,bottom:-60,width:150,height:150,borderRadius:'50%',background:'rgba(255,255,255,.04)'}}/>

                <div style={{position:'relative', zIndex:1}}>
                    <div style={{fontSize:13,color:'rgba(255,255,255,.85)',marginBottom:6,fontWeight:500}}>
                        {greet()} 👋
                    </div>
                    <div style={{fontSize:24,fontWeight:900,color:'white',marginBottom:6,textShadow:'0 2px 8px rgba(0,0,0,.3)'}}>
                        {displayName}!
                    </div>
                    <div style={{fontSize:13.5,color:'rgba(255,255,255,.85)',textShadow:'0 1px 4px rgba(0,0,0,.3)'}}>
                        Hôm nay bạn có <strong style={{color:'white'}}>{todo}</strong> việc cần xử lý
                        {overdue > 0 && <span style={{color:'#fca5a5'}}> · {overdue} việc quá hạn</span>}
                    </div>
                </div>

                <button onClick={() => navigate('/tasks')}
                        style={{
                            position:'relative', zIndex:1,
                            background:'rgba(255,255,255,.92)', border:'none', borderRadius:12, padding:'11px 22px',
                            fontSize:13.5, fontWeight:700, color:'#4f46e5', cursor:'pointer',
                            boxShadow:'0 4px 20px rgba(0,0,0,.2)', flexShrink:0,
                            display:'flex', alignItems:'center', gap:8,
                            backdropFilter:'blur(8px)',
                        }}>
                    📋 Xem lịch công việc
                </button>
            </div>

            {/* ── Main 2-col layout ── */}
            <div style={{display:'grid', gridTemplateColumns:'1fr 340px', gap:20, marginBottom:24}}>

                {/* ── LEFT: Stats + Urgent tasks ── */}
                <div style={{display:'flex',flexDirection:'column',gap:16}}>

                    {/* Stat cards */}
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
                        {[
                            { emoji:'📋', label:'Cần xử lý', value:todo,      sub:'việc đang chờ',   color:'#6366f1', bg:'#eef2ff', border:'#c7d2fe' },
                            { emoji:'⚠️', label:'Quá hạn',   value:overdue,   sub:'cần ưu tiên ngay', color:'#dc2626', bg:'#fef2f2', border:'#fecaca', alert:overdue>0 },
                            { emoji:'✅', label:'Hoàn thành', value:completed, sub:`tỷ lệ ${rate}%`,  color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0' },
                        ].map(c => (
                            <div key={c.label} onClick={() => navigate('/tasks')}
                                 style={{
                                     background:c.bg, border:`1.5px solid ${c.border}`,
                                     borderRadius:14, padding:'18px 16px', cursor:'pointer',
                                     transition:'transform .15s, box-shadow .15s',
                                     boxShadow: c.alert ? `0 0 0 3px ${c.border}, 0 4px 16px rgba(220,38,38,.15)` : '0 2px 8px rgba(0,0,0,.05)',
                                 }}
                                 onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,.1)'; }}
                                 onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow=c.alert?`0 0 0 3px ${c.border}`:' 0 2px 8px rgba(0,0,0,.05)'; }}
                            >
                                <div style={{fontSize:24,marginBottom:8}}>{c.emoji}</div>
                                <div style={{fontSize:32,fontWeight:900,color:c.color,lineHeight:1}}>{c.value}</div>
                                <div style={{fontSize:12,fontWeight:600,color:c.color,marginTop:4}}>{c.label}</div>
                                <div style={{fontSize:11,color:c.color,opacity:.7,marginTop:2}}>{c.sub}</div>
                            </div>
                        ))}
                    </div>

                    {/* Progress bar */}
                    <div style={{background:'white',borderRadius:14,border:'1px solid #f1f5f9',padding:'16px 20px',boxShadow:'0 2px 8px rgba(0,0,0,.04)'}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                            <span style={{fontSize:13,fontWeight:700,color:'#0f172a'}}>Tiến độ tháng này</span>
                            <span style={{fontSize:20,fontWeight:900,color:rate>=70?'#16a34a':rate>=40?'#f59e0b':'#dc2626'}}>{rate}%</span>
                        </div>
                        <div style={{background:'#f1f5f9',borderRadius:8,height:10,overflow:'hidden'}}>
                            <div style={{
                                height:'100%',borderRadius:8,
                                background:`linear-gradient(90deg, ${rate>=70?'#22c55e':rate>=40?'#f59e0b':'#ef4444'}, ${rate>=70?'#4ade80':rate>=40?'#fbbf24':'#f87171'})`,
                                width:`${rate}%`, transition:'width .8s ease',
                            }}/>
                        </div>
                        <div style={{display:'flex',justifyContent:'space-between',marginTop:8,fontSize:11.5,color:'#94a3b8'}}>
                            <span>0%</span><span>Mục tiêu: 80%</span><span>100%</span>
                        </div>
                    </div>

                    {/* Urgent tasks table */}
                    <div style={{background:'white',borderRadius:14,border:'1px solid #f1f5f9',boxShadow:'0 2px 8px rgba(0,0,0,.04)',overflow:'hidden'}}>
                        <div style={{padding:'14px 20px',borderBottom:'1px solid #f8fafc',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                            <div style={{fontSize:13.5,fontWeight:700,color:'#0f172a'}}>🔥 Việc ưu tiên cao</div>
                            <button onClick={() => navigate('/tasks')}
                                    style={{fontSize:12,color:'#6366f1',background:'none',border:'none',cursor:'pointer',fontWeight:600}}>
                                Xem tất cả →
                            </button>
                        </div>

                        {urgentTasks.length === 0 ? (
                            <div style={{padding:32,textAlign:'center',color:'#94a3b8',fontSize:13.5}}>
                                🎉 Không có việc khẩn cấp nào!
                            </div>
                        ) : (
                            displayTasks.map((t, i) => {
                                const pri = PRIORITY_CFG[t.priority] || PRIORITY_CFG.MEDIUM;
                                const sts = STATUS_CFG[t.status] || STATUS_CFG.TODO;
                                const isOverdue = t.dueDate && t.dueDate < todayStr() && t.status !== 'COMPLETED';
                                return (
                                    <div key={t.id} onClick={() => navigate('/tasks')}
                                         style={{
                                             display:'flex', alignItems:'center', gap:12, padding:'11px 20px',
                                             borderBottom: i < displayTasks.length-1 ? '1px solid #f8fafc' : 'none',
                                             cursor:'pointer', transition:'background .1s',
                                         }}
                                         onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                                         onMouseLeave={e => e.currentTarget.style.background='transparent'}
                                    >
                                        <div style={{width:8,height:8,borderRadius:'50%',background:pri.dot,flexShrink:0}}/>
                                        <div style={{flex:1,minWidth:0}}>
                                            <div style={{fontSize:13.5,fontWeight:600,color:'#1e293b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                                                {t.title}
                                            </div>
                                            <div style={{fontSize:11,color: isOverdue?'#dc2626':'#94a3b8',marginTop:1}}>
                                                {isOverdue ? '🚨 Quá hạn: ' : 'Hạn: '}{t.dueDate || '—'}
                                            </div>
                                        </div>
                                        <span style={{fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:20,background:pri.bg,color:pri.color,flexShrink:0}}>
                      {pri.label}
                    </span>
                                        <span style={{fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:20,background:sts.bg,color:sts.color,flexShrink:0}}>
                      {sts.label}
                    </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* ── RIGHT: Announcements ── */}
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                    <div style={{fontSize:13.5,fontWeight:700,color:'#0f172a',display:'flex',alignItems:'center',gap:6}}>
                        📌 Bảng tin nội bộ
                        <span style={{fontSize:11,background:'#fef3c7',color:'#d97706',padding:'2px 8px',borderRadius:20,fontWeight:600}}>
              {ANNOUNCEMENTS.length} thông báo
            </span>
                    </div>

                    <div style={{display:'flex',flexDirection:'column',gap:10,maxHeight:520,overflowY:'auto',paddingRight:2}}>
                        {ANNOUNCEMENTS.map(a => {
                            const cfg = ANNOUNCE_CFG[a.type] || ANNOUNCE_CFG.info;
                            const isExpanded = expandedAnn === a.id;
                            return (
                                <div key={a.id}
                                     style={{
                                         background:cfg.bg, border:`1.5px solid ${cfg.border}`,
                                         borderRadius:12, padding:'12px 14px', cursor:'pointer',
                                         transition:'box-shadow .15s',
                                     }}
                                     onClick={() => setExpandedAnn(isExpanded ? null : a.id)}
                                     onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,.08)'}
                                     onMouseLeave={e => e.currentTarget.style.boxShadow='none'}
                                >
                                    <div style={{display:'flex',alignItems:'flex-start',gap:8}}>
                                        <span style={{fontSize:16,flexShrink:0}}>{cfg.icon}</span>
                                        <div style={{flex:1,minWidth:0}}>
                                            <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap',marginBottom:3}}>
                                                <span style={{fontSize:13,fontWeight:700,color:'#0f172a'}}>{a.title}</span>
                                                {a.pinned && <span style={{fontSize:10,background:'#fef3c7',color:'#d97706',padding:'1px 6px',borderRadius:20,fontWeight:600}}>📌 Ghim</span>}
                                            </div>
                                            <div style={{fontSize:11,color:'#94a3b8',marginBottom:isExpanded?8:0}}>
                                                {a.author} · {a.date}
                                            </div>
                                            {isExpanded && (
                                                <div style={{fontSize:12.5,color:'#475569',lineHeight:1.6,marginTop:4}}>
                                                    {a.content}
                                                </div>
                                            )}
                                            {!isExpanded && (
                                                <div style={{fontSize:12,color:'#94a3b8',marginTop:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                                                    {a.content}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Bottom: Help & Feedback ── */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:8}}>
                {[
                    {
                        emoji:'📖',
                        title:'Trợ giúp & Cẩm nang',
                        desc:'Hướng dẫn sử dụng hệ thống, video tutorial và FAQ.',
                        action:'Xem hướng dẫn',
                        color:'#6366f1', bg:'#eef2ff', border:'#c7d2fe',
                        onClick: () => window.open('https://docs.cotowork.vn', '_blank'),
                    },
                    {
                        emoji:'🐛',
                        title:'Báo lỗi & Góp ý',
                        desc:'Phát hiện lỗi hoặc có ý tưởng cải tiến? Hãy cho chúng tôi biết!',
                        action:'Gửi phản hồi',
                        color:'#dc2626', bg:'#fef2f2', border:'#fecaca',
                        onClick: () => setFeedback(true),
                    },
                    {
                        emoji:'📞',
                        title:'Liên hệ hỗ trợ',
                        desc:'Cần hỗ trợ khẩn cấp? Liên hệ phòng CNTT qua hotline hoặc email.',
                        action:'Liên hệ ngay',
                        color:'#0369a1', bg:'#e0f2fe', border:'#bae6fd',
                        onClick: () => window.location.href = 'mailto:it@cotowork.vn',
                    },
                ].map(c => (
                    <div key={c.title}
                         style={{
                             background:c.bg, border:`1.5px solid ${c.border}`,
                             borderRadius:14, padding:'20px 18px',
                             display:'flex', flexDirection:'column', gap:8,
                             boxShadow:'0 2px 8px rgba(0,0,0,.04)',
                         }}>
                        <div style={{fontSize:28}}>{c.emoji}</div>
                        <div style={{fontSize:14,fontWeight:700,color:'#0f172a'}}>{c.title}</div>
                        <div style={{fontSize:12.5,color:'#64748b',lineHeight:1.5,flex:1}}>{c.desc}</div>
                        <button onClick={c.onClick}
                                style={{
                                    padding:'8px 0', border:`1.5px solid ${c.color}`,
                                    borderRadius:9, background:'white', color:c.color,
                                    fontSize:13, fontWeight:700, cursor:'pointer',
                                    transition:'all .15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background=c.color; e.currentTarget.style.color='white'; }}
                                onMouseLeave={e => { e.currentTarget.style.background='white'; e.currentTarget.style.color=c.color; }}
                        >
                            {c.action} →
                        </button>
                    </div>
                ))}
            </div>

            {/* Feedback Modal */}
            {feedback && <FeedbackModal onClose={() => setFeedback(false)} />}
        </div>
    );
};

export default HomePage;