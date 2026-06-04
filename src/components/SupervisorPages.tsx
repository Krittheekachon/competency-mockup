import React, { useEffect, useState } from 'react';
import { DEPT_STRUCTURE, INITIAL_USERS } from '../data';
import {
    buildSupervisorGapDecisionKey,
    getSupervisorIDPReviewState,
    validateSupervisorGapDecision,
    type SupervisorIDPDecision
} from './supervisor-idp-rules';

const isManagementRole = (user: any) => ["manager_dept", "manager"].includes(user?.r);
const isSupervisorRole = (user: any) => user?.r === "supervisor";
const isPeopleManager = (user: any) => isSupervisorRole(user) || isManagementRole(user);
const getPrimaryDept = (dept?: string) => (dept || "").split(" > ")[0] || "";
const getDeptUnit = (dept?: string) => {
    const parts = (dept || "").split(" > ");
    return parts[parts.length - 1] || "";
};
const getManagerDeptScopeUsers = (users: any[], currentUser?: any) => {
    if (!currentUser) return [];
    if (currentUser.r === "manager") {
        return users.filter(user => user.sso !== currentUser.sso && !isManagementRole(user));
    }
    if (currentUser.r === "manager_dept") {
        const supervisors = users.filter(user => user.sup === currentUser.n && isSupervisorRole(user));
        const supervisorNames = new Set(supervisors.map(user => user.n));
        return users.filter(user =>
            user.sso !== currentUser.sso &&
            !isManagementRole(user) &&
            (
                user.evaluator2 === currentUser.n ||
                user.sup === currentUser.n ||
                supervisorNames.has(user.sup)
            )
        );
    }
    return users.filter(user =>
        user.sso !== currentUser.sso &&
        !isManagementRole(user) &&
        user.sup === currentUser.n &&
        (currentUser.r !== "supervisor" || user.r !== "supervisor")
    );
};
const getScopeDeptOptions = (users: any[], currentUser?: any) => {
    const scopedUsers = getManagerDeptScopeUsers(users, currentUser);
    const depts = Array.from(new Set(scopedUsers.map(user => getPrimaryDept(user.d)).filter(Boolean)));
    return ["ทั้งหมด", ...depts.sort((a, b) => a.localeCompare(b, "th"))];
};
const matchesDeptFilter = (user: any, activeDept: string) => activeDept === "ทั้งหมด" || getPrimaryDept(user.d) === activeDept;
const getMockEvalStatus = (user: any) => INITIAL_USERS.find(seed => seed.sso === user?.sso)?.evalStatus || user?.evalStatus || "draft";

export const SupervisorAssess: React.FC<{ users: any[], setUsers: any, currentUser: any, supervisorUsers?: any[], onSupervisorChange?: (sso: string) => void, drafts?: Record<string, any>, setDrafts?: any, onDirtyChange?: (dirty: boolean) => void }> = ({ users, setUsers, currentUser, supervisorUsers, onSupervisorChange, drafts = {}, setDrafts, onDirtyChange }) => {
    const deptKeys = Object.keys(DEPT_STRUCTURE);
    const userDept = currentUser.d?.split(" > ")[0];
    const defaultDept = userDept && deptKeys.includes(userDept) ? userDept : deptKeys[0];

    const [activeDept, setActiveDept] = useState(currentUser.r === "manager_dept" ? "ทั้งหมด" : defaultDept);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const supervisorMode = ['supervisor', 'manager_dept'].includes(currentUser.r) && !!supervisorUsers?.length;
    const managerDeptMode = currentUser.r === "manager_dept";
    const deptOptions = managerDeptMode ? getScopeDeptOptions(users, currentUser) : deptKeys;
    const scopedUsers = getManagerDeptScopeUsers(users, currentUser);

    const filteredUsers = users.filter(u => {
        const isDean = currentUser.p === 'คณบดี';
        const isDeptIncharge = currentUser.p.includes('รองคณบดี') || currentUser.p.includes('ผู้ช่วยคณบดี') || currentUser.r === 'manager_dept';
        
        if (!u.d) return false;
        const matchesDept = u.d.split(" > ")[0] === activeDept;
        const isDirectSub = u.sup === currentUser.n || u.evaluator2 === currentUser.n;
        const hasAccess = isDean || isDeptIncharge || isDirectSub;
        const reviewerAccess = managerDeptMode ? scopedUsers.some(user => user.sso === u.sso) : supervisorMode ? isDirectSub : hasAccess;
        const matchesSearch = !searchTerm || u.n.toLowerCase().includes(searchTerm.toLowerCase()) || (u.sso && u.sso.toLowerCase().includes(searchTerm.toLowerCase()));
        
        return reviewerAccess && (managerDeptMode ? matchesDeptFilter(u, activeDept) : supervisorMode || matchesDept) && matchesSearch;
    });

    const isLevelBoss = (u: any) => isPeopleManager(u);
    const heads = filteredUsers.filter(u => isLevelBoss(u));
    const getStaffByGroup = (group: string, excludeBoss = false) => filteredUsers.filter(u => {
        const parts = u.d.split(" > ");
        const match = parts[parts.length - 1] === group;
        return excludeBoss ? (match && !isLevelBoss(u)) : match;
    });

    const mockComps = [
        {
            id: "c1",
            n: "การบริการที่ดี",
            t: "CC",
            tg: "tag-cc",
            ss: 2,
            supScore: 3,
            behaviors: {
                1: ["รับเรื่องจากผู้รับบริการได้เมื่อมีคำแนะนำ", "ตอบคำถามพื้นฐานตามข้อมูลที่มี", "รักษามารยาทในการให้บริการ"],
                2: ["ตอบสนองความต้องการผู้รับบริการได้ทันท่วงที", "ให้ข้อมูลที่ถูกต้องและครบถ้วนแก่ผู้รับบริการ", "แสดงความเป็นมิตร ยิ้มแย้ม ให้บริการด้วยใจ"],
                3: ["ติดตามเรื่องจนผู้รับบริการได้รับคำตอบ", "ปรับวิธีสื่อสารให้เหมาะกับผู้รับบริการ", "ประสานงานข้ามหน่วยเพื่อแก้ปัญหาได้"],
                4: ["คาดการณ์ปัญหาการบริการล่วงหน้า", "ออกแบบวิธีบริการที่ลดความผิดพลาดซ้ำ", "เป็นที่ปรึกษาให้ทีมในกรณีบริการซับซ้อน"],
                5: ["ยกระดับมาตรฐานการบริการของหน่วยงาน", "ใช้เสียงสะท้อนผู้รับบริการพัฒนาระบบงาน", "สร้างวัฒนธรรมบริการที่ดีให้ทีมอย่างต่อเนื่อง"]
            },
            evidence: { url: "https://kku.ac.th/...", name: "", desc: "อบรมหลักสูตรการบริการ..." }
        },
        {
            id: "c2",
            n: "การวิเคราะห์ข้อมูล",
            t: "FC",
            tg: "tag-fc",
            ss: 1,
            supScore: 2,
            behaviors: {
                1: ["รวบรวมข้อมูลจากแหล่งที่กำหนดได้", "ตรวจสอบข้อมูลเบื้องต้นตามแบบฟอร์ม", "สรุปข้อเท็จจริงง่าย ๆ จากข้อมูลที่ได้รับ"],
                2: ["จัดหมวดหมู่ข้อมูลและตรวจความครบถ้วนได้", "เปรียบเทียบข้อมูลพื้นฐานเพื่อหาความต่าง", "จัดทำตารางหรือกราฟพื้นฐานประกอบรายงาน"],
                3: ["เลือกวิธีวิเคราะห์ให้เหมาะกับโจทย์งาน", "อธิบายแนวโน้มและประเด็นสำคัญจากข้อมูล", "เชื่อมผลวิเคราะห์กับข้อเสนอแนะในการทำงาน"],
                4: ["วิเคราะห์ข้อมูลหลายมิติและระบุปัจจัยที่เกี่ยวข้อง", "ตรวจสอบความน่าเชื่อถือของผลวิเคราะห์", "นำเสนอ insight ให้ผู้เกี่ยวข้องตัดสินใจได้"],
                5: ["ออกแบบกรอบวิเคราะห์ข้อมูลให้หน่วยงานใช้ร่วมกัน", "คาดการณ์ผลกระทบจากข้อมูลเชิงลึก", "พัฒนาระบบติดตามข้อมูลเพื่อยกระดับการตัดสินใจ"]
            },
            evidence: { url: "https://kku.ac.th/...", name: "", desc: "อบรมหลักสูตรการวิเคราะห์..." }
        }
    ];

    const [marks, setMarks] = useState<any>({});
    const [feedback, setFeedback] = useState<any>({});
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [savedAt, setSavedAt] = useState("");
    const supervisorStaff = filteredUsers.filter(u =>
        u.sso !== currentUser.sso &&
        !['manager_dept', 'manager'].includes(u.r) &&
        (currentUser.r !== 'supervisor' || u.r !== 'supervisor')
    );
    const assessmentStatusOrder: Record<string, number> = {
        draft: 0,
        self_submitted: 1,
        unit_evaluated: 2,
        dept_evaluated: 3,
        dean_approved: 4
    };
    const sortedSupervisorStaff = [...supervisorStaff].sort((left, right) => {
        const leftRank = assessmentStatusOrder[getMockEvalStatus(left)] ?? 0;
        const rightRank = assessmentStatusOrder[getMockEvalStatus(right)] ?? 0;
        return leftRank - rightRank || left.n.localeCompare(right.n, "th");
    });
    const assessCounts = {
        total: supervisorStaff.length,
        notSent: supervisorStaff.filter(u => getMockEvalStatus(u) === "draft").length,
        pending: supervisorStaff.filter(u => getMockEvalStatus(u) === "self_submitted").length,
        unitReview: supervisorStaff.filter(u => getMockEvalStatus(u) === "unit_evaluated").length,
        deanReview: supervisorStaff.filter(u => getMockEvalStatus(u) === "dept_evaluated").length,
        done: supervisorStaff.filter(u => getMockEvalStatus(u) === "dean_approved").length
    };

    const statusBadge = (user: any) => {
        const style = { fontSize: "10px", padding: "4px 8px", whiteSpace: "nowrap" as const, flexShrink: 0 };
        const status = getMockEvalStatus(user);
        if (status === "self_submitted") return <span className="b by" style={style}>{managerDeptMode ? "รอหัวหน้างานประเมิน" : "รอคุณประเมิน"}</span>;
        if (status === "unit_evaluated") return <span className="b bo" style={style}>{managerDeptMode ? "รอคุณประเมิน" : "รอผู้บังคับบัญชาประเมิน"}</span>;
        if (status === "dept_evaluated") return <span className="b bb" style={style}>รอคณบดียืนยัน</span>;
        if (status === "dean_approved") return <span className="b bg" style={style}>เสร็จสมบูรณ์</span>;
        return <span className="b br" style={style}>ยังไม่ส่ง</span>;
    };
    const getReviewSteps = (status?: string) => {
        const waiting = { bg: "var(--bg)", color: "var(--text3)" };
        const active = { bg: "var(--blue-lt)", color: "var(--blue)" };
        const done = { bg: "var(--green-bg)", color: "var(--green)" };

        if (status === "dean_approved") {
            return [
                { no: 2, title: "หัวหน้าฝ่าย", text: "ประเมินแล้ว", style: done },
                { no: 3, title: "คณบดี", text: "ยืนยันแล้ว", style: done }
            ];
        }
        if (status === "dept_evaluated") {
            return [
                { no: 2, title: "หัวหน้าฝ่าย", text: "ประเมินแล้ว", style: done },
                { no: 3, title: "คณบดี", text: "รอคณบดียืนยัน", style: active }
            ];
        }
        if (status === "unit_evaluated") {
            return [
                { no: 2, title: "หัวหน้าฝ่าย", text: "รอผู้บังคับบัญชาประเมิน", style: active },
                { no: 3, title: "คณบดี", text: "ยังไม่ถึงขั้นตอน", style: waiting }
            ];
        }
        return [
            { no: 2, title: "หัวหน้าฝ่าย", text: "ยังไม่ถึงขั้นตอน", style: waiting },
            { no: 3, title: "คณบดี", text: "ยังไม่ถึงขั้นตอน", style: waiting }
        ];
    };
    const selectedMockScore = (compId: string) => marks[compId] || 2;
    const supervisorMockScore = (comp: any) => comp.supScore || 2;
    const getSelfBehaviors = (comp: any) => comp.behaviors[comp.ss as keyof typeof comp.behaviors] || [];
    const getAssessmentBehaviors = (comp: any) => getSelfBehaviors(comp);

    useEffect(() => {
        onDirtyChange?.(isDirty);

        const warnBeforeUnload = (event: BeforeUnloadEvent) => {
            if (!isDirty) return;
            event.preventDefault();
            event.returnValue = "";
        };

        window.addEventListener("beforeunload", warnBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", warnBeforeUnload);
            onDirtyChange?.(false);
        };
    }, [isDirty, onDirtyChange]);

    const getDraftKey = (staff: any) => `${currentUser.sso || currentUser.n}:${staff.sso || staff.n}`;
    const markDirty = () => {
        setIsDirty(true);
        setSavedAt("");
    };
    const openStaff = (staff: any) => {
        if (isDirty && selectedStaff?.sso !== staff.sso && !window.confirm("ยังไม่ได้บันทึกผลการประเมินของบุคลากรคนนี้ หากเปลี่ยนรายชื่อข้อมูลล่าสุดจะไม่ถูกบันทึก")) {
            return;
        }

        const draft = drafts[getDraftKey(staff)];
        setSelectedStaff(staff);
        setMarks(draft?.marks || {});
        setFeedback(draft?.feedback || {});
        setSavedAt(draft?.savedAt || "");
        setIsDirty(false);
    };
    const changeSupervisor = (sso: string) => {
        if (isDirty && !window.confirm("ยังไม่ได้บันทึกผลการประเมิน หากเปลี่ยนหัวหน้างานข้อมูลล่าสุดจะไม่ถูกบันทึก")) return;
        onSupervisorChange?.(sso);
    };
    const handleMark = (id: string, val: number) => {
        setMarks({ ...marks, [id]: val });
        markDirty();
    };
    const handleFeedback = (id: string, val: string) => {
        setFeedback({ ...feedback, [id]: val });
        markDirty();
    };
    const saveDraft = () => {
        if (!selectedStaff) return;
        const nextSavedAt = new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
        setDrafts?.((prev: Record<string, any>) => ({
            ...prev,
            [getDraftKey(selectedStaff)]: { marks, feedback, savedAt: nextSavedAt }
        }));
        setSavedAt(nextSavedAt);
        setIsDirty(false);
        alert("บันทึกผลเรียบร้อยแล้ว");
    };

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
            let msg = "";
            if (isDean) { msg = `อนุมัติการประเมินของ ${selectedStaff.t}${selectedStaff.n} เรียบร้อยแล้ว`; }
            else if (isDeptHead) { msg = `ส่งผลการประเมินของ ${selectedStaff.t}${selectedStaff.n} ให้คณบดีอนุมัติเรียบร้อยแล้ว`; }
            else if (isUnitHead) { msg = `ส่งผลการประเมินของ ${selectedStaff.t}${selectedStaff.n} ให้หัวหน้าฝ่ายเรียบร้อยแล้ว`; }

            setDrafts?.((prev: Record<string, any>) => ({
                ...prev,
                [getDraftKey(selectedStaff)]: { marks, feedback, savedAt: "ส่งผลแล้ว" }
            }));
            setIsDirty(false);
            setSaving(false);
            setSuccess(true);
            alert(msg);
        }, 1000);
    };

    if (success) return (
        <div className="card text-center" style={{ padding: '40px' }}>
            <div className="fw8 fs18 mb8">ส่งผลประเมินเรียบร้อย</div>
            <div className="muted fs14 mb20">คุณได้ทำการส่งผลการประเมินเรียบร้อยแล้ว</div>
            <button className="btn btn-p" onClick={() => setSuccess(false)}>กลับไปหน้าสรุป</button>
        </div>
    );

    return (
        <>
            {supervisorMode ? (
                <>
                    <div className="card mb16">
                        <div className="cb" style={{ padding: "12px 16px" }}>
                            {!managerDeptMode && (
                                <select className="sel" value={currentUser.sso} onChange={event => changeSupervisor(event.target.value)}>
                                    {supervisorUsers?.map(user => <option key={user.sso} value={user.sso}>{user.t}{user.n} · {user.p}</option>)}
                                </select>
                            )}
                            {managerDeptMode && (
                                <div className="flex ic g8" style={{ flexWrap: "wrap" }}>
                                    <span className="fs12 fw7 muted">หน่วยงาน:</span>
                                    <select className="sel" style={{ maxWidth: "360px" }} value={activeDept} onChange={event => setActiveDept(event.target.value)}>
                                        {deptOptions.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                    </select>
                                    
                                </div>
                            )}
                            <div className="flex ic" style={{ justifyContent: "flex-end", marginTop: "10px" }}>
                                <div className="flex ic g8">
                                    <div className="av" style={{ width: "34px", height: "34px", background: "var(--orange)", fontSize: "12px" }}>{currentUser.n[0]}</div>
                                    <div className="flex ic g4" style={{ flexWrap: "wrap" }}>
                                        <div className="fw8 fs12">{currentUser.t}{currentUser.n}</div>
                                        <div className="muted fs11">· {currentUser.p} · {currentUser.d}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="g4 mb20" style={{ gridTemplateColumns: "repeat(6,minmax(0,1fr))" }}>
                        <div className="sc" style={{ borderTop: "3px solid var(--navy)" }}><div className="sl">ทั้งหมด</div><div className="sv">{assessCounts.total}</div><div className="ss muted">คนในความดูแล</div></div>
                        <div className="sc" style={{ borderTop: "3px solid var(--red)" }}><div className="sl">ยังไม่ส่ง</div><div className="sv rc">{assessCounts.notSent}</div><div className="ss muted">รอลูกน้องประเมินตนเอง</div></div>
                        <div className="sc" style={{ borderTop: "3px solid var(--yellow)" }}><div className="sl">{managerDeptMode ? "รอหัวหน้างานประเมิน" : "รอคุณประเมิน"}</div><div className="sv yc">{assessCounts.pending}</div><div className="ss muted">คน</div></div>
                        <div className="sc" style={{ borderTop: "3px solid var(--orange)" }}><div className="sl">{managerDeptMode ? "รอคุณประเมิน" : "รอผู้บังคับบัญชาประเมิน"}</div><div className="sv" style={{ color: "var(--orange)" }}>{assessCounts.unitReview}</div><div className="ss muted">คน</div></div>
                        <div className="sc" style={{ borderTop: "3px solid var(--blue)" }}><div className="sl">รอคณบดียืนยัน</div><div className="sv bc">{assessCounts.deanReview}</div><div className="ss muted">คน</div></div>
                        <div className="sc" style={{ borderTop: "3px solid var(--green)" }}><div className="sl">เสร็จสมบูรณ์</div><div className="sv gcc">{assessCounts.done}</div><div className="ss muted">คน</div></div>
                    </div>
                    <div className="flex ic jb mb20" style={{ flexWrap: "wrap", gap: "8px" }}>
                        <div>
                            <div className="sec-t">ประเมินลูกน้อง</div>
                            <div className="sec-s">{managerDeptMode ? "ประเมินหัวหน้าหน่วยงานและบุคลากรในสายบังคับบัญชา พร้อม filter หน่วยงานได้" : "พิจารณาข้อมูลที่บุคลากรส่งมา และให้คะแนนหัวหน้างาน"}</div>
                        </div>
                        <span className="b by">รอคุณประเมิน {managerDeptMode ? assessCounts.unitReview : assessCounts.pending} คน</span>
                    </div>
                </>
            ) : (
                <div className="flex ic jb mb20">
                    <div>
                        <div className="sec-t">ประเมินลูกน้อง </div>
                        <div className="sec-s">ประเมินบุคลากรใน {activeDept}</div>
                    </div>
                    <div className="flex ic g8">
                        <span className="fs12 fw6 muted">เลือกฝ่าย:</span>
                        <select className="ta" style={{ width: 'fit-content', padding: '6px 10px', fontSize: '13px' }} value={activeDept} onChange={e => setActiveDept(e.target.value)}>
                            {deptKeys.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>
            )}

            <div className="g2" style={supervisorMode ? { gridTemplateColumns: "340px minmax(0,1fr)", alignItems: "start" } : undefined}>
                <div className="card">
                    <div className="ch" style={supervisorMode ? { padding: "14px 16px" } : undefined}><div className="ct">{supervisorMode ? "รายชื่อพนักงาน" : "รายการบุคลากรแยกตามหน่วยงาน"}</div></div>
                    {!supervisorMode && <div className="p12" style={{ borderBottom: '1px solid var(--border)', background: '#fff' }}>
                        <input className="inp inp-sm" style={{ fontSize: '12px' }} placeholder=" ค้นหาชื่อบุคลากร..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>}
                    <div style={{ padding: 0, maxHeight: '600px', overflowY: 'auto' }}>
                        {supervisorMode && sortedSupervisorStaff.map((u, i) => {
                            const isSel = selectedStaff?.sso === u.sso;
                            const status = getMockEvalStatus(u);
                            const isNotSent = status === "draft" || (managerDeptMode && status === "self_submitted");
                            return (
                                <div
                                    key={u.sso || i}
                                    className={`flex ic g12 transition-all ${isNotSent ? 'bg-white' : isSel ? 'bg-blue-lt pointer' : 'hover-bg bg-white pointer'}`}
                                    style={{ borderBottom: '1px solid var(--border)', minHeight: "72px", padding: "12px 14px", opacity: isNotSent ? 0.48 : 1, cursor: isNotSent ? "not-allowed" : "pointer" }}
                                    onClick={() => !isNotSent && openStaff(u)}
                                    aria-disabled={isNotSent}
                                >
                                    <div className="av" style={{ width: "38px", height: "38px", background: 'var(--navy)', color: '#fff', fontSize: '13px', flexShrink: 0 }}>{u.n[0]}</div>
                                    <div className="flex-1" style={{ minWidth: 0 }}>
                                        <div className="flex jb g8" style={{ alignItems: "center" }}>
                                            <div className="fw7 fs13" style={{ color: "var(--navy)", lineHeight: 1.35, minWidth: 0 }}>{u.t}{u.n}</div>
                                            {statusBadge(u)}
                                        </div>
                                        <div className="muted fs11" style={{ lineHeight: 1.3, marginTop: "2px" }}>{u.p}</div>
                                    </div>
                                </div>
                            );
                        })}
                        {supervisorMode && supervisorStaff.length === 0 && <div className="p20 muted fs12">ยังไม่มีบุคลากรในความดูแล</div>}
                        {!supervisorMode && (
                            <>
                        {heads.length > 0 && (
                            <div style={{ borderBottom: '1px solid var(--border)' }}>
                                <div style={{ background: 'var(--blue-lt)', padding: '10px 16px', fontWeight: 700, fontSize: '12px', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span> หัวหน้าหน่วยงาน / ผู้บริหาร</span>
                                    <span className="b bg-blue text-white" style={{ fontSize: '9px', padding: '1px 6px' }}>{heads.length}</span>
                                </div>
                                {heads.map((u, i) => {
                                    const isSel = selectedStaff?.sso === u.sso;
                                    return (
                                        <div key={u.sso || i} className={`flex ic g12 p12 pointer transition-all ${isSel ? 'bg-blue-lt' : 'hover-bg bg-white'}`} style={{ borderBottom: '1px solid var(--border)', borderLeft: isSel ? '4px solid var(--blue)' : '4px solid transparent' }} onClick={() => openStaff(u)}>
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
                                        <span style={{ marginRight: '6px' }}></span>{w.work}
                                    </div>
                                    {wUsers.map((u, ui) => {
                                        const isSel = selectedStaff?.sso === u.sso;
                                        return (
                                            <div key={u.sso || ui} className={`flex ic g12 p12 pointer transition-all ${isSel ? 'bg-blue-lt' : 'hover-bg bg-white'}`} style={{ borderBottom: '1px solid var(--border)', borderLeft: isSel ? '4px solid var(--blue)' : '4px solid transparent' }} onClick={() => openStaff(u)}>
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
                                                <span style={{ fontSize: '14px' }}></span><span>{un.name}</span>
                                            </div>
                                            {un.users.map((u, ui) => {
                                                const isSel = selectedStaff?.sso === u.sso;
                                                return (
                                                    <div key={u.sso || ui} className={`flex ic g12 p12 pointer transition-all ${isSel ? 'bg-blue-lt' : 'hover-bg bg-white'}`} style={{ borderBottom: '1px solid var(--border)', borderLeft: isSel ? '4px solid var(--blue)' : '4px solid transparent' }} onClick={() => openStaff(u)}>
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
                            </>
                        )}
                    </div>
                </div>

                {supervisorMode && !selectedStaff ? (
                    <div className="card flex col ic jc" style={{ minHeight: "240px", padding: "30px 20px", textAlign: "center", alignSelf: "center" }}>
                        <div className="fw7 fs14" style={{ color: "var(--text3)" }}>เลือกบุคลากรจากรายการด้านซ้ายเพื่อเริ่มประเมิน</div>
                    </div>
                ) : (
                <div className={supervisorMode ? "" : "card"} style={supervisorMode ? { minWidth: 0 } : undefined}>
                    {!supervisorMode && <div className="ch" style={{ borderBottom: '2px solid var(--blue-lt)' }}>
                        <div className="flex ic g12">
                            {selectedStaff && <div className="av s44" style={{ background: 'var(--navy)', color: '#fff' }}>{selectedStaff.n[0]}</div>}
                            <div>
                                <div className="ct fs18" style={{ color: 'var(--navy)' }}>{selectedStaff ? `${selectedStaff.t}${selectedStaff.n}` : "กรุณาเลือกบุคลากร"}</div>
                                <div className="cs fw5">{selectedStaff ? `${selectedStaff.p} · ${selectedStaff.d}` : "เลือกบุคลากรจากรายการด้านซ้ายเพื่อเริ่มประเมิน"}</div>
                            </div>
                        </div>
                    </div>}
                    <div className="cb" style={{ padding: supervisorMode ? '0' : '8px 0 0', opacity: selectedStaff ? 1 : 0.5, pointerEvents: selectedStaff ? 'all' : 'none' }}>
                        {supervisorMode && selectedStaff && <div className="fw8 fs15" style={{ padding: "0 0 14px", background: "var(--bg)" }}> การประเมิน: {selectedStaff.t}{selectedStaff.n}</div>}
                        {selectedStaff && (
                            <div className={`b ${isDirty ? "by" : "bt"}`} style={{ marginBottom: "12px", padding: "7px 10px", whiteSpace: "normal" }}>
                                {isDirty
                                    ? "มีผลการประเมินที่ยังไม่ได้บันทึก กรุณากดบันทึกไว้ก่อนหากต้องออกจากหน้านี้"
                                    : savedAt
                                        ? `บันทึกผลการประเมินล่าสุด ${savedAt}`
                                        : "ยังไม่มีการแก้ไขผลการประเมิน"}
                            </div>
                        )}
                        {mockComps.map((c, i) => (
                            <React.Fragment key={c.id}>
                                {supervisorMode && <div className="fw8 bc fs13" style={{ padding: "0 0 12px", background: "var(--bg)" }}>{c.t} — {c.t === "CC" ? "สมรรถนะหลัก" : "สมรรถนะตามสายงาน"}</div>}
                                {supervisorMode ? (
                                    <div className="card mb20" style={{ overflow: "hidden", boxShadow: "var(--sh)" }}>
                                        <div className="flex ic jb" style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", background: "#fff" }}>
                                            <div className="flex ic g10">
                                                <span className={c.tg}>{c.t}</span>
                                                <span className="fw8 fs14">{c.n}</span>
                                            </div>
                                            <div className="fw8 tc fs12">{c.ss}/5 </div>
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr" }}>
                                            <div style={{ padding: "22px 20px", borderRight: "1px solid var(--border)" }}>
                                                <div className="muted fw7 fs11 mb10">พฤติกรรมบ่งชี้ (ใช้ประกอบการตัดสิน)</div>
                                                <ul style={{ margin: "0 0 20px 18px", padding: 0, fontSize: "12px", lineHeight: 1.7 }}>
                                                    {getSelfBehaviors(c).map(item => <li key={item}>{item}</li>)}
                                                </ul>
                                            
                                                <div className="muted fw7 fs11 mb8">คะแนนความสามารถของบุคลากร (ประเมินตนเอง) </div>
                                                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: "7px", marginBottom: "18px" }}>
                                                    {[1, 2, 3, 4, 5].map(value => (
                                                        <div key={value} style={{ height: "54px", border: `1.5px solid ${c.ss === value ? "var(--teal)" : "var(--border)"}`, borderRadius: "8px", background: c.ss === value ? "var(--teal-lt)" : "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                                            <span className="fw8 fs15" style={{ color: c.ss === value ? "var(--teal)" : "var(--text3)" }}>{value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="muted fw7 fs11 mb8">หลักฐานประกอบ (Evidence)</div>
                                                <div style={{ display: "grid", gridTemplateColumns: "minmax(180px,1fr) 1fr", gap: "14px", alignItems: "center" }}>
                                                    <div style={{ height: "80px", border: "1px dashed var(--border)", borderRadius: "10px", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                                        <div style={{ fontSize: "18px", opacity: 0.55 }}>▤</div>
                                                        <div className="bc fw7 fs12">ยังไม่แนบไฟล์</div>
                                                    </div>
                                                    <div className="fs11">
                                                        <div className="mb8"><span className="fw8">URL:</span> <span className="bc">{c.evidence?.url}</span></div>
                                                        <div><span className="fw8">คำอธิบาย:</span> <span className="muted">{c.evidence?.desc}</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ padding: "22px 20px" }}>
                                                <div className="bc fw8 fs12 mb10">{managerDeptMode ? "1. หัวหน้างาน" : "1. หัวหน้างาน (คุณ) *"}</div>
                                                <div className="muted fw7 fs11 mb6">พฤติกรรมบ่งชี้ (ใช้ประกอบการตัดสิน)</div>
                                                <ul style={{ margin: "0 0 18px 18px", padding: 0, fontSize: "12px", lineHeight: 1.7 }}>
                                                    {getAssessmentBehaviors(c).map(item => <li key={item}>{item}</li>)}
                                                </ul>
                                                
                                                <div className="muted fw7 fs11 mb8">คะแนนความสามารถของบุคลากรโดยหัวหน้างาน</div>
                                                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: "7px", marginBottom: "16px" }}>
                                                    {[1, 2, 3, 4, 5].map(value => {
                                                        const selected = (managerDeptMode ? supervisorMockScore(c) : selectedMockScore(c.id)) === value;
                                                        return (
                                                            <button key={value} type="button" disabled={managerDeptMode} onClick={() => !managerDeptMode && handleMark(c.id, value)} style={{ minHeight: "54px", border: `1.5px solid ${selected ? "var(--teal)" : "var(--border)"}`, borderRadius: "9px", background: selected ? "var(--teal-lt)" : "#fff", color: selected ? "var(--teal)" : "var(--text3)", fontFamily: "inherit", cursor: managerDeptMode ? "default" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                                                <span className="fw8 fs15">{value}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                {managerDeptMode && (
                                                    <>
                                                        <div style={{ borderTop: "1px solid var(--border)", margin: "18px 0", paddingTop: "18px" }}>
                                                            <div className="tc fw8 fs12 mb10">2. หัวหน้าฝ่าย (คุณ) *</div>
                                                            <div className="muted fw7 fs11 mb6">พฤติกรรมบ่งชี้ (ใช้ประกอบการตัดสิน)</div>
                                                            <ul style={{ margin: "0 0 18px 18px", padding: 0, fontSize: "12px", lineHeight: 1.7 }}>
                                                                {getAssessmentBehaviors(c).map(item => <li key={item}>{item}</li>)}
                                                            </ul>
                                            
                                                            <div className="muted fw7 fs11 mb8">คะแนนความสามารถของบุคลากรโดยหัวหน้าฝ่าย</div>
                                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: "7px", marginBottom: "16px" }}>
                                                                {[1, 2, 3, 4, 5].map(value => {
                                                                    const selected = selectedMockScore(c.id) === value;
                                                                    return (
                                                                        <button key={value} type="button" onClick={() => handleMark(c.id, value)} style={{ minHeight: "54px", border: `1.5px solid ${selected ? "var(--teal)" : "var(--border)"}`, borderRadius: "9px", background: selected ? "var(--teal-lt)" : "#fff", color: selected ? "var(--teal)" : "var(--text3)", fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                                            <span className="fw8 fs15">{value}</span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                                <textarea className="ta" style={{ minHeight: "80px", fontSize: "13px", borderRadius: "10px" }} placeholder="ใส่คำเสนอแนะ (ถ้ามี)..." value={feedback[c.id] || ""} onChange={e => handleFeedback(c.id, e.target.value)} />
                                                <div style={{ borderTop: "1px solid var(--border)", marginTop: "24px", paddingTop: "16px" }}>
                                                    {getReviewSteps(getMockEvalStatus(selectedStaff)).map((step, stepIndex) => (
                                                        <div key={step.no} className={`flex ic g10 ${stepIndex === 0 ? "mb12" : ""}`}>
                                                            <div className="av s24" style={{ background: step.style.bg, color: step.style.color, fontSize: "10px" }}>{step.no}</div>
                                                            <div>
                                                                <div className="fw7 fs12">{step.title}</div>
                                                                <div className="fs11" style={{ color: step.style.color }}>{step.text}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? '#fff' : 'rgba(0,0,0,0.02)' }}>
                                        <div className="flex ic jb mb10">
                                            <div className="flex ic g8">
                                                <span className={c.tg} style={{ borderRadius: '4px', padding: '2px 8px' }}>{c.t}</span>
                                                <span className="fw7 fs14" style={{ color: 'var(--navy)' }}>{c.n}</span>
                                            </div>
                                            <span className="fw8 fs16 bc">{c.ss}/5</span>
                                        </div>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}

                        {currentUser.p === 'คณบดี' && (
                            <div className="p20 mt10" style={{ background: 'var(--blue-lt)', borderRadius: '12px', border: '1px dashed var(--blue)' }}>
                                <div className="fw8 fs14 text-blue mb10"> ส่วนการเซ็นอนุมัติ (Dean Signature)</div>
                                <div className="flex ic g10 mb10">
                                    <input type="checkbox" id="sign" className="pointer" />
                                    <label htmlFor="sign" className="fs13 fw6 pointer">ข้าพเจ้าอนุมัติผลการประเมินและแผนพัฒนา IDP ฉบับนี้</label>
                                </div>
                            </div>
                        )}

                        <div className="flex g8 mt20" style={{ padding: supervisorMode ? '0 0 20px' : '0 20px 20px', flexWrap: "wrap" }}>
                            <button className="btn btn-s" onClick={saveDraft} disabled={!selectedStaff || saving} style={{ minHeight: '44px', justifyContent: 'center', fontSize: '14px', fontWeight: 700, flex: "1 1 220px" }}>
                                บันทึกผล
                            </button>
                            <button className={`btn ${saving ? 'btn-disabled' : 'btn-t'}`} onClick={submit} disabled={saving} style={{ justifyContent: 'center', minHeight: '44px', fontSize: '14px', fontWeight: 700, boxShadow: '0 4px 12px var(--blue-lt)', flex: "2 1 300px" }}>
                                {saving ? "กำลังบันทึก..." : (currentUser.p === 'คณบดี' ? " เซ็นอนุมัติการประเมิน" : (currentUser.p.includes('รอง') || currentUser.p.includes('ผู้ช่วย') || currentUser.r === 'manager_dept' ? " ยืนยันผลและส่งให้คณบดี" : " ส่งผลการประเมินให้หัวหน้าฝ่าย"))}
                            </button>
                        </div>
                    </div>
                </div>
                )}
            </div>
        </>
    );
};

export const TeamGap: React.FC<{ users: any[], currentUser?: any, supervisorUsers?: any[], onSupervisorChange?: (sso: string) => void }> = ({ users, currentUser, supervisorUsers, onSupervisorChange }) => {
    const deptKeys = Object.keys(DEPT_STRUCTURE);
    const [activeDept, setActiveDept] = useState(currentUser?.r === "manager_dept" ? "ทั้งหมด" : getPrimaryDept(currentUser?.d) || "ทั้งหมด");
    const [selectedGapId, setSelectedGapId] = useState<string | null>(null);
    const supervisorMode = !!currentUser && !!supervisorUsers?.length;
    const managerDeptMode = currentUser?.r === "manager_dept";
    const deptOptions = managerDeptMode ? getScopeDeptOptions(users, currentUser) : deptKeys;

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

    const teamGapCatalog = [
        { n: "การบริการที่ดี", t: "CC", tg: "tag-cc" },
        { n: "การวิเคราะห์ข้อมูล", t: "FC", tg: "tag-fc" },
        { n: "การใช้เทคโนโลยีดิจิทัล", t: "FC", tg: "tag-fc" },
        { n: "AI Literacy", t: "CC", tg: "tag-cc" },
        { n: "การทำงานเป็นทีม", t: "CC", tg: "tag-cc" }
    ];
    const mockGapProfiles: Record<string, string[]> = {
        "20002": ["การบริการที่ดี", "การวิเคราะห์ข้อมูล"],
        "20012": [],
        "20013": ["การบริการที่ดี", "AI Literacy"],
        "20014": ["การใช้เทคโนโลยีดิจิทัล"]
    };
    const mockSupervisorGapUsers = [
        { n: "สมชาย มีสุข", t: "นาย", sso: "mock-gap-1", p: "นักวิชาการศึกษา", d: currentUser?.d || "สนับสนุนการศึกษาและวิชาการ", evalStatus: "unit_evaluated" },
        { n: "ชลธิชา วรรณวิทย์", t: "นางสาว", sso: "mock-gap-2", p: "นักวิชาการวิทยาศาสตร์", d: currentUser?.d || "สนับสนุนการศึกษาและวิชาการ", evalStatus: "draft" },
        { n: "วรรณภา ใจดี", t: "นางสาว", sso: "mock-gap-3", p: "นักวิชาการศึกษา", d: currentUser?.d || "สนับสนุนการศึกษาและวิชาการ", evalStatus: "unit_evaluated" },
        { n: "ภาณุพงศ์ แสงดี", t: "นาย", sso: "mock-gap-4", p: "นักเอกสารสนเทศ", d: currentUser?.d || "สนับสนุนการศึกษาและวิชาการ", evalStatus: "dept_evaluated" },
        { n: "กมลชนก พูนผล", t: "นาง", sso: "mock-gap-5", p: "นักแนะแนวการศึกษาและอาชีพ", d: currentUser?.d || "สนับสนุนการศึกษาและวิชาการ", evalStatus: "dean_approved" }
    ];
    const scopedGapUsers = managerDeptMode
        ? getManagerDeptScopeUsers(users, currentUser).filter(user => matchesDeptFilter(user, activeDept))
        : (supervisorUsers?.length ? supervisorUsers : getManagerDeptScopeUsers(users, currentUser));
    const directGapPeople = scopedGapUsers.length ? scopedGapUsers : mockSupervisorGapUsers;
    const gapPeople = directGapPeople.map((user, index) => {
        const evalStatus = getMockEvalStatus(user);
        const pending = evalStatus === "draft" || !evalStatus;
        const fallbackGaps = index % 3 === 1 ? [] : ["การบริการที่ดี", "การวิเคราะห์ข้อมูล"];
        const gaps = mockGapProfiles[user.sso] ?? fallbackGaps;

        return {
            id: user.sso || `gap-${index}`,
            n: `${user.t}${user.n}`,
            p: pending ? "รอการประเมิน" : user.p,
            pending,
            gaps: pending ? [] : gaps || []
        };
    });
    const assessedPeople = gapPeople.filter(person => !person.pending);
    const foundGapPeople = assessedPeople.filter(person => person.gaps.length > 0);
    const sortedGapPeople = [...gapPeople].sort((left, right) => {
        const leftGroup = left.pending ? 0 : left.gaps.length > 0 ? 1 : 2;
        const rightGroup = right.pending ? 0 : right.gaps.length > 0 ? 1 : 2;
        return leftGroup - rightGroup || right.gaps.length - left.gaps.length || left.n.localeCompare(right.n, "th");
    });
    const teamGapComps = teamGapCatalog
        .map(comp => ({
            ...comp,
            count: assessedPeople.filter(person => person.gaps.includes(comp.n)).length
        }))
        .filter(comp => comp.count > 0)
        .sort((left, right) => right.count - left.count || left.n.localeCompare(right.n, "th"));
    const selectedGapIndex = sortedGapPeople.findIndex(person => person.id === selectedGapId);
    const selectedGapPerson = sortedGapPeople[selectedGapIndex];
    const gapDetailRows = selectedGapPerson?.gaps.map((gap, index) => {
        const comp = teamGapCatalog.find(item => item.n === gap) || teamGapCatalog[index % teamGapCatalog.length];
        return {
            n: gap,
            t: comp.t,
            tg: comp.tg,
            expected: 3,
            self: index === 0 ? 2 : 1,
            supervisor: 2,
            diff: -1
        };
    }) || [];

    if (supervisorMode && selectedGapPerson) return (
        <>
            <button className="btn btn-s btn-sm mb16" onClick={() => setSelectedGapId(null)}>← กลับ</button>

            <div className="card mb16">
                <div className="cb flex ic jb g12" style={{ padding: "18px 20px", flexWrap: "wrap" }}>
                    <div className="flex ic g12">
                        <div className="av" style={{ width: "48px", height: "48px", background: "var(--navy)", fontSize: "16px" }}>{selectedGapPerson.n[0]}</div>
                        <div>
                            <div className="fw8 fs15">{selectedGapPerson.n}</div>
                            <div className="muted fs12">{selectedGapPerson.p}</div>
                            <div className="mt6">
                                <span className={`b ${gapDetailRows.length > 0 ? "br" : "bg"}`}>
                                    {gapDetailRows.length > 0 ? `ไม่ผ่าน ${gapDetailRows.length} สมรรถนะ` : "ไม่พบ Gap"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex g6">
                        <button className="btn btn-s btn-sm" disabled={selectedGapIndex <= 0} onClick={() => setSelectedGapId(sortedGapPeople[selectedGapIndex - 1]?.id)}>← ก่อนหน้า</button>
                        <button className="btn btn-s btn-sm" disabled={selectedGapIndex >= sortedGapPeople.length - 1} onClick={() => setSelectedGapId(sortedGapPeople[selectedGapIndex + 1]?.id)}>ถัดไป →</button>
                    </div>
                </div>
            </div>

            <div className="card mb16" style={{ overflow: "hidden" }}>
                <div className="ch"><div className="ct">ผลรายสมรรถนะ</div></div>
                <table className="tbl">
                    <thead>
                        <tr>
                            <th>สมรรถนะ</th>
                            <th style={{ textAlign: "center" }}>ประเภท</th>
                            <th style={{ textAlign: "center" }}>คาดหวัง</th>
                            <th style={{ textAlign: "center" }}>ประเมินตนเอง</th>
                            <th style={{ textAlign: "center" }}>หัวหน้างานประเมิน</th>
                            <th style={{ textAlign: "center" }}>Gap</th>
                            <th style={{ textAlign: "center" }}>สถานะ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gapDetailRows.length > 0 ? gapDetailRows.map(row => (
                            <tr key={row.n}>
                                <td className="fw7 fs13">{row.n}</td>
                                <td style={{ textAlign: "center" }}><span className={row.tg}>{row.t}</span></td>
                                <td style={{ textAlign: "center" }}><span className="av s32" style={{ display: "inline-flex", background: "var(--navy)", fontSize: "13px" }}>{row.expected}</span></td>
                                <td style={{ textAlign: "center" }}><span className="av s32" style={{ display: "inline-flex", background: "var(--blue-lt)", color: "var(--blue)", fontSize: "13px" }}>{row.self}</span></td>
                                <td style={{ textAlign: "center" }}><span className="av s32" style={{ display: "inline-flex", background: "var(--red-bg)", color: "var(--red)", fontSize: "13px" }}>{row.supervisor}</span></td>
                                <td style={{ textAlign: "center" }}><span className="rc fw8">{row.diff}</span></td>
                                <td style={{ textAlign: "center" }}><span className="b br">ไม่ผ่าน</span></td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={7} style={{ textAlign: "center", padding: "26px 16px" }}>
                                    <span className="b bg">ผ่านทุกสมรรถนะ ไม่พบ Gap</span>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="card" style={{ overflow: "hidden" }}>
                <div className="ch"><div className="ct">ข้อเสนอแนะ</div></div>
                <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)" }}>
                    <div className="bc fw7 fs12 mb10">● หัวหน้างาน</div>
                    <div style={{ background: "var(--blue-lt)", borderRadius: "9px", padding: "12px 14px" }} className="fs12">ยังไม่มีข้อเสนอแนะ</div>
                </div>
                <div style={{ padding: "16px 18px" }}>
                    <div className="tc fw7 fs12 mb10">● หัวหน้าฝ่าย</div>
                    <div style={{ background: "var(--teal-lt)", borderRadius: "9px", padding: "12px 14px" }} className="fs12">ยังไม่มีข้อเสนอแนะ</div>
                </div>
            </div>
        </>
    );

    if (supervisorMode) return (
        <>
            <div className="card mb16">
                <div className="cb" style={{ padding: "12px 16px" }}>
                    {!managerDeptMode && (
                        <select className="sel" value={currentUser.sso} onChange={event => onSupervisorChange?.(event.target.value)}>
                            {supervisorUsers?.map(user => <option key={user.sso} value={user.sso}>{user.t}{user.n} · {user.p}</option>)}
                        </select>
                    )}
                    {managerDeptMode && (
                        <div className="flex ic g8" style={{ flexWrap: "wrap" }}>
                            <span className="fs12 fw7 muted">หน่วยงาน:</span>
                            <select className="sel" style={{ maxWidth: "360px" }} value={activeDept} onChange={event => setActiveDept(event.target.value)}>
                                {deptOptions.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                            </select>
                           
                        </div>
                    )}
                    <div className="flex ic" style={{ justifyContent: "flex-end", marginTop: "10px" }}>
                        <div className="flex ic g8">
                            <div className="av" style={{ width: "34px", height: "34px", background: "var(--orange)", fontSize: "12px" }}>{currentUser.n[0]}</div>
                            <div className="flex ic g4" style={{ flexWrap: "wrap" }}>
                                <div className="fw8 fs12">{currentUser.t}{currentUser.n}</div>
                                <div className="muted fs11">· {currentUser.p} · {currentUser.d}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb20">
                <div className="sec-t">ผลการประเมินของทีม</div>
                <div className="sec-s">{managerDeptMode ? "ดูผลของหัวหน้าหน่วยงานและบุคลากรทุกคนในสายบังคับบัญชา พร้อม filter หน่วยงานได้" : `วิเคราะห์ผลการประเมินและจุดอ่อนของทีม (${currentUser.d || "หน่วยงานในความดูแล"})`}</div>
            </div>

            <div className="g3 mb16">
                <div className="sc" style={{ borderTop: "3px solid var(--navy)" }}><div className="sl">บุคลากรทั้งหมด</div><div className="sv">{gapPeople.length}</div><div className="ss muted">คน</div></div>
                <div className="sc" style={{ borderTop: "3px solid var(--blue)" }}><div className="sl">ประเมินแล้ว</div><div className="sv bc">{assessedPeople.length}</div><div className="ss muted">คน</div></div>
                <div className="sc" style={{ borderTop: "3px solid var(--red)" }}><div className="sl">พบ Gap</div><div className="sv rc">{foundGapPeople.length}</div><div className="ss muted">คน</div></div>
            </div>

            <div className="g2" style={{ gridTemplateColumns: "1fr 1fr", alignItems: "stretch" }}>
                <div className="card" style={{ overflow: "hidden" }}>
                    <div className="ch"><div className="ct">สมรรถนะที่ไม่ผ่านเกณฑ์</div><div className="cs">เรียงตามจำนวนคนที่ไม่ผ่านเกณฑ์</div></div>
                    <div style={{ padding: 0 }}>
                        {teamGapComps.map(comp => (
                            <div key={comp.n} style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)" }}>
                                <div className="flex ic g10">
                                    <span className={comp.tg}>{comp.t}</span>
                                    <div style={{ flex: 1 }}>
                                        <div className="flex ic jb g8">
                                            <div className="fw8 fs13">{comp.n}</div>
                                            <div className="rc fw8 fs12">{comp.count} คน</div>
                                        </div>
                                        <div className="pw mt8" style={{ height: "6px" }}>
                                            <div className="pb" style={{ width: `${Math.max(14, (comp.count / gapPeople.length) * 100)}%`, background: "var(--red)" }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card" style={{ overflow: "hidden" }}>
                    <div className="ch"><div className="ct">รายชื่อสมาชิกและผลการประเมิน</div></div>
                    <div style={{ padding: 0 }}>
                        {sortedGapPeople.map(person => (
                            <div key={person.id} className={`flex ic g12 ${person.pending ? "" : "pointer hover-bg"}`} style={{ padding: "15px 18px", borderBottom: "1px solid var(--border)" }} onClick={() => !person.pending && setSelectedGapId(person.id)}>
                                <div className="av" style={{ width: "38px", height: "38px", background: person.pending ? "var(--text3)" : "var(--navy)", fontSize: "13px", flexShrink: 0 }}>{person.n[0]}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div className={`fw8 fs13 ${person.pending ? "muted" : ""}`}>{person.n}</div>
                                    {person.pending ? (
                                        <div className="muted fs11">รอการประเมิน</div>
                                    ) : person.gaps.length > 0 ? (
                                        <div className="flex g5 mt6" style={{ flexWrap: "wrap" }}>
                                            {person.gaps.map(gap => <span key={gap} className="b br" style={{ fontSize: "10px" }}>△ {gap}</span>)}
                                        </div>
                                    ) : (
                                        <div className="gcc fs11 mt4"> ผ่านทุกข้อ</div>
                                    )}
                                </div>
                                {!person.pending && <span className="bc fw8 fs13">ดู →</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <>
            <div className="flex ic jb mb20">
                <div>
                    <div className="sec-t">สรุปสมรรถนะทีม </div>
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
                                 {w.work}
                            </div>
                            {w.units.map((un, ui) => (
                                <div key={ui}>
                                    <div style={{ background: '#f8fafc', padding: '6px 16px', borderLeft: '4px solid var(--blue)', fontSize: '12px', fontWeight: 700, color: 'var(--blue)' }}>
                                         {un}
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

const LegacyTeamIDP: React.FC<{ users: any[] }> = ({ users }) => {
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
                    <div className="sec-t">IDP & ติดตามทีม </div>
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
                                 {w.work}
                            </div>
                            {w.units.map((un, ui) => (
                                <div key={ui}>
                                    <div style={{ background: '#f8fafc', padding: '6px 16px', borderLeft: '4px solid var(--blue)', fontSize: '12px', fontWeight: 700, color: 'var(--blue)' }}>
                                         {un}
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
                                                            <button className="btn btn-s btn-sm" style={{ fontSize: '11px' }}> รายละเอียด</button>
                                                            <button className="btn btn-g btn-sm" style={{ fontSize: '11px' }} onClick={() => approve(s.id)}> อนุมัติ</button>
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

type SupervisorIDPPhase = "notsent" | "rejected" | "pending" | "forwarded" | "deanConfirm" | "inprogress" | "done";
type SupervisorIDPActivityStatus = "draft" | "pending" | "approved" | "rejected";
type SupervisorIDPGapProgressStatus = "developing" | "submitted" | "rejected" | "done";

const supervisorIDPPhaseMeta: Record<SupervisorIDPPhase, { label: string; badge: string; tab: string }> = {
    notsent: { label: "ยังไม่ส่งแผน", badge: "bgr", tab: "notsent" },
    rejected: { label: "แผนไม่ผ่าน", badge: "br", tab: "notsent" },
    pending: { label: "รอคุณตรวจแผน", badge: "by", tab: "pending" },
    forwarded: { label: "รอผู้บังคับบัญชาตรวจสอบแผน", badge: "bo", tab: "pending" },
    deanConfirm: { label: "รอคณบดียืนยัน", badge: "bb", tab: "pending" },
    inprogress: { label: "ระหว่างดำเนินการ", badge: "bt", tab: "inprogress" },
    done: { label: "เสร็จสิ้น", badge: "bg", tab: "done" }
};

const supervisorIDPActivityStatusMeta: Record<SupervisorIDPActivityStatus, { label: string; badge: string }> = {
    draft: { label: "ร่าง", badge: "bgr" },
    pending: { label: "รออนุมัติ", badge: "by" },
    approved: { label: "ผ่าน", badge: "bg" },
    rejected: { label: "ไม่ผ่าน", badge: "br" }
};

const supervisorIDPGapProgressMeta: Record<SupervisorIDPGapProgressStatus, { label: string; badge: string }> = {
    developing: { label: "ต้องพัฒนา", badge: "bt" },
    submitted: { label: "ส่งแล้ว/รอตรวจสอบ", badge: "by" },
    rejected: { label: "ไม่ผ่าน", badge: "br" },
    done: { label: "เสร็จสิ้น", badge: "bg" }
};

const normalizeSupervisorIDPActivity = (activity: any, index: number, planPhase?: SupervisorIDPPhase) => {
    if (typeof activity === "string") {
        return {
            title: activity,
            method: activity.includes("OJT") || activity.includes("โครงการ") ? "Experiential Learning" : activity.includes("Mentoring") ? "Social Learning" : "Formal Learning",
            startDate: "2025-06-01",
            due: "2025-07-31",
            weight: index === 0 ? 60 : 40,
            note: "",
            status: planPhase === "notsent" ? "draft" as SupervisorIDPActivityStatus : "pending" as SupervisorIDPActivityStatus,
            events: []
        };
    }

    const statusText = activity.status;
    const status: SupervisorIDPActivityStatus =
        statusText === "ผ่าน" || statusText === "ผ่านแล้ว" || statusText === "เสร็จสิ้น" ? "approved" :
            statusText === "ไม่ผ่าน" ? "rejected" :
                statusText === "ร่าง" ? "draft" :
                    activity.status || (planPhase === "done" ? "approved" : planPhase === "notsent" ? "draft" : "pending");

    return {
        startDate: "2025-06-01",
        due: "2025-07-31",
        weight: index === 0 ? 60 : 40,
        note: "",
        events: [],
        ...activity,
        status
    };
};

const getSupervisorIDPActivities = (gap: any, phase?: SupervisorIDPPhase) =>
    (gap.activities || []).map((activity: any, index: number) => normalizeSupervisorIDPActivity(activity, index, phase));

const isSupervisorIDPActivityDone = (activity: any) => {
    const normalized = normalizeSupervisorIDPActivity(activity, 0);
    return normalized.status === "approved" || activity.status === "ผ่าน" || activity.status === "เสร็จสิ้น" || normalized.progressDone === true;
};

const deriveSupervisorIDPGapProgressStatus = (gap: any, phase?: SupervisorIDPPhase): SupervisorIDPGapProgressStatus => {
    if (gap.progressStatus) return gap.progressStatus;
    if (phase === "done") return "done";
    return "developing";
};

const getSupervisorIDPGapProgressSummary = (gap: any, phase?: SupervisorIDPPhase) => {
    const activities = getSupervisorIDPActivities(gap, phase);
    const doneCount = activities.filter(isSupervisorIDPActivityDone).length;
    return {
        activities,
        doneCount,
        totalCount: activities.length,
        status: deriveSupervisorIDPGapProgressStatus(gap, phase)
    };
};

const getSupervisorIDPWeightNotice = (totalWeight: number) => {
    if (totalWeight === 100) return null;
    if (totalWeight < 100) return { label: `ขาด ${100 - totalWeight}%`, badge: "by" };
    return { label: `เกิน ${totalWeight - 100}%`, badge: "br" };
};

const supervisorIDPMock = [
    {
        id: "maleerat",
        n: "นางมาลีรัตน์ สุขใจ",
        p: "เจ้าหน้าที่",
        unit: "หน่วยแผนยุทธศาสตร์",
        phase: "notsent" as SupervisorIDPPhase,
        gaps: [
            { cd: "CC-001", n: "การบริการที่ดี", t: "CC", tg: "tag-cc", exp: 3, got: 2 },
            { cd: "FC2-062", n: "การวิเคราะห์ข้อมูล", t: "FC", tg: "tag-fc", exp: 3, got: 2 }
        ]
    },
    {
        id: "veeraphol",
        n: "นายวีระพล ก้าวหน้า",
        p: "นักจัดการงานทั่วไป",
        unit: "หน่วยแผนยุทธศาสตร์",
        phase: "rejected" as SupervisorIDPPhase,
        sent: "17 พ.ค. 68",
        gaps: [
            { cd: "CC-003", n: "การทำงานเป็นทีม", t: "CC", tg: "tag-cc", exp: 4, got: 2, goal: "ประสานงานโครงการข้ามหน่วยงานได้ราบรื่นขึ้น", activities: ["Mentoring Program", "Workshop Leadership"] }
        ]
    },
    {
        id: "rattana-idp",
        n: "นางสาวรัตนา ทองแท้",
        p: "นักวิชาการศึกษา",
        unit: "หน่วยแผนยุทธศาสตร์",
        phase: "pending" as SupervisorIDPPhase,
        sent: "20 พ.ค. 68",
        gaps: [
            {
                cd: "CC-003",
                n: "การทำงานเป็นทีม",
                t: "CC",
                tg: "tag-cc",
                exp: 4,
                got: 2,
                goal: "ประสานงานโครงการข้ามหน่วยงานได้ราบรื่นขึ้น",
                activities: [
                    { title: "Mentoring Program", method: "Social Learning", startDate: "2025-06-01", due: "2025-07-31", weight: 40, status: "pending", note: "เลือกจาก Catalog HR" },
                    { title: "Workshop Leadership", method: "Formal Learning", startDate: "2025-06-10", due: "2025-07-15", weight: 30, status: "pending", note: "เลือกจาก Catalog HR" },
                    { title: "โครงการพัฒนากระบวนการงานร่วม", method: "Experiential Learning", startDate: "2025-06-15", due: "2025-08-15", weight: 30, status: "pending", note: "ระบุกิจกรรมเอง" }
                ]
            },
            {
                cd: "FC2-061",
                n: "การใช้เทคโนโลยีดิจิทัล",
                t: "FC",
                tg: "tag-fc",
                exp: 4,
                got: 2,
                goal: "ใช้เครื่องมือดิจิทัลจัดทำ dashboard ติดตามแผนงานได้",
                activities: [
                    { title: "อบรม Data Dashboard", method: "Formal Learning", startDate: "2025-06-01", due: "2025-06-30", weight: 50, status: "pending", note: "เลือกจาก Catalog HR" },
                    { title: "OJT สรุปข้อมูลผู้บริหาร", method: "Experiential Learning", startDate: "2025-07-01", due: "2025-08-31", weight: 50, status: "pending", note: "ระบุกิจกรรมเอง" }
                ]
            }
        ]
    },
    {
        id: "bunyoo",
        n: "นายบุญอยู่ มีสุข",
        p: "เจ้าหน้าที่บริหาร",
        unit: "หน่วยแผนยุทธศาสตร์",
        phase: "forwarded" as SupervisorIDPPhase,
        sent: "21 พ.ค. 68",
        gaps: [{ cd: "FC2-061", n: "การใช้เทคโนโลยีดิจิทัล", t: "FC", tg: "tag-fc", exp: 4, got: 2, goal: "ใช้เครื่องมือดิจิทัลจัดทำ dashboard ติดตามแผนงานได้", activities: [{ title: "อบรม Data Dashboard", method: "Formal Learning", startDate: "2025-06-01", due: "2025-06-30", weight: 50, status: "pending" }, { title: "OJT สรุปข้อมูลผู้บริหาร", method: "Experiential Learning", startDate: "2025-07-01", due: "2025-08-31", weight: 50, status: "pending" }] }]
    },
    {
        id: "chayut",
        n: "นายชยุต วงศ์แผน",
        p: "เจ้าหน้าที่แผนงาน",
        unit: "หน่วยแผนยุทธศาสตร์",
        phase: "deanConfirm" as SupervisorIDPPhase,
        sent: "22 พ.ค. 68",
        gaps: [{ cd: "FC2-062", n: "การวิเคราะห์ข้อมูล", t: "FC", tg: "tag-fc", exp: 3, got: 2, goal: "จัดทำรายงานวิเคราะห์ข้อมูลประจำเดือน", activities: [{ title: "OJT Dashboard แผนงาน", method: "Experiential Learning", startDate: "2025-06-01", due: "2025-08-31", weight: 100, status: "pending" }] }]
    },
    {
        id: "pimjai-idp",
        n: "นางสาวพิมพ์ใจ ทองดี",
        p: "นักวิเคราะห์",
        unit: "หน่วยแผนยุทธศาสตร์",
        phase: "inprogress" as SupervisorIDPPhase,
        gaps: [
            {
                cd: "CC-003",
                n: "การทำงานเป็นทีม",
                t: "CC",
                tg: "tag-cc",
                exp: 3,
                got: 2,
                progressStatus: "developing",
                activities: [
                    {
                        title: "Team Activity Program",
                        method: "Social Learning",
                        startDate: "2025-05-01",
                        due: "2025-06-30",
                        weight: 60,
                        status: "ผ่าน",
                        events: [
                            { date: "5 พ.ค.", text: "เริ่มกิจกรรมกลุ่ม - โครงการพัฒนาระบบงานร่วมกัน 4 คน", file: "แผนงาน_Team_Activity_2568.pdf", by: "นายปิยวัฒน์ รุ่งเรือง" },
                            { date: "10 มิ.ย.", text: "ส่งรายงานความก้าวหน้าครึ่งทาง", file: "รายงานความก้าวหน้า_มิ.ย.68.pdf", by: "นายปิยวัฒน์ รุ่งเรือง" },
                            { date: "30 มิ.ย.", text: "หัวหน้างานตรวจความก้าวหน้าแล้ว", file: "แบบติดตาม_TeamActivity_2568.pdf", by: "นางกัญญารัตน์ ศรีวิชา" }
                        ]
                    },
                    {
                        title: "อ่านและสรุปหนังสือ Teamwork 101",
                        method: "Formal Learning",
                        startDate: "2025-07-01",
                        due: "2025-07-31",
                        weight: 40,
                        status: "รออนุมัติ",
                        events: [
                            { date: "1 ก.ค.", text: "เริ่มอ่านและจดบันทึกสรุปบทที่ 1-5", file: "สรุปหนังสือ_บทที่1-5.docx", by: "นายปิยวัฒน์ รุ่งเรือง" }
                        ]
                    }
                ]
            },
            {
                cd: "FC2-061",
                n: "การใช้เทคโนโลยีดิจิทัล",
                t: "FC",
                tg: "tag-fc",
                exp: 4,
                got: 2,
                progressStatus: "submitted",
                activities: [
                    {
                        title: "อบรม Data Dashboard",
                        method: "Formal Learning",
                        startDate: "2025-06-01",
                        due: "2025-06-30",
                        weight: 50,
                        status: "ผ่าน",
                        events: [
                            { date: "5 มิ.ย.", text: "เข้าอบรมครบตามหลักสูตรและแนบใบรับรอง", file: "Certificate_DataDashboard.pdf", by: "นางสาวพิมพ์ใจ ทองดี" }
                        ]
                    },
                    {
                        title: "OJT สรุปข้อมูลผู้บริหาร",
                        method: "Experiential Learning",
                        startDate: "2025-07-01",
                        due: "2025-08-31",
                        weight: 50,
                        status: "ผ่าน",
                        events: [
                            { date: "20 ส.ค.", text: "ส่ง dashboard และรายงานวิเคราะห์ฉบับสมบูรณ์", file: "Executive_Dashboard_Aug68.xlsx", by: "นางสาวพิมพ์ใจ ทองดี" },
                            { date: "21 ส.ค.", text: "ส่งสมรรถนะนี้ให้หัวหน้าตรวจสอบ", file: "IDP_Progress_FC2-061.pdf", by: "นางสาวพิมพ์ใจ ทองดี" }
                        ]
                    }
                ]
            },
            {
                cd: "FC2-062",
                n: "การวิเคราะห์ข้อมูล",
                t: "FC",
                tg: "tag-fc",
                exp: 3,
                got: 2,
                progressStatus: "rejected",
                reviewer: "นางกัญญารัตน์ ศรีวิชา",
                reviewedDate: "18 ส.ค. 68",
                reviewComment: "หลักฐานยังไม่เห็นการวิเคราะห์เชิงสรุปผล ขอให้เพิ่ม insight และแนบรายงานฉบับปรับปรุง",
                activities: [
                    {
                        title: "วิเคราะห์ชุดข้อมูลบริการ",
                        method: "Experiential Learning",
                        startDate: "2025-07-01",
                        due: "2025-08-15",
                        weight: 100,
                        status: "ผ่าน",
                        events: [
                            { date: "15 ส.ค.", text: "ส่งไฟล์วิเคราะห์ข้อมูลรอบแรก", file: "Service_Data_Analysis_v1.xlsx", by: "นางสาวพิมพ์ใจ ทองดี" },
                            { date: "18 ส.ค.", text: "หัวหน้างานส่งกลับให้แก้ไขระดับสมรรถนะ", file: "Supervisor_Feedback_FC2-062.pdf", by: "นางกัญญารัตน์ ศรีวิชา" }
                        ]
                    }
                ]
            },
            {
                cd: "CC-005",
                n: "AI Literacy",
                t: "CC",
                tg: "tag-cc",
                exp: 3,
                got: 1,
                progressStatus: "done",
                reviewer: "นางกัญญารัตน์ ศรีวิชา",
                reviewedDate: "10 ส.ค. 68",
                reviewComment: "หลักฐานครบและนำไปใช้กับงานจริงได้",
                activities: [
                    {
                        title: "ทดลองใช้ AI สรุปรายงานประชุม",
                        method: "Experiential Learning",
                        startDate: "2025-07-01",
                        due: "2025-08-10",
                        weight: 100,
                        status: "ผ่าน",
                        events: [
                            { date: "10 ส.ค.", text: "หัวหน้างานตรวจผ่านสมรรถนะนี้", file: "AI_Literacy_Result.pdf", by: "นางกัญญารัตน์ ศรีวิชา" }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: "supaporn-idp",
        n: "นางสาวสุภาพร วางแผน",
        p: "นักวิเคราะห์",
        unit: "หน่วยแผนยุทธศาสตร์",
        phase: "done" as SupervisorIDPPhase,
        gaps: [{
            cd: "FC2-062",
            n: "การวิเคราะห์ข้อมูล",
            t: "FC",
            tg: "tag-fc",
            exp: 3,
            got: 2,
            activities: [
                {
                    title: "OJT วิเคราะห์ข้อมูลผู้รับบริการ",
                    method: "Experiential Learning",
                    startDate: "2025-05-12",
                    due: "2025-07-15",
                    weight: 70,
                    status: "ผ่าน",
                    events: [
                        { date: "12 พ.ค.", text: "เริ่มทำชุดข้อมูลตัวอย่างและกำหนดตัวชี้วัด", file: "Data_OJT_Plan_2568.pdf", by: "นางสาวณัฐธิดา แก้วใส" },
                        { date: "20 มิ.ย.", text: "ส่ง dashboard วิเคราะห์ข้อมูลรอบแรก", file: "Dashboard_Review_มิ.ย.68.xlsx", by: "นางสาวณัฐธิดา แก้วใส" },
                        { date: "15 ก.ค.", text: "หัวหน้างานตรวจผลลัพธ์และให้ผ่านกิจกรรม", file: "ผลประเมิน_OJT_Data_2568.pdf", by: "นางกัญญารัตน์ ศรีวิชา" }
                    ]
                },
                {
                    title: "อบรม Data Storytelling",
                    method: "Formal Learning",
                    startDate: "2025-07-01",
                    due: "2025-07-31",
                    weight: 30,
                    status: "ผ่าน",
                    events: [
                        { date: "25 ก.ค.", text: "เข้าอบรมและส่งใบรับรองเรียบร้อย", file: "Certificate_DataStorytelling.pdf", by: "นางสาวณัฐธิดา แก้วใส" },
                        { date: "31 ก.ค.", text: "ปิดแผน IDP หลังตรวจหลักฐานครบถ้วน", file: "IDP_Completion_ณัฐธิดา.pdf", by: "นางกัญญารัตน์ ศรีวิชา" }
                    ]
                }
            ]
        }]
    }
];

const SupervisorIDPHeader: React.FC<{ currentUser?: any, supervisorUsers?: any[], onSupervisorChange?: (sso: string) => void }> = ({ currentUser, supervisorUsers, onSupervisorChange }) => {
    const supervisorName = currentUser ? `${currentUser.t}${currentUser.n}` : "ดร.สมศักดิ์ ใจงาม";
    const supervisorUnit = currentUser?.d || "หน่วยแผนยุทธศาสตร์";

    return (
        <div className="card mb16">
            <div className="cb flex ic jb g12" style={{ padding: "12px 16px", flexWrap: "nowrap" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    {supervisorUsers?.length && currentUser?.r !== "manager_dept" ? (
                        <select className="sel" style={{ width: "100%" }} value={currentUser?.sso || ""} onChange={event => onSupervisorChange?.(event.target.value)}>
                            {supervisorUsers.map(user => <option key={user.sso} value={user.sso}>{user.t}{user.n} | {user.p}</option>)}
                        </select>
                    ) : (
                        <div className="fw8 fs13">{supervisorUnit}</div>
                    )}
                </div>
                <div className="flex ic" style={{ justifyContent: "flex-end", flex: "0 0 auto", minWidth: "fit-content" }}>
                    <div className="flex ic g8">
                        <div className="av" style={{ width: "34px", height: "34px", background: "var(--orange)", fontSize: "12px" }}>{currentUser?.n?.[0] || "ส"}</div>
                        <div className="flex ic g4" style={{ flexWrap: "nowrap", whiteSpace: "nowrap" }}>
                            <div className="fw8 fs12">{supervisorName}</div>
                            <div className="muted fs11">| {currentUser?.p || "หัวหน้างาน"} | {supervisorUnit}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DetailedSupervisorIDP: React.FC<{ users: any[], currentUser?: any, supervisorUsers?: any[], onSupervisorChange?: (sso: string) => void }> = ({ users, currentUser, supervisorUsers, onSupervisorChange }) => {
    const [activeTab, setActiveTab] = useState("idp");
    const [activeDept, setActiveDept] = useState(currentUser?.r === "manager_dept" ? "ทั้งหมด" : getPrimaryDept(currentUser?.d));
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [phases, setPhases] = useState<Record<string, SupervisorIDPPhase>>({});
    const [decisions, setDecisions] = useState<Record<string, SupervisorIDPDecision>>({});
    const [feedback, setFeedback] = useState<Record<string, string>>({});
    const [progressStatuses, setProgressStatuses] = useState<Record<string, SupervisorIDPGapProgressStatus>>({});

    const managerDeptMode = currentUser?.r === "manager_dept";
    const deptOptions = managerDeptMode ? getScopeDeptOptions(users, currentUser) : getScopeDeptOptions(users, currentUser).filter(dept => dept !== "ทั้งหมด");
    const directReports = getManagerDeptScopeUsers(users, currentUser).filter(user => matchesDeptFilter(user, activeDept || "ทั้งหมด"));
    const team = directReports.map((report, index) => {
        const item = supervisorIDPMock[index % supervisorIDPMock.length];
        const mockId = report.sso || item.id;

        return {
            ...item,
            id: mockId,
            n: `${report.t}${report.n}`,
            p: report.p,
            unit: report.d,
            phase: phases[mockId] || item.phase,
            gaps: item.gaps.map((gap: any) => {
                const progressKey = buildSupervisorGapDecisionKey(mockId, gap.cd);
                return {
                    ...gap,
                    progressStatus: progressStatuses[progressKey] || deriveSupervisorIDPGapProgressStatus(gap, phases[mockId] || item.phase)
                };
            })
        };
    });
    const activeStaff = team.find(item => item.id === selectedId);
    const tabs = [
        { id: "idp", label: "จำนวนคนที่ต้องทำ IDP", hint: "ทุกคนที่มีรายการ IDP ในทีม", c: "bb" },
        { id: "notsent", label: "ยังไม่ส่งแผน", hint: "ยังไม่ส่งหรือแผนไม่ผ่าน", c: "bgr" },
        { id: "pending", label: "รอการตรวจสอบ/ยืนยัน", hint: "รอหัวหน้า ผู้บังคับบัญชา หรือคณบดี", c: "by" },
        { id: "inprogress", label: "ระหว่างดำเนินการ", hint: "ติดตามกิจกรรม", c: "bt" },
        { id: "done", label: "เสร็จสิ้น", hint: "ปิดแผนแล้ว", c: "bg" }
    ];

    const getTabCount = (id: string) => {
        if (id === "idp") return team.length;
        return team.filter(item => supervisorIDPPhaseMeta[item.phase].tab === id).length;
    };
    const visibleTeam = team.filter(item => activeTab === "idp" ? true : supervisorIDPPhaseMeta[item.phase].tab === activeTab);
    const decideGap = (staffId: string, gapCode: string, next: SupervisorIDPDecision) => {
        const key = buildSupervisorGapDecisionKey(staffId, gapCode);
        const validation = validateSupervisorGapDecision(next, feedback[key] || "");
        if (!validation.ok) {
            alert(validation.message);
            return;
        }

        setDecisions(prev => ({ ...prev, [key]: next }));
    };

    const continuePending = (staffId: string, gaps: any[], mode: "forward" | "return") => {
        const reviewState = getSupervisorIDPReviewState(staffId, gaps, decisions, feedback);
        if (reviewState.pendingGapCodes.length) {
            alert(reviewState.message || "กรุณาตรวจทุกข้อสมรรถนะก่อนส่งต่อ");
            return;
        }

        if (mode === "forward" && !reviewState.canForward) {
            alert("ยังส่งต่อไม่ได้ เพราะมีข้อสมรรถนะที่ไม่ผ่าน");
            return;
        }

        if (mode === "return" && reviewState.nextPhase !== "rejected") {
            alert("ไม่มีข้อสมรรถนะที่ต้องส่งกลับ");
            return;
        }

        if (reviewState.message && mode === "return" && reviewState.message.includes("ข้อเสนอแนะ")) {
            alert(reviewState.message);
            return;
        }

        setPhases(prev => ({ ...prev, [staffId]: mode === "forward" ? "forwarded" : "rejected" }));
        setSelectedId(null);
        setActiveTab(mode === "forward" ? "pending" : "notsent");
    };

    const decideProgressGap = (staffId: string, gapCode: string, next: "done" | "rejected") => {
        const key = buildSupervisorGapDecisionKey(staffId, gapCode);
        if (next === "rejected" && !(feedback[key] || "").trim()) {
            alert("กรุณาระบุเหตุผลหรือข้อเสนอแนะก่อนส่งกลับ");
            return;
        }

        setProgressStatuses(prev => ({ ...prev, [key]: next }));
    };

    if (activeStaff) {
        const meta = supervisorIDPPhaseMeta[activeStaff.phase];
        const pendingPlan = activeStaff.phase === "pending";
        const forwardedPlan = activeStaff.phase === "forwarded";
        const deanConfirmPlan = activeStaff.phase === "deanConfirm";
        const rejectedPlan = activeStaff.phase === "rejected";
        const timelineMode = activeStaff.phase === "inprogress" || activeStaff.phase === "done";

        return (
            <>
                <SupervisorIDPHeader currentUser={currentUser} supervisorUsers={supervisorUsers} onSupervisorChange={onSupervisorChange} />
                <div className="flex ic jb mb16" style={{ flexWrap: "wrap", gap: "10px" }}>
                    <div className="flex ic g8">
                        <button className="btn btn-s btn-sm" onClick={() => setSelectedId(null)}>กลับหน้าติดตามทีม</button>
                        <span className="muted">/</span>
                        <span className="fw7 fs13">{activeStaff.n}</span>
                    </div>
                    <span className={`b ${meta.badge}`}>{meta.label}</span>
                </div>

                <div className="card mb14" style={{ borderLeft: `4px solid ${timelineMode ? "var(--teal)" : pendingPlan ? "var(--yellow)" : "var(--red)"}` }}>
                    <div className="cb flex ic g12" style={{ flexWrap: "wrap" }}>
                        <div className="av" style={{ width: "44px", height: "44px", background: "var(--navy)", fontSize: "16px" }}>{activeStaff.n[0]}</div>
                        <div style={{ flex: 1 }}>
                            <div className="fw8 fs15">{activeStaff.n}</div>
                            <div className="muted fs12">{activeStaff.p} · {activeStaff.unit}</div>
                        </div>
                        {activeStaff.sent && <div className="muted fs12">ส่งแผน {activeStaff.sent}</div>}
                    </div>
                </div>

                {activeStaff.phase === "notsent" && (
                    <div className="card">
                        <div className="ch"><div className="ct">ยังไม่ส่งแผน IDP</div><div className="cs">แสดงเฉพาะ Competency Gap ที่ทำไว้แล้ว</div></div>
                        <GapRows gaps={activeStaff.gaps} phase={activeStaff.phase} />
                    </div>
                )}

                {rejectedPlan && (
                    <div className="card">
                        <div className="ch"><div className="ct">แผนไม่ผ่าน</div><div className="cs">บุคลากรต้องกลับไปแก้แผนที่ไม่ผ่านก่อนส่งใหม่</div></div>
                        <GapRows gaps={activeStaff.gaps} decisions={decisions} staffId={activeStaff.id} feedback={feedback} phase={activeStaff.phase} />
                    </div>
                )}

                {forwardedPlan && (
                    <div className="card">
                        <div className="ch"><div className="ct">แผนผ่านการตรวจจากหัวหน้างานแล้ว</div><div className="cs">อยู่ระหว่างรอผู้บังคับบัญชาตรวจสอบต่อ</div></div>
                        <GapRows gaps={activeStaff.gaps} decisions={decisions} staffId={activeStaff.id} feedback={feedback} phase={activeStaff.phase} />
                    </div>
                )}

                {deanConfirmPlan && (
                    <div className="card">
                        <div className="ch"><div className="ct">แผนผ่านการตรวจจากผู้บังคับบัญชาแล้ว</div><div className="cs">อยู่ระหว่างรอคณบดียืนยัน</div></div>
                        <GapRows gaps={activeStaff.gaps} decisions={decisions} staffId={activeStaff.id} feedback={feedback} phase={activeStaff.phase} />
                    </div>
                )}

                {pendingPlan && (
                    <>
                        {(() => {
                            const reviewState = getSupervisorIDPReviewState(activeStaff.id, activeStaff.gaps, decisions, feedback);
                            const hasRejected = reviewState.rejectedGapCodes.length > 0;
                            return (
                                <div className="card mb14 supervisor-review-brief">
                                    <div className="cb flex ic jb g12 supervisor-review-brief-inner">
                                        <div>
                                            <div className="supervisor-review-title">ตรวจแผนรายข้อสมรรถนะ</div>
                                            <div className="supervisor-review-subtitle">
                                                ตรวจครบทุกข้อก่อน จึงค่อยส่งต่อท้ายหน้าได้ หากมีข้อไม่ผ่านต้องส่งกลับให้แก้ไข
                                            </div>
                                        </div>
                                        <div className="flex ic g8" style={{ flexWrap: "wrap" }}>
                                            <span className="b bg">{activeStaff.gaps.length - reviewState.pendingGapCodes.length}/{activeStaff.gaps.length} ตรวจแล้ว</span>
                                            {hasRejected && <span className="b br">{reviewState.rejectedGapCodes.length} ข้อไม่ผ่าน</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                        {activeStaff.gaps.map((gap: any) => {
                            const activities = getSupervisorIDPActivities(gap, activeStaff.phase);
                            const totalWeight = activities.reduce((sum: number, activity: any) => sum + Number(activity.weight || 0), 0);
                            const weightNotice = getSupervisorIDPWeightNotice(totalWeight);
                            const gapDecisionKey = buildSupervisorGapDecisionKey(activeStaff.id, gap.cd);
                            const decision = decisions[gapDecisionKey];
                            return (
                                <div key={gap.cd} className="card mb14 supervisor-review-gap">
                                    <div className="ch supervisor-review-gap-head">
                                        <div className="flex ic g8 supervisor-review-gap-title-row">
                                            <span className={gap.tg}>{gap.t}</span>
                                            <div className="ct supervisor-review-gap-title">{gap.n}</div>
                                            <span className="supervisor-review-meta">คาดหวัง {gap.exp} · ได้ {gap.got} · <span className="rc fw7">Gap {gap.got - gap.exp}</span></span>
                                            <span className={`b ${totalWeight === 100 ? "bg" : totalWeight > 100 ? "br" : "bb"}`}>{totalWeight}/100%</span>
                                            {weightNotice && <span className={`b ${weightNotice.badge}`}>{weightNotice.label}</span>}
                                        </div>
                                        {decision && <span className={`b ${decision === "approved" ? "bg" : "br"}`}>{decision === "approved" ? "ข้อสมรรถนะผ่าน" : "ข้อสมรรถนะไม่ผ่าน"}</span>}
                                    </div>
                                    <div className="cb supervisor-review-gap-body">
                                        <div className="supervisor-review-section-label">เป้าหมายการพัฒนา</div>
                                        <div className="supervisor-review-goal">{gap.goal}</div>
                                        <div className="supervisor-review-activity-list">
                                            {activities.map((activity: any) => (
                                                <SupervisorIDPActivityRow key={`${gap.cd}-${activity.title}`} activity={activity} />
                                            ))}
                                        </div>
                                        <div className="supervisor-review-comment-block">
                                            <label className="lbl supervisor-review-comment-label">
                                                ข้อเสนอแนะของข้อสมรรถนะนี้ {decision === "rejected" && <span style={{ color: "var(--red)" }}>*</span>}
                                            </label>
                                            <textarea
                                                className="ta supervisor-review-textarea"
                                                value={feedback[gapDecisionKey] || ""}
                                                placeholder="ระบุข้อเสนอแนะรวมของข้อนี้ โดยเฉพาะเมื่อเลือกไม่ผ่าน"
                                                onChange={event => setFeedback(prev => ({ ...prev, [gapDecisionKey]: event.target.value }))}
                                            />
                                            <div className="flex g8 supervisor-review-actions">
                                                <button className="btn btn-g" onClick={() => decideGap(activeStaff.id, gap.cd, "approved")}>ผ่านข้อสมรรถนะ</button>
                                                <button className="btn btn-r" onClick={() => decideGap(activeStaff.id, gap.cd, "rejected")}>ข้อสมรรถนะไม่ผ่าน</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {(() => {
                            const reviewState = getSupervisorIDPReviewState(activeStaff.id, activeStaff.gaps, decisions, feedback);
                            const hasRejected = reviewState.rejectedGapCodes.length > 0;
                            return (
                                <div className="card supervisor-review-footer">
                                    <div className="cb flex ic jb g12 supervisor-review-footer-inner">
                                        <div>
                                            <div className="supervisor-review-footer-title">สรุปผลการตรวจ</div>
                                            <div className={`fs12 ${reviewState.canForward ? "gcc" : hasRejected ? "rc" : "muted"}`} style={{ marginTop: "3px" }}>
                                                {reviewState.canForward
                                                    ? "ทุกข้อผ่านแล้ว สามารถส่งต่อผู้บังคับบัญชาได้"
                                                    : hasRejected
                                                        ? "มีข้อไม่ผ่าน ต้องส่งกลับให้บุคลากรแก้ไข"
                                                        : reviewState.message}
                                            </div>
                                        </div>
                                        <div className="flex g8" style={{ flexWrap: "wrap" }}>
                                            {hasRejected && (
                                                <button className="btn btn-r" onClick={() => continuePending(activeStaff.id, activeStaff.gaps, "return")}>
                                                    ส่งกลับให้แก้ไข
                                                </button>
                                            )}
                                            <button
                                                className="btn btn-p"
                                                disabled={!reviewState.canForward}
                                                style={{ opacity: reviewState.canForward ? 1 : 0.45, cursor: reviewState.canForward ? "pointer" : "not-allowed" }}
                                                onClick={() => continuePending(activeStaff.id, activeStaff.gaps, "forward")}
                                            >
                                                ส่งต่อผู้บังคับบัญชา
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </>
                )}

                {timelineMode && activeStaff.gaps.map((gap: any) => {
                    const progress = getSupervisorIDPGapProgressSummary(gap, activeStaff.phase);
                    const progressMeta = supervisorIDPGapProgressMeta[progress.status];
                    const reviewKey = buildSupervisorGapDecisionKey(activeStaff.id, gap.cd);
                    const canReview = activeStaff.phase === "inprogress" && progress.status === "submitted";
                    const locked = !canReview;
                    return (
                        <div key={gap.cd} className="card mb14" style={{ overflow: "hidden" }}>
                            <div className="ch" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
                                <div className="flex ic g8" style={{ flexWrap: "wrap" }}>
                                    <span className={gap.tg}>{gap.t}</span>
                                    <div className="ct">{gap.n}</div>
                                    <span className="muted fs12">{gap.cd} · Gap {gap.got - gap.exp}</span>
                                    <span className="b bgr">{progress.doneCount}/{progress.totalCount} กิจกรรมเสร็จแล้ว</span>
                                </div>
                                <span className={`b ${progressMeta.badge}`}>{progressMeta.label}</span>
                            </div>
                            <div className="cb" style={{ padding: "12px" }}>
                                {progress.activities.map((activity: any) => <ActivityTimeline key={activity.title} activity={activity} />)}

                                {progress.status === "rejected" && (
                                    <div style={{ background: "var(--red-bg)", border: "1px solid #fecaca", borderRadius: "var(--r)", padding: "12px 14px", marginBottom: "12px" }}>
                                        <div className="fw8 fs13 rc">ส่งกลับให้แก้ไขแล้ว</div>
                                        <div className="muted fs12 mt4">{gap.reviewer || "หัวหน้างาน"}{gap.reviewedDate ? ` · ${gap.reviewedDate}` : ""}</div>
                                        <div className="fs12 mt8" style={{ background: "#fff", border: "1px solid #fecaca", borderRadius: "6px", padding: "8px 10px" }}>
                                            {feedback[reviewKey] || gap.reviewComment || "รอลูกน้องแก้ไขและส่งตรวจอีกครั้ง"}
                                        </div>
                                    </div>
                                )}

                                {progress.status === "done" && (
                                    <div style={{ background: "var(--green-bg)", border: "1px solid var(--green-md)", borderRadius: "var(--r)", padding: "12px 14px", marginBottom: "12px" }}>
                                        <div className="fw8 fs13 gcc">ตรวจผ่านสมรรถนะนี้แล้ว</div>
                                        <div className="muted fs12 mt4">{gap.reviewer || "หัวหน้างาน"}{gap.reviewedDate ? ` · ${gap.reviewedDate}` : ""}</div>
                                        {(feedback[reviewKey] || gap.reviewComment) && <div className="fs12 mt8">{feedback[reviewKey] || gap.reviewComment}</div>}
                                    </div>
                                )}

                                {activeStaff.phase === "inprogress" && progress.status !== "done" && progress.status !== "rejected" && (
                                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                                        <div className="flex ic jb g12 mb10" style={{ flexWrap: "wrap" }}>
                                            <div>
                                                <div className="fw8 fs13">ตรวจผลระดับสมรรถนะ</div>
                                                <div className={`fs12 ${canReview ? "gcc" : "muted"}`} style={{ marginTop: "3px" }}>
                                                    {canReview ? "ลูกน้องส่งตรวจแล้ว สามารถกดผ่านหรือส่งกลับได้" : "รอลูกน้องทำกิจกรรมให้ครบและกดส่งตรวจ"}
                                                </div>
                                            </div>
                                        </div>
                                        <textarea
                                            className="ta"
                                            style={{ minHeight: "56px", fontSize: "12px", opacity: locked ? 0.65 : 1 }}
                                            disabled={locked}
                                            value={feedback[reviewKey] || ""}
                                            placeholder="ข้อเสนอแนะ / เหตุผลเมื่อส่งกลับ"
                                            onChange={event => setFeedback(prev => ({ ...prev, [reviewKey]: event.target.value }))}
                                        />
                                        <div className="flex g8 mt10" style={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
                                            <button
                                                className="btn btn-g"
                                                disabled={locked}
                                                style={{ opacity: locked ? 0.42 : 1, cursor: locked ? "not-allowed" : "pointer" }}
                                                onClick={() => decideProgressGap(activeStaff.id, gap.cd, "done")}
                                            >
                                                ผ่านสมรรถนะนี้
                                            </button>
                                            <button
                                                className="btn btn-r"
                                                disabled={locked}
                                                style={{ opacity: locked ? 0.42 : 1, cursor: locked ? "not-allowed" : "pointer" }}
                                                onClick={() => decideProgressGap(activeStaff.id, gap.cd, "rejected")}
                                            >
                                                ส่งกลับให้แก้ไข
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </>
        );
    }

    return (
        <>
            <SupervisorIDPHeader currentUser={currentUser} supervisorUsers={supervisorUsers} onSupervisorChange={onSupervisorChange} />
            <div className="mb16 supervisor-idp-page-head">
                <div className="sec-t">IDP & ติดตามทีม</div>
                <div className="sec-s">{managerDeptMode ? "ติดตามแผน IDP ของหัวหน้าหน่วยงานและบุคลากรในสายบังคับบัญชา" : "ติดตามความก้าวหน้าแผนพัฒนาบุคลากรในมุมมองหัวหน้างาน"}</div>
            </div>
            {managerDeptMode && (
                <div className="card mb14">
                    <div className="cb flex ic jb g12" style={{ flexWrap: "wrap", padding: "12px 16px" }}>
                        <div className="flex ic g8" style={{ flexWrap: "wrap" }}>
                            <span className="fs12 fw7 muted">หน่วยงาน:</span>
                            <select className="sel" style={{ maxWidth: "360px" }} value={activeDept || "ทั้งหมด"} onChange={event => setActiveDept(event.target.value)}>
                                {deptOptions.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                            </select>
                        </div>
                        
                    </div>
                </div>
            )}
            <div
                className="mb14 supervisor-idp-stat-grid"
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                    gap: "10px"
                }}
            >
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        className="sc supervisor-idp-stat-card"
                        style={{
                            textAlign: "left",
                            cursor: "pointer",
                            borderTop: `3px solid ${tab.id === "idp" ? "var(--navy)" : tab.id === "notsent" ? "var(--text3)" : tab.id === "pending" ? "var(--yellow)" : tab.id === "inprogress" ? "var(--blue)" : "var(--green)"}`,
                            borderColor: activeTab === tab.id ? "var(--blue)" : "var(--border)",
                            fontFamily: "inherit"
                        }}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <div className="sl supervisor-idp-stat-label">{tab.label}</div>
                        <div className={`sv supervisor-idp-stat-value ${tab.id === "idp" ? "" : tab.id === "notsent" ? "" : tab.id === "pending" ? "yc" : tab.id === "inprogress" ? "bc" : "gcc"}`}>{getTabCount(tab.id)}</div>
                        <div className="ss muted supervisor-idp-stat-unit">{"คน"}</div>
                    </button>
                ))}
            </div>

            <div className="tab-bar">
                {tabs.map(tab => (
                    <div key={tab.id} className={`tab ${activeTab === tab.id ? "on" : ""}`} onClick={() => setActiveTab(tab.id)}>
                        {tab.label} <span className={`b ${tab.c}`} style={{ marginLeft: "4px" }}>{getTabCount(tab.id)}</span>
                    </div>
                ))}
            </div>

            {visibleTeam.map(staff => {
                const meta = supervisorIDPPhaseMeta[staff.phase];
                const canReview = staff.phase === "pending";
                return (
                    <div key={staff.id} className="card mb12 supervisor-idp-staff-card" style={{ borderLeft: `4px solid ${canReview ? "var(--orange)" : "var(--border)"}` }}>
                        <div className="cb flex ic g12 supervisor-idp-staff-card-inner">
                            <div className="av" style={{ width: "44px", height: "44px", background: "var(--navy)", fontSize: "16px" }}>{staff.n[0]}</div>
                            <div style={{ flex: 1, minWidth: "220px" }}>
                                <div className="fw8 supervisor-idp-staff-name">{staff.n}</div>
                                <div className="muted supervisor-idp-staff-meta">{staff.p} · {staff.unit} · <span className={`b ${meta.badge}`}>{meta.label}</span></div>
                            </div>
                            <button className={`btn ${canReview ? "btn-p" : "btn-s"} btn-sm`} onClick={() => setSelectedId(staff.id)}>{canReview ? "ตรวจสอบ" : "ดูข้อมูล"}</button>
                        </div>
                    </div>
                );
            })}

            {visibleTeam.length === 0 && <div className="card"><div className="cb muted" style={{ textAlign: "center", padding: "30px" }}>ไม่มีรายการในสถานะนี้</div></div>}
        </>
    );
};

const SupervisorIDPActivityRow: React.FC<{ activity: any, decision?: SupervisorIDPDecision, children?: React.ReactNode }> = ({ activity, decision, children }) => {
    const status = supervisorIDPActivityStatusMeta[activity.status as SupervisorIDPActivityStatus] || supervisorIDPActivityStatusMeta.pending;
    const displayStatus = decision
        ? { label: decision === "approved" ? "ผ่าน" : "ไม่ผ่าน", badge: decision === "approved" ? "bg" : "br" }
        : status;

    return (
        <div className="supervisor-idp-activity-row">
            <div className="flex ic jb g8" style={{ flexWrap: "wrap" }}>
                <div style={{ minWidth: "180px", flex: 1 }}>
                    <div className="fw7 supervisor-idp-activity-title">{activity.title}</div>
                    <div className="muted supervisor-idp-activity-meta">{activity.method} · {activity.startDate || "-"} ถึง {activity.due || "-"} · น้ำหนัก {activity.weight || "-"}%</div>
                    {activity.note && <div className="muted supervisor-idp-activity-note">คำอธิบายกิจกรรม: {activity.note}</div>}
                </div>
                <span className={`b ${displayStatus.badge}`}>{displayStatus.label}</span>
            </div>
            {children}
        </div>
    );
};

const GapRows: React.FC<{ gaps: any[], decisions?: Record<string, SupervisorIDPDecision>, staffId?: string, feedback?: Record<string, string>, phase?: SupervisorIDPPhase }> = ({ gaps, decisions, staffId, feedback, phase }) => (
    <div className="cb" style={{ paddingTop: "8px" }}>
        {gaps.map(gap => {
            const key = staffId ? `${staffId}:${gap.cd}` : "";
            const decision = key ? decisions?.[key] : undefined;
            const activities = getSupervisorIDPActivities(gap, phase);
            const totalWeight = activities.reduce((sum: number, activity: any) => sum + Number(activity.weight || 0), 0);
            const weightNotice = getSupervisorIDPWeightNotice(totalWeight);
            return (
                <div key={gap.cd} style={{ padding: "12px 0", borderBottom: "1px dashed var(--border)" }}>
                    <div className="flex ic g12" style={{ flexWrap: "wrap" }}>
                        <span className={gap.tg}>{gap.t}</span>
                        <div style={{ flex: 1, minWidth: "180px" }}>
                            <div className="fw7 fs13">{gap.n}</div>
                            <div className="muted fs11">ระดับคาดหวัง {gap.exp} · ระดับที่ได้ {gap.got}</div>
                            {gap.goal && <div className="muted fs11 mt4">เป้าหมาย: {gap.goal}</div>}
                            {decision === "rejected" && feedback?.[key] && <div className="fs11 rc mt4">เหตุผล: {feedback[key]}</div>}
                        </div>
                        <span className="fw8 rc fs13">Gap {gap.got - gap.exp}</span>
                        {activities.length > 0 && <span className={`b ${totalWeight === 100 ? "bg" : totalWeight > 100 ? "br" : "bb"}`}>{totalWeight}/100%</span>}
                        {weightNotice && activities.length > 0 && <span className={`b ${weightNotice.badge}`}>{weightNotice.label}</span>}
                    </div>
                    {activities.length > 0 && (
                        <div className="mt10" style={{ display: "grid", gap: "8px" }}>
                            {activities.map((activity: any) => <SupervisorIDPActivityRow key={`${gap.cd}-${activity.title}`} activity={activity} />)}
                        </div>
                    )}
                </div>
            );
        })}
    </div>
);

const ActivityTimeline: React.FC<{ activity: any }> = ({ activity }) => {
    const status = supervisorIDPActivityStatusMeta[activity.status as SupervisorIDPActivityStatus] || supervisorIDPActivityStatusMeta.pending;
    const borderColor = activity.status === "approved" ? "var(--green)" : activity.status === "rejected" ? "var(--red)" : "var(--yellow)";

    return (
        <div style={{ borderLeft: `4px solid ${borderColor}`, borderRadius: "var(--r)", background: "#fbfdff", padding: "12px 14px", marginBottom: "12px" }}>
            <div className="flex ic jb mb8" style={{ flexWrap: "wrap", gap: "8px" }}>
                <div className="flex ic g8" style={{ flexWrap: "wrap" }}>
                    <span className="fw8 fs13">{activity.title}</span>
                    <span className="muted fs11">{activity.method} · {activity.startDate || "-"} ถึง {activity.due || "-"} · น้ำหนัก {activity.weight || "-"}%</span>
                </div>
                <span className={`b ${status.badge}`}>{status.label}</span>
            </div>
            {(activity.events || []).map((event: any) => (
                <div key={`${activity.title}-${event.date}-${event.text}`} style={{ display: "grid", gridTemplateColumns: "58px minmax(220px, 1fr) 150px", gap: "10px", borderTop: "1px solid var(--border)", padding: "9px 0" }}>
                    <span className="muted fs11">{event.date}</span>
                    <div>
                        <div className={`fs12 ${event.text.includes("ผ่าน") ? "gcc fw7" : ""}`}>{event.text}</div>
                        <span className="b bgr mt4" style={{ whiteSpace: "normal" }}>{event.file}</span>
                    </div>
                    <span className="muted fs11" style={{ textAlign: "right" }}>by {event.by}</span>
                </div>
            ))}
        </div>
    );
};

type DeptHeadIDPPhase = "pendingPlan" | "deanPlan" | "inprogress" | "pendingActivity" | "done";

const deptHeadIDPPhaseMeta: Record<DeptHeadIDPPhase, { label: string; badge: string; tab: string }> = {
    pendingPlan: { label: "รอหัวหน้าฝ่ายตรวจแผน", badge: "bo", tab: "pending" },
    deanPlan: { label: "รอคณบดียืนยันแผน", badge: "bb", tab: "pending" },
    inprogress: { label: "ระหว่างดำเนินการ", badge: "bt", tab: "inprogress" },
    pendingActivity: { label: "รอหัวหน้าฝ่ายตรวจกิจกรรม", badge: "bo", tab: "pending" },
    done: { label: "เสร็จสิ้น", badge: "bg", tab: "done" }
};

const deptHeadIDPMock = {
    unit: [
        {
            id: "pimjai",
            n: "นางสาวพิมพ์ใจ ทองดี",
            p: "นักวิเคราะห์",
            home: "หน่วยแผนยุทธศาสตร์",
            phase: "pendingPlan" as DeptHeadIDPPhase,
            sent: "15 พ.ค. 68",
            lv1: "หัวหน้างานอนุมัติแล้ว 16 พ.ค. 68",
            gaps: [
                { cd: "FC2-061", n: "การใช้เทคโนโลยีดิจิทัล", t: "FC", tg: "tag-fc", exp: 4, got: 3, goal: "พัฒนาทักษะการใช้ Excel ขั้นสูง", acts: ["เข้าร่วมกิจกรรม Team Building ประจำคณะ"] }
            ]
        },
        {
            id: "supaporn",
            n: "นางสาวสุภาพร วางแผน",
            p: "นักวิเคราะห์",
            home: "หน่วยแผนยุทธศาสตร์",
            phase: "deanPlan" as DeptHeadIDPPhase,
            lv1: "หัวหน้างานอนุมัติแล้ว",
            gaps: [{ cd: "CC-005", n: "AI Literacy", t: "CC", tg: "tag-cc", exp: 4, got: 1, goal: "ใช้ AI ช่วยวิเคราะห์งานแผนอย่างรับผิดชอบ", acts: ["สัมมนาวิชาการระดับชาติ"] }]
        },
        {
            id: "kengkaj",
            n: "นายเก่งกาจ พัฒนา",
            p: "เจ้าหน้าที่แผนงาน",
            home: "หน่วยแผนยุทธศาสตร์",
            phase: "inprogress" as DeptHeadIDPPhase,
            gaps: [{ cd: "FC2-062", n: "การวิเคราะห์ข้อมูล", t: "FC", tg: "tag-fc", exp: 3, got: 2, goal: "จัดทำรายงานวิเคราะห์ข้อมูลประจำเดือน", acts: ["OJT Dashboard แผนงาน", "Mentoring วิเคราะห์ข้อมูล"] }]
        },
        {
            id: "warisa",
            n: "นางวริศา หลักฐาน",
            p: "นักวิชาการศึกษา",
            home: "หน่วยพัฒนานักศึกษา",
            phase: "pendingActivity" as DeptHeadIDPPhase,
            gaps: [{ cd: "CC-003", n: "การทำงานเป็นทีม", t: "CC", tg: "tag-cc", exp: 3, got: 2, goal: "ประสานกิจกรรมข้ามหน่วยงานได้คล่องขึ้น", acts: ["Team Activity Program", "รายงาน Reflection"] }]
        }
    ],
    branch: [
        {
            id: "arun",
            n: "อ.ดร.อรุณ วิชาการ",
            p: "อาจารย์",
            home: "สาขาวิชาวิศวกรรมโยธา",
            phase: "pendingPlan" as DeptHeadIDPPhase,
            sent: "18 พ.ค. 68",
            lv1: "หัวหน้าสาขาอนุมัติแล้ว",
            gaps: [{ cd: "FC1-011", n: "การสอนและถ่ายทอด", t: "FC", tg: "tag-fc", exp: 4, got: 3, goal: "ออกแบบกิจกรรม active learning ในรายวิชา", acts: ["Workshop Teaching Design"] }]
        },
        {
            id: "daranee",
            n: "ผศ.ดร.ดารณี วิจัย",
            p: "อาจารย์",
            home: "สาขาวิชาวิศวกรรมคอมพิวเตอร์",
            phase: "done" as DeptHeadIDPPhase,
            gaps: [{ cd: "CC-005", n: "AI Literacy", t: "CC", tg: "tag-cc", exp: 4, got: 3, goal: "ใช้ AI ในงานวิจัยและการสอน", acts: ["Research Clinic", "Teaching Reflection"] }]
        }
    ]
};

const DeptHeadIDP: React.FC = () => {
    const [scope, setScope] = useState<"unit" | "branch">("unit");
    const [activeHome, setActiveHome] = useState("");
    const [activeTab, setActiveTab] = useState("pending");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [phases, setPhases] = useState<Record<string, DeptHeadIDPPhase>>({});
    const [feedback, setFeedback] = useState<Record<string, string>>({});

    const scopePeople = deptHeadIDPMock[scope].map(person => ({ ...person, phase: phases[person.id] || person.phase }));
    const homes = [...new Set(scopePeople.map(person => person.home))];
    const selectedHome = activeHome && homes.includes(activeHome) ? activeHome : homes[0];
    const people = scopePeople.filter(person => person.home === selectedHome);
    const selected = people.find(person => person.id === selectedId);
    const tabs = [
        { id: "pending", label: "รอการตรวจ/ยืนยัน", c: "bo" },
        { id: "inprogress", label: "ระหว่างดำเนินการ", c: "bt" },
        { id: "done", label: "เสร็จสิ้น", c: "bg" }
    ];
    const count = (id: string) => people.filter(person => deptHeadIDPPhaseMeta[person.phase].tab === id).length;
    const visible = people.filter(person => deptHeadIDPPhaseMeta[person.phase].tab === activeTab);

    const approve = (id: string) => {
        setPhases(prev => ({ ...prev, [id]: "deanPlan" }));
        setSelectedId(null);
    };

    const returnPlan = (id: string) => {
        if (!feedback[id]?.trim()) {
            alert("กรุณาระบุข้อเสนอแนะก่อนส่งแผนกลับ");
            return;
        }
        alert("ส่งแผนกลับให้บุคลากรแก้ไขแล้ว");
    };

    if (selected) {
        const meta = deptHeadIDPPhaseMeta[selected.phase];
        const canPlanReview = selected.phase === "pendingPlan";
        const canActivityReview = selected.phase === "pendingActivity";
        return (
            <>
                <div className="flex ic jb mb16" style={{ flexWrap: "wrap", gap: "10px" }}>
                    <button className="btn btn-s btn-sm" onClick={() => setSelectedId(null)}>กลับรายการหัวหน้าฝ่าย</button>
                    <span className={`b ${meta.badge}`}>{meta.label}</span>
                </div>
                <div className="card mb14">
                    <div className="cb flex ic g12" style={{ flexWrap: "wrap" }}>
                        <div className="av" style={{ width: "44px", height: "44px", background: "var(--teal)", fontSize: "16px" }}>{selected.n[0]}</div>
                        <div style={{ flex: 1 }}>
                            <div className="fw8 fs15">{selected.n}</div>
                            <div className="muted fs12">{selected.p} · {selected.home}</div>
                            {selected.lv1 && <div className="fs11 tc mt4">{selected.lv1}</div>}
                        </div>
                        {selected.sent && <span className="muted fs12">ส่งแผน {selected.sent}</span>}
                    </div>
                </div>
                {selected.gaps.map(gap => (
                    <div key={gap.cd} className="card mb14" style={{ overflow: "hidden" }}>
                        <div className="ch" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
                            <div className="flex ic g8">
                                <span className={gap.tg}>{gap.t}</span>
                                <div className="ct">{gap.n}</div>
                                <span className="muted fs12">คาดหวัง {gap.exp} · ได้ {gap.got} · <span className="rc fw7">Gap {gap.got - gap.exp}</span></span>
                            </div>
                        </div>
                        <div className="cb">
                            <div className="fs12 fw7 mb4">เป้าหมายการพัฒนา</div>
                            <div className="muted fs13 mb12" style={{ padding: "10px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--r)" }}>{gap.goal}</div>
                            <div className="flex g6 mb12" style={{ flexWrap: "wrap" }}>{gap.acts.map(act => <span key={act} className="b bb">{act}</span>)}</div>
                            {(canPlanReview || canActivityReview) && (
                                <>
                                    <textarea className="ta" style={{ minHeight: "46px" }} value={feedback[selected.id] || ""} placeholder="ข้อเสนอแนะ / เหตุผลเมื่อส่งกลับ" onChange={event => setFeedback(prev => ({ ...prev, [selected.id]: event.target.value }))} />
                                    <div className="flex g6 mt8">
                                        <button className="btn btn-p btn-sm" onClick={() => canPlanReview ? approve(selected.id) : setPhases(prev => ({ ...prev, [selected.id]: "done" }))}>{canPlanReview ? "ผ่านแผนและส่งต่อคณบดี" : "ผ่านกิจกรรม"}</button>
                                        <button className="btn btn-r btn-sm" onClick={() => returnPlan(selected.id)}>ส่งกลับ</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </>
        );
    }

    return (
        <>
            <div className="mb16">
                <div className="sec-t">IDP & ติดตามทีม</div>
                <div className="sec-s">หัวหน้าฝ่ายตรวจแผนและหลักฐานที่ส่งต่อจากหัวหน้างาน</div>
            </div>
            <div className="card mb14">
                <div className="cb flex ic jb" style={{ flexWrap: "wrap", gap: "10px" }}>
                    <div className="flex ic g6" style={{ flexWrap: "wrap" }}>
                        <button className={`btn ${scope === "unit" ? "btn-p" : "btn-s"} btn-sm`} onClick={() => { setScope("unit"); setActiveHome(""); setSelectedId(null); }}>หน่วยงาน</button>
                        <button className={`btn ${scope === "branch" ? "btn-p" : "btn-s"} btn-sm`} onClick={() => { setScope("branch"); setActiveHome(""); setSelectedId(null); }}>สาขาวิชา</button>
                        <select className="ta" style={{ width: "fit-content", minWidth: "220px", padding: "7px 10px", fontSize: "12px" }} value={selectedHome} onChange={event => { setActiveHome(event.target.value); setSelectedId(null); }}>
                            {homes.map(home => <option key={home} value={home}>{home}</option>)}
                        </select>
                    </div>
                    <div className="muted fs12">{scope === "unit" ? "รายการจากหน่วยงานภายใต้ฝ่าย" : "รายการจากสาขาวิชา"} · {selectedHome}</div>
                </div>
            </div>
            <div className="g3 mb14">
                {tabs.map(tab => (
                    <button key={tab.id} className="sc" type="button" style={{ textAlign: "left", cursor: "pointer", borderColor: activeTab === tab.id ? "var(--blue)" : "var(--border)", fontFamily: "inherit" }} onClick={() => setActiveTab(tab.id)}>
                        <div className="sl">{tab.label}</div>
                        <div className="sv"><span className={`b ${tab.c}`}>{count(tab.id)}</span></div>
                    </button>
                ))}
            </div>
            <div className="tab-bar">
                {tabs.map(tab => <div key={tab.id} className={`tab ${activeTab === tab.id ? "on" : ""}`} onClick={() => setActiveTab(tab.id)}>{tab.label} <span className={`b ${tab.c}`}>{count(tab.id)}</span></div>)}
            </div>
            {visible.map(person => {
                const meta = deptHeadIDPPhaseMeta[person.phase];
                const actionable = person.phase === "pendingPlan" || person.phase === "pendingActivity";
                return (
                    <div key={person.id} className="card mb12">
                        <div className="cb flex ic g12" style={{ flexWrap: "wrap" }}>
                            <div className="av" style={{ width: "40px", height: "40px", background: "var(--teal)", fontSize: "14px" }}>{person.n[0]}</div>
                            <div style={{ flex: 1, minWidth: "220px" }}>
                                <div className="fw8 fs14">{person.n}</div>
                                <div className="muted fs12">{person.p} · {person.home}</div>
                            </div>
                            <span className={`b ${meta.badge}`}>{meta.label}</span>
                            <button className={`btn ${actionable ? "btn-p" : "btn-s"} btn-sm`} onClick={() => setSelectedId(person.id)}>{actionable ? "ตรวจสอบ" : "ดูข้อมูล"}</button>
                        </div>
                    </div>
                );
            })}
            {visible.length === 0 && <div className="card"><div className="cb muted" style={{ textAlign: "center", padding: "30px" }}>ไม่มีรายการในสถานะนี้</div></div>}
        </>
    );
};

export const TeamIDP: React.FC<{ users: any[], detailed?: boolean, department?: boolean, currentUser?: any, supervisorUsers?: any[], onSupervisorChange?: (sso: string) => void }> = ({ users, detailed = false, department = false, currentUser, supervisorUsers, onSupervisorChange }) => {
    if (department) return <DeptHeadIDP />;
    return detailed ? <DetailedSupervisorIDP users={users} currentUser={currentUser} supervisorUsers={supervisorUsers} onSupervisorChange={onSupervisorChange} /> : <LegacyTeamIDP users={users} />;
};
