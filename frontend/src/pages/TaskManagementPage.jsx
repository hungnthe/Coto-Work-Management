import React, { useState, useEffect, useCallback, useRef } from 'react';
import taskService from '../services/taskService';
import UserService from '../services/userService';
import fileService from '../services/fileService';
import { useAuth } from '../contexts/AuthContext';
import {
    ChevronLeftIcon, ChevronRightIcon, PlusIcon, XMarkIcon,
    CalendarDaysIcon, ClockIcon, MapPinIcon, UserIcon, FlagIcon,
    CheckIcon, TrashIcon, PencilIcon, ExclamationTriangleIcon,
    UsersIcon, EyeIcon, BellIcon, DocumentTextIcon,
    LinkIcon, ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, BellAlertIcon } from '@heroicons/react/24/solid';

// ============================================================
// CONFIG
// ============================================================
const DAYS_VI = ['CN','T2','T3','T4','T5','T6','T7'];
const DAYS_FULL = ['Chủ nhật','Thứ hai','Thứ ba','Thứ tư','Thứ năm','Thứ sáu','Thứ bảy'];
const MONTHS_VI = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];

const PRIORITY = {
    URGENT: { dot:'#EF4444', bg:'bg-red-50', text:'text-red-700', label:'Khẩn cấp' },
    HIGH:   { dot:'#F97316', bg:'bg-orange-50', text:'text-orange-700', label:'Cao' },
    MEDIUM: { dot:'#3B82F6', bg:'bg-blue-50', text:'text-blue-700', label:'Trung bình' },
    LOW:    { dot:'#10B981', bg:'bg-emerald-50', text:'text-emerald-700', label:'Thấp' },
};
const CATEGORY = {
    work:     { color:'#6366F1', label:'Công việc' },
    meeting:  { color:'#EC4899', label:'Cuộc họp' },
    personal: { color:'#14B8A6', label:'Cá nhân' },
    deadline: { color:'#EF4444', label:'Deadline' },
    event:    { color:'#F59E0B', label:'Sự kiện' },
};
const STATUS_OPTIONS = [
    { value:'TODO', label:'Chưa bắt đầu' },
    { value:'IN_PROGRESS', label:'Đang làm' },
    { value:'REVIEW', label:'Chờ duyệt' },
    { value:'COMPLETED', label:'Hoàn thành' },
];

// ============================================================
// DATE HELPERS
// ============================================================
const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const isToday = d => fmt(d) === fmt(new Date());

const getMonthGrid = (y, m) => {
    const first = new Date(y, m, 1), last = new Date(y, m+1, 0), pad = first.getDay(), days = [];
    for (let i = pad-1; i >= 0; i--) days.push({ date: new Date(y, m, -i), cur: false });
    for (let i = 1; i <= last.getDate(); i++) days.push({ date: new Date(y, m, i), cur: true });
    while (days.length < 42) { const n = days.length - pad - last.getDate() + 1; days.push({ date: new Date(y, m+1, n), cur: false }); }
    return days;
};

const getWeekDays = d => {
    const s = new Date(d); s.setDate(d.getDate() - d.getDay());
    return Array.from({length:7}, (_,i) => { const x = new Date(s); x.setDate(s.getDate()+i); return x; });
};

const tasksOnDate = (tasks, date) => {
    const ds = fmt(date);
    return tasks.filter(t => {
        const s = t.startDate || t.dueDate, e = t.dueDate || t.startDate;
        return s && e && ds >= s && ds <= e;
    });
};

// ============================================================
// MAIN
// ============================================================
const TaskManagementPage = () => {
    const { user, hasRole } = useAuth();
    const isAdmin = hasRole('ADMIN') || hasRole('MANAGER');

    const [now, setNow] = useState(new Date());
    const [view, setView] = useState('month');
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Users (từ UserService có sẵn - GET /api/admin/users)
    const [allUsers, setAllUsers] = useState([]);
    const [usersLoaded, setUsersLoaded] = useState(false);

    // Admin filter
    const [viewMode, setViewMode] = useState('my');
    const [filterUserId, setFilterUserId] = useState(null);
    const [filterUserName, setFilterUserName] = useState('');
    const [showFilterPanel, setShowFilterPanel] = useState(false);

    // Notifications
    const [notifications, setNotifications] = useState([]);

    // Modal / Popup / Drag
    const [modal, setModal] = useState(null);
    const [popup, setPopup] = useState(null);
    const [detail, setDetail] = useState(null); // task detail modal
    const [dragId, setDragId] = useState(null);
    const [dragOver, setDragOver] = useState(null);

    // ── Load users bằng UserService có sẵn ──
    useEffect(() => {
        if (!usersLoaded) {
            UserService.getAllUsers()
                .then(data => {
                    // Xử lý cả 2 trường hợp:
                    // 1. Page response: { content: [...], totalElements, ... }
                    // 2. Direct array: [...]
                    const users = Array.isArray(data) ? data : (data?.content || []);
                    setAllUsers(users);
                    setUsersLoaded(true);
                })
                .catch(err => { console.warn('Could not load users:', err); setUsersLoaded(true); });
        }
    }, [usersLoaded]);

    // ── Fetch tasks ──
    const fetchTasks = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const y = now.getFullYear(), m = now.getMonth();
            let start, end;
            if (view === 'month') { start = fmt(new Date(y,m-1,1)); end = fmt(new Date(y,m+2,0)); }
            else if (view === 'week') { const w = getWeekDays(now); start = fmt(w[0]); end = fmt(w[6]); }
            else { start = fmt(now); end = fmt(now); }

            let data;
            if (viewMode === 'all' && isAdmin) {
                data = await taskService.getAllCalendar(start, end);
            } else {
                data = await taskService.getMyCalendar(start, end);
            }

            if (viewMode === 'user' && filterUserId) {
                data = (data || []).filter(t =>
                    t.assigneeId === filterUserId || t.creatorId === filterUserId
                );
            }
            setTasks(data || []);
        } catch (e) { setError(e.message || 'Không thể tải lịch'); }
        finally { setLoading(false); }
    }, [now, view, viewMode, filterUserId, isAdmin]);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    // ── Nav ──
    const go = dir => {
        const d = new Date(now);
        if (view === 'month') d.setMonth(d.getMonth()+dir);
        else if (view === 'week') d.setDate(d.getDate()+dir*7);
        else d.setDate(d.getDate()+dir);
        setNow(d);
    };
    const titleText = () => {
        if (view === 'month') return `${MONTHS_VI[now.getMonth()]} ${now.getFullYear()}`;
        if (view === 'week') { const w = getWeekDays(now); return `${w[0].getDate()}/${w[0].getMonth()+1} — ${w[6].getDate()}/${w[6].getMonth()+1}/${w[6].getFullYear()}`; }
        return `${DAYS_FULL[now.getDay()]}, ${now.getDate()} ${MONTHS_VI[now.getMonth()]}`;
    };

    // ── Drag ──
    const onDragStart = (e, task) => { setDragId(task.id); e.dataTransfer.effectAllowed = 'move'; };
    const onDragOver = (e, date) => { e.preventDefault(); setDragOver(fmt(date)); };
    const onDrop = async (e, date) => {
        e.preventDefault(); setDragOver(null);
        if (!dragId) return;
        try { await taskService.moveTask(dragId, { newStartDate: fmt(date), newDueDate: fmt(date) }); fetchTasks(); }
        catch (err) { setError(err.message); }
        setDragId(null);
    };

    // ── Actions ──
    const toggleComplete = async task => {
        try { await taskService.toggleComplete(task.id); setPopup(null); fetchTasks(); }
        catch (e) { setError(e.message); }
    };
    const deleteTask = async task => {
        if (!confirm(`Xóa "${task.title}"?`)) return;
        try { await taskService.deleteTask(task.id); setPopup(null); fetchTasks(); }
        catch (e) { setError(e.message); }
    };
    const openCreate = date => { setPopup(null); setModal({ mode:'create', date: date ? fmt(date) : fmt(new Date()) }); };
    const openEdit = task => { setPopup(null); setModal({ mode:'edit', task }); };
    const openDetail = task => { setPopup(null); setDetail(task); };
    const addNotification = msg => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, msg }]);
        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
    };

    // ============================================================
    // PILL
    // ============================================================
    const Pill = ({ task, compact }) => {
        const cat = CATEGORY[task.category] || CATEGORY.work;
        const pri = PRIORITY[task.priority] || PRIORITY.MEDIUM;
        const done = task.isCompleted || task.status === 'COMPLETED';
        const isAssigned = task.assigneeId && task.assigneeName && task.creatorId !== task.assigneeId;

        return (
            <div draggable onDragStart={e => onDragStart(e, task)}
                 onClick={e => { e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); setPopup({ task, x: Math.min(r.left, window.innerWidth-340), y: r.bottom+4 }); }}
                 className={`group px-1.5 py-0.5 rounded text-xs cursor-pointer transition-all hover:shadow-md ${done?'opacity-40':''}`}
                 style={{ backgroundColor: cat.color+'15', borderLeft: `3px solid ${cat.color}` }}>
                <div className="flex items-center gap-1 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: pri.dot }} />
                    <span className={`truncate ${done?'line-through text-gray-400':'text-gray-800 font-medium'}`}>{task.title}</span>
                    {isAssigned && !compact && (
                        <span className="ml-auto flex-shrink-0 text-[9px] bg-indigo-100 text-indigo-600 px-1 rounded font-medium truncate max-w-[60px]">
                            {task.assigneeName.split(' ').pop()}
                        </span>
                    )}
                    {task.startTime && !compact && (
                        <span className="text-gray-400 text-[10px] flex-shrink-0">{task.startTime.slice(0,5)}</span>
                    )}
                </div>
            </div>
        );
    };

    // ============================================================
    // MONTH VIEW
    // ============================================================
    const MonthView = () => {
        const grid = getMonthGrid(now.getFullYear(), now.getMonth());
        return (
            <div className="flex-1 flex flex-col">
                <div className="grid grid-cols-7 border-b border-gray-200">
                    {DAYS_VI.map((d,i) => (
                        <div key={d} className={`py-2 text-center text-xs font-semibold tracking-wider ${i===0?'text-red-400':'text-gray-500'}`}>{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 flex-1" style={{ gridAutoRows:'1fr' }}>
                    {grid.map(({ date, cur }, idx) => {
                        const dt = tasksOnDate(tasks, date);
                        const over = dragOver === fmt(date);
                        return (
                            <div key={idx} onClick={() => openCreate(date)}
                                 onDragOver={e => onDragOver(e, date)} onDragLeave={() => setDragOver(null)} onDrop={e => onDrop(e, date)}
                                 className={`border-b border-r border-gray-100 p-1 min-h-[85px] cursor-pointer transition-colors group/c
                                    ${cur?'bg-white':'bg-gray-50/40'} ${over?'bg-indigo-50 ring-2 ring-inset ring-indigo-300':''} hover:bg-gray-50/80`}>
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold
                                        ${isToday(date)?'bg-indigo-600 text-white':cur?(date.getDay()===0?'text-red-400':'text-gray-700'):'text-gray-300'}`}>
                                        {date.getDate()}
                                    </span>
                                    <button onClick={e => { e.stopPropagation(); openCreate(date); }}
                                            className="opacity-0 group-hover/c:opacity-100 w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center transition-opacity">
                                        <PlusIcon className="h-2.5 w-2.5" />
                                    </button>
                                </div>
                                <div className="space-y-0.5">
                                    {dt.slice(0,3).map(t => <Pill key={t.id} task={t} compact />)}
                                    {dt.length > 3 && <div className="text-[10px] text-gray-400 pl-1">+{dt.length-3} khác</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // ============================================================
    // WEEK VIEW
    // ============================================================
    const WeekView = () => {
        const days = getWeekDays(now);
        const hours = Array.from({length:14}, (_,i) => i+7);
        return (
            <div className="flex-1 flex flex-col overflow-auto">
                <div className="grid grid-cols-8 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <div className="py-2 border-r border-gray-100" />
                    {days.map((d,i) => (
                        <div key={i} className={`py-2 text-center border-r border-gray-100 ${isToday(d)?'bg-indigo-50':''}`}>
                            <div className={`text-[10px] font-medium ${i===0?'text-red-400':'text-gray-500'}`}>{DAYS_VI[d.getDay()]}</div>
                            <div className={`text-base font-bold ${isToday(d)?'text-indigo-600':'text-gray-800'}`}>{d.getDate()}</div>
                        </div>
                    ))}
                </div>
                <div className="flex-1">
                    {hours.map(h => (
                        <div key={h} className="grid grid-cols-8 border-b border-gray-50" style={{ minHeight:56 }}>
                            <div className="border-r border-gray-100 px-1.5 py-0.5 text-[10px] text-gray-400 text-right">{String(h).padStart(2,'0')}:00</div>
                            {days.map((d,di) => {
                                const dt = tasksOnDate(tasks,d).filter(t => { if(!t.startTime) return h===8; return parseInt(t.startTime)===h; });
                                return (
                                    <div key={di} onClick={() => openCreate(d)}
                                         onDragOver={e => onDragOver(e,d)} onDragLeave={() => setDragOver(null)} onDrop={e => onDrop(e,d)}
                                         className={`border-r border-gray-50 p-0.5 cursor-pointer hover:bg-gray-50 ${dragOver===fmt(d)?'bg-indigo-50':''} ${isToday(d)?'bg-indigo-50/20':''}`}>
                                        {dt.map(t => <Pill key={t.id} task={t} />)}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // ============================================================
    // DAY VIEW
    // ============================================================
    const DayView = () => {
        const hours = Array.from({length:16}, (_,i) => i+6);
        const dt = tasksOnDate(tasks, now);
        return (
            <div className="flex-1 flex overflow-auto">
                <div className="w-56 border-r border-gray-200 p-4 bg-gray-50/50 flex-shrink-0">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">{DAYS_FULL[now.getDay()]}, {now.getDate()}/{now.getMonth()+1}</h3>
                    <div className="text-2xl font-bold text-indigo-600 mb-1">{dt.length}</div>
                    <div className="text-xs text-gray-500 mb-4">công việc</div>
                    <div className="space-y-1">{dt.map(t => <Pill key={t.id} task={t} />)}</div>
                </div>
                <div className="flex-1">
                    {hours.map(h => {
                        const ht = dt.filter(t => { if(!t.startTime) return h===8; return parseInt(t.startTime)===h; });
                        return (
                            <div key={h} onClick={() => openCreate(now)} className="flex border-b border-gray-50 hover:bg-gray-50 cursor-pointer" style={{ minHeight:56 }}>
                                <div className="w-14 text-right pr-2 pt-1 text-[10px] text-gray-400">{String(h).padStart(2,'0')}:00</div>
                                <div className="flex-1 border-l border-gray-100 pl-1.5 py-0.5 space-y-0.5">
                                    {ht.map(t => <Pill key={t.id} task={t} />)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // ============================================================
    // POPUP
    // ============================================================
    const Popup = () => {
        if (!popup) return null;
        const { task: t, x, y } = popup;
        const pri = PRIORITY[t.priority] || PRIORITY.MEDIUM;
        const cat = CATEGORY[t.category] || CATEGORY.work;
        const done = t.isCompleted || t.status === 'COMPLETED';

        return (
            <>
                <div className="fixed inset-0 z-40" onClick={() => setPopup(null)} />
                <div className="fixed z-50 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
                     style={{ top: Math.min(y, window.innerHeight-320), left: x }}>
                    <div className="h-1.5" style={{ backgroundColor: cat.color }} />
                    <div className="p-4">
                        <div className="flex items-start gap-2 mb-2">
                            <button onClick={() => toggleComplete(t)} className="mt-0.5 flex-shrink-0">
                                {done ? <CheckCircleIcon className="h-5 w-5 text-green-500" /> : <div className="h-5 w-5 rounded-full border-2 border-gray-300 hover:border-indigo-500 transition-colors" />}
                            </button>
                            <h4 className={`text-sm font-semibold flex-1 ${done?'line-through text-gray-400':'text-gray-900'}`}>{t.title}</h4>
                        </div>
                        {t.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{t.description}</p>}
                        <div className="space-y-1.5 text-xs text-gray-500">
                            <div className="flex items-center gap-2"><CalendarDaysIcon className="h-3.5 w-3.5" />
                                <span>{t.startDate}{t.startTime && ` · ${t.startTime.slice(0,5)}`}{t.endTime && ` → ${t.endTime.slice(0,5)}`}</span>
                            </div>
                            {t.location && <div className="flex items-center gap-2"><MapPinIcon className="h-3.5 w-3.5" />{t.location}</div>}
                            <div className="flex items-center gap-2"><FlagIcon className="h-3.5 w-3.5" />
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${pri.bg} ${pri.text}`}>{pri.label}</span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ backgroundColor:cat.color+'18', color:cat.color }}>{cat.label}</span>
                            </div>
                            {t.creatorName && <div className="flex items-center gap-2"><UserIcon className="h-3.5 w-3.5" />Tạo bởi: <strong>{t.creatorName}</strong></div>}
                            {t.assigneeName && t.assigneeId !== t.creatorId && (
                                <div className="flex items-center gap-2"><UsersIcon className="h-3.5 w-3.5" />Giao cho: <strong className="text-indigo-600">{t.assigneeName}</strong></div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                            <button onClick={() => openDetail(t)} className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 text-gray-600 rounded-md text-xs font-medium hover:bg-gray-100"><EyeIcon className="h-3 w-3" /> Chi tiết</button>
                            <button onClick={() => openEdit(t)} className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 text-indigo-600 rounded-md text-xs font-medium hover:bg-indigo-100"><PencilIcon className="h-3 w-3" /> Sửa</button>
                            <button onClick={() => toggleComplete(t)} className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-600 rounded-md text-xs font-medium hover:bg-green-100"><CheckIcon className="h-3 w-3" /> {done?'Mở lại':'Xong'}</button>
                            <button onClick={() => deleteTask(t)} className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 rounded-md text-xs font-medium hover:bg-red-100 ml-auto"><TrashIcon className="h-3 w-3" /></button>
                        </div>
                    </div>
                </div>
            </>
        );
    };

    // ============================================================
    // RENDER
    // ============================================================
    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] -mx-4 -mt-4 bg-white rounded-lg shadow-sm overflow-hidden relative">
            {/* Notifications */}
            <div className="fixed top-4 right-4 z-[60] space-y-2">
                {notifications.map(n => (
                    <div key={n.id} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm animate-slide-in">
                        <BellAlertIcon className="h-4 w-4 flex-shrink-0" /><span>{n.msg}</span>
                    </div>
                ))}
            </div>

            {/* Header */}
            <div className="border-b border-gray-200 px-4 py-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-0.5">
                            <button onClick={() => go(-1)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"><ChevronLeftIcon className="h-4 w-4" /></button>
                            <button onClick={() => go(1)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"><ChevronRightIcon className="h-4 w-4" /></button>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">{titleText()}</h2>
                        <button onClick={() => setNow(new Date())} className="px-2.5 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-600 hover:bg-gray-50">Hôm nay</button>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex bg-gray-100 rounded-lg p-0.5">
                            {[{k:'month',l:'Tháng'},{k:'week',l:'Tuần'},{k:'day',l:'Ngày'}].map(v => (
                                <button key={v.k} onClick={() => setView(v.k)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view===v.k?'bg-white text-gray-900 shadow-sm':'text-gray-500 hover:text-gray-700'}`}>{v.l}</button>
                            ))}
                        </div>
                        {isAdmin && (
                            <button onClick={() => setShowFilterPanel(!showFilterPanel)}
                                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                        viewMode!=='my'?'bg-indigo-50 border-indigo-300 text-indigo-700':'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                                <EyeIcon className="h-3.5 w-3.5" />
                                {viewMode==='my'?'Của tôi':viewMode==='all'?'Tất cả':filterUserName||'Nhân viên'}
                            </button>
                        )}
                        <button onClick={() => openCreate(null)} className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                            <PlusIcon className="h-4 w-4" /> Tạo
                        </button>
                    </div>
                </div>

                {/* Admin filter panel */}
                {isAdmin && showFilterPanel && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3 flex-wrap">
                        <span className="text-xs font-medium text-gray-600">Hiển thị:</span>
                        <div className="flex gap-1.5">
                            <button onClick={() => { setViewMode('my'); setFilterUserId(null); }}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode==='my'?'bg-indigo-600 text-white':'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>Của tôi</button>
                            <button onClick={() => { setViewMode('all'); setFilterUserId(null); }}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode==='all'?'bg-indigo-600 text-white':'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>Tất cả</button>
                        </div>
                        <div className="w-px h-6 bg-gray-300" />
                        <select value={filterUserId||''} onChange={e => {
                            const id = e.target.value ? Number(e.target.value) : null;
                            const u = allUsers.find(x => x.id === id);
                            setFilterUserId(id); setFilterUserName(u?.fullName||'');
                            setViewMode(id ? 'user' : 'my');
                        }} className="border border-gray-300 rounded-md px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none min-w-[180px]">
                            <option value="">— Chọn nhân viên —</option>
                            {allUsers.map(u => <option key={u.id} value={u.id}>{u.fullName} ({u.username})</option>)}
                        </select>
                        {viewMode!=='my' && <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded">{tasks.length} task</span>}
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="mx-4 mt-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs flex items-center justify-between">
                    <span className="flex items-center gap-1"><ExclamationTriangleIcon className="h-4 w-4" />{error}</span>
                    <button onClick={() => setError(null)}><XMarkIcon className="h-3.5 w-3.5" /></button>
                </div>
            )}

            {/* Body */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3" />
                    </div>
                ) : view==='month'?<MonthView />:view==='week'?<WeekView />:<DayView />}
            </div>

            <Popup />
            {detail && <TaskDetailModal task={detail} onClose={() => setDetail(null)} onEdit={t => { setDetail(null); openEdit(t); }} onToggle={t => { toggleComplete(t); setDetail(null); }} />}
            {modal && <FormModal modal={modal} allUsers={allUsers} isAdmin={isAdmin} onClose={() => setModal(null)} onSaved={msg => { setModal(null); fetchTasks(); if(msg) addNotification(msg); }} />}

            <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(100px)}to{opacity:1;transform:translateX(0)}}.animate-slide-in{animation:slideIn .3s ease-out}`}</style>
        </div>
    );
};

// ============================================================
// TASK DETAIL MODAL
// ============================================================
const TaskDetailModal = ({ task: t, onClose, onEdit, onToggle }) => {
    const pri  = PRIORITY[t.priority]  || PRIORITY.MEDIUM;
    const cat  = CATEGORY[t.category]  || CATEGORY.work;
    const done = t.isCompleted || t.status === 'COMPLETED';
    const STATUS_LABEL = { TODO:'Chưa bắt đầu', IN_PROGRESS:'Đang làm', REVIEW:'Chờ duyệt', COMPLETED:'Hoàn thành', CANCELLED:'Đã hủy' };

    const docs = Array.isArray(t.documentUrls) ? t.documentUrls : [];

    const getFileName = url => {
        try { const u = new URL(url); return decodeURIComponent(u.pathname.split('/').pop()) || url; }
        catch { return url; }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

                    {/* Color bar */}
                    <div className="h-1.5 rounded-t-2xl" style={{ background: cat.color }} />

                    {/* Header */}
                    <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            <button onClick={() => onToggle(t)} className="mt-0.5 flex-shrink-0">
                                {done
                                    ? <CheckCircleIcon className="h-6 w-6 text-green-500" />
                                    : <div className="h-6 w-6 rounded-full border-2 border-gray-300 hover:border-indigo-500 transition-colors" />
                                }
                            </button>
                            <div className="flex-1 min-w-0">
                                <h2 className={`text-lg font-bold leading-snug ${done ? 'line-through text-gray-400' : 'text-gray-900'}`}>{t.title}</h2>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${pri.bg} ${pri.text}`}>{pri.label}</span>
                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ background:cat.color+'18', color:cat.color }}>{cat.label}</span>
                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">{STATUS_LABEL[t.status] || t.status}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100 text-gray-400 flex-shrink-0 ml-2">
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-4 space-y-4">

                        {/* Description */}
                        {t.description && (
                            <div className="bg-gray-50 rounded-xl p-3">
                                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Mô tả</div>
                                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{t.description}</p>
                            </div>
                        )}

                        {/* Info grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: CalendarDaysIcon, label:'Ngày bắt đầu', value: t.startDate || '—' },
                                { icon: CalendarDaysIcon, label:'Hạn chót',     value: t.dueDate   || '—' },
                                { icon: ClockIcon,        label:'Giờ bắt đầu',  value: t.startTime?.slice(0,5) || '—' },
                                { icon: ClockIcon,        label:'Giờ kết thúc', value: t.endTime?.slice(0,5)   || '—' },
                                { icon: MapPinIcon,       label:'Địa điểm',     value: t.location  || '—' },
                                { icon: UserIcon,         label:'Tạo bởi',      value: t.creatorName || '—' },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg">
                                    <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    <div>
                                        <div className="text-[10px] text-gray-400 font-medium uppercase">{label}</div>
                                        <div className="text-sm text-gray-700 font-medium">{value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Assignee */}
                        {t.assigneeName && t.assigneeId !== t.creatorId && (
                            <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                                <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                                    {t.assigneeName[0].toUpperCase()}
                                </div>
                                <div>
                                    <div className="text-[10px] text-indigo-400 font-semibold uppercase">Được giao cho</div>
                                    <div className="text-sm font-semibold text-indigo-700">{t.assigneeName}</div>
                                </div>
                            </div>
                        )}

                        {/* Documents */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Tài liệu đính kèm {docs.length > 0 && `(${docs.length})`}
                                </span>
                            </div>
                            {docs.length === 0 ? (
                                <div className="text-xs text-gray-400 italic py-2 pl-2">Chưa có tài liệu nào</div>
                            ) : (
                                <div className="space-y-1.5">
                                    {docs.map((url, i) => (
                                        <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                           className="flex items-center gap-2.5 p-2.5 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 group transition-colors">
                                            <LinkIcon className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                                            <span className="text-xs text-blue-700 font-medium truncate flex-1">{getFileName(url)}</span>
                                            <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-blue-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/60 rounded-b-2xl">
                        <div className="text-[11px] text-gray-400">
                            {t.createdAt && `Tạo lúc: ${new Date(t.createdAt.endsWith('Z') ? t.createdAt : t.createdAt+'Z').toLocaleDateString('vi-VN')}`}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={onClose} className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100">Đóng</button>
                            <button onClick={() => onEdit(t)} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700">
                                <PencilIcon className="h-3 w-3" /> Chỉnh sửa
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// ============================================================
// FORM MODAL
// ============================================================
const FormModal = ({ modal, allUsers, isAdmin, onClose, onSaved }) => {
    const isEdit = modal.mode === 'edit';
    const t = modal.task;

    const [form, setForm] = useState({
        title: t?.title||'', description: t?.description||'',
        startDate: t?.startDate||modal.date||'', dueDate: t?.dueDate||modal.date||'',
        startTime: t?.startTime?.slice(0,5)||'', endTime: t?.endTime?.slice(0,5)||'',
        priority: t?.priority||'MEDIUM', status: t?.status||'TODO',
        category: t?.category||'work', isAllDay: t?.isAllDay||false,
        location: t?.location||'',
        assigneeId: t?.assigneeId||'', assigneeName: t?.assigneeName||'',
    });
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState(null);
    const [docUrls, setDocUrls] = useState(Array.isArray(t?.documentUrls) ? t.documentUrls : []);
    const [docInput, setDocInput] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    const set = e => { const {name,value,type,checked}=e.target; setForm(p=>({...p,[name]:type==='checkbox'?checked:value})); };
    const handleAssignee = e => {
        const id = e.target.value;
        if (!id) { setForm(p=>({...p,assigneeId:'',assigneeName:''})); return; }
        const u = allUsers.find(x=>x.id===Number(id));
        setForm(p=>({...p, assigneeId:Number(id), assigneeName:u?.fullName||''}));
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setUploading(true); setUploadProgress(0); setErr(null);
        try {
            const result = await fileService.uploadFiles(files, setUploadProgress);
            const fullUrls = (result.urls || []).map(u => fileService.getFullUrl(u));
            setDocUrls(prev => [...prev, ...fullUrls]);
            if (result.errors?.length) setErr('Một số file bị lỗi: ' + result.errors.join(', '));
        } catch (e) {
            setErr(e?.message || 'Lỗi upload file');
        } finally {
            setUploading(false); setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const submit = async e => {
        e.preventDefault();
        if (!form.title.trim()) { setErr('Tiêu đề là bắt buộc'); return; }
        setSaving(true); setErr(null);
        try {
            const payload = {
                ...form,
                startTime: form.startTime ? form.startTime + ':00' : null,
                endTime:   form.endTime   ? form.endTime   + ':00' : null,
                assigneeId:   form.assigneeId   || null,
                assigneeName: form.assigneeName || null,
                documentUrls: docUrls.length > 0 ? docUrls : [],
            };

            if (isEdit) {
                await taskService.updateTask(t.id, payload);
                onSaved('Đã cập nhật công việc');
            } else {

                if (form.assigneeId) {
                    await taskService.assignTask({
                        ...payload,
                        assigneeIds:   [Number(form.assigneeId)],
                        assigneeNames: [form.assigneeName],
                        sendNotification: true,
                    });
                    onSaved(`Đã giao "${form.title}" cho ${form.assigneeName}`);
                } else {
                    await taskService.createTask(payload);
                    onSaved('Đã tạo công việc mới');
                }
            }
        } catch(e) { setErr(e.message || 'Không thể lưu'); }
        finally { setSaving(false); }
    };

    const cls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none";
    const lbl = "block text-xs font-medium text-gray-600 mb-1";

    return (
        <>
            <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <h3 className="text-base font-bold text-gray-900">{isEdit?'Chỉnh sửa':'Tạo công việc mới'}</h3>
                        <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100 text-gray-400"><XMarkIcon className="h-5 w-5" /></button>
                    </div>
                    <form onSubmit={submit} className="p-5 space-y-4">
                        {err && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">{err}</div>}

                        <input name="title" value={form.title} onChange={set} placeholder="Tiêu đề công việc..."
                               className="w-full text-lg font-semibold border-0 border-b-2 border-gray-200 focus:border-indigo-500 focus:ring-0 pb-2 placeholder-gray-300 outline-none" autoFocus />
                        <textarea name="description" value={form.description} onChange={set} rows={2} placeholder="Mô tả..." className={`${cls} resize-none`} />

                        <div className="grid grid-cols-2 gap-3">
                            <div><label className={lbl}>Ngày bắt đầu</label><input type="date" name="startDate" value={form.startDate} onChange={set} className={cls} /></div>
                            <div><label className={lbl}>Ngày kết thúc</label><input type="date" name="dueDate" value={form.dueDate} onChange={set} className={cls} /></div>
                        </div>
                        {!form.isAllDay && (
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className={lbl}>Giờ bắt đầu</label><input type="time" name="startTime" value={form.startTime} onChange={set} className={cls} /></div>
                                <div><label className={lbl}>Giờ kết thúc</label><input type="time" name="endTime" value={form.endTime} onChange={set} className={cls} /></div>
                            </div>
                        )}
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="isAllDay" checked={form.isAllDay} onChange={set} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                            <span className="text-sm text-gray-600">Cả ngày</span>
                        </label>

                        <div className="grid grid-cols-3 gap-3">
                            <div><label className={lbl}>Ưu tiên</label><select name="priority" value={form.priority} onChange={set} className={cls}>{Object.entries(PRIORITY).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></div>
                            <div><label className={lbl}>Loại</label><select name="category" value={form.category} onChange={set} className={cls}>{Object.entries(CATEGORY).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></div>
                            <div><label className={lbl}>Trạng thái</label><select name="status" value={form.status} onChange={set} className={cls}>{STATUS_OPTIONS.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
                        </div>

                        {/* ★ GIAO VIỆC */}
                        <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                            <label className="block text-xs font-semibold text-indigo-700 mb-1.5 flex items-center gap-1">
                                <UsersIcon className="h-3.5 w-3.5" /> Giao cho
                            </label>
                            <select value={form.assigneeId||''} onChange={handleAssignee} className={cls}>
                                <option value="">— Tự làm (giao cho chính mình) —</option>
                                {allUsers.map(u => <option key={u.id} value={u.id}>{u.fullName} ({u.username}){u.role?` · ${u.role}`:''}</option>)}
                            </select>
                            {form.assigneeName && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-indigo-600">
                                    <BellIcon className="h-3.5 w-3.5" />
                                    <span><strong>{form.assigneeName}</strong> sẽ thấy task này trong lịch</span>
                                </div>
                            )}
                        </div>

                        <div><label className={lbl}>Địa điểm</label><input name="location" value={form.location} onChange={set} placeholder="Phòng họp..." className={cls} /></div>

                        {/* ★ TÀI LIỆU */}
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <label className="block text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                                <DocumentTextIcon className="h-3.5 w-3.5" />
                                Tài liệu đính kèm {docUrls.length > 0 && `(${docUrls.length})`}
                            </label>

                            {/* Existing docs */}
                            {docUrls.length > 0 && (
                                <div className="space-y-1.5 mb-2">
                                    {docUrls.map((url, i) => {
                                        const name = url.split('/').pop()?.replace(/^[a-f0-9]+_/, '') || url;
                                        const isLocal = url.startsWith('/api/files/') || url.includes('localhost') || url.includes('ngrok');
                                        return (
                                            <div key={i} className="flex items-center gap-2 bg-white rounded-md px-2.5 py-1.5 border border-gray-200">
                                                {isLocal
                                                    ? <DocumentTextIcon className="h-3 w-3 text-indigo-400 flex-shrink-0" />
                                                    : <LinkIcon className="h-3 w-3 text-blue-400 flex-shrink-0" />
                                                }
                                                <a href={url} target="_blank" rel="noopener noreferrer"
                                                   className="text-xs text-gray-600 hover:text-indigo-600 truncate flex-1 transition-colors">
                                                    {name}
                                                </a>
                                                <button type="button" onClick={() => setDocUrls(d => d.filter((_,j) => j !== i))}
                                                        className="text-gray-300 hover:text-red-500 flex-shrink-0 transition-colors">
                                                    <XMarkIcon className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Upload progress */}
                            {uploading && (
                                <div className="mb-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-indigo-600 font-medium">Đang upload... {uploadProgress}%</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 rounded-full transition-all duration-200"
                                             style={{ width: `${uploadProgress}%` }} />
                                    </div>
                                </div>
                            )}

                            {/* Upload from computer */}
                            <div className="flex gap-1.5 mb-2">
                                <button type="button" disabled={uploading}
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-md text-xs font-medium hover:bg-indigo-100 disabled:opacity-50 transition-colors">
                                    <DocumentTextIcon className="h-3.5 w-3.5" />
                                    {uploading ? 'Đang tải...' : 'Chọn file từ máy'}
                                </button>
                                <input ref={fileInputRef} type="file" multiple className="hidden"
                                       accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.jpg,.jpeg,.png,.gif,.webp"
                                       onChange={handleFileUpload} />
                                <span className="text-[10px] text-gray-400 self-center">Max 20MB/file</span>
                            </div>

                            {/* URL input */}
                            <div className="flex gap-1.5">
                                <input type="url" value={docInput} onChange={e => setDocInput(e.target.value)}
                                       onKeyDown={e => {
                                           if (e.key==='Enter') { e.preventDefault(); if(docInput.trim()){ setDocUrls(d=>[...d, docInput.trim()]); setDocInput(''); } }
                                       }}
                                       placeholder="https://drive.google.com/... rồi nhấn +"
                                       className="flex-1 border border-gray-200 rounded-md px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-white" />
                                <button type="button"
                                        onClick={() => { if(docInput.trim()){ setDocUrls(d=>[...d, docInput.trim()]); setDocInput(''); } }}
                                        className="px-2.5 py-1.5 bg-indigo-100 text-indigo-600 rounded-md text-xs font-bold hover:bg-indigo-200">+</button>
                            </div>
                            <div className="text-[10px] text-gray-400 mt-1">Hoặc dán link Google Drive, OneDrive, Dropbox...</div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Hủy</button>
                            <button type="submit" disabled={saving} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                                {saving && <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />}
                                {isEdit?'Cập nhật':'Tạo & Giao'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default TaskManagementPage;  