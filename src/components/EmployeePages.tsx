import React, { useEffect, useState } from 'react';
import { IDP_GAPS_DATA, IDP_ACTIVITIES_DATA, INITIAL_COMPETENCIES } from '../data';
import {
    buildEmployeeIDPCatalogPatch,
    deriveEmployeeIDPProgressStatus,
    getEmployeeIDPActivityStatus,
    getEmployeeIDPProgressStatusMeta,
    getEmployeeIDPProgressSummary,
    getEmployeeIDPRejectionNotice,
    isEmployeeIDPActivityDone,
    type EmployeeIDPProgressStatus
} from './employee-idp-rules';

const readEmployeeStorage = <T,>(key: string, fallback: T): T => {
    if (typeof window === "undefined") return fallback;
    try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) as T : fallback;
    } catch {
        return fallback;
    }
};

const writeEmployeeStorage = (key: string, value: unknown) => {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Keep mock flows usable even if storage is unavailable.
    }
};

const EMPLOYEE_IDP_GAPS_KEY = "mock-employee-idp-gaps";
const EMPLOYEE_IDP_ACTIVITIES_KEY = "mock-employee-idp-activities";
const EMPLOYEE_IDP_FORMS_KEY = "mock-employee-idp-forms";
const EMPLOYEE_IDP_GOALS_KEY = "mock-employee-idp-goals";
const EMPLOYEE_PROGRESS_FORMS_KEY = "mock-employee-progress-forms";
const EMPLOYEE_PROGRESS_STATUS_KEY = "mock-employee-progress-status";

const getIDPActivityApprovalStatus = getEmployeeIDPActivityStatus;

// ==========================================
// 1. COMPONENT: EmployeeAssess (ประเมินตนเอง)
// ==========================================
export const EmployeeAssess: React.FC<{ user: any, setUsers: any }> = ({ user, setUsers }) => {
    const [expanded, setExpanded] = useState<string | null>(null);
    const assessDraftKey = `mock-employee-assess:${user?.sso || "default"}`;
    const [scores, setScores] = useState<any>(() => readEmployeeStorage(assessDraftKey, {}));

    useEffect(() => {
        writeEmployeeStorage(assessDraftKey, scores);
    }, [assessDraftKey, scores]);

    const submitEval = () => {
        setUsers((prev: any[]) => prev.map(u => u.sso === user.sso ? { ...u, evalStatus: 'self_submitted' } : u));
        alert("ส่งแบบประเมินให้หัวหน้าสำเร็จ!\nสถานะเปลี่ยนเป็น self_submitted");
    };

    const saveAssessDraft = () => {
        writeEmployeeStorage(assessDraftKey, scores);
        alert("\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e23\u0e48\u0e32\u0e07\u0e40\u0e23\u0e35\u0e22\u0e1a\u0e23\u0e49\u0e2d\u0e22");
    };

    const typeConfig: any = {
        CC: { label: "CC — Core Competency", tag: "tag-cc", tagLabel: "CC", color: "#1E40AF" },
        MC: { label: "MC — Managerial Competency", tag: "tag-mc", tagLabel: "MC", color: "#6D28D9" },
        FC1: { label: "FC1 — Functional Competency", tag: "tag-fc1", tagLabel: "FC1", color: "#047857" },
        FC2: { label: "FC2 — Functional Competency", tag: "tag-fc2", tagLabel: "FC2", color: "#065f46" }
    };

    const proficiencyLevelByName: Record<string, number> = {
        "ปฏิบัติการ": 1,
        "ชำนาญการ": 2,
        "ชำนาญการพิเศษ": 3,
        "เชี่ยวชาญ": 4,
        "เชี่ยวชาญพิเศษ": 5
    };
    const userProficiencyLevel = proficiencyLevelByName[user?.l] || 1;
    const sections = INITIAL_COMPETENCIES.reduce<Record<string, any[]>>((acc, item) => {
        const key = typeConfig[item.t] ? item.t : "FC2";
        acc[key] = [...(acc[key] || []), item];
        return acc;
    }, {});
    const orderedSections = ["CC", "MC", "FC1", "FC2"].filter(type => sections[type]?.length);
    const getBehaviors = (item: any) => {
        const levels = Array.isArray(item.levels) ? item.levels : [];
        const matchedLevel = levels.find((level: any) => Number(level.lvl) === userProficiencyLevel) || levels.find((level: any) => Number(level.lvl) === 1);
        return matchedLevel?.indicators || [];
    };

    return (
        <>
            <div className="flex ic jb mb20">
                <div>
                    <div className="sec-t">ประเมินตนเอง </div>
                    <div className="sec-s">รอบปี 2568 · กรอกให้ครบทุกสมรรถนะแล้วกด "ส่งให้หัวหน้า"</div>
                </div>
                <span className="b by">draft</span>
            </div>

            <div style={{ background: "var(--yellow-bg)", border: "1px solid #FDE68A", borderRadius: "var(--r)", padding: "10px 14px", marginBottom: "20px", fontSize: "12px", color: "var(--yellow)" }}>
                 ระบบแสดงพฤติกรรมบ่งชี้ตามตำแหน่งและระดับความชำนาญของคุณ
            </div>

            {orderedSections.map(type => {
                const items = sections[type] || [];
                if (!items || items.length === 0) return null;
                const config = typeConfig[type];
                return (
                    <div key={type} style={{ marginBottom: "24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", paddingBottom: "8px", borderBottom: "2px solid var(--border)" }}>
                            <span style={{ background: config.color, color: "#fff", padding: "3px 10px", borderRadius: "5px", fontSize: "11px", fontWeight: 800, letterSpacing: ".05em" }}>{config.tagLabel}</span>
                            <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>{config.label}</span>
                            <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--text3)" }}>{items.filter(it => scores[it.cd]).length}/{items.length} กรอกแล้ว</span>
                        </div>
                        {items.map((it) => {
                            const score = scores[it.cd];
                            return (
                                <div key={it.cd} className="ac" style={{ marginBottom: "8px" }}>
                                    <div className="ah" onClick={() => setExpanded(expanded === it.cd ? null : it.cd)} style={{ background: '#fff' }}>
                                        <span className={config.tag} style={{ flexShrink: 0 }}>{config.tagLabel}</span>
                                        <span className="fw7 fs13" style={{ flex: 1, marginLeft: "2px" }}>{it.n}</span>
                                        <span style={{ fontSize: "12px", fontWeight: 700, color: score ? "var(--teal)" : "var(--red)" }}>
                                            {score ? score + " / 5 " : "ยังไม่กรอก"}
                                        </span>
                                        <span style={{ marginLeft: "10px", color: "var(--text3)", fontSize: "12px" }}>{expanded === it.cd ? "▴" : "▾"}</span>
                                    </div>
                                    <div className={`ab ${expanded === it.cd ? "open" : ""}`}>
                                        <div style={{ marginBottom: "14px" }}>
                                            <div className="lbl mb6" style={{ fontSize: "11px" }}>พฤติกรรมบ่งชี้ </div>
                                            {getBehaviors(it).length > 0 ? (
                                                <ul className="blist">
                                                    {getBehaviors(it).map((b: string, i: number) => <li key={i}>{b}</li>)}
                                                </ul>
                                            ) : (
                                                <div className="muted fs12">ยังไม่มีพฤติกรรมบ่งชี้สำหรับสมรรถนะนี้</div>
                                            )}
                                        </div>
                                        <div className="lbl mb8">โปรดเลือกคะแนนของคุณ <span style={{ color: "var(--red)" }}>*</span></div>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px", marginBottom: "14px" }}>
                                            {[1, 2, 3, 4, 5].map(k => (
                                                <div key={k} onClick={() => setScores({ ...scores, [it.cd]: k })} style={{ border: `2px solid ${score === k ? "var(--teal)" : "var(--border)"}`, borderRadius: "10px", padding: "16px 8px", cursor: "pointer", background: score === k ? "var(--teal-lt)" : "#fff", transition: ".15s", textAlign: "center" }}>
                                                    <div style={{ fontSize: "26px", fontWeight: 800, color: score === k ? "var(--teal)" : "var(--navy)", lineHeight: 1 }}>{k}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="divider" />
                                        <div className="lbl mb8" style={{ fontSize: '11px' }}>แนบหลักฐานประกอบ <span className="lbl-opt">(ถ้ามี)</span></div>
                                        <div className="g2">
                                            <div className="upload-area" style={{ padding: '12px' }}>
                                                <div className="fw6 fs12">อัปโหลดไฟล์</div>
                                                <div className="muted fs11">PDF, Word, Excel, รูปภาพ</div>
                                            </div>
                                            <div>
                                                <div className="fg">
                                                    <label className="lbl" style={{ fontWeight: 500, fontSize: '11px' }}>URL หลักฐาน</label>
                                                    <input className="inp" style={{ fontSize: '12px' }} placeholder="https://..." />
                                                </div>
                                                <div className="fg mb0">
                                                    <label className="lbl" style={{ fontWeight: 500, fontSize: '11px' }}>คำอธิบาย</label>
                                                    <textarea className="ta" style={{ minHeight: '48px', fontSize: '12px' }} placeholder="อธิบาย" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );
            })}

            <div className="flex g8 mt4" style={{ paddingTop: '4px' }}>
                <button className="btn btn-t" onClick={submitEval}> ส่งให้หัวหน้า</button>
                <button className="btn btn-s" onClick={saveAssessDraft}>{"บันทึกร่าง"}</button>
            </div>
        </>
    );
};

// ==========================================
// 2. COMPONENT: EmployeeGap (สรุปผลสมรรถนะ)
// ==========================================
export const EmployeeGap: React.FC<{ setPage: (p: string) => void }> = ({ setPage }) => {
    const gaps = [
        { cd: "CC-001", n: "การบริการที่ดี", t: "CC", ss: 3, sup: 4, exp: 3, pri: "low" },
        { cd: "CC-002", n: "การมุ่งผลสัมฤทธิ์", t: "CC", ss: 3, sup: 3, exp: 3, pri: "low" },
        { cd: "CC-003", n: "การทำงานเป็นทีม", t: "CC", ss: 4, sup: 2, exp: 3, pri: "medium" },
        { cd: "FC2-061", n: "การใช้เทคโนโลยีดิจิทัล", t: "FC", ss: 2, sup: 1, exp: 3, pri: "high" },
        { cd: "FC2-062", n: "การวิเคราะห์ข้อมูล", t: "FC", ss: 2, sup: 1, exp: 2, pri: "medium" },
        { cd: "CC-004", n: "จริยธรรม", t: "CC", ss: 4, sup: 3, exp: 3, pri: "low" }
    ];

    const passCount = gaps.filter(g => g.sup >= g.exp).length;
    const failCount = gaps.filter(g => g.sup < g.exp).length;
    const needIDP = gaps.filter(g => g.sup < g.exp).sort((a, b) => (a.sup - a.exp) - (b.sup - b.exp));

    return (
        <>
            <div className="flex ic jb mb20">
                <div>
                    <div className="sec-t">สรุปผลสมรรถนะ </div>
                    <div className="sec-s">ยืนยันโดย รศ.ดร.วิไล ใจดี · 5 พ.ค. 2568 · สถานะ: approved</div>
                </div>
                <button className="btn btn-s"> Export PDF</button>
            </div>

            <div className="g2 mb14">
                <div className="sc" style={{ borderLeft: '4px solid var(--teal)' }}>
                    <div className="sl">ผ่านเกณฑ์</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <div className="sv tc">{passCount}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text3)' }}>/ {gaps.length} สมรรถนะ</div>
                    </div>
                    <div className="ss muted">รวมจุดแข็งและที่ทำได้ตามเกณฑ์</div>
                </div>
                <div className="sc" style={{ borderLeft: '4px solid var(--red)' }}>
                    <div className="sl">ไม่ผ่านเกณฑ์</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <div className="sv rc">{failCount}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text3)' }}>/ {gaps.length} สมรรถนะ</div>
                    </div>
                    <div className="ss muted">ต้องจัดทำ IDP พัฒนาต่อ</div>
                </div>
            </div>

            <div className="card mb14">
                <div className="ch"><div className="ct">ผลรายสมรรถนะ</div></div>
                <div style={{ overflowX: "auto" }}>
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>สมรรถนะ</th>
                        <th style={{ textAlign: 'center' }}>ประเภท</th>
                        <th style={{ textAlign: 'center' }}>ระดับคาดหวัง</th>
                        <th style={{ textAlign: 'center' }}>ประเมินตนเอง</th>
                        <th style={{ textAlign: 'center' }}>ผู้บังคับบัญชา</th>
                        <th style={{ textAlign: 'center' }}>สถานะ</th>
                        <th style={{ textAlign: 'center' }}>Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gaps.map((g, i) => {
                        const diff = g.sup - g.exp;
                        const statusBadge = diff >= 0 ? <span className="b bt">ผ่านเกณฑ์</span> : (g.pri === 'high' ? <span className="b br">เร่งด่วน</span> : <span className="b by">ต้องพัฒนา</span>);
                        return (
                          <tr key={i}>
                            <td>
                              <div className="fw6 fs13">{g.n}</div>
                              <div className="muted fs11">{g.cd}</div>
                            </td>
                            <td style={{ textAlign: 'center' }}><span className={g.t === 'CC' ? 'tag-cc' : g.t === 'MC' ? 'tag-mc' : g.t === 'FC1' ? 'tag-fc1' : g.t === 'FC2' ? 'tag-fc2' : 'tag-fc'}>{g.t}</span></td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{ display: 'inline-flex', width: '30px', height: '30px', borderRadius: '8px', background: 'var(--navy)', color: '#fff', fontSize: '14px', fontWeight: 800, alignItems: 'center', justifyContent: 'center' }}>{g.exp}</span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{ display: 'inline-flex', width: '30px', height: '30px', borderRadius: '8px', background: 'var(--blue-lt)', color: 'var(--blue)', fontSize: '14px', fontWeight: 800, alignItems: 'center', justifyContent: 'center' }}>{g.ss}</span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{ display: 'inline-flex', width: '30px', height: '30px', borderRadius: '8px', background: g.sup >= g.exp ? 'var(--green-bg)' : 'var(--red-bg)', color: g.sup >= g.exp ? 'var(--green)' : 'var(--red)', fontSize: '14px', fontWeight: 800, alignItems: 'center', justifyContent: 'center' }}>{g.sup}</span>
                            </td>
                            <td style={{ textAlign: 'center' }}>{diff >= 0 ? "" : ""}</td>
                            <td style={{ textAlign: 'center' }}>{statusBadge}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
            </div>

            <div className="card">
                <div className="ch">
                    <div>
                        <div className="ct"> สมรรถนะที่ต้องทำ IDP</div>
                        <div className="cs">สมรรถนะที่ยังไม่ผ่านเกณฑ์การประเมิน</div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                        <button className="btn btn-t btn-sm" onClick={() => setPage('emp-idp')}>สร้าง IDP →</button>
                    </div>
                </div>
                <div className="cb">
                    {needIDP.map((g, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: g.pri === 'high' ? "var(--red)" : "var(--yellow)", color: "#fff", fontSize: "10px", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
                            <div style={{ flex: 1 }}>
                                <span className="fw6 fs13">{g.n}</span>
                                <span className="muted fs12" style={{ marginLeft: "8px" }}>{g.cd}</span>
                            </div>
                            <span className={`b ${g.t === 'CC' ? 'tag-cc' : g.t === 'MC' ? 'tag-mc' : g.t === 'FC1' ? 'tag-fc1' : g.t === 'FC2' ? 'tag-fc2' : 'tag-fc'}`}>{g.t}</span>
                            <span className={`b ${g.pri === 'high' ? 'br' : 'by'}`} style={{ marginLeft: '4px' }}>{g.pri === 'high' ? 'เร่งด่วน' : 'ต้องพัฒนา'}</span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

// ==========================================
// 3. COMPONENT: EmployeeIDP (แผนพัฒนา IDP)
// ==========================================
type LearningMethodOption = {
    key: string;
    label: string;
    desc?: string;
};

const DEFAULT_LEARNING_METHOD_OPTIONS: LearningMethodOption[] = [
    { key: "experiential", label: "Experiential Learning", desc: "การเรียนรู้ผ่านประสบการณ์จากการทำงานจริง เช่น OJT โครงการพิเศษ หรือ Job Rotation" },
    { key: "social", label: "Social Learning", desc: "การเรียนรู้ผ่านบุคคลอื่น การปฏิสัมพันธ์ แลกเปลี่ยนความคิดเห็น ประสบการณ์ร่วมกัน หรือการมีผู้คอยให้คำแนะนำ" },
    { key: "formal", label: "Formal Learning", desc: "การเรียนรู้อย่างเป็นทางการ มีแบบแผน หรือการเรียนในห้องเรียน" },
];

export const EmployeeIDP: React.FC<{ learningMethods?: LearningMethodOption[] }> = ({ learningMethods = DEFAULT_LEARNING_METHOD_OPTIONS }) => {
    const [gaps, setGaps] = useState(() => IDP_GAPS_DATA);
    const [openForms, setOpenForms] = useState<Set<number>>(new Set());
    const [activitiesByGap, setActivitiesByGap] = useState(() => IDP_ACTIVITIES_DATA);
    const [activityForm, setActivityForm] = useState<Record<number, any>>({});
    const [goalsByGap, setGoalsByGap] = useState<Record<string, string>>({});
    const [rejectedEditGapCode, setRejectedEditGapCode] = useState<string | null>(null);

    useEffect(() => {
        writeEmployeeStorage(EMPLOYEE_IDP_GAPS_KEY, gaps);
    }, [gaps]);

    useEffect(() => {
        writeEmployeeStorage(EMPLOYEE_IDP_ACTIVITIES_KEY, activitiesByGap);
    }, [activitiesByGap]);

    useEffect(() => {
        writeEmployeeStorage(EMPLOYEE_IDP_FORMS_KEY, activityForm);
    }, [activityForm]);

    useEffect(() => {
        writeEmployeeStorage(EMPLOYEE_IDP_GOALS_KEY, goalsByGap);
    }, [goalsByGap]);

    const toggleForm = (idx: number) => {
        setOpenForms(prev => {
            const next = new Set(prev);
            next.has(idx) ? next.delete(idx) : next.add(idx);
            return next;
        });
    };

    const getForm = (idx: number) =>
        activityForm[idx] || { catalog: "", method: "", title: "", startDate: "", endDate: "", duration: "", weight: "", cost: "", note: "" };
    const setForm = (idx: number, val: any) => setActivityForm(prev => ({ ...prev, [idx]: { ...getForm(idx), ...val } }));
    const resetForm = (idx: number) => setActivityForm(prev => ({ ...prev, [idx]: { catalog: "", method: "", title: "", startDate: "", endDate: "", weight: "", cost: "", note: "" } }));

    const toDateInput = (value?: string) => (/^\d{4}-\d{2}-\d{2}$/.test(value || "") ? value : "");

    const catalogOptions = [
        { key: "formal-ai-data", method: "formal", title: "หลักสูตร AI & Data Analytics", group: "Formal", cost: 4500, desc: "เรียนรู้พื้นฐานการวิเคราะห์ข้อมูล การใช้ AI ในงาน และการสร้าง dashboard เพื่อสนับสนุนการตัดสินใจ" },
        { key: "formal-communication", method: "formal", title: "Workshop การสื่อสาร", group: "Formal", cost: 1500, desc: "ฝึกการสื่อสารเชิงโครงสร้าง การนำเสนอประเด็นสำคัญ และการรับมือสถานการณ์สื่อสารที่ซับซ้อน" },
        { key: "formal-english", method: "formal", title: "e-Learning ภาษาอังกฤษ", group: "Formal", cost: 0, desc: "พัฒนาทักษะภาษาอังกฤษเพื่อการทำงาน การอ่านเอกสาร และการสื่อสารในบริบทมหาวิทยาลัย" },
        { key: "social-mentoring", method: "social", title: "Mentoring Program", group: "Social", cost: 0, desc: "นัดหมาย mentor เพื่อรับคำแนะนำ วางแผนพัฒนา และสะท้อนผลการเรียนรู้จากการทำงานจริง" },
        { key: "social-coaching", method: "social", title: "Coaching by หัวหน้าฝ่าย", group: "Social", cost: 0, desc: "รับ coaching จากหัวหน้าฝ่ายเพื่อแก้โจทย์งานจริง ปรับพฤติกรรมการทำงาน และติดตามผลเป็นระยะ" },
        { key: "social-peer-learning", method: "social", title: "Peer Learning / Group Activity", group: "Social", cost: 0, desc: "เรียนรู้ร่วมกับเพื่อนร่วมงานผ่านกิจกรรมกลุ่ม แลกเปลี่ยนประสบการณ์ และสรุปบทเรียนร่วมกัน" },
        { key: "experiential-ojt", method: "experiential", title: "OJT / มอบหมายโครงการพิเศษ", group: "Experiential", cost: 0, desc: "ฝึกปฏิบัติจากงานจริงหรือโครงการพิเศษ พร้อมผลลัพธ์ที่ตรวจสอบได้และข้อสะท้อนจากผู้เกี่ยวข้อง" },
        { key: "experiential-job-rotation", method: "experiential", title: "Job Rotation", group: "Experiential", cost: 0, desc: "หมุนเวียนเรียนรู้งานในบทบาทหรือหน่วยงานที่เกี่ยวข้อง เพื่อเพิ่มมุมมองและทักษะการประสานงาน" },
    ];

    const methodPalette = [
        { color: "var(--orange)", bg: "#FFF7ED", ic: "EX" },
        { color: "var(--green)", bg: "#F0FDF4", ic: "SO" },
        { color: "var(--blue)", bg: "#EFF6FF", ic: "FO" },
        { color: "#7C3AED", bg: "#F5F3FF", ic: "LR" },
        { color: "#0F766E", bg: "#F0FDFA", ic: "DV" },
    ];
    const methods = (learningMethods.length ? learningMethods : DEFAULT_LEARNING_METHOD_OPTIONS).map((method, index) => ({
        ...method,
        ...methodPalette[index % methodPalette.length]
    }));
    const methodMap = new Map(methods.map(method => [method.key, method]));
    const catalogMap = new Map(catalogOptions.map(item => [item.key, item]));
    const applyCatalogSelection = (idx: number, value: string) => {
        if (value === "custom") {
            setForm(idx, { catalog: value, method: "", title: "" });
            return;
        }
        const selectedCatalog = catalogMap.get(value);
        if (!selectedCatalog) {
            setForm(idx, { catalog: value, method: "", title: "", note: "" });
            return;
        }
        setForm(idx, buildEmployeeIDPCatalogPatch(selectedCatalog));
    };

    const saveIDPDraft = () => {
        writeEmployeeStorage(EMPLOYEE_IDP_GAPS_KEY, gaps);
        writeEmployeeStorage(EMPLOYEE_IDP_ACTIVITIES_KEY, activitiesByGap);
        writeEmployeeStorage(EMPLOYEE_IDP_FORMS_KEY, activityForm);
        writeEmployeeStorage(EMPLOYEE_IDP_GOALS_KEY, goalsByGap);
        alert("\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e23\u0e48\u0e32\u0e07 IDP \u0e40\u0e23\u0e35\u0e22\u0e1a\u0e23\u0e49\u0e2d\u0e22");
    };

    const getWeightNotice = (totalWeight: number) => {
        if (totalWeight === 100) return null;
        if (totalWeight < 100) return { label: `ขาด ${100 - totalWeight}%`, cls: "by" };
        return { label: `เกิน ${totalWeight - 100}%`, cls: "br" };
    };

    const submitGapPlan = (gapCode: string) => {
        const gap = gaps.find((item: any) => item.cd === gapCode);
        const activities = activitiesByGap[gapCode] || [];
        const totalWeight = activities.reduce((sum: number, act: any) => sum + Number(act.weight || 0), 0);
        if (!activities.length) {
            alert("กรุณาเพิ่มกิจกรรมพัฒนาก่อนส่งแผน");
            return;
        }
        if (totalWeight !== 100) {
            const notice = getWeightNotice(totalWeight);
            if (!window.confirm(`น้ำหนักกิจกรรมของ "${gap?.n || gapCode}" รวม ${totalWeight}/100%\n${notice?.label || "ยังไม่ครบ 100%"}\n\nต้องการยืนยันส่งต่อหรือไม่?`)) return;
        }
        if (!window.confirm(`ยืนยันส่งแผน "${gap?.n || gapCode}" ให้หัวหน้างานตรวจสอบ?\nหลังส่งแล้วจะไม่สามารถแก้ไขได้ ยกเว้นกรณีแผนไม่ผ่าน`)) return;
        setActivitiesByGap(prev => ({
            ...prev,
            [gapCode]: (prev[gapCode] || []).map((act: any) => (
                act.result === "failed" || act.result === "done" || act.result === "passed"
                    ? act
                    : { ...act, st: "รออนุมัติ", stC: "by" }
            ))
        }));
        setGaps((prev: any[]) => prev.map(gap => gap.cd === gapCode ? { ...gap, status: "submitted" } : gap));
        alert("\u0e2a\u0e48\u0e07\u0e41\u0e1c\u0e19 IDP \u0e43\u0e2b\u0e49\u0e2b\u0e31\u0e27\u0e2b\u0e19\u0e49\u0e32\u0e40\u0e23\u0e35\u0e22\u0e1a\u0e23\u0e49\u0e2d\u0e22\u0e41\u0e25\u0e49\u0e27");
    };

    const submitAllIDP = () => {
        const readyGaps = gaps.filter((gap: any) => gap.status === "draft" || gap.status === "rejected");
        const missingActivities = readyGaps.filter((gap: any) => !(activitiesByGap[gap.cd] || []).length);
        if (missingActivities.length) {
            alert(`กรุณาเพิ่มกิจกรรมพัฒนาให้ครบก่อนส่ง\nยังไม่มีกิจกรรม: ${missingActivities.map((gap: any) => gap.n).join(", ")}`);
            return;
        }
        const invalidWeightGaps = readyGaps
            .map((gap: any) => {
                const totalWeight = (activitiesByGap[gap.cd] || []).reduce((sum: number, act: any) => sum + Number(act.weight || 0), 0);
                const notice = getWeightNotice(totalWeight);
                return notice ? `${gap.n}: ${totalWeight}/100% (${notice.label})` : null;
            })
            .filter(Boolean);
        if (invalidWeightGaps.length) {
            if (!window.confirm(`น้ำหนักกิจกรรมยังไม่ครบหรือเกิน 100%\n${invalidWeightGaps.join("\n")}\n\nต้องการยืนยันส่งต่อหรือไม่?`)) return;
        }
        if (!window.confirm("ยืนยันส่ง IDP ทั้งหมดให้หัวหน้างานตรวจสอบ?\nหลังส่งแล้วจะไม่สามารถแก้ไขได้ ยกเว้นกรณีแผนไม่ผ่าน")) return;
        setActivitiesByGap(prev => {
            const readyCodes = new Set(readyGaps.map((gap: any) => gap.cd));
            return Object.fromEntries(Object.entries(prev).map(([gapCode, acts]) => [
                gapCode,
                readyCodes.has(gapCode)
                    ? (acts as any[]).map((act: any) => (
                        act.result === "failed" || act.result === "done" || act.result === "passed"
                            ? act
                            : { ...act, st: "รออนุมัติ", stC: "by" }
                    ))
                    : acts
            ]));
        });
        setGaps((prev: any[]) => prev.map(gap => gap.status === "draft" || gap.status === "rejected" ? { ...gap, status: "submitted" } : gap));
        alert("\u0e2a\u0e48\u0e07 IDP \u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14\u0e40\u0e23\u0e35\u0e22\u0e1a\u0e23\u0e49\u0e2d\u0e22\u0e41\u0e25\u0e49\u0e27");
    };

    const addActivity = (idx: number) => {
        const f = getForm(idx);
        if (!f.title.trim() || !f.method || !f.startDate || !f.endDate || !f.weight) return;
        if (f.endDate < f.startDate) {
            alert("วันที่สิ้นสุดต้องไม่อยู่ก่อนวันที่เริ่ม");
            return;
        }
        if (+f.weight > 100 || +f.weight <= 0) {
            alert("น้ำหนักต้องอยู่ระหว่าง 1-100");
            return;
        }
        if (f.cost && +f.cost < 0) {
            alert("ค่าใช้จ่ายต้องไม่ต่ำกว่า 0");
            return;
        }
        const gap = gaps[idx];
        const selectedMethod = methodMap.get(f.method);
        const methodTheme = selectedMethod
            ? { ic: selectedMethod.ic, bg: selectedMethod.bg }
            : { ic: "LR", bg: "#EFF6FF" };

        const nextActivity = {
            ...methodTheme,
            t: f.title.trim(),
            m: selectedMethod?.label || f.method,
            catalog: f.catalog && f.catalog !== "custom" ? f.catalog : undefined,
            startDate: f.startDate,
            due: f.endDate,
            weight: f.weight,
            cost: f.cost,
            note: f.note,
            st: "ร่าง",
            stC: "bgr",
            result: null,
            logs: []
        };
        const editIndex = typeof f.editIndex === "number" ? f.editIndex : null;

        setActivitiesByGap(prev => {
            const current = prev[gap.cd] || [];
            return {
                ...prev,
                [gap.cd]: editIndex === null
                    ? [...current, nextActivity]
                    : current.map((act: any, index: number) => index === editIndex ? { ...act, ...nextActivity } : act)
            };
        });

        resetForm(idx);
        toggleForm(idx);
    };

    const canEditGap = (status: string) => status === "draft" || status === "rejected";
    const getActivityProgress = (activities: any[]) => {
        const totalWeight = activities.reduce((sum, act) => sum + Number(act.weight || 0), 0);
        const hasFailed = activities.some(act => act.result === "failed" || act.st === "ไม่ผ่าน");
        const allPassed = activities.length > 0 && activities.every(act => act.result === "done" || act.result === "passed" || act.st === "ผ่าน" || act.st === "เสร็จสิ้น");
        return { totalWeight, hasFailed, allPassed };
    };
    const getPlanStatus = (gap: any, activities: any[]) => {
        const progress = getActivityProgress(activities);
        if (progress.hasFailed) return { badge: "ไม่ผ่าน", cls: "br" };
        if (progress.allPassed) return { badge: "ผ่าน", cls: "bg" };
        if (gap.status === "submitted") return { badge: "ส่งแล้ว รอประเมิน", cls: "by" };
        if (activities.length > 0) return { badge: "ร่าง", cls: "bgr" };
        if (gap.status === "rejected") return { badge: "แผนไม่ผ่าน", cls: "br" };
        return { badge: "ยังไม่ส่ง", cls: "bgr" };
    };
    const editActivity = (gapCode: string, actIndex: number) => {
        const gapIndex = gaps.findIndex((gap: any) => gap.cd === gapCode);
        const act = (activitiesByGap[gapCode] || [])[actIndex];
        if (gapIndex < 0 || !act) return;

        const method = methods.find(item => item.label === act.m)?.key || "";
        const catalog = act.catalog || catalogOptions.find(item => item.title === act.t && item.method === method)?.key || "custom";
        setForm(gapIndex, {
            catalog,
            method,
            editIndex: actIndex,
            title: act.t || "",
            startDate: toDateInput(act.startDate),
            endDate: toDateInput(act.due),
            weight: String(act.weight || ""),
            cost: String(act.cost || ""),
            note: act.note || ""
        });
        setOpenForms(prev => {
            const next = new Set(prev);
            next.add(gapIndex);
            return next;
        });
        setRejectedEditGapCode(null);
    };
    const cancelActivityForm = (idx: number) => {
        resetForm(idx);
        toggleForm(idx);
    };

    const rejectedEditGap = rejectedEditGapCode ? gaps.find((gap: any) => gap.cd === rejectedEditGapCode) : null;
    const rejectedEditActivities = rejectedEditGap ? (activitiesByGap[rejectedEditGap.cd] || []) : [];

    return (
        <>
            <div className="flex ic jb mb20">
                <div>
                    <div className="sec-t">แผนพัฒนา IDP</div>
                    <div className="sec-s">ดึงข้อมูลสมรรถนะที่ต้องการพัฒนาอัตโนมัติ ปีงบประมาณ 2568 สถานะ: draft</div>
                </div>
                <button className="btn btn-s">Export PDF</button>
            </div>

            <div className="card mb20">
                <div className="ch"><div className="ct">รูปแบบการเรียนรู้ที่นำไปใช้ได้</div></div>
                <div className="cb" style={{ paddingTop: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {methods.map(m => (
                            <div key={m.key} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderLeft: `3px solid ${m.color}`, borderRadius: 'var(--r)', padding: '11px 14px' }}>
                                <div className="fw7 fs12" style={{ color: m.color, marginBottom: '4px' }}>{m.label}</div>
                                <div className="fs12 muted">{m.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {gaps.map((g, idx) => {
                const activities = activitiesByGap[g.cd] || [];
                const status = getPlanStatus(g, activities);
                const progress = getActivityProgress(activities);
                const weightNotice = getWeightNotice(progress.totalWeight);
                const editable = canEditGap(g.status);
                const form = getForm(idx);
                const isCatalogActivity = !!form.catalog && form.catalog !== "custom";
                const rejectionNotice = g.status === "rejected" ? getEmployeeIDPRejectionNotice(g) : null;

                return (
                    <div key={g.cd} className="idp-gap" style={{ marginBottom: '20px', scrollMarginTop: '110px', overflow: 'hidden' }}>
                        <div className="idp-gap-h" style={{ padding: '14px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, flexWrap: 'wrap' }}>
                                <span className={`b ${g.pri === 'high' ? 'br' : 'by'}`}>{g.pri === 'high' ? 'เร่งด่วน' : 'ต้องพัฒนา'}</span>
                                <span className={g.t === 'CC' ? 'tag-cc' : g.t === 'MC' ? 'tag-mc' : g.t === 'FC1' ? 'tag-fc1' : g.t === 'FC2' ? 'tag-fc2' : 'tag-fc'}>{g.t}</span>
                                <span className="fw8 fs14">{g.n}</span>
                                <span className="muted fs12" style={{ marginLeft: '4px' }}>คาดหวัง {g.exp} ปัจจุบัน {g.actual}</span>
                                <span className={`b ${progress.totalWeight === 100 ? "bg" : progress.totalWeight > 100 ? "br" : "bb"}`}>{progress.totalWeight}/100%</span>
                                {weightNotice && <span className={`b ${weightNotice.cls}`}>{weightNotice.label}</span>}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className={`b ${status.cls}`}>{status.badge}</span>
                                {editable && <button className="btn btn-t btn-sm" onClick={() => submitGapPlan(g.cd)}>{"ส่งให้หัวหน้า"}</button>}
                            </div>
                        </div>

                        {rejectionNotice && (
                            <div style={{ background: '#FEF2F2', borderBottom: '1px solid #FECACA', padding: '14px 18px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                                <div style={{ fontSize: '20px', flexShrink: 0, width: "28px", height: "28px", borderRadius: "50%", background: "var(--red-bg)", color: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>!</div>
                                <div style={{ flex: 1 }}>
                                    <div className="fw8" style={{ color: 'var(--red)', marginBottom: '4px', fontSize: "15px" }}>{rejectionNotice.title}</div>
                                    <div className="fs13" style={{ color: '#991B1B', marginBottom: '8px', lineHeight: 1.6 }}>
                                        <span className="fw7">{rejectionNotice.competencyName}</span>
                                        <span className="muted" style={{ color: "#991B1B" }}> · ไม่ผ่านโดย </span>
                                        <span className="fw7">{rejectionNotice.reviewer}</span>
                                        {rejectionNotice.date && <span> · {rejectionNotice.date}</span>}
                                    </div>
                                    <div style={{ background: '#fff', border: '1px solid #FECACA', borderRadius: '6px', padding: '10px 12px', color: 'var(--text)', fontSize: "13px", lineHeight: 1.7 }}>
                                        {rejectionNotice.comment}
                                    </div>
                                </div>
                                <button className="btn btn-r btn-sm" style={{ flexShrink: 0 }} onClick={() => setRejectedEditGapCode(g.cd)}>แก้ไขแผนสมรรถนะนี้</button>
                            </div>
                        )}

                        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--blue-md)', background: '#fff' }}>
                            <label className="lbl">เป้าหมายการพัฒนา <span style={{ color: 'var(--red)' }}>*</span></label>
                            <textarea className="ta" style={{ minHeight: '52px', marginTop: '5px', background: editable ? "#fff" : "var(--bg)" }} placeholder="ระบุเป้าหมายการพัฒนา..." disabled={!editable} value={goalsByGap[g.cd] || ""} onChange={e => setGoalsByGap(prev => ({ ...prev, [g.cd]: e.target.value }))} />
                        </div>

                        <div style={{ background: '#fff' }}>
                            {activities.map((act, aIdx) => (
                                <div key={aIdx} style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--blue)', flexShrink: 0 }}></div>
                                    <div style={{ flex: 1 }}>
                                        <div className="fw6 fs13">{act.t}</div>
                                        <div className="muted fs11">{act.m} · {act.startDate || "-"} ถึง {act.due} · น้ำหนัก {act.weight || "-"}% · ค่าใช้จ่าย {act.cost ? Number(act.cost).toLocaleString("th-TH") : "0"} บาท</div>
                                        {act.note && <div className="muted fs11 mt4">คำอธิบายกิจกรรม: {act.note}</div>}
                                    </div>
                                    {(() => {
                                        const activityStatus = getIDPActivityApprovalStatus(act, g.status);
                                        return (
                                            <div className="flex ic g8" style={{ flexShrink: 0 }}>
                                                <span className={`b ${activityStatus.cls}`}>{activityStatus.label}</span>
                                                {editable && (
                                                    <button className="btn btn-s btn-sm" type="button" onClick={() => editActivity(g.cd, aIdx)}>
                                                        แก้ไข
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            ))}
                            {activities.length === 0 && (
                                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text3)', fontSize: '13px', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>+</div>
                                    <div className="fw6 fs13" style={{ color: 'var(--text2)' }}>ยังไม่มีกิจกรรมพัฒนา</div>
                                </div>
                            )}
                        </div>

                        {editable ? (
                        <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', background: '#fff' }}>
                            <button className="btn btn-s btn-sm" type="button" onClick={() => toggleForm(idx)}>
                                {openForms.has(idx) ? '−' : '+'} เพิ่มกิจกรรม
                            </button>
                        </div>
                        ) : (
                        <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', background: 'var(--bg)' }} className="muted fs12">
                            ส่งแผนแล้ว ไม่สามารถแก้ไขกิจกรรมได้ ยกเว้นกรณีแผนไม่ผ่าน
                        </div>
                        )}

                        {editable && openForms.has(idx) && (
                            <div style={{ padding: '18px', background: '#F8FBFF', borderTop: '1px solid #DBE7F5', animation: 'slideDown .22s ease' }}>
                                <div className="fw7 fs13 mb14">{typeof form.editIndex === "number" ? "แก้ไขกิจกรรมพัฒนา" : "เพิ่มกิจกรรมพัฒนา"}</div>

                                <div className="g2 mb12">
                                    <div className="fg" style={{ margin: 0 }}>
                                        <label className="lbl" style={{ fontSize: '11px' }}>เลือกกิจกรรมจาก Catalog หรือกำหนดเอง </label>
                                        <select
                                            className="sel"
                                            style={{ fontSize: '12px', marginTop: '4px' }}
                                            value={form.catalog}
                                            onChange={e => {
                                                applyCatalogSelection(idx, e.target.value);
                                            }}
                                        >
                                            <option value="">— เลือกกิจกรรมจาก Catalog —</option>
                                            {catalogOptions.map(c => <option key={c.key} value={c.key}>[{c.group}] {c.title}</option>)}
                                            <option value="custom">ระบุกิจกรรมเอง</option>
                                        </select>
                                    </div>
                                    <div className="fg" style={{ margin: 0 }}>
                                        <label className="lbl" style={{ fontSize: '11px' }}>ประเภทการเรียนรู้ <span style={{ color: 'var(--red)' }}>*</span></label>
                                        <select
                                            className="sel"
                                            style={{ fontSize: '12px', marginTop: '4px' }}
                                            value={form.method}
                                            disabled={isCatalogActivity}
                                            onChange={e => setForm(idx, { method: e.target.value })}
                                        >
                                            <option value="">— เลือกประเภท —</option>
                                            {methods.map(method => (
                                                <option key={method.key} value={method.key}>{method.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="fg mb12">
                                    <label className="lbl" style={{ fontSize: '11px' }}>ชื่อกิจกรรม <span style={{ color: 'var(--red)' }}>*</span></label>
                                    <input
                                        className="inp"
                                        style={{ fontSize: '12px', marginTop: '4px' }}
                                        value={form.title}
                                        readOnly={isCatalogActivity}
                                        onChange={e => setForm(idx, { title: e.target.value })}
                                        placeholder={isCatalogActivity ? "ระบบเติมจาก Catalog HR" : "เช่น อบรม AI & Data Analytics หรือระบุกิจกรรมของตัวเอง"}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                                    <div className="fg" style={{ margin: 0 }}>
                                        <label className="lbl" style={{ fontSize: '11px' }}>วันที่เริ่ม <span style={{ color: 'var(--red)' }}>*</span></label>
                                        <input type="date" className="inp" style={{ fontSize: '12px', marginTop: '4px' }} value={form.startDate} onChange={e => setForm(idx, { startDate: e.target.value })} />
                                    </div>
                                    <div className="fg" style={{ margin: 0 }}>
                                        <label className="lbl" style={{ fontSize: '11px' }}>วันที่สิ้นสุด <span style={{ color: 'var(--red)' }}>*</span></label>
                                        <input
                                            type="date"
                                            className="inp"
                                            style={{ fontSize: '12px', marginTop: '4px', borderColor: form.endDate && form.startDate && form.endDate < form.startDate ? 'var(--red)' : undefined }}
                                            value={form.endDate}
                                            min={form.startDate || undefined}
                                            onChange={e => setForm(idx, { endDate: e.target.value })}
                                        />
                                        {form.endDate && form.startDate && form.endDate < form.startDate && (
                                            <div style={{ color: 'var(--red)', fontSize: '11px', marginTop: '3px' }}>วันสิ้นสุดต้องอยู่หลังวันที่เริ่ม</div>
                                        )}
                                    </div>
                                    <div className="fg" style={{ margin: 0 }}>
                                        <label className="lbl" style={{ fontSize: '11px' }}>น้ำหนัก (%) <span style={{ color: 'var(--red)' }}>*</span></label>
                                        <input
                                            type="number"
                                            className="inp"
                                            min={1}
                                            max={100}
                                            style={{ fontSize: '12px', marginTop: '4px', borderColor: form.weight && (+form.weight > 100 || +form.weight <= 0) ? 'var(--red)' : undefined }}
                                            value={form.weight}
                                            onChange={e => setForm(idx, { weight: e.target.value })}
                                            placeholder="เช่น 30"
                                        />
                                        {form.weight && (+form.weight > 100 || +form.weight <= 0) && (
                                            <div style={{ color: 'var(--red)', fontSize: '11px', marginTop: '3px' }}>น้ำหนักต้องอยู่ระหว่าง 1-100</div>
                                        )}
                                    </div>
                                    <div className="fg" style={{ margin: 0 }}>
                                        <label className="lbl" style={{ fontSize: '11px' }}>ค่าใช้จ่าย (บาท) <span className="lbl-opt">(ถ้ามี)</span></label>
                                        <input
                                            type="number"
                                            className="inp"
                                            min={0}
                                            style={{ fontSize: '12px', marginTop: '4px', borderColor: form.cost && +form.cost < 0 ? 'var(--red)' : undefined }}
                                            value={form.cost}
                                            onChange={e => setForm(idx, { cost: e.target.value })}
                                            placeholder="เช่น 1500"
                                        />
                                        {form.cost && +form.cost < 0 && (
                                            <div style={{ color: 'var(--red)', fontSize: '11px', marginTop: '3px' }}>ค่าใช้จ่ายต้องไม่ต่ำกว่า 0</div>
                                        )}
                                    </div>
                                </div>

                                <div className="fg mb14">
                                    <label className="lbl" style={{ fontSize: '11px' }}>คำอธิบายกิจกรรม <span className="lbl-opt">(ไม่บังคับ)</span></label>
                                    <textarea className="ta" style={{ fontSize: '12px', minHeight: '52px', marginTop: '4px' }} value={form.note} onChange={e => setForm(idx, { note: e.target.value })} placeholder="อธิบายรายละเอียดกิจกรรม ผลลัพธ์ที่คาดหวัง หรือเหตุผลที่เลือกกิจกรรมนี้..." />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                                    <button className="btn btn-s btn-sm" type="button" onClick={() => cancelActivityForm(idx)}>ยกเลิก</button>
                                    <button
                                        className="btn btn-p btn-sm"
                                        type="button"
                                        onClick={() => addActivity(idx)}
                                        disabled={!form.title.trim() || !form.method || !form.startDate || !form.endDate || !form.weight || form.endDate < form.startDate || +form.weight > 100 || +form.weight <= 0 || (!!form.cost && +form.cost < 0)}
                                    >
                                        {typeof form.editIndex === "number" ? "บันทึกกิจกรรม" : "เพิ่มกิจกรรม"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            <div className="flex g8 mt4" style={{ paddingTop: '4px' }}>
                <button className="btn btn-t" onClick={submitAllIDP}>{"ส่ง IDP ทั้งหมด"}</button>
                <button className="btn btn-s" onClick={saveIDPDraft}>{"บันทึกร่าง"}</button>
            </div>

            {rejectedEditGap && (
                <div className="mo" style={{ zIndex: 320 }} onMouseDown={() => setRejectedEditGapCode(null)}>
                    <div className="mo-box" style={{ width: "720px", maxWidth: "calc(100vw - 32px)", overflow: "hidden" }} onMouseDown={event => event.stopPropagation()}>
                        <div className="mo-h">
                            <div>
                                <div className="fw8 fs15">แก้ไขกิจกรรมในสมรรถนะนี้</div>
                                <div className="muted fs12 mt4">{rejectedEditGap.n} · สมรรถนะนี้ไม่ผ่าน</div>
                            </div>
                            <button className="btn btn-s btn-sm" onClick={() => setRejectedEditGapCode(null)}>ปิด</button>
                        </div>
                        <div className="mo-b" style={{ padding: "14px 18px" }}>
                            {rejectedEditActivities.length ? (
                                <div style={{ display: "grid", gap: "10px" }}>
                                    {rejectedEditActivities.map((act: any, actIndex: number) => {
                                        const activityStatus = getIDPActivityApprovalStatus(act, rejectedEditGap.status);
                                        return (
                                            <div key={`${act.t}-${actIndex}`} style={{ border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "12px", display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "center" }}>
                                                <div>
                                                    <div className="flex ic g8" style={{ flexWrap: "wrap" }}>
                                                        <div className="fw7 fs13">{act.t}</div>
                                                        <span className={`b ${activityStatus.cls}`}>{activityStatus.label}</span>
                                                    </div>
                                                    <div className="muted fs11 mt6">{act.m} · {act.startDate || "-"} ถึง {act.due || "-"} · น้ำหนัก {act.weight || "-"}% · ค่าใช้จ่าย {act.cost ? Number(act.cost).toLocaleString("th-TH") : "0"} บาท</div>
                                                    {act.note && <div className="muted fs11 mt4">คำอธิบายกิจกรรม: {act.note}</div>}
                                                </div>
                                                <button className="btn btn-p btn-sm" onClick={() => editActivity(rejectedEditGap.cd, actIndex)}>
                                                    แก้ไข
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div style={{ padding: "26px 12px", textAlign: "center" }}>
                                    <div className="fw7 fs13 mb6">ยังไม่มีกิจกรรมในแผนนี้</div>
                                    <div className="muted fs12">ปิดหน้าต่างนี้แล้วเพิ่มกิจกรรมใหม่ในแผนได้เลย</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// ==========================================
// 4. COMPONENT: EmployeeProgress (อัปเดตความก้าวหน้า)
// ==========================================
export const EmployeeProgress: React.FC = () => {
    const [activitiesByGap, setActivitiesByGap] = useState(() => IDP_ACTIVITIES_DATA);
    const [progressForms, setProgressForms] = useState<Record<string, { note: string; evidenceUrl: string; evidenceDesc: string; fileName: string }>>(() => readEmployeeStorage(EMPLOYEE_PROGRESS_FORMS_KEY, {}));
    const [progressStatusByGap, setProgressStatusByGap] = useState<Record<string, EmployeeIDPProgressStatus>>(() =>
        readEmployeeStorage(
            EMPLOYEE_PROGRESS_STATUS_KEY,
            IDP_GAPS_DATA.reduce((acc, gap) => ({ ...acc, [gap.cd]: deriveEmployeeIDPProgressStatus(gap) }), {})
        )
    );

    useEffect(() => {
        writeEmployeeStorage(EMPLOYEE_IDP_ACTIVITIES_KEY, activitiesByGap);
    }, [activitiesByGap]);

    useEffect(() => {
        writeEmployeeStorage(EMPLOYEE_PROGRESS_FORMS_KEY, progressForms);
    }, [progressForms]);

    useEffect(() => {
        writeEmployeeStorage(EMPLOYEE_PROGRESS_STATUS_KEY, progressStatusByGap);
    }, [progressStatusByGap]);

    const list = IDP_GAPS_DATA.map(g => ({ g, acts: activitiesByGap[g.cd] || [] }));

    const getFormKey = (gapCode: string, actIdx: number) => `${gapCode}-${actIdx}`;
    const getForm = (gapCode: string, actIdx: number) =>
        progressForms[getFormKey(gapCode, actIdx)] || { note: '', evidenceUrl: '', evidenceDesc: '', fileName: '' };
    const setForm = (gapCode: string, actIdx: number, patch: Partial<{ note: string; evidenceUrl: string; evidenceDesc: string; fileName: string }>) => {
        const key = getFormKey(gapCode, actIdx);
        setProgressForms(prev => ({ ...prev, [key]: { ...getForm(gapCode, actIdx), ...patch } }));
    };
    const clearForm = (gapCode: string, actIdx: number) => {
        const key = getFormKey(gapCode, actIdx);
        setProgressForms(prev => ({ ...prev, [key]: { note: '', evidenceUrl: '', evidenceDesc: '', fileName: '' } }));
    };
    const buildLogMessage = (form: { note: string; evidenceUrl: string; evidenceDesc: string; fileName: string }, mode: 'draft' | 'saved' | 'complete') => {
        const parts = [form.note.trim()];
        if (form.fileName) parts.push(`แนบไฟล์: ${form.fileName}`);
        if (form.evidenceUrl.trim()) parts.push(`URL: ${form.evidenceUrl.trim()}`);
        if (form.evidenceDesc.trim()) parts.push(`คำอธิบาย: ${form.evidenceDesc.trim()}`);
        const summary = parts.filter(Boolean).join(' | ');
        if (mode === 'draft') return summary ? `บันทึกร่าง: ${summary}` : 'บันทึกร่างความก้าวหน้า';
        if (mode === 'complete') return summary ? `ทำกิจกรรมเสร็จสิ้น: ${summary}` : 'ทำกิจกรรมเสร็จสิ้น';
        return summary || 'อัปเดตความก้าวหน้า';
    };
    const saveProgress = (gapCode: string, actIdx: number, mode: 'draft' | 'saved' | 'complete') => {
        const form = getForm(gapCode, actIdx);
        if (!form.note.trim() && !form.fileName && !form.evidenceUrl.trim() && !form.evidenceDesc.trim()) {
            alert('กรุณากรอกบันทึกหรือแนบหลักฐานอย่างน้อย 1 รายการ');
            return;
        }

        const today = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
        setActivitiesByGap(prev => ({
            ...prev,
            [gapCode]: (prev[gapCode] || []).map((act, index) => {
                if (index !== actIdx) return act;
                return {
                    ...act,
                    ...(mode === 'draft'
                        ? { st: 'ร่าง', stC: 'bgr' }
                        : mode === 'complete'
                            ? { st: 'เสร็จสิ้นกิจกรรม', stC: 'bg', result: 'done', progressDone: true }
                            : isEmployeeIDPActivityDone(act)
                                ? { st: act.st, stC: act.stC }
                                : { st: 'กำลังดำเนินการ', stC: 'bt' }),
                    logs: [
                        {
                            d: today,
                            n: buildLogMessage(form, mode),
                            by: 'สมชาย มีสุข',
                            type: mode === 'draft' ? 'draft' : mode === 'complete' ? 'complete' : 'log'
                        },
                        ...(act.logs || [])
                    ]
                };
            })
        }));
        setProgressStatusByGap(prev => ({
            ...prev,
            [gapCode]: prev[gapCode] === 'done' || prev[gapCode] === 'submitted' ? prev[gapCode] : 'developing'
        }));
        clearForm(gapCode, actIdx);
        alert(mode === 'draft' ? 'บันทึกร่างเรียบร้อย' : mode === 'complete' ? 'บันทึกว่ากิจกรรมเสร็จสิ้นแล้ว' : 'บันทึกความก้าวหน้าเรียบร้อย');
    };

    const submitGapProgress = (gapCode: string, acts: any[]) => {
        const currentStatus = progressStatusByGap[gapCode] || 'developing';
        const summary = getEmployeeIDPProgressSummary(acts, currentStatus);
        if (!summary.canSubmit) return;
        const today = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
        setProgressStatusByGap(prev => ({ ...prev, [gapCode]: 'submitted' }));
        setActivitiesByGap(prev => ({
            ...prev,
            [gapCode]: (prev[gapCode] || []).map(act => ({
                ...act,
                logs: [
                    { d: today, n: 'ส่งสมรรถนะนี้ให้หัวหน้าตรวจสอบ', by: 'สมชาย มีสุข', type: 'submit' },
                    ...(act.logs || [])
                ]
            }))
        }));
        alert('ส่งให้หัวหน้าตรวจสอบเรียบร้อย');
    };

    return (
        <>
            <div className="mb20">
                <div className="sec-t">อัปเดตความก้าวหน้า</div>
                <div className="sec-s">บันทึกผลการพัฒนา แนบหลักฐาน และอัปเดตสถานะกิจกรรม IDP</div>
            </div>

            {list.map(({ g, acts }) => {
                const status = progressStatusByGap[g.cd] || deriveEmployeeIDPProgressStatus(g);
                const statusMeta = getEmployeeIDPProgressStatusMeta(status);
                const summary = getEmployeeIDPProgressSummary(acts, status);
                const notice = status === 'rejected' ? getEmployeeIDPRejectionNotice(g) : null;
                const canEdit = status !== 'submitted' && status !== 'done';
                const hasActivities = summary.totalCount > 0;
                return (
                    <div key={g.cd} style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', padding: '12px 14px', background: status === 'rejected' ? '#FEF2F2' : status === 'done' ? 'var(--green-bg)' : 'var(--blue-lt)', border: `1px solid ${status === 'rejected' ? '#FECACA' : status === 'done' ? 'var(--green-md)' : 'var(--blue-md)'}`, borderLeft: `4px solid ${status === 'rejected' ? 'var(--red)' : status === 'done' ? 'var(--green)' : 'var(--blue)'}`, borderRadius: 'var(--r-lg)', flexWrap: 'wrap' }}>
                            <span className={g.t === 'CC' ? 'tag-cc' : g.t === 'MC' ? 'tag-mc' : g.t === 'FC1' ? 'tag-fc1' : g.t === 'FC2' ? 'tag-fc2' : 'tag-fc'}>{g.t}</span>
                            <span className="fw8 fs14" style={{ color: status === 'rejected' ? 'var(--red)' : 'inherit' }}>{g.n}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                                <span className="b bgr">{hasActivities ? `${summary.doneCount}/${summary.totalCount} กิจกรรมเสร็จแล้ว` : 'ยังไม่มีกิจกรรม'}</span>
                                <span className={`b ${statusMeta.cls}`}>{statusMeta.label}</span>
                            </div>
                        </div>

                        {notice && (
                            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--r)', padding: '12px 14px', marginBottom: '12px' }}>
                                <div className="fw8 fs13" style={{ color: 'var(--red)', marginBottom: '4px' }}>{notice.title}: {notice.competencyName}</div>
                                <div className="fs12" style={{ color: '#991B1B', marginBottom: '8px' }}>ส่งกลับโดย {notice.reviewer}{notice.date ? ` · ${notice.date}` : ''}</div>
                                <div className="fs12" style={{ background: '#fff', border: '1px solid #FECACA', borderRadius: '6px', padding: '8px 10px', color: 'var(--text2)' }}>{notice.comment}</div>
                            </div>
                        )}

                        {!hasActivities && (
                            <div className="card mb10" style={{ borderStyle: 'dashed', background: '#fff' }}>
                                <div className="cb flex ic jb g12" style={{ flexWrap: 'wrap' }}>
                                    <div>
                                        <div className="fw8 fs14">ยังไม่มีกิจกรรมสำหรับสมรรถนะนี้</div>
                                        <div className="muted fs12 mt4">ต้องเพิ่มกิจกรรมในหน้าแผน IDP ก่อน จึงจะอัปเดตความก้าวหน้าและส่งหัวหน้าตรวจสอบได้</div>
                                    </div>
                                    <span className="b bt">ต้องเพิ่มกิจกรรม</span>
                                </div>
                            </div>
                        )}

                        {acts.map((act, aIdx) => {
                            const form = getForm(g.cd, aIdx);
                            const activityStatus = getIDPActivityApprovalStatus(act);
                            const done = isEmployeeIDPActivityDone(act);
                            const displayStatus = done
                                ? { label: 'เสร็จสิ้นกิจกรรม', cls: 'bg' }
                                : status === 'rejected'
                                    ? { label: 'ต้องแก้ไข', cls: 'bt' }
                                    : activityStatus;
                            return (
                                <div key={aIdx} className="card mb10">
                                    <div className="ch">
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: act.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{act.ic}</div>
                                        <div style={{ flex: 1, marginLeft: '10px' }}>
                                            <div className="fw7 fs13">{act.t}</div>
                                            <div className="muted fs12 mt4">{act.m} · ครบ {act.due}</div>
                                        </div>
                                        <span className={`b ${displayStatus.cls}`}>{displayStatus.label}</span>
                                    </div>

                                    <div className="cb" style={{ paddingTop: '10px' }}>
                                        {canEdit && !done && (
                                            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '12px', marginBottom: '12px' }}>
                                                <div className="fw7 fs12 mb8">บันทึกความก้าวหน้าใหม่</div>
                                                <div className="fg mb8">
                                                    <label className="lbl" style={{ fontWeight: 500, fontSize: '11px' }}>บันทึก</label>
                                                    <textarea
                                                        className="ta"
                                                        style={{ minHeight: '52px', fontSize: '12px' }}
                                                        placeholder="สรุปสิ่งที่ทำ ผลที่ได้รับ..."
                                                        value={form.note}
                                                        onChange={e => setForm(g.cd, aIdx, { note: e.target.value })}
                                                    />
                                                </div>
                                                <div className="g2 mb8">
                                                    <div>
                                                        <div className="lbl mb8" style={{ fontSize: '11px' }}>แนบหลักฐาน <span className="lbl-opt">(ถ้ามี)</span></div>
                                                        <label className="upload-area" style={{ width: '100%', padding: '12px', background: '#fff', cursor: 'pointer', display: 'block' }}>
                                                            <input
                                                                type="file"
                                                                style={{ display: 'none' }}
                                                                onChange={e => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) setForm(g.cd, aIdx, { fileName: file.name });
                                                                    e.currentTarget.value = '';
                                                                }}
                                                            />
                                                                        <div className="fw6 fs12">{form.fileName || 'คลิกเพื่อแนบไฟล์'}</div>
                                                            <div className="muted fs11">PDF, Word, รูปภาพ</div>
                                                        </label>
                                                    </div>
                                                    <div>
                                                        <div className="fg">
                                                            <label className="lbl" style={{ fontWeight: 500, fontSize: '11px' }}>URL หลักฐาน</label>
                                                            <input
                                                                className="inp"
                                                                style={{ fontSize: '12px' }}
                                                                placeholder="https://..."
                                                                value={form.evidenceUrl}
                                                                onChange={e => setForm(g.cd, aIdx, { evidenceUrl: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="fg mb0">
                                                            <label className="lbl" style={{ fontWeight: 500, fontSize: '11px' }}>คำอธิบาย</label>
                                                            <textarea
                                                                className="ta"
                                                                style={{ minHeight: '48px', fontSize: '12px' }}
                                                                placeholder="อธิบายหลักฐานหรือรายละเอียดเพิ่มเติม..."
                                                                value={form.evidenceDesc}
                                                                onChange={e => setForm(g.cd, aIdx, { evidenceDesc: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                                                    <button className="btn btn-s btn-sm" type="button" onClick={() => saveProgress(g.cd, aIdx, 'draft')}>บันทึกร่าง</button>
                                                    <button className="btn btn-t btn-sm" type="button" onClick={() => saveProgress(g.cd, aIdx, 'saved')}>บันทึกความก้าวหน้า</button>
                                                    <button className="btn btn-g btn-sm" type="button" onClick={() => saveProgress(g.cd, aIdx, 'complete')}>กิจกรรมเสร็จสิ้น</button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="fw7 fs12 mb8 muted">ประวัติการอัปเดต</div>
                                        {act.logs.map((L, lIdx) => (
                                            <div key={lIdx} className="flex ic g8" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', background: L.type === 'reject' ? '#FEF2F2' : 'transparent' }}>
                                                <div style={{ width: '60px', fontSize: '11px', color: 'var(--text3)', flexShrink: 0 }}>{L.d}</div>
                                                <div style={{ flex: 1, fontSize: '12px' }}>{L.n}</div>
                                                <span className="muted fs11">by {L.by}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        <div className="card" style={{ borderStyle: 'dashed', background: '#fff' }}>
                            <div className="cb flex ic jb g12" style={{ flexWrap: 'wrap' }}>
                                <div>
                                    <div className="fw8 fs13">ส่งสมรรถนะนี้ให้หัวหน้าตรวจสอบ</div>
                                    <div className={`fs12 ${summary.canSubmit ? 'gcc' : 'muted'}`} style={{ marginTop: '3px' }}>
                                        {status === 'submitted'
                                            ? 'ส่งแล้ว รอหัวหน้าตรวจสอบ'
                                            : status === 'done'
                                                ? 'หัวหน้าตรวจผ่านแล้ว'
                                                : !hasActivities
                                                    ? 'ต้องเพิ่มกิจกรรมในแผน IDP ก่อน จึงจะส่งหัวหน้าตรวจสอบได้'
                                                : summary.canSubmit
                                                    ? 'กิจกรรมครบแล้ว สามารถส่งให้หัวหน้าตรวจสอบได้'
                                                    : `ต้องทำกิจกรรมให้ครบก่อน ตอนนี้เสร็จแล้ว ${summary.doneCount}/${summary.totalCount} กิจกรรม`}
                                    </div>
                                </div>
                                <button
                                    className="btn btn-p"
                                    disabled={!summary.canSubmit || status === 'submitted' || status === 'done'}
                                    style={{
                                        opacity: summary.canSubmit && status !== 'submitted' && status !== 'done' ? 1 : 0.42,
                                        cursor: summary.canSubmit && status !== 'submitted' && status !== 'done' ? 'pointer' : 'not-allowed'
                                    }}
                                    onClick={() => submitGapProgress(g.cd, acts)}
                                >
                                    ส่งให้หัวหน้าตรวจสอบ
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </>
    );
};

export const EmployeeIDPDetail: React.FC = () => {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [activeRound, setActiveRound] = useState("current");

    const pastRounds = [
        {
            id: "r2567",
            n: "รอบประเมิน 2567",
            isCurrent: false,
            gaps: [
                {
                    cd: "CC-003",
                    n: "การทำงานเป็นทีม",
                    t: "CC",
                    gap: 1,
                    acts: [
                        {
                            ic: "",
                            t: "Peer Learning / Group Activity",
                            m: "Social Learning",
                            logs: [
                                { d: "5 พ.ค. 67", n: "เริ่มกิจกรรมกลุ่มครั้งที่ 1", by: "สมชาย มีสุข", type: "log", evidence: "team_activity_round1.pdf" },
                                { d: "30 มิ.ย. 67", n: "เสร็จสิ้นกิจกรรมและสรุปผล", by: "สมชาย มีสุข", type: "done", evidence: "team_summary_final.pdf" }
                            ]
                        }
                    ]
                },
                {
                    cd: "FC2-061",
                    n: "การใช้เทคโนโลยีดิจิทัล",
                    t: "FC",
                    gap: 1,
                    acts: [
                        {
                            ic: "",
                            t: "อบรม AI & Data Analytics",
                            m: "Formal Learning",
                            logs: [
                                { d: "10 มิ.ย. 67", n: "ลงทะเบียนหลักสูตรและเข้าร่วมครบตามเกณฑ์", by: "สมชาย มีสุข", type: "log", evidence: "course_register.pdf" },
                                { d: "28 มิ.ย. 67", n: "ผ่านการอบรมและส่งใบประกาศนียบัตร", by: "สมชาย มีสุข", type: "done", evidence: "certificate_ai_data.pdf" }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            id: "r2566",
            n: "รอบประเมิน 2566",
            isCurrent: false,
            gaps: [
                {
                    cd: "FC2-062",
                    n: "การวิเคราะห์ข้อมูล",
                    t: "FC",
                    gap: 1,
                    acts: [
                        {
                            ic: "",
                            t: "โครงการพัฒนาระบบฐานข้อมูล",
                            m: "Experiential Learning",
                            logs: [
                                { d: "15 ก.ค. 66", n: "เริ่มต้นวิเคราะห์ระบบฐานข้อมูลเดิม", by: "สมชาย มีสุข", type: "log", evidence: "database_review.docx" },
                                { d: "31 ส.ค. 66", n: "เสร็จสิ้นโครงการและส่งมอบรายงาน", by: "สมชาย มีสุข", type: "done", evidence: "database_project_final.pdf" }
                            ]
                        }
                    ]
                }
            ]
        }
    ];

    const rounds = [{ id: "current", n: "รอบประเมิน 2568", isCurrent: true }, ...pastRounds];
    const activeRoundData = rounds.find(round => round.id === activeRound) || rounds[0];

    const currentGaps = IDP_GAPS_DATA.map(gap => {
        const activities = IDP_ACTIVITIES_DATA[gap.cd] || [];
        const doneCount = activities.filter((act: any) => act.result === "done").length;
        return { ...gap, gapValue: Math.max(gap.exp - gap.actual, 0), acts: activities, doneCount };
    });

    const timelineActs = IDP_GAPS_DATA.flatMap(gap =>
        (IDP_ACTIVITIES_DATA[gap.cd] || []).map((act: any, idx: number) => ({
            ...act,
            id: `${gap.cd}-${idx}`,
            gapCd: gap.cd,
            gapN: gap.n,
            gapT: gap.t
        }))
    );

    const cntTotal = timelineActs.length;
    const cntDone = timelineActs.filter(act => act.result === "done").length;
    const cntFailed = timelineActs.filter(act => act.result === "failed").length;
    const cntInprog = cntTotal - cntDone - cntFailed;

    const getGapTagClass = (type: string) => type === "CC" ? "tag-cc" : type === "MC" ? "tag-mc" : "tag-fc";
    const getResultMeta = (result: string | null) => {
        if (result === "done") return { color: "var(--green)", bg: "var(--green-bg)", label: "เสร็จสิ้น", badge: "bg" };
        if (result === "failed") return { color: "var(--red)", bg: "var(--red-bg)", label: "ไม่ผ่าน", badge: "br" };
        return { color: "var(--blue)", bg: "var(--blue-lt)", label: "กำลังดำเนินการ", badge: "bt" };
    };
    const getMethodMeta = (method: string) => {
        if (method === "Formal Learning") return { color: "var(--blue)", bg: "var(--blue-lt)" };
        if (method === "Social Learning") return { color: "var(--green)", bg: "var(--green-bg)" };
        return { color: "var(--orange)", bg: "#FFF7ED" };
    };
    const getStatusMeta = (status: string) => {
        if (status === "submitted") return { cls: "by", label: "รออนุมัติ" };
        if (status === "approved") return { cls: "bg", label: "อนุมัติแล้ว" };
        if (status === "rejected") return { cls: "br", label: "ไม่ผ่าน" };
        return { cls: "bb", label: "Draft" };
    };

    return (
        <>
            <div className="flex ic jb mb20">
                <div>
                    <div className="sec-t">รายละเอียด IDP </div>
                    <div className="sec-s">ภาพรวม · Timeline · ประวัติย้อนหลัง</div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "6px", padding: "4px 12px", background: "var(--navy)", borderRadius: "20px" }}>
                        <span style={{ fontSize: "12px" }}></span>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>รอบประเมิน 2568</span>
                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,.6)" }}>รอบปัจจุบัน</span>
                    </div>
                </div>
                <button className="btn btn-s"> Export PDF</button>
            </div>

            <div className="g4 mb20">
                <div className="sc" style={{ borderTop: "3px solid var(--navy)" }}>
                    <div className="sl">กิจกรรมทั้งหมด</div>
                    <div className="sv" style={{ color: "var(--navy)" }}>{cntTotal}</div>
                    <div className="ss muted">รอบปัจจุบัน</div>
                </div>
                <div className="sc" style={{ borderTop: "3px solid var(--green)" }}>
                    <div className="sl">เสร็จสิ้น</div>
                    <div className="sv gcc">{cntDone}</div>
                    <div className="ss muted">กิจกรรม</div>
                </div>
                <div className="sc" style={{ borderTop: "3px solid var(--blue)" }}>
                    <div className="sl">กำลังดำเนินการ</div>
                    <div className="sv bc">{cntInprog}</div>
                    <div className="ss muted">กิจกรรม</div>
                </div>
                <div className="sc" style={{ borderTop: "3px solid var(--red)" }}>
                    <div className="sl">ไม่ผ่าน</div>
                    <div className="sv rc">{cntFailed}</div>
                    <div className="ss muted">กิจกรรม</div>
                </div>
            </div>

            <div className="card mb20">
                <div className="ch">
                    <div>
                        <div className="ct"> Timeline กิจกรรม IDP</div>
                        <div className="cs">กดที่กิจกรรมเพื่อดูรายละเอียดและหลักฐาน</div>
                    </div>
                </div>
                <div className="cb" style={{ padding: 0 }}>
                    {timelineActs.map((act, index) => {
                        const meta = getResultMeta(act.result);
                        const methodMeta = getMethodMeta(act.m);
                        const isOpen = expandedId === act.id;
                        return (
                            <div key={act.id} style={{ borderBottom: index === timelineActs.length - 1 ? "none" : "1px solid var(--border)" }}>
                                <div
                                    style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 18px", cursor: "pointer", transition: ".15s" }}
                                    onClick={() => setExpandedId(isOpen ? null : act.id)}
                                >
                                    <div style={{ width: "4px", height: "48px", borderRadius: "2px", background: meta.color, flexShrink: 0 }} />
                                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: act.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>{act.ic}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                                            <span className="fw7 fs13">{act.t}</span>
                                            <span className={getGapTagClass(act.gapT)} style={{ fontSize: "9px" }}>{act.gapT}</span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
                                            <span style={{ fontSize: "11px", color: "var(--text3)" }}>{act.gapCd} · {act.gapN}</span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px", flexWrap: "wrap" }}>
                                            <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "10px", background: methodMeta.bg, color: methodMeta.color }}>{act.m}</span>
                                            <span style={{ fontSize: "11px", color: "var(--text3)" }}>ครบ {act.due}</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "center", flexShrink: 0 }}>
                                        <div style={{ fontSize: "18px", fontWeight: 800, color: meta.color }}>{act.logs.length}</div>
                                        <div style={{ fontSize: "10px", color: "var(--text3)" }}>บันทึก</div>
                                    </div>
                                    <span className={`b ${meta.badge}`} style={{ flexShrink: 0 }}>{meta.label}</span>
                                    <span style={{ fontSize: "12px", color: "var(--text3)", flexShrink: 0 }}>{isOpen ? "▾" : "▸"}</span>
                                </div>

                                {act.result === "failed" && (
                                    <div style={{ background: "#FEF2F2", borderTop: "1px solid #FECACA", padding: "10px 18px 10px 36px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                                        <span style={{ fontSize: "16px", flexShrink: 0 }}></span>
                                        <div>
                                            <div className="fw7 fs12" style={{ color: "var(--red)" }}>ไม่ผ่าน · {act.rejectedBy} · {act.rejectedDate}</div>
                                            <div style={{ fontSize: "12px", color: "#991B1B", marginTop: "3px" }}>"{act.rejectComment}"</div>
                                        </div>
                                    </div>
                                )}

                                {isOpen && (
                                    <div style={{ background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
                                        <div style={{ padding: "14px 18px 6px" }}>
                                            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "10px" }}>
                                                ประวัติการดำเนินงาน
                                            </div>
                                            <div style={{ position: "relative", paddingLeft: "28px" }}>
                                                <div style={{ position: "absolute", left: "9px", top: 0, bottom: 0, width: "2px", background: "var(--border)", borderRadius: "1px" }} />
                                                {act.logs.map((log: any, logIdx: number) => {
                                                    const dotColor = log.type === "reject" ? "var(--red)" : log.type === "done" ? "var(--green)" : "var(--blue)";
                                                    return (
                                                        <div key={logIdx} style={{ position: "relative", paddingBottom: logIdx === act.logs.length - 1 ? 0 : "14px" }}>
                                                            <div style={{ position: "absolute", left: "-24px", top: "2px", width: "12px", height: "12px", borderRadius: "50%", background: dotColor, border: "2px solid #fff", boxShadow: `0 0 0 2px ${dotColor}` }} />
                                                            <div style={{
                                                                background: "#fff",
                                                                border: "1px solid var(--border)",
                                                                borderRadius: "var(--r)",
                                                                padding: "10px 12px",
                                                                borderLeft: log.type === "reject" ? "3px solid var(--red)" : log.type === "done" ? "3px solid var(--green)" : undefined
                                                            }}>
                                                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                                                                    <div>
                                                                        <div style={{ fontSize: "12px", fontWeight: 600, color: log.type === "reject" ? "var(--red)" : log.type === "done" ? "var(--green)" : "var(--text)" }}>{log.n}</div>
                                                                        <div style={{ fontSize: "11px", color: "var(--text3)", marginTop: "2px" }}>by {log.by}</div>
                                                                    </div>
                                                                    <div style={{ fontSize: "11px", color: "var(--text3)", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>{log.d}</div>
                                                                </div>
                                                                {log.evidence && (
                                                                    <div style={{ marginTop: "8px", padding: "6px 10px", background: "var(--blue-lt)", borderRadius: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                                                                        <span style={{ fontSize: "14px" }}></span>
                                                                        <span style={{ fontSize: "11px", color: "var(--blue)", fontWeight: 600 }}>{log.evidence}</span>
                                                                        <span style={{ fontSize: "10px", color: "var(--text3)", marginLeft: "auto" }}>คลิกเพื่อดู →</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="card">
                <div className="ch" style={{ flexDirection: "column", alignItems: "flex-start", gap: "12px" }}>
                    <div className="ct"> ประวัติ IDP ย้อนหลัง</div>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {rounds.map(round => {
                            const isActive = activeRound === round.id;
                            return (
                                <button
                                    key={round.id}
                                    type="button"
                                    onClick={() => setActiveRound(round.id)}
                                    style={{
                                        padding: "5px 14px",
                                        borderRadius: "20px",
                                        fontSize: "12px",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        transition: ".15s",
                                        border: `1px solid ${isActive ? "transparent" : "var(--border)"}`,
                                        background: isActive ? "var(--navy)" : "var(--bg)",
                                        color: isActive ? "#fff" : "var(--text2)"
                                    }}
                                >
                                    {round.n}{round.isCurrent ? " (ปัจจุบัน)" : ""}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="cb" style={{ paddingTop: 0 }}>
                    {activeRoundData.isCurrent ? (
                        <div style={{ padding: "16px 0" }}>
                            {currentGaps.map(gap => {
                                const statusMeta = getStatusMeta(gap.status);
                                const pct = gap.acts.length ? Math.round((gap.doneCount / gap.acts.length) * 100) : 0;
                                return (
                                    <div key={gap.cd} style={{ padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                            <span className={getGapTagClass(gap.t)}>{gap.t}</span>
                                            <span className="fw7 fs13">{gap.n}</span>
                                            <span className="muted fs12">{gap.cd} · Gap {gap.gapValue}</span>
                                            <span className={`b ${statusMeta.cls}`} style={{ marginLeft: "auto" }}>{statusMeta.label}</span>
                                        </div>
                                        <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                                            <div className="pw" style={{ flex: 1, height: "6px" }}>
                                                <div className="pb" style={{ width: `${pct}%`, background: pct === 100 ? "var(--green)" : "var(--blue)" }} />
                                            </div>
                                            <span style={{ fontSize: "11px", color: "var(--text3)" }}>เสร็จแล้ว {gap.doneCount}/{gap.acts.length} กิจกรรม</span>
                                        </div>
                                        {!!gap.acts.length && (
                                            <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                                                {gap.acts.map((act: any, actIdx: number) => {
                                                    const meta = getResultMeta(act.result);
                                                    return (
                                                        <div key={actIdx} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 10px", background: "var(--bg)", borderRadius: "var(--r)", border: "1px solid var(--border)" }}>
                                                            <span style={{ fontSize: "16px" }}>{act.ic}</span>
                                                            <div style={{ flex: 1 }}>
                                                                <div className="fw6 fs12">{act.t}</div>
                                                                <div className="muted fs11">{act.m} · ครบ {act.due}</div>
                                                            </div>
                                                            <span className={`b ${meta.badge}`}>{meta.label}</span>
                                                            <span className="muted fs11">{act.logs.length} บันทึก</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ padding: "16px 0" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", background: "var(--green-bg)", border: "1px solid var(--green-md)", borderRadius: "var(--r)", marginBottom: "16px" }}>
                                <span></span>
                                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--green)" }}>{activeRoundData.n} — เสร็จสิ้นแล้ว</span>
                            </div>
                            {((activeRoundData as { gaps?: any[] }).gaps || []).map((gap: any, idx: number) => (
                                <div key={`${gap.cd}-${idx}`} style={{ padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
                                        <span className={getGapTagClass(gap.t)}>{gap.t}</span>
                                        <span className="fw7 fs13">{gap.n}</span>
                                        <span className="muted fs12">{gap.cd} · Gap {gap.gap}</span>
                                        <span className="b bg" style={{ marginLeft: "auto" }}>เสร็จสิ้น</span>
                                    </div>
                                    {gap.acts.map((act: any, actIdx: number) => (
                                        <div key={actIdx} style={{ marginBottom: "8px", padding: "8px 12px", background: "var(--bg)", borderRadius: "var(--r)", borderLeft: "3px solid var(--green)" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                                                <span style={{ fontSize: "15px" }}>{act.ic}</span>
                                                <span className="fw6 fs12">{act.t}</span>
                                                <span className="muted fs11">{act.m}</span>
                                                <span className="b bg" style={{ marginLeft: "auto", fontSize: "9px" }}>ผ่านแล้ว </span>
                                            </div>
                                            {act.logs.map((log: any, logIdx: number) => (
                                                <div key={logIdx} style={{ display: "flex", gap: "8px", padding: "6px 0", borderTop: "1px dashed var(--border)", alignItems: "flex-start" }}>
                                                    <span style={{ width: "56px", fontSize: "10px", color: "var(--text3)", flexShrink: 0, paddingTop: "1px" }}>{log.d}</span>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: "11px", color: log.type === "done" ? "var(--green)" : "var(--text2)", fontWeight: log.type === "done" ? 700 : 400 }}>{log.n}</div>
                                                        {log.evidence && (
                                                            <div style={{ marginTop: "4px", display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 9px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "20px" }}>
                                                                <span style={{ fontSize: "12px" }}></span>
                                                                <span style={{ fontSize: "11px", color: "var(--blue)", fontWeight: 600 }}>{log.evidence}</span>
                                                                <span style={{ fontSize: "10px", color: "var(--text3)" }}>↗</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span style={{ fontSize: "10px", color: "var(--text3)", flexShrink: 0, whiteSpace: "nowrap" }}>by {log.by}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
