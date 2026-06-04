import React, { useMemo, useState } from "react";
import {
  DEFAULT_CHECKED_BEHAVIOR_IDS,
  MOCK_IDP_ACTIVITIES,
  WORKFLOW_COMPETENCIES,
  expectedBehaviorIdsFor,
  gapResultsFor,
  statusClass,
  statusLabel
} from "../workflow";

const fmt = (value: number) => value.toFixed(2).replace(/\.00$/, "");
const tagLabel = (type: string) => (type.indexOf("FC") === 0 ? "FC" : type);
const fullName = (user: any) => `${user?.t || ""}${user?.n || ""}`;
const submittedDateFor = (index: number) => `2026-06-${String(5 + index).padStart(2, "0")}`;
const allUnitsLabel = "รวมทุกงาน";
const allExpectedBehaviorIds = WORKFLOW_COMPETENCIES.flatMap(comp => expectedBehaviorIdsFor(comp));

const checkedForUser = (user: any, index: number) => {
  if (user?.sso === "20011") return allExpectedBehaviorIds;
  if (index % 4 === 1) return DEFAULT_CHECKED_BEHAVIOR_IDS.slice(0, 13);
  if (index % 4 === 2) return [...DEFAULT_CHECKED_BEHAVIOR_IDS, "CC-001-2.3", "CC-001-2.4", "FC2-062-2.1", "FC2-062-2.2"];
  if (index % 4 === 3) return DEFAULT_CHECKED_BEHAVIOR_IDS.slice(0, 16);
  return DEFAULT_CHECKED_BEHAVIOR_IDS;
};

const evalLabel: Record<string, string> = {
  draft: "ยังไม่ส่ง",
  self_submitted: "รอหัวหน้างาน",
  pending_supervisor: "รอหัวหน้างาน",
  unit_evaluated: "รออนุมัติขั้นสุดท้าย",
  pending_department_head: "รออนุมัติขั้นสุดท้าย",
  approved: "อนุมัติแล้ว",
  rejected: "ตีกลับ"
};

const evalClass: Record<string, string> = {
  draft: "bgr",
  self_submitted: "by",
  pending_supervisor: "by",
  unit_evaluated: "bb",
  pending_department_head: "bb",
  approved: "bg",
  rejected: "br"
};

const EvalBadge = ({ status }: { status?: string }) => (
  <span className={`b ${evalClass[status || "draft"] || "bgr"}`}>{evalLabel[status || "draft"] || status}</span>
);

const idpStatusMeta: Record<string, { label: string; badge: string }> = {
  draft: { label: "Draft", badge: "bgr" },
  submitted: { label: "Pending Plan", badge: "bb" },
  in_progress: { label: "In Progress", badge: "by" },
  evidence_submitted: { label: "Pending Result", badge: "bo" },
  completed: { label: "Completed", badge: "bg" },
  rejected: { label: "ส่งกลับแก้ไข", badge: "br" }
};

const idpMeta = (status?: string) => idpStatusMeta[status || "draft"] || idpStatusMeta.draft;

const Metric = ({ label, value, sub, tone = "default" }: { label: string; value: string | number; sub: string; tone?: "default" | "good" | "warn" | "bad" | "info" }) => {
  const color = tone === "good" ? "var(--green)" : tone === "warn" ? "var(--yellow)" : tone === "bad" ? "var(--red)" : tone === "info" ? "var(--blue)" : "var(--text)";
  return (
    <div className="sc">
      <div className="sl">{label}</div>
      <div className="sv" style={{ color }}>{value}</div>
      <div className="ss muted">{sub}</div>
    </div>
  );
};

const useDepartmentMembers = (users: any[], currentUser: any) =>
  useMemo(() => {
    const supervisorNames = new Set(
      users
        .filter(user => user.act !== false && user.sup === currentUser?.n)
        .map(user => user.n)
    );
    return users.filter(user => {
      if (!currentUser || user.sso === currentUser.sso || user.act === false) return false;
      return user.evaluator2 === currentUser.n || user.sup === currentUser.n || supervisorNames.has(user.sup);
    });
  }, [users, currentUser]);

const unitOptionsFor = (members: any[]) => [allUnitsLabel, ...Array.from(new Set(members.map(user => user.d).filter(Boolean)))];
const filteredByUnit = (members: any[], unit: string) => unit === allUnitsLabel ? members : members.filter(user => user.d === unit);

const ReadOnlyChecklist = ({ checkedIds }: { checkedIds: string[] }) => (
  <div style={{ display: "grid", gap: 10 }}>
    {WORKFLOW_COMPETENCIES.map(comp => {
      const expectedItems = comp.indicators.filter(item => item.level <= comp.expectedLevel);
      const checkedCount = expectedItems.filter(item => checkedIds.includes(item.id)).length;
      return (
        <div className="ac" key={comp.code}>
          <div className="ah" style={{ cursor: "default" }}>
            <span className={comp.tagClass}>{tagLabel(comp.type)}</span>
            <span className="fw8">{comp.code} · {comp.name}</span>
            <span className="b bgr" style={{ marginLeft: "auto" }}>Expected Level {comp.expectedLevel}</span>
            <span className={`b ${checkedCount === expectedItems.length ? "bg" : checkedCount ? "by" : "br"}`}>{checkedCount}/{expectedItems.length}</span>
          </div>
          <div className="ab open">
            <div style={{ display: "grid", gap: 8 }}>
              {expectedItems.map(item => (
                <label key={item.id} className="check-row" style={{ opacity: checkedIds.includes(item.id) ? 1 : 0.52 }}>
                  <input type="checkbox" checked={checkedIds.includes(item.id)} disabled readOnly />
                  <span><b>ระดับ {item.level} ข้อ {item.order % 4 || 4}</b> · {item.text}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

const activityRowsFor = (members: any[]) =>
  members.flatMap((user, index) => {
    const statuses = ["submitted", "in_progress", "evidence_submitted", "completed"];
    return MOCK_IDP_ACTIVITIES.slice(0, index % 2 === 0 ? 2 : 1).map((activity, activityIndex) => ({
      ...activity,
      id: `${user.sso}-${activity.id}-${activityIndex}`,
      user,
      userSso: user.sso,
      status: statuses[(index + activityIndex) % statuses.length] as any,
      evidenceFiles: activityIndex === 0 ? ["หลักฐานการพัฒนา.pdf"] : activity.evidenceFiles,
      evidenceUrl: activityIndex === 1 ? "https://example.com/evidence" : activity.evidenceUrl
    }));
  });

export const DepartmentAssessmentApproval: React.FC<{ users: any[]; setUsers: any; currentUser: any }> = ({ users, setUsers, currentUser }) => {
  const members = useDepartmentMembers(users, currentUser);
  const units = unitOptionsFor(members);
  const [unit, setUnit] = useState(allUnitsLabel);
  const visibleMembers = filteredByUnit(members, unit);
  const pending = visibleMembers.filter(user => user.evalStatus === "pending_department_head" || user.evalStatus === "unit_evaluated");
  const [selectedSso, setSelectedSso] = useState<string | null>(pending[0]?.sso || null);
  const [comment, setComment] = useState("");
  const selectedIndex = visibleMembers.findIndex(user => user.sso === selectedSso);
  const selected = visibleMembers.find(user => user.sso === selectedSso) || null;
  const checkedIds = selected ? checkedForUser(selected, selectedIndex < 0 ? 0 : selectedIndex) : [];
  const gaps = selected ? gapResultsFor(checkedIds) : [];

  const update = (status: string) => {
    if (!selected) return;
    if (status === "rejected" && !comment.trim()) {
      alert("กรุณาพิมพ์ Comment ก่อนตีกลับ");
      return;
    }
    setUsers((prev: any[]) => prev.map(user =>
      user.sso === selected.sso ? { ...user, evalStatus: status, departmentHeadComment: comment } : user
    ));
    setSelectedSso(null);
    setComment("");
    alert(status === "approved" ? "อนุมัติผลการประเมินและสร้างข้อมูลตั้งต้น IDP แล้ว" : "ตีกลับให้แก้ไขพร้อม Comment แล้ว");
  };

  return (
    <>
      <div className="flex ic jb mb20">
        <div>
          <div className="sec-t">อนุมัติผลการประเมินในฝ่าย</div>
          <div className="sec-s">กล่องขาเข้าผลประเมินของทุกคนในสายบังคับบัญชา ตรวจ read-only พร้อม Comment หัวหน้างาน</div>
        </div>
        <select className="sel" style={{ width: 230 }} value={unit} onChange={event => setUnit(event.target.value)}>
          {units.map(item => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      <div className="grid mb16" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12 }}>
        <Metric label="รออนุมัติขั้นสุดท้าย" value={pending.length} sub="Pending Assessment Inbox" tone="warn" />
        <Metric label="อนุมัติแล้ว" value={visibleMembers.filter(user => user.evalStatus === "approved").length} sub="ปิดจ๊อบการประเมินแล้ว" tone="good" />
        <Metric label="ส่งกลับแก้ไข" value={visibleMembers.filter(user => user.evalStatus === "rejected").length} sub="ต้องประเมินใหม่" tone="bad" />
      </div>

      <div className="card">
        <div className="ch">
          <div>
            <div className="fw8">Pending Assessment Inbox</div>
            <div className="muted fs12 mt4">แสดงชื่อ ตำแหน่ง สังกัดงาน วันที่ส่งประเมิน และปุ่มตรวจสอบ</div>
          </div>
          <span className="b bb">{pending.length} รายการ</span>
        </div>
        <div className="cb" style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr><th>ชื่อ-นามสกุล</th><th>ตำแหน่ง</th><th>สังกัดงาน</th><th>วันที่ส่งประเมิน</th><th>สถานะ</th><th></th></tr>
            </thead>
            <tbody>
              {pending.map((user, index) => (
                <tr key={user.sso}>
                  <td><b>{fullName(user)}</b></td>
                  <td>{user.p}</td>
                  <td>{user.d}</td>
                  <td>{submittedDateFor(index)}</td>
                  <td><EvalBadge status={user.evalStatus} /></td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-s btn-sm" onClick={() => { setSelectedSso(user.sso); setComment(user.departmentHeadComment || ""); }}>ตรวจสอบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pending.length === 0 && <div className="text-center muted fs13" style={{ padding: 28 }}>ไม่มีรายการรออนุมัติในตัวกรองนี้</div>}
        </div>
      </div>

      {selected && (
        <div className="mo" style={{ alignItems: "flex-start", paddingTop: 34 }} onClick={() => setSelectedSso(null)}>
          <div className="mo-box" style={{ width: 1100, maxWidth: "calc(100vw - 32px)" }} onClick={event => event.stopPropagation()}>
            <div className="mo-h">
              <div>
                <div className="fw8">ตรวจสอบผลประเมินขั้นสุดท้าย · {fullName(selected)}</div>
                <div className="muted fs12 mt4">Mirror View แบบ read-only พร้อม Supervisor Comment เพื่อประกอบการตัดสินใจ</div>
              </div>
              <button className="btn btn-s btn-sm" onClick={() => setSelectedSso(null)}>ปิด</button>
            </div>
            <div className="mo-b" style={{ display: "grid", gap: 14 }}>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10 }}>
                {gaps.map(gap => (
                  <div key={gap.competency.code} className="sc" style={{ boxShadow: "none" }}>
                    <div className="sl">{gap.competency.code}</div>
                    <div className="sv" style={{ fontSize: 24, color: gap.gap < 0 ? "var(--red)" : "var(--green)" }}>{fmt(gap.gap)}</div>
                    <div className="ss muted">Actual {fmt(gap.actualScore)} / Expected {fmt(gap.expectedScore)}</div>
                  </div>
                ))}
              </div>
              <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12, background: "var(--blue-lt)" }}>
                <div className="sl">Supervisor Comment</div>
                <div className="fw8 fs13">{selected.supervisorComment || "หัวหน้างานตรวจแล้ว เห็นควรส่งต่อให้หัวหน้าฝ่ายพิจารณาขั้นสุดท้าย"}</div>
              </div>
              <ReadOnlyChecklist checkedIds={checkedIds} />
              <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 14, background: "var(--bg)" }}>
                <label className="lbl">Comment หัวหน้าฝ่าย</label>
                <textarea className="ta" value={comment} onChange={event => setComment(event.target.value)} placeholder="กรอกข้อเสนอแนะขั้นสุดท้าย หรือเหตุผลกรณีตีกลับ" />
                <div className="flex g8 mt12" style={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
                  <button className="btn btn-s" onClick={() => update("rejected")}>ปฏิเสธ / ส่งกลับแก้ไข</button>
                  <button className="btn btn-t" onClick={() => update("approved")}>อนุมัติผลการประเมิน</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const DepartmentGap: React.FC<{ users: any[]; currentUser: any }> = ({ users, currentUser }) => {
  const members = useDepartmentMembers(users, currentUser);
  const units = unitOptionsFor(members);
  const [unit, setUnit] = useState(allUnitsLabel);
  const [showAllCompetencies, setShowAllCompetencies] = useState(false);
  const visibleMembers = filteredByUnit(members, unit);
  const rows = visibleMembers.map((user, index) => ({ user, checkedIds: checkedForUser(user, index), gaps: gapResultsFor(checkedForUser(user, index)) }));
  const mustDevelop = rows.filter(row => row.gaps.some(gap => gap.gap < 0));
  const talent = rows.filter(row => row.gaps.every(gap => gap.gap >= 0));
  const passPercent = rows.length ? Math.round((talent.length / rows.length) * 100) : 0;
  const compStats = WORKFLOW_COMPETENCIES.map(comp => {
    const values = rows.map(row => row.gaps.find(gap => gap.competency.code === comp.code)?.gap || 0);
    return {
      comp,
      average: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0,
      passed: values.filter(value => value >= 0).length,
      failed: values.filter(value => value < 0).length
    };
  });
  const weakest = [...compStats].sort((a, b) => a.average - b.average);
  const strongest = [...compStats].sort((a, b) => b.average - a.average);
  const shownStats = showAllCompetencies ? weakest : weakest.slice(0, 5);

  return (
    <>
      <div className="flex ic jb mb20">
        <div>
          <div className="sec-t">ผลประเมินฝ่าย</div>
          <div className="sec-s">Advanced Filter, Executive Summary, Top 5 จุดแข็ง/จุดอ่อน, Heatmap และ Talent Pool</div>
        </div>
        <div className="flex g8" style={{ flexWrap: "wrap" }}>
          <select className="sel" style={{ width: 230 }} value={unit} onChange={event => setUnit(event.target.value)}>
            {units.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
          <button className="btn btn-s btn-sm" onClick={() => alert("Export PDF mock")}>Export PDF</button>
          <button className="btn btn-s btn-sm" onClick={() => alert("Export Excel mock")}>Export Excel</button>
        </div>
      </div>

      <div className="grid mb16" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 12 }}>
        <Metric label="ผ่านเกณฑ์" value={`${passPercent}%`} sub={`${talent.length}/${rows.length} คนไม่มี Gap ติดลบ`} tone="good" />
        <Metric label="ต้องพัฒนา" value={mustDevelop.length} sub="มีอย่างน้อย 1 สมรรถนะ Gap ติดลบ" tone="bad" />
        <Metric label="Top Strength" value={strongest[0]?.comp.code || "-"} sub={strongest[0] ? `${strongest[0].passed} คนผ่านเกณฑ์` : "ยังไม่มีข้อมูล"} tone="info" />
        <Metric label="Top Weakness" value={weakest[0]?.comp.code || "-"} sub={weakest[0] ? `${weakest[0].failed} คนไม่ผ่าน` : "ยังไม่มีข้อมูล"} tone="warn" />
      </div>

      <div className="grid mb16" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>
        <div className="card">
          <div className="ch"><div><div className="fw8">Top 5 สมรรถนะที่ต้องเร่งพัฒนา</div><div className="muted fs12 mt4">เรียงจากค่าเฉลี่ย Gap ต่ำสุด</div></div></div>
          <div className="cb" style={{ display: "grid", gap: 8 }}>
            {shownStats.map(item => (
              <div key={item.comp.code} className="mini-row">
                <div><div className="fw8">{item.comp.code} · {item.comp.name}</div><div className="muted fs12">ผ่าน {item.passed} คน · ไม่ผ่าน {item.failed} คน</div></div>
                <span className={`b ${item.average < 0 ? "br" : "bg"}`}>{fmt(item.average)}</span>
              </div>
            ))}
            <button className="btn btn-s btn-sm" onClick={() => setShowAllCompetencies(prev => !prev)} style={{ justifyContent: "center" }}>{showAllCompetencies ? "แสดง Top 5" : "ดูเพิ่มเติมทั้งหมด"}</button>
          </div>
        </div>
        <div className="card">
          <div className="ch"><div><div className="fw8">Talent & Succession Planning</div><div className="muted fs12 mt4">กลุ่ม Overachieve / Gap ไม่ติดลบ</div></div><span className="b bg">{talent.length} คน</span></div>
          <div className="cb" style={{ display: "grid", gap: 8 }}>
            {talent.map(row => (
              <div key={row.user.sso} className="mini-row">
                <div><div className="fw8">{fullName(row.user)}</div><div className="muted fs12">{row.user.p} · {row.user.d}</div></div>
                <span className="b bg">Talent Pool</span>
              </div>
            ))}
            {talent.length === 0 && <div className="muted fs13">ยังไม่มีรายชื่อ Talent Pool ในตัวกรองนี้</div>}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="ch"><div><div className="fw8">Department Gap Heatmap</div><div className="muted fs12 mt4">แกน X คือสมรรถนะทั้งหมด แกน Y คือรายชื่อหรือทีมย่อยตามตัวกรอง</div></div></div>
        <div className="cb" style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead><tr><th>บุคลากร</th>{WORKFLOW_COMPETENCIES.map(comp => <th key={comp.code}>{comp.code}</th>)}<th>กลุ่ม</th></tr></thead>
            <tbody>
              {rows.map(row => {
                const failed = row.gaps.filter(gap => gap.gap < 0).length;
                return (
                  <tr key={row.user.sso}>
                    <td><b>{fullName(row.user)}</b><div className="muted fs12">{row.user.d}</div></td>
                    {row.gaps.map(gap => <td key={gap.competency.code}><span className={`b ${gap.gap < 0 ? "br" : "bg"}`}>{fmt(gap.gap)}</span></td>)}
                    <td>{failed ? <span className="b br">ต้องพัฒนา {failed}</span> : <span className="b bg">Talent Pool</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && <div className="text-center muted fs13" style={{ padding: 28 }}>ไม่พบข้อมูลในตัวกรองนี้</div>}
        </div>
      </div>
    </>
  );
};

export const DepartmentIDPApproval: React.FC<{ users: any[]; currentUser: any }> = ({ users, currentUser }) => {
  const members = useDepartmentMembers(users, currentUser);
  const units = unitOptionsFor(members);
  const [unit, setUnit] = useState(allUnitsLabel);
  const [tab, setTab] = useState<"plan" | "result">("plan");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [decisionComment, setDecisionComment] = useState("");
  const [resultChoice, setResultChoice] = useState("achieved");
  const [continueReason, setContinueReason] = useState("");
  const visibleMembers = filteredByUnit(members, unit);
  const activities = activityRowsFor(visibleMembers);
  const pendingPlans = activities.filter(activity => activity.status === "submitted");
  const pendingResults = activities.filter(activity => activity.status === "evidence_submitted");
  const rows = tab === "plan" ? pendingPlans : pendingResults;
  const selected = rows.find(row => row.id === selectedId) || null;

  const submitDecision = (action: "approve" | "reject" | "certify" | "return") => {
    const needsComment = action === "reject" || action === "return" || (tab === "result" && resultChoice === "not_achieved");
    if (needsComment && !decisionComment.trim() && !continueReason.trim()) {
      alert("กรุณาพิมพ์ Comment / เหตุผลก่อนดำเนินการ");
      return;
    }
    const text = action === "approve" ? "อนุมัติแผนแล้ว แผนเข้าสู่สถานะ Active/In Progress"
      : action === "certify" ? "รับรองผลการพัฒนาและปิดแผนแล้ว"
        : "ส่งกลับแก้ไขพร้อม Comment แล้ว";
    alert(text);
    setSelectedId(null);
    setDecisionComment("");
    setContinueReason("");
    setResultChoice("achieved");
  };

  return (
    <>
      <div className="flex ic jb mb20">
        <div>
          <div className="sec-t">อนุมัติผล IDP</div>
          <div className="sec-s">แยกงานรออนุมัติแผนกับงานรอรับรองผล เพื่อไม่ให้เอกสารสองช่วงปะปนกัน</div>
        </div>
        <div className="flex g8" style={{ flexWrap: "wrap" }}>
          <select className="sel" style={{ width: 230 }} value={unit} onChange={event => setUnit(event.target.value)}>
            {units.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
          <div className="seg">
            <button className={tab === "plan" ? "on" : ""} onClick={() => setTab("plan")}>Pending Plan</button>
            <button className={tab === "result" ? "on" : ""} onClick={() => setTab("result")}>Pending Result</button>
          </div>
        </div>
      </div>

      <div className="grid mb16" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
        <Metric label="รออนุมัติแผน" value={pendingPlans.length} sub="Pending Department Head" tone="warn" />
        <Metric label="รอรับรองผล" value={pendingResults.length} sub="Evidence Submitted" tone="info" />
        <Metric label="เสร็จสิ้นแล้ว" value={activities.filter(activity => activity.status === "completed").length} sub="Completed" tone="good" />
      </div>

      <div className="card">
        <div className="ch"><div><div className="fw8">{tab === "plan" ? "คิวรออนุมัติแผน" : "คิวรอรับรองผล"}</div><div className="muted fs12 mt4">คลิกตรวจเอกสารเพื่อเปิดแบบฟอร์ม read-only ตามเอกสาร</div></div><span className="b bb">{rows.length} รายการ</span></div>
        <div className="cb" style={{ display: "grid", gap: 8 }}>
          {rows.map(row => {
            const meta = idpMeta(row.status);
            return (
              <button key={row.id} className="mini-row w100" onClick={() => { setSelectedId(row.id); setDecisionComment(""); }}>
                <div style={{ textAlign: "left", minWidth: 0 }}>
                  <div className="fw8">{fullName(row.user)} · {row.competencyCode}</div>
                  <div className="muted fs12">{row.activityDetail}</div>
                </div>
                <span className={`b ${meta.badge}`}>{meta.label}</span>
              </button>
            );
          })}
          {rows.length === 0 && <div className="text-center muted fs13" style={{ padding: 28 }}>ไม่มีรายการในแท็บนี้</div>}
        </div>
      </div>

      {selected && (
        <div className="mo" style={{ alignItems: "flex-start", paddingTop: 34 }} onClick={() => setSelectedId(null)}>
          <div className="mo-box" style={{ width: 960, maxWidth: "calc(100vw - 32px)" }} onClick={event => event.stopPropagation()}>
            <div className="mo-h">
              <div>
                <div className="fw8">{tab === "plan" ? "Plan Approval" : "Result Certification"} · {fullName(selected.user)}</div>
                <div className="muted fs12 mt4">{selected.competencyCode} · {selected.learningType}</div>
              </div>
              <button className="btn btn-s btn-sm" onClick={() => setSelectedId(null)}>ปิด</button>
            </div>
            <div className="mo-b" style={{ display: "grid", gap: 14 }}>
              <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 14, background: "var(--bg)" }}>
                <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
                  <div><div className="sl">ชื่อสมรรถนะที่ติดลบ</div><div className="fw8">{selected.competencyCode}</div></div>
                  <div><div className="sl">เป้าหมายในการพัฒนา</div><div className="fw8">{selected.target}</div></div>
                  <div><div className="sl">ประเภทการเรียนรู้</div><div className="fw8">{selected.learningType} · {selected.learningWeight}%</div></div>
                  <div><div className="sl">Timeline</div><div className="fw8">{selected.startDate} ถึง {selected.endDate}</div></div>
                </div>
                <div className="grid mt12" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
                  <div><div className="sl">รายละเอียดกิจกรรม</div><div className="fw8 fs13">{selected.activityDetail}</div></div>
                  <div><div className="sl">KPI / Success Criteria</div><div className="fw8 fs13">{selected.kpi}</div></div>
                </div>
              </div>

              {tab === "result" && (
                <>
                  <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
                    <div className="fw8 mb8">ส่วนตรวจสอบหลักฐาน</div>
                    <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
                      <div><div className="sl">Execution Status</div><div className="fw8">เป็นไปตามแผน</div></div>
                      <div><div className="sl">Evidence</div><div className="fw8">{selected.evidenceFiles?.join(", ") || selected.evidenceUrl || "ยังไม่มีหลักฐาน"}</div></div>
                      <div><div className="sl">Supervisor Feedback</div><div className="fw8">ตรวจหลักฐานเบื้องต้นแล้ว เห็นควรรับรองผล</div></div>
                    </div>
                  </div>
                  <div>
                    <div className="lbl">ส่วนประเมินผลสัมฤทธิ์</div>
                    <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
                      {[
                        ["exceeded", "บรรลุเกินเป้าหมายที่กำหนด"],
                        ["achieved", "บรรลุตามเป้าหมายที่กำหนด"],
                        ["not_achieved", "ไม่บรรลุผล"]
                      ].map(([value, label]) => (
                        <label key={value} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12, cursor: "pointer" }}>
                          <input type="radio" checked={resultChoice === value} onChange={() => setResultChoice(value)} /> <b>{label}</b>
                        </label>
                      ))}
                    </div>
                    {resultChoice === "not_achieved" && (
                      <div className="fg mt12">
                        <label className="lbl">ควรพัฒนาต่อเพื่อ...</label>
                        <textarea className="ta" value={continueReason} onChange={event => setContinueReason(event.target.value)} placeholder="ระบุเหตุผลที่ต้องพัฒนาต่อ" />
                      </div>
                    )}
                  </div>
                </>
              )}

              <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 14, background: "var(--bg)" }}>
                <label className="lbl">{tab === "plan" ? "Comment สำหรับอนุมัติ/ส่งกลับแผน" : "คำรับรอง/ข้อเสนอแนะ"}</label>
                <textarea className="ta" value={decisionComment} onChange={event => setDecisionComment(event.target.value)} placeholder="พิมพ์ Comment หรือเหตุผลประกอบการตัดสินใจ" />
                <div className="flex g8 mt12" style={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
                  {tab === "plan" ? (
                    <>
                      <button className="btn btn-s" onClick={() => submitDecision("reject")}>ส่งกลับแก้ไข</button>
                      <button className="btn btn-t" onClick={() => submitDecision("approve")}>อนุมัติแผน</button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-s" onClick={() => submitDecision("return")}>ส่งกลับแก้ไข</button>
                      <button className="btn btn-t" onClick={() => submitDecision("certify")}>รับรองผลการพัฒนา</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const DepartmentIDPTracking: React.FC<{ users: any[]; currentUser: any }> = ({ users, currentUser }) => {
  const members = useDepartmentMembers(users, currentUser);
  const units = unitOptionsFor(members);
  const [unit, setUnit] = useState(allUnitsLabel);
  const [viewMode, setViewMode] = useState<"list" | "supervisor">("list");
  const [selectedSso, setSelectedSso] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const visibleMembers = filteredByUnit(members, unit);
  const activities = activityRowsFor(visibleMembers);
  const employees = visibleMembers.map((user, index) => {
    const userActivities = activities.filter(activity => activity.user.sso === user.sso);
    const done = userActivities.filter(activity => activity.status === "completed").length;
    const progress = userActivities.length ? Math.round((done / userActivities.length) * 100) : index % 3 === 0 ? 0 : 45;
    return {
      user,
      activities: userActivities,
      behaviors: userActivities.reduce((sum, activity) => sum + (activity.behaviorIds?.length || 0), 0),
      progress,
      delayed: progress < 30 && userActivities.length > 0,
      noUpdate: userActivities.length === 0
    };
  }).filter(row => row.activities.length > 0 || row.noUpdate);
  const selected = employees.find(row => row.user.sso === selectedSso) || null;
  const statusCounts = ["in_progress", "evidence_submitted", "completed"].map(status => ({
    status,
    count: activities.filter(activity => activity.status === status).length
  }));
  const delayedCount = employees.filter(row => row.delayed || row.noUpdate).length;
  const groupedBySupervisor = Array.from(new Set(employees.map(row => row.user.sup || "ไม่ระบุหัวหน้า"))).map(supervisor => ({
    supervisor,
    rows: employees.filter(row => (row.user.sup || "ไม่ระบุหัวหน้า") === supervisor)
  }));
  const donutTotal = Math.max(1, activities.length);
  const doneDegree = Math.round((statusCounts.find(item => item.status === "completed")?.count || 0) / donutTotal * 360);
  const evidenceDegree = doneDegree + Math.round((statusCounts.find(item => item.status === "evidence_submitted")?.count || 0) / donutTotal * 360);

  const renderEmployeeRow = (row: typeof employees[number], index: number) => (
    <button key={row.user.sso} className="mini-row w100" onClick={() => setSelectedSso(row.user.sso)}>
      <div style={{ width: 34, textAlign: "center", fontWeight: 800 }}>{index + 1}</div>
      <div style={{ minWidth: 0, flex: 1, textAlign: "left" }}>
        <div className="fw8">{fullName(row.user)}</div>
        <div className="muted fs12">{row.user.p} · {row.user.d} · {row.behaviors} พฤติกรรมที่กำลังพัฒนา</div>
      </div>
      <div style={{ width: 170 }}>
        <div className="pw"><div className="pb" style={{ width: `${row.progress}%` }} /></div>
        <div className="muted fs12 mt4">{row.progress}%</div>
      </div>
      {row.delayed || row.noUpdate ? <span className="b br">{row.noUpdate ? "ไม่มีการอัปเดต" : "ล่าช้า"}</span> : <span className="b bg">ติดตามปกติ</span>}
    </button>
  );

  return (
    <>
      <div className="flex ic jb mb20">
        <div>
          <div className="sec-t">ติดตาม IDP ฝ่าย</div>
          <div className="sec-s">Department Status Board, Hierarchy Tracking และ Read-only Progress View ไม่มีปุ่มอนุมัติในหน้านี้</div>
        </div>
        <div className="flex g8" style={{ flexWrap: "wrap" }}>
          <select className="sel" style={{ width: 230 }} value={unit} onChange={event => setUnit(event.target.value)}>
            {units.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
          <div className="seg">
            <button className={viewMode === "list" ? "on" : ""} onClick={() => setViewMode("list")}>รายชื่อ</button>
            <button className={viewMode === "supervisor" ? "on" : ""} onClick={() => setViewMode("supervisor")}>แยกตามหัวหน้างาน</button>
          </div>
        </div>
      </div>

      <div className="card mb16">
        <div className="cb" style={{ display: "grid", gridTemplateColumns: "220px minmax(0,1fr)", gap: 18, alignItems: "center" }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div className="donut" style={{ width: 120, height: 120, background: `conic-gradient(var(--green) 0deg ${doneDegree}deg, var(--orange) ${doneDegree}deg ${evidenceDegree}deg, var(--teal) ${evidenceDegree}deg 360deg)` }}>
              <div className="donut-center">{activities.length}</div>
            </div>
          </div>
          <div>
            <div className="fw8" style={{ fontSize: 18 }}>Department Status Board</div>
            <div className="muted fs12 mt4">สัดส่วนสถานะ IDP ของทั้งฝ่าย พร้อมตัวเลขแจ้งเตือนรายการล่าช้าหรือไม่มีการอัปเดต</div>
            <div className="grid mt12" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
              {statusCounts.map(item => <Metric key={item.status} label={idpMeta(item.status).label} value={item.count} sub="รายการ IDP" tone={item.status === "completed" ? "good" : item.status === "evidence_submitted" ? "info" : "warn"} />)}
              <Metric label="Alert" value={delayedCount} sub="ล่าช้าหรือไม่มีการอัปเดต" tone="bad" />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="ch">
          <div>
            <div className="fw8">Hierarchy Tracking Table</div>
            <div className="muted fs12 mt4">แสดงชื่อพนักงาน จำนวนพฤติกรรมที่กำลังพัฒนา และ progress bar</div>
          </div>
        </div>
        <div className="cb" style={{ display: "grid", gap: 10 }}>
          {viewMode === "list" ? (
            employees.map(renderEmployeeRow)
          ) : (
            groupedBySupervisor.map(group => (
              <div key={group.supervisor} style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ padding: "10px 12px", background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                  <div className="fw8">{group.supervisor}</div>
                  <div className="muted fs12">{group.rows.length} คนในทีมย่อย</div>
                </div>
                <div style={{ display: "grid", gap: 8, padding: 10 }}>
                  {group.rows.map(renderEmployeeRow)}
                </div>
              </div>
            ))
          )}
          {employees.length === 0 && <div className="text-center muted fs13" style={{ padding: 28 }}>ไม่มีรายการ IDP ให้ติดตามในตัวกรองนี้</div>}
        </div>
      </div>

      {selected && (
        <div className="mo" style={{ alignItems: "flex-start", paddingTop: 34 }} onClick={() => setSelectedSso(null)}>
          <div className="mo-box" style={{ width: 980, maxWidth: "calc(100vw - 32px)" }} onClick={event => event.stopPropagation()}>
            <div className="mo-h">
              <div>
                <div className="fw8">Read-only Progress View · {fullName(selected.user)}</div>
                <div className="muted fs12 mt4">ตรวจสอบเป้าหมาย กิจกรรม หลักฐานล่าสุด และให้ executive feedback ได้โดยไม่อนุมัติเอกสาร</div>
              </div>
              <button className="btn btn-s btn-sm" onClick={() => setSelectedSso(null)}>ปิด</button>
            </div>
            <div className="mo-b" style={{ display: "grid", gap: 14 }}>
              {selected.activities.map((activity, index) => {
                const meta = idpMeta(activity.status);
                return (
                  <section key={activity.id} style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
                    <div style={{ padding: "12px 14px", background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                      <div className="flex ic jb" style={{ gap: 10, flexWrap: "wrap" }}>
                        <div className="fw8">กิจกรรมที่ {index + 1}: {activity.competencyCode}</div>
                        <span className={`b ${meta.badge}`}>{meta.label}</span>
                      </div>
                    </div>
                    <div style={{ padding: 14, display: "grid", gap: 10 }}>
                      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
                        <div><div className="sl">เป้าหมาย</div><div className="fw8 fs13">{activity.target}</div></div>
                        <div><div className="sl">วิธีการพัฒนา</div><div className="fw8 fs13">{activity.learningType} · {activity.learningWeight}%</div></div>
                        <div><div className="sl">Timeline</div><div className="fw8 fs13">{activity.startDate} ถึง {activity.endDate}</div></div>
                        <div><div className="sl">KPI</div><div className="fw8 fs13">{activity.kpi}</div></div>
                      </div>
                      <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12, background: "var(--green-bg)" }}>
                        <div className="sl">หลักฐานล่าสุดจาก User Save/Submit</div>
                        <div className="fw8 fs13">{activity.evidenceFiles?.length ? activity.evidenceFiles.join(", ") : activity.evidenceUrl || "ยังไม่มีหลักฐานล่าสุด"}</div>
                      </div>
                    </div>
                  </section>
                );
              })}
              <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 14, background: "var(--bg)" }}>
                <label className="lbl">Executive Feedback</label>
                <textarea
                  className="ta"
                  value={feedback[selected.user.sso] || ""}
                  onChange={event => setFeedback(prev => ({ ...prev, [selected.user.sso]: event.target.value }))}
                  placeholder="พิมพ์ข้อเสนอแนะเชิงบริหารเพื่อแจ้งกลับไปยังพนักงาน"
                />
                <div className="flex mt10" style={{ justifyContent: "flex-end" }}>
                  <button className="btn btn-s btn-sm" onClick={() => alert("ส่ง Executive Feedback mock แล้ว")}>ส่ง Feedback</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
