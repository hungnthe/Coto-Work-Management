// src/pages/Admin/UserDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import userService from '../../services/userService';
import unitService from '../../services/unitService';
import {
    ArrowLeftIcon, PencilIcon, CheckIcon, XMarkIcon,
    UserIcon, EnvelopeIcon, PhoneIcon, BuildingOfficeIcon,
    ShieldCheckIcon, CalendarIcon, KeyIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

// ── Helpers ──────────────────────────────────────────────────
const ROLE_CONFIG = {
    ADMIN:        { label:'Quản trị viên', bg:'#ede9fe', color:'#7c3aed' },
    UNIT_MANAGER: { label:'Trưởng đơn vị', bg:'#dbeafe', color:'#1d4ed8' },
    MANAGER:      { label:'Quản lý',        bg:'#e0f2fe', color:'#0369a1' },
    STAFF:        { label:'Nhân viên',      bg:'#f1f5f9', color:'#475569' },
    VIEWER:       { label:'Người xem',      bg:'#f8fafc', color:'#94a3b8' },
};

const fmtDate = (str) => {
    if (!str) return '—';
    return new Date(str.endsWith('Z') ? str : str + 'Z')
        .toLocaleString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
};

const Toast = ({ msg, type, onClose }) => (
    <div style={{
        position:'fixed', bottom:24, right:24, zIndex:9999,
        background: type==='error' ? '#fef2f2' : '#f0fdf4',
        border:`1px solid ${type==='error'?'#fecaca':'#bbf7d0'}`,
        color: type==='error' ? '#dc2626' : '#16a34a',
        borderRadius:12, padding:'12px 20px',
        boxShadow:'0 8px 24px rgba(0,0,0,.12)',
        display:'flex', alignItems:'center', gap:10,
        fontSize:13.5, fontWeight:500, minWidth:260,
        animation:'slideUp .3s ease',
    }}>
        {type==='error' ? '❌' : '✅'} {msg}
        <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',marginLeft:'auto',display:'flex',color:'inherit'}}>
            <XMarkIcon style={{width:16}}/>
        </button>
        <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
);

// ── Info Row (view mode) ─────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value }) => (
    <div style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'12px 0', borderBottom:'1px solid #f1f5f9' }}>
        <div style={{ width:36, height:36, borderRadius:9, background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Icon style={{ width:17, color:'#6366f1' }} />
        </div>
        <div style={{ flex:1 }}>
            <div style={{ fontSize:11.5, color:'#94a3b8', marginBottom:2, fontWeight:500, textTransform:'uppercase', letterSpacing:'.04em' }}>{label}</div>
            <div style={{ fontSize:14, color:'#1e293b', fontWeight:500 }}>{value || '—'}</div>
        </div>
    </div>
);

// ── Main ─────────────────────────────────────────────────────
const UserDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user,    setUser]    = useState(null);
    const [units,   setUnits]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving,  setSaving]  = useState(false);
    const [toast,   setToast]   = useState(null);

    // Edit form state
    const [form, setForm] = useState({});
    const [fieldErrors, setFieldErrors] = useState({});

    const showToast = (msg, type='success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    // Load user + units
    useEffect(() => {
        Promise.all([
            userService.getUserById(Number(id)),
            unitService.getAllUnits(),
        ])
            .then(([u, us]) => {
                setUser(u);
                setUnits(Array.isArray(us) ? us : []);
                initForm(u);
            })
            .catch(e => showToast(e?.message || 'Không thể tải thông tin', 'error'))
            .finally(() => setLoading(false));
    }, [id]);

    const initForm = (u) => {
        setForm({
            fullName:    u.fullName    || '',
            email:       u.email       || '',
            phoneNumber: u.phoneNumber || '',
            role:        u.role        || 'STAFF',
            unitId:      u.unit?.id    || '',
            isActive:    u.isActive    ?? true,
        });
    };

    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : (name === 'unitId' ? Number(value) : value) }));
        if (fieldErrors[name]) setFieldErrors(p => { const n = { ...p }; delete n[name]; return n; });
    };

    const handleSave = async () => {
        if (!form.fullName?.trim()) { setFieldErrors({ fullName: ['Họ tên là bắt buộc'] }); return; }
        if (!form.email?.trim())    { setFieldErrors({ email:    ['Email là bắt buộc']  }); return; }

        setSaving(true);
        try {
            const payload = { ...form, unitId: form.unitId || null };
            const updated = await userService.updateUser(Number(id), payload);
            setUser(updated);
            initForm(updated);
            setEditing(false);
            showToast('Đã cập nhật thông tin người dùng');
        } catch (e) {
            if (e?.validationErrors?.length) {
                const grouped = {};
                e.validationErrors.forEach(v => { if (!grouped[v.field]) grouped[v.field] = []; grouped[v.field].push(v.message); });
                setFieldErrors(grouped);
            }
            showToast(e?.message || 'Không thể cập nhật', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => { initForm(user); setFieldErrors({}); setEditing(false); };

    const handleToggleStatus = async () => {
        if (!window.confirm(`${user.isActive ? 'Khóa' : 'Mở khóa'} tài khoản này?`)) return;
        try {
            await userService.toggleUserStatus(user.id, user.isActive);
            const updated = await userService.getUserById(user.id);
            setUser(updated);
            showToast(user.isActive ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
        } catch (e) {
            showToast(e?.message || 'Lỗi cập nhật trạng thái', 'error');
        }
    };

    const inp = (name) => ({
        name, value: form[name] || '',
        onChange: handleChange,
        style: {
            width: '100%', padding: '9px 12px',
            border: `1.5px solid ${fieldErrors[name] ? '#fca5a5' : '#e2e8f0'}`,
            borderRadius: 8, fontSize: 13.5, outline: 'none',
            background: fieldErrors[name] ? '#fef2f2' : '#f8fafc',
            color: '#1e293b', boxSizing: 'border-box',
        },
    });

    const FieldErr = ({ name }) => fieldErrors[name]
        ? <div style={{ color:'#ef4444', fontSize:11.5, marginTop:4 }}>{fieldErrors[name][0]}</div>
        : null;

    const lbl = { display:'block', fontSize:11.5, fontWeight:600, color:'#64748b', marginBottom:5, textTransform:'uppercase', letterSpacing:'.04em' };

    if (loading) return (
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:300 }}>
            <div style={{ width:36, height:36, border:'3px solid #e2e8f0', borderTopColor:'#6366f1', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    if (!user) return (
        <div style={{ textAlign:'center', padding:48, color:'#94a3b8' }}>
            Không tìm thấy người dùng.
            <br />
            <button onClick={() => navigate('/admin/users')} style={{ marginTop:12, color:'#6366f1', background:'none', border:'none', cursor:'pointer', fontSize:14 }}>
                ← Quay lại danh sách
            </button>
        </div>
    );

    const roleConf = ROLE_CONFIG[user.role] || ROLE_CONFIG.STAFF;
    const avatar = (user.fullName || user.username || '?')[0].toUpperCase();

    return (
        <div style={{ maxWidth:860, margin:'0 auto', padding:24, fontFamily:"'Segoe UI',system-ui,sans-serif" }}>

            {/* Back */}
            <button onClick={() => navigate('/admin/users')}
                    style={{ display:'flex', alignItems:'center', gap:6, color:'#64748b', background:'none', border:'none', cursor:'pointer', fontSize:13.5, fontWeight:500, marginBottom:20, padding:0 }}>
                <ArrowLeftIcon style={{ width:16 }} /> Quay lại danh sách
            </button>

            {/* Header card */}
            <div style={{
                background:'white', borderRadius:16, border:'1px solid #f1f5f9',
                boxShadow:'0 2px 12px rgba(0,0,0,.06)', overflow:'hidden', marginBottom:20,
            }}>
                {/* Banner */}
                <div style={{ height:80, background:'linear-gradient(135deg,#6366f1,#8b5cf6)' }} />

                <div style={{ padding:'0 28px 24px', position:'relative' }}>
                    {/* Avatar */}
                    <div style={{
                        width:72, height:72, borderRadius:'50%',
                        background:'white', border:'3px solid white',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:28, fontWeight:800, color:'#6366f1',
                        boxShadow:'0 4px 14px rgba(0,0,0,.12)',
                        position:'absolute', top:-36, left:28,
                    }}>
                        {user.avatarUrl
                            ? <img src={user.avatarUrl} alt="" style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }} />
                            : avatar
                        }
                    </div>

                    {/* Actions */}
                    <div style={{ display:'flex', justifyContent:'flex-end', gap:8, paddingTop:12 }}>
                        {!editing ? (
                            <>
                                <button onClick={handleToggleStatus}
                                        style={{
                                            display:'flex', alignItems:'center', gap:6, padding:'8px 16px',
                                            border:`1.5px solid ${user.isActive ? '#fca5a5' : '#bbf7d0'}`,
                                            borderRadius:9, background:'white', cursor:'pointer', fontSize:13, fontWeight:600,
                                            color: user.isActive ? '#dc2626' : '#16a34a',
                                        }}>
                                    {user.isActive ? <XCircleIcon style={{ width:16 }} /> : <CheckCircleIcon style={{ width:16 }} />}
                                    {user.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
                                </button>
                                <button onClick={() => setEditing(true)}
                                        style={{
                                            display:'flex', alignItems:'center', gap:6, padding:'8px 18px',
                                            border:'none', borderRadius:9, cursor:'pointer', fontSize:13, fontWeight:700,
                                            background:'linear-gradient(135deg,#6366f1,#4f46e5)', color:'white',
                                            boxShadow:'0 3px 10px rgba(99,102,241,.3)',
                                        }}>
                                    <PencilIcon style={{ width:15 }} /> Chỉnh sửa
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={handleCancel}
                                        style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', border:'1.5px solid #e2e8f0', borderRadius:9, background:'white', cursor:'pointer', fontSize:13, fontWeight:600, color:'#64748b' }}>
                                    <XMarkIcon style={{ width:15 }} /> Hủy
                                </button>
                                <button onClick={handleSave} disabled={saving}
                                        style={{
                                            display:'flex', alignItems:'center', gap:6, padding:'8px 18px',
                                            border:'none', borderRadius:9, cursor:'pointer', fontSize:13, fontWeight:700,
                                            background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'white',
                                            opacity: saving ? .6 : 1,
                                        }}>
                                    {saving
                                        ? <div style={{ width:14, height:14, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
                                        : <CheckIcon style={{ width:15 }} />
                                    }
                                    Lưu thay đổi
                                </button>
                            </>
                        )}
                    </div>

                    {/* Name + role */}
                    <div style={{ marginTop:8 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                            <h1 style={{ fontSize:20, fontWeight:800, color:'#0f172a', margin:0 }}>{user.fullName || user.username}</h1>
                            <span style={{ fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:20, background:roleConf.bg, color:roleConf.color }}>
                {roleConf.label}
              </span>
                            {user.isActive
                                ? <span style={{ fontSize:12, fontWeight:600, padding:'3px 10px', borderRadius:20, background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0' }}>● Hoạt động</span>
                                : <span style={{ fontSize:12, fontWeight:600, padding:'3px 10px', borderRadius:20, background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca' }}>● Đã khóa</span>
                            }
                        </div>
                        <div style={{ fontSize:13, color:'#64748b', marginTop:4 }}>@{user.username} · #{user.id}</div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

                {/* Left: info / edit */}
                <div style={{ background:'white', borderRadius:16, border:'1px solid #f1f5f9', boxShadow:'0 2px 12px rgba(0,0,0,.06)', padding:24 }}>
                    <h3 style={{ fontSize:14, fontWeight:700, color:'#0f172a', margin:'0 0 4px' }}>
                        {editing ? '✏️ Chỉnh sửa thông tin' : '📋 Thông tin cá nhân'}
                    </h3>
                    <div style={{ fontSize:12, color:'#94a3b8', marginBottom:16 }}>
                        {editing ? 'Thay đổi và nhấn Lưu' : 'Thông tin chi tiết người dùng'}
                    </div>

                    {!editing ? (
                        <>
                            <InfoRow icon={UserIcon}          label="Họ và tên"   value={user.fullName} />
                            <InfoRow icon={EnvelopeIcon}      label="Email"       value={user.email} />
                            <InfoRow icon={PhoneIcon}         label="Điện thoại"  value={user.phoneNumber} />
                            <InfoRow icon={BuildingOfficeIcon} label="Đơn vị"     value={user.unit?.unitName} />
                            <InfoRow icon={ShieldCheckIcon}   label="Vai trò"     value={roleConf.label} />
                        </>
                    ) : (
                        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                            <div>
                                <label style={lbl}>Họ và tên *</label>
                                <input {...inp('fullName')} placeholder="Nguyễn Văn A" />
                                <FieldErr name="fullName" />
                            </div>
                            <div>
                                <label style={lbl}>Email *</label>
                                <input {...inp('email')} type="email" placeholder="user@cotowork.vn" />
                                <FieldErr name="email" />
                            </div>
                            <div>
                                <label style={lbl}>Số điện thoại</label>
                                <input {...inp('phoneNumber')} placeholder="09xxxxxxx" />
                            </div>
                            <div>
                                <label style={lbl}>Đơn vị công tác</label>
                                <select name="unitId" value={form.unitId || ''} onChange={handleChange}
                                        style={{ ...inp('unitId').style, background:'white' }}>
                                    <option value="">— Chưa phân công —</option>
                                    {units.map(u => <option key={u.id} value={u.id}>{u.unitName}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={lbl}>Vai trò</label>
                                <select name="role" value={form.role} onChange={handleChange}
                                        style={{ ...inp('role').style, background:'white' }}>
                                    <option value="STAFF">Nhân viên</option>
                                    <option value="UNIT_MANAGER">Trưởng đơn vị</option>
                                    <option value="MANAGER">Quản lý</option>
                                    <option value="ADMIN">Quản trị viên</option>
                                    <option value="VIEWER">Người xem</option>
                                </select>
                            </div>
                            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'#f8fafc', borderRadius:9, border:'1.5px solid #e2e8f0' }}>
                                <input type="checkbox" name="isActive" id="isActive" checked={form.isActive} onChange={handleChange}
                                       style={{ width:16, height:16, accentColor:'#6366f1', cursor:'pointer' }} />
                                <label htmlFor="isActive" style={{ fontSize:13.5, color:'#1e293b', fontWeight:500, cursor:'pointer' }}>
                                    Tài khoản đang hoạt động
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: meta info */}
                <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

                    {/* Account info */}
                    <div style={{ background:'white', borderRadius:16, border:'1px solid #f1f5f9', boxShadow:'0 2px 12px rgba(0,0,0,.06)', padding:24 }}>
                        <h3 style={{ fontSize:14, fontWeight:700, color:'#0f172a', margin:'0 0 16px' }}>🔑 Thông tin tài khoản</h3>
                        <InfoRow icon={UserIcon}     label="Tên đăng nhập" value={user.username} />
                        <InfoRow icon={CalendarIcon} label="Ngày tạo"      value={fmtDate(user.createdAt)} />
                        <InfoRow icon={CalendarIcon} label="Cập nhật lần cuối" value={fmtDate(user.updatedAt)} />
                    </div>

                    {/* Unit card */}
                    {user.unit && (
                        <div style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius:16, padding:20, color:'white' }}>
                            <div style={{ fontSize:12, opacity:.8, marginBottom:6, fontWeight:600, textTransform:'uppercase', letterSpacing:'.06em' }}>Đơn vị công tác</div>
                            <div style={{ fontSize:16, fontWeight:800, marginBottom:4 }}>{user.unit.unitName}</div>
                            <div style={{ fontSize:12, opacity:.75 }}>Mã: {user.unit.unitCode}</div>
                        </div>
                    )}

                    {/* Quick reset password note */}
                    <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:16, padding:20 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                            <KeyIcon style={{ width:18, color:'#d97706' }} />
                            <span style={{ fontSize:13.5, fontWeight:700, color:'#92400e' }}>Đặt lại mật khẩu</span>
                        </div>
                        <p style={{ fontSize:12.5, color:'#78350f', margin:'0 0 12px', lineHeight:1.5 }}>
                            Dùng API <code style={{ background:'#fef3c7', padding:'1px 5px', borderRadius:4 }}>PATCH /api/users/{user.id}/password</code> để đổi mật khẩu cho người dùng này.
                        </p>
                    </div>
                </div>
            </div>

            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
};

export default UserDetailPage;