import React, { useState } from 'react';
import { ArrowDownAZ, ArrowUpAZ } from 'lucide-react';
import { DEPT_STRUCTURE } from '../data';

type FacultyOverviewPerson = {
    id: string;
    name: string;
    position: string;
    workline: string;
    dept: string;
    group: string;
    unit: string;
    supervisor: string;
    higherSupervisor: string;
    assessed: boolean;
    actualScore: number;
    expectedScore: number;
    gap: number;
    gaps: { code: string; name: string; expected: number; actual: number; gap: number; missing: string[]; comment: string }[];
    idpStatus: "completed" | "in_progress" | "pending" | "draft" | "no_idp";
    idpTopics: string[];
};

type SupportOrgMap = Record<string, { work: string; units?: string[] }[]>;

const fallbackText = (value: any, fallback: string) => {
    const text = String(value || "").trim();
    return text || fallback;
};

const getTextSeed = (value: string) => value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);

const getFacultyDeptParts = (user: any) => fallbackText(user.d, "ไม่ระบุหน่วยงาน").split(" > ").map((part: string) => part.trim()).filter(Boolean);

const normalizeOrgText = (value: string) => value
    .toLowerCase()
    .replace(/ฝ่าย|งาน|หน่วย|และ|การ|ทาง|ของ|คณะ|หลักสูตร/g, "")
    .replace(/\s+/g, "")
    .trim();

const getOrgMatchScore = (source: string, target: string) => {
    const a = normalizeOrgText(source);
    const b = normalizeOrgText(target);
    if (!a || !b) return 0;
    if (a === b) return 120;
    if (a.includes(b) || b.includes(a)) return Math.min(a.length, b.length) >= 4 ? 80 : 0;
    const sourceTokens: string[] = a.match(/[ก-๙a-z0-9]{4,}/g) ?? [];
    const targetTokens: string[] = b.match(/[ก-๙a-z0-9]{4,}/g) ?? [];
    return sourceTokens.reduce<number>((score, token) => (
        score + (targetTokens.some(item => item.includes(token) || token.includes(item)) ? 18 : 0)
    ), 0);
};

const resolveSupportOrgPath = (user: any, supportOrg: SupportOrgMap = DEPT_STRUCTURE) => {
    const parts = getFacultyDeptParts(user);
    const rawDept = parts[0] || "";
    const candidates: string[] = [
        ...parts,
        fallbackText(user.p, ""),
        fallbackText(user.sup, ""),
        fallbackText(user.evaluator2, "")
    ].filter(Boolean);

    for (const [dept, works] of Object.entries(supportOrg)) {
        if (rawDept === dept) {
            const work = works.find(item => item.work === parts[1] || (item.units || []).includes(parts[1]));
            return { dept, work: work?.work || parts[1] || dept, unit: parts[2] || "" };
        }
    }

    const matches = Object.entries(supportOrg).flatMap(([dept, works]) => {
        const deptScore = Math.max(...candidates.map(candidate => getOrgMatchScore(candidate, dept)), 0);
        const workMatches = works.map(work => {
            const labels = [work.work, ...(work.units || [])];
            const score = Math.max(...candidates.flatMap(candidate => labels.map(label => getOrgMatchScore(candidate, label))), 0);
            const unit = (work.units || []).find(unitName => candidates.some(candidate => getOrgMatchScore(candidate, unitName) >= 60)) || "";
            return { dept, work: work.work, unit, score: score + (deptScore >= 60 ? 8 : 0) };
        });

        return [
            { dept, work: works[0]?.work || dept, unit: "", score: deptScore },
            ...workMatches
        ];
    }).sort((a, b) => b.score - a.score);

    const best = matches[0];
    if (best && best.score >= 36) return { dept: best.dept, work: best.work, unit: best.unit };

    return { dept: rawDept || "ไม่ระบุฝ่าย", work: parts[1] || rawDept || "ไม่ระบุงาน", unit: parts[2] || "" };
};

const getFacultyWorkline = (user: any) => fallbackText(user.w, "ไม่ระบุสายงาน");

const getFacultyDept = (user: any, supportOrg?: SupportOrgMap) => {
    if (getFacultyWorkline(user).includes("สนับสนุน")) return resolveSupportOrgPath(user, supportOrg).dept;
    return getFacultyDeptParts(user)[0] || "ไม่ระบุหน่วยงาน";
};

const getFacultyGroup = (user: any, supportOrg?: SupportOrgMap) => {
    const parts = getFacultyDeptParts(user);
    const workline = getFacultyWorkline(user);

    if (workline.includes("สนับสนุน")) return resolveSupportOrgPath(user, supportOrg).work || fallbackText(user.p, "ไม่ระบุกลุ่มงาน");
    if (workline.includes("วิชาการ")) return parts[0] || fallbackText(user.p, "กลุ่มอาจารย์");
    return parts[0] || fallbackText(user.p, "ไม่ระบุกลุ่มงาน");
};

const getAssessmentStatusLabel = (person: FacultyOverviewPerson) => {
    if (!person.assessed) return { label: "ยังไม่เริ่ม/ยังไม่ส่ง", cls: "bgr" };
    if (person.gap < 0) return { label: "ต้องพัฒนา", cls: "br" };
    return { label: "ผ่านเกณฑ์", cls: "bg" };
};

const buildFacultyOverviewPeople = (users: any[], supportOrg?: SupportOrgMap): FacultyOverviewPerson[] => users
    .filter(user => user.act !== false && user.r !== "manager")
    .map((user, index) => {
        const id = fallbackText(user.sso, `user-${index}`);
        const seed = getTextSeed(`${id}${user.n || ""}`);
        const assessed = !["draft", "", undefined, null].includes(user.evalStatus);
        const expectedScore = 3 + (seed % 3) * 0.25;
        const actualScore = assessed ? Math.max(1, Math.min(5, expectedScore + (((seed % 7) - 3) * 0.25))) : 0;
        const gap = assessed ? Number((actualScore - expectedScore).toFixed(2)) : Number((-expectedScore).toFixed(2));
        const hasGap = gap < 0;
        const competencyPool = getFacultyWorkline(user).includes("วิชาการ")
            ? [
                { code: "FC-AI", name: "AI Literacy" },
                { code: "FC-TEACH", name: "การสอนและถ่ายทอดองค์ความรู้" },
                { code: "CC-DATA", name: "การใช้ข้อมูลเพื่อการตัดสินใจ" }
            ]
            : [
                { code: "FC-DIGI", name: "การใช้เทคโนโลยีดิจิทัล" },
                { code: "FC-DATA", name: "การวิเคราะห์ข้อมูล" },
                { code: "CC-TEAM", name: "การทำงานเป็นทีม" }
            ];
        const gaps = hasGap
            ? competencyPool.slice(0, 1 + (seed % 2)).map((item, gapIndex) => ({
                ...item,
                expected: expectedScore,
                actual: Math.max(1, actualScore - gapIndex * 0.25),
                gap: Number((Math.max(1, actualScore - gapIndex * 0.25) - expectedScore).toFixed(2)),
                missing: [`ข้อ ${2 + gapIndex}.3 ยังไม่แสดงพฤติกรรมครบ`, `ข้อ ${2 + gapIndex}.4 ต้องมีหลักฐานการนำไปใช้จริง`],
                comment: "หัวหน้าระบุให้เพิ่มกิจกรรมพัฒนาเพื่อปิดช่องว่างรายพฤติกรรม"
            }))
            : [];
        const idpStatus: FacultyOverviewPerson["idpStatus"] =
            !hasGap ? "completed"
                : user.evalStatus === "dept_evaluated" ? "pending"
                    : user.evalStatus === "unit_evaluated" ? "in_progress"
                        : user.evalStatus === "self_submitted" ? "draft"
                            : "no_idp";
        const supportPath = getFacultyWorkline(user).includes("สนับสนุน") ? resolveSupportOrgPath(user, supportOrg) : null;

        return {
            id,
            name: `${fallbackText(user.t, "")}${fallbackText(user.n, "ไม่ระบุชื่อ")}`,
            position: fallbackText(user.p, "ไม่ระบุตำแหน่ง"),
            workline: getFacultyWorkline(user),
            dept: getFacultyDept(user, supportOrg),
            group: getFacultyGroup(user, supportOrg),
            unit: supportPath?.unit || getFacultyGroup(user, supportOrg),
            supervisor: fallbackText(user.sup, "ยังไม่ระบุหัวหน้างาน"),
            higherSupervisor: fallbackText(user.evaluator2, "ยังไม่ระบุผู้บังคับบัญชา"),
            assessed,
            actualScore,
            expectedScore,
            gap,
            gaps,
            idpStatus,
            idpTopics: gaps.length ? gaps.map(item => item.name) : ["ไม่มีช่องว่างที่ต้องทำแผนพัฒนา"]
        };
    });

const summarizePeople = (people: FacultyOverviewPerson[]) => {
    const assessed = people.filter(person => person.assessed);
    const failed = assessed.filter(person => person.gap < 0);
    const passed = assessed.length - failed.length;

    return { total: people.length, assessed: assessed.length, passed, failed: failed.length };
};

const groupPeopleBy = (people: FacultyOverviewPerson[], key: keyof FacultyOverviewPerson) => Array.from(new Set(people.map(person => String(person[key]))))
    .map(name => {
        const members = people.filter(person => String(person[key]) === name);
        return { name, members, summary: summarizePeople(members) };
    })
    .sort((a, b) => b.summary.failed - a.summary.failed || b.summary.total - a.summary.total || a.name.localeCompare(b.name, "th"));

const groupReminderUnits = (members: FacultyOverviewPerson[]) => Array.from(new Set(members.map(person => person.unit || person.group || "ไม่ระบุหน่วยงาน")))
    .map(name => ({ name, members: members.filter(person => (person.unit || person.group || "ไม่ระบุหน่วยงาน") === name) }))
    .sort((a, b) => b.members.length - a.members.length || a.name.localeCompare(b.name, "th"));

const ReminderNames: React.FC<{ members: FacultyOverviewPerson[] }> = ({ members }) => (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
        {members.slice(0, 5).map(person => (
            <span key={person.id} className="b bgr" style={{ fontSize: "11px", padding: "4px 7px" }}>{person.name}</span>
        ))}
        {members.length > 5 && <span className="b bb" style={{ fontSize: "11px", padding: "4px 7px" }}>อีก {members.length - 5} คน</span>}
    </div>
);

const assessmentTone = {
    pass: { color: "#166534", bg: "#DCFCE7", border: "#86EFAC", bar: "#22c55e" },
    fail: { color: "#374151", bg: "#F9FAFB", border: "#E5E7EB", bar: "#e5e7eb" },
    neutral: { color: "#475569", bg: "#F8FAFC", border: "#CBD5E1" }
};

const statusPillStyle = (tone: "pass" | "fail" | "neutral"): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "5px 10px",
    borderRadius: "999px",
    background: assessmentTone[tone].bg,
    color: assessmentTone[tone].color,
    border: `1px solid ${assessmentTone[tone].border}`,
    fontWeight: 800,
    fontSize: "12px",
    lineHeight: 1.2
});

const getStatusTone = (person: FacultyOverviewPerson): "pass" | "fail" | "neutral" => {
    if (!person.assessed) return "neutral";
    return person.gap < 0 ? "fail" : "pass";
};

const ResultBar: React.FC<{ passed: number; failed: number }> = ({ passed, failed }) => {
    const total = Math.max(1, passed + failed);

    return (
        <div style={{ height: "12px", borderRadius: "999px", overflow: "hidden", display: "flex", background: "#E2E8F0", boxShadow: "inset 0 0 0 1px rgba(15,23,42,.08)" }}>
            <div style={{ width: `${(passed / total) * 100}%`, background: assessmentTone.pass.bar }} />
            <div style={{ width: `${(failed / total) * 100}%`, background: assessmentTone.fail.bar }} />
        </div>
    );
};

const DeanHRGapOverview: React.FC<{ users: any[], supportOrg?: SupportOrgMap }> = ({ users, supportOrg }) => {
    const [selectedDept, setSelectedDept] = useState<string | null>(null);
    const [isSelfReminderOpen, setIsSelfReminderOpen] = useState(false);
    const [overviewMode, setOverviewMode] = useState<"dept" | "group">("dept");
    const orgStructure = supportOrg || DEPT_STRUCTURE;
    const people = buildFacultyOverviewPeople(users, supportOrg);
    const summary = summarizePeople(people);
    const deptGroups = Object.keys(orgStructure).map(name => {
        const members = people.filter(person => person.dept === name);
        return { name, members, summary: summarizePeople(members) };
    });
    const overviewGroups = overviewMode === "dept" ? deptGroups : groupPeopleBy(people, "group");
    const selected = overviewGroups.find(group => group.name === selectedDept);
    const pendingSelfPeople = people.filter(person => !person.assessed);
    const pendingSelfGroups = groupPeopleBy(pendingSelfPeople, "dept");
    const passRate = Math.round((summary.passed / Math.max(1, summary.assessed)) * 100);
    const getDeptSupervisor = (members: FacultyOverviewPerson[]) => members.find(person => person.higherSupervisor)?.higherSupervisor || "ยังไม่ระบุผู้บังคับบัญชา";
    const overviewLabel = overviewMode === "dept" ? "ฝ่าย" : "กลุ่มงาน";
    const switchOverviewMode = (mode: "dept" | "group") => {
        setOverviewMode(mode);
        setSelectedDept(null);
    };

    return (
        <>
            <div className="mb20">
                <div className="sec-t">ภาพรวมผลการประเมินคณะ</div>
                <div className="sec-s">มุมมองสำหรับคณบดีและ HR คณะวิศวกรรมศาสตร์ · รอบประเมิน 2568</div>
            </div>

            <div className="card mb14" style={{ background: "#0F2D5B", color: "#fff" }}>
                <div className="cb">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 120px", gap: "18px", alignItems: "center" }}>
                        <div>
                            <div className="fs12" style={{ opacity: .68 }}>บุคลากรทั้งหมด</div>
                            <div className="fw8" style={{ fontSize: "30px", lineHeight: 1 }}>{summary.total}</div>
                            <div className="fs12" style={{ opacity: .72, marginTop: "6px" }}>รวมทุกสายงาน</div>
                        </div>
                        <div style={{ borderLeft: "1px solid rgba(255,255,255,.16)", paddingLeft: "18px" }}>
                            <div className="fs12" style={{ opacity: .68 }}>ประเมินแล้ว</div>
                            <div className="fw8 fs24">{summary.assessed}</div>
                            <div className="fs12" style={{ opacity: .72 }}>ของทั้งหมด</div>
                        </div>
                        <div style={{ borderLeft: "1px solid rgba(255,255,255,.16)", paddingLeft: "18px" }}>
                            <div className="fs12" style={{ opacity: .68 }}>ผ่านเกณฑ์</div>
                            <div className="fw8 fs24" style={{ color: "#22c55e" }}>{summary.passed}</div>
                            <div className="fs12" style={{ opacity: .72 }}>คน</div>
                        </div>
                        <div style={{ borderLeft: "1px solid rgba(255,255,255,.16)", paddingLeft: "18px" }}>
                            <div className="fs12" style={{ opacity: .68 }}>ไม่ผ่านเกณฑ์</div>
                            <div className="fw8 fs24" style={{ color: "#e5e7eb" }}>{summary.failed}</div>
                            <div className="fs12" style={{ opacity: .72 }}>คน</div>
                        </div>
                        <div style={{ width: "94px", height: "94px", borderRadius: "50%", display: "grid", placeItems: "center", marginLeft: "auto", background: `conic-gradient(#22c55e ${passRate * 3.6}deg, rgba(255,255,255,.16) 0deg)` }}>
                            <div style={{ width: "68px", height: "68px", borderRadius: "50%", display: "grid", placeItems: "center", background: "#173B70", color: "#fff", fontWeight: 800, fontSize: "18px" }}>{passRate}%</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card mb14" style={{ borderLeft: pendingSelfPeople.length ? "4px solid var(--red)" : "4px solid var(--green)" }}>
                <div className="ch">
                    <button
                        type="button"
                        onClick={() => setIsSelfReminderOpen(current => !current)}
                        style={{ border: 0, background: "transparent", padding: 0, textAlign: "left", cursor: "pointer", flex: 1 }}
                    >
                        <div className="ct">{isSelfReminderOpen ? "▾" : "▸"} แจ้งเตือนผู้ที่ยังไม่ประเมินตนเอง</div>
                        <div className="cs">
                            {pendingSelfPeople.length
                                ? `พบ ${pendingSelfPeople.length} คนที่ยังไม่ส่งแบบประเมินตนเอง แยกตามฝ่าย/หน่วยงานด้านล่าง`
                                : "บุคลากรทุกคนส่งแบบประเมินตนเองแล้ว"}
                        </div>
                    </button>
                    <button
                        className="btn btn-p btn-sm"
                        style={{ marginLeft: "auto" }}
                        disabled={pendingSelfPeople.length === 0}
                        onClick={() => alert(`ส่งแจ้งเตือนให้ผู้ที่ยังไม่ประเมินตนเอง ${pendingSelfPeople.length} คนแล้ว`)}
                    >
                        ส่งแจ้งเตือนทั้งหมด
                    </button>
                </div>
                {isSelfReminderOpen && pendingSelfPeople.length > 0 && (
                    <div className="cb" style={{ paddingTop: 0 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "160px minmax(0, 1fr)", gap: "14px", alignItems: "stretch" }}>
                            <div style={{ padding: "14px", borderRadius: "14px", background: "#FEF2F2", border: "1px solid #FECACA", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                                <div className="fs12 fw8" style={{ color: "#991B1B" }}>ยังไม่ประเมินตนเอง</div>
                                <div className="fw8" style={{ fontSize: "28px", lineHeight: 1, color: "#B91C1C", marginTop: "6px" }}>{pendingSelfPeople.length}</div>
                                <div className="fs11 muted mt6">คนที่ต้องติดตามก่อนปิดรอบประเมิน</div>
                            </div>
                            <div style={{ display: "grid", gap: "8px" }}>
                                {pendingSelfGroups.map(group => (
                                    <div key={group.name} style={{ padding: "12px 14px", borderRadius: "12px", background: "#F8FAFC", border: "1px solid var(--border)" }}>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "center" }}>
                                            <div>
                                                <div className="fw7 fs13">{group.name}</div>
                                                <div className="fs11 muted mt4">{group.members.length} คน · {groupReminderUnits(group.members).length} หน่วยงาน</div>
                                            </div>
                                            <button
                                                className="btn btn-s btn-sm"
                                                onClick={() => alert(`ส่งแจ้งเตือนไปยัง ${group.name} จำนวน ${group.members.length} คนแล้ว`)}
                                            >
                                                แจ้งเตือน {group.members.length} คน
                                            </button>
                                        </div>
                                        <div style={{ display: "grid", gap: "6px", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid var(--border)" }}>
                                            {groupReminderUnits(group.members).map(unit => (
                                                <div key={unit.name}>
                                                    <div className="fs11 fw7 muted">{unit.name}</div>
                                                    <ReminderNames members={unit.members} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="card">
                <div className="ch">
                    <div>
                        <div className="ct">ภาพรวมผลการประเมินตาม{overviewLabel}</div>
                        <div className="cs">เลือกดูแยกตามฝ่ายหรือกลุ่มงาน คลิกการ์ดเพื่อดูรายละเอียดรายงานและรายบุคคล</div>
                    </div>
                    <div style={{ marginLeft: "auto", display: "flex", gap: "8px", padding: "4px", borderRadius: "12px", background: "#F1F5F9" }}>
                        {([
                            ["dept", "ฝ่าย"],
                            ["group", "กลุ่มงาน"]
                        ] as const).map(([mode, label]) => (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => switchOverviewMode(mode)}
                                className={`btn btn-sm ${overviewMode === mode ? "btn-p" : "btn-s"}`}
                                style={{ minWidth: "86px", boxShadow: overviewMode === mode ? "0 6px 14px rgba(37,99,235,.18)" : "none" }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="cb">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
                        {overviewGroups.map(dept => {
                            const pctPass = Math.round((dept.summary.passed / Math.max(1, dept.summary.assessed)) * 100);
                            const pending = dept.summary.total - dept.summary.assessed;

                            return (
                                <div
                                    key={dept.name}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => setSelectedDept(dept.name)}
                                    onKeyDown={event => { if (event.key === "Enter" || event.key === " ") setSelectedDept(dept.name); }}
                                    style={{ textAlign: "left", border: "1px solid var(--border)", borderRadius: "18px", background: "#fff", padding: "18px", boxShadow: "0 10px 24px rgba(15,23,42,.07)", cursor: "pointer" }}
                                >
                                    <div className="fs11 fw8 mb6" style={{ color: "var(--teal)", letterSpacing: ".02em" }}>{overviewLabel}</div>
                                    <div className="fw8 fs16 mb8" style={{ color: "var(--navy)" }}>{dept.name}</div>
                                    <div className="fs12 muted mb12">ผู้บังคับบัญชา: {getDeptSupervisor(dept.members)}</div>
                                    <div className="flex ic jb g8 mb10">
                                        <div>
                                            <div className="fw8" style={{ fontSize: "28px", lineHeight: 1, color: "var(--navy)" }}>{dept.summary.assessed}/{dept.summary.total}</div>
                                            <div className="fs11 muted mt4">คนประเมินแล้ว</div>
                                        </div>
                                        <div className="flex g6" style={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
                                            <span style={statusPillStyle("pass")}>ผ่าน {dept.summary.passed}</span>
                                            <span style={statusPillStyle("fail")}>ไม่ผ่าน {dept.summary.failed}</span>
                                        </div>
                                    </div>
                                    <ResultBar passed={dept.summary.passed} failed={dept.summary.failed} />
                                    <div className="flex ic jb g8 mt10">
                                        <span className="fs11 muted">ผ่าน {pctPass}%</span>
                                        <span className="fs11 fw8" style={{ color: pending ? "var(--orange)" : "var(--green)" }}>{pending ? `ยังไม่ประเมิน ${pending} คน` : "ประเมินครบแล้ว"}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {selected && (
                <div className="mo" style={{ zIndex: 300 }} onMouseDown={() => setSelectedDept(null)}>
                    <div className="mo-box" style={{ width: "980px" }} onMouseDown={event => event.stopPropagation()}>
                        <div className="mo-h">
                            <div>
                                <div className="fw8 fs15">{overviewLabel}: {selected.name}</div>
                                <div className="fs12 muted">ผู้บังคับบัญชา: {getDeptSupervisor(selected.members)} · รายละเอียดผลการประเมินรายงานและรายบุคคล</div>
                            </div>
                            <button className="btn btn-s btn-sm" onClick={() => setSelectedDept(null)}>ปิด</button>
                        </div>
                        <div className="mo-b" style={{ display: "grid", gap: "14px" }}>
                            {groupPeopleBy(selected.members, "group").map(group => (
                                <div key={group.name} style={{ border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>
                                    <div style={{ padding: "12px 14px", background: "#F8FAFC", display: "grid", gridTemplateColumns: "1fr auto auto", gap: "12px", alignItems: "center" }}>
                                        <div>
                                            <div className="fw8 fs13">{group.name}</div>
                                            <div className="fs11 muted">หัวหน้างาน: {group.members.find(person => person.supervisor)?.supervisor || "ยังไม่ระบุหัวหน้างาน"}</div>
                                        </div>
                                        <span style={statusPillStyle("pass")}>ผ่าน {group.summary.passed}</span>
                                        <span style={statusPillStyle("fail")}>ไม่ผ่าน {group.summary.failed}</span>
                                    </div>
                                    {group.members.map(person => {
                                        const meta = getAssessmentStatusLabel(person);

                                        return (
                                            <div key={person.id} style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr 88px 88px 88px 124px", gap: "12px", padding: "12px 14px", borderTop: "1px solid var(--border)", alignItems: "center" }}>
                                                <div>
                                                    <div className="fw7 fs13">{person.name}</div>
                                                    <div className="fs11 muted">{person.position}</div>
                                                </div>
                                                <div className="fs12 muted">หน่วยงาน {person.unit}</div>
                                                <div className="fs12">คาดหวัง {person.assessed ? person.expectedScore.toFixed(2) : "-"}</div>
                                                <div className="fs12">ได้จริง {person.assessed ? person.actualScore.toFixed(2) : "-"}</div>
                                                <div className="fs12 fw8" style={{ color: getStatusTone(person) === "fail" ? assessmentTone.fail.color : getStatusTone(person) === "pass" ? assessmentTone.pass.color : assessmentTone.neutral.color }}>{person.assessed ? person.gap.toFixed(2) : "-"}</div>
                                                <div><span className={`b ${meta.cls}`} style={statusPillStyle(getStatusTone(person))}>{meta.label}</span></div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const idpStatusMeta: Record<FacultyOverviewPerson["idpStatus"], { label: string; badge: string; color: string }> = {
    completed: { label: "เสร็จสิ้น", badge: "bg", color: "#15803D" },
    in_progress: { label: "กำลังดำเนินการ", badge: "bt", color: "#0EA5A0" },
    pending: { label: "รออนุมัติ", badge: "by", color: "#FACC15" },
    draft: { label: "ร่าง", badge: "bgr", color: "#FB923C" },
    no_idp: { label: "ยังไม่ทำแผน", badge: "br", color: "#EF4444" }
};

const DeanHRIDPOverview: React.FC<{ users: any[], supportOrg?: SupportOrgMap }> = ({ users, supportOrg }) => {
    const [selectedDept, setSelectedDept] = useState<string | null>(null);
    const [isIdpReminderOpen, setIsIdpReminderOpen] = useState(false);
    const orgStructure = supportOrg || DEPT_STRUCTURE;
    const people = buildFacultyOverviewPeople(users, supportOrg).filter(person => person.gap < 0 || person.idpStatus !== "completed");
    const deptGroups = Object.keys(orgStructure).map(name => {
        const members = people.filter(person => person.dept === name);
        return { name, members, summary: summarizePeople(members) };
    });
    const selected = deptGroups.find(group => group.name === selectedDept);
    const getDoneCount = (members: FacultyOverviewPerson[]) => members.filter(person => person.idpStatus !== "no_idp").length;
    const getFirstValue = (members: FacultyOverviewPerson[], key: "supervisor" | "higherSupervisor") => (
        members.map(person => person[key]).find(Boolean) || "ไม่ระบุ"
    );
    const getOrgWorkCount = (dept: string) => (orgStructure[dept] || []).length;
    const stats = {
        completed: people.filter(person => person.idpStatus === "completed").length,
        in_progress: people.filter(person => person.idpStatus === "in_progress").length,
        pending: people.filter(person => person.idpStatus === "pending").length,
        draft: people.filter(person => person.idpStatus === "draft").length,
        no_idp: people.filter(person => person.idpStatus === "no_idp").length
    };
    const total = Math.max(1, people.length);
    const noIdpPeople = people.filter(person => person.idpStatus === "no_idp");
    const noIdpGroups = deptGroups
        .map(group => ({ ...group, members: group.members.filter(person => person.idpStatus === "no_idp") }))
        .filter(group => group.members.length > 0);

    return (
        <>
            <div className="mb20">
                <div className="sec-t">ภาพรวมแผนพัฒนารายบุคคลคณะ</div>
                <div className="sec-s">ติดตามคอขวดแผนพัฒนารายบุคคลสำหรับเจ้าหน้าที่บุคคลและคณบดี · รอบประเมิน 2568</div>
            </div>

            <div className="card mb14" style={{ borderLeft: "4px solid var(--teal)" }}>
                <div className="cb">
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr", gap: "22px", alignItems: "center" }}>
                        <div>
                            <div className="fw7 fs12 muted mb6">ผู้มีช่องว่างสมรรถนะและเริ่มทำแผนแล้ว</div>
                            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                                <span style={{ color: "var(--teal)", fontSize: "36px", fontWeight: 800 }}>{people.length - stats.no_idp}</span>
                                <span className="fw7 muted">/ {people.length} คน</span>
                            </div>
                            <div className="fs12 muted">ยังไม่ทำแผน <span className="rc fw8">{stats.no_idp} คน</span></div>
                        </div>
                        <div>
                            <div className="fs11 fw7 muted mb6">สัดส่วนสถานะแผนพัฒนา</div>
                            <div style={{ height: "22px", borderRadius: "8px", overflow: "hidden", display: "flex", background: "var(--border)" }}>
                                {Object.entries(stats).map(([key, value]) => (
                                    <div key={key} title={`${idpStatusMeta[key as FacultyOverviewPerson["idpStatus"]].label} ${value} คน`} style={{ width: `${(value / total) * 100}%`, background: idpStatusMeta[key as FacultyOverviewPerson["idpStatus"]].color }} />
                                ))}
                            </div>
                            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "10px" }}>
                                {Object.entries(stats).map(([key, value]) => {
                                    const meta = idpStatusMeta[key as FacultyOverviewPerson["idpStatus"]];
                                    return <span key={key} className="fs11"><span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "3px", background: meta.color, marginRight: "4px" }} />{meta.label} <b>{value}</b></span>;
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="g4 mb14">
                <div className="sc"><div className="sl">เสร็จสิ้น</div><div className="sv gcc">{stats.completed}</div><div className="ss muted">คน</div></div>
                <div className="sc"><div className="sl">กำลังดำเนินการ</div><div className="sv bc">{stats.in_progress}</div><div className="ss muted">คน</div></div>
                <div className="sc"><div className="sl">รออนุมัติ</div><div className="sv yc">{stats.pending}</div><div className="ss muted">คน</div></div>
                <div className="sc"><div className="sl">ยังไม่ทำแผน</div><div className="sv rc">{stats.no_idp}</div><div className="ss muted">คน</div></div>
            </div>

            <div className="mb14">
                <div className="card">
                    <div className="ch">
                        <div>
                            <div className="ct">ความคืบหน้าแผนพัฒนาตามฝ่าย</div>
                            <div className="cs">แสดงตามฝ่ายจากหน้าจัดการโครงสร้างองค์กร คลิกการ์ดเพื่อดูรายงานและรายบุคคล</div>
                        </div>
                    </div>
                    <div className="cb">
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
                            {deptGroups.map(dept => {
                                const done = getDoneCount(dept.members);
                                const pct = Math.round((done / Math.max(1, dept.members.length)) * 100);
                                const missing = dept.members.length - done;
                                const hasPeople = dept.members.length > 0;

                                return (
                                    <div
                                        key={dept.name}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => setSelectedDept(dept.name)}
                                        onKeyDown={event => { if (event.key === "Enter" || event.key === " ") setSelectedDept(dept.name); }}
                                        style={{ textAlign: "left", border: "1px solid var(--border)", borderRadius: "18px", background: "#fff", padding: "18px", boxShadow: "0 10px 24px rgba(15,23,42,.07)", cursor: "pointer" }}
                                    >
                                        <div className="flex ic jb g8 mb12">
                                            <span className="fs11 fw8" style={{ color: "var(--teal)", letterSpacing: ".02em" }}>ฝ่าย</span>
                                            {hasPeople
                                                ? missing > 0 ? <span className="b br">ยังไม่ทำ {missing} คน</span> : <span className="b bg">ครบแล้ว</span>
                                                : <span className="b bgr">ยังไม่มีบุคลากร</span>}
                                        </div>
                                        <div className="fw8 fs16 mb6" style={{ color: "var(--navy)" }}>{dept.name}</div>
                                        <div className="fs12 muted mb14">ผู้บังคับบัญชา: {getFirstValue(dept.members, "higherSupervisor")}</div>
                                        <div className="flex ic jb g8 mb10">
                                            <div>
                                                <div className="fw8" style={{ fontSize: "28px", lineHeight: 1, color: "var(--teal)" }}>{done}/{dept.members.length}</div>
                                                <div className="fs11 muted mt4">คนทำ IDP แล้ว</div>
                                            </div>
                                            <div className="fs12 muted" style={{ textAlign: "right" }}>
                                                <div>{getOrgWorkCount(dept.name)} งานในโครงสร้าง</div>
                                                <div>{pct}% ความคืบหน้า</div>
                                            </div>
                                        </div>
                                        <div className="pw" style={{ height: "8px", overflow: "hidden", background: "#EEF2F7" }}>
                                            <div className="pb" style={{ width: `${pct}%`, background: "var(--teal)" }} />
                                        </div>
                                        <div className="flex ic jb g8 mt10">
                                            <span className="fs11 muted">คลิกเพื่อดูรายละเอียดฝ่าย</span>
                                            <span className="fs11 fw8" style={{ color: missing ? "var(--red)" : "var(--green)" }}>{hasPeople ? missing ? `ค้าง ${missing} คน` : "ไม่มีรายการค้าง" : "รอเชื่อมบุคลากร"}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb14">
                <div className="card" style={{ borderLeft: noIdpPeople.length ? "4px solid var(--red)" : "4px solid var(--green)" }}>
                    <div className="ch">
                        <button
                            type="button"
                            onClick={() => setIsIdpReminderOpen(current => !current)}
                            style={{ border: 0, background: "transparent", padding: 0, textAlign: "left", cursor: "pointer", flex: 1 }}
                        >
                            <div className="ct">{isIdpReminderOpen ? "▾" : "▸"} แจ้งเตือนผู้ที่ยังไม่ทำ IDP</div>
                            <div className="cs">
                                {noIdpPeople.length
                                    ? `พบ ${noIdpPeople.length} คนที่ยังไม่ทำแผนพัฒนารายบุคคล แยกตามฝ่าย/หน่วยงานด้านล่าง`
                                    : "บุคลากรทุกคนจัดทำแผนพัฒนารายบุคคลแล้ว"}
                            </div>
                        </button>
                        <button
                            className="btn btn-p btn-sm"
                            style={{ marginLeft: "auto" }}
                            disabled={noIdpPeople.length === 0}
                            onClick={() => alert(`ส่งแจ้งเตือนไปยังผู้ที่ยังไม่ทำ IDP ${noIdpPeople.length} คนแล้ว`)}
                        >
                            ส่งแจ้งเตือนทั้งหมด
                        </button>
                    </div>
                    {isIdpReminderOpen && (
                    <div className="cb" style={{ paddingTop: 0 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "160px minmax(0, 1fr)", gap: "14px", alignItems: "stretch" }}>
                            <div style={{ padding: "14px", borderRadius: "14px", background: "#FEF2F2", border: "1px solid #FECACA", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                                <div className="fs12 fw8" style={{ color: "#991B1B" }}>ยังไม่ทำ IDP</div>
                                <div className="fw8" style={{ fontSize: "28px", lineHeight: 1, color: "#B91C1C", marginTop: "6px" }}>{noIdpPeople.length}</div>
                                <div className="fs11 muted mt6">คนที่ต้องติดตามก่อนปิดรอบแผนพัฒนา</div>
                            </div>
                            <div style={{ display: "grid", gap: "8px", alignContent: "start" }}>
                                {noIdpGroups.length === 0 && (
                                    <div style={{ padding: "18px", borderRadius: "12px", background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                                        <div className="fw8 fs13" style={{ color: "#166534" }}>ไม่มีรายการค้างแจ้งเตือน</div>
                                        <div className="fs11 muted mt4">ระบบไม่พบผู้ที่ยังไม่ทำ IDP ในรอบนี้</div>
                                    </div>
                                )}
                                {noIdpGroups.map(group => (
                                    <div key={group.name} style={{ padding: "12px 14px", borderRadius: "12px", background: "#F8FAFC", border: "1px solid var(--border)" }}>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "center" }}>
                                            <div>
                                                <div className="fw7 fs13">{group.name}</div>
                                                <div className="fs11 muted mt4">{group.members.length} คน · {groupReminderUnits(group.members).length} หน่วยงาน</div>
                                            </div>
                                            <button
                                                className="btn btn-s btn-sm"
                                                onClick={() => alert(`ส่งแจ้งเตือนไปยัง ${group.name} จำนวน ${group.members.length} คนแล้ว`)}
                                            >
                                                แจ้งเตือน {group.members.length} คน
                                            </button>
                                        </div>
                                        <div style={{ display: "grid", gap: "6px", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid var(--border)" }}>
                                            {groupReminderUnits(group.members).map(unit => (
                                                <div key={unit.name}>
                                                    <div className="fs11 fw7 muted">{unit.name}</div>
                                                    <ReminderNames members={unit.members} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    )}
                </div>
            </div>

            {selected && (
                <div className="mo" style={{ zIndex: 300 }} onMouseDown={() => setSelectedDept(null)}>
                    <div className="mo-box" style={{ width: "900px" }} onMouseDown={event => event.stopPropagation()}>
                        <div className="mo-h">
                            <div>
                                <div className="fw8 fs15">ฝ่าย: {selected.name}</div>
                                <div className="fs12 muted">ผู้บังคับบัญชา: {getFirstValue(selected.members, "higherSupervisor")} · รายละเอียดสถานะแผนพัฒนารายบุคคล</div>
                            </div>
                            <button className="btn btn-s btn-sm" onClick={() => setSelectedDept(null)}>ปิด</button>
                        </div>
                        <div className="mo-b" style={{ display: "grid", gap: "14px" }}>
                            {selected.members.length === 0 && (
                                <div style={{ padding: "28px", borderRadius: "14px", background: "#F8FAFC", border: "1px dashed var(--border)", textAlign: "center" }}>
                                    <div className="fw8 fs14">ยังไม่มีบุคลากรในฝ่ายนี้</div>
                                    <div className="fs12 muted mt4">เมื่อหน้าจัดการผู้ใช้งานเชื่อมบุคลากรเข้ากับฝ่าย/งานนี้ รายชื่อจะแสดงที่นี่อัตโนมัติ</div>
                                </div>
                            )}
                            {groupPeopleBy(selected.members, "group").map(group => {
                                const done = getDoneCount(group.members);
                                const missing = group.members.length - done;

                                return (
                                    <div key={group.name} style={{ border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>
                                        <div style={{ padding: "12px 14px", background: "#F8FAFC", display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "center" }}>
                                            <div>
                                                <div className="fw8 fs13">{group.name}</div>
                                                <div className="fs11 muted">หัวหน้างาน: {getFirstValue(group.members, "supervisor")} · ทำ IDP แล้ว {done}/{group.members.length} คน</div>
                                            </div>
                                            {missing > 0 ? <span className="b br">ยังไม่ทำ {missing} คน</span> : <span className="b bg">ครบแล้ว</span>}
                                        </div>
                                        {group.members.map(person => {
                                            const meta = idpStatusMeta[person.idpStatus];

                                            return (
                                                <div key={person.id} style={{ padding: "12px 14px", borderTop: "1px solid var(--border)" }}>
                                                    <div className="flex ic g10 mb8">
                                                        <div style={{ flex: 1 }}>
                                                            <div className="fw7 fs13">{person.name}</div>
                                                            <div className="fs11 muted">{person.position} · หน่วยงาน {person.unit} · หัวหน้างาน {person.supervisor}</div>
                                                        </div>
                                                        <span className={`b ${meta.badge}`}>{meta.label}</span>
                                                    </div>
                                                    <div className="fs12 muted mb6">คาดหวัง {person.expectedScore.toFixed(2)} · ได้จริง {person.actualScore.toFixed(2)} · ช่องว่าง <span className={person.gap < 0 ? "rc fw8" : "gcc fw8"}>{person.gap.toFixed(2)}</span></div>
                                                    <div className="flex g6" style={{ flexWrap: "wrap" }}>
                                                        {person.idpTopics.map(topic => <span key={topic} className="b bb">{topic}</span>)}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export const ManagerGap: React.FC<{ users: any[], supportOrg?: SupportOrgMap }> = ({ users, supportOrg }) => {
    return <DeanHRGapOverview users={users} supportOrg={supportOrg} />;

    const [openDept, setOpenDept] = useState<string | null>(null);
    const [openProblem, setOpenProblem] = useState<string | null>(null);
    const [worklineFilter, setWorklineFilter] = useState("all");
    const [assessmentFilter, setAssessmentFilter] = useState("assessed");
    const [deptSort, setDeptSort] = useState("risk");
    const [deptSortDir, setDeptSortDir] = useState<"asc" | "desc">("asc");

    const mockCompetencies = {
        digital: { n: "การใช้เทคโนโลยีดิจิทัล", t: "FC2", tg: "tag-fc2" },
        data: { n: "การวิเคราะห์ข้อมูล", t: "FC2", tg: "tag-fc2" },
        ai: { n: "AI Literacy", t: "CC", tg: "tag-cc" },
        teamwork: { n: "การทำงานเป็นทีม", t: "CC", tg: "tag-cc" },
        teaching: { n: "การสอนและถ่ายทอด", t: "FC1", tg: "tag-fc1" },
        leadership: { n: "Visionary Leadership", t: "MC", tg: "tag-mc" },
        result: { n: "การมุ่งผลสัมฤทธิ์", t: "CC", tg: "tag-cc" }
    };
    const mockScenarioUsers = [
        { n: "ตัวอย่าง เสี่ยงสูง 1", t: "นาย", sso: "MOCK-H01", p: "นักวิชาการคอมพิวเตอร์", w: "สายสนับสนุน", d: "ฝ่ายตัวอย่าง: ความเสี่ยงสูง", evalStatus: "unit_evaluated", act: true, mockFailedCompetencies: [mockCompetencies.digital, mockCompetencies.data] },
        { n: "ตัวอย่าง เสี่ยงสูง 2", t: "นางสาว", sso: "MOCK-H02", p: "นักวิเคราะห์ข้อมูล", w: "สายสนับสนุน", d: "ฝ่ายตัวอย่าง: ความเสี่ยงสูง", evalStatus: "unit_evaluated", act: true, mockFailedCompetencies: [mockCompetencies.digital] },
        { n: "ตัวอย่าง เสี่ยงสูง 3", t: "นาย", sso: "MOCK-H03", p: "นักจัดการงานทั่วไป", w: "สายสนับสนุน", d: "ฝ่ายตัวอย่าง: ความเสี่ยงสูง", evalStatus: "self_submitted", act: true, mockFailedCompetencies: [mockCompetencies.ai] },
        { n: "ตัวอย่าง เสี่ยงสูง 4", t: "นาง", sso: "MOCK-H04", p: "นักทรัพยากรบุคคล", w: "สายสนับสนุน", d: "ฝ่ายตัวอย่าง: ความเสี่ยงสูง", evalStatus: "dept_evaluated", act: true, mockFailedCompetencies: [mockCompetencies.teamwork] },
        { n: "ตัวอย่าง เสี่ยงสูง 5", t: "นาย", sso: "MOCK-H05", p: "เจ้าหน้าที่บริหารงาน", w: "สายสนับสนุน", d: "ฝ่ายตัวอย่าง: ความเสี่ยงสูง", evalStatus: "unit_evaluated", act: true, mockFailedCompetencies: [] },
        { n: "ตัวอย่าง เฝ้าระวัง 1", t: "ผศ.ดร.", sso: "MOCK-W01", p: "อาจารย์", w: "สายวิชาการ", d: "ฝ่ายตัวอย่าง: เฝ้าระวัง", evalStatus: "unit_evaluated", act: true, mockFailedCompetencies: [mockCompetencies.ai] },
        { n: "ตัวอย่าง เฝ้าระวัง 2", t: "รศ.ดร.", sso: "MOCK-W02", p: "อาจารย์", w: "สายวิชาการ", d: "ฝ่ายตัวอย่าง: เฝ้าระวัง", evalStatus: "unit_evaluated", act: true, mockFailedCompetencies: [mockCompetencies.teaching] },
        { n: "ตัวอย่าง เฝ้าระวัง 3", t: "ผศ.ดร.", sso: "MOCK-W03", p: "อาจารย์", w: "สายวิชาการ", d: "ฝ่ายตัวอย่าง: เฝ้าระวัง", evalStatus: "dept_evaluated", act: true, mockFailedCompetencies: [] },
        { n: "ตัวอย่าง เฝ้าระวัง 4", t: "ดร.", sso: "MOCK-W04", p: "นักวิจัย", w: "สายวิชาการ", d: "ฝ่ายตัวอย่าง: เฝ้าระวัง", evalStatus: "unit_evaluated", act: true, mockFailedCompetencies: [] },
        { n: "ตัวอย่าง เฝ้าระวัง 5", t: "อ.", sso: "MOCK-W05", p: "อาจารย์", w: "สายวิชาการ", d: "ฝ่ายตัวอย่าง: เฝ้าระวัง", evalStatus: "self_submitted", act: true, mockFailedCompetencies: [] },
        { n: "ตัวอย่าง เกณฑ์ดี 1", t: "รศ.ดร.", sso: "MOCK-G01", p: "รองคณบดี", w: "สายงานบริหาร", d: "ฝ่ายตัวอย่าง: อยู่ในเกณฑ์ดี", evalStatus: "dean_approved", act: true, mockFailedCompetencies: [] },
        { n: "ตัวอย่าง เกณฑ์ดี 2", t: "ผศ.ดร.", sso: "MOCK-G02", p: "ผู้ช่วยคณบดี", w: "สายงานบริหาร", d: "ฝ่ายตัวอย่าง: อยู่ในเกณฑ์ดี", evalStatus: "dean_approved", act: true, mockFailedCompetencies: [] },
        { n: "ตัวอย่าง เกณฑ์ดี 3", t: "นาย", sso: "MOCK-G03", p: "นักจัดการงานทั่วไป", w: "สายสนับสนุน", d: "ฝ่ายตัวอย่าง: อยู่ในเกณฑ์ดี", evalStatus: "unit_evaluated", act: true, mockFailedCompetencies: [] },
        { n: "ตัวอย่าง เกณฑ์ดี 4", t: "นางสาว", sso: "MOCK-G04", p: "นักวิชาการศึกษา", w: "สายสนับสนุน", d: "ฝ่ายตัวอย่าง: อยู่ในเกณฑ์ดี", evalStatus: "unit_evaluated", act: true, mockFailedCompetencies: [] },
        { n: "ตัวอย่าง เกณฑ์ดี 5", t: "นาย", sso: "MOCK-G05", p: "นักเทคโนโลยีสารสนเทศ", w: "สายสนับสนุน", d: "ฝ่ายตัวอย่าง: อยู่ในเกณฑ์ดี", evalStatus: "dept_evaluated", act: true, mockFailedCompetencies: [] },
        { n: "ตัวอย่าง ยังไม่ประเมิน 1", t: "นาย", sso: "MOCK-N01", p: "เจ้าหน้าที่บริหารงาน", w: "สายสนับสนุน", d: "ฝ่ายตัวอย่าง: ยังไม่มีการประเมิน", evalStatus: "draft", act: true, mockFailedCompetencies: [] },
        { n: "ตัวอย่าง ยังไม่ประเมิน 2", t: "นาง", sso: "MOCK-N02", p: "นักวิชาการเงินและบัญชี", w: "สายสนับสนุน", d: "ฝ่ายตัวอย่าง: ยังไม่มีการประเมิน", evalStatus: "draft", act: true, mockFailedCompetencies: [] },
        { n: "ตัวอย่าง ยังไม่ประเมิน 3", t: "ผศ.ดร.", sso: "MOCK-N03", p: "อาจารย์", w: "สายวิชาการ", d: "ฝ่ายตัวอย่าง: ยังไม่มีการประเมิน", evalStatus: "draft", act: true, mockFailedCompetencies: [] }
    ];
    const activeUsers = [...users.filter(user => user.act !== false), ...mockScenarioUsers];
    const getSeed = (value: string) => value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const getTopDept = (user: any) => {
        if (!user.d) return "ไม่ระบุหน่วยงาน";
        return user.d.includes(" > ") ? user.d.split(" > ")[0] : user.d;
    };
    const getGroupName = (user: any) => {
        if (!user.d) return "ไม่ระบุกลุ่มงาน";
        const parts = user.d.split(" > ");
        if (user.w === "สายสนับสนุน") return parts[1] || parts[0] || "ไม่ระบุกลุ่มงาน";
        if (user.w === "สายวิชาการ") return parts[0] || user.p || "ไม่ระบุกลุ่มงาน";
        if (user.w === "สายงานบริหาร") return parts[0] || user.p || "ไม่ระบุกลุ่มงาน";
        return parts[0] || user.d;
    };
    const isAssessedUser = (user: any) => !["draft", "", undefined, null].includes(user.evalStatus);
    const getMockFailedCompetencies = (user: any) => {
        if (Array.isArray(user.mockFailedCompetencies)) return user.mockFailedCompetencies;
        if (!isAssessedUser(user)) return [];

        const seed = getSeed(`${user.sso || ""}${user.n || ""}`);
        if (seed % 5 === 0 || user.evalStatus === "dean_approved") return [];

        const supportItems = [
            { n: "การใช้เทคโนโลยีดิจิทัล", t: "FC2", tg: "tag-fc2" },
            { n: "การวิเคราะห์ข้อมูล", t: "FC2", tg: "tag-fc2" },
            { n: "AI Literacy", t: "CC", tg: "tag-cc" },
            { n: "การทำงานเป็นทีม", t: "CC", tg: "tag-cc" }
        ];
        const academicItems = [
            { n: "AI Literacy", t: "CC", tg: "tag-cc" },
            { n: "การสอนและถ่ายทอด", t: "FC1", tg: "tag-fc1" },
            { n: "การวิเคราะห์ข้อมูล", t: "FC1", tg: "tag-fc1" },
            { n: "การสื่อสารเชิงวิชาการ", t: "FC1", tg: "tag-fc1" }
        ];
        const managementItems = [
            { n: "Visionary Leadership", t: "MC", tg: "tag-mc" },
            { n: "AI Literacy", t: "CC", tg: "tag-cc" },
            { n: "การมุ่งผลสัมฤทธิ์", t: "CC", tg: "tag-cc" }
        ];
        const items = user.w === "สายวิชาการ"
            ? academicItems
            : user.w === "สายงานบริหาร"
                ? managementItems
                : supportItems;
        const failCount = (seed % 3) + 1;

        return items
            .filter((_, index) => (seed + index * 3) % 7 < 4)
            .slice(0, failCount);
    };
    const reportUsers = activeUsers.map(user => ({
        ...user,
        topDept: getTopDept(user),
        assessed: isAssessedUser(user),
        failedCompetencies: getMockFailedCompetencies(user)
    }));
    const worklineOptions = Array.from(new Set(reportUsers.map(user => user.w || "ไม่ระบุสายงาน")));
    const worklineFilteredUsers = worklineFilter === "all"
        ? reportUsers
        : reportUsers.filter(user => (user.w || "ไม่ระบุสายงาน") === worklineFilter);
    const filteredReportUsers = assessmentFilter === "all"
        ? worklineFilteredUsers
        : worklineFilteredUsers.filter(user => assessmentFilter === "assessed" ? user.assessed : !user.assessed);
    const assessedUsers = filteredReportUsers.filter(user => user.assessed);
    const passedUsers = assessedUsers.filter(user => user.failedCompetencies.length === 0);
    const failedUsers = assessedUsers.filter(user => user.failedCompetencies.length > 0);
    const worklineSummary = Array.from(new Set(filteredReportUsers.map(user => user.w || "ไม่ระบุสายงาน")))
        .map(workline => `${workline.replace("สาย", "")} ${filteredReportUsers.filter(user => (user.w || "ไม่ระบุสายงาน") === workline).length}`)
        .join(" · ");
    const totalStaff = filteredReportUsers.length;
    const assessed = assessedUsers.length;
    const passed = passedUsers.length;
    const failed = failedUsers.length;
    const passPct = assessed ? Math.round((passed / assessed) * 100) : 0;

    const deptRows = [
        { n: "สำนักงานคณะฯ", total: 55, assessed: 55, pass: 43, fail: 12, lines: [
            { n: "สายบริหาร", total: 20, fail: 3, weakDetail: [{ n: "การสื่อสาร", cnt: 3 }] },
            { n: "สายการเงิน", total: 22, fail: 5, weakDetail: [{ n: "การใช้เทคโนโลยีดิจิทัล", cnt: 4 }, { n: "การวิเคราะห์ข้อมูล", cnt: 3 }] },
            { n: "สายทรัพยากรบุคคล", total: 13, fail: 4, weakDetail: [{ n: "AI Literacy", cnt: 4 }] }
        ] },
        { n: "ภาควิชาวิศวฯ คอม", total: 52, assessed: 52, pass: 32, fail: 20, lines: [
            { n: "สายวิชาการ", total: 32, fail: 13, weakDetail: [{ n: "AI Literacy", cnt: 9 }, { n: "การวิเคราะห์ข้อมูล", cnt: 7 }] },
            { n: "สายสนับสนุน", total: 20, fail: 7, weakDetail: [{ n: "การใช้เทคโนโลยีดิจิทัล", cnt: 5 }] }
        ] },
        { n: "ภาควิชาวิศวฯ ไฟฟ้า", total: 43, assessed: 43, pass: 27, fail: 16, lines: [
            { n: "สายวิชาการ", total: 25, fail: 10, weakDetail: [{ n: "AI Literacy", cnt: 7 }] },
            { n: "สายสนับสนุน", total: 18, fail: 6, weakDetail: [{ n: "การใช้เทคโนโลยีดิจิทัล", cnt: 3 }, { n: "การทำงานเป็นทีม", cnt: 5 }] }
        ] },
        { n: "ภาควิชาวิศวฯ โยธา", total: 40, assessed: 40, pass: 22, fail: 18, lines: [
            { n: "สายวิชาการ", total: 23, fail: 11, weakDetail: [{ n: "การใช้เทคโนโลยีดิจิทัล", cnt: 7 }, { n: "AI Literacy", cnt: 7 }] },
            { n: "สายสนับสนุน", total: 17, fail: 7, weakDetail: [{ n: "การวิเคราะห์ข้อมูล", cnt: 7 }] }
        ] },
        { n: "ภาควิชาวิศวฯ อุตสาหการ", total: 30, assessed: 30, pass: 23, fail: 7, lines: [
            { n: "สายวิชาการ", total: 18, fail: 5, weakDetail: [{ n: "AI Literacy", cnt: 5 }] },
            { n: "สายสนับสนุน", total: 12, fail: 2, weakDetail: [{ n: "การใช้เทคโนโลยีดิจิทัล", cnt: 2 }] }
        ] }
    ];

    const problemGroups = [
        {
            label: "สายสนับสนุน",
            color: "var(--blue)",
            rows: [
                { n: "การใช้เทคโนโลยีดิจิทัล", t: "FC", tg: "tag-fc", count: 19, color: "var(--red)", width: 100 },
                { n: "การวิเคราะห์ข้อมูล", t: "FC", tg: "tag-fc", count: 16, color: "#f05a0a", width: 84 },
                { n: "AI Literacy", t: "CC", tg: "tag-cc", count: 10, color: "#d97706", width: 53 },
                { n: "การทำงานเป็นทีม", t: "CC", tg: "tag-cc", count: 8, color: "var(--teal)", width: 42 },
                { n: "การใช้เทคโนโลยีดิจิทัล", count: 19, color: "var(--red)", width: 100, depts: [{ d: "สำนักงานคณะฯ", c: 5 }, { d: "ภาควิชาวิศวฯ ไฟฟ้า", c: 3 }, { d: "ภาควิชาวิศวฯ โยธา", c: 4 }, { d: "ภาควิชาวิศวฯ อุตสาหการ", c: 2 }, { d: "ภาควิชาวิศวฯ คอม", c: 5 }] },
                { n: "การวิเคราะห์ข้อมูล", count: 16, color: "#f05a0a", width: 84, depts: [{ d: "สำนักงานคณะฯ", c: 5 }, { d: "ภาควิชาวิศวฯ โยธา", c: 7 }, { d: "ภาควิชาวิศวฯ คอม", c: 4 }] },
                { n: "AI Literacy", count: 10, color: "#d97706", width: 53, depts: [{ d: "สำนักงานคณะฯ", c: 4 }, { d: "ภาควิชาวิศวฯ ไฟฟ้า", c: 3 }, { d: "ภาควิชาวิศวฯ อุตสาหการ", c: 3 }] },
                { n: "การทำงานเป็นทีม", count: 8, color: "var(--teal)", width: 42, depts: [{ d: "ภาควิชาวิศวฯ ไฟฟ้า", c: 5 }, { d: "ภาควิชาวิศวฯ โยธา", c: 3 }] }
            ]
        },
        {
            label: "สายวิชาการ",
            color: "var(--purple)",
            rows: [
                { n: "AI Literacy", t: "CC", tg: "tag-cc", count: 28, color: "var(--red)", width: 100 },
                { n: "การวิเคราะห์ข้อมูล", t: "FC", tg: "tag-fc", count: 14, color: "#f05a0a", width: 50 },
                { n: "การใช้เทคโนโลยีดิจิทัล", t: "FC", tg: "tag-fc", count: 13, color: "#d97706", width: 46 },
                { n: "การสื่อสารเชิงวิชาการ", t: "FC", tg: "tag-fc", count: 9, color: "var(--teal)", width: 32 },
                { n: "AI Literacy", count: 28, color: "var(--red)", width: 100, depts: [{ d: "ภาควิชาวิศวฯ คอม", c: 9 }, { d: "ภาควิชาวิศวฯ โยธา", c: 7 }, { d: "ภาควิชาวิศวฯ ไฟฟ้า", c: 7 }, { d: "ภาควิชาวิศวฯ อุตสาหการ", c: 5 }] },
                { n: "การวิเคราะห์ข้อมูล", count: 14, color: "#f05a0a", width: 50, depts: [{ d: "ภาควิชาวิศวฯ คอม", c: 7 }, { d: "ภาควิชาวิศวฯ โยธา", c: 4 }, { d: "ภาควิชาวิศวฯ ไฟฟ้า", c: 3 }] },
                { n: "การใช้เทคโนโลยีดิจิทัล", count: 13, color: "#d97706", width: 46, depts: [{ d: "ภาควิชาวิศวฯ โยธา", c: 7 }, { d: "ภาควิชาวิศวฯ คอม", c: 4 }, { d: "ภาควิชาวิศวฯ ไฟฟ้า", c: 2 }] }
            ]
        }
    ];

    const detailRows: Record<string, { n: string; t: string; tg: string; fail: number; note: string }[]> = {
        "สำนักงานคณะฯ": [
            { n: "การใช้เทคโนโลยีดิจิทัล", t: "FC", tg: "tag-fc", fail: 8, note: "ต้องพัฒนาเร่งด่วน" },
            { n: "การวิเคราะห์ข้อมูล", t: "FC", tg: "tag-fc", fail: 4, note: "ความเสี่ยงกลาง" }
        ],
        "ฝ่ายแผนยุทธศาสตร์และพัฒนาองค์กร": [
            { n: "AI Literacy", t: "CC", tg: "tag-cc", fail: 11, note: "ความเสี่ยงสูง" },
            { n: "การวิเคราะห์ข้อมูล", t: "FC", tg: "tag-fc", fail: 9, note: "ความเสี่ยงสูง" }
        ],
        "ฝ่ายการศึกษาและพัฒนาทักษะการเรียนรู้": [
            { n: "การใช้เทคโนโลยีดิจิทัล", t: "FC", tg: "tag-fc", fail: 9, note: "ความเสี่ยงสูง" },
            { n: "AI Literacy", t: "CC", tg: "tag-cc", fail: 7, note: "ความเสี่ยงกลาง" }
        ],
        "ฝ่ายวิจัย นวัตกรรมและการต่างประเทศ": [
            { n: "การวิเคราะห์ข้อมูลวิจัย", t: "FC", tg: "tag-fc", fail: 6, note: "ความเสี่ยงกลาง" },
            { n: "การสื่อสารเชิงวิชาการ", t: "FC", tg: "tag-fc", fail: 4, note: "ความเสี่ยงต่ำ" }
        ],
        "ฝ่ายบริหาร": [
            { n: "Visionary Leadership", t: "MC", tg: "tag-mc", fail: 4, note: "ความเสี่ยงกลาง" },
            { n: "การใช้เทคโนโลยีดิจิทัล", t: "FC", tg: "tag-fc", fail: 3, note: "ความเสี่ยงต่ำ" }
        ],
        "หน่วยงานสายวิชาการ": [
            { n: "AI Literacy", t: "CC", tg: "tag-cc", fail: 5, note: "ความเสี่ยงสูง" },
            { n: "การสื่อสารเชิงวิชาการ", t: "FC", tg: "tag-fc", fail: 3, note: "ความเสี่ยงกลาง" }
        ]
    };

    const aggregateWeakDetails = (people: typeof reportUsers) => {
        const weakMap = new Map<string, { n: string; cnt: number }>();

        people.forEach(user => {
            user.failedCompetencies.forEach(item => {
                const current = weakMap.get(item.n) || { n: item.n, cnt: 0 };
                current.cnt += 1;
                weakMap.set(item.n, current);
            });
        });

        return Array.from(weakMap.values()).sort((a, b) => b.cnt - a.cnt);
    };
    const reportDeptRows = Array.from(new Set(filteredReportUsers.map(user => user.topDept))).map(dept => {
        const deptUsers = filteredReportUsers.filter(user => user.topDept === dept);
        const deptAssessed = deptUsers.filter(user => user.assessed);
        const deptFailed = deptAssessed.filter(user => user.failedCompetencies.length > 0);
        const lines = Array.from(new Set(deptUsers.map(user => user.w || "ไม่ระบุสายงาน"))).map(workline => {
            const lineUsers = deptUsers.filter(user => (user.w || "ไม่ระบุสายงาน") === workline);
            const lineAssessed = lineUsers.filter(user => user.assessed);
            const lineFailed = lineAssessed.filter(user => user.failedCompetencies.length > 0);

            return {
                n: workline,
                total: lineUsers.length,
                fail: lineFailed.length,
                weakDetail: aggregateWeakDetails(lineFailed)
            };
        });

        return {
            n: dept,
            total: deptUsers.length,
            assessed: deptAssessed.length,
            pass: deptAssessed.length - deptFailed.length,
            fail: deptFailed.length,
            lines
        };
    }).sort((a, b) => b.total - a.total || a.n.localeCompare(b.n, "th"));
    const reportDetailRows: Record<string, { n: string; t: string; tg: string; fail: number; note: string }[]> = {};

    reportDeptRows.forEach(dept => {
        const deptUsers = filteredReportUsers.filter(user => user.topDept === dept.n && user.failedCompetencies.length > 0);
        const compMap = new Map<string, { n: string; t: string; tg: string; fail: number; note: string }>();

        deptUsers.forEach(user => {
            user.failedCompetencies.forEach(item => {
                const current = compMap.get(item.n) || { n: item.n, t: item.t, tg: item.tg, fail: 0, note: "" };
                current.fail += 1;
                current.note = "";
                compMap.set(item.n, current);
            });
        });

        reportDetailRows[dept.n] = Array.from(compMap.values()).sort((a, b) => b.fail - a.fail);
    });
    const sortSummaryRows = <T extends { n: string; total: number; pass: number; fail: number }>(rows: T[]) => {
        const direction = deptSortDir === "asc" ? 1 : -1;

        return [...rows].sort((a, b) => {
            let result = 0;
            if (deptSort === "pass") result = b.pass - a.pass || b.total - a.total || a.n.localeCompare(b.n, "th");
            else if (deptSort === "all") result = a.n.localeCompare(b.n, "th") || b.total - a.total;
            else result = b.fail - a.fail || b.total - a.total || a.n.localeCompare(b.n, "th");
            return result * direction;
        });
    };
    const reportWorklineRows = Array.from(new Set(filteredReportUsers.map(user => user.w || "ไม่ระบุสายงาน"))).map(workline => {
        const worklineUsers = filteredReportUsers.filter(user => (user.w || "ไม่ระบุสายงาน") === workline);
        const worklineAssessed = worklineUsers.filter(user => user.assessed);
        const worklineFailed = worklineAssessed.filter(user => user.failedCompetencies.length > 0);
        const groups = sortSummaryRows(Array.from(new Set(worklineUsers.map(getGroupName))).map(groupName => {
            const groupUsers = worklineUsers.filter(user => getGroupName(user) === groupName);
            const groupAssessed = groupUsers.filter(user => user.assessed);
            const groupFailed = groupAssessed.filter(user => user.failedCompetencies.length > 0);
            const weakDetail = aggregateWeakDetails(groupFailed);

            return {
                id: `${workline}-${groupName}`,
                n: groupName,
                total: groupUsers.length,
                assessed: groupAssessed.length,
                pass: groupAssessed.length - groupFailed.length,
                fail: groupFailed.length,
                weakDetail
            };
        }));

        return {
            n: workline,
            total: worklineUsers.length,
            assessed: worklineAssessed.length,
            pass: worklineAssessed.length - worklineFailed.length,
            fail: worklineFailed.length,
            groups
        };
    });
    const sortedReportWorklineRows = sortSummaryRows(reportWorklineRows);
    const reportProblemGroups = Array.from(new Set(filteredReportUsers.map(user => user.w || "ไม่ระบุสายงาน"))).map((workline, groupIndex) => {
        const worklineUsers = filteredReportUsers.filter(user => (user.w || "ไม่ระบุสายงาน") === workline);
        const compMap = new Map<string, { n: string; t: string; tg: string; count: number; depts: Map<string, number> }>();

        worklineUsers.forEach(user => {
            user.failedCompetencies.forEach(item => {
                const current = compMap.get(item.n) || { n: item.n, t: item.t, tg: item.tg, count: 0, depts: new Map<string, number>() };
                current.count += 1;
                current.depts.set(user.topDept, (current.depts.get(user.topDept) || 0) + 1);
                compMap.set(item.n, current);
            });
        });

        const rows = Array.from(compMap.values()).sort((a, b) => b.count - a.count);
        const maxCount = Math.max(...rows.map(row => row.count), 1);
        const colors = ["var(--red)", "#f05a0a", "#d97706", "var(--teal)", "var(--blue)"];

        return {
            label: workline,
            color: groupIndex % 2 === 0 ? "var(--blue)" : "var(--purple)",
            rows: rows.map((row, index) => ({
                n: row.n,
                t: row.t,
                tg: row.tg,
                count: row.count,
                color: colors[index % colors.length],
                width: Math.round((row.count / maxCount) * 100),
                depts: Array.from(row.depts.entries())
                    .map(([d, c]) => ({ d, c }))
                    .sort((a, b) => b.c - a.c)
            }))
        };
    }).filter(group => group.rows.length > 0);

    const getPct = (value: number, total: number) => total ? Math.round((value / total) * 100) : 0;
    const getRiskStatus = (dept: typeof deptRows[number]) => {
        if (!dept.assessed) {
            return { label: "ยังไม่มีการประเมิน", badge: "muted", rank: 3, color: "#94a3b8" };
        }

        const failPct = 100 - getPct(dept.pass, dept.assessed);

        if (failPct > 40) {
            return { label: " ความเสี่ยงสูง", badge: "br", rank: 0, color: "var(--red)" };
        }
        if (failPct >= 20) {
            return { label: "ต้องเฝ้าระวัง", badge: "by", rank: 1, color: "var(--yellow)" };
        }

        return { label: "อยู่ในเกณฑ์ดี", badge: "bg", rank: 2, color: "var(--green)" };
    };
    const getProblemTag = (name: string) => {
        if (name === "AI Literacy" || name === "การทำงานเป็นทีม") {
            return { label: "CC", cls: "tag-cc" };
        }

        return { label: "FC", cls: "tag-fc" };
    };

    const rankedDeptRows = [...reportDeptRows].sort((a, b) => {
        const aRisk = getRiskStatus(a);
        const bRisk = getRiskStatus(b);
        const aFailPct = a.assessed ? 100 - getPct(a.pass, a.assessed) : -1;
        const bFailPct = b.assessed ? 100 - getPct(b.pass, b.assessed) : -1;
        const aCoverage = getPct(a.assessed, a.total);
        const bCoverage = getPct(b.assessed, b.total);
        const direction = deptSortDir === "asc" ? 1 : -1;
        let result = 0;

        if (deptSort === "risk") result = aRisk.rank - bRisk.rank || bFailPct - aFailPct || b.fail - a.fail;
        else if (deptSort === "pass") result = b.pass - a.pass || b.total - a.total || a.n.localeCompare(b.n, "th");
        else result = a.n.localeCompare(b.n, "th") || b.total - a.total;

        return result * direction;
    });

    const getProblemDeptRows = (count: number) => {
        const deptNames = [
            "สำนักงานคณะฯ",
            "ภาควิชาวิศวฯ คอม",
            "ภาควิชาวิศวฯ ไฟฟ้า",
            "ภาควิชาวิศวฯ โยธา",
            "ภาควิชาวิศวฯ อุตสาหการ"
        ];
        let remaining = count;

        return deptNames.map((d, index) => {
            const slotsLeft = deptNames.length - index;
            const c = Math.max(1, Math.ceil(remaining / slotsLeft));
            remaining -= c;
            return { d, c };
        }).filter(row => row.c > 0);
    };

    return (
        <>
            <div className="mb20">
                <div className="sec-t" style={{ color: "var(--navy)", fontSize: "24px" }}>ภาพรวมผลการประเมินคณะ</div>
                <div className="sec-s">คณะวิศวกรรมศาสตร์ · รอบประเมิน 2568</div>
            </div>

            <div className="mb20" style={{ background: "var(--navy)", borderRadius: "16px", padding: "34px", color: "#fff", display: "grid", gridTemplateColumns: "1fr auto", gap: "20px", alignItems: "center" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(120px, 1fr))", gap: "0" }}>
                    {[
                        { l: "บุคลากรทั้งหมด", v: totalStaff, s: worklineSummary || "ยังไม่มีข้อมูลผู้ใช้", c: "#fff" },
                        { l: "ประเมินแล้ว", v: assessed, s: `รอ ${totalStaff - assessed} คน`, c: "#fff" },
                        { l: "ผ่านเกณฑ์", v: passed, s: ` คน`, c: "#4ade80" },
                        { l: "ไม่ผ่านเกณฑ์", v: failed, s: `คน`, c: "#fca5a5" }
                    ].map((m, i) => (
                        <div key={m.l} style={{ padding: "0 28px", borderLeft: i ? "1px solid rgba(255,255,255,.14)" : "none" }}>
                            <div className="fw7 fs12" style={{ color: "rgba(255,255,255,.48)", marginBottom: "8px" }}>{m.l}</div>
                            <div style={{ color: m.c, fontSize: "44px", fontWeight: 800, lineHeight: 1 }}>{m.v}</div>
                            <div className="fs12" style={{ color: "rgba(255,255,255,.55)", marginTop: "8px" }}>{m.s}</div>
                        </div>
                    ))}
                </div>
                <div style={{ width: "144px", height: "144px", borderRadius: "50%", background: `conic-gradient(#4ade80 ${passPct * 3.6}deg, rgba(255,255,255,.12) 0)`, display: "grid", placeItems: "center" }}>
                    <div style={{ width: "108px", height: "108px", borderRadius: "50%", background: "var(--navy)", display: "grid", placeItems: "center", textAlign: "center" }}>
                        <div>
                            <div style={{ fontSize: "26px", fontWeight: 800, lineHeight: 1 }}>{passPct}%</div>
                            <div className="fs11" style={{ color: "rgba(255,255,255,.65)", marginTop: "6px" }}>ผ่านเกณฑ์</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card mb16">
                <div className="ch">
                    <div>
                        <div className="ct">ผลรายสายงาน / กลุ่มงาน</div>
                        <div className="cs">เรียงจากสายงาน แล้วแสดงรายละเอียดรายกลุ่มงาน</div>
                    </div>
                    <div className="flex ic g6" style={{ flex: "0 0 auto" }}>
                        <span className="fs11 fw7 muted">สายงาน:</span>
                        <select
                            className="sel"
                            value={worklineFilter}
                            onChange={event => {
                                setWorklineFilter(event.target.value);
                                setOpenDept(null);
                                setOpenProblem(null);
                            }}
                            style={{ width: "160px", height: "32px", padding: "4px 10px", fontSize: "12px" }}
                        >
                            <option value="all">ทุกสายงาน</option>
                            {worklineOptions.map(workline => (
                                <option key={workline} value={workline}>{workline}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex ic g6" style={{ flex: "0 0 auto" }}>
                        <span className="fs11 fw7 muted">ผลประเมิน:</span>
                        <select
                            className="sel"
                            value={assessmentFilter}
                            onChange={event => {
                                setAssessmentFilter(event.target.value);
                                setOpenDept(null);
                                setOpenProblem(null);
                            }}
                            style={{ width: "170px", height: "32px", padding: "4px 10px", fontSize: "12px" }}
                        >
                            <option value="assessed">มีผลการประเมิน</option>
                            <option value="unassessed">ยังไม่มีผลการประเมิน</option>
                            <option value="all">ทั้งหมด</option>
                        </select>
                    </div>
                    <div className="flex ic g6" style={{ flex: "0 0 auto" }}>
                        <span className="fs11 fw7 muted">เรียงตาม:</span>
                        <select
                            className="sel"
                            value={deptSort}
                            onChange={event => {
                                setDeptSort(event.target.value);
                                setOpenDept(null);
                            }}
                            style={{ width: "160px", height: "32px", padding: "4px 10px", fontSize: "12px" }}
                        >
                            <option value="all">ทั้งหมด</option>
                            <option value="risk">จำนวนผู้ไม่ผ่าน</option>
                            <option value="pass">จำนวนผู้ผ่าน</option>
                        </select>
                        <button
                            type="button"
                            className="btn btn-s btn-xs"
                            title={deptSortDir === "asc" ? "เรียงจากน้อยไปมาก" : "เรียงจากมากไปน้อย"}
                            onClick={() => {
                                setDeptSortDir(prev => prev === "asc" ? "desc" : "asc");
                                setOpenDept(null);
                            }}
                            style={{ width: "32px", height: "32px", padding: 0, lineHeight: 1, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                        >
                            {deptSortDir === "asc" ? <ArrowUpAZ size={15} /> : <ArrowDownAZ size={15} />}
                        </button>
                    </div>
                    <div style={{ marginLeft: "auto", display: "flex", gap: "18px", flexWrap: "wrap", justifyContent: "flex-end", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                            <span className="fs11 fw7 muted">สีแถบผลประเมิน:</span>
                            <span className="flex ic g6 fs11 muted"><span style={{ width: "22px", height: "8px", borderRadius: "99px", background: "var(--green)", display: "inline-block" }} /> ผ่าน</span>
                            <span className="flex ic g6 fs11 muted"><span style={{ width: "22px", height: "8px", borderRadius: "99px", background: "#FECACA", display: "inline-block" }} /> ไม่ผ่าน</span>
                            <span className="flex ic g6 fs11 muted"><span style={{ width: "22px", height: "8px", borderRadius: "99px", background: "#e2e8f0", display: "inline-block" }} /> ยังไม่มีการประเมิน</span>
                        </div>
                    </div>
                </div>
                <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    {sortedReportWorklineRows.map(section => {
                        const sectionPassWidth = getPct(section.pass, section.assessed);
                        const sectionFailWidth = section.assessed ? 100 - sectionPassWidth : 0;
                        return (
                            <div key={section.n} style={{ border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden", background: "var(--bg)" }}>
                                <div style={{ padding: "14px 16px", background: "var(--navy)", color: "#fff", display: "grid", gridTemplateColumns: "minmax(180px, 1fr) 120px 140px minmax(180px, 1fr)", gap: "14px", alignItems: "center" }}>
                                    <div>
                                        <div className="fw8 fs14">{section.n}</div>
                                        <div className="fs11" style={{ color: "rgba(255,255,255,.62)", marginTop: "2px" }}>{section.groups.length} กลุ่มงาน · ประเมินแล้ว {section.assessed}/{section.total} คน</div>
                                    </div>
                                    <div style={{ textAlign: "center" }}>
                                        <div className="fw8 fs18">{section.total}</div>
                                        <div className="fs10" style={{ color: "rgba(255,255,255,.62)" }}>สมาชิกทั้งหมด</div>
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                        <div style={{ textAlign: "center", padding: "5px 8px", background: "rgba(34,197,94,.14)", borderRadius: "8px", border: "1px solid rgba(134,239,172,.35)" }}>
                                            <div className="fw8 fs14" style={{ color: "#86efac" }}>{section.pass}</div>
                                            <div className="fs10" style={{ color: "#bbf7d0" }}>ผ่าน</div>
                                        </div>
                                        <div style={{ textAlign: "center", padding: "5px 8px", background: "rgba(239,68,68,.14)", borderRadius: "8px", border: "1px solid rgba(252,165,165,.35)" }}>
                                            <div className="fw8 fs14" style={{ color: "#fca5a5" }}>{section.fail}</div>
                                            <div className="fs10" style={{ color: "#fecaca" }}>ไม่ผ่าน</div>
                                        </div>
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ height: "9px", borderRadius: "99px", overflow: "hidden", display: "flex", background: "rgba(255,255,255,.18)" }}>
                                            <div style={{ width: `${sectionPassWidth}%`, background: "var(--green)" }} />
                                            <div style={{ width: `${sectionFailWidth}%`, background: "#FECACA" }} />
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "10px", color: "rgba(255,255,255,.62)" }}>
                                            <span>{sectionPassWidth}%</span>
                                            <span>{sectionFailWidth}%</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                                    <div className="muted fs11 fw7" style={{ display: "grid", gridTemplateColumns: "minmax(220px, 1.3fr) 104px 128px minmax(180px, 1fr) 20px", alignItems: "center", gap: "12px", padding: "0 14px" }}>
                                        <span>กลุ่มงาน</span>
                                        <span style={{ textAlign: "center" }}>สมาชิกทั้งหมด</span>
                                        <span style={{ textAlign: "center" }}>ผลประเมิน</span>
                                        <span>สัดส่วนผ่าน / ไม่ผ่าน</span>
                                        <span />
                                    </div>
                                    {section.groups.map(group => {
                                        const passWidth = getPct(group.pass, group.assessed);
                                        const failWidth = group.assessed ? 100 - passWidth : 0;
                                        const isOpen = openDept === group.id;
                                        return (
                                            <div key={group.id} style={{ border: "1px solid var(--border)", borderRadius: "var(--r)", background: "#fff", overflow: "hidden" }}>
                                                <button
                                                    type="button"
                                                    onClick={() => setOpenDept(isOpen ? null : group.id)}
                                                    style={{ width: "100%", padding: "12px 14px", border: 0, background: "#fff", cursor: "pointer", display: "grid", gridTemplateColumns: "minmax(220px, 1.3fr) 104px 128px minmax(180px, 1fr) 20px", alignItems: "center", gap: "12px", textAlign: "left", fontFamily: "inherit" }}
                                                >
                                                    <div style={{ minWidth: 0 }}>
                                                        <div className="fw8 fs13" style={{ color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={group.n}>{group.n}</div>
                                                        <div className="muted fs11 mt4">{group.total} คน · ประเมินแล้ว {group.assessed} คน</div>
                                                    </div>
                                                    <div style={{ textAlign: "center" }}>
                                                        <div className="fw8 fs15" style={{ color: "var(--navy)" }}>{group.total}</div>
                                                        <div className="muted fs10">คน</div>
                                                    </div>
                                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                                        <div style={{ textAlign: "center", padding: "4px 8px", background: "var(--green-bg)", borderRadius: "var(--r)", border: "1px solid var(--green-md)" }}>
                                                            <div className="fw8 fs14" style={{ color: "var(--green)" }}>{group.pass}</div>
                                                            <div className="fs10 fw7" style={{ color: "var(--green)" }}>ผ่าน</div>
                                                        </div>
                                                        <div style={{ textAlign: "center", padding: "4px 8px", background: "var(--red-bg)", borderRadius: "var(--r)", border: "1px solid #FCA5A5" }}>
                                                            <div className="fw8 fs14" style={{ color: "var(--red)" }}>{group.fail}</div>
                                                            <div className="fs10 fw7" style={{ color: "var(--red)" }}>ไม่ผ่าน</div>
                                                        </div>
                                                    </div>
                                                    <div style={{ minWidth: 0 }}>
                                                        <div style={{ height: "10px", borderRadius: "6px", overflow: "hidden", display: "flex", background: "#e2e8f0" }}>
                                                            {group.assessed ? (
                                                                <>
                                                                    <div style={{ width: `${passWidth}%`, background: "var(--green)" }} />
                                                                    <div style={{ width: `${failWidth}%`, background: "#FECACA" }} />
                                                                </>
                                                            ) : (
                                                                <div style={{ width: "100%", background: "#e2e8f0" }} />
                                                            )}
                                                        </div>
                                                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3px" }}>
                                                            <span style={{ fontSize: "10px", color: "var(--text3)" }}>{passWidth}%</span>
                                                            <span style={{ fontSize: "10px", color: "var(--text3)" }}>{failWidth}%</span>
                                                        </div>
                                                    </div>
                                                    <span className="muted" style={{ justifySelf: "center" }}>{isOpen ? "▴" : "▾"}</span>
                                                </button>
                                                {isOpen && (
                                                    <div style={{ borderTop: "1px solid var(--border)", background: "#FFFBEB", padding: "10px 14px", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                                                        <span className="fw8 fs11" style={{ color: "var(--yellow)" }}>สมรรถนะที่ไม่ผ่าน</span>
                                                        {group.weakDetail.length ? group.weakDetail.map(weak => (
                                                            <span key={weak.n} style={{ fontSize: "11px", padding: "3px 8px", background: "var(--red-bg)", color: "var(--red)", borderRadius: "20px", fontWeight: 700 }}>
                                                                {weak.n} <span style={{ background: "var(--red)", color: "#fff", borderRadius: "10px", padding: "0 5px", fontSize: "10px" }}>{weak.cnt} คน</span>
                                                            </span>
                                                        )) : (
                                                            <span className="muted fs12">ไม่มีหัวข้อที่ไม่ผ่าน</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="card" style={{ borderRadius: "14px", overflow: "hidden" }}>
                <div className="ch" style={{ padding: "20px 22px", display: "block" }}>
                    <div className="ct" style={{ fontSize: "16px" }}>สมรรถนะที่มีปัญหา แยกตามสายงาน</div>
                    <div className="cs">CC = สมรรถนะหลัก · MC = สมรรถนะการบริหาร · FC = สมรรถนะตามสายงาน · กดที่รายการเพื่อดูว่ามาจากหน่วยงานใดบ้าง</div>
                </div>
                <div className="cb" style={{ padding: "12px 22px 22px" }}>
                    <div style={{ background: "var(--yellow-bg)", border: "1px solid #fde68a", borderRadius: "9px", color: "var(--yellow)", padding: "12px 16px", marginBottom: "20px", fontSize: "13px" }}>
                         บุคลากร 1 คนสามารถไม่ผ่านได้หลายสมรรถนะ ผลรวมอาจสูงกว่าจำนวนจริง
                    </div>
                    {reportProblemGroups.map((group) => (
                        <div key={group.label} style={{ marginBottom: "26px" }}>
                            <div className="b" style={{ background: group.color, color: "#fff", fontSize: "13px", padding: "7px 16px", borderRadius: "20px", marginBottom: "14px" }}>{group.label}</div>
                            {group.rows.map((row, idx) => {
                                const id = `${group.label}-${row.n}`;
                                const isOpen = openProblem === id;
                                const tag = getProblemTag(row.n);
                                return (
                                    <div key={id} className="mb10">
                                        <button
                                            type="button"
                                            onClick={() => setOpenProblem(isOpen ? null : id)}
                                            style={{ width: "100%", background: "#fff", border: "1px solid var(--border)", borderRadius: "9px", padding: "16px 20px", boxShadow: "var(--sh)", cursor: "pointer", display: "grid", gridTemplateColumns: "52px minmax(220px, 1fr) 250px 88px 20px", gap: "16px", alignItems: "center", textAlign: "left", fontFamily: "inherit" }}
                                        >
                                            <span style={{ width: "32px", height: "32px", borderRadius: "50%", background: row.color, color: "#fff", display: "grid", placeItems: "center", fontWeight: 800 }}>{idx + 1}</span>
                                            <span className="flex ic g8" style={{ minWidth: 0 }}>
                                                <span className={tag.cls}>{tag.label}</span>
                                                <span className="fw8 fs14" style={{ color: "var(--navy)" }}>{row.n}</span>
                                            </span>
                                            <span style={{ height: "8px", borderRadius: "999px", background: "#e2e8f0", overflow: "hidden", display: "block" }}>
                                                <span style={{ display: "block", height: "100%", width: `${row.width}%`, background: row.color, borderRadius: "999px" }} />
                                            </span>
                                            <span className="fw8 fs13" style={{ color: row.color, textAlign: "right" }}>{row.count} คน</span>
                                            <span className="muted" style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: ".15s" }}>⌄</span>
                                        </button>
                                        {isOpen && (
                                            <div style={{ margin: "8px 20px 0 72px", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg)" }}>
                                                <div className="fs12 muted mb8">รายหน่วยงาน</div>
                                                {row.depts.map(dep => (
                                                    <div key={dep.d} className="flex ic" style={{ padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
                                                        <span style={{ flex: 1, fontSize: "12px", color: "var(--text2)" }}>{dep.d}</span>
                                                        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--red)" }}>{dep.c} คน</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @media (max-width: 980px) {
                    .content .card button[style*="grid-template-columns"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </>
    );
};

export const ManagerIDP: React.FC<{ users: any[], supportOrg?: SupportOrgMap }> = ({ users, supportOrg }) => {
    return <DeanHRIDPOverview users={users} supportOrg={supportOrg} />;

    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const getGroupName = (user: any) => {
        if (!user.d) return "ไม่ระบุกลุ่มงาน";
        const parts = user.d.split(" > ");
        if (user.w === "สายสนับสนุน") return parts[1] || parts[0] || "ไม่ระบุกลุ่มงาน";
        if (user.w === "สายวิชาการ") return parts[0] || user.p || "ไม่ระบุกลุ่มงาน";
        if (user.w === "สายงานบริหาร") return parts[0] || user.p || "ไม่ระบุกลุ่มงาน";
        return parts[0] || user.d;
    };
    const getIdpStatus = (user: any) => {
        if (user.evalStatus === "dean_approved") return "completed";
        if (user.evalStatus === "dept_evaluated") return "submitted";
        if (user.evalStatus === "unit_evaluated") return "in_progress";
        if (user.evalStatus === "self_submitted") return "draft";
        return "no_idp";
    };
    const getIdpTopic = (user: any) => {
        if (user.w === "สายวิชาการ") return "AI Literacy";
        if ((user.p || "").includes("คอมพิวเตอร์") || (user.d || "").includes("เทคโนโลยี")) return "ดิจิทัล & Data";
        if ((user.p || "").includes("ทรัพยากร")) return "การพัฒนาทรัพยากรบุคคล";
        return "สมรรถนะตามแผนพัฒนา";
    };
    const idpPeople = users
        .filter(user => user.act !== false && user.r !== "manager" && user.r !== "manager_dept")
        .map(user => ({
            ...user,
            groupName: getGroupName(user),
            idpStatus: getIdpStatus(user),
            idpTopic: getIdpTopic(user)
        }));
    const groupProgress = Array.from(new Set(idpPeople.map(user => String(user.groupName)))).map(groupName => {
        const members = idpPeople.filter(user => user.groupName === groupName);
        const hasIDP = members.filter(user => user.idpStatus !== "no_idp").length;

        return {
            d: groupName,
            total: members.length,
            hasIDP,
            members
        };
    }).sort((a, b) => (b.total - b.hasIDP) - (a.total - a.hasIDP) || b.total - a.total || String(a.d).localeCompare(String(b.d), "th"));
    const selectedDetail = groupProgress.find(group => group.d === selectedGroup);
    const totalFail = groupProgress.reduce((total, group) => total + group.total, 0);
    const totalHasIDP = groupProgress.reduce((total, group) => total + group.hasIDP, 0);
    const totalNoIDP = totalFail - totalHasIDP;
    const idpStats = {
        completed: idpPeople.filter(user => user.idpStatus === "completed").length,
        inProgress: idpPeople.filter(user => user.idpStatus === "in_progress").length,
        submitted: idpPeople.filter(user => user.idpStatus === "submitted").length,
        draft: idpPeople.filter(user => user.idpStatus === "draft").length,
        noIdp: totalNoIDP
    };
    const noProgress = idpPeople.filter(user => user.idpStatus === "no_idp");

    const statusMeta: Record<string, { label: string; badge: string }> = {
        completed: { label: "เสร็จสิ้น", badge: "bg" },
        in_progress: { label: "กำลังดำเนินการ", badge: "bt" },
        submitted: { label: "รออนุมัติ", badge: "by" },
        draft: { label: "Draft", badge: "bgr" },
        no_idp: { label: "ยังไม่ทำ IDP", badge: "bgr" }
    };

    const noProgressMeta: Record<string, { label: string; badge: string }> = {
        no_idp: { label: "ยังไม่ทำ IDP", badge: "bgr" },
        rejected: { label: "แผนไม่ผ่านการอนุมัติ", badge: "br" }
    };

    const statLegend = [
        { label: "เสร็จสิ้น", value: idpStats.completed, color: "#16A34A" },
        { label: "กำลังดำเนินการ", value: idpStats.inProgress, color: "#0EA5A0" },
        { label: "รออนุมัติ", value: idpStats.submitted, color: "#FCD34D" },
        { label: "Draft", value: idpStats.draft, color: "#FB923C" },
        { label: "ไม่มี IDP", value: idpStats.noIdp, color: "#EF4444" }
    ];

    return (
        <>
            <div className="mb20">
                <div className="sec-t">ภาพรวม IDP คณะ </div>
                <div className="sec-s">สถานะ IDP ของบุคลากรทั้งคณะวิศวกรรมศาสตร์ · รอบ 2568</div>
            </div>

            <div className="card mb14" style={{ borderLeft: "4px solid var(--teal)", background: "linear-gradient(135deg,#fff 60%,var(--teal-lt))" }}>
                <div className="cb">
                    <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: "190px" }}>
                            <div className="fw7 fs12 muted mb6">บุคลากรไม่ผ่านเกณฑ์ที่มี IDP แล้ว</div>
                            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                                <span style={{ color: "var(--teal)", fontSize: "36px", fontWeight: 800, lineHeight: 1 }}>{totalHasIDP}</span>
                                <span style={{ color: "var(--text3)", fontSize: "16px", fontWeight: 600 }}>/ {totalFail} คน</span>
                            </div>
                            <div className="fs12 muted mt4">ยังไม่ทำ IDP <span className="fw7 rc">{totalNoIDP} คน</span></div>
                        </div>

                        <div style={{ flex: 2, minWidth: "280px" }}>
                            <div className="fs11 fw7 muted mb6">สัดส่วนตามสถานะ</div>
                            <div style={{ height: "20px", borderRadius: "6px", overflow: "hidden", display: "flex", background: "var(--border)" }}>
                                {statLegend.map(item => (
                                    <div
                                        key={item.label}
                                        title={`${item.label} ${item.value} คน`}
                                        style={{ width: `${(item.value / totalFail) * 100}%`, background: item.color, transition: ".2s" }}
                                    />
                                ))}
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "8px" }}>
                                {statLegend.map(item => (
                                    <div key={item.label} className="flex ic g4">
                                        <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: item.color }} />
                                        <span className={`fs11 ${item.label === "ไม่มี IDP" ? "rc" : ""}`}>{item.label} <b>{item.value}</b></span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="g4 mb14">
                <div className="sc"><div className="sl">เสร็จสิ้น</div><div className="sv gcc">{idpStats.completed}</div><div className="ss muted">คน</div></div>
                <div className="sc"><div className="sl">กำลังดำเนินการ</div><div className="sv bc">{idpStats.inProgress}</div><div className="ss muted">คน</div></div>
                <div className="sc"><div className="sl">รออนุมัติ</div><div className="sv yc">{idpStats.submitted}</div><div className="ss muted">คน</div></div>
                <div className="sc"><div className="sl">ยังไม่ทำ IDP</div><div className="sv rc">{totalNoIDP}</div><div className="ss muted">คน</div></div>
            </div>

            <div className="g2 mb14">
                <div className="card">
                    <div className="ch"><div className="ct">ความคืบหน้า IDP รายกลุ่มงาน</div></div>
                    <div className="cb" style={{ padding: 0 }}>
                        {groupProgress.map(group => {
                            const pct = Math.round((group.hasIDP / group.total) * 100);
                            const noIdp = group.total - group.hasIDP;
                            const barColor = "var(--teal)";

                            return (
                                <div key={group.d} style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                                    <div className="flex ic g8 mb8">
                                        <span className="fw6 fs13" style={{ flex: 1 }}>{group.d}</span>
                                        <span className="fw7 fs12" style={{ color: barColor }}>{group.hasIDP}/{group.total} คน</span>
                                        <button className="btn btn-s btn-xs" onClick={() => setSelectedGroup(group.d)}>ดูรายละเอียด</button>
                                    </div>
                                    <div className="flex ic g8">
                                        <div className="pw" style={{ flex: 1, height: "7px", overflow: "hidden" }}>
                                            <div className="pb" style={{ width: `${pct}%`, background: barColor }} />
                                        </div>
                                        <span className="fs11 fw7" style={{ color: noIdp ? "var(--red)" : "var(--green)", textAlign: "right", width: "100px" }}>ยังไม่ทำ IDP {noIdp} คน</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="card">
                    <div className="ch">
                        <div>
                            <div className="ct">บุคลากรที่ยังไม่ทำ IDP</div>
                            <div className="cs">{noProgress.length} คน</div>
                        </div>
                        <button className="btn btn-p btn-sm" style={{ marginLeft: "auto" }} onClick={() => alert(`ส่งแจ้งเตือนไปยัง ${noProgress.length} คนแล้ว`)}>แจ้งเตือนทั้งหมด</button>
                    </div>
                    <div className="cb" style={{ padding: 0 }}>
                        {noProgress.map(item => {
                            const meta = noProgressMeta.no_idp;

                            return (
                            <div key={item.n} style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "8px" }}>
                                <div className="av" style={{ width: "30px", height: "30px", fontSize: "12px", background: "var(--navy)" }}>{item.n[0]}</div>
                                <div style={{ flex: 1 }}>
                                    <div className="fw6 fs12">{item.t}{item.n}</div>
                                    <div className="muted fs11">{item.p} · {item.groupName}</div>
                                </div>
                                <span className={`b ${meta.badge}`} style={{ maxWidth: "132px", textAlign: "right", whiteSpace: "normal", lineHeight: 1.3 }}>{meta.label}</span>
                            </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {selectedDetail && (
                <div className="mo" style={{ zIndex: 300 }} onMouseDown={() => setSelectedGroup(null)}>
                    <div className="mo-box" style={{ width: "520px" }} onMouseDown={event => event.stopPropagation()}>
                        <div className="mo-h">
                            <div className="fw8 fs14">{selectedDetail.d} · สมาชิกและสถานะ IDP</div>
                            <button className="btn btn-s btn-sm" onClick={() => setSelectedGroup(null)}>ปิด</button>
                        </div>
                        <div className="mo-b">
                            {selectedDetail.members.map(item => {
                                const meta = statusMeta[item.idpStatus];

                                return (
                                    <div key={item.n} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px" }}>
                                        <div className="av" style={{ width: "34px", height: "34px", fontSize: "13px", background: "var(--navy)" }}>{item.n[0]}</div>
                                        <div style={{ flex: 1 }}>
                                            <div className="fw6 fs13">{item.t}{item.n}</div>
                                            <div className="muted fs11">{item.p} · {item.idpStatus === "no_idp" ? "ยังไม่มีแผน IDP" : `เรื่อง: ${item.idpTopic}`}</div>
                                        </div>
                                        <span className={`b ${meta.badge}`}>{meta.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export const DeptMonitor: React.FC<{ users: any[] }> = ({ users }) => {
    const deptKeys = Object.keys(DEPT_STRUCTURE);
    const [activeDept, setActiveDept] = useState(deptKeys[0]);

    const getStaffData = (unit: string) => users.filter(u => {
        if (!u.d) return false;
        const parts = u.d.split(" > ");
        if (parts[0] !== activeDept) return false;
        return parts[parts.length - 1] === unit;
    }).map(u => ({
        n: u.t + u.n, sso: u.sso, d: "ประเมินแล้ว", s: u.evalStatus, p: 100, unitScore: 4.2, pos: u.p, av: u.n[0]
    }));

    const deptWorks = DEPT_STRUCTURE[activeDept as keyof typeof DEPT_STRUCTURE] || [];

    return (
        <>
            <div className="flex ic jb mb20">
                <div>
                    <div className="sec-t">ภาพรวมหน่วยงาน (ผู้บังคับบัญชา) </div>
                    <div className="sec-s">ตรวจสอบผลการประเมินจากหัวหน้าหน่วยงานใน {activeDept} เพื่อส่งต่อผู้บริหาร</div>
                </div>
                <div className="flex ic g8">
                    <span className="fs12 fw6 muted">เลือกฝ่าย:</span>
                    <select className="ta" style={{ width: 'fit-content', padding: '6px 10px', fontSize: '13px' }} value={activeDept} onChange={e => setActiveDept(e.target.value)}>
                        {deptKeys.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </div>

            <div className="g3 mb16">
                <div className="sc"><div className="sl">หน่วยงานย่อย (Units)</div><div className="sv">{deptWorks.reduce((acc, curr) => acc + curr.units.length, 0)}</div></div>
                <div className="sc"><div className="sl">หัวหน้าหน่วยประเมินแล้ว</div><div className="sv bc">85%</div></div>
                <div className="sc"><div className="sl">ส่งให้ผู้บริหารคณะแล้ว</div><div className="sv gcc">42%</div></div>
            </div>

            <div className="card mb14">
                <div className="ch">
                    <div className="ct">รายการประเมินจากรอบหัวหน้าหน่วยงาน — {activeDept}</div>
                    <div style={{ marginLeft: 'auto' }}>
                        <button className="btn btn-g btn-sm" onClick={() => alert("ยืนยันผลประเมินทั้งหมดในฝ่ายและส่งให้ผู้บริหารคณะเรียบร้อย")}> ยันประเมินทั้งฝ่าย</button>
                    </div>
                </div>
                <div className="cb" style={{ padding: 0 }}>
                    {deptWorks.map((w, wi) => (
                        <div key={wi} className={wi !== deptWorks.length - 1 ? "mb0" : ""}>
                            <div style={{ background: 'var(--navy)', color: '#fff', padding: '10px 16px', fontWeight: 700, fontSize: '14px', position: 'sticky', top: 0, zIndex: 10 }}>
                                 {w.work}
                            </div>
                            {w.units.map((un, ui) => (
                                <div key={ui} style={{ borderBottom: (ui === w.units.length - 1 && wi === deptWorks.length - 1) ? "" : "8px solid var(--bg)" }}>
                                    <div style={{ background: '#f8fafc', padding: '8px 16px', borderLeft: '4px solid var(--blue)', fontSize: '13px', fontWeight: 700, color: 'var(--blue)' }}> {un}</div>
                                    <div className="cb" style={{ padding: 0 }}>
                                        <table className="tbl">
                                            <thead>
                                                <tr>
                                                    <th>ชื่อ-นามสกุล</th>
                                                    <th style={{ width: '150px', textAlign: 'center' }}>คะแนนหัวหน้าหน่วย</th>
                                                    <th style={{ width: '150px' }}>สถานะ</th>
                                                    <th style={{ width: '120px' }}>จัดการ</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {getStaffData(un).map((s, si) => (
                                                    <tr key={si}>
                                                        <td>
                                                            <div className="flex ic g10">
                                                                <div className="av s32" style={{ background: 'var(--navy)', color: '#fff', fontSize: '12px' }}>{s.av}</div>
                                                                <div className="flex col">
                                                                    <div className="fw7 fs13" style={{ color: 'var(--navy)' }}>{s.n}</div>
                                                                    <div className="fs11 muted">{s.pos}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <span className="fw8 fs14" style={{ color: 'var(--blue)' }}>{s.unitScore.toFixed(1)}</span>
                                                            <span className="muted fs10" style={{ marginLeft: '4px' }}>/ 5.0</span>
                                                        </td>
                                                        <td>
                                                            {s.s === 'unit_evaluated' && <span className="b bt">Unit Head ประเมินแล้ว</span>}
                                                            {s.s === 'dept_evaluated' && <span className="b bg-blue text-white">ผู้บริหารประเมินแล้ว</span>}
                                                            {s.s === 'dean_approved' && <span className="b bg-green text-white">คณบดีอนุมัติแล้ว</span>}
                                                            {s.s === 'self_submitted' && <span className="b by">รอ Unit Head</span>}
                                                            {(!s.s || s.s === 'draft') && <span className="b muted">รอดำเนินการ</span>}
                                                        </td>
                                                        <td><button className="btn btn-s btn-sm" style={{ padding: '4px 8px', fontSize: '11px' }}> รีวิวผล</button></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="card">
                <div className="ch"><div className="ct">สมรรถนะเด่นของบุคลากรใน {activeDept}</div></div>
                <div className="cb">
                    <div className="g3">
                        {["AI Literacy", "ดิจิทัล", "วิเคราะห์", "ทีมเวิร์ก", "บริการ"].slice(0, 3).map((p, i) => (
                            <div key={i} className="card p12 text-center">
                                <div className="muted fs11 mb4">{p}</div>
                                <div className="fw8 fs18 mb8" style={{ color: 'var(--blue)' }}>Level: {i === 0 ? '3.8' : '3.2'}</div>
                                <div className="pw" style={{ height: '6px' }}>
                                    <div className="pb" style={{ width: i === 0 ? '80%' : '65%', background: 'var(--blue)' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt12 text-center">
                        <button className="btn btn-s btn-sm"> ดาวน์โหลดรายงานสรุปทั้ง {activeDept} (PDF)</button>
                    </div>
                </div>
            </div>
        </>
    );
};
