import React, { useState } from 'react';
import { DEPT_STRUCTURE } from '../data';

export const ManagerGap: React.FC<{ users: any[] }> = ({ users }) => {
    const [openDept, setOpenDept] = useState<string | null>(null);
    const [openProblem, setOpenProblem] = useState<string | null>(null);

    const totalStaff = 247;
    const assessed = 220;
    const passed = 147;
    const failed = 73;
    const passPct = Math.round((passed / assessed) * 100);

    const deptRows = [
        { n: "สำนักงานคณะฯ", total: 55, assessed: 55, pass: 43, fail: 12, level: "ต้องเฝ้าระวัง", levelClass: "by" },
        { n: "ฝ่ายแผนยุทธศาสตร์และพัฒนาองค์กร", total: 52, assessed: 52, pass: 32, fail: 20, level: "⚠ ความเสี่ยงสูง", levelClass: "br" },
        { n: "ฝ่ายการศึกษาและพัฒนาทักษะการเรียนรู้", total: 43, assessed: 43, pass: 27, fail: 16, level: "⚠ ความเสี่ยงสูง", levelClass: "br" },
        { n: "ฝ่ายวิจัย นวัตกรรมและการต่างประเทศ", total: 38, assessed: 34, pass: 24, fail: 10, level: "ต้องเฝ้าระวัง", levelClass: "by" },
        { n: "ฝ่ายบริหาร", total: 31, assessed: 28, pass: 21, fail: 7, level: "ปกติ", levelClass: "bg" },
        { n: "หน่วยงานสายวิชาการ", total: 28, assessed: 8, pass: 0, fail: 8, level: "ข้อมูลไม่พอ", levelClass: "bgr" }
    ];

    const problemGroups = [
        {
            label: "สายสนับสนุน",
            color: "var(--blue)",
            rows: [
                { n: "การใช้เทคโนโลยีดิจิทัล", count: 19, color: "var(--red)", width: 100 },
                { n: "การวิเคราะห์ข้อมูล", count: 16, color: "#f05a0a", width: 84 },
                { n: "AI Literacy", count: 10, color: "#d97706", width: 53 },
                { n: "การทำงานเป็นทีม", count: 8, color: "var(--teal)", width: 42 }
            ]
        },
        {
            label: "สายวิชาการ",
            color: "var(--purple)",
            rows: [
                { n: "AI Literacy", count: 28, color: "var(--red)", width: 100 },
                { n: "การวิเคราะห์ข้อมูล", count: 14, color: "#f05a0a", width: 50 },
                { n: "การใช้เทคโนโลยีดิจิทัล", count: 13, color: "#d97706", width: 46 },
                { n: "การสื่อสารเชิงวิชาการ", count: 9, color: "var(--teal)", width: 32 }
            ]
        }
    ];

    const detailRows: Record<string, { n: string; fail: number; note: string }[]> = {
        "สำนักงานคณะฯ": [
            { n: "การใช้เทคโนโลยีดิจิทัล", fail: 8, note: "ต้องพัฒนาเร่งด่วน" },
            { n: "การวิเคราะห์ข้อมูล", fail: 4, note: "ต้องเฝ้าระวัง" }
        ],
        "ฝ่ายแผนยุทธศาสตร์และพัฒนาองค์กร": [
            { n: "AI Literacy", fail: 11, note: "ความเสี่ยงสูง" },
            { n: "การวิเคราะห์ข้อมูล", fail: 9, note: "ความเสี่ยงสูง" }
        ],
        "ฝ่ายการศึกษาและพัฒนาทักษะการเรียนรู้": [
            { n: "การใช้เทคโนโลยีดิจิทัล", fail: 9, note: "ความเสี่ยงสูง" },
            { n: "AI Literacy", fail: 7, note: "ต้องเฝ้าระวัง" }
        ]
    };

    const getPct = (value: number, total: number) => total ? Math.round((value / total) * 100) : 0;

    return (
        <>
            <div className="mb20">
                <div className="sec-t" style={{ color: "var(--navy)", fontSize: "24px" }}>ภาพรวม Competency คณะ</div>
                <div className="sec-s">คณะวิศวกรรมศาสตร์ · รอบประเมิน 2568</div>
            </div>

            <div className="mb20" style={{ background: "var(--navy)", borderRadius: "16px", padding: "34px", color: "#fff", display: "grid", gridTemplateColumns: "1fr auto", gap: "20px", alignItems: "center" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(120px, 1fr))", gap: "0" }}>
                    {[
                        { l: "บุคลากรทั้งหมด", v: totalStaff, s: "วิชาการ 143 · สนับสนุน 104", c: "#fff" },
                        { l: "ประเมินแล้ว", v: assessed, s: `รอ ${totalStaff - assessed} คน`, c: "#fff" },
                        { l: "ผ่านเกณฑ์", v: passed, s: `${passPct}% ของที่ประเมิน`, c: "#4ade80" },
                        { l: "ไม่ผ่านเกณฑ์", v: failed, s: `${100 - passPct}% ของที่ประเมิน`, c: "#fca5a5" }
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

            <div className="card mb20" style={{ borderRadius: "14px", overflow: "hidden" }}>
                <div className="ch" style={{ padding: "20px 22px", display: "block" }}>
                    <div className="ct" style={{ fontSize: "16px" }}>ผลรายหน่วยงาน</div>
                    <div className="cs">กดที่หน่วยงานเพื่อดูรายสายงาน</div>
                </div>
                <div className="cb" style={{ padding: "18px 22px" }}>
                    {deptRows.map((d) => {
                        const passWidth = getPct(d.pass, d.assessed);
                        const failWidth = 100 - passWidth;
                        const isOpen = openDept === d.n;
                        return (
                            <div key={d.n} className="mb14">
                                <button
                                    type="button"
                                    onClick={() => setOpenDept(isOpen ? null : d.n)}
                                    style={{ width: "100%", background: "#fff", border: "1px solid var(--border)", borderRadius: "12px", padding: "14px 20px", boxShadow: "var(--sh)", cursor: "pointer", display: "grid", gridTemplateColumns: "minmax(220px, 1fr) 130px 130px minmax(260px, 1.4fr) 132px 20px", gap: "14px", alignItems: "center", textAlign: "left", fontFamily: "inherit" }}
                                >
                                    <div style={{ borderLeft: "4px solid var(--navy)", paddingLeft: "16px" }}>
                                        <div className="fw8 fs14" style={{ color: "var(--navy)" }}>{d.n}</div>
                                        <div className="muted fs12 mt4">{d.total} คน · ประเมินแล้ว {d.assessed} คน</div>
                                    </div>
                                    <div style={{ border: "1px solid var(--green-md)", background: "var(--green-bg)", color: "var(--green)", borderRadius: "8px", padding: "8px 10px", textAlign: "center" }}>
                                        <div className="fw8" style={{ fontSize: "18px", lineHeight: 1 }}>{d.pass}</div>
                                        <div className="fs11 fw7 mt4">ผ่าน</div>
                                    </div>
                                    <div style={{ border: "1px solid #fca5a5", background: "var(--red-bg)", color: "var(--red)", borderRadius: "8px", padding: "8px 10px", textAlign: "center" }}>
                                        <div className="fw8" style={{ fontSize: "18px", lineHeight: 1 }}>{d.fail}</div>
                                        <div className="fs11 fw7 mt4">ไม่ผ่าน</div>
                                    </div>
                                    <div>
                                        <div style={{ height: "13px", borderRadius: "999px", overflow: "hidden", background: "#e2e8f0", display: "flex" }}>
                                            <div style={{ width: `${passWidth}%`, background: "var(--green)" }} />
                                            <div style={{ width: `${failWidth}%`, background: "#fecaca" }} />
                                        </div>
                                        <div className="flex jb fs11 muted mt4">
                                            <span>{passWidth}%</span>
                                            <span>{failWidth}%</span>
                                        </div>
                                    </div>
                                    <span className={`b ${d.levelClass}`} style={{ justifyContent: "center" }}>{d.level}</span>
                                    <span className="muted" style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: ".15s" }}>⌄</span>
                                </button>
                                {isOpen && (
                                    <div style={{ margin: "8px 20px 0 20px", border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden", background: "var(--bg)" }}>
                                        {(detailRows[d.n] || [{ n: "ยังไม่มีรายการสมรรถนะที่ต้องเฝ้าระวัง", fail: 0, note: "ปกติ" }]).map((row) => (
                                            <div key={row.n} className="flex ic g12" style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
                                                <div className="fw6 fs12" style={{ flex: 1 }}>{row.n}</div>
                                                <span className="b br">{row.fail} คน</span>
                                                <span className="muted fs12">{row.note}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="card" style={{ borderRadius: "14px", overflow: "hidden" }}>
                <div className="ch" style={{ padding: "20px 22px", display: "block" }}>
                    <div className="ct" style={{ fontSize: "16px" }}>สมรรถนะที่มีปัญหา แยกตามสายงาน</div>
                    <div className="cs">กดที่รายการเพื่อดูว่ามาจากหน่วยงานใดบ้าง</div>
                </div>
                <div className="cb" style={{ padding: "12px 22px 22px" }}>
                    <div style={{ background: "var(--yellow-bg)", border: "1px solid #fde68a", borderRadius: "9px", color: "var(--yellow)", padding: "12px 16px", marginBottom: "20px", fontSize: "13px" }}>
                        ⚠ บุคลากร 1 คนสามารถไม่ผ่านได้หลายสมรรถนะ ผลรวมอาจสูงกว่าจำนวนจริง
                    </div>
                    {problemGroups.map((group) => (
                        <div key={group.label} style={{ marginBottom: "26px" }}>
                            <div className="b" style={{ background: group.color, color: "#fff", fontSize: "13px", padding: "7px 16px", borderRadius: "20px", marginBottom: "14px" }}>{group.label}</div>
                            {group.rows.map((row, idx) => {
                                const id = `${group.label}-${row.n}`;
                                const isOpen = openProblem === id;
                                return (
                                    <div key={id} className="mb10">
                                        <button
                                            type="button"
                                            onClick={() => setOpenProblem(isOpen ? null : id)}
                                            style={{ width: "100%", background: "#fff", border: "1px solid var(--border)", borderRadius: "9px", padding: "16px 20px", boxShadow: "var(--sh)", cursor: "pointer", display: "grid", gridTemplateColumns: "52px minmax(220px, 1fr) 250px 88px 20px", gap: "16px", alignItems: "center", textAlign: "left", fontFamily: "inherit" }}
                                        >
                                            <span style={{ width: "32px", height: "32px", borderRadius: "50%", background: row.color, color: "#fff", display: "grid", placeItems: "center", fontWeight: 800 }}>{idx + 1}</span>
                                            <span className="fw8 fs14" style={{ color: "var(--navy)" }}>{row.n}</span>
                                            <span style={{ height: "8px", borderRadius: "999px", background: "#e2e8f0", overflow: "hidden", display: "block" }}>
                                                <span style={{ display: "block", height: "100%", width: `${row.width}%`, background: row.color, borderRadius: "999px" }} />
                                            </span>
                                            <span className="fw8 fs13" style={{ color: row.color, textAlign: "right" }}>{row.count} คน</span>
                                            <span className="muted" style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: ".15s" }}>⌄</span>
                                        </button>
                                        {isOpen && (
                                            <div style={{ margin: "8px 20px 0 72px", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg)" }}>
                                                <div className="fs12 muted mb8">หน่วยงานที่พบรายการนี้มากที่สุด</div>
                                                <div className="g3">
                                                    {["สำนักงานคณะฯ", "ฝ่ายแผนยุทธศาสตร์ฯ", "ฝ่ายการศึกษาฯ"].map((d, i) => (
                                                        <div key={d} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 12px" }}>
                                                            <div className="fw7 fs12">{d}</div>
                                                            <div className="muted fs11 mt4">{Math.max(row.count - (i * 5), 2)} คน</div>
                                                        </div>
                                                    ))}
                                                </div>
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

export const ManagerIDP: React.FC<{ users: any[] }> = ({ users }) => {
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

    const idpStats = {
        completed: 18,
        inProgress: 22,
        submitted: 13,
        draft: 10,
        noIdp: 10
    };

    const groupProgress = [
        {
            d: "สนับสนุนการศึกษาและวิชาการ",
            total: 15,
            hasIDP: 13,
            idpList: [
                { n: "สมชาย มีสุข", pos: "นักวิชาการศึกษา", topic: "การใช้เทคโนโลยีดิจิทัล", status: "in_progress" },
                { n: "ชลธิชา วรรณวิทย์", pos: "นักวิชาการวิทยาศาสตร์", topic: "การทำงานเป็นทีม", status: "draft" },
                { n: "กัญญารัตน์ ศรีวิชา", pos: "นักวิชาการศึกษา", topic: "การวิเคราะห์ข้อมูล", status: "completed" }
            ]
        },
        {
            d: "เทคโนโลยีสารสนเทศ",
            total: 14,
            hasIDP: 12,
            idpList: [
                { n: "วิชัย ระบบดี", pos: "นักวิชาการคอมพิวเตอร์", topic: "AI Literacy", status: "draft" },
                { n: "ปกรณ์ ศิริวัฒน์", pos: "นักเทคโนโลยีสารสนเทศ", topic: "การบริหารโครงการดิจิทัล", status: "submitted" }
            ]
        },
        {
            d: "บริหารยุทธศาสตร์",
            total: 16,
            hasIDP: 14,
            idpList: [
                { n: "นฤมล ใจเย็น", pos: "นักวิชาการแผนและสารสนเทศ", topic: "การวิเคราะห์ข้อมูล", status: "completed" },
                { n: "จิราพร วัฒนกลยุทธ์", pos: "นักจัดการงานทั่วไป", topic: "การสื่อสารเชิงกลยุทธ์", status: "in_progress" }
            ]
        },
        {
            d: "ทรัพยากรบุคคล",
            total: 14,
            hasIDP: 12,
            idpList: [
                { n: "มาลี ดีเสมอ", pos: "นักทรัพยากรบุคคล", topic: "AI Literacy", status: "submitted" },
                { n: "พรพิมล บุคคลดี", pos: "นักทรัพยากรบุคคล", topic: "การพัฒนาบุคลากร", status: "in_progress" }
            ]
        },
        {
            d: "บริการการเงิน",
            total: 14,
            hasIDP: 12,
            idpList: [
                { n: "อดิศร เงินดี", pos: "นักวิชาการเงินและบัญชี", topic: "การควบคุมความเสี่ยง", status: "draft" },
                { n: "วารุณี พรหมบัญชี", pos: "นักบัญชี", topic: "การวิเคราะห์ข้อมูลการเงิน", status: "completed" }
            ]
        }
    ];

    const noProgress = [
        { n: "ชลธิชา วรรณวิทย์", pos: "นักวิชาการวิทยาศาสตร์", d: "สนับสนุนการศึกษาและวิชาการ", reason: "draft" },
        { n: "วิชัย ระบบดี", pos: "นักวิชาการคอมพิวเตอร์", d: "เทคโนโลยีสารสนเทศ", reason: "draft" },
        { n: "จิราพร วัฒนกลยุทธ์", pos: "นักจัดการงานทั่วไป", d: "บริหารยุทธศาสตร์", reason: "no_idp" },
        { n: "อดิศร เงินดี", pos: "นักวิชาการเงินและบัญชี", d: "บริการการเงิน", reason: "no_idp" },
        { n: "อรพรรณ ศรีสวัสดิ์", pos: "อาจารย์", d: "สายวิชาการ", reason: "rejected" }
    ];

    const userByName = new Map<string, any>(users.map(user => [user.n, user]));
    const selectedDetail = groupProgress.find(group => group.d === selectedGroup);
    const totalFail = groupProgress.reduce((total, group) => total + group.total, 0);
    const totalHasIDP = idpStats.completed + idpStats.inProgress + idpStats.submitted + idpStats.draft;
    const pctIDP = Math.round((totalHasIDP / totalFail) * 100);

    const statusMeta: Record<string, { label: string; badge: string }> = {
        completed: { label: "เสร็จสิ้น", badge: "bg" },
        in_progress: { label: "กำลังดำเนินการ", badge: "bt" },
        submitted: { label: "รออนุมัติ", badge: "by" },
        draft: { label: "Draft", badge: "bgr" }
    };

    const noProgressMeta: Record<string, { label: string; badge: string }> = {
        draft: { label: "ยังไม่ส่งแผน (Draft)", badge: "by" },
        no_idp: { label: "ยังไม่มีการทำ IDP", badge: "bgr" },
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
                <div className="sec-t">ภาพรวม IDP คณะ</div>
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
                                <span style={{ background: "var(--teal)", borderRadius: "20px", color: "#fff", fontSize: "13px", fontWeight: 800, padding: "3px 10px" }}>{pctIDP}%</span>
                            </div>
                            <div className="fs12 muted mt4">ยังไม่ได้ทำ IDP อีก <span className="fw7 rc">{idpStats.noIdp} คน</span></div>
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
                <div className="sc"><div className="sl">Draft / ยังไม่มี IDP</div><div className="sv rc">{idpStats.draft + idpStats.noIdp}</div><div className="ss muted">Draft {idpStats.draft} · ไม่มี IDP {idpStats.noIdp}</div></div>
            </div>

            <div className="g2 mb14">
                <div className="card">
                    <div className="ch"><div className="ct">ความคืบหน้า IDP รายกลุ่มงาน</div></div>
                    <div className="cb" style={{ padding: 0 }}>
                        {groupProgress.map(group => {
                            const pct = Math.round((group.hasIDP / group.total) * 100);
                            const barColor = pct >= 90 ? "var(--green)" : pct >= 70 ? "var(--teal)" : pct >= 50 ? "var(--yellow)" : "var(--red)";

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
                                        <span className="fs11 fw7" style={{ color: barColor, textAlign: "right", width: "36px" }}>{pct}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="card">
                    <div className="ch">
                        <div>
                            <div className="ct">บุคลากรที่ยังไม่มีความคืบหน้า IDP</div>
                            <div className="cs">{noProgress.length} คน</div>
                        </div>
                        <button className="btn btn-p btn-sm" style={{ marginLeft: "auto" }} onClick={() => alert(`ส่งแจ้งเตือนไปยัง ${noProgress.length} คนแล้ว`)}>แจ้งเตือนทั้งหมด</button>
                    </div>
                    <div className="cb" style={{ padding: 0 }}>
                        {noProgress.map(item => {
                            const user = userByName.get(item.n);
                            const meta = noProgressMeta[item.reason];

                            return (
                            <div key={item.n} style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "8px" }}>
                                <div className="av" style={{ width: "30px", height: "30px", fontSize: "12px", background: "var(--navy)" }}>{item.n[0]}</div>
                                <div style={{ flex: 1 }}>
                                    <div className="fw6 fs12">{user ? `${user.t}${user.n}` : item.n}</div>
                                    <div className="muted fs11">{item.pos} · {item.d}</div>
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
                            <div className="fw8 fs14">{selectedDetail.d} · รายละเอียด IDP</div>
                            <button className="btn btn-s btn-sm" onClick={() => setSelectedGroup(null)}>ปิด</button>
                        </div>
                        <div className="mo-b">
                            {selectedDetail.idpList.map(item => {
                                const meta = statusMeta[item.status];
                                const user = userByName.get(item.n);

                                return (
                                    <div key={item.n} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px" }}>
                                        <div className="av" style={{ width: "34px", height: "34px", fontSize: "13px", background: "var(--navy)" }}>{item.n[0]}</div>
                                        <div style={{ flex: 1 }}>
                                            <div className="fw6 fs13">{user ? `${user.t}${user.n}` : item.n}</div>
                                            <div className="muted fs11">{item.pos} · เรื่อง: {item.topic}</div>
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
                    <div className="sec-t">ภาพรวมหน่วยงาน (ผู้บังคับบัญชา) 🏢</div>
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
                        <button className="btn btn-g btn-sm" onClick={() => alert("ยืนยันผลประเมินทั้งหมดในฝ่ายและส่งให้ผู้บริหารคณะเรียบร้อย")}>✅ ยันประเมินทั้งฝ่าย</button>
                    </div>
                </div>
                <div className="cb" style={{ padding: 0 }}>
                    {deptWorks.map((w, wi) => (
                        <div key={wi} className={wi !== deptWorks.length - 1 ? "mb0" : ""}>
                            <div style={{ background: 'var(--navy)', color: '#fff', padding: '10px 16px', fontWeight: 700, fontSize: '14px', position: 'sticky', top: 0, zIndex: 10 }}>
                                📁 {w.work}
                            </div>
                            {w.units.map((un, ui) => (
                                <div key={ui} style={{ borderBottom: (ui === w.units.length - 1 && wi === deptWorks.length - 1) ? "" : "8px solid var(--bg)" }}>
                                    <div style={{ background: '#f8fafc', padding: '8px 16px', borderLeft: '4px solid var(--blue)', fontSize: '13px', fontWeight: 700, color: 'var(--blue)' }}>🏠 {un}</div>
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
                                                        <td><button className="btn btn-s btn-sm" style={{ padding: '4px 8px', fontSize: '11px' }}>🔍 รีวิวผล</button></td>
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
                        <button className="btn btn-s btn-sm">📑 ดาวน์โหลดรายงานสรุปทั้ง {activeDept} (PDF)</button>
                    </div>
                </div>
            </div>
        </>
    );
};
