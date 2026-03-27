// src/pages/Admin/UnitManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import unitService from '../../services/unitService';
import {
    BuildingOfficeIcon, PlusIcon, PencilIcon, TrashIcon,
    ChevronRightIcon, ChevronDownIcon, UsersIcon,
    XMarkIcon, MagnifyingGlassIcon, ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

// ── Build tree ───────────────────────────────────────────────
const buildTree = (units) => {
    const map = {};
    units.forEach(u => { map[u.id] = { ...u, children: [] }; });
    const roots = [];
    units.forEach(u => {
        if (u.parentUnitId && map[u.parentUnitId]) {
            map[u.parentUnitId].children.push(map[u.id]);
        } else {
            roots.push(map[u.id]);
        }
    });
    return roots;
};

// ── Toast ────────────────────────────────────────────────────
const Toast = ({ msg, type, onClose }) => (
    <div style={{
        position:'fixed',bottom:24,right:24,zIndex:9999,
        background:type==='error'?'#fef2f2':'#f0fdf4',
        border:`1px solid ${type==='error'?'#fecaca':'#bbf7d0'}`,
        color:type==='error'?'#dc2626':'#16a34a',
        borderRadius:12,padding:'12px 18px',
        boxShadow:'0 8px 24px rgba(0,0,0,.12)',
        display:'flex',alignItems:'center',gap:10,
        fontSize:13.5,fontWeight:500,maxWidth:340,
        animation:'slideUp .3s ease',
    }}>
        {type==='error'?'❌':'✅'} {msg}
        <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',marginLeft:'auto',color:'inherit',display:'flex'}}>
            <XMarkIcon style={{width:16}}/>
        </button>
        <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
);

// ── Unit Form Modal ──────────────────────────────────────────
const UnitModal = ({ unit, allUnits, onClose, onSaved }) => {
    const isEdit = !!unit?.id;
    const [form, setForm] = useState({
        unitCode:     unit?.unitCode     || '',
        unitName:     unit?.unitName     || '',
        parentUnitId: unit?.parentUnitId ?? '',
        description:  unit?.description  || '',
        address:      unit?.address      || '',
        phoneNumber:  unit?.phoneNumber  || '',
    });
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');

    const set = e => setForm(p=>({...p,[e.target.name]:e.target.value}));

    const submit = async e => {
        e.preventDefault();
        if (!form.unitCode.trim()||!form.unitName.trim()){setErr('Mã và Tên đơn vị là bắt buộc');return;}
        setSaving(true);setErr('');
        try {
            const payload={...form,parentUnitId:form.parentUnitId?Number(form.parentUnitId):null};
            isEdit ? await unitService.updateUnit(unit.id,payload) : await unitService.createUnit(payload);
            onSaved(isEdit?'Đã cập nhật đơn vị':'Đã tạo đơn vị mới');
        } catch(e){setErr(e?.message||'Có lỗi xảy ra');}
        finally{setSaving(false);}
    };

    const inp="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 focus:bg-white";
    const lbl="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide";

    return (
        <>
            <div style={{position:'fixed',inset:0,background:'rgba(15,23,42,.4)',backdropFilter:'blur(3px)',zIndex:1000}} onClick={onClose}/>
            <div style={{position:'fixed',inset:0,zIndex:1001,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
                <div style={{background:'white',borderRadius:18,width:'100%',maxWidth:520,boxShadow:'0 24px 64px rgba(0,0,0,.18)',overflow:'hidden'}}
                     onClick={e=>e.stopPropagation()}>

                    <div style={{padding:'18px 24px',borderBottom:'1px solid #f1f5f9',display:'flex',justifyContent:'space-between',alignItems:'center',background:'#f8fafc'}}>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                            <div style={{background:'#6366f1',borderRadius:8,padding:6,display:'flex'}}>
                                <BuildingOfficeIcon style={{width:18,color:'white'}}/>
                            </div>
                            <span style={{fontWeight:700,fontSize:15,color:'#0f172a'}}>
                {isEdit?'Chỉnh sửa đơn vị':'Thêm đơn vị mới'}
              </span>
                        </div>
                        <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:'#94a3b8',display:'flex'}}>
                            <XMarkIcon style={{width:20}}/>
                        </button>
                    </div>

                    <form onSubmit={submit} style={{padding:'20px 24px',display:'flex',flexDirection:'column',gap:14}}>
                        {err&&<div style={{background:'#fef2f2',border:'1px solid #fecaca',color:'#dc2626',borderRadius:8,padding:'10px 14px',fontSize:13}}>{err}</div>}

                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                            <div><label className={lbl}>Mã đơn vị *</label><input name="unitCode" value={form.unitCode} onChange={set} className={inp} placeholder="VD: IT_DEPT"/></div>
                            <div><label className={lbl}>Tên đơn vị *</label><input name="unitName" value={form.unitName} onChange={set} className={inp} placeholder="VD: Phòng CNTT"/></div>
                        </div>

                        <div>
                            <label className={lbl}>Đơn vị cấp trên</label>
                            <select name="parentUnitId" value={form.parentUnitId} onChange={set} className={inp}>
                                <option value="">— Không có (đơn vị gốc) —</option>
                                {allUnits.filter(u=>u.id!==unit?.id).map(u=>(
                                    <option key={u.id} value={u.id}>{u.unitName} ({u.unitCode})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={lbl}>Mô tả</label>
                            <textarea name="description" value={form.description} onChange={set} rows={2}
                                      className={inp+' resize-none'} placeholder="Mô tả chức năng..."/>
                        </div>

                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                            <div><label className={lbl}>Địa chỉ</label><input name="address" value={form.address} onChange={set} className={inp} placeholder="Địa chỉ..."/></div>
                            <div><label className={lbl}>Số điện thoại</label><input name="phoneNumber" value={form.phoneNumber} onChange={set} className={inp} placeholder="0xxx..."/></div>
                        </div>

                        <div style={{display:'flex',gap:10,justifyContent:'flex-end',paddingTop:4}}>
                            <button type="button" onClick={onClose}
                                    style={{padding:'9px 20px',border:'1.5px solid #e2e8f0',borderRadius:9,fontSize:13.5,fontWeight:600,cursor:'pointer',background:'white',color:'#64748b'}}>
                                Hủy
                            </button>
                            <button type="submit" disabled={saving}
                                    style={{padding:'9px 24px',border:'none',borderRadius:9,fontSize:13.5,fontWeight:700,cursor:'pointer',
                                        background:'linear-gradient(135deg,#6366f1,#4f46e5)',color:'white',
                                        opacity:saving?0.6:1,display:'flex',alignItems:'center',gap:8}}>
                                {saving&&<div style={{width:14,height:14,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>}
                                {isEdit?'Cập nhật':'Tạo đơn vị'}
                            </button>
                        </div>
                    </form>
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
            </div>
        </>
    );
};

// ── Members Modal ────────────────────────────────────────────
const MembersModal = ({ unit, onClose }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        unitService.getUnitMembers(unit.id)
            .then(d=>setMembers(Array.isArray(d)?d:[]))
            .catch(()=>setMembers([]))
            .finally(()=>setLoading(false));
    },[unit.id]);

    const ROLE_COLOR={ADMIN:'#6366f1',UNIT_MANAGER:'#8b5cf6',STAFF:'#64748b',VIEWER:'#94a3b8'};

    return (
        <>
            <div style={{position:'fixed',inset:0,background:'rgba(15,23,42,.4)',backdropFilter:'blur(3px)',zIndex:1000}} onClick={onClose}/>
            <div style={{position:'fixed',inset:0,zIndex:1001,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
                <div style={{background:'white',borderRadius:18,width:'100%',maxWidth:480,maxHeight:'75vh',display:'flex',flexDirection:'column',boxShadow:'0 24px 64px rgba(0,0,0,.18)'}}
                     onClick={e=>e.stopPropagation()}>

                    <div style={{padding:'18px 24px',borderBottom:'1px solid #f1f5f9',display:'flex',justifyContent:'space-between',alignItems:'center',background:'#f8fafc',borderRadius:'18px 18px 0 0'}}>
                        <div>
                            <div style={{fontWeight:700,fontSize:15,color:'#0f172a'}}>👥 Thành viên ({members.length})</div>
                            <div style={{fontSize:12,color:'#64748b',marginTop:2}}>{unit.unitName}</div>
                        </div>
                        <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:'#94a3b8',display:'flex'}}>
                            <XMarkIcon style={{width:20}}/>
                        </button>
                    </div>

                    <div style={{overflowY:'auto',padding:'12px 16px',flex:1}}>
                        {loading ? (
                            <div style={{textAlign:'center',padding:32,color:'#94a3b8'}}>Đang tải...</div>
                        ) : members.length===0 ? (
                            <div style={{textAlign:'center',padding:32,color:'#94a3b8'}}>Chưa có thành viên</div>
                        ) : members.map(m=>(
                            <div key={m.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 12px',borderRadius:10,marginBottom:4,background:'#f8fafc',border:'1px solid #f1f5f9'}}>
                                <div style={{width:36,height:36,borderRadius:'50%',background:'#e0e7ff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:15,color:'#6366f1',flexShrink:0}}>
                                    {(m.fullName||m.username||'?')[0].toUpperCase()}
                                </div>
                                <div style={{flex:1}}>
                                    <div style={{fontSize:13.5,fontWeight:600,color:'#1e293b'}}>{m.fullName||m.username}</div>
                                    <div style={{fontSize:12,color:'#94a3b8'}}>{m.email}</div>
                                </div>
                                <span style={{fontSize:11,fontWeight:600,color:ROLE_COLOR[m.role]||'#64748b',background:(ROLE_COLOR[m.role]||'#64748b')+'18',padding:'3px 8px',borderRadius:20}}>
                  {m.role}
                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

// ── Tree Node ────────────────────────────────────────────────
const TreeNode = ({ node, allUnits, depth=0, onEdit, onDelete, onViewMembers }) => {
    const [expanded, setExpanded] = useState(depth===0);
    const hasChildren = node.children?.length>0;

    return (
        <div>
            <div style={{
                display:'flex',alignItems:'center',gap:8,
                padding:'10px 12px',borderRadius:10,marginBottom:4,
                background:'white',border:'1px solid #f1f5f9',
                marginLeft:depth*24,
                boxShadow:'0 1px 3px rgba(0,0,0,.04)',
            }}>
                <button onClick={()=>setExpanded(p=>!p)}
                        style={{background:'none',border:'none',cursor:'pointer',padding:2,color:'#94a3b8',width:20,flexShrink:0,display:'flex'}}>
                    {hasChildren
                        ?(expanded?<ChevronDownIcon style={{width:14}}/>:<ChevronRightIcon style={{width:14}}/>)
                        :<span style={{width:14,display:'inline-block'}}/>
                    }
                </button>

                <div style={{width:32,height:32,borderRadius:8,background:depth===0?'#6366f1':'#8b5cf6',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <BuildingOfficeIcon style={{width:16,color:'white'}}/>
                </div>

                <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13.5,fontWeight:600,color:'#1e293b'}}>{node.unitName}</div>
                    <div style={{fontSize:11.5,color:'#94a3b8'}}>{node.unitCode}{node.description?` · ${node.description}`:''}</div>
                </div>

                {node.isActive!==false&&(
                    <span style={{fontSize:11,background:'#f0fdf4',color:'#16a34a',border:'1px solid #bbf7d0',borderRadius:20,padding:'2px 8px',fontWeight:600,flexShrink:0}}>
            Hoạt động
          </span>
                )}

                <div style={{display:'flex',gap:4,flexShrink:0}}>
                    <button title="Xem thành viên" onClick={()=>onViewMembers(node)}
                            style={{padding:6,borderRadius:7,border:'none',background:'#f1f5f9',cursor:'pointer',display:'flex',color:'#6366f1'}}>
                        <UsersIcon style={{width:15}}/>
                    </button>
                    <button title="Chỉnh sửa" onClick={()=>onEdit(node)}
                            style={{padding:6,borderRadius:7,border:'none',background:'#f1f5f9',cursor:'pointer',display:'flex',color:'#64748b'}}>
                        <PencilIcon style={{width:15}}/>
                    </button>
                    <button title="Xóa" onClick={()=>onDelete(node)}
                            style={{padding:6,borderRadius:7,border:'none',background:'#fff1f2',cursor:'pointer',display:'flex',color:'#ef4444'}}>
                        <TrashIcon style={{width:15}}/>
                    </button>
                </div>
            </div>

            {expanded&&hasChildren&&(
                <div>
                    {node.children.map(child=>(
                        <TreeNode key={child.id} node={child} allUnits={allUnits} depth={depth+1}
                                  onEdit={onEdit} onDelete={onDelete} onViewMembers={onViewMembers}/>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── Main ─────────────────────────────────────────────────────
const UnitManagementPage = () => {
    const [units,   setUnits]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [search,  setSearch]  = useState('');
    const [modal,   setModal]   = useState(null);
    const [members, setMembers] = useState(null);
    const [confirm, setConfirm] = useState(null);
    const [toast,   setToast]   = useState(null);

    const showToast = (msg, type='success') => {
        setToast({msg,type});
        setTimeout(()=>setToast(null),3500);
    };

    const load = useCallback(async()=>{
        setLoading(true);
        try {
            const data = await unitService.getAllUnits();
            setUnits(Array.isArray(data)?data:[]);
        } catch(e){showToast(e?.message||'Không thể tải đơn vị','error');}
        finally{setLoading(false);}
    },[]);

    useEffect(()=>{load();},[load]);

    const handleDelete = async()=>{
        if(!confirm)return;
        try {
            await unitService.deleteUnit(confirm.id);
            showToast(`Đã xóa "${confirm.unitName}"`);
            setConfirm(null);load();
        } catch(e){showToast(e?.message||'Không thể xóa','error');setConfirm(null);}
    };

    const filtered = search
        ? units.filter(u=>u.unitName.toLowerCase().includes(search.toLowerCase())||u.unitCode.toLowerCase().includes(search.toLowerCase()))
        : units;

    const tree = buildTree(filtered);

    return (
        <div style={{padding:24,fontFamily:"'Segoe UI',system-ui,sans-serif",maxWidth:900,margin:'0 auto'}}>

            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
                <div>
                    <h1 style={{fontSize:22,fontWeight:800,color:'#0f172a',margin:0}}>Quản lý đơn vị</h1>
                    <p style={{fontSize:13,color:'#64748b',margin:'4px 0 0'}}>{units.length} đơn vị · cấu trúc phân cấp</p>
                </div>
                <button onClick={()=>setModal({mode:'create',unit:null})}
                        style={{display:'flex',alignItems:'center',gap:7,padding:'10px 20px',border:'none',borderRadius:10,
                            background:'linear-gradient(135deg,#6366f1,#4f46e5)',color:'white',fontSize:13.5,fontWeight:700,cursor:'pointer',
                            boxShadow:'0 4px 14px rgba(99,102,241,.35)'}}>
                    <PlusIcon style={{width:16}}/> Thêm đơn vị
                </button>
            </div>

            <div style={{position:'relative',marginBottom:20}}>
                <MagnifyingGlassIcon style={{width:16,position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'#94a3b8'}}/>
                <input value={search} onChange={e=>setSearch(e.target.value)}
                       placeholder="Tìm theo tên hoặc mã đơn vị..."
                       style={{width:'100%',padding:'10px 12px 10px 36px',border:'1.5px solid #e2e8f0',borderRadius:10,fontSize:13.5,outline:'none',background:'white',boxSizing:'border-box'}}/>
            </div>

            {loading ? (
                <div style={{textAlign:'center',padding:48,color:'#94a3b8'}}>
                    <div style={{width:32,height:32,border:'3px solid #e2e8f0',borderTopColor:'#6366f1',borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto 12px'}}/>
                    Đang tải...
                </div>
            ) : tree.length===0 ? (
                <div style={{textAlign:'center',padding:48,color:'#94a3b8'}}>
                    <BuildingOfficeIcon style={{width:48,margin:'0 auto 12px',opacity:.3}}/>
                    <div>{search?'Không tìm thấy đơn vị':'Chưa có đơn vị nào'}</div>
                </div>
            ) : (
                tree.map(node=>(
                    <TreeNode key={node.id} node={node} allUnits={units} depth={0}
                              onEdit={u=>setModal({mode:'edit',unit:u})}
                              onDelete={u=>setConfirm(u)}
                              onViewMembers={u=>setMembers(u)}/>
                ))
            )}

            {modal&&<UnitModal unit={modal.unit} allUnits={units} onClose={()=>setModal(null)}
                               onSaved={msg=>{setModal(null);showToast(msg);load();}}/>}

            {members&&<MembersModal unit={members} onClose={()=>setMembers(null)}/>}

            {confirm&&(
                <>
                    <div style={{position:'fixed',inset:0,background:'rgba(15,23,42,.4)',backdropFilter:'blur(3px)',zIndex:1000}} onClick={()=>setConfirm(null)}/>
                    <div style={{position:'fixed',inset:0,zIndex:1001,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
                        <div style={{background:'white',borderRadius:16,padding:28,maxWidth:360,width:'100%',boxShadow:'0 24px 64px rgba(0,0,0,.15)',textAlign:'center'}}>
                            <div style={{width:52,height:52,background:'#fef2f2',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
                                <ExclamationTriangleIcon style={{width:26,color:'#ef4444'}}/>
                            </div>
                            <div style={{fontWeight:700,fontSize:16,color:'#0f172a',marginBottom:8}}>Xóa đơn vị?</div>
                            <div style={{fontSize:13.5,color:'#64748b',marginBottom:20}}>
                                Bạn chắc chắn muốn xóa <strong>"{confirm.unitName}"</strong>?
                            </div>
                            <div style={{display:'flex',gap:10}}>
                                <button onClick={()=>setConfirm(null)}
                                        style={{flex:1,padding:'10px 0',border:'1.5px solid #e2e8f0',borderRadius:9,fontSize:13.5,fontWeight:600,cursor:'pointer',background:'white',color:'#64748b'}}>
                                    Hủy
                                </button>
                                <button onClick={handleDelete}
                                        style={{flex:1,padding:'10px 0',border:'none',borderRadius:9,fontSize:13.5,fontWeight:700,cursor:'pointer',background:'#ef4444',color:'white'}}>
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
};

export default UnitManagementPage;