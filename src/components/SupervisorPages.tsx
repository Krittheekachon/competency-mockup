import React, { useMemo, useState } from "react";
import {
  DEFAULT_CHECKED_BEHAVIOR_IDS,
  MOCK_IDP_ACTIVITIES,
  WORKFLOW_COMPETENCIES,
  expectedBehaviorIdsFor,
  gapResultsFor,
  getDirectReports,
  statusClass,
  statusLabel
} from "../workflow";

const fmt = (value: number) => value.toFixed(2).replace(/\.00$/, "");
const tagLabel = (type: string) => (type.indexOf("FC") === 0 ? "FC" : type);
const staffName = (user: any) => `${user?.t || ""}${user?.n || ""}`;
const submittedDateFor = (index: number) => `2026-06-${String(3 + index).padStart(2, "0")}`;

const allExpectedBehaviorIds = WORKFLOW_COMPETENCIES.flatMap(comp => expectedBehaviorIdsFor(comp));

const checkedForUser = (user: any, index: number) => {
  if (user?.sso === "20011") return allExpectedBehaviorIds;
  if (index % 3 === 1) return DEFAULT_CHECKED_BEHAVIOR_IDS.slice(0, 14);
  if (index % 3 === 2) return [...DEFAULT_CHECKED_BEHAVIOR_IDS, "CC-001-2.3", "CC-001-2.4", "FC2-062-2.1"];
  return DEFAULT_CHECKED_BEHAVIOR_IDS;
};

const evaluationStatusLabel: Record<string, string> = {
  draft: "ยังไม่ส่ง",
  self_submitted: "Pending Supervisor",
  pending_supervisor: "Pending Supervisor",
  pending_department_head: "Pending Department Head",
  approved: "อนุมัติแล้ว",
  rejected: "ตีกลับ"
};

const evaluationBadgeClass: Record<string, string> = {
  draft: "bgr",
  self_submitted: "by",
  pending_supervisor: "by",
  pending_department_head: "bb",
  approved: "bg",
  rejected: "br"
};

const EvalBadge = ({ status }: { status?: string }) => (
  <span className={`b ${evaluationBadgeClass[status || "draft"] || "bgr"}`}>
    {evaluationStatusLabel[status || "draft"] || status}
  </span>
);

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

const ReviewChecklist = ({ checkedIds }: { checkedIds: string[] }) => (
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
            <div className="mt12" style={{ border: "1px solid var(--border)", borderRadius: 6, padding: 10, background: "var(--bg)" }}>
              <div className="sl">Comment จากผู้ประเมินตนเอง</div>
              <div className="fw8 fs13">ปฏิบัติงานตามภารกิจที่ได้รับมอบหมาย และแนบเหตุผลประกอบไว้ในแต่ละสมรรถนะ</div>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

const GapCells = ({ checkedIds }: { checkedIds: string[] }) => (
  <>
    {gapResultsFor(checkedIds).map(gap => (
      <td key={gap.competency.code}>
        <span className={`b ${gap.gap < 0 ? "br" : "bg"}`}>{fmt(gap.gap)}</span>
      </td>
    ))}
  </>
);

const useDirectReports = (users: any[], currentUser: any) =>
  useMemo(() => getDirectReports(users, currentUser).filter(user => user.act !== false), [users, currentUser]);

const idpStatusFor = (index: number) => {
  const statuses = ["draft", "submitted", "in_progress", "evidence_submitted", "completed"];
  return statuses[index % statuses.length];
};

const idpActivitiesFor = (user: any, index: number) =>
  MOCK_IDP_ACTIVITIES.slice(0, index % 2 === 0 ? 2 : 1).map((activity, activityIndex) => ({
    ...activity,
    id: `${user.sso}-${activity.id}-${activityIndex}`,
    userSso: user.sso,
    status: idpStatusFor(index + activityIndex) as any,
    evidenceFiles: activityIndex === 1 ? ["รายงานผลการพัฒนา.pdf"] : activity.evidenceFiles
  }));

export const SupervisorAssess: React.FC<{ users: any[]; setUsers: any; currentUser: any }> = ({ users, setUsers, currentUser }) => {
  const reports = useDirectReports(users, currentUser);
  const pendingReports = reports.filter(user => user.evalStatus === "self_submitted" || user.evalStatus === "pending_supervisor");
  const [selectedSso, setSelectedSso] = useState<string | null>(pendingReports[0]?.sso || null);
  const [comment, setComment] = useState("");
  const selectedIndex = reports.findIndex(user => user.sso === selectedSso);
  const selected = reports.find(user => user.sso === selectedSso) || null;
  const checkedIds = selected ? checkedForUser(selected, selectedIndex < 0 ? 0 : selectedIndex) : [];
  const gaps = selected ? gapResultsFor(checkedIds) : [];

  const updateStatus = (status: string) => {
    if (!selected) return;
    setUsers((prev: any[]) => prev.map(user =>
      user.sso === selected.sso ? { ...user, evalStatus: status, supervisorComment: comment } : user
    ));
    setSelectedSso(null);
    setComment("");
    alert(status === "pending_department_head" ? "อนุมัติและส่งต่อหัวหน้าฝ่ายแล้ว" : "ตีกลับให้บุคลากรประเมินใหม่แล้ว");
  };

  return (
    <>
      <div className="flex ic jb mb20">
        <div>
          <div className="sec-t">ตรวจประเมินลูกน้อง</div>
          <div className="sec-s">แสดงเฉพาะผู้ใต้บังคับบัญชาสายตรงที่ส่งแบบประเมินแล้ว ตรวจแบบ read-only ก่อนส่งต่อหัวหน้าฝ่าย</div>
        </div>
        <div className="flex g8" style={{ flexWrap: "wrap" }}>
          <button className="btn btn-s btn-sm" onClick={() => alert("Export PDF mock")}>Export PDF</button>
          <button className="btn btn-s btn-sm" onClick={() => alert("Export Excel mock")}>Export Excel</button>
        </div>
      </div>

      <div className="grid mb16" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12 }}>
        <Metric label="รอตรวจ" value={pendingReports.length} sub="Pending Supervisor" tone="warn" />
        <Metric label="ส่งต่อหัวหน้าฝ่ายแล้ว" value={reports.filter(user => user.evalStatus === "pending_department_head").length} sub="Pending Department Head" tone="info" />
        <Metric label="อนุมัติแล้ว" value={reports.filter(user => user.evalStatus === "approved").length} sub="ปิดรอบประเมินแล้ว" tone="good" />
      </div>

      <div className="card">
        <div className="ch">
          <div>
            <div className="fw8">รายการรอดำเนินการ</div>
            <div className="muted fs12 mt4">เฉพาะ Direct Reports ที่อยู่สถานะ Pending Supervisor</div>
          </div>
          <span className="b by">{pendingReports.length} รายการ</span>
        </div>
        <div className="cb" style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>ชื่อ-นามสกุล</th>
                <th>ตำแหน่ง</th>
                <th>วันที่ส่งประเมิน</th>
                <th>สถานะ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pendingReports.map((user, index) => (
                <tr key={user.sso}>
                  <td><b>{staffName(user)}</b><div className="muted fs12">{user.d}</div></td>
                  <td>{user.p}</td>
                  <td>{submittedDateFor(index)}</td>
                  <td><EvalBadge status={user.evalStatus} /></td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-s btn-sm" onClick={() => { setSelectedSso(user.sso); setComment(user.supervisorComment || ""); }}>ตรวจสอบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pendingReports.length === 0 && (
            <div className="text-center muted fs13" style={{ padding: 28 }}>ไม่มีแบบประเมินที่รอหัวหน้างานตรวจในตอนนี้</div>
          )}
        </div>
      </div>

      {selected && (
        <div className="mo" style={{ alignItems: "flex-start", paddingTop: 34 }} onClick={() => setSelectedSso(null)}>
          <div className="mo-box" style={{ width: 1080, maxWidth: "calc(100vw - 32px)" }} onClick={event => event.stopPropagation()}>
            <div className="mo-h">
              <div>
                <div className="fw8">ตรวจสอบผลประเมิน · {staffName(selected)}</div>
                <div className="muted fs12 mt4">{selected.p} · Expected Level แสดงตามแต่ละสมรรถนะ · Checklist ถูกล็อก read-only</div>
              </div>
              <button className="btn btn-s btn-sm" onClick={() => setSelectedSso(null)}>ปิด</button>
            </div>
            <div className="mo-b" style={{ display: "grid", gap: 14 }}>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
                {gaps.map(gap => (
                  <div key={gap.competency.code} className="sc" style={{ boxShadow: "none" }}>
                    <div className="sl">{gap.competency.code} · Expected {gap.expectedScore}</div>
                    <div className="sv" style={{ fontSize: 24, color: gap.gap < 0 ? "var(--red)" : "var(--green)" }}>{fmt(gap.gap)}</div>
                    <div className="ss muted">Actual {fmt(gap.actualScore)}</div>
                  </div>
                ))}
              </div>
              <ReviewChecklist checkedIds={checkedIds} />
              <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 14, background: "var(--bg)" }}>
                <label className="lbl">Supervisor Comment</label>
                <textarea className="ta" value={comment} onChange={event => setComment(event.target.value)} placeholder="พิมพ์ข้อเสนอแนะ ชื่นชมจุดแข็ง หรือชี้แนะจุดที่ควรปรับปรุง" />
                <div className="flex g8 mt12" style={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
                  <button className="btn btn-s" disabled={!comment.trim()} onClick={() => updateStatus("rejected")}>ปฏิเสธ / ตีกลับ</button>
                  <button className="btn btn-t" onClick={() => updateStatus("pending_department_head")}>อนุมัติส่งต่อหัวหน้าฝ่าย</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const TeamGap: React.FC<{ users: any[]; currentUser: any }> = ({ users, currentUser }) => {
  const reports = useDirectReports(users, currentUser);
  const rows = reports.map((user, index) => ({ user, checkedIds: checkedForUser(user, index), gaps: gapResultsFor(checkedForUser(user, index)) }));
  const completed = rows.filter(row => row.user.evalStatus !== "draft").length;
  const highGap = rows.filter(row => row.gaps.filter(gap => gap.gap < 0).length >= 3);
  const talent = rows.filter(row => row.gaps.every(gap => gap.gap >= 0));
  const competencyStats = WORKFLOW_COMPETENCIES.map(comp => {
    const values = rows.map(row => row.gaps.find(gap => gap.competency.code === comp.code)?.gap || 0);
    const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
    return { comp, average, failed: values.filter(value => value < 0).length, passed: values.filter(value => value >= 0).length };
  }).sort((a, b) => a.average - b.average);
  const weakness = competencyStats[0];
  const strength = [...competencyStats].sort((a, b) => b.average - a.average)[0];

  return (
    <>
      <div className="flex ic jb mb20">
        <div>
          <div className="sec-t">Competency Gap ทีม</div>
          <div className="sec-s">Dashboard, Heatmap และการจัดกลุ่มพนักงานตามศักยภาพของ Direct Reports</div>
        </div>
        <div className="flex g8" style={{ flexWrap: "wrap" }}>
          <button className="btn btn-s btn-sm" onClick={() => alert("Export PDF mock")}>Export PDF</button>
          <button className="btn btn-s btn-sm" onClick={() => alert("Export Excel mock")}>Export Excel</button>
        </div>
      </div>

      <div className="grid mb16" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 12 }}>
        <Metric label="ประเมินเสร็จแล้ว" value={`${completed}/${reports.length}`} sub="เทียบกับลูกน้องทั้งหมด" tone="info" />
        <Metric label="จุดแข็งของทีม" value={strength?.comp.code || "-"} sub={strength ? `${strength.passed} คนผ่านเกณฑ์` : "ยังไม่มีข้อมูล"} tone="good" />
        <Metric label="จุดอ่อนของทีม" value={weakness?.comp.code || "-"} sub={weakness ? `${weakness.failed} คน Gap ติดลบ` : "ยังไม่มีข้อมูล"} tone="bad" />
      </div>

      <div className="card mb16">
        <div className="ch">
          <div>
            <div className="fw8">Team Gap Heatmap</div>
            <div className="muted fs12 mt4">Gap = Actual Score - Expected Score, แดงคือต่ำกว่าความคาดหวัง เขียวคือผ่านเกณฑ์</div>
          </div>
        </div>
        <div className="cb" style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr><th>บุคลากร</th>{WORKFLOW_COMPETENCIES.map(comp => <th key={comp.code}>{comp.code}</th>)}<th>สรุป</th></tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const failed = row.gaps.filter(gap => gap.gap < 0).length;
                return (
                  <tr key={row.user.sso}>
                    <td><b>{staffName(row.user)}</b><div className="muted fs12">{row.user.p}</div></td>
                    <GapCells checkedIds={row.checkedIds} />
                    <td>{failed ? <span className="b br">ต้องพัฒนา {failed} สมรรถนะ</span> : <span className="b bg">Talent Pool</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && <div className="text-center muted fs13" style={{ padding: 28 }}>ไม่พบข้อมูลทีม</div>}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>
        <div className="card">
          <div className="ch"><div><div className="fw8">กลุ่มที่ต้องเร่งพัฒนา</div><div className="muted fs12 mt4">High Gap List สำหรับโค้ชใกล้ชิด</div></div><span className="b br">{highGap.length} คน</span></div>
          <div className="cb" style={{ display: "grid", gap: 8 }}>
            {highGap.map(row => (
              <div key={row.user.sso} className="mini-row">
                <div><div className="fw8">{staffName(row.user)}</div><div className="muted fs12">{row.gaps.filter(gap => gap.gap < 0).length} สมรรถนะต้องทำ IDP</div></div>
                <span className="b br">ติดตามใกล้ชิด</span>
              </div>
            ))}
            {highGap.length === 0 && <div className="muted fs13">ยังไม่พบกลุ่ม Gap สูง</div>}
          </div>
        </div>
        <div className="card">
          <div className="ch"><div><div className="fw8">กลุ่มคนเก่งและศักยภาพสูง</div><div className="muted fs12 mt4">Overachieve / Gap ไม่ติดลบ</div></div><span className="b bg">{talent.length} คน</span></div>
          <div className="cb" style={{ display: "grid", gap: 8 }}>
            {talent.map(row => (
              <div key={row.user.sso} className="mini-row">
                <div><div className="fw8">{staffName(row.user)}</div><div className="muted fs12">เหมาะกับ project assignment หรือถ่ายทอดให้ทีม</div></div>
                <span className="b bg">Talent Pool</span>
              </div>
            ))}
            {talent.length === 0 && <div className="muted fs13">ยังไม่มีข้อมูล talent pool ใน mock ชุดนี้</div>}
          </div>
        </div>
      </div>
    </>
  );
};

export const TeamIDP: React.FC<{ users: any[]; currentUser: any }> = ({ users, currentUser }) => {
  const reports = useDirectReports(users, currentUser);
  const idpRows = reports.map((user, index) => {
    const checkedIds = checkedForUser(user, index);
    const gaps = gapResultsFor(checkedIds).filter(gap => gap.gap < 0);
    const activities = idpActivitiesFor(user, index);
    const status = idpStatusFor(index);
    return {
      user,
      gaps,
      activities,
      status,
      lastUpdate: `2026-06-${String(10 + index).padStart(2, "0")}`
    };
  }).filter(row => row.gaps.length > 0);
  const [selectedSso, setSelectedSso] = useState<string | null>(null);
  const [coachingNotes, setCoachingNotes] = useState<Record<string, string>>({});
  const selected = idpRows.find(row => row.user.sso === selectedSso) || null;
  const steps = ["Draft", "Submitted", "In Progress", "Evidence Submitted", "Completed"];
  const stepIndexFor = (status: string) => Math.max(0, ["draft", "submitted", "in_progress", "evidence_submitted", "completed"].indexOf(status));

  return (
    <>
      <div className="flex ic jb mb20">
        <div>
          <div className="sec-t">ติดตาม IDP ทีม</div>
          <div className="sec-s">ตารางรวม Direct Reports ที่มี Competency Gap พร้อมสถานะปัจจุบันและ mirror view แบบอ่านอย่างเดียว</div>
        </div>
        <span className="b bb">{idpRows.length} คนต้องทำ IDP</span>
      </div>

      <div className="card">
        <div className="ch">
          <div>
            <div className="fw8">Team Overview Table</div>
            <div className="muted fs12 mt4">คลิกดูรายละเอียดเพื่อดูแผน IDP แบบ read-only และฝาก coaching comment</div>
          </div>
        </div>
        <div className="cb" style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>บุคลากร</th>
                <th>ตำแหน่ง</th>
                <th>สมรรถนะที่ต้องทำ IDP</th>
                <th>Current Status</th>
                <th>อัปเดตล่าสุด</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {idpRows.map(row => (
                <tr key={row.user.sso}>
                  <td><b>{staffName(row.user)}</b><div className="muted fs12">{row.user.d}</div></td>
                  <td>{row.user.p}</td>
                  <td><span className="b br">{row.gaps.length} สมรรถนะ</span></td>
                  <td><span className={`b ${statusClass(row.status)}`}>{statusLabel(row.status)}</span></td>
                  <td>{row.lastUpdate}</td>
                  <td style={{ textAlign: "right" }}><button className="btn btn-s btn-sm" onClick={() => setSelectedSso(row.user.sso)}>ดูรายละเอียด</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {idpRows.length === 0 && <div className="text-center muted fs13" style={{ padding: 28 }}>ยังไม่มีลูกน้องที่ต้องทำ IDP ในรอบนี้</div>}
        </div>
      </div>

      {selected && (
        <div className="mo" style={{ alignItems: "flex-start", paddingTop: 34 }} onClick={() => setSelectedSso(null)}>
          <div className="mo-box" style={{ width: 1060, maxWidth: "calc(100vw - 32px)" }} onClick={event => event.stopPropagation()}>
            <div className="mo-h">
              <div>
                <div className="fw8">Read-only IDP Form · {staffName(selected.user)}</div>
                <div className="muted fs12 mt4">Mirror View เป้าหมาย วิธีการพัฒนา KPI ระยะเวลา และหลักฐานล่าสุด</div>
              </div>
              <button className="btn btn-s btn-sm" onClick={() => setSelectedSso(null)}>ปิด</button>
            </div>
            <div className="mo-b" style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${steps.length},1fr)`, gap: 8 }}>
                {steps.map((step, index) => (
                  <div key={step} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "10px 8px", textAlign: "center", background: index <= stepIndexFor(selected.status) ? "var(--blue-lt)" : "#fff" }}>
                    <div className={`b ${index <= stepIndexFor(selected.status) ? "bb" : "bgr"}`} style={{ justifyContent: "center", width: "100%" }}>{step}</div>
                  </div>
                ))}
              </div>

              {selected.gaps.map(gap => {
                const activities = selected.activities.filter(activity => activity.competencyCode === gap.competency.code);
                return (
                  <section key={gap.competency.code} style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
                    <div style={{ padding: "12px 14px", background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                      <div className="flex ic g8" style={{ flexWrap: "wrap" }}>
                        <span className={gap.competency.tagClass}>{tagLabel(gap.competency.type)}</span>
                        <div className="fw8">{gap.competency.code} · {gap.competency.name}</div>
                        <span className="b br">Gap {fmt(gap.gap)}</span>
                      </div>
                    </div>
                    <div style={{ padding: 14, display: "grid", gap: 10 }}>
                      <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12, background: "var(--red-bg)" }}>
                        <div className="sl">เป้าหมายพฤติกรรมที่ต้องพัฒนา</div>
                        <ul className="blist">
                          {gap.missingBehaviors.slice(0, 5).map(item => <li key={item.id}>ระดับ {item.level} ข้อ {item.order % 4 || 4} · {item.text}</li>)}
                        </ul>
                      </div>
                      {activities.map((activity, index) => (
                        <div key={activity.id} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
                          <div className="flex ic jb" style={{ gap: 10, flexWrap: "wrap" }}>
                            <div className="fw8">กิจกรรมที่ {index + 1}: {activity.activityDetail}</div>
                            <span className={`b ${statusClass(activity.status)}`}>{statusLabel(activity.status)}</span>
                          </div>
                          <div className="grid mt10" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
                            <div><div className="sl">Learning Type</div><div className="fw8 fs13">{activity.learningType}</div></div>
                            <div><div className="sl">น้ำหนัก</div><div className="fw8 fs13">{activity.learningWeight}%</div></div>
                            <div><div className="sl">ระยะเวลา</div><div className="fw8 fs13">{activity.startDate} ถึง {activity.endDate}</div></div>
                            <div><div className="sl">KPI</div><div className="fw8 fs13">{activity.kpi}</div></div>
                          </div>
                          <div className="mt10"><div className="sl">Evidence</div><div className="fw8 fs13">{activity.evidenceFiles?.length ? activity.evidenceFiles.join(", ") : "ยังไม่มีหลักฐานแนบ"}</div></div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}

              <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 14, background: "var(--bg)" }}>
                <label className="lbl">Coaching Comment</label>
                <textarea
                  className="ta"
                  value={coachingNotes[selected.user.sso] || ""}
                  onChange={event => setCoachingNotes(prev => ({ ...prev, [selected.user.sso]: event.target.value }))}
                  placeholder="ฝากข้อเสนอแนะหรือคำปรึกษาให้ลูกน้อง โดยไม่เปลี่ยนสถานะเอกสาร"
                />
                <div className="flex mt10" style={{ justifyContent: "flex-end" }}>
                  <button className="btn btn-s btn-sm" onClick={() => alert("บันทึก coaching comment mock แล้ว")}>บันทึก Comment</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
