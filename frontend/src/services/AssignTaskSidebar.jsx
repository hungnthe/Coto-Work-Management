import { useState, useEffect, useCallback } from 'react';
import taskService from '../services/taskService';
import userService from '../services/userService';

// ─── Helpers ────────────────────────────────────────────────────────────────
const PRIORITIES = [
    { value: 'LOW',    label: 'Thấp',    color: '#22c55e' },
    { value: 'MEDIUM', label: 'Trung bình', color: '#f59e0b' },
    { value: 'HIGH',   label: 'Cao',     color: '#ef4444' },
    { value: 'URGENT', label: 'Khẩn cấp', color: '#7c3aed' },
];

const today = () => new Date().toISOString().slice(0, 10);

// ─── Component ──────────────────────────────────────────────────────────────
/**
 * AssignTaskSidebar
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - onSuccess: (result) => void          — gọi lại sau khi giao việc thành công
 *  - defaultDate: string | null           — ngày được chọn trên Calendar (YYYY-MM-DD)
 *  - units: Array<{id, unitName}>         — danh sách phòng ban (từ unitService)
 */
export default function AssignTaskSidebar({
                                              isOpen,
                                              onClose,
                                              onSuccess,
                                              defaultDate = null,
                                              units = [],
                                          }) {
    // ── Tab: 'people' | 'unit' ──────────────────────────────────
    const [mode, setMode]         = useState('people');

    // ── Task fields ──────────────────────────────────────────────
    const [title, setTitle]       = useState('');
    const [desc, setDesc]         = useState('');
    const [startDate, setStart]   = useState(defaultDate || today());
    const [dueDate, setDue]       = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [notifMsg, setNotifMsg] = useState('');

    // ── Người được giao ──────────────────────────────────────────
    const [allUsers, setAllUsers]     = useState([]);
    const [userSearch, setSearch]     = useState('');
    const [selected, setSelected]     = useState([]);   // [{id, fullName, username, unitName}]
    const [loadingUsers, setLoadingU] = useState(false);

    // ── Phòng ban ────────────────────────────────────────────────
    const [selUnit, setSelUnit]       = useState(null);  // {id, unitName}
    const [unitMembers, setMembers]   = useState([]);    // members to notify

    // ── Submit ───────────────────────────────────────────────────
    const [submitting, setSubmit]     = useState(false);
    const [error, setError]           = useState('');
    const [success, setSuccess]       = useState('');

    // Load users khi mở sidebar
    useEffect(() => {
        if (!isOpen) return;
        setLoadingU(true);
        userService.getAllUsers()
            .then(users => setAllUsers(users || []))
            .catch(() => setAllUsers([]))
            .finally(() => setLoadingU(false));
    }, [isOpen]);

    // Reset khi đóng
    useEffect(() => {
        if (!isOpen) {
            setTitle(''); setDesc(''); setDue(''); setPriority('MEDIUM');
            setNotifMsg(''); setSelected([]); setSelUnit(null); setMembers([]);
            setSearch(''); setError(''); setSuccess(''); setMode('people');
            setStart(defaultDate || today());
        }
    }, [isOpen, defaultDate]);

    // Cập nhật startDate khi defaultDate thay đổi
    useEffect(() => {
        if (defaultDate) setStart(defaultDate);
    }, [defaultDate]);

    // ── User selection ───────────────────────────────────────────
    const filteredUsers = allUsers.filter(u => {
        const q = userSearch.toLowerCase();
        return (
            u.fullName?.toLowerCase().includes(q) ||
            u.username?.toLowerCase().includes(q) ||
            u.unitName?.toLowerCase().includes(q)
        );
    });

    const toggleUser = useCallback((user) => {
        setSelected(prev =>
            prev.find(u => u.id === user.id)
                ? prev.filter(u => u.id !== user.id)
                : [...prev, user]
        );
    }, []);

    // ── Unit selection ───────────────────────────────────────────
    const handleSelectUnit = (unit) => {
        setSelUnit(unit);
        // Lấy members của unit để notify
        const members = allUsers.filter(u => u.unit?.id === unit.id || u.unitId === unit.id);
        setMembers(members);
    };

    // ── Submit ───────────────────────────────────────────────────
    const handleSubmit = async () => {
        setError(''); setSuccess('');
        if (!title.trim()) return setError('Vui lòng nhập tiêu đề công việc.');
        if (mode === 'people' && selected.length === 0) return setError('Vui lòng chọn ít nhất 1 người.');
        if (mode === 'unit' && !selUnit) return setError('Vui lòng chọn phòng ban.');

        setSubmit(true);
        try {
            const payload = {
                title: title.trim(),
                description: desc.trim() || null,
                startDate: startDate || null,
                dueDate: dueDate || null,
                priority,
                status: 'TODO',
                category: 'work',
                sendNotification: true,
                notificationMessage: notifMsg.trim() || null,
                ...(mode === 'people'
                    ? {
                        assigneeIds: selected.map(u => u.id),
                        assigneeNames: selected.map(u => u.fullName || u.username),
                    }
                    : {
                        unitId: selUnit.id,
                        unitName: selUnit.unitName,
                        unitMemberIds: unitMembers.map(u => u.id),
                    }),
            };

            const result = await taskService.assignTask(payload);
            setSuccess(`✅ Đã giao ${result.createdCount} công việc, gửi ${result.notificationSent} thông báo.`);
            onSuccess?.(result);

            setTimeout(() => {
                onClose();
            }, 1800);
        } catch (e) {
            setError(e?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setSubmit(false);
        }
    };

    // ────────────────────────────────────────────────────────────────────────────
    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                style={styles.overlay}
                onClick={onClose}
            />

            {/* Sidebar */}
            <aside style={styles.sidebar}>

                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <span style={styles.headerIcon}>📋</span>
                        <span style={styles.headerTitle}>Giao công việc</span>
                    </div>
                    <button onClick={onClose} style={styles.closeBtn} title="Đóng">✕</button>
                </div>

                {/* Body - scrollable */}
                <div style={styles.body}>

                    {/* ── Mode tabs ── */}
                    <div style={styles.tabRow}>
                        {[
                            { key: 'people', label: '👤 Người cụ thể' },
                            { key: 'unit',   label: '🏢 Phòng ban' },
                        ].map(t => (
                            <button
                                key={t.key}
                                onClick={() => setMode(t.key)}
                                style={{ ...styles.tab, ...(mode === t.key ? styles.tabActive : {}) }}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* ── Task info ── */}
                    <section style={styles.section}>
                        <label style={styles.label}>Tiêu đề <span style={styles.required}>*</span></label>
                        <input
                            style={styles.input}
                            placeholder="Nhập tiêu đề công việc..."
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </section>

                    <section style={styles.section}>
                        <label style={styles.label}>Mô tả</label>
                        <textarea
                            style={{ ...styles.input, height: 72, resize: 'vertical' }}
                            placeholder="Mô tả chi tiết (không bắt buộc)..."
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                        />
                    </section>

                    <div style={styles.row2}>
                        <section style={{ ...styles.section, flex: 1 }}>
                            <label style={styles.label}>Ngày bắt đầu</label>
                            <input type="date" style={styles.input} value={startDate} onChange={e => setStart(e.target.value)} />
                        </section>
                        <section style={{ ...styles.section, flex: 1 }}>
                            <label style={styles.label}>Hạn chót</label>
                            <input type="date" style={styles.input} value={dueDate} onChange={e => setDue(e.target.value)} />
                        </section>
                    </div>

                    <section style={styles.section}>
                        <label style={styles.label}>Độ ưu tiên</label>
                        <div style={styles.priorityRow}>
                            {PRIORITIES.map(p => (
                                <button
                                    key={p.value}
                                    onClick={() => setPriority(p.value)}
                                    style={{
                                        ...styles.priorityBtn,
                                        border: priority === p.value ? `2px solid ${p.color}` : '2px solid transparent',
                                        background: priority === p.value ? p.color + '22' : '#f8fafc',
                                        color: priority === p.value ? p.color : '#64748b',
                                    }}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* ── Người được giao / Phòng ban ── */}
                    {mode === 'people' ? (
                        <section style={styles.section}>
                            <label style={styles.label}>
                                Chọn người nhận việc <span style={styles.required}>*</span>
                                {selected.length > 0 && (
                                    <span style={styles.badge}>{selected.length} đã chọn</span>
                                )}
                            </label>

                            <input
                                style={{ ...styles.input, marginBottom: 6 }}
                                placeholder="🔍 Tìm theo tên, username, phòng ban..."
                                value={userSearch}
                                onChange={e => setSearch(e.target.value)}
                            />

                            {/* Selected chips */}
                            {selected.length > 0 && (
                                <div style={styles.chipRow}>
                                    {selected.map(u => (
                                        <span key={u.id} style={styles.chip}>
                      {u.fullName || u.username}
                                            <button
                                                onClick={() => toggleUser(u)}
                                                style={styles.chipClose}
                                            >×</button>
                    </span>
                                    ))}
                                </div>
                            )}

                            {/* User list */}
                            <div style={styles.userList}>
                                {loadingUsers && <div style={styles.hint}>Đang tải danh sách...</div>}
                                {!loadingUsers && filteredUsers.length === 0 && (
                                    <div style={styles.hint}>Không tìm thấy người dùng nào.</div>
                                )}
                                {filteredUsers.map(u => {
                                    const isChecked = selected.some(s => s.id === u.id);
                                    return (
                                        <div
                                            key={u.id}
                                            onClick={() => toggleUser(u)}
                                            style={{
                                                ...styles.userRow,
                                                background: isChecked ? '#eff6ff' : 'transparent',
                                            }}
                                        >
                                            <div style={styles.avatar}>
                                                {(u.fullName || u.username || '?')[0].toUpperCase()}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={styles.userName}>{u.fullName || u.username}</div>
                                                <div style={styles.userMeta}>{u.unit?.unitName || u.unitName || u.username}</div>
                                            </div>
                                            <div style={{
                                                ...styles.checkbox,
                                                background: isChecked ? '#3b82f6' : 'white',
                                                border: isChecked ? '2px solid #3b82f6' : '2px solid #cbd5e1',
                                            }}>
                                                {isChecked && <span style={{ color: 'white', fontSize: 11 }}>✓</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    ) : (
                        <section style={styles.section}>
                            <label style={styles.label}>
                                Chọn phòng ban <span style={styles.required}>*</span>
                            </label>
                            <div style={styles.userList}>
                                {units.length === 0 && (
                                    <div style={styles.hint}>Không có dữ liệu phòng ban.</div>
                                )}
                                {units.map(unit => {
                                    const isChecked = selUnit?.id === unit.id;
                                    const memberCount = allUsers.filter(u =>
                                        u.unit?.id === unit.id || u.unitId === unit.id
                                    ).length;
                                    return (
                                        <div
                                            key={unit.id}
                                            onClick={() => handleSelectUnit(unit)}
                                            style={{
                                                ...styles.userRow,
                                                background: isChecked ? '#eff6ff' : 'transparent',
                                            }}
                                        >
                                            <div style={{ ...styles.avatar, background: '#8b5cf6', fontSize: 18 }}>🏢</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={styles.userName}>{unit.unitName}</div>
                                                <div style={styles.userMeta}>{memberCount} thành viên{memberCount > 0 ? ' — sẽ được thông báo' : ''}</div>
                                            </div>
                                            <div style={{
                                                ...styles.checkbox,
                                                borderRadius: '50%',
                                                background: isChecked ? '#8b5cf6' : 'white',
                                                border: isChecked ? '2px solid #8b5cf6' : '2px solid #cbd5e1',
                                            }}>
                                                {isChecked && <span style={{ color: 'white', fontSize: 11 }}>✓</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* ── Notification message ── */}
                    <section style={styles.section}>
                        <label style={styles.label}>Lời nhắn kèm thông báo <span style={styles.optional}>(tuỳ chọn)</span></label>
                        <textarea
                            style={{ ...styles.input, height: 56, resize: 'vertical' }}
                            placeholder="VD: Đây là task quan trọng, hoàn thành trước deadline nhé!"
                            value={notifMsg}
                            onChange={e => setNotifMsg(e.target.value)}
                        />
                    </section>

                    {/* Feedback */}
                    {error   && <div style={styles.errorBox}>{error}</div>}
                    {success && <div style={styles.successBox}>{success}</div>}
                </div>

                {/* Footer */}
                <div style={styles.footer}>
                    <button onClick={onClose} style={styles.cancelBtn} disabled={submitting}>
                        Hủy
                    </button>
                    <button onClick={handleSubmit} style={styles.submitBtn} disabled={submitting}>
                        {submitting
                            ? '⏳ Đang giao...'
                            : mode === 'people'
                                ? `Giao việc${selected.length > 0 ? ` (${selected.length})` : ''}`
                                : `Giao cho ${selUnit?.unitName || 'phòng ban'}`}
                    </button>
                </div>
            </aside>
        </>
    );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = {
    overlay: {
        position: 'fixed', inset: 0,
        background: 'rgba(15,23,42,0.35)',
        backdropFilter: 'blur(2px)',
        zIndex: 999,
    },
    sidebar: {
        position: 'fixed', top: 0, right: 0,
        width: 400, height: '100vh',
        background: '#ffffff',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
        zIndex: 1000,
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
    },
    header: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '18px 20px',
        borderBottom: '1px solid #e2e8f0',
        background: '#f8fafc',
    },
    headerIcon: { fontSize: 20, marginRight: 10 },
    headerTitle: { fontSize: 16, fontWeight: 700, color: '#0f172a' },
    closeBtn: {
        background: 'none', border: 'none', fontSize: 18,
        cursor: 'pointer', color: '#94a3b8', padding: '4px 8px',
        borderRadius: 6, lineHeight: 1,
    },
    body: {
        flex: 1, overflowY: 'auto', padding: '16px 20px',
        display: 'flex', flexDirection: 'column', gap: 0,
    },
    tabRow: {
        display: 'flex', gap: 8, marginBottom: 16,
        background: '#f1f5f9', padding: 4, borderRadius: 10,
    },
    tab: {
        flex: 1, padding: '8px 0',
        border: 'none', borderRadius: 8,
        fontSize: 13, fontWeight: 500,
        cursor: 'pointer', background: 'transparent', color: '#64748b',
        transition: 'all .15s',
    },
    tabActive: {
        background: '#ffffff',
        color: '#1e40af',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        fontWeight: 700,
    },
    section: { marginBottom: 14 },
    row2: { display: 'flex', gap: 10 },
    label: {
        display: 'block', fontSize: 12.5, fontWeight: 600,
        color: '#475569', marginBottom: 5, letterSpacing: '0.02em',
    },
    required: { color: '#ef4444', marginLeft: 2 },
    optional: { color: '#94a3b8', fontWeight: 400, marginLeft: 4, fontSize: 11.5 },
    badge: {
        background: '#3b82f6', color: 'white',
        borderRadius: 20, padding: '1px 8px', fontSize: 11.5,
        marginLeft: 8, fontWeight: 600,
    },
    input: {
        width: '100%', padding: '8px 11px',
        border: '1.5px solid #e2e8f0', borderRadius: 8,
        fontSize: 13.5, color: '#1e293b', outline: 'none',
        background: '#f8fafc',
        boxSizing: 'border-box',
        transition: 'border-color .15s',
        fontFamily: 'inherit',
    },
    priorityRow: { display: 'flex', gap: 6 },
    priorityBtn: {
        flex: 1, padding: '6px 0',
        borderRadius: 7, fontSize: 12.5, fontWeight: 600,
        cursor: 'pointer', transition: 'all .15s',
    },
    chipRow: {
        display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8,
    },
    chip: {
        display: 'inline-flex', alignItems: 'center', gap: 4,
        background: '#dbeafe', color: '#1e40af',
        borderRadius: 20, padding: '3px 10px',
        fontSize: 12.5, fontWeight: 500,
    },
    chipClose: {
        background: 'none', border: 'none',
        color: '#1e40af', cursor: 'pointer',
        fontSize: 15, lineHeight: 1, padding: 0,
    },
    userList: {
        border: '1.5px solid #e2e8f0', borderRadius: 10,
        maxHeight: 220, overflowY: 'auto',
        background: '#fafafa',
    },
    userRow: {
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 12px', cursor: 'pointer',
        borderBottom: '1px solid #f1f5f9',
        transition: 'background .1s',
    },
    avatar: {
        width: 34, height: 34, borderRadius: '50%',
        background: '#3b82f6', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 700, flexShrink: 0,
    },
    userName: { fontSize: 13.5, fontWeight: 600, color: '#1e293b' },
    userMeta: { fontSize: 12, color: '#94a3b8', marginTop: 1 },
    checkbox: {
        width: 20, height: 20, borderRadius: 5,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, transition: 'all .15s',
    },
    hint: { padding: 16, textAlign: 'center', color: '#94a3b8', fontSize: 13 },
    errorBox: {
        background: '#fef2f2', border: '1px solid #fecaca',
        color: '#dc2626', borderRadius: 8,
        padding: '10px 14px', fontSize: 13, marginBottom: 8,
    },
    successBox: {
        background: '#f0fdf4', border: '1px solid #bbf7d0',
        color: '#16a34a', borderRadius: 8,
        padding: '10px 14px', fontSize: 13, marginBottom: 8,
    },
    footer: {
        padding: '14px 20px',
        borderTop: '1px solid #e2e8f0',
        background: '#f8fafc',
        display: 'flex', gap: 10,
    },
    cancelBtn: {
        flex: 1, padding: '10px 0',
        border: '1.5px solid #e2e8f0', borderRadius: 9,
        background: 'white', color: '#64748b',
        fontSize: 14, fontWeight: 600, cursor: 'pointer',
    },
    submitBtn: {
        flex: 2, padding: '10px 0',
        border: 'none', borderRadius: 9,
        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        color: 'white', fontSize: 14, fontWeight: 700,
        cursor: 'pointer', boxShadow: '0 2px 8px rgba(59,130,246,0.35)',
    },
};