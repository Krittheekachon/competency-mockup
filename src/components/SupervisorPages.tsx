import React, { useState } from 'react';
import { DEPT_STRUCTURE } from '../data';

export const SupervisorAssess: React.FC<{ users: any[], setUsers: any, currentUser: any }> = ({ users, setUsers, currentUser }) => {
    const deptKeys = Object.keys(DEPT_STRUCTURE);
    const userDept = currentUser.d?.split(" > ")[0];
    const defaultDept = userDept && deptKeys.includes(userDept) ? userDept : deptKeys[0];

    const [activeDept, setActiveDept] = useState(defaultDept);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredUsers = users.filter(u => {
        const isDean = currentUser.p === 'คณบดี';
        const isDeptIncharge = currentUser.p.includes('รองคณบดี') || currentUser.p.includes('ผู้ช่วยคณบดี') || currentUser.r === 'manager_dept';
        
        if (!u.d) return false;
        const matchesDept = u.d.split(" > ")[0] === activeDept;
        const isDirectSub = u.sup === currentUser.n;
        const hasAccess = isDean || isDeptIncharge || isDirectSub;
        const matchesSearch = !searchTerm || u.n.toLowerCase().includes(searchTerm.toLowerCase()) || (u.sso && u.sso.toLowerCase().includes(searchTerm.toLowerCase()));
        
        return hasAccess && matchesDept && matchesSearch;
    });

    const isLevelBoss = (u: any) => ['supervisor', 'manager_dept', 'manager'].includes(u.r);
    const heads = filteredUsers.filter(u => isLevelBoss(u));
    const getStaffByGroup = (group: string, excludeBoss = false) => filteredUsers.filter(u => {
        const parts = u.d.split(" > ");
        const match = parts[parts.length - 1] === group;
        return excludeBoss ? (match && !isLevelBoss(u)) : match;
    });

    const mockComps = [
        { id: "c1", n: "การบริการที่ดี", t: "CC", tg: "tag-cc", ss: 3, beh: ["ตอบสนองได้ทันที", "ข้อมูลถูกต้อง", "ยิ้มแย้มเป็นมิตร"], evidence: { url: "https://share.canvas.com/s/728391", name: "Certificate_Service_Excellence.pdf", desc: "ผ่านการอบรมหลักสูตร Service Excellence ปี 2567" } },
        { id: "c2", n: "การใช้เทคโนโลยีดิจิทัล", t: "FC", tg: "tag-fc", ss: 2, beh: ["ใช้ Office คล่อง", "ใช้เครื่องมือวิเคราะห์", "ใช้ AI ในงาน"], evidence: null }
    ];

    const [marks, setMarks] = useState<any>({});
    const [feedback, setFeedback] = useState<any>({});
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleMark = (id: string, val: number) => setMarks({ ...marks, [id]: val });
    const handleFeedback = (id: string, val: string) => setFeedback({ ...feedback, [id]: val });

    const submit = () => {
        if (!selectedStaff) return;
        const isDean = currentUser.p === 'คณบดี';
        const isDeptHead = currentUser.p.includes('รอง') || currentUser.p.includes('ผู้ช่วย') || currentUser.r === 'manager_dept';
        const isUnitHead = currentUser.r === 'supervisor';

        if (!isDean && Object.keys(marks).length < mockComps.length) {
            alert("กรุณาให้คะแนนให้ครบทุกสมรรถนะ"); return;
        }

        setSaving(true);
        setTimeout(() => {
            let nextStatus = selectedStaff.evalStatus;
            let msg = "";
            if (isDean) { nextStatus = 'dean_approved'; msg = `อนุมัติการประเมินของ ${selectedStaff.t}${selectedStaff.n} เรียบร้อยแล้ว`; }
            else if (isDeptHead) { nextStatus = 'dept_evaluated'; msg = `ส่งผลการประเมินของ ${selectedStaff.t}${selectedStaff.n} ให้คณบดีอนุมัติเรียบร้อยแล้ว`; }
            else if (isUnitHead) { nextStatus = 'unit_evaluated'; msg = `ส่งผลการประเมินของ ${selectedStaff.t}${selectedStaff.n} ให้หัวหน้าฝ่ายเรียบร้อยแล้ว`; }

            setUsers((prev: any[]) => prev.map(u => u.sso === selectedStaff.sso ? { ...u, evalStatus: nextStatus } : u));
            setSaving(false);
            setSuccess(true);
            alert(msg);
        }, 1000);
    };

    if (success) return (
        <div className="card text-center" style={{ padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <div className="fw8 fs18 mb8">ส่งผลประเมินเรียบร้อย</div>
            <div className="muted fs14 mb20">คุณได้ทำการส่งผลการประเมินเรียบร้อยแล้ว</div>
            <button className="btn btn-p" onClick={() => setSuccess(false)}>กลับไปหน้าสรุป</button>
        </div>
    );

    return (
        <>
            <div className="flex ic jb mb20">
                <div>
                    <div className="sec-t">ประเมินลูกน้อง ✍️</div>
                    <div className="sec-s">ประเมินบุคลากรใน {activeDept}</div>
                </div>
                <div className="flex ic g8">
                    <span className="fs12 fw6 muted">เลือกฝ่าย:</span>
                    <select className="ta" style={{ width: 'fit-content', padding: '6px 10px', fontSize: '13px' }} value={activeDept} onChange={e => setActiveDept(e.target.value)}>
                        {deptKeys.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </div>

            <div className="g2">
                <div className="card">
                    <div className="ch"><div className="ct">รายการบุคลากรแยกตามหน่วยงาน</div></div>
                    <div className="p12" style={{ borderBottom: '1px solid var(--border)', background: '#fff' }}>
                        <input className="inp inp-sm" style={{ fontSize: '12px' }} placeholder="🔍 ค้นหาชื่อบุคลากร..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <div style={{ padding: 0, maxHeight: '600px', overflowY: 'auto' }}>
                        {heads.length > 0 && (
                            <div style={{ borderBottom: '1px solid var(--border)' }}>
                                <div style={{ background: 'var(--blue-lt)', padding: '10px 16px', fontWeight: 700, fontSize: '12px', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span>👨‍💼 หัวหน้าหน่วยงาน / ผู้บริหาร</span>
                                    <span className="b bg-blue text-white" style={{ fontSize: '9px', padding: '1px 6px' }}>{heads.length}</span>
                                </div>
                                {heads.map((u, i) => {
                                    const isSel = selectedStaff?.sso === u.sso;
                                    return (
                                        <div key={u.sso || i} className={`flex ic g12 p12 pointer transition-all ${isSel ? 'bg-blue-lt' : 'hover-bg bg-white'}`} style={{ borderBottom: '1px solid var(--border)', borderLeft: isSel ? '4px solid var(--blue)' : '4px solid transparent' }} onClick={() => setSelectedStaff(u)}>
                                            <div className="av s32" style={{ background: 'var(--blue)', color: '#fff', fontSize: '12px' }}>{u.n[0]}</div>
                                            <div className="flex-1 overflow-hidden">
                                                <div className="flex ic jb g6">
                                                    <div className={`fw7 fs13 truncate ${isSel ? 'text-blue' : 'text-navy'}`}>{u.t}{u.n}</div>
                                                    <div className="flex g4">
                                                        {u.evalStatus === 'self_submitted' && <span className="b by" style={{ fontSize: '8px', padding: '1px 4px' }}>รอประเมิน (Staff)</span>}
                                                        {u.evalStatus === 'unit_evaluated' && <span className="b bt" style={{ fontSize: '8px', padding: '1px 4px' }}>รอประเมิน (Dept)</span>}
                                                        {u.evalStatus === 'dept_evaluated' && <span className="b bg-blue text-white" style={{ fontSize: '8px', padding: '1px 4px' }}>รอกลั่นกรอง (Dean)</span>}
                                                        {u.evalStatus === 'dean_approved' && <span className="b bg-green text-white" style={{ fontSize: '8px', padding: '1px 4px' }}>อนุมัติแล้ว</span>}
                                                        {(u.evalStatus === 'draft' || !u.evalStatus) && <span className="b muted" style={{ fontSize: '8px', padding: '1px 4px' }}>ยังไม่ส่ง</span>}
                                                    </div>
                                                </div>
                                                <div className="flex ic g4 truncate"><span className="fs10 muted fw5">{u.p}</span></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {DEPT_STRUCTURE[activeDept as keyof typeof DEPT_STRUCTURE]?.map((w, wi) => {
                            const wUsers = getStaffByGroup(w.work, true);
                            const unitList = w.units.map(un => ({ name: un, users: getStaffByGroup(un, true) }));
                            
                            const hasAny = wUsers.length > 0 || unitList.some(un => un.users.length > 0);
                            if (!hasAny) return null;

                            return (
                                <div key={wi}>
                                    <div style={{ background: 'var(--bg)', padding: '10px 16px', fontWeight: 700, fontSize: '12px', color: 'var(--navy)', borderTop: wi === 0 ? 'none' : '1px solid var(--border)' }}>
                                        <span style={{ marginRight: '6px' }}>📁</span>{w.work}
                                    </div>
                                    {wUsers.map((u, ui) => {
                                        const isSel = selectedStaff?.sso === u.sso;
                                        return (
                                            <div key={u.sso || ui} className={`flex ic g12 p12 pointer transition-all ${isSel ? 'bg-blue-lt' : 'hover-bg bg-white'}`} style={{ borderBottom: '1px solid var(--border)', borderLeft: isSel ? '4px solid var(--blue)' : '4px solid transparent' }} onClick={() => setSelectedStaff(u)}>
                                                <div className="av s32" style={{ background: 'var(--navy)', color: '#fff', fontSize: '12px' }}>{u.n[0]}</div>
                                                <div className="flex-1 overflow-hidden">
                                                    <div className="flex ic jb g6">
                                                        <div className={`fw7 fs13 truncate ${isSel ? 'text-blue' : 'text-navy'}`}>{u.t}{u.n}</div>
                                                        <div className="flex g4">
                                                            {u.evalStatus === 'self_submitted' && <span className="b by" style={{ fontSize: '8px', padding: '1px 4px' }}>รอประเมิน (Staff)</span>}
                                                            {u.evalStatus === 'unit_evaluated' && <span className="b bt" style={{ fontSize: '8px', padding: '1px 4px' }}>รอประเมิน (Dept)</span>}
                                                            {u.evalStatus === 'dept_evaluated' && <span className="b bg-blue text-white" style={{ fontSize: '8px', padding: '1px 4px' }}>รอกลั่นกรอง (Dean)</span>}
                                                            {u.evalStatus === 'dean_approved' && <span className="b bg-green text-white" style={{ fontSize: '8px', padding: '1px 4px' }}>อนุมัติแล้ว</span>}
                                                            {(u.evalStatus === 'draft' || !u.evalStatus) && <span className="b muted" style={{ fontSize: '8px', padding: '1px 4px' }}>ยังไม่ส่ง</span>}
                                                        </div>
                                                    </div>
                                                    <div className="flex ic g4 truncate"><span className="fs10 muted fw5">{u.p}</span></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {unitList.map((un, ni) => un.users.length === 0 ? null : (
                                        <div key={ni}>
                                            <div className="flex ic g8" style={{ background: '#fff', padding: '10px 16px', borderLeft: '3px solid var(--blue)', fontSize: '11px', fontWeight: 600, color: 'var(--blue)' }}>
                                                <span style={{ fontSize: '14px' }}>🏠</span><span>{un.name}</span>
                                            </div>
                                            {un.users.map((u, ui) => {
                                                const isSel = selectedStaff?.sso === u.sso;
                                                return (
                                                    <div key={u.sso || ui} className={`flex ic g12 p12 pointer transition-all ${isSel ? 'bg-blue-lt' : 'hover-bg bg-white'}`} style={{ borderBottom: '1px solid var(--border)', borderLeft: isSel ? '4px solid var(--blue)' : '4px solid transparent' }} onClick={() => setSelectedStaff(u)}>
                                                        <div className="av s32" style={{ background: 'var(--navy)', color: '#fff', fontSize: '12px' }}>{u.n[0]}</div>
                                                        <div className="flex-1 overflow-hidden">
                                                            <div className="flex ic jb g6">
                                                                <div className={`fw7 fs13 truncate ${isSel ? 'text-blue' : 'text-navy'}`}>{u.t}{u.n}</div>
                                                                <div className="flex g4">
                                                                    {u.evalStatus === 'self_submitted' && <span className="b by" style={{ fontSize: '8px', padding: '1px 4px' }}>รอประเมิน (Staff)</span>}
                                                                    {u.evalStatus === 'unit_evaluated' && <span className="b bt" style={{ fontSize: '8px', padding: '1px 4px' }}>รอประเมิน (Dept)</span>}
                                                                    {u.evalStatus === 'dept_evaluated' && <span className="b bg-blue text-white" style={{ fontSize: '8px', padding: '1px 4px' }}>รอกลั่นกรอง (Dean)</span>}
                                                                    {u.evalStatus === 'dean_approved' && <span className="b bg-green text-white" style={{ fontSize: '8px', padding: '1px 4px' }}>อนุมัติแล้ว</span>}
                                                                    {(u.evalStatus === 'draft' || !u.evalStatus) && <span className="b muted" style={{ fontSize: '8px', padding: '1px 4px' }}>ยังไม่ส่ง</span>}
                                                                </div>
                                                            </div>
                                                            <div className="flex ic g4 truncate"><span className="fs10 muted fw5">{u.p}</span></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="card">
                    <div className="ch" style={{ borderBottom: '2px solid var(--blue-lt)' }}>
                        <div className="flex ic g12">
                            {selectedStaff && <div className="av s44" style={{ background: 'var(--navy)', color: '#fff' }}>{selectedStaff.n[0]}</div>}
                            <div>
                                <div className="ct fs18" style={{ color: 'var(--navy)' }}>{selectedStaff ? `${selectedStaff.t}${selectedStaff.n}` : "กรุณาเลือกบุคลากร"}</div>
                                <div className="cs fw5">{selectedStaff ? `${selectedStaff.p} · ${selectedStaff.d}` : "เลือกบุคลากรจากรายการด้านซ้ายเพื่อเริ่มประเมิน"}</div>
                            </div>
                        </div>
                    </div>
                    <div className="cb" style={{ paddingTop: '8px', opacity: selectedStaff ? 1 : 0.5, pointerEvents: selectedStaff ? 'all' : 'none' }}>
                        {mockComps.map((c, i) => (
                            <div key={i} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? '#fff' : 'rgba(0,0,0,0.02)' }}>
                                <div className="flex ic jb mb10">
                                    <div className="flex ic g8">
                                        <span className={c.tg} style={{ borderRadius: '4px', padding: '2px 8px' }}>{c.t}</span>
                                        <span className="fw7 fs14" style={{ color: 'var(--navy)' }}>{c.n}</span>
                                    </div>
                                    <div className="flex ic g6">
                                        <span className="fs11 muted">ผลการประเมินตนเอง:</span>
                                        <span className="fw8 fs16" style={{ color: 'var(--blue)' }}>{c.ss}</span>
                                        <span className="fs11 muted">/ 5</span>
                                    </div>
                                </div>
                                <div className="flex col g4 mb12" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px' }}>
                                    <div className="fs10 fw7 muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>พฤติกรรมบ่งชี้</div>
                                    <div className="fs12 text-text2 fw5">{c.beh.join(" · ")}</div>
                                </div>
                                {c.evidence ? (
                                    <div style={{ background: 'var(--bg)', borderRadius: '8px', padding: '10px', marginBottom: '12px', border: '1px dashed var(--border)' }}>
                                        <div className="lbl mb6" style={{ fontSize: '11px', color: 'var(--teal)', fontWeight: 700 }}>📎 หลักฐานที่แนบมา</div>
                                        <div className="flex ic g8 mb4">
                                            <div style={{ fontSize: '18px' }}>📄</div>
                                            <div className="flex-1">
                                                <div className="fw6 fs12">{c.evidence.name}</div>
                                                <div className="muted fs11">{c.evidence.desc}</div>
                                            </div>
                                            <a href={c.evidence.url} target="_blank" rel="noreferrer" className="btn btn-s btn-sm" style={{ padding: '4px 8px', fontSize: '10px' }}>เปิดดู</a>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ marginBottom: '12px', fontSize: '11px', color: 'var(--text3)', fontStyle: 'italic' }}>— ไม่มีบทพิสูจน์หรือหลักฐานแนบมา —</div>
                                )}
                                <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--border)', padding: '12px', marginBottom: '8px' }}>
                                    <div className="lbl" style={{ fontWeight: 600, fontSize: '11px', marginBottom: '8px', color: 'var(--navy)' }}>ให้คะแนน (Supervisor Score)</div>
                                    <div className="flex ic g10">
                                        <div className="lg" style={{ marginBottom: 0, flex: 1 }}>
                                            {[1, 2, 3, 4, 5].map(v => {
                                                const isDean = currentUser.p === 'คณบดี';
                                                const isScore = marks[c.id] === v;
                                                return (
                                                    <div key={v} className={`lbtn ${isScore ? 'sel' : ''}`} onClick={() => !isDean && handleMark(c.id, v)} style={{ cursor: isDean ? 'default' : 'pointer', height: '36px', flex: 1, opacity: (isDean && !isScore) ? 0.4 : 1 }}>
                                                        <span className="lnum">{v}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="lbl" style={{ fontWeight: 600, fontSize: '11px', color: 'var(--navy)', marginBottom: '4px', display: 'block' }}>ข้อเสนอแนะสำหรับการพัฒนา (Feedback)</label>
                                    <textarea className="ta" style={{ minHeight: '60px', fontSize: '13px', borderRadius: '8px' }} placeholder="ระบุข้อเสนอแนะเพื่อให้บุคลากรนำไปพัฒนาสมรรถนะ..." value={feedback[c.id] || ""} readOnly={currentUser.p === 'คณบดี'} onChange={e => handleFeedback(c.id, e.target.value)} />
                                </div>
                            </div>
                        ))}

                        {currentUser.p === 'คณบดี' && (
                            <div className="p20 mt10" style={{ background: 'var(--blue-lt)', borderRadius: '12px', border: '1px dashed var(--blue)' }}>
                                <div className="fw8 fs14 text-blue mb10">✍️ ส่วนการเซ็นอนุมัติ (Dean Signature)</div>
                                <div className="flex ic g10 mb10">
                                    <input type="checkbox" id="sign" className="pointer" />
                                    <label htmlFor="sign" className="fs13 fw6 pointer">ข้าพเจ้าอนุมัติผลการประเมินและแผนพัฒนา IDP ฉบับนี้</label>
                                </div>
                            </div>
                        )}

                        <div className="flex g8 mt20" style={{ padding: '0 20px 20px' }}>
                            <button className={`btn w-full ${saving ? 'btn-disabled' : 'btn-t'}`} onClick={submit} disabled={saving} style={{ justifyContent: 'center', height: '44px', fontSize: '14px', fontWeight: 700, boxShadow: '0 4px 12px var(--blue-lt)' }}>
                                {saving ? "กำลังบันทึก..." : (currentUser.p === 'คณบดี' ? "✔ เซ็นอนุมัติการประเมิน" : (currentUser.p.includes('รอง') || currentUser.p.includes('ผู้ช่วย') || currentUser.r === 'manager_dept' ? "✔ ยืนยันผลและส่งให้คณบดี" : "✔ ส่งผลการประเมินให้หัวหน้าฝ่าย"))}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export const TeamGap: React.FC<{ users: any[] }> = ({ users }) => {
    const deptKeys = Object.keys(DEPT_STRUCTURE);
    const [activeDept, setActiveDept] = useState(deptKeys[0]);

    const getTeamData = (unit: string) => {
        return users.filter(u => {
            if (!u.d) return false;
            const parts = u.d.split(" > ");
            if (parts[0] !== activeDept) return false;
            return parts[parts.length - 1] === unit;
        }).map(u => ({
            n: u.t + u.n,
            v: [3, 2, 4, 3, 4],
            pri: "medium",
            c: "by"
        }));
    };

    const topDevs = [
        { n: "การใช้เทคโนโลยีดิจิทัล", rate: 45, c: "br" },
        { n: "การวิเคราะห์ข้อมูล", rate: 55, c: "br" },
        { n: "การทำงานเป็นทีม", rate: 75, c: "by" },
        { n: "AI Literacy", rate: 85, c: "by" },
        { n: "การบริการ", rate: 95, c: "bt" }
    ];

    return (
        <>
            <div className="flex ic jb mb20">
                <div>
                    <div className="sec-t">สรุปสมรรถนะทีม 📊</div>
                    <div className="sec-s">แสดงระดับสมรรถนะ actual_level ของทีมใน {activeDept}</div>
                </div>
                <div className="flex ic g8">
                    <span className="fs12 fw6 muted">เลือกฝ่าย:</span>
                    <select className="ta" style={{ width: 'fit-content', padding: '6px 10px', fontSize: '13px' }} value={activeDept} onChange={e => setActiveDept(e.target.value)}>
                        {deptKeys.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </div>

            <div className="card mb14">
                <div className="ch"><div className="ct">ระดับสมรรถนะรายบุคคลแยกตามหน่วย</div></div>
                <div style={{ padding: 0 }}>
                    {DEPT_STRUCTURE[activeDept as keyof typeof DEPT_STRUCTURE].map((w, wi) => (
                        <div key={wi}>
                            <div style={{ background: 'var(--navy)', color: '#fff', padding: '8px 16px', fontWeight: 700, fontSize: '13px' }}>
                                📁 {w.work}
                            </div>
                            {w.units.map((un, ui) => (
                                <div key={ui}>
                                    <div style={{ background: '#f8fafc', padding: '6px 16px', borderLeft: '4px solid var(--blue)', fontSize: '12px', fontWeight: 700, color: 'var(--blue)' }}>
                                        🏠 {un}
                                    </div>
                                    <table className="tbl">
                                        <thead>
                                            <tr>
                                                <th>ชื่อ</th>
                                                <th>การบริการ</th>
                                                <th>ดิจิทัล</th>
                                                <th>วิเคราะห์</th>
                                                <th>ทำทีม</th>
                                                <th>AI</th>
                                                <th>Priority</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {getTeamData(un).map((u, k) => (
                                                <tr key={k}>
                                                    <td>
                                                        <div className="flex ic g8">
                                                            <div className="av s24" style={{ background: 'var(--navy)', color: '#fff', fontSize: '10px' }}>{u.n[0]}</div>
                                                            <div className="fw6 fs12" style={{ color: 'var(--navy)' }}>{u.n}</div>
                                                        </div>
                                                    </td>
                                                    {u.v.map((val, vi) => <td key={vi} style={{ textAlign: 'center', fontWeight: 700, color: 'var(--blue)' }}>{val}</td>)}
                                                    <td><span className={`b ${u.c}`} style={{ fontSize: '10px' }}>{u.pri}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="card">
                <div className="ch"><div className="ct">สมรรถนะที่ทีมต้องพัฒนามากที่สุด</div></div>
                <div className="cb">
                    {topDevs.map((d, i) => (
                        <div key={i} className="flex ic g12 mb12">
                            <div style={{ flex: 1 }}><div className="fw6 fs13">{d.n}</div></div>
                            <div style={{ width: '180px' }}>
                                <div className="pw" style={{ height: '7px' }}>
                                    <div className="pb" style={{ width: `${d.rate}%`, background: d.rate < 60 ? 'var(--red)' : d.rate < 80 ? 'var(--yellow)' : 'var(--teal)' }}></div>
                                </div>
                            </div>
                            <span className={`b ${d.c}`} style={{ width: '80px', justifyContent: 'center' }}>{d.rate}% ประเมินแล้ว</span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export const TeamIDP: React.FC<{ users: any[] }> = ({ users }) => {
    const deptKeys = Object.keys(DEPT_STRUCTURE);
    const [activeDept, setActiveDept] = useState(deptKeys[0]);
    const [currentTab, setCurrentTab] = useState("pending");
    const [feedbacks, setFeedbacks] = useState<any>({});
    const [doneList, setDoneList] = useState<string[]>([]);

    const getStaff = (unit: string) => users.filter(u => {
        if (!u.d) return false;
        const parts = u.d.split(" > ");
        if (parts[0] !== activeDept) return false;
        return parts[parts.length - 1] === unit;
    }).map(u => ({
        id: u.sso || u.n, n: u.t + u.n, p: u.p, d: "3 พ.ค.", acts: 3, comp: ["ดิจิทัล", "วิเคราะห์"], attached: "Training_Plan.pdf", av: u.n[0]
    }));

    const tabsSource = [
        { id: "pending", lb: "รออนุมัติ", count: 8, c: "by" },
        { id: "inprogress", lb: "กำลังดำเนินการ", count: 12, c: "bt" },
        { id: "done", lb: "เสร็จสิ้น", count: 5, c: "bg" }
    ];

    const approve = (id: string) => {
        setDoneList([...doneList, id]);
        alert("อนุมัติ IDP เรียบร้อยแล้ว");
    };

    return (
        <>
            <div className="flex ic jb mb16">
                <div>
                    <div className="sec-t">IDP & ติดตามทีม ✅</div>
                    <div className="sec-s">ข้อมูลใน {activeDept}</div>
                </div>
                <div className="flex ic g8">
                    <span className="fs12 fw6 muted">เลือกฝ่าย:</span>
                    <select className="ta" style={{ width: 'fit-content', padding: '6px 10px', fontSize: '13px' }} value={activeDept} onChange={e => setActiveDept(e.target.value)}>
                        {deptKeys.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </div>

            <div className="tab-bar">
                {tabsSource.map(t => (
                    <div key={t.id} className={`tab ${currentTab === t.id ? 'on' : ''}`} onClick={() => setCurrentTab(t.id)}>
                        {t.lb} <span className={`b ${t.c}`} style={{ marginLeft: '4px' }}>{t.count}</span>
                    </div>
                ))}
            </div>

            {currentTab === 'pending' ? (
                <div style={{ maxHeight: '800px', overflowY: 'auto' }}>
                    {DEPT_STRUCTURE[activeDept as keyof typeof DEPT_STRUCTURE].map((w, wi) => (
                        <div key={wi}>
                            <div style={{ background: 'var(--navy)', color: '#fff', padding: '8px 16px', fontWeight: 700, fontSize: '13px' }}>
                                📁 {w.work}
                            </div>
                            {w.units.map((un, ui) => (
                                <div key={ui}>
                                    <div style={{ background: '#f8fafc', padding: '6px 16px', borderLeft: '4px solid var(--blue)', fontSize: '12px', fontWeight: 700, color: 'var(--blue)' }}>
                                        🏠 {un}
                                    </div>
                                    <div className="p12">
                                        {getStaff(un).map(s => doneList.includes(s.id) ? null : (
                                            <div key={s.id} className="card mb12 hover-bg transition-all pointer">
                                                <div className="cb">
                                                    <div className="flex ic g12 mb12">
                                                        <div className="av s40" style={{ background: 'var(--navy)', color: '#fff', fontSize: '14px', flexShrink: 0 }}>{s.av}</div>
                                                        <div style={{ flex: 1 }}>
                                                            <div className="fw8 fs14" style={{ color: 'var(--navy)' }}>{s.n}</div>
                                                            <div className="muted fs12">{s.p}</div>
                                                            <div className="muted fs10 mt2">ส่ง {s.d} · {s.acts} กิจกรรม</div>
                                                            <div className="flex g6 mt8">
                                                                {s.comp.map((c, i) => <span key={i} style={{ fontSize: '10px', padding: '2px 7px', background: 'var(--blue-lt)', color: 'var(--blue)', borderRadius: '4px', fontWeight: 600 }}>{c}</span>)}
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                            <button className="btn btn-s btn-sm" style={{ fontSize: '11px' }}>📄 รายละเอียด</button>
                                                            <button className="btn btn-g btn-sm" style={{ fontSize: '11px' }} onClick={() => approve(s.id)}>✅ อนุมัติ</button>
                                                        </div>
                                                    </div>
                                                    <div className="fg mb0">
                                                        <textarea className="ta" style={{ minHeight: '38px', fontSize: '12px' }} placeholder="Feedback..." value={feedbacks[s.id] || ""} onChange={e => setFeedbacks({ ...feedbacks, [s.id]: e.target.value })} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card">
                    <div className="cb text-center py-20 text-text3">
                        อยู่ระหว่างรอข้อมูลจากทีม...
                    </div>
                </div>
            )}
        </>
    );
};
