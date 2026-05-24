import React, { useState, useEffect } from 'react';
import { ExcelImportModal } from './SharedUI';

interface AdminUsersProps {
  openModal: (type: string, data?: any) => void;
  users: any[];
  setUsers: React.Dispatch<React.SetStateAction<any[]>>;
  academicDepts: string[];
  supportDepts: string[];
  adminDepts: string[];
  worklines: string[];
}

const AdminUsers: React.FC<AdminUsersProps> = ({ openModal, users, setUsers, academicDepts, supportDepts, adminDepts, worklines }) => {
  const [showImport, setShowImport] = useState(false);
  const [search, setSearch] = useState("");
  const [worklineFilter, setWorklineFilter] = useState("ทุกสายงาน");
  const [deptFilter, setDeptFilter] = useState("ทุกหน่วยงาน");
  const [roleFilter, setRoleFilter] = useState("ทุกบทบาท (Role)");
  const [statusFilter, setStatusFilter] = useState("ทุกสถานะ");
  const getDisplayLevel = (user: any) => user.w === "สายงานบริหาร" ? user.p : user.l;

  useEffect(() => {
    if (worklineFilter === "ทุกสายงาน") return;
    let list: string[] = [];
    if (worklineFilter === "สายวิชาการ") list = academicDepts;
    else if (worklineFilter === "สายสนับสนุน") list = supportDepts;
    else if (worklineFilter === "สายงานบริหาร") list = adminDepts;

    if (deptFilter !== "ทุกหน่วยงาน" && !list.includes(deptFilter)) {
      setDeptFilter("ทุกหน่วยงาน");
    }
  }, [worklineFilter, academicDepts, supportDepts, adminDepts]);

  const toggleStatus = (sso: string) => {
    const next = users.map(u => {
      if (u.sso === sso) {
        return { ...u, act: !u.act };
      }
      return u;
    });
    setUsers(next);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin": return <span className="b bp">ผู้ดูแลระบบ</span>;
      case "hr": return <span className="b bb">งานทรัพยากรบุคคล</span>;
      case "manager": return <span className="b bg" style={{ background: "#e0f2fe", color: "#0369a1" }}>ผู้บริหารคณะ</span>;
      case "manager_dept": return <span className="b bg" style={{ background: "#fef3c7", color: "#92400e" }}>ผู้บังคับบัญชา</span>;
      case "supervisor": return <span className="b bg" style={{ background: "#f0f9ff", color: "#0284c7" }}>หัวหน้างาน</span>;
      default: return <span className="b bgr">บุคลากร</span>;
    }
  };

  const filtered = users.filter(u => {
    const matchesSearch = u.n.toLowerCase().includes(search.toLowerCase()) || (u.sso && u.sso.toLowerCase().includes(search.toLowerCase()));
    const matchesWorkline = worklineFilter === "ทุกสายงาน" || u.w === worklineFilter;
    
    // For support staff, d might be "Dept > Work > Unit", we should filter by top level if needed or exact
    const topDept = (u.w === "สายสนับสนุน" && u.d && u.d.includes(" > ")) ? u.d.split(" > ")[0] : u.d;
    const matchesDept = deptFilter === "ทุกหน่วยงาน" || topDept === deptFilter;

    let roleName = "บุคลากร";
    if (u.r === "admin") roleName = "ผู้ดูแลระบบ";
    else if (u.r === "hr") roleName = "งานทรัพยากรบุคคล";
    else if (u.r === "manager") roleName = "ผู้บริหารคณะ";
    else if (u.r === "manager_dept") roleName = "ผู้บังคับบัญชา";
    else if (u.r === "supervisor") roleName = "หัวหน้างาน";
    
    const matchesRole = roleFilter === "ทุกบทบาท (Role)" || roleName === roleFilter;
    const matchesStatus = statusFilter === "ทุกสถานะ" || (statusFilter === "ปกติ / ใช้งาน" ? u.act === true : u.act === false);

    return matchesSearch && matchesWorkline && matchesDept && matchesRole && matchesStatus;
  });

  const availableDepts = 
    worklineFilter === "สายวิชาการ" ? academicDepts :
    worklineFilter === "สายสนับสนุน" ? supportDepts :
    worklineFilter === "สายงานบริหาร" ? adminDepts :
    Array.from(new Set([...academicDepts, ...supportDepts, ...adminDepts])).sort();

  return (
    <>
      <div className="flex ic jb mb20">
        <div>
          <div className="sec-t">จัดการผู้ใช้งาน 👤</div>
          <div className="sec-s">รายชื่อบุคลากรทั้งหมด · กำหนด Role และข้อมูลตามโครงสร้างองค์กร</div>
        </div>
        <div className="flex" style={{ gap: "8px" }}>
          <button className="btn btn-s" onClick={() => setShowImport(true)}>📥 Import Excel</button>
          <button className="btn btn-p" onClick={() => openModal("modal-user")}>+ เพิ่มผู้ใช้</button>
        </div>
      </div>

      {showImport && (
        <ExcelImportModal 
          title="นำเข้าข้อมูลผู้ใช้งาน (User Import)"
          templateName="User_Template.xlsx"
          onClose={() => setShowImport(false)}
        />  
      )}

      <div className="card mb14">
        <div className="ch" style={{ flexWrap: "wrap", gap: "8px" }}>
          <input className="inp" style={{ maxWidth: "260px" }} placeholder="🔍 ค้นหาชื่อ / ID..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="sel" style={{ width: "160px" }} value={worklineFilter} onChange={e => setWorklineFilter(e.target.value)}>
            <option>ทุกสายงาน</option>
            {worklines.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
          <select className="sel" style={{ width: "180px" }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option>ทุกหน่วยงาน</option>
            {availableDepts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="sel" style={{ width: "180px" }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option>ทุกบทบาท (Role)</option>
            <option>บุคลากร</option>
            <option>หัวหน้างาน</option>
            <option>ผู้บังคับบัญชา</option>
            <option>ผู้บริหารคณะ</option>
            <option>งานทรัพยากรบุคคล</option>
            <option>ผู้ดูแลระบบ</option>
          </select>
          <select className="sel" style={{ width: "130px" }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option>ทุกสถานะ</option>
            <option>ปกติ / ใช้งาน</option>
            <option>ระงับการใช้งาน</option>
          </select>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>ID</th>
                <th style={{ minWidth: "180px" }}>ชื่อ-นามสกุล</th>
                <th>สายงาน</th>
                <th style={{ minWidth: "200px" }}>หน่วยงาน / สังกัด</th>
                <th>ตำแหน่ง</th>
                <th>ระดับตำแหน่ง</th>
                <th>ผู้ประเมินลำดับที่ 1</th>
                <th>ผู้ประเมินลำดับที่ 2</th>
                <th style={{ minWidth: "160px" }}>บทบาทในระบบ</th>
                <th>สถานะ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const isHierarchical = u.d && u.d.includes(" > ");
                const depts = isHierarchical ? u.d.split(" > ") : [u.d];
                return (
                  <tr key={u.sso || i}>
                    <td style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text3)" }}>{u.sso || "—"}</td>
                    <td>
                      <div className="flex ic g8">
                        <div className="av" style={{ width: "32px", height: "32px", fontSize: "12px", background: "var(--navy)" }}>
                          {u.photo ? <img className="avatar-photo" src={u.photo} alt={u.n} /> : u.n[0]}
                        </div>
                        <div className="flex col">
                          <span className="fw6 fs13">{u.t}{u.n}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className={`b ${u.w === "สายวิชาการ" ? "bb" : "bg"}`} style={{ fontSize: "11px" }}>{u.w}</span></td>
                    <td>
                      <div className="fs12 fw6 text-gray-700 whitespace-nowrap overflow-hidden truncate" style={{ maxWidth: "300px" }} title={u.d || ""}>
                        {u.d ? u.d.split(" > ").join(" > ") : "—"}
                      </div>
                    </td>
                    <td className="fs12" style={{ maxWidth: "140px" }}>
                      <div className="whitespace-nowrap overflow-hidden truncate" style={{ width: "100%" }} title={u.p || ""}>
                        {u.p || "—"}
                      </div>
                    </td>
                    <td className="muted fs11">{getDisplayLevel(u) || "—"}</td>
                    <td className="muted fs12" style={{ maxWidth: "140px" }}>{u.sup || "—"}</td>
                    <td className="muted fs12" style={{ maxWidth: "140px" }}>{u.evaluator2 || "—"}</td>
                    <td>{getRoleBadge(u.r)}</td>
                    <td>
                      <span className={`b ${u.act ? "bg" : "br"}`}>
                        {u.act ? "ปกติ" : "ระงับ"}
                      </span>
                    </td>
                    <td>
                      <div className="flex g4">
                        <button className="btn btn-s btn-xs" onClick={() => openModal("modal-user", u)}>แก้ไข</button>
                        <button 
                          className="btn btn-r btn-xs" 
                          style={{ background: u.act ? "#fee2e2" : "#dcfce7", color: u.act ? "#b91c1c" : "#15803d" }}
                          onClick={() => toggleStatus(u.sso)}
                        >
                          {u.act ? "ระงับ" : "เปิด"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text3)" }}>
              ไม่พบข้อมูลที่คุณค้นหา 🔍
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminUsers;
