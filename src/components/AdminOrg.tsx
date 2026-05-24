import React, { useState, useEffect } from 'react';
import { DEPT_STRUCTURE } from '../data';

interface AdminOrgProps {
  openModal: (type: string, data?: any) => void;
  users: any[];
  setUsers: React.Dispatch<React.SetStateAction<any[]>>;
  academicDepts: string[];
  supportDepts: string[];
  worklines: string[];
}

const AdminOrg: React.FC<AdminOrgProps> = ({ openModal, users, setUsers, academicDepts, supportDepts, worklines }) => {
  const [viewModel, setViewModel] = useState("dept"); // 'dept' or 'hierarchy'
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState("สายวิชาการ");
  const [search, setSearch] = useState("");
  const [deptSearch, setDeptSearch] = useState("");
  const getDisplayLevel = (user: any) => user.w === "สายงานบริหาร" ? user.p : user.l;

  const filteredDepts = Array.from(new Set([
    ...academicDepts,
    ...supportDepts,
    ...users.map(u => (u.w === "สายสนับสนุน" && u.d && u.d.includes(" > ")) ? u.d.split(" > ")[0] : u.d)
  ].filter(Boolean))).sort().filter(d => {
    if (deptSearch && !d.toLowerCase().includes(deptSearch.toLowerCase())) return false;
    if (filterType === "ทั้งหมด") return true;
    
    // Check if the department is in the defined lists OR has users of that workline
    const hasUserOfWorkline = !!users.find(u => {
      const topDept = (u.w === "สายสนับสนุน" && u.d && u.d.includes(" > ")) ? u.d.split(" > ")[0] : u.d;
      return topDept === d && u.w === filterType;
    });

    if (filterType === "สายวิชาการ") return academicDepts.includes(d) || hasUserOfWorkline;
    if (filterType === "สายสนับสนุน") return supportDepts.includes(d) || hasUserOfWorkline;
    
    return hasUserOfWorkline;
  });

  const [selectedDept, setSelectedDept] = useState<string>(filteredDepts[0] || "");
  const [drillPath, setDrillPath] = useState<any[]>([]);

  useEffect(() => {
    if (selectedDept && !filteredDepts.includes(selectedDept) && filteredDepts.length > 0) {
      setSelectedDept(filteredDepts[0]);
    } else if (!selectedDept && filteredDepts.length > 0) {
      setSelectedDept(filteredDepts[0]);
    }
  }, [filteredDepts, selectedDept]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin": return <span className="b bp">ผู้ดูแลระบบ</span>;
      case "hr": return <span className="b bb">งานทรัพยากรบุคคล</span>;
      case "manager": return <span className="b bg" style={{ background: "#e0f2fe", color: "#0369a1" }}>ผู้บริหารคณะ</span>;
      case "manager_dept": return <span className="b bg" style={{ background: "#f0f9ff", color: "#0284c7" }}>ผู้บังคับบัญชา</span>;
      case "supervisor": return <span className="b bg" style={{ background: "#fff7ed", color: "#c2410c" }}>หัวหน้างาน</span>;
      default: return <span className="b bgr">บุคลากร</span>;
    }
  };

  const isSearchActive = search.trim().length > 0;
  const listUsers = users.filter(u => {
    // Search filter
    if (isSearchActive) {
      return u.n.toLowerCase().includes(search.toLowerCase()) || (u.sso && u.sso.toLowerCase().includes(search.toLowerCase()));
    }
    
    // Dept and Workline filter
    const matchesDept = (u.w === "สายสนับสนุน" && u.d && u.d.includes(" > ")) 
      ? u.d.split(" > ")[0] === selectedDept 
      : u.d === selectedDept;
    
    const matchesWorkline = filterType === "ทั้งหมด" || u.w === filterType;
    
    return matchesDept && matchesWorkline;
  });

  // Hierarchy view logic
  const currentHierarchyUsers = (() => {
    if (drillPath.length === 0) {
      return users.filter(u => u.sup === "");
    }
    const last = drillPath[drillPath.length - 1];
    return users.filter(u => u.sup === last.n);
  })();

  const popDrillPath = (idx: number) => {
    if (idx === -1) {
      setDrillPath([]);
    } else {
      setDrillPath(drillPath.slice(0, idx + 1));
    }
  };

  const pushDrillPath = (user: any) => {
    if (users.some(u => u.sup === user.n)) {
      setDrillPath([...drillPath, user]);
    }
  };

  return (
    <>
      <div className="flex ic jb mb20">
        <div>
          <div className="sec-t">จัดการโครงสร้างองค์กร 🌿</div>
          <div className="sec-s">กำหนดกลุ่มงานและสายการบังคับบัญชา · {viewModel === 'dept' ? 'มุมมองรายกลุ่มงาน' : 'มุมมองสายงานบังคับบัญชา'}</div>
        </div>
        <div className="flex g8">
          <button 
            className={`btn btn-s ${viewModel === 'dept' ? 'btn-p' : ''}`} 
            onClick={() => setViewModel('dept')}
            style={{ borderRadius: '12px' }}
          >🏢 รายกลุ่มงาน</button>
          <button 
            className={`btn btn-s ${viewModel === 'hierarchy' ? 'btn-p' : ''}`} 
            onClick={() => { setViewModel('hierarchy'); setDrillPath([]); }}
            style={{ borderRadius: '12px' }}
          >🌳 สายการบังคับบัญชา</button>
        </div>
      </div>

      {viewModel === 'dept' ? (
        <div className="org-layout">
          {/* Dept List Sidebar */}
          <div className="org-side">
            <div className="p12" style={{ borderBottom: '1px solid var(--border)', background: '#fff' }}>
              <input className="inp inp-sm" style={{ fontSize: '12px' }} placeholder="🔍 ค้นหาสังกัด/กลุ่มงาน..." value={deptSearch} onChange={e => setDeptSearch(e.target.value)} />
            </div>
            <div className="org-side-h flex ic jb">
              <span>กลุ่มงาน</span>
              <div style={{ position: 'relative' }}>
                <button className={`btn btn-xs ${filterType !== 'ทั้งหมด' ? 'btn-p' : 'btn-s'}`} style={{ fontSize: '10px', padding: '4px 8px' }} onClick={() => setShowFilter(!showFilter)}>
                  🔍 {filterType}
                </button>
                {showFilter && (
                  <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 50, background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', marginTop: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '240px', padding: '6px', maxHeight: '300px', overflowY: 'auto' }}>
                    {['ทั้งหมด', ...worklines].map(w => (
                      <div key={w} className="filter-opt" style={{ padding: '10px 12px', fontSize: '13px', cursor: 'pointer', borderRadius: '8px', background: filterType === w ? 'var(--blue-lt)' : 'transparent', color: filterType === w ? 'var(--blue)' : 'var(--text2)', fontWeight: filterType === w ? 700 : 400 }} onClick={() => { setFilterType(w); setShowFilter(false); }}>
                        {w}
                      </div>
                    ))}
                  </div>
                )}
                {showFilter && <div style={{ position: 'fixed', inset: 0, zIndex: 45 }} onClick={() => setShowFilter(false)} />}
              </div>
            </div>
            <div className="org-side-list">
              {filteredDepts.map(d => {
                const count = users.filter(u => {
                  const matchesDept = (u.w === "สายสนับสนุน" && u.d && u.d.includes(" > ")) ? u.d.split(" > ")[0] === d : u.d === d;
                  const matchesWorkline = filterType === "ทั้งหมด" || u.w === filterType;
                  return matchesDept && matchesWorkline;
                }).length;
                const isActive = selectedDept === d && !isSearchActive;
                return (
                  <div key={d} className={`org-side-item ${isActive ? 'active' : ''}`} onClick={() => { setSelectedDept(d); setSearch(""); }}>
                    <span className="dept-n">{d}</span>
                    <span className="dept-c">{count}</span>
                  </div>
                );
              })}
              {filteredDepts.length === 0 && (
                <div style={{ padding: '32px 16px', textAlign: 'center', fontSize: '12px', color: 'var(--text3)' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏜️</div>
                  ไม่พบข้อมูลในหมวดนี้
                </div>
              )}
            </div>
          </div>

          {/* User List Main */}
          <div className="org-main">
            <div className="card mb16 p12 flex ic g12">
              <div className="muted fs16">🔍</div>
              <input className="inp" style={{ border: 'none', background: 'transparent', padding: '4px 0', fontSize: '14px' }} placeholder="ค้นหาชื่อบุคลากร (ค้นหาข้ามกลุ่มงานได้ที่นี่)..." value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button className="btn btn-s btn-xs" onClick={() => setSearch("")}>ล้าง</button>}
            </div>

            {selectedDept || isSearchActive ? (
              <div className="card" style={{ border: 'none', boxShadow: 'none', background: 'transparent' }}>
                <div className="flex ic jb mb12">
                  <div className="fw8 fs16" style={{ color: 'var(--navy)' }}>
                    {isSearchActive ? 'ผลการค้นหา' : selectedDept}
                    <span className="muted fw4 fs13 ml8">({listUsers.length} คน)</span>
                  </div>
                </div>
                <div className="card overflow-hidden">
                  <div style={{ overflowX: "auto" }}>
                    <table className="tbl tbl-clean tbl-org">
                      <thead>
                        <tr>
                          <th>บุคลากร</th>
                          <th>สายงาน</th>
                          <th style={{ minWidth: "200px" }}>กลุ่มงาน / สังกัด</th>
                          <th>ตำแหน่ง</th>
                          <th>ผู้ประเมินลำดับที่ 1</th>
                          <th>ผู้ประเมินลำดับที่ 2</th>
                          <th>บทบาท</th>
                          <th style={{ width: "130px" }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {listUsers.map((u, i) => {
                          const isHierarchical = u.d && u.d.includes(" > ");
                          const depts = isHierarchical ? u.d.split(" > ") : [u.d];
                          return (
                            <tr key={u.sso || i}>
                              <td style={{ minWidth: "200px" }}>
                                <div className="flex ic g10">
                                  <div className="av s36" style={{ background: "var(--navy)", color: "#fff" }}>{u.n[0]}</div>
                                  <div className="flex col">
                                    <span className="fw7 fs14" style={{ color: "var(--navy)" }}>{u.t}{u.n}</span>
                                  </div>
                                </div>
                              </td>
                              <td><span className={`b ${u.w === "สายวิชาการ" ? "bb" : "bg"}`} style={{ fontSize: "11px" }}>{u.w}</span></td>
                              <td>
                                <div className="fs12 fw6 text-gray-700 whitespace-nowrap overflow-hidden truncate" style={{ maxWidth: "300px" }} title={u.d || ""}>
                                  {u.d ? u.d.split(" > ").join(" > ") : "—"}
                                </div>
                              </td>
                               <td style={{ minWidth: "150px", maxWidth: "180px" }}>
                                 <div 
                                   className="fw6 fs13 whitespace-nowrap overflow-hidden truncate" 
                                   style={{ color: "var(--text2)" }} 
                                   title={u.p || ""}
                                 >
                                   {u.p || "—"}
                                 </div>
                                 <div className="muted fs11 whitespace-nowrap overflow-hidden truncate" style={{ marginTop: "2px" }} title={getDisplayLevel(u) || ""}>
                                   {getDisplayLevel(u) || "—"}
                                 </div>
                               </td>
                              <td style={{ minWidth: "140px" }}>
                                {u.sup ? (
                                  <div className="flex ic g6">
                                    <span className="fs11" style={{ opacity: 0.6 }}>👤</span>
                                    <span className="fs12" style={{ color: "var(--text2)" }}>{u.sup}</span>
                                  </div>
                                ) : <span className="fs11 muted">—</span>}
                              </td>
                              <td style={{ minWidth: "140px" }}>
                                {u.evaluator2 ? (
                                  <div className="flex ic g6">
                                    <span className="fs11" style={{ opacity: 0.6 }}>👤</span>
                                    <span className="fs12" style={{ color: "var(--text2)" }}>{u.evaluator2}</span>
                                  </div>
                                ) : <span className="fs11 muted">—</span>}
                              </td>
                              <td>{getRoleBadge(u.r)}</td>
                              <td>
                                <button 
                                  className="btn btn-s btn-xs w-full" 
                                  style={{ padding: '6px', fontSize: '11px', borderRadius: '6px' }}
                                  onClick={() => openModal("modal-user", u)}
                                >แก้ไขผู้ใช้</button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                {listUsers.length === 0 && (
                  <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text3)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔎</div>
                    {isSearchActive ? 'ไม่พบบุคลากรที่ค้นหา' : 'กลุ่มงานนี้ยังไม่มีบุคลากร'}
                  </div>
                )}
              </div>
            ) : (
              <div className="card flex col ic jc" style={{ height: '400px', background: '#fff', borderStyle: 'dashed', borderWidth: '2px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
                <div className="fw7 fs16 mb4" style={{ color: 'var(--navy)' }}>ยังไม่ได้เลือกกลุ่มงาน</div>
                <div className="muted fs13">กรุณาเลือกกลุ่มงานจากรายการด้านซ้ายมือ หรือค้นหาชื่อบุคลากรด้านบน</div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="anim-fade-in">
          <div className="card shadow-sm overflow-hidden" style={{ borderRadius: '20px' }}>
            <div className="p32" style={{ background: '#fff', borderBottom: '1px solid #edf2f7' }}>
              <div className="flex ic g12 mb16 wrap">
                <div className={`breadcrumb-item ${drillPath.length === 0 ? 'active' : ''}`} onClick={() => popDrillPath(-1)}>
                  <span style={{ fontSize: '20px' }}>📂</span> คณะวิศวกรรมศาสตร์
                </div>
                {drillPath.map((it, idx) => (
                  <React.Fragment key={idx}>
                    <div className="breadcrumb-separator">›</div>
                    <div className={`breadcrumb-item ${idx === drillPath.length - 1 ? 'active' : ''}`} onClick={() => popDrillPath(idx)}>
                      {it.n}
                    </div>
                  </React.Fragment>
                ))}
              </div>
              <div className="flex ic jb">
                <div className="fs13 fw5" style={{ color: 'var(--text3)' }}>
                  {drillPath.length === 0 ? "📍 ระดับผู้บริหารคณะ" : `📍 รายชื่อผู้ที่มีผู้ประเมินลำดับที่ 1 เป็น: ${drillPath[drillPath.length - 1].n}`}
                </div>
              </div>
            </div>
            
            <div style={{ minHeight: '520px', background: '#fff' }}>
              <div style={{ overflowX: "auto" }}>
                <table className="tbl tbl-clean tbl-org tbl-explorer">
                  <thead>
                    <tr>
                      <th style={{ paddingLeft: '32px', width: '40%' }}>ชื่อ-นามสกุล / สังกัด</th>
                      <th>ตำแหน่งสายงานหลัก</th>
                      <th>บทบาท / ผู้ประเมิน</th>
                      <th style={{ width: '140px', textAlign: 'right', paddingRight: '32px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentHierarchyUsers.map((u, i) => {
                      const hasSub = users.some(sub => sub.sup === u.n);
                      const subCount = users.filter(sub => sub.sup === u.n).length;
                      return (
                        <tr key={u.sso || i} className={hasSub ? 'row-drill' : ''} onClick={() => pushDrillPath(u)}>
                          <td style={{ paddingLeft: '32px', paddingTop: '24px', paddingBottom: '24px' }}>
                            <div className="flex ic g12">
                              <div className="av s36" style={{ background: "var(--navy)", color: "#fff", border: 'none', fontSize: '14px', fontWeight: 700, borderRadius: '50%', flexShrink: 0 }}>{u.n[0]}</div>
                              <div className="flex col">
                                <div className="flex ic g6">
                                  <span className="fw8 fs16" style={{ color: "var(--navy)", whiteSpace: 'nowrap' }}>{u.t}{u.n}</span>
                                  {u.d && (
                                    <span 
                                      className="fs13 fw5 text-gray-400 whitespace-nowrap overflow-hidden truncate" 
                                      style={{ maxWidth: "240px" }}
                                      title={u.d}
                                    >
                                      ({u.d.split(" > ").join(" > ")})
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ paddingTop: '24px', paddingBottom: '24px', maxWidth: '200px' }}>
                            <div 
                              className="fw7 fs14 whitespace-nowrap overflow-hidden truncate" 
                              style={{ color: "var(--text2)", lineHeight: 1.3 }}
                              title={u.p || ""}
                            >
                              {u.p || "—"}
                            </div>
                            <div className="muted fs12 whitespace-nowrap overflow-hidden truncate" style={{ marginTop: '4px' }} title={getDisplayLevel(u) || ""}>
                              {getDisplayLevel(u) || "—"}
                            </div>
                          </td>
                          <td style={{ paddingTop: '24px', paddingBottom: '24px' }}>
                            <div className="flex ic g10">
                              {getRoleBadge(u.r)}
                              {hasSub && (
                                <>
                                  <span className="badge-sub">ผู้รับการประเมิน {subCount} คน</span>
                                  <span className="drill-arrow">›</span>
                                </>
                              )}
                            </div>
                            <div className="muted fs12" style={{ marginTop: "8px" }}>
                              <span className="fw6">ลำดับที่ 1:</span> {u.sup || "—"}
                              {u.evaluator2 && <span> · <span className="fw6">ลำดับที่ 2:</span> {u.evaluator2}</span>}
                            </div>
                          </td>
                          <td style={{ paddingRight: '40px', textAlign: 'right', paddingTop: '24px', paddingBottom: '24px' }} onClick={e => e.stopPropagation()}>
                            <button className="btn-settings" onClick={() => openModal("modal-user", u)} title="แก้ไขผู้ใช้">⚙️</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {currentHierarchyUsers.length === 0 && (
                <div className="flex col ic jc" style={{ padding: '120px 20px', color: 'var(--text3)' }}>
                  <div style={{ fontSize: '56px', marginBottom: '20px' }}>📁</div>
                  <div className="fw8 fs18 mb6" style={{ color: 'var(--navy)' }}>ยังไม่มีผู้รับการประเมินถัดไป</div>
                  <div className="muted fs14" style={{ maxWidth: '300px', textAlign: 'center', lineHeight: '1.6' }}>
                    ไม่พบผู้ที่มีผู้ประเมินลำดับที่ 1 เป็น {drillPath[drillPath.length - 1]?.n}
                  </div>
                  <button className="btn btn-s mt24" onClick={() => popDrillPath(drillPath.length - 2)}>ย้อนกลับหนึ่งระดับ</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .org-layout { display: grid; grid-template-columns: 280px 1fr; gap: 24px; align-items: start; }
        .org-side { background: #fff; border: 1px solid var(--border); border-radius: 16px; overflow: visible; position: sticky; top: 20px; }
        .org-side > :first-child { border-radius: 16px 16px 0 0; }
        .org-side-list { border-radius: 0 0 16px 16px; }
        .org-side-h { padding: 16px; background: #f8fafc; border-bottom: 1px solid var(--border); font-weight: 800; font-size: 13px; color: var(--navy); }
        .org-side-list { max-height: calc(100vh - 200px); overflow-y: auto; }
        .org-side-item { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: 0.1s; }
        .org-side-item:hover { background: #f8fafc; }
        .org-side-item.active { background: var(--blue-lt); border-right: 3px solid var(--blue); }
        .dept-n { font-size: 13px; font-weight: 600; color: var(--text2); }
        .org-side-item.active .dept-n { color: var(--blue); font-weight: 800; }
        .dept-c { font-size: 10px; background: #f1f5f9; padding: 2px 6px; border-radius: 6px; color: var(--text3); font-weight: 700; }
        .org-main { min-width: 0; }
        
        .breadcrumb-item { cursor: pointer; display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: 15px; color: var(--text3); border-radius: 6px; transition: 0.2s; padding: 4px 8px; margin-left: -8px; }
        .breadcrumb-item:hover { background: #f1f5f9; color: var(--blue); }
        .breadcrumb-item.active { color: var(--navy); }
        .breadcrumb-separator { color: #cbd5e1; font-weight: 200; font-size: 18px; margin: 0 2px; }

        .tbl-explorer th { font-size: 11px; text-transform: uppercase; color: var(--text3); letter-spacing: 0.1em; padding: 16px 12px; background: #fcfcfc; border-bottom: 1px solid #edf2f7; }
        .tbl-explorer td { padding: 16px 12px; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
        .row-drill { cursor: pointer; transition: 0.15s; }
        .row-drill:hover td { background: #fcfdfe !important; }
        
        .badge-sub { font-size: 10px; font-weight: 800; background: #eff6ff; color: var(--blue); padding: 3px 10px; border-radius: 20px; transition: 0.2s; }
        .drill-arrow { font-size: 16px; color: #cbd5e1; transition: 0.2s; }
        .row-drill:hover .drill-arrow { color: var(--blue); transform: translateX(3px); }
        .row-drill:hover .badge-sub { background: var(--blue); color: #fff; }

        .btn-settings { width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; color: var(--text3); font-size: 14px; transition: 0.15s; cursor: pointer; }
        .btn-settings:hover { border-color: var(--blue); background: var(--blue-lt); color: var(--blue); }
        
        .overflow-hidden { overflow: hidden; }
        .ml8 { margin-left: 8px; }
        .p32 { padding: 32px; }
      `}</style>
    </>
  );
};

export default AdminOrg;
