import React, { useState } from "react";
import {
  DEFAULT_CHECKED_BEHAVIOR_IDS,
  MOCK_IDP_ACTIVITIES,
  WORKFLOW_COMPETENCIES,
  canToggleBehavior,
  gapResultsFor,
  learningSummary,
  nextUnlockedBehaviorId,
  statusClass,
  statusLabel
} from "../workflow";

const readLocal = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
};

const writeLocal = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const getCheckedKey = (sso?: string) => `mock-assessment-checked:${sso || "default"}`;
const getCommentKey = (sso?: string) => `mock-assessment-comments:${sso || "default"}`;

const MOCK_GAP_CHECKED_BEHAVIOR_IDS = [
  ...DEFAULT_CHECKED_BEHAVIOR_IDS,
  "CC-001-2.3",
  "CC-001-2.4",
  "FC2-062-2.1",
  "FC2-062-2.2",
  "FC2-062-2.3",
  "FC2-062-2.4"
];

const fmt = (value: number) => value.toFixed(2).replace(/\.00$/, "");

const tagLabel = (type: string) => (type.indexOf("FC") === 0 ? "FC" : type);

const groupBehaviorsByLevel = (behaviors: any[]) => {
  const levels: number[] = [];
  const grouped: Record<number, any[]> = {};
  behaviors.forEach(behavior => {
    if (!grouped[behavior.level]) grouped[behavior.level] = [];
    grouped[behavior.level].push(behavior);
    if (levels.indexOf(behavior.level) === -1) levels.push(behavior.level);
  });
  levels.sort((a, b) => a - b);
  return levels.map(level => ({ level, behaviors: grouped[level] }));
};

const isAssessmentApproved = (user?: any) => user?.evalStatus === "approved" || user?.evalStatus === "dean_approved";

const assessmentStatusText = (status?: string) => {
  if (status === "self_submitted") return "ส่งแล้ว รอหัวหน้างานตรวจ";
  if (status === "pending_department_head") return "หัวหน้างานตรวจแล้ว รอหัวหน้าฝ่ายอนุมัติ";
  if (status === "approved" || status === "dean_approved") return "อนุมัติแล้ว ดูผล Gap ได้";
  if (status === "rejected") return "ถูกส่งกลับให้แก้ไข";
  return "ร่าง";
};

const AssessmentProgress = ({ checkedIds }: { checkedIds: string[] }) => {
  const touchedCompetencies = WORKFLOW_COMPETENCIES.filter(comp => comp.indicators.some(item => checkedIds.includes(item.id))).length;

  return (
    <div className="card mb20">
      <div className="cb">
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
          <div className="sc">
            <div className="sl">สมรรถนะที่ต้องประเมิน</div>
            <div className="sv">{WORKFLOW_COMPETENCIES.length}</div>
            <div className="ss muted">รายการ</div>
          </div>
          <div className="sc">
            <div className="sl">ประเมินตนเองแล้ว</div>
            <div className="sv">{touchedCompetencies}</div>
            <div className="ss muted">จาก {WORKFLOW_COMPETENCIES.length} สมรรถนะ</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCards = ({ checkedIds }: { checkedIds: string[] }) => {
  const gaps = gapResultsFor(checkedIds);
  const negative = gaps.filter(item => item.gap < 0);
  const avgGap = gaps.reduce((sum, item) => sum + item.gap, 0) / gaps.length;

  return (
    <div className="g4 mb20">
      <div className="sc"><div className="sl">สมรรถนะทั้งหมด</div><div className="sv">{gaps.length}</div><div className="ss muted">ตามตำแหน่ง</div></div>
      <div className="sc"><div className="sl">Gap ติดลบ</div><div className="sv" style={{ color: "var(--red)" }}>{negative.length}</div><div className="ss muted">ต้องเข้า IDP</div></div>
      <div className="sc"><div className="sl">ค่าเฉลี่ย Gap</div><div className="sv">{fmt(avgGap)}</div><div className="ss muted">Actual - Expected</div></div>
      <div className="sc"><div className="sl">พฤติกรรมที่เลือก</div><div className="sv">{checkedIds.length}</div><div className="ss muted">ข้อละ 0.25 คะแนน</div></div>
    </div>
  );
};

export const EmployeeAssess: React.FC<{ user: any; setUsers: any }> = ({ user, setUsers }) => {
  const [checkedIds, setCheckedIds] = useState<string[]>(() => readLocal(getCheckedKey(user?.sso), DEFAULT_CHECKED_BEHAVIOR_IDS));
  const [comments, setComments] = useState<Record<string, string>>(() => readLocal(getCommentKey(user?.sso), {
    "FC2-061": "ยังต้องฝึกใช้ระบบออนไลน์และเครื่องมือ AI ให้คล่องขึ้น",
    "CC-003": "อยากพัฒนาการประสานงานในทีมให้ต่อเนื่องกว่าเดิม"
  }));
  const [selectedCompetencyCode, setSelectedCompetencyCode] = useState<string | null>(null);
  const [submittedThisSession, setSubmittedThisSession] = useState(false);
  const selectedCompetency = selectedCompetencyCode
    ? WORKFLOW_COMPETENCIES.filter(comp => comp.code === selectedCompetencyCode)[0]
    : null;
  const selectedLevels: number[] = [];
  if (selectedCompetency) {
    selectedCompetency.indicators.forEach(indicator => {
      if (selectedLevels.indexOf(indicator.level) === -1) selectedLevels.push(indicator.level);
    });
    selectedLevels.sort((a, b) => a - b);
  }
  const isAssessmentComplete = WORKFLOW_COMPETENCIES.every(comp =>
    comp.indicators.some(indicator => checkedIds.includes(indicator.id))
  );

  const toggleBehavior = (id: string) => {
    let competency = WORKFLOW_COMPETENCIES[0];
    let selectedOrder = 0;
    for (let index = 0; index < WORKFLOW_COMPETENCIES.length; index += 1) {
      const comp = WORKFLOW_COMPETENCIES[index];
      for (let indicatorIndex = 0; indicatorIndex < comp.indicators.length; indicatorIndex += 1) {
        const indicator = comp.indicators[indicatorIndex];
        if (indicator.id === id) {
          competency = comp;
          selectedOrder = indicator.order;
          break;
        }
      }
      if (selectedOrder) break;
    }
    if (!competency || !canToggleBehavior(competency, id, checkedIds)) return;
    setCheckedIds(prev => {
      if (!prev.includes(id)) return [...prev, id];
      const cascadingIds = competency.indicators
        .filter(indicator => indicator.order >= selectedOrder)
        .map(indicator => indicator.id);
      return prev.filter(item => cascadingIds.indexOf(item) === -1);
    });
  };

  const saveDraft = (showAlert = true) => {
    writeLocal(getCheckedKey(user?.sso), checkedIds);
    writeLocal(getCommentKey(user?.sso), comments);
    if (showAlert) alert("บันทึกร่างการประเมินตนเองแล้ว");
  };

  const submit = () => {
    if (!isAssessmentComplete) return;
    saveDraft(false);
    setSubmittedThisSession(true);
    alert("ส่งแบบประเมินตนเองให้หัวหน้างานแล้ว");
  };

  return (
    <>
      <div className="flex ic jb mb20">
        <div>
          <div className="sec-t">ประเมินตนเอง</div>
          <div className="sec-s">เลือกพฤติกรรมที่ทำได้จริงตามลำดับสะสม หน้านี้ยังไม่เปิดเผยคะแนน Gap หรือผลวิเคราะห์</div>
        </div>
        <span className={`b ${submittedThisSession ? "by" : "bgr"}`}>{submittedThisSession ? "ส่งแล้ว รอหัวหน้างานตรวจ" : "รอส่ง"}</span>
      </div>

      <AssessmentProgress checkedIds={checkedIds} />

      <div className="card">
        <div className="ch">
          <div>
            <div className="fw8">หัวข้อสมรรถนะที่ต้องประเมิน</div>
            <div className="muted fs12 mt4">กดเข้าไปประเมินทีละสมรรถนะ</div>
          </div>
        </div>
        <div className="cb" style={{ display: "grid", gap: 8 }}>
          {WORKFLOW_COMPETENCIES.map(comp => {
            const checkedCount = comp.indicators.filter(item => checkedIds.includes(item.id)).length;
            const isStarted = checkedCount > 0;

            return (
              <button
                key={comp.code}
                type="button"
                className="w100"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  textAlign: "left",
                  cursor: "pointer",
                  padding: "14px 16px",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  background: "#fff"
                }}
                onClick={() => setSelectedCompetencyCode(comp.code)}
              >
                <div className="flex ic g8" style={{ minWidth: 0 }}>
                  <span className={comp.tagClass}>{tagLabel(comp.type)}</span>
                  <div className="flex ic g8">
                    <div className="fw8" style={{ whiteSpace: "normal" }}>{comp.code} · {comp.name}</div>
                  </div>
                </div>
                <span className={`b ${isStarted ? "bg" : "bgr"}`} style={{ flexShrink: 0 }}>{isStarted ? "ประเมินแล้ว" : "ยังไม่ประเมิน"}</span>
              </button>
            );
          })}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            padding: "14px 18px",
            borderTop: "1px solid var(--border)",
            background: "var(--bg)",
            flexWrap: "wrap"
          }}
        >
          {submittedThisSession ? (
            <span className="b by" style={{ padding: "10px 16px", fontSize: 13 }}>ส่งแล้ว รอหัวหน้างานตรวจ</span>
          ) : (
            <>
              {!isAssessmentComplete && <div className="muted fs12" style={{ marginRight: "auto" }}>โปรดประเมินให้เสร็จทุกข้อก่อน</div>}
              <button className="btn btn-t" onClick={submit} disabled={!isAssessmentComplete} style={{ opacity: isAssessmentComplete ? 1 : 0.45, cursor: isAssessmentComplete ? "pointer" : "not-allowed" }}>ส่งให้หัวหน้างาน</button>
            </>
          )}
        </div>
      </div>

      {selectedCompetency && (
        <div className="mo" style={{ alignItems: "flex-start", paddingTop: 42 }} onClick={() => setSelectedCompetencyCode(null)}>
          <div
            className="mo-box"
            style={{
              width: "min(820px, 96vw)",
              maxWidth: 820,
              height: "calc(100vh - 84px)",
              maxHeight: "calc(100vh - 84px)",
              borderRadius: 10,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column"
            }}
            onClick={event => event.stopPropagation()}
          >
            <div
              className="mo-h"
              style={{
                alignItems: "flex-start",
                gap: 18,
                padding: "22px 26px",
                background: "linear-gradient(180deg,#ffffff 0%,#f8fafc 100%)"
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div className="flex ic g8 mb6">
                  <span className={selectedCompetency.tagClass} style={{ fontSize: 11, padding: "4px 8px" }}>{tagLabel(selectedCompetency.type)}</span>
                  <span className="muted fs12 fw7">{selectedCompetency.code}</span>
                </div>
                <div className="fw8" style={{ fontSize: 22, lineHeight: 1.25 }}>{selectedCompetency.name}</div>
                <div className="muted fs12 mt6">เลือกพฤติกรรมที่ทำได้จริงตามลำดับสะสม ระบบยังไม่แสดงคะแนนหรือ Gap ในขั้นนี้</div>
              </div>
              <button className="btn btn-s btn-sm" style={{ padding: "8px 12px" }} onClick={() => setSelectedCompetencyCode(null)}>ปิด</button>
            </div>
            <div className="mo-b" style={{ padding: 0, background: "var(--bg)", overflowY: "auto", flex: 1 }}>
              <div style={{ padding: "18px 26px 22px", display: "grid", gap: 12 }}>
                {selectedLevels.map(level => {
                  const levelItems = selectedCompetency.indicators.filter(indicator => indicator.level === level);
                  const selectedInLevel = levelItems.filter(indicator => checkedIds.includes(indicator.id)).length;
                  return (
                    <section
                      key={level}
                      style={{
                        background: "#fff",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        overflow: "hidden"
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                          padding: "12px 16px",
                          borderBottom: "1px solid var(--border)",
                          background: selectedInLevel > 0 ? "var(--teal-lt)" : "#fff"
                        }}
                      >
                        <div>
                          <div className="fw8">ระดับ {level}</div>
                          <div className="muted fs12 mt2">เลือกแล้ว {selectedInLevel}/{levelItems.length} พฤติกรรม</div>
                        </div>
                        <span className={`b ${selectedInLevel === levelItems.length ? "bg" : selectedInLevel > 0 ? "bt" : "bgr"}`}>
                          {selectedInLevel === levelItems.length ? "ครบระดับ" : selectedInLevel > 0 ? "กำลังประเมิน" : "ยังไม่เริ่ม"}
                        </span>
                      </div>
                      <div style={{ display: "grid" }}>
                        {levelItems.map(indicator => {
                          const checked = checkedIds.includes(indicator.id);
                          const unlockedId = nextUnlockedBehaviorId(selectedCompetency, checkedIds);
                          const canToggle = canToggleBehavior(selectedCompetency, indicator.id, checkedIds);
                          const isNext = unlockedId === indicator.id && !checked;
                          return (
                            <label
                              key={indicator.id}
                              style={{
                                display: "grid",
                                gridTemplateColumns: "22px 1fr auto",
                                alignItems: "start",
                                gap: 10,
                                padding: "13px 16px",
                                borderTop: "1px solid var(--border)",
                                opacity: canToggle || checked ? 1 : 0.42,
                                cursor: canToggle || checked ? "pointer" : "not-allowed"
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={!canToggle && !checked}
                                onChange={() => toggleBehavior(indicator.id)}
                                style={{ marginTop: 3, width: 16, height: 16, accentColor: "var(--teal)" }}
                              />
                              <div>
                                <div className="fw7 fs12">ข้อ {indicator.level}.{indicator.order % 4 || 4}</div>
                                <div className="fs13 mt4" style={{ color: checked ? "var(--text)" : "var(--text2)", lineHeight: 1.55 }}>{indicator.text}</div>
                              </div>
                              {isNext && <span className="b bb" style={{ fontSize: 10 }}>ลำดับถัดไป</span>}
                            </label>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
                <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
                  <label className="lbl">ความคิดเห็นต่อสมรรถนะนี้</label>
                  <textarea
                    className="ta"
                    style={{ minHeight: 92 }}
                    value={comments[selectedCompetency.code] || ""}
                    onChange={event => setComments({ ...comments, [selectedCompetency.code]: event.target.value })}
                    placeholder="บันทึกเหตุผลหรือบริบทประกอบการประเมินตนเอง"
                  />
                </div>
              </div>
            </div>
            <div
              style={{
                position: "sticky",
                bottom: 0,
                padding: "14px 26px",
                borderTop: "1px solid var(--border)",
                background: "#fff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12
              }}
            >
              <div className="muted fs12">ข้อมูลจะอยู่ในแบบร่างจนกดบันทึกหรือส่งให้หัวหน้างาน</div>
              <button className="btn btn-t" onClick={() => setSelectedCompetencyCode(null)}>บันทึกและปิด</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const PendingApprovalState = ({ title, description }: { title: string; description: string }) => (
  <div className="card">
    <div className="cb text-center" style={{ padding: "52px 24px" }}>
      <div style={{ width: 72, height: 72, borderRadius: 20, background: "var(--blue-lt)", color: "var(--blue)", display: "grid", placeItems: "center", margin: "0 auto 18px", fontSize: 30 }}>⏳</div>
      <div className="fw8 fs18 mb8">{title}</div>
      <div className="muted fs13" style={{ maxWidth: 560, margin: "0 auto" }}>{description}</div>
      <div className="mini-row mt20" style={{ maxWidth: 560, marginLeft: "auto", marginRight: "auto", textAlign: "left" }}>
        <div>
          <div className="fw8">สถานะปัจจุบัน</div>
          <div className="muted fs12">ส่งแบบประเมินแล้ว ให้รอผู้บังคับบัญชาตรวจและอนุมัติก่อน ระบบจึงจะแสดงผล Gap</div>
        </div>
        <span className="b by">รออนุมัติ</span>
      </div>
    </div>
  </div>
);

export const EmployeeGap: React.FC<{ setPage: (page: string) => void; user?: any }> = ({ setPage, user }) => {
  const checkedIds = isAssessmentApproved(user)
    ? readLocal(getCheckedKey(user?.sso || "20002"), MOCK_GAP_CHECKED_BEHAVIOR_IDS)
    : MOCK_GAP_CHECKED_BEHAVIOR_IDS;
  const gaps = gapResultsFor(checkedIds);
  const negative = gaps.filter(item => item.gap < 0);
  const passed = gaps.filter(item => item.gap >= 0);
  const sortedNegative = [...negative].sort((a, b) => a.gap - b.gap);

  return (
    <>
      <div className="flex ic jb mb20">
        <div>
          <div className="sec-t">ผลการประเมิน</div>
          <div className="sec-s">ตัวอย่างรูปแบบผลหลังผู้บังคับบัญชาอนุมัติ: Actual Score - Expected Score</div>
        </div>
        <button className="btn btn-p btn-sm" onClick={() => setPage("emp-idp")}>ไปจัดทำ IDP</button>
      </div>

      {!isAssessmentApproved(user) && (
        <div className="card mb16" style={{ borderColor: "var(--blue-md)", background: "var(--blue-lt)" }}>
          <div className="cb flex ic jb" style={{ gap: 12, flexWrap: "wrap" }}>
            <div>
              <div className="fw8 bc">Mock preview</div>
              <div className="muted fs12 mt4">หน้านี้เปิดให้ดูรูปแบบข้อมูลก่อน ในระบบจริง user จะเห็นหลังผลประเมินได้รับอนุมัติแล้ว</div>
            </div>
            <span className="b bb">ตัวอย่างข้อมูล</span>
          </div>
        </div>
      )}

      <div className="grid mb20" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
        <div className="sc"><div className="sl">สมรรถนะทั้งหมด</div><div className="sv">{gaps.length}</div><div className="ss muted">รายการที่ประเมิน</div></div>
        <div className="sc"><div className="sl">ผ่านเกณฑ์</div><div className="sv" style={{ color: "var(--green)" }}>{passed.length}</div><div className="ss muted">Gap ≥ 0</div></div>
        <div className="sc"><div className="sl">ไม่ผ่านเกณฑ์</div><div className="sv" style={{ color: "var(--red)" }}>{negative.length}</div><div className="ss muted">Gap ติดลบ</div></div>
      </div>

      <div className="card mb16" style={{ borderColor: "var(--green-md)", overflow: "hidden" }}>
        <div className="ch" style={{ background: "var(--green-bg)", borderBottomColor: "var(--green-md)" }}>
          <div>
            <div className="fw8">สมรรถนะที่ผ่านเกณฑ์</div>
            <div className="muted fs12 mt4">รายการที่คะแนนจริงเท่ากับหรือสูงกว่าคะแนนคาดหวัง</div>
          </div>
          <span className="b bg">{passed.length} รายการ</span>
        </div>
        <div className="cb" style={{ display: "grid", gap: 10, background: "#fff" }}>
          {passed.map(item => (
            <div
              key={item.competency.code}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
                padding: "14px 16px",
                border: "1px solid var(--green-md)",
                borderRadius: 8,
                background: "#fff",
                flexWrap: "wrap"
              }}
            >
              <div style={{ flex: "1 1 260px", minWidth: 0 }}>
                <div className="flex ic g8" style={{ minWidth: 0 }}>
                  <span className={item.competency.tagClass}>{tagLabel(item.competency.type)}</span>
                  <b style={{ minWidth: 0, whiteSpace: "normal" }}>{item.competency.code} · {item.competency.name}</b>
                </div>
                <div className="muted fs12 mt4">คะแนนคาดหวัง {fmt(item.expectedScore)} · คะแนนที่ได้ {fmt(item.actualScore)}</div>
              </div>
              <span className="b bg" style={{ flexShrink: 0 }}>Gap +{fmt(item.gap)}</span>
            </div>
          ))}
          {passed.length === 0 && <div className="muted fs13">ยังไม่มีสมรรถนะที่ผ่านเกณฑ์ในข้อมูลตัวอย่างนี้</div>}
        </div>
      </div>

      <div className="card mb16" style={{ borderColor: "#fecaca", overflow: "hidden" }}>
        <div className="ch" style={{ background: "var(--red-bg)", borderBottomColor: "#fecaca" }}>
          <div>
            <div className="fw8">สมรรถนะที่ไม่ผ่านเกณฑ์</div>
            <div className="muted fs12 mt4">เรียงจาก Gap ติดลบมากไปน้อย เพื่อส่งต่อไปสร้าง IDP</div>
          </div>
          <span className="b br">{negative.length} รายการ</span>
        </div>
        <div className="cb" style={{ display: "grid", gap: 10, background: "#fff" }}>
          {sortedNegative.map(item => (
            <div key={item.competency.code} style={{ border: "1px solid #fecaca", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
              <div className="flex ic jb" style={{ padding: "14px 16px", gap: 12, borderBottom: "1px solid #fee2e2", flexWrap: "wrap", background: "#fffafa" }}>
                <div className="flex ic g8">
                  <span className={item.competency.tagClass}>{tagLabel(item.competency.type)}</span>
                  <div>
                    <div className="fw8">{item.competency.code} · {item.competency.name}</div>
                    <div className="muted fs12 mt4">Expected {fmt(item.expectedScore)} · Actual {fmt(item.actualScore)}</div>
                  </div>
                </div>
                <span className="b br">Gap {fmt(item.gap)}</span>
              </div>
              <div style={{ padding: "12px 16px" }}>
                <div className="lbl">พฤติกรรมที่ยังขาดทั้งหมด ({item.missingBehaviors.length} ข้อ)</div>
                <div style={{ display: "grid", gap: 10 }}>
                  {groupBehaviorsByLevel(item.missingBehaviors).map(group => (
                    <div key={group.level} style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
                          padding: "8px 12px",
                          background: "var(--bg)",
                          borderBottom: "1px solid var(--border)"
                        }}
                      >
                        <div className="fw8 fs12">ระดับ {group.level}</div>
                        <span className="b bgr" style={{ fontSize: 10 }}>{group.behaviors.length} ข้อ</span>
                      </div>
                      <div style={{ display: "grid" }}>
                        {group.behaviors.map(behavior => (
                          <div
                            key={behavior.id}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "72px 1fr",
                              gap: 10,
                              padding: "10px 12px",
                              borderTop: "1px solid var(--border)",
                              alignItems: "start"
                            }}
                          >
                            <span className="b bt" style={{ justifyContent: "center", fontSize: 10 }}>ข้อ {behavior.level}.{behavior.order % 4 || 4}</span>
                            <div className="fs13" style={{ color: "var(--text2)", lineHeight: 1.55 }}>{behavior.text}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="ch">
          <div>
            <div className="fw8">ตารางผลการประเมินทั้งหมด</div>
            <div className="muted fs12 mt4">ใช้ดูรายละเอียดคะแนนคาดหวัง คะแนนจริง และสถานะการพัฒนา</div>
          </div>
        </div>
        <div className="cb">
          <table className="tbl">
            <thead>
              <tr>
                <th>สมรรถนะ</th>
                <th>Expected</th>
                <th>Actual</th>
                <th>Gap</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {gaps.map(item => (
                <tr key={item.competency.code}>
                  <td>
                    <div className="flex ic g8"><span className={item.competency.tagClass}>{tagLabel(item.competency.type)}</span><b>{item.competency.code}</b></div>
                    <div className="muted fs12 mt4">{item.competency.name}</div>
                  </td>
                  <td>{fmt(item.expectedScore)}</td>
                  <td>{fmt(item.actualScore)}</td>
                  <td><span className={`b ${item.gap < 0 ? "br" : "bg"}`}>{fmt(item.gap)}</span></td>
                  <td>{item.gap < 0 ? <span className="b br">เข้า IDP</span> : <span className="b bg">ผ่านเกณฑ์</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export const EmployeeIDP: React.FC<{ learningMethods: any[]; user?: any }> = ({ learningMethods, user }) => {
  const checkedIds = isAssessmentApproved(user)
    ? readLocal(getCheckedKey(user?.sso || "20002"), MOCK_GAP_CHECKED_BEHAVIOR_IDS)
    : MOCK_GAP_CHECKED_BEHAVIOR_IDS;
  const negativeGaps = gapResultsFor(checkedIds).filter(item => item.gap < 0);
  const behaviorTargetCount = negativeGaps.reduce((sum, gap) => sum + gap.missingBehaviors.length, 0);
  const defaultLearningType = learningMethods[0]?.label || "Experiential Learning";
  const learningCatalog = [
    { id: "catalog-ojt", name: "OJT / มอบหมายโครงการพิเศษ", typeKey: "experiential", detail: "มอบหมายงานหรือโครงการจริงให้ฝึกปฏิบัติ พร้อมติดตามผลจากหัวหน้างาน", kpi: "ส่งมอบผลงานจริงและได้รับ feedback จากหัวหน้างาน" },
    { id: "catalog-rotation", name: "Job Rotation", typeKey: "experiential", detail: "หมุนเวียนงานเพื่อเพิ่มประสบการณ์ข้ามภารกิจและเข้าใจกระบวนการทำงานของหน่วยงาน", kpi: "สรุปบทเรียนจากงานที่หมุนเวียนและนำไปปรับใช้กับงานประจำ" },
    { id: "catalog-coaching", name: "Coaching by Supervisor", typeKey: "social", detail: "หัวหน้างานให้คำแนะนำเฉพาะจุดจากงานจริง พร้อมสะท้อนผลเพื่อพัฒนาพฤติกรรมการทำงาน", kpi: "มีบันทึก coaching และตัวอย่างการปรับพฤติกรรมจากงานจริง" },
    { id: "catalog-mentoring", name: "Mentoring Program", typeKey: "social", detail: "จับคู่ผู้มีประสบการณ์กับผู้เรียนรู้ เพื่อแลกเปลี่ยนแนวทางการทำงานและให้คำแนะนำต่อเนื่อง", kpi: "มี reflection log และแนวทางปฏิบัติที่นำไปใช้ได้จริง" },
    { id: "catalog-ai-data", name: "อบรม AI & Data Analytics", typeKey: "formal", detail: "หลักสูตรพัฒนาทักษะการใช้ AI และการวิเคราะห์ข้อมูลเพื่อสนับสนุนการทำงาน", kpi: "ผ่านการอบรมและมีชิ้นงานหรือรายงานผลการนำไปใช้" },
    { id: "catalog-communication", name: "Workshop การสื่อสาร", typeKey: "formal", detail: "เวิร์กชอปฝึกทักษะการสื่อสาร การนำเสนอ และการประสานงานอย่างมีประสิทธิภาพ", kpi: "ผ่าน workshop และนำเทคนิคไปใช้กับสถานการณ์ทำงานจริง" }
  ];
  const catalogLearningLabel = (typeKey: string) => {
    const found = learningMethods.filter(method => method.key === typeKey)[0];
    if (found) return found.label;
    if (typeKey === "social") return "Social Learning";
    if (typeKey === "formal") return "Formal Learning";
    return defaultLearningType;
  };
  const defaultForms = negativeGaps.reduce<Record<string, any>>((acc, gap) => {
    acc[gap.competency.code] = {
      behaviorResult: "",
      activities: []
    };
    return acc;
  }, {});
  const [forms, setForms] = useState<Record<string, any>>(() => {
    const stored = readLocal<Record<string, any>>(`mock-idp-forms-v2:${user?.sso || "20002"}`, {});
    return negativeGaps.reduce<Record<string, any>>((acc, gap) => {
      const existing = stored[gap.competency.code];
      acc[gap.competency.code] = existing?.activities ? existing : defaultForms[gap.competency.code];
      return acc;
    }, {});
  });
  const [selectedCompetencyCode, setSelectedCompetencyCode] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<"detail" | "edit">("detail");
  const [showDonutBreakdown, setShowDonutBreakdown] = useState(false);
  const selectedGap = selectedCompetencyCode ? negativeGaps.filter(gap => gap.competency.code === selectedCompetencyCode)[0] : null;

  const getActivities = (competencyCode: string) => forms[competencyCode]?.activities || [];
  const allActivities: any[] = [];
  negativeGaps.forEach(gap => {
    getActivities(gap.competency.code).forEach((activity: any) => allActivities.push(activity));
  });
  const summary = learningSummary(allActivities);
  const summaryTotal = summary.reduce((sum, item) => sum + item.value, 0);
  let firstStop = 0;
  let secondStop = 0;
  let summaryTitle = "ยังไม่มีน้ำหนักกิจกรรม";
  if (summaryTotal > 0) {
    firstStop = Number((((summary[0]?.value || 0) / summaryTotal) * 100).toFixed(2));
    secondStop = Number((firstStop + (((summary[1]?.value || 0) / summaryTotal) * 100)).toFixed(2));
    summaryTitle = summary.map(item => `${item.label} ${item.value}%`).join(" · ");
  }
  const chartFor = (activities: any[]) => {
    const rows = learningSummary(activities);
    const total = rows.reduce((sum, item) => sum + item.value, 0);
    let first = 0;
    let second = 0;
    if (total > 0) {
      first = Number((((rows[0]?.value || 0) / total) * 100).toFixed(2));
      second = Number((first + (((rows[1]?.value || 0) / total) * 100)).toFixed(2));
    }
    return {
      rows,
      first,
      second,
      title: total > 0 ? rows.map(item => `${item.label} ${item.value}%`).join(" · ") : "ยังไม่มีกิจกรรม"
    };
  };

  const activityWeightTotal = (competencyCode: string) =>
    getActivities(competencyCode).reduce((sum: number, activity: any) => sum + Number(activity.learningWeight || 0), 0);

  const isActivityComplete = (activity: any) =>
    activity.method &&
    activity.learningType &&
    Number(activity.learningWeight) > 0 &&
    activity.activityDetail &&
    activity.kpi &&
    activity.startDate &&
    activity.endDate;

  const isCompetencyPlanComplete = (competencyCode: string) => {
    const form = forms[competencyCode] || {};
    const activities = getActivities(competencyCode);
    return form.behaviorResult &&
      activities.length > 0 &&
      activities.every((activity: any) => isActivityComplete(activity)) &&
      activityWeightTotal(competencyCode) === 100;
  };

  const planStatus = (competencyCode: string) => {
    const form = forms[competencyCode] || {};
    const activities = getActivities(competencyCode);
    if (isCompetencyPlanComplete(competencyCode)) return { label: "พร้อมส่ง", className: "bg" };
    if (!form.behaviorResult && activities.length === 0) return { label: "ยังไม่เริ่ม", className: "bgr" };
    return { label: "กำลังจัดทำ", className: "by" };
  };

  const updateForm = (competencyCode: string, field: string, value: string) => {
    setForms(prev => ({ ...prev, [competencyCode]: { ...prev[competencyCode], [field]: value } }));
  };

  const updateActivity = (competencyCode: string, activityId: string, field: string, value: string | number) => {
    setForms(prev => ({
      ...prev,
      [competencyCode]: {
        ...prev[competencyCode],
        activities: getActivities(competencyCode).map((activity: any) =>
          activity.id === activityId ? { ...activity, [field]: value } : activity
        )
      }
    }));
  };

  const blankActivity = (competencyCode: string) => ({
    id: `${competencyCode}-act-${Date.now()}`,
    inputMode: "manual",
    catalogId: "",
    method: "",
    learningType: defaultLearningType,
    learningWeight: 0,
    activityDetail: "",
    kpi: "",
    startDate: "",
    endDate: ""
  });

  const addActivity = (competencyCode: string) => {
    setForms(prev => ({
      ...prev,
      [competencyCode]: {
        ...prev[competencyCode],
        activities: [...getActivities(competencyCode), blankActivity(competencyCode)]
      }
    }));
    setSelectedMode("edit");
    setSelectedCompetencyCode(competencyCode);
  };

  const openEditActivities = (competencyCode: string) => {
    setSelectedMode("edit");
    setSelectedCompetencyCode(competencyCode);
  };

  const removeActivity = (competencyCode: string, activityId: string) => {
    const activities = getActivities(competencyCode);
    setForms(prev => ({
      ...prev,
      [competencyCode]: {
        ...prev[competencyCode],
        activities: activities.filter((activity: any) => activity.id !== activityId)
      }
    }));
  };

  const applyCatalog = (competencyCode: string, activityId: string, catalogId: string) => {
    const item = learningCatalog.filter(entry => entry.id === catalogId)[0];
    setForms(prev => ({
      ...prev,
      [competencyCode]: {
        ...prev[competencyCode],
        activities: getActivities(competencyCode).map((activity: any) => {
          if (activity.id !== activityId) return activity;
          if (!item) return { ...activity, catalogId };
          return {
            ...activity,
            catalogId,
            method: item.name,
            learningType: catalogLearningLabel(item.typeKey),
            activityDetail: item.detail,
            kpi: item.kpi
          };
        })
      }
    }));
  };

  const submitPlan = (gap: any) => {
    if (!isCompetencyPlanComplete(gap.competency.code)) {
      alert("กรอกข้อมูลของสมรรถนะนี้ให้ครบ และให้น้ำหนักรวมครบ 100% ก่อนส่งอนุมัติ");
      return;
    }
    writeLocal(`mock-idp-forms-v2:${user?.sso || "20002"}`, forms);
    alert(`ส่งแผน IDP ของ ${gap.competency.code} · ${gap.competency.name} ให้หัวหน้าอนุมัติแล้ว`);
  };

  const renderMissingBehaviors = (gap: any) => (
    <div style={{ display: "grid", gap: 10 }}>
      {groupBehaviorsByLevel(gap.missingBehaviors).map(group => (
        <div key={group.level} style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
          <div style={{ padding: "10px 12px", background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
            <span className="fw8 fs13">ระดับ {group.level}</span>
            <span className="muted fs12" style={{ marginLeft: 8 }}>{group.behaviors.length} ข้อที่ยังเป็น Gap</span>
          </div>
          <div style={{ display: "grid" }}>
            {group.behaviors.map((behavior: any) => (
              <div
                key={behavior.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "82px 1fr",
                  gap: 10,
                  padding: "10px 12px",
                  borderTop: "1px solid var(--border)",
                  alignItems: "start"
                }}
              >
                <span className="b bt" style={{ justifyContent: "center", fontSize: 10 }}>ข้อ {behavior.level}.{behavior.order % 4 || 4}</span>
                <div className="fs13" style={{ color: "var(--text2)", lineHeight: 1.55 }}>{behavior.text}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  if (!negativeGaps.length) {
    return (
      <div className="card">
        <div className="cb">
          <div className="sec-t mb6">แผนพัฒนา IDP</div>
          <div className="sec-s">ไม่มีสมรรถนะที่ Gap ติดลบในข้อมูลตัวอย่างนี้ จึงยังไม่ต้องจัดทำแผนพัฒนา</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex ic jb mb20">
        <div>
          <div className="sec-t">แผนพัฒนา IDP</div>
          <div className="sec-s">ระบบดึงสมรรถนะที่ไม่ผ่านเกณฑ์มาให้ จากนั้นเพิ่มกิจกรรมพัฒนาให้น้ำหนักรวมครบ 100%</div>
        </div>
      </div>

      {!isAssessmentApproved(user) && (
        <div className="card mb16" style={{ borderColor: "var(--blue-md)", background: "var(--blue-lt)" }}>
          <div className="cb flex ic jb" style={{ gap: 12, flexWrap: "wrap" }}>
            <div>
              <div className="fw8 bc">Mock preview</div>
              <div className="muted fs12 mt4">หน้านี้เปิดให้ดูรูปแบบข้อมูลก่อน ในระบบจริง IDP จะสร้างหลังผลประเมินได้รับอนุมัติแล้ว</div>
            </div>
            <span className="b bb">ตัวอย่างข้อมูล</span>
          </div>
        </div>
      )}

      <div className="card mb16">
        <div className="ch"><div className="fw8">ข้อมูลส่วนบุคคล</div><span className="b bgr">Auto-filled</span></div>
        <div className="cb grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
          <div><div className="sl">ชื่อ-นามสกุล</div><div className="fw8">{user ? `${user.t || ""}${user.n}` : "นายสมชาย มีสุข"}</div></div>
          <div><div className="sl">รหัสพนักงาน</div><div className="fw8">{user?.sso || "20002"}</div></div>
          <div><div className="sl">ตำแหน่ง</div><div className="fw8">{user?.p || "นักวิชาการศึกษา"}</div></div>
          <div><div className="sl">สังกัด</div><div className="fw8">{user?.d || "สนับสนุนการศึกษาและวิชาการ"}</div></div>
        </div>
      </div>

      <div className="grid mb20" style={{ gridTemplateColumns: "minmax(220px, 1fr)", gap: 10 }}>
        <div className="sc"><div className="sl">สมรรถนะที่ต้องทำ IDP</div><div className="sv">{negativeGaps.length}</div><div className="ss muted">1 สมรรถนะ = 1 แผน</div></div>
      </div>

      <div className="card mb16">
        <div className="ch">
          <div>
            <div className="fw8">หัวข้อสมรรถนะที่ต้องทำ IDP</div>
            <div className="muted fs12 mt4">กดเข้าไปดูรายละเอียดหรือเพิ่มกิจกรรมในสมรรถนะนั้น</div>
          </div>
        </div>
        <div className="cb" style={{ display: "grid", gap: 8 }}>
          {negativeGaps.map(gap => {
            const activities = getActivities(gap.competency.code);
            const weightTotal = activityWeightTotal(gap.competency.code);
            const status = planStatus(gap.competency.code);

            return (
              <div
                key={gap.competency.code}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0,1fr) auto",
                  gap: 12,
                  alignItems: "center",
                  padding: "14px 16px",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  background: "#fff"
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div className="flex ic g8" style={{ flexWrap: "wrap" }}>
                    <span className={gap.competency.tagClass}>{tagLabel(gap.competency.type)}</span>
                    <div className="fw8">{gap.competency.code} · {gap.competency.name}</div>
                    <span className={`b ${status.className}`}>สถานะแผน: {status.label}</span>
                  </div>
                  <div className="muted fs12 mt6">Gap {fmt(gap.gap)} · พฤติกรรมที่ยังขาด {gap.missingBehaviors.length} ข้อ · กิจกรรม {activities.length} รายการ · น้ำหนักรวม {weightTotal}%</div>
                </div>
                <div className="flex g8" style={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <button className="btn btn-s btn-sm" onClick={() => { setSelectedMode("detail"); setSelectedCompetencyCode(gap.competency.code); }}>ดูรายละเอียด</button>
                  <button className="btn btn-t btn-sm" onClick={() => openEditActivities(gap.competency.code)}>จัดการแผน IDP</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedGap && (
        <div className="mo" style={{ alignItems: "flex-start", paddingTop: 32 }} onClick={() => { setShowDonutBreakdown(false); setSelectedCompetencyCode(null); }}>
          <div
            className="mo-box"
            style={{
              width: "min(980px, 96vw)",
              height: "calc(100vh - 64px)",
              maxHeight: "calc(100vh - 64px)",
              borderRadius: 10,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column"
            }}
            onClick={event => event.stopPropagation()}
          >
            <div className="mo-h" style={{ alignItems: "flex-start", gap: 14, flexShrink: 0 }}>
              <div style={{ minWidth: 0 }}>
                <div className="flex ic g8" style={{ flexWrap: "wrap" }}>
                  <span className={selectedGap.competency.tagClass}>{tagLabel(selectedGap.competency.type)}</span>
                  <div className="fw8" style={{ fontSize: 18 }}>{selectedGap.competency.code} · {selectedGap.competency.name}</div>
                </div>
                <div className="muted fs12 mt4">คะแนนคาดหวัง {fmt(selectedGap.expectedScore)} · คะแนนที่ได้ {fmt(selectedGap.actualScore)} · Gap {fmt(selectedGap.gap)}</div>
              </div>
              <button className="btn btn-s btn-sm" onClick={() => { setShowDonutBreakdown(false); setSelectedCompetencyCode(null); }}>ปิด</button>
            </div>

            <div style={{ overflowY: "auto", padding: 18, display: "grid", gap: 16 }}>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10 }}>
                <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12, background: "var(--bg)" }}>
                  <div className="sl">Expected Score</div>
                  <div className="fw8">{fmt(selectedGap.expectedScore)}</div>
                </div>
                <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12, background: "var(--bg)" }}>
                  <div className="sl">Actual Score</div>
                  <div className="fw8">{fmt(selectedGap.actualScore)}</div>
                </div>
                <div style={{ border: "1px solid #fecaca", borderRadius: 8, padding: 12, background: "var(--red-bg)" }}>
                  <div className="sl">Gap</div>
                  <div className="fw8" style={{ color: "var(--red)" }}>{fmt(selectedGap.gap)}</div>
                </div>
              </div>

              <div style={{ border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg)", padding: 12 }}>
                <div className="fw8 fs13">ข้อเสนอแนะจากผู้ประเมิน</div>
                <div className="muted fs12 mt4">ควรเลือกกิจกรรมที่ช่วยปิดช่องว่างพฤติกรรมทั้งหมดของสมรรถนะนี้ และกำหนด KPI ที่ตรวจสอบผลได้จริง</div>
              </div>

              <div>
                <div className="flex ic jb mb8" style={{ gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div className="fw8">พฤติกรรมที่ยังเป็น Gap</div>
                    <div className="muted fs12 mt4">ข้อมูลส่วนนี้ระบบดึงมาให้อัตโนมัติและไม่ให้ลบออก</div>
                  </div>
                  <span className="b bgr">Locked · {selectedGap.missingBehaviors.length} ข้อ</span>
                </div>
                {renderMissingBehaviors(selectedGap)}
              </div>

              {selectedMode === "detail" && (() => {
                const activities = getActivities(selectedGap.competency.code);
                const chart = chartFor(activities);
                const currentComplete = isCompetencyPlanComplete(selectedGap.competency.code);
                return (
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "grid", gap: 14 }}>
                    <div
                      className="idp-send-panel"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(0,1fr) 260px",
                        gap: 16,
                        alignItems: "stretch",
                        border: `1px solid ${currentComplete ? "var(--green-md)" : "#fde68a"}`,
                        borderRadius: 10,
                        padding: 16,
                        background: currentComplete ? "var(--green-bg)" : "var(--yellow-bg)"
                      }}
                    >
                      <div style={{ display: "grid", gap: 12, minWidth: 0 }}>
                        <div className="flex ic jb" style={{ gap: 10, flexWrap: "wrap" }}>
                          <div>
                            <div className="fw8">ข้อมูลสำหรับส่งให้หัวหน้า</div>
                            <div className="muted fs12 mt4">ตรวจสอบข้อมูลของสมรรถนะนี้ก่อนส่งอนุมัติ</div>
                          </div>
                          <span className={`b ${currentComplete ? "bg" : "by"}`}>{currentComplete ? "พร้อมส่ง" : "ยังไม่ครบ"}</span>
                        </div>

                        <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12, background: "#fff" }}>
                          <div className="sl">เป้าหมายในการพัฒนา</div>
                          <div className="fw8 fs13" style={{ color: forms[selectedGap.competency.code]?.behaviorResult ? "var(--text)" : "var(--text3)", lineHeight: 1.55 }}>
                            {forms[selectedGap.competency.code]?.behaviorResult || "ยังไม่ได้กรอกเป้าหมาย"}
                          </div>
                        </div>

                        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 8 }}>
                          <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 10, background: "#fff" }}><div className="sl">ผู้จัดทำแผน</div><div className="fw8 fs13">{user ? `${user.t || ""}${user.n}` : "นายสมชาย มีสุข"}</div></div>
                          <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 10, background: "#fff" }}><div className="sl">กิจกรรม</div><div className="fw8 fs13">{activities.length} รายการ</div></div>
                          <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 10, background: "#fff" }}><div className="sl">น้ำหนักรวม</div><div className="fw8 fs13">{activityWeightTotal(selectedGap.competency.code)}%</div></div>
                        </div>
                      </div>

                      <div style={{ border: "1px solid var(--border)", borderRadius: 10, background: "#fff", padding: 14, display: "grid", justifyItems: "center", alignContent: "center", gap: 10 }}>
                        <button
                          type="button"
                          className="donut"
                          onClick={() => setShowDonutBreakdown(true)}
                          style={{
                            width: 132,
                            height: 132,
                            border: "none",
                            cursor: "pointer",
                            background: `conic-gradient(#0EA5A0 0 ${chart.first}%, #2563EB ${chart.first}% ${chart.second}%, #D97706 ${chart.second}% 100%)`
                          }}
                          title={chart.title}
                        >
                          <span className="donut-center">{activityWeightTotal(selectedGap.competency.code)}%</span>
                        </button>
                        <div className="fw8 fs13">สัดส่วนการเรียนรู้</div>
                        <div style={{ display: "grid", gap: 6, width: "100%" }}>
                          {chart.rows.length ? chart.rows.map((item, index) => (
                            <div key={item.label} style={{ display: "grid", gridTemplateColumns: "10px minmax(0,1fr) auto", alignItems: "center", gap: 7 }}>
                              <span style={{ width: 8, height: 8, borderRadius: "50%", background: index === 0 ? "#0EA5A0" : index === 1 ? "#2563EB" : "#D97706" }} />
                              <span className="muted fs12" style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
                              <span className="fw8 fs12">{item.value}%</span>
                            </div>
                          )) : (
                            <div className="muted fs12" style={{ textAlign: "center" }}>ยังไม่มีกิจกรรม</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="fw8 mb8">กิจกรรมที่เลือกไปทำ</div>
                      {activities.length === 0 ? (
                        <div style={{ border: "1px dashed var(--border)", borderRadius: 8, padding: 16, background: "var(--bg)", textAlign: "center" }}>
                          <div className="fw8">ยังไม่มีกิจกรรม</div>
                          <div className="muted fs12 mt4">กลับไปกดเพิ่มกิจกรรมในหน้ารายการสมรรถนะ</div>
                        </div>
                      ) : (
                        <div style={{ display: "grid", gap: 8 }}>
                          {activities.map((activity: any, index: number) => (
                            <div key={activity.id} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12, background: "#fff" }}>
                              <div className="flex ic jb" style={{ gap: 10, flexWrap: "wrap" }}>
                                <div className="fw8 fs13">กิจกรรมที่ {index + 1}: {activity.method || "ยังไม่ได้กรอกชื่อกิจกรรม"}</div>
                                <span className="b bt">{Number(activity.learningWeight || 0)}%</span>
                              </div>
                              <div className="muted fs12 mt6">{activity.learningType || "ยังไม่เลือกประเภทการเรียนรู้"}</div>
                              <div className="fs13 mt8" style={{ color: "var(--text2)", lineHeight: 1.55 }}>{activity.activityDetail || "ยังไม่ได้กรอกรายละเอียดกิจกรรม"}</div>
                              <div className="muted fs12 mt6">KPI: {activity.kpi || "ยังไม่ได้กรอก"}</div>
                              <div className="muted fs12 mt4">ช่วงเวลา: {activity.startDate || "-"} ถึง {activity.endDate || "-"}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {selectedMode === "edit" && (
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                <div className="fg">
                  <label className="lbl">เป้าหมายในการพัฒนา (Behavior Result)</label>
                  <textarea
                    className="ta"
                    placeholder="กรอกเป้าหมายที่ต้องการเห็นหลังพัฒนาสมรรถนะนี้"
                    value={forms[selectedGap.competency.code]?.behaviorResult || ""}
                    onChange={event => updateForm(selectedGap.competency.code, "behaviorResult", event.target.value)}
                  />
                </div>

                <div className="flex ic jb mb10" style={{ gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div className="fw8">กิจกรรมการพัฒนา</div>
                    <div className="muted fs12 mt4">เพิ่มกิจกรรมได้หลายรายการ แต่น้ำหนักรวมของสมรรถนะนี้ต้องครบ 100%</div>
                  </div>
                  <span className={`b ${activityWeightTotal(selectedGap.competency.code) === 100 ? "bg" : "by"}`}>น้ำหนักรวม {activityWeightTotal(selectedGap.competency.code)}%</span>
                </div>

                {getActivities(selectedGap.competency.code).length === 0 && (
                  <div style={{ border: "1px dashed var(--border)", borderRadius: 8, padding: 16, background: "var(--bg)", textAlign: "center" }}>
                    <div className="fw8">ยังไม่มีกิจกรรม</div>
                    <div className="muted fs12 mt4">กดเพิ่มกิจกรรมเพื่อกรอกเอง หรือเลือกจาก Learning Catalog</div>
                  </div>
                )}

                <div style={{ display: "grid", gap: 10 }}>
                  {getActivities(selectedGap.competency.code).map((activity: any, index: number) => (
                    <div key={activity.id} style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
                      <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", background: "var(--bg)", display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <div className="fw8 fs13">กิจกรรมที่ {index + 1}</div>
                        <button className="btn btn-r btn-xs" onClick={() => removeActivity(selectedGap.competency.code, activity.id)}>ลบกิจกรรม</button>
                      </div>
                      <div style={{ padding: 12 }}>
                        <div className="g2">
                          <div className="fg">
                            <label className="lbl">วิธีเพิ่มกิจกรรม</label>
                            <select
                              className="sel"
                              value={activity.inputMode || "manual"}
                              onChange={event => {
                                updateActivity(selectedGap.competency.code, activity.id, "inputMode", event.target.value);
                                if (event.target.value === "manual") updateActivity(selectedGap.competency.code, activity.id, "catalogId", "");
                              }}
                            >
                              <option value="manual">กรอกเอง</option>
                              <option value="catalog">นำเข้าจาก Learning Catalog</option>
                            </select>
                          </div>
                          {activity.inputMode === "catalog" && (
                            <div className="fg">
                              <label className="lbl">เลือกกิจกรรมจาก Learning Catalog</label>
                              <select
                                className="sel"
                                value={activity.catalogId || ""}
                                onChange={event => applyCatalog(selectedGap.competency.code, activity.id, event.target.value)}
                              >
                                <option value="">เลือกกิจกรรม</option>
                                {learningCatalog.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                              </select>
                            </div>
                          )}
                          <div className="fg"><label className="lbl">เครื่องมือ/วิธีการพัฒนา</label><input className="inp" value={activity.method || ""} onChange={event => updateActivity(selectedGap.competency.code, activity.id, "method", event.target.value)} /></div>
                          <div className="fg"><label className="lbl">ประเภทการเรียนรู้</label><select className="sel" value={activity.learningType || ""} onChange={event => updateActivity(selectedGap.competency.code, activity.id, "learningType", event.target.value)}>{learningMethods.map(method => <option key={method.key || method.label} value={method.label}>{method.label}</option>)}</select></div>
                          <div className="fg"><label className="lbl">น้ำหนัก (%)</label><input className="inp" type="number" min="0" max="100" value={activity.learningWeight || 0} onChange={event => updateActivity(selectedGap.competency.code, activity.id, "learningWeight", Number(event.target.value))} /></div>
                          <div className="fg"><label className="lbl">KPI / Success Criteria</label><input className="inp" value={activity.kpi || ""} onChange={event => updateActivity(selectedGap.competency.code, activity.id, "kpi", event.target.value)} /></div>
                          <div className="fg"><label className="lbl">วันที่เริ่มต้น</label><input className="inp" type="date" value={activity.startDate || ""} onChange={event => updateActivity(selectedGap.competency.code, activity.id, "startDate", event.target.value)} /></div>
                          <div className="fg"><label className="lbl">วันที่สิ้นสุด</label><input className="inp" type="date" value={activity.endDate || ""} onChange={event => updateActivity(selectedGap.competency.code, activity.id, "endDate", event.target.value)} /></div>
                        </div>
                        <div className="fg mb0"><label className="lbl">รายละเอียดกิจกรรมที่ต้องทำ</label><textarea className="ta" value={activity.activityDetail || ""} onChange={event => updateActivity(selectedGap.competency.code, activity.id, "activityDetail", event.target.value)} /></div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-s btn-sm mt12" onClick={() => addActivity(selectedGap.competency.code)}>+ เพิ่มกิจกรรมพัฒนา</button>
              </div>
              )}
            </div>

            {selectedMode === "edit" ? (
              <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", background: "var(--bg)", display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", flexShrink: 0 }}>
                <div className="muted fs12">หน้านี้ใช้เพิ่ม ลด และแก้ไขกิจกรรมเท่านั้น</div>
                <div className="flex g8" style={{ flexWrap: "wrap" }}>
                  <button className="btn btn-s" onClick={() => { writeLocal(`mock-idp-forms-v2:${user?.sso || "20002"}`, forms); setShowDonutBreakdown(false); setSelectedCompetencyCode(null); }}>ปิด</button>
                </div>
              </div>
            ) : (
              <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", background: "var(--bg)", display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", flexShrink: 0 }}>
                <div className="muted fs12">{isCompetencyPlanComplete(selectedGap.competency.code) ? "แผนของสมรรถนะนี้พร้อมส่งให้หัวหน้าอนุมัติ" : "ต้องกรอกข้อมูลของสมรรถนะนี้ให้ครบ และให้น้ำหนักรวมครบ 100% ก่อนส่ง"}</div>
                <div className="flex g8" style={{ flexWrap: "wrap" }}>
                  <button className="btn btn-s" onClick={() => { setShowDonutBreakdown(false); setSelectedCompetencyCode(null); }}>ปิด</button>
                  <button
                    className="btn btn-t"
                    onClick={() => submitPlan(selectedGap)}
                    disabled={!isCompetencyPlanComplete(selectedGap.competency.code)}
                    style={{
                      opacity: isCompetencyPlanComplete(selectedGap.competency.code) ? 1 : 0.45,
                      cursor: isCompetencyPlanComplete(selectedGap.competency.code) ? "pointer" : "not-allowed"
                    }}
                  >
                    ส่งให้หัวหน้าอนุมัติ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showDonutBreakdown && selectedGap && (() => {
        const activities = getActivities(selectedGap.competency.code);
        const chart = chartFor(activities);
        return (
          <div className="mo" style={{ zIndex: 260 }} onClick={() => setShowDonutBreakdown(false)}>
            <div className="mo-box" style={{ width: 560, maxWidth: "calc(100vw - 32px)", overflow: "hidden" }} onClick={event => event.stopPropagation()}>
              <div className="mo-h">
                <div>
                  <div className="fw8">รายละเอียดสัดส่วนการพัฒนา</div>
                  <div className="muted fs12 mt4">{selectedGap.competency.code} · {selectedGap.competency.name}</div>
                </div>
                <button className="btn btn-s btn-sm" onClick={() => setShowDonutBreakdown(false)}>ปิด</button>
              </div>
              <div className="mo-b" style={{ display: "grid", gap: 14 }}>
                <div className="flex ic" style={{ justifyContent: "center" }}>
                  <div
                    className="donut"
                    style={{
                      width: 156,
                      height: 156,
                      background: `conic-gradient(#0EA5A0 0 ${chart.first}%, #2563EB ${chart.first}% ${chart.second}%, #D97706 ${chart.second}% 100%)`
                    }}
                    title={chart.title}
                  >
                    <span className="donut-center">{activityWeightTotal(selectedGap.competency.code)}%</span>
                  </div>
                </div>
                {chart.rows.length ? chart.rows.map((item, index) => (
                  <div key={item.label} style={{ display: "grid", gridTemplateColumns: "18px 1fr auto", gap: 10, alignItems: "center", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg)" }}>
                    <span style={{ width: 12, height: 12, borderRadius: "50%", background: index === 0 ? "#0EA5A0" : index === 1 ? "#2563EB" : "#D97706" }} />
                    <div className="fw8 fs13">{item.label}</div>
                    <span className="b bt">{item.value}%</span>
                  </div>
                )) : (
                  <div style={{ border: "1px dashed var(--border)", borderRadius: 8, padding: 14, background: "var(--bg)", textAlign: "center" }}>
                    <div className="muted fs12">ยังไม่มีกิจกรรมให้แสดงรายละเอียด</div>
                  </div>
                )}
                <div className="muted fs12">สัดส่วนนี้คำนวณจากน้ำหนัก (%) ของกิจกรรมทั้งหมดที่กรอกในสมรรถนะนี้</div>
              </div>
            </div>
          </div>
        );
      })()}

    </>
  );
};

export const EmployeeProgress: React.FC = () => {
  const defaultProgressForms = MOCK_IDP_ACTIVITIES.reduce<Record<string, any>>((acc, activity) => {
    acc[activity.id] = {
      executionStatus: "",
      executionReason: "",
      achievementResult: "",
      improvementPlan: "",
      evidenceNo: "",
      evidenceUrl: activity.evidenceUrl || "",
      progressComment: activity.progressComment || "",
      supervisorFeedback: "",
      supervisorDecision: "",
      submitted: activity.status === "evidence_submitted" || activity.status === "completed"
    };
    return acc;
  }, {});
  const [files, setFiles] = useState<Record<string, string[]>>({});
  const [forms, setForms] = useState<Record<string, any>>(() => readLocal("mock-progress-forms:20002", defaultProgressForms));
  const [activeCompetencyCode, setActiveCompetencyCode] = useState<string | null>(null);
  const [learningTypeFilter, setLearningTypeFilter] = useState("ทั้งหมด");
  const competencyByCode = (code: string) => WORKFLOW_COMPETENCIES.filter(comp => comp.code === code)[0];
  const gapByCode = (code: string) => gapResultsFor(MOCK_GAP_CHECKED_BEHAVIOR_IDS).filter(item => item.competency.code === code)[0];

  const idpPlanForms = readLocal<Record<string, any>>("mock-idp-forms-v2:20002", {});
  const activitiesFromPlan = Object.keys(idpPlanForms).flatMap(competencyCode => {
    const plan = idpPlanForms[competencyCode] || {};
    const gap = gapByCode(competencyCode);
    return (plan.activities || []).map((activity: any, index: number) => ({
      ...activity,
      id: activity.id || `${competencyCode}-activity-${index + 1}`,
      competencyCode,
      behaviorIds: gap?.missingBehaviors?.map((behavior: any) => behavior.id) || [],
      target: plan.behaviorResult || activity.target || "ยังไม่ได้ระบุเป้าหมายการพัฒนา",
      activityDetail: activity.activityDetail || activity.method || "ยังไม่ได้ระบุกิจกรรม",
      evidenceFiles: activity.evidenceFiles || [],
      evidenceUrl: activity.evidenceUrl || "",
      approvalStatus: "approved",
      approvedAt: plan.approvedAt || "mock-approved",
      status: activity.status || "in_progress"
    }));
  });
  const approvedActivities = activitiesFromPlan.length
    ? activitiesFromPlan
    : [
        ...MOCK_IDP_ACTIVITIES.filter(activity => activity.approvalStatus === "approved"),
        {
          id: "idp-1-social-demo",
          userSso: "20002",
          competencyCode: "FC2-061",
          behaviorIds: ["FC2-061-2.3"],
          target: "พัฒนาการใช้เครื่องมือดิจิทัลให้รองรับงานประจำและการติดตามงาน",
          method: "Coaching by Supervisor",
          learningType: "Social Learning",
          learningWeight: 20,
          activityDetail: "รับ coaching จากหัวหน้างานเรื่องการเลือกเครื่องมือดิจิทัลและการติดตามงาน",
          kpi: "มีบันทึก coaching และปรับ workflow การติดตามงานได้จริง",
          startDate: "2026-07-01",
          endDate: "2026-08-15",
          approvalStatus: "approved",
          approvedAt: "2026-06-10",
          status: "in_progress",
          evidenceFiles: [],
          evidenceUrl: ""
        },
        {
          id: "idp-1-formal-demo",
          userSso: "20002",
          competencyCode: "FC2-061",
          behaviorIds: ["FC2-061-3.1", "FC2-061-3.3"],
          target: "พัฒนาการใช้เครื่องมือดิจิทัลให้รองรับงานประจำและการติดตามงาน",
          method: "อบรม AI & Data Analytics",
          learningType: "Formal Learning",
          learningWeight: 10,
          activityDetail: "เข้าอบรมหลักสูตร AI & Data Analytics และสรุปการนำไปใช้กับงานประจำ",
          kpi: "ผ่านการอบรมและมีชิ้นงานหรือรายงานผลการนำไปใช้",
          startDate: "2026-08-01",
          endDate: "2026-09-15",
          approvalStatus: "approved",
          approvedAt: "2026-06-10",
          status: "in_progress",
          evidenceFiles: [],
          evidenceUrl: ""
        }
      ];
  const competencyRows = approvedActivities.reduce<Array<{ code: string; activities: any[] }>>((rows, activity) => {
    const row = rows.filter(item => item.code === activity.competencyCode)[0];
    if (row) row.activities.push(activity);
    else rows.push({ code: activity.competencyCode, activities: [activity] });
    return rows;
  }, []);
  const activeActivities = approvedActivities.filter(activity => activity.competencyCode === activeCompetencyCode);
  const learningTypeOptions = ["ทั้งหมด", ...activeActivities.reduce<string[]>((items, activity) => {
    if (activity.learningType && !items.includes(activity.learningType)) items.push(activity.learningType);
    return items;
  }, [])];
  const filteredActiveActivities = learningTypeFilter === "ทั้งหมด"
    ? activeActivities
    : activeActivities.filter(activity => activity.learningType === learningTypeFilter);

  const updateProgress = (activityId: string, field: string, value: any) => {
    setForms(prev => {
      const nextForms = { ...prev, [activityId]: { ...prev[activityId], [field]: value } };
      writeLocal("mock-progress-forms:20002", nextForms);
      return nextForms;
    });
  };

  const evidenceNames = (activity: any) => [
    ...(activity.evidenceFiles || []),
    ...((forms[activity.id] || {}).evidenceFiles || []),
    ...(files[activity.id] || [])
  ].filter((name, index, all) => all.indexOf(name) === index);

  const hasEvidence = (activity: any) => {
    const form = forms[activity.id] || {};
    return Boolean((form.evidenceNo || "").trim() || (form.evidenceUrl || "").trim() || evidenceNames(activity).length);
  };

  const isProgressReady = (activity: any) => {
    const form = forms[activity.id] || {};
    if (!form.executionStatus || !form.achievementResult || !hasEvidence(activity)) return false;
    if (form.executionStatus === "off_plan" && !(form.executionReason || "").trim()) return false;
    if (form.achievementResult === "not_achieved" && !(form.improvementPlan || "").trim()) return false;
    return true;
  };

  const submitProgress = (activity: any) => {
    if (!isProgressReady(activity)) {
      alert("กรอกสถานะ ผลสัมฤทธิ์ และหลักฐานของกิจกรรมนี้ให้ครบก่อนส่งหัวหน้า");
      return;
    }
    const nextForms = { ...forms, [activity.id]: { ...forms[activity.id], submitted: true } };
    setForms(nextForms);
    writeLocal("mock-progress-forms:20002", nextForms);
    alert(`ส่งผลความก้าวหน้าของกิจกรรม ${activity.id} ให้หัวหน้างานตรวจแล้ว`);
  };

  const statusText = (activity: any, submitted: boolean) => {
    if (submitted) return "ส่งให้หัวหน้างานตรวจแล้ว";
    if (activity.status === "completed") return "หัวหน้ารับรองแล้ว";
    return "รออัปเดตผล";
  };

  const achievementText: Record<string, string> = {
    exceeded: "บรรลุเกินเป้าหมาย",
    achieved: "บรรลุตามเป้าหมาย",
    not_achieved: "ไม่บรรลุผล"
  };

  const renderActivityFields = (activity: any, order: number) => {
    const form = forms[activity.id] || {};
    const ready = isProgressReady(activity);
    const disabledForSupervisor = !form.submitted;
    const behaviorText = WORKFLOW_COMPETENCIES
      .reduce<any[]>((items, comp) => [...items, ...comp.indicators], [])
      .filter(indicator => (activity.behaviorIds || []).includes(indicator.id));

    return (
      <section key={activity.id} style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ padding: "12px 14px", background: "var(--bg)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div className="fw8">กิจกรรมที่ {order}: {activity.activityDetail}</div>
            <div className="muted fs12 mt4">Learning Type: {activity.learningType} · น้ำหนัก {activity.learningWeight}% · ระยะเวลา {activity.startDate} ถึง {activity.endDate}</div>
          </div>
          <span className={`b ${(form.submitted || activity.status === "evidence_submitted") ? "bo" : ready ? "by" : "bgr"}`}>{statusText(activity, Boolean(form.submitted))}</span>
        </div>

        <div style={{ padding: 14, display: "grid", gap: 14 }}>
          <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 10 }}>
            <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
              <div className="sl">เป้าหมายการพัฒนา (Behavior Result)</div>
              <div className="fw8 fs13" style={{ lineHeight: 1.55 }}>{activity.target}</div>
              {behaviorText.length > 0 && <ul className="blist mt8">{behaviorText.map(item => <li key={item.id}>{item.text}</li>)}</ul>}
            </div>
            <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
              <div className="sl">KPI / Success Criteria</div>
              <div className="fw8 fs13" style={{ lineHeight: 1.55 }}>{activity.kpi}</div>
              <div className="sl mt10">หลักฐานเดิมจากแผน/กิจกรรม</div>
              <div className="muted fs12">{evidenceNames(activity).length ? evidenceNames(activity).join(", ") : "ยังไม่มีหลักฐาน"}</div>
            </div>
          </div>

          <div>
            <div className="lbl mb8">สถานะการดำเนินการพัฒนา (Execution Status)</div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 8 }}>
              <label className="check-row" style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
                <input type="radio" name={`execution-${activity.id}`} checked={form.executionStatus === "on_plan"} onChange={() => updateProgress(activity.id, "executionStatus", "on_plan")} />
                <span className="fw8">เป็นไปตามแผน</span>
              </label>
              <label className="check-row" style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
                <input type="radio" name={`execution-${activity.id}`} checked={form.executionStatus === "off_plan"} onChange={() => updateProgress(activity.id, "executionStatus", "off_plan")} />
                <span className="fw8">ไม่เป็นไปตามแผน</span>
              </label>
            </div>
            {form.executionStatus === "off_plan" && (
              <div className="fg mt10 mb0">
                <label className="lbl">เหตุผลประกอบว่าเพราะอะไร <span style={{ color: "var(--red)" }}>*</span></label>
                <textarea className="ta" value={form.executionReason || ""} onChange={event => updateProgress(activity.id, "executionReason", event.target.value)} />
              </div>
            )}
          </div>

          <div>
            <div className="lbl mb8">ผลสัมฤทธิ์ของการพัฒนา (Achievement Result)</div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 8 }}>
              {[
                ["exceeded", "บรรลุเกินเป้าหมายที่กำหนด"],
                ["achieved", "บรรลุตามเป้าหมายที่กำหนด"],
                ["not_achieved", "ไม่บรรลุผล"]
              ].map(([value, label]) => (
                <label key={value} className="check-row" style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
                  <input type="radio" name={`achievement-${activity.id}`} checked={form.achievementResult === value} onChange={() => updateProgress(activity.id, "achievementResult", value)} />
                  <span className="fw8">{label}</span>
                </label>
              ))}
            </div>
            {form.achievementResult === "not_achieved" && (
              <div className="fg mt10 mb0">
                <label className="lbl">ควรพัฒนาต่อเพื่อ... <span style={{ color: "var(--red)" }}>*</span></label>
                <textarea className="ta" value={form.improvementPlan || ""} onChange={event => updateProgress(activity.id, "improvementPlan", event.target.value)} />
              </div>
            )}
          </div>

          <div>
            <div className="lbl mb8">การแนบเอกสารประกอบ/หลักฐาน (Evidence Attachment)</div>
            <div className="g2">
              <div className="fg"><label className="lbl">หมายเลขเอกสารหลักฐาน</label><input className="inp" value={form.evidenceNo || ""} onChange={event => updateProgress(activity.id, "evidenceNo", event.target.value)} placeholder="เช่น CERT-2569-001" /></div>
              <div className="fg"><label className="lbl">URL หลักฐาน/ลิงก์ผลงาน</label><input className="inp" value={form.evidenceUrl || ""} onChange={event => updateProgress(activity.id, "evidenceUrl", event.target.value)} placeholder="https://..." /></div>
            </div>
            <div className="fg mb0">
              <label className="lbl">อัปโหลดไฟล์หลักฐาน เช่น รูปภาพ Certificate แบบฟอร์ม OJT</label>
              <input
                className="inp"
                type="file"
                multiple
                onChange={event => {
                  const names = Array.from(event.target.files || []).map((file: File) => file.name);
                  setFiles({ ...files, [activity.id]: names });
                  updateProgress(activity.id, "evidenceFiles", names);
                }}
              />
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div className="muted fs12">{ready ? "กิจกรรมนี้พร้อมส่งให้หัวหน้างานตรวจ" : "กรอกสถานะ ผลสัมฤทธิ์ และหลักฐานของกิจกรรมนี้ให้ครบ"}</div>
            <button className="btn btn-t btn-sm" onClick={() => submitProgress(activity)} disabled={!ready} style={{ opacity: ready ? 1 : 0.45 }}>ส่งกิจกรรมนี้ให้หัวหน้า</button>
          </div>

          <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12, background: "var(--yellow-bg)", opacity: disabledForSupervisor ? 0.62 : 1 }}>
            <div className="fw8 fs13 mb8">Supervisor Verification & Approval</div>
            <textarea
              className="ta"
              value={form.supervisorFeedback || ""}
              disabled={disabledForSupervisor}
              onChange={event => updateProgress(activity.id, "supervisorFeedback", event.target.value)}
              placeholder={disabledForSupervisor ? "ส่วนนี้จะใช้งานหลังพนักงานส่งกิจกรรมนี้" : "Feedback จากหัวหน้างาน"}
            />
            <div className="flex g8 mt10">
              <button className="btn btn-t btn-sm" disabled={disabledForSupervisor} onClick={() => updateProgress(activity.id, "supervisorDecision", "approved")}>รับรองผลการพัฒนา</button>
              <button className="btn btn-s btn-sm" disabled={disabledForSupervisor} onClick={() => updateProgress(activity.id, "supervisorDecision", "returned")}>ส่งกลับแก้ไข</button>
            </div>
          </div>
        </div>
      </section>
    );
  };

  const renderProgressModal = () => {
    if (!activeCompetencyCode || activeActivities.length === 0) return null;
    const comp = competencyByCode(activeCompetencyCode);
    const gap = gapByCode(activeCompetencyCode);

    return (
      <div className="mo">
        <div className="mo-box" style={{ maxWidth: 980 }}>
          <div className="mo-h">
            <div style={{ minWidth: 0 }}>
              <div className="flex ic g8" style={{ flexWrap: "wrap" }}>
                {comp && <span className={comp.tagClass}>{tagLabel(comp.type)}</span>}
                <div className="fw8">อัปเดตความก้าวหน้า · {activeCompetencyCode} · {comp?.name}</div>
              </div>
              <div className="muted fs12 mt4">แสดงข้อมูลสมรรถนะและกิจกรรมทุกอันจากแผน IDP ที่อนุมัติแล้ว</div>
            </div>
            <button className="btn btn-s btn-sm" onClick={() => setActiveCompetencyCode(null)}>ปิด</button>
          </div>
          <div className="mo-b" style={{ display: "grid", gap: 16 }}>
            <section style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 14, background: "var(--blue-lt)" }}>
              <div className="fw8">ข้อมูลสมรรถนะ (Read-only)</div>
              <div className="grid mt10" style={{ gridTemplateColumns: "minmax(0,1fr) 120px 140px", gap: 10 }}>
                <div><div className="sl">สมรรถนะ</div><div className="fw8 fs14">{activeCompetencyCode} · {comp?.name}</div></div>
                <div><div className="sl">Gap</div><div className="fw8 fs18" style={{ color: gap && gap.gap < 0 ? "var(--red)" : "var(--teal)" }}>{gap ? fmt(gap.gap) : "-"}</div></div>
                <div><div className="sl">จำนวนกิจกรรม</div><div className="fw8 fs18">{activeActivities.length}</div></div>
              </div>
            </section>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <div className="fw8">กิจกรรมตามประเภทการเรียนรู้</div>
                <div className="muted fs12 mt4">เลือกดูเฉพาะประเภทการเรียนรู้ที่กรอกไว้ในแผน IDP ของสมรรถนะนี้</div>
              </div>
              <div className="seg">
                {learningTypeOptions.map(option => (
                  <button
                    key={option}
                    className={learningTypeFilter === option ? "on" : ""}
                    onClick={() => setLearningTypeFilter(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {filteredActiveActivities.map((activity, index) => renderActivityFields(activity, index + 1))}
            {filteredActiveActivities.length === 0 && (
              <div className="text-center muted fs13" style={{ padding: 24, border: "1px dashed var(--border)", borderRadius: 8 }}>
                ไม่มีกิจกรรมในประเภทการเรียนรู้นี้
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex ic jb mb20">
        <div>
          <div className="sec-t">อัปเดตความก้าวหน้า IDP</div>
          <div className="sec-s">รายงานผลเฉพาะกิจกรรมในแผน IDP ที่หัวหน้าอนุมัติแล้ว พร้อมแนบหลักฐานเพื่อให้หัวหน้าตรวจรับรอง</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <div>
          <div className="fw8" style={{ fontSize: 20 }}>กิจกรรมพัฒนาที่ต้องอัปเดต</div>
          <div className="muted fs12 mt4">แสดงเฉพาะกิจกรรมจากแผน IDP ที่ผ่านการอนุมัติแล้วเท่านั้น</div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {competencyRows.map((row, index) => {
          const comp = competencyByCode(row.code);
          const first = row.activities[0];
          const submitted = row.activities.every(activity => forms[activity.id]?.submitted);
          const ready = row.activities.every(activity => isProgressReady(activity));

          return (
            <button
              key={row.code}
              onClick={() => {
                setLearningTypeFilter("ทั้งหมด");
                setActiveCompetencyCode(row.code);
              }}
              style={{
                width: "100%",
                border: "1px solid var(--border)",
                borderLeft: `5px solid ${submitted ? "var(--orange)" : ready ? "var(--teal)" : "var(--navy)"}`,
                borderRadius: 8,
                background: "#fff",
                padding: 0,
                cursor: "pointer",
                textAlign: "left",
                boxShadow: "0 2px 8px rgba(15,45,91,.05)",
                overflow: "hidden"
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "64px minmax(0,1fr) 170px", alignItems: "stretch" }}>
                <div style={{ display: "grid", placeItems: "center", background: "var(--bg)", borderRight: "1px solid var(--border)" }}>
                  <div style={{ textAlign: "center" }}>
                    
                    <div className="fw8" style={{ fontSize: 22 }}>{index + 1}</div>
                  </div>
                </div>

                <div style={{ padding: "18px 20px" }}>
                  <div className="flex ic g8" style={{ flexWrap: "wrap", marginBottom: 8 }}>
                    {comp && <span className={comp.tagClass}>{tagLabel(comp.type)}</span>}
                    <div className="fw8" style={{ fontSize: 16 }}>{row.code} · {comp?.name || "สมรรถนะที่ต้องพัฒนา"}</div>
                  </div>
                  <div className="muted fs12">ระยะเวลา {first.startDate} ถึง {first.endDate}</div>
                </div>

                <div style={{ borderLeft: "1px solid var(--border)", background: submitted ? "var(--yellow-bg)" : ready ? "var(--green-bg)" : "var(--bg)", padding: "18px 16px", display: "grid", alignContent: "center", gap: 10 }}>
                  <span className={`b ${submitted ? "bo" : first.status === "completed" ? "bg" : ready ? "by" : "bgr"}`} style={{ justifySelf: "start" }}>
                    {statusText(first, submitted)}
                  </span>
                  <span className="btn btn-s btn-sm" style={{ justifySelf: "start" }}>อัพเดตความก้าวหน้า</span>
                </div>
              </div>
            </button>
          );
        })}

        {approvedActivities.length === 0 && (
          <div className="text-center muted fs13" style={{ padding: 36, border: "1px dashed var(--border)", borderRadius: 8, background: "#fff" }}>
            ยังไม่มีแผน IDP ที่ผ่านการอนุมัติ จึงยังไม่มีรายการให้ update ความก้าวหน้า
          </div>
        )}
      </div>
      {renderProgressModal()}
    </>
  );
};

export const EmployeeIDPDetail: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState("2569");
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [selectedCompetencyCode, setSelectedCompetencyCode] = useState<string | null>(null);
  const gaps = gapResultsFor(MOCK_GAP_CHECKED_BEHAVIOR_IDS);
  const gapCompetencies = gaps.filter(item => item.gap < 0);
  const progressForms = readLocal<Record<string, any>>("mock-progress-forms:20002", {});
  const idpPlanForms = readLocal<Record<string, any>>("mock-idp-forms-v2:20002", {});
  const currentPlanActivities = Object.keys(idpPlanForms).flatMap(competencyCode => {
    const plan = idpPlanForms[competencyCode] || {};
    return (plan.activities || []).map((activity: any, index: number) => ({
      ...activity,
      id: activity.id || `${competencyCode}-activity-${index + 1}`,
      competencyCode,
      target: plan.behaviorResult || activity.target || "ยังไม่ได้ระบุเป้าหมายการพัฒนา",
      activityDetail: activity.activityDetail || activity.method || "ยังไม่ได้ระบุกิจกรรม",
      status: progressForms[activity.id]?.submitted ? "evidence_submitted" : activity.status || "in_progress"
    }));
  });
  const currentActivities = currentPlanActivities.length
    ? currentPlanActivities
    : MOCK_IDP_ACTIVITIES.filter(activity => activity.approvalStatus === "approved");
  const activityStatus = (activity: any) => {
    const form = progressForms[activity.id] || {};
    if (form.supervisorDecision === "approved" || activity.status === "completed") return { label: "เสร็จสิ้น", className: "bg" };
    if (form.submitted || activity.status === "evidence_submitted") return { label: "รอรับรองผล", className: "bo" };
    if (activity.status === "rejected") return { label: "ส่งกลับแก้ไข", className: "br" };
    return { label: "กำลังดำเนินการ", className: "by" };
  };
  const groupedActivities = currentActivities.reduce<Array<{ code: string; activities: any[] }>>((rows, activity) => {
    const row = rows.filter(item => item.code === activity.competencyCode)[0];
    if (row) row.activities.push(activity);
    else rows.push({ code: activity.competencyCode, activities: [activity] });
    return rows;
  }, []);
  const completedActivities = currentActivities.filter(activity => activityStatus(activity).label === "เสร็จสิ้น").length;
  const submittedActivities = currentActivities.filter(activity => activityStatus(activity).label === "รอรับรองผล").length;
  const historyPlans: Record<string, any[]> = {
    "2568": [
      { competencyCode: "CC-002", name: "การมุ่งผลสัมฤทธิ์", status: "เสร็จสิ้น", activities: 2, result: "ปิดแผนแล้ว" },
      { competencyCode: "FC2-062", name: "การวิเคราะห์ข้อมูล", status: "เสร็จสิ้น", activities: 1, result: "ผ่านการรับรองผล" }
    ],
    "2567": [
      { competencyCode: "CC-003", name: "การทำงานเป็นทีม", status: "เสร็จสิ้น", activities: 2, result: "นำไปใช้ในงานประจำแล้ว" }
    ]
  };
  const isCurrentYear = selectedYear === "2569";
  const competencyByCode = (code: string) => WORKFLOW_COMPETENCIES.filter(comp => comp.code === code)[0];
  const gapByCode = (code: string) => gaps.filter(item => item.competency.code === code)[0];
  const selectedActivity = currentActivities.filter(activity => activity.id === selectedActivityId)[0] || null;
  const selectedActivityProgress = selectedActivity ? progressForms[selectedActivity.id] || {} : {};
  const selectedCompetency = selectedCompetencyCode ? gapByCode(selectedCompetencyCode) : null;
  const selectedCompetencyActivities = selectedCompetencyCode
    ? currentActivities.filter(activity => activity.competencyCode === selectedCompetencyCode)
    : [];
  const progressLabel: Record<string, string> = {
    on_plan: "เป็นไปตามแผน",
    off_plan: "ไม่เป็นไปตามแผน",
    exceeded: "บรรลุเกินเป้าหมายที่กำหนด",
    achieved: "บรรลุตามเป้าหมายที่กำหนด",
    not_achieved: "ไม่บรรลุผล"
  };
  const detailEvidenceNames = (activity: any) => [
    ...(activity.evidenceFiles || []),
    ...((progressForms[activity.id] || {}).evidenceFiles || [])
  ].filter((name, index, all) => all.indexOf(name) === index);

  return (
    <>
      <div className="flex ic jb mb20">
        <div>
          <div className="sec-t">รายละเอียด IDP</div>
          <div className="sec-s">ภาพรวมแผน IDP ปัจจุบัน ประวัติย้อนหลัง และรายงานสำหรับเก็บเป็นแฟ้มผลงาน</div>
        </div>
        <div className="flex g8" style={{ flexWrap: "wrap" }}>
          <button className="btn btn-s btn-sm" onClick={() => alert("Export PDF mock")}>Export PDF</button>
          <button className="btn btn-s btn-sm" onClick={() => alert("Export Excel mock")}>Export Excel</button>
        </div>
      </div>

      <div className="card mb16">
        <div className="ch" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <div>
            <div className="fw8">ปีการประเมิน</div>
            <div className="muted fs12 mt4">เลือกดูแผนปัจจุบันหรือประวัติการพัฒนาย้อนหลังแบบ read-only</div>
          </div>
          <select className="sel" style={{ width: 170 }} value={selectedYear} onChange={event => setSelectedYear(event.target.value)}>
            <option value="2569">2569 (ปัจจุบัน)</option>
            <option value="2568">2568</option>
            <option value="2567">2567</option>
          </select>
        </div>
      </div>

      {isCurrentYear ? (
        <>
          <div className="grid mb16" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
            <div className="sc"><div className="sl">สมรรถนะที่ต้องพัฒนา</div><div className="sv" style={{ color: "var(--red)" }}>{gapCompetencies.length}</div><div className="ss muted">เกิด Gap และเข้า IDP</div></div>
            <div className="sc"><div className="sl">กิจกรรมในแผน IDP</div><div className="sv">{currentActivities.length}</div><div className="ss muted">จากแผนที่อนุมัติแล้ว</div></div>
            <div className="sc"><div className="sl">ส่งหลักฐาน/เสร็จสิ้น</div><div className="sv">{submittedActivities + completedActivities}</div><div className="ss muted">รอรับรองหรือปิดแผนแล้ว</div></div>
          </div>

          <div className="card mb16">
              <div className="ch"><div><div className="fw8">สมรรถนะที่ต้องพัฒนา</div><div className="muted fs12 mt4">รายการที่เกิด Gap และถูกนำไปจัดทำแผน IDP</div></div></div>
              <div className="cb" style={{ display: "grid", gap: 8 }}>
                {gapCompetencies.map(item => (
                  <div key={item.competency.code} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto auto", alignItems: "center", gap: 10, padding: "10px 12px", border: "1px solid #fecaca", borderRadius: 8, background: "var(--red-bg)" }}>
                    <div className="flex ic g8"><span className={item.competency.tagClass}>{tagLabel(item.competency.type)}</span><span className="fw8">{item.competency.code} · {item.competency.name}</span></div>
                    <span className="b br">Gap {fmt(item.gap)}</span>
                    <button className="btn btn-s btn-sm" onClick={() => setSelectedCompetencyCode(item.competency.code)}>รายละเอียด IDP</button>
                  </div>
                ))}
              </div>
          </div>

          <div className="card">
            <div className="ch">
              <div>
                <div className="fw8">สรุปแผน IDP ปัจจุบันและความก้าวหน้ารายกิจกรรม</div>
                <div className="muted fs12 mt4">สถานะกิจกรรม เช่น รอรับรองผล กำลังดำเนินการ หรือเสร็จสิ้น</div>
              </div>
            </div>
            <div className="cb" style={{ display: "grid", gap: 12 }}>
              {groupedActivities.map(row => {
                const comp = competencyByCode(row.code);
                const gap = gapByCode(row.code);
                return (
                  <div key={row.code} style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
                    <div style={{ padding: "12px 14px", background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                      <div className="flex ic g8" style={{ flexWrap: "wrap" }}>
                        {comp && <span className={comp.tagClass}>{tagLabel(comp.type)}</span>}
                        <div className="fw8">{row.code} · {comp?.name}</div>
                        {gap && <span className="b br">Gap {fmt(gap.gap)}</span>}
                      </div>
                    </div>
                    <div style={{ display: "grid" }}>
                      {row.activities.map((activity, index) => {
                        const status = activityStatus(activity);
                        return (
                          <button
                            key={activity.id}
                            onClick={() => setSelectedActivityId(activity.id)}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "48px minmax(0,1fr) 140px",
                              gap: 12,
                              padding: "12px 14px",
                              border: "none",
                              borderTop: index ? "1px solid var(--border)" : "none",
                              alignItems: "center",
                              background: "#fff",
                              textAlign: "left",
                              cursor: "pointer",
                              font: "inherit"
                            }}
                          >
                            <div className="fw8 muted">#{index + 1}</div>
                            <div style={{ minWidth: 0 }}>
                              <div className="fw8 fs13">{activity.activityDetail}</div>
                              <div className="muted fs12 mt4">{activity.learningType} · น้ำหนัก {activity.learningWeight}% · {activity.startDate} ถึง {activity.endDate}</div>
                              <div className="muted fs12 mt4">KPI: {activity.kpi}</div>
                            </div>
                            <span className={`b ${status.className}`}>{status.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="card">
          <div className="ch">
            <div>
              <div className="fw8">ประวัติการพัฒนาย้อนหลัง ปี {selectedYear}</div>
              <div className="muted fs12 mt4">ข้อมูลเก่าถูกแสดงแบบ read-only เพื่อดูพัฒนาการและใช้วางแผนปีถัดไป</div>
            </div>
          </div>
          <div className="cb" style={{ display: "grid", gap: 10 }}>
            {(historyPlans[selectedYear] || []).map(item => (
              <div key={item.competencyCode} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 120px 140px", gap: 12, alignItems: "center", padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 8 }}>
                <div>
                  <div className="fw8">{item.competencyCode} · {item.name}</div>
                  <div className="muted fs12 mt4">{item.result}</div>
                </div>
                <div><div className="sl">กิจกรรม</div><div className="fw8">{item.activities} รายการ</div></div>
                <span className="b bg">{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {selectedActivity && (
        <div className="mo">
          <div className="mo-box" style={{ maxWidth: 760 }}>
            <div className="mo-h">
              <div>
                <div className="fw8">รายละเอียดความก้าวหน้ารายกิจกรรม</div>
                <div className="muted fs12 mt4">{selectedActivity.competencyCode} · {selectedActivity.learningType}</div>
              </div>
              <button className="btn btn-s btn-sm" onClick={() => setSelectedActivityId(null)}>ปิด</button>
            </div>
            <div className="mo-b" style={{ display: "grid", gap: 14 }}>
              <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 14, background: "var(--bg)" }}>
                <div className="sl">กิจกรรม</div>
                <div className="fw8 fs14">{selectedActivity.activityDetail}</div>
                <div className="muted fs12 mt6">น้ำหนัก {selectedActivity.learningWeight}% · {selectedActivity.startDate} ถึง {selectedActivity.endDate}</div>
                <div className="muted fs12 mt6">KPI: {selectedActivity.kpi}</div>
              </div>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
                <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
                  <div className="sl">สถานะกิจกรรม</div>
                  <div className="fw8">{activityStatus(selectedActivity).label}</div>
                </div>
                <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
                  <div className="sl">Execution Status</div>
                  <div className="fw8">{progressLabel[selectedActivityProgress.executionStatus] || "ยังไม่ได้อัปเดต"}</div>
                </div>
                <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
                  <div className="sl">Achievement Result</div>
                  <div className="fw8">{progressLabel[selectedActivityProgress.achievementResult] || "ยังไม่ได้อัปเดต"}</div>
                </div>
              </div>
              {selectedActivityProgress.executionReason && (
                <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
                  <div className="sl">เหตุผลที่ไม่เป็นไปตามแผน</div>
                  <div className="fw8 fs13">{selectedActivityProgress.executionReason}</div>
                </div>
              )}
              {selectedActivityProgress.improvementPlan && (
                <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
                  <div className="sl">ควรพัฒนาต่อเพื่อ</div>
                  <div className="fw8 fs13">{selectedActivityProgress.improvementPlan}</div>
                </div>
              )}
              <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
                <div className="sl">หลักฐาน</div>
                <div className="fw8 fs13">
                  {selectedActivityProgress.evidenceNo || selectedActivityProgress.evidenceUrl || detailEvidenceNames(selectedActivity).length
                    ? [selectedActivityProgress.evidenceNo, selectedActivityProgress.evidenceUrl, ...detailEvidenceNames(selectedActivity)].filter(Boolean).join(" · ")
                    : "ยังไม่มีหลักฐาน"}
                </div>
              </div>
              <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12, background: "var(--yellow-bg)" }}>
                <div className="sl">Feedback / การรับรองจากหัวหน้า</div>
                <div className="fw8 fs13">{selectedActivityProgress.supervisorFeedback || "ยังไม่มี feedback จากหัวหน้า"}</div>
                {selectedActivityProgress.supervisorDecision && <div className="mt8"><span className={`b ${selectedActivityProgress.supervisorDecision === "approved" ? "bg" : "br"}`}>{selectedActivityProgress.supervisorDecision === "approved" ? "รับรองผลแล้ว" : "ส่งกลับแก้ไข"}</span></div>}
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedCompetency && (
        <div className="mo">
          <div className="mo-box" style={{ maxWidth: 960 }}>
            <div className="mo-h">
              <div style={{ minWidth: 0 }}>
                <div className="flex ic g8" style={{ flexWrap: "wrap" }}>
                  <span className={selectedCompetency.competency.tagClass}>{tagLabel(selectedCompetency.competency.type)}</span>
                  <div className="fw8">รายละเอียด IDP · {selectedCompetency.competency.code} · {selectedCompetency.competency.name}</div>
                </div>
                <div className="muted fs12 mt4">ข้อมูลแผน IDP ของสมรรถนะนี้และประวัติการอัปเดตความก้าวหน้าจากรอบปัจจุบัน</div>
              </div>
              <button className="btn btn-s btn-sm" onClick={() => setSelectedCompetencyCode(null)}>ปิด</button>
            </div>
            <div className="mo-b" style={{ display: "grid", gap: 14 }}>
              <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr) 120px 150px", gap: 10 }}>
                <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12, background: "var(--bg)" }}>
                  <div className="sl">สมรรถนะ</div>
                  <div className="fw8">{selectedCompetency.competency.code} · {selectedCompetency.competency.name}</div>
                </div>
                <div style={{ border: "1px solid #fecaca", borderRadius: 8, padding: 12, background: "var(--red-bg)" }}>
                  <div className="sl">Gap</div>
                  <div className="fw8" style={{ color: "var(--red)" }}>{fmt(selectedCompetency.gap)}</div>
                </div>
                <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12, background: "var(--bg)" }}>
                  <div className="sl">กิจกรรมในแผน</div>
                  <div className="fw8">{selectedCompetencyActivities.length} รายการ</div>
                </div>
              </div>

              <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ padding: "12px 14px", background: "var(--blue-lt)", borderBottom: "1px solid var(--border)" }}>
                  <div className="fw8">ข้อมูลการทำ IDP ของสมรรถนะนี้</div>
                  <div className="muted fs12 mt4">แสดงกิจกรรมทั้งหมดที่อยู่ในแผน IDP ของสมรรถนะนี้</div>
                </div>
                <div style={{ display: "grid" }}>
                  {selectedCompetencyActivities.map((activity, index) => {
                    const status = activityStatus(activity);
                    return (
                      <div key={activity.id} style={{ display: "grid", gridTemplateColumns: "44px minmax(0,1fr) 135px", gap: 12, padding: "12px 14px", borderTop: index ? "1px solid var(--border)" : "none", alignItems: "center" }}>
                        <div className="fw8 muted">#{index + 1}</div>
                        <div>
                          <div className="fw8 fs13">{activity.activityDetail}</div>
                          <div className="muted fs12 mt4">{activity.learningType} · น้ำหนัก {activity.learningWeight}% · {activity.startDate} ถึง {activity.endDate}</div>
                          <div className="muted fs12 mt4">KPI: {activity.kpi}</div>
                        </div>
                        <span className={`b ${status.className}`}>{status.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ padding: "12px 14px", background: "var(--green-bg)", borderBottom: "1px solid var(--border)" }}>
                  <div className="fw8">ประวัติการอัปเดตความก้าวหน้า</div>
                  <div className="muted fs12 mt4">ดึงจากข้อมูลที่บันทึกในหน้าอัปเดตความก้าวหน้า</div>
                </div>
                <div style={{ display: "grid" }}>
                  {selectedCompetencyActivities.map((activity, index) => {
                    const form = progressForms[activity.id] || {};
                    const status = activityStatus(activity);
                    return (
                      <div key={`${activity.id}-history`} style={{ display: "grid", gridTemplateColumns: "44px minmax(0,1fr) 135px", gap: 12, padding: "12px 14px", borderTop: index ? "1px solid var(--border)" : "none", alignItems: "start" }}>
                        <div className="fw8 muted">#{index + 1}</div>
                        <div>
                          <div className="fw8 fs13">{activity.activityDetail}</div>
                          <div className="muted fs12 mt4">Execution: {progressLabel[form.executionStatus] || "ยังไม่ได้อัปเดต"} · Achievement: {progressLabel[form.achievementResult] || "ยังไม่ได้อัปเดต"}</div>
                          <div className="muted fs12 mt4">หลักฐาน: {[form.evidenceNo, form.evidenceUrl, ...detailEvidenceNames(activity)].filter(Boolean).join(" · ") || "ยังไม่มีหลักฐาน"}</div>
                          {form.supervisorFeedback && <div className="muted fs12 mt4">Feedback: {form.supervisorFeedback}</div>}
                        </div>
                        <span className={`b ${status.className}`}>{status.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
