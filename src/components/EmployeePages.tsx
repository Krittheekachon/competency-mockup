import React, { useState } from 'react';
import { IDP_GAPS_DATA, IDP_ACTIVITIES_DATA } from '../data';

// ==========================================
// 1. COMPONENT: EmployeeAssess (ประเมินตนเอง)
// ==========================================
export const EmployeeAssess: React.FC<{ user: any, setUsers: any }> = ({ user, setUsers }) => {
    const [expanded, setExpanded] = useState<number | null>(null);
    const [scores, setScores] = useState<any>({ 0: 3, 1: 4, 2: 2, 3: 3, 4: 2 });

    const submitEval = () => {
        setUsers((prev: any[]) => prev.map(u => u.sso === user.sso ? { ...u, evalStatus: 'self_submitted' } : u));
        alert("ส่งแบบประเมินให้หัวหน้าสำเร็จ!\nสถานะเปลี่ยนเป็น self_submitted");
    };

    const sections = {
        CC: [
            {
                cd: "CC-001",
                n: "การบริการที่ดี",
                levels: {
                    1: ["รับเรื่องและตอบคำถามพื้นฐานตามแนวทางที่กำหนด", "แสดงมารยาทที่เหมาะสมต่อผู้รับบริการ", "ส่งต่อเรื่องที่เกินขอบเขตให้ผู้เกี่ยวข้อง"],
                    2: ["ตอบสนองความต้องการผู้รับบริการได้ทันท่วงที", "ให้ข้อมูลที่ถูกต้องและครบถ้วนแก่ผู้รับบริการ", "แสดงความเป็นมิตร ยิ้มแย้ม ให้บริการด้วยใจ"],
                    3: ["ติดตามผลจนผู้รับบริการได้รับคำตอบ", "ปรับวิธีสื่อสารให้เหมาะกับสถานการณ์", "ประสานงานเพื่อแก้ปัญหาบริการที่ซับซ้อนขึ้น"],
                    4: ["คาดการณ์ปัญหาบริการและป้องกันล่วงหน้า", "ปรับปรุงขั้นตอนบริการให้ลดความผิดพลาดซ้ำ", "เป็นที่ปรึกษาให้เพื่อนร่วมงานด้านการบริการ"],
                    5: ["กำหนดมาตรฐานบริการที่ยกระดับประสบการณ์ผู้รับบริการ", "ใช้ข้อเสนอแนะเพื่อพัฒนาระบบบริการทั้งหน่วยงาน", "สร้างวัฒนธรรมบริการที่ดีอย่างต่อเนื่อง"]
                }
            },
            {
                cd: "CC-003",
                n: "การทำงานเป็นทีม",
                levels: {
                    1: ["รับผิดชอบงานของตนในทีมตามที่ได้รับมอบหมาย", "รับฟังข้อมูลพื้นฐานจากสมาชิกทีม", "แจ้งปัญหาที่กระทบงานทีมได้"],
                    2: ["แบ่งปันข้อมูลและทรัพยากรกับทีมอย่างเต็มที่", "รับฟังความคิดเห็นผู้อื่นด้วยใจเปิดกว้าง", "ช่วยเหลือเพื่อนร่วมงานเมื่อมีปัญหา"],
                    3: ["ประสานงานให้สมาชิกทำงานร่วมกันได้ต่อเนื่อง", "จัดการความเห็นต่างด้วยเหตุผล", "สนับสนุนให้ทีมส่งมอบงานตามเป้าหมาย"],
                    4: ["เชื่อมทีมข้ามหน่วยเพื่อแก้ปัญหาร่วมกัน", "สร้างบรรยากาศที่สมาชิกกล้าแลกเปลี่ยน", "โค้ชสมาชิกให้ทำงานร่วมกันได้มีประสิทธิภาพ"],
                    5: ["ออกแบบรูปแบบความร่วมมือที่ทีมอื่นนำไปใช้ได้", "ขับเคลื่อนทีมผ่านสถานการณ์ซับซ้อน", "สร้างเครือข่ายความร่วมมือระยะยาว"]
                }
            },
            {
                cd: "CC-004",
                n: "จริยธรรมและความซื่อสัตย์",
                levels: {
                    1: ["ปฏิบัติตามกฎ ระเบียบ และคำแนะนำที่เกี่ยวข้อง", "หลีกเลี่ยงการใช้ข้อมูลโดยไม่เหมาะสม", "รายงานข้อผิดพลาดของตนตามจริง"],
                    2: ["ปฏิบัติงานด้วยความซื่อสัตย์สุจริต", "รักษาความลับขององค์กรได้เป็นอย่างดี", "ยึดมั่นในหลักจริยธรรมวิชาชีพ"],
                    3: ["ตัดสินใจโดยคำนึงถึงผลกระทบทางจริยธรรม", "ชี้แจงข้อมูลอย่างโปร่งใสตรวจสอบได้", "เตือนหรือแนะนำเพื่อนร่วมงานเมื่อพบความเสี่ยง"],
                    4: ["จัดการประเด็นจริยธรรมที่ซับซ้อนด้วยความรอบคอบ", "ส่งเสริมระบบงานที่โปร่งใสและลดผลประโยชน์ทับซ้อน", "เป็นแบบอย่างด้านความรับผิดชอบ"],
                    5: ["วางแนวปฏิบัติด้านจริยธรรมให้หน่วยงาน", "สร้างความเชื่อมั่นต่อผู้มีส่วนได้ส่วนเสีย", "ขับเคลื่อนวัฒนธรรมความซื่อสัตย์อย่างยั่งยืน"]
                }
            }
        ],
        MC: [],
        FC: [
            {
                cd: "FC2-061",
                n: "การใช้เทคโนโลยีดิจิทัล",
                levels: {
                    1: ["ใช้เครื่องมือดิจิทัลพื้นฐานตามขั้นตอน", "จัดเก็บไฟล์งานให้ค้นหาได้", "ขอความช่วยเหลือเมื่อพบปัญหาการใช้งาน"],
                    2: ["ใช้โปรแกรมสำนักงานได้คล่องแคล่ว", "เลือกเครื่องมือดิจิทัลที่เหมาะกับงานประจำ", "รักษาความปลอดภัยข้อมูลพื้นฐานได้"],
                    3: ["ใช้เครื่องมือดิจิทัลช่วยวิเคราะห์และติดตามงาน", "ประยุกต์ใช้ระบบร่วมงานออนไลน์ได้", "ใช้ AI เบื้องต้นเพื่อเพิ่มประสิทธิภาพงานอย่างเหมาะสม"],
                    4: ["ปรับปรุงกระบวนการงานด้วยเทคโนโลยี", "แนะนำเครื่องมือดิจิทัลให้ทีมใช้งานร่วมกัน", "ประเมินความเสี่ยงข้อมูลจากการใช้เครื่องมือใหม่"],
                    5: ["ออกแบบแนวทางดิจิทัลที่สร้างผลลัพธ์ระดับหน่วยงาน", "ผลักดันการใช้เทคโนโลยีอย่างมีธรรมาภิบาล", "ติดตามแนวโน้มเทคโนโลยีเพื่อยกระดับงาน"]
                }
            },
            {
                cd: "FC2-062",
                n: "การวิเคราะห์ข้อมูล",
                levels: {
                    1: ["รวบรวมข้อมูลจากแหล่งที่กำหนดได้", "ตรวจสอบข้อมูลเบื้องต้นตามแบบฟอร์ม", "สรุปข้อเท็จจริงง่าย ๆ จากข้อมูลที่มี"],
                    2: ["จัดหมวดหมู่และตรวจความครบถ้วนของข้อมูล", "เปรียบเทียบข้อมูลพื้นฐานเพื่อหาความต่าง", "สร้างตารางหรือกราฟพื้นฐานประกอบรายงาน"],
                    3: ["วิเคราะห์ข้อมูลอย่างเป็นระบบตามโจทย์งาน", "นำเสนอข้อมูลในรูปแบบที่เข้าใจง่าย", "ใช้ข้อมูลสนับสนุนการตัดสินใจและแก้ปัญหา"],
                    4: ["วิเคราะห์ข้อมูลหลายมิติและตรวจความน่าเชื่อถือ", "อธิบายแนวโน้มและปัจจัยที่เกี่ยวข้อง", "เสนอทางเลือกจากผลวิเคราะห์ให้ผู้เกี่ยวข้อง"],
                    5: ["ออกแบบกรอบวิเคราะห์ข้อมูลให้ทีมใช้ร่วมกัน", "คาดการณ์ผลกระทบจากข้อมูลเชิงลึก", "พัฒนาการใช้ข้อมูลเพื่อยกระดับการตัดสินใจ"]
                }
            }
        ]
    };

    const typeConfig: any = {
        CC: { label: "CC — Core Competency", tag: "tag-cc", tagLabel: "CC", color: "#1E40AF" },
        MC: { label: "MC — Managerial Competency", tag: "tag-mc", tagLabel: "MC", color: "#6D28D9" },
        FC: { label: "FC — Functional Competency", tag: "tag-fc", tagLabel: "FC", color: "#065f46" }
    };

    let itemCounter = 0;
    const scoreLabels = ["ต่ำมาก", "ต่ำ", "พอใช้", "ดี", "ดีมาก"];
    const getBehaviors = (item: any, score?: number) => {
        if (!score) return [];
        return item.levels[score as keyof typeof item.levels] || [];
    };

    return (
        <>
            <div className="flex ic jb mb20">
                <div>
                    <div className="sec-t">ประเมินตนเอง 📋</div>
                    <div className="sec-s">รอบปี 2568 · กรอกให้ครบทุกสมรรถนะแล้วกด "ส่งให้หัวหน้า"</div>
                </div>
                <span className="b by">draft</span>
            </div>

            <div style={{ background: "var(--yellow-bg)", border: "1px solid #FDE68A", borderRadius: "var(--r)", padding: "10px 14px", marginBottom: "20px", fontSize: "12px", color: "var(--yellow)" }}>
                ⚠ กรุณาเลือกคะแนนที่ตรงกับความสามารถที่คุณทำได้จริง อ้างอิงพฤติกรรมบ่งชี้ด้านล่าง
            </div>

            {Object.entries(sections).map(([type, items]) => {
                if (!items || items.length === 0) return null;
                const config = typeConfig[type];
                return (
                    <div key={type} style={{ marginBottom: "24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", paddingBottom: "8px", borderBottom: "2px solid var(--border)" }}>
                            <span style={{ background: config.color, color: "#fff", padding: "3px 10px", borderRadius: "5px", fontSize: "11px", fontWeight: 800, letterSpacing: ".05em" }}>{config.tagLabel}</span>
                            <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>{config.label}</span>
                            <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--text3)" }}>{items.filter((_, i) => scores[itemCounter + i]).length}/{items.length} กรอกแล้ว</span>
                        </div>
                        {items.map((it, idx) => {
                            const curIdx = itemCounter++;
                            const score = scores[curIdx];
                            return (
                                <div key={it.cd} className="ac" style={{ marginBottom: "8px" }}>
                                    <div className="ah" onClick={() => setExpanded(expanded === curIdx ? null : curIdx)} style={{ background: '#fff' }}>
                                        <span className={config.tag} style={{ flexShrink: 0 }}>{config.tagLabel}</span>
                                        <span className="fw7 fs13" style={{ flex: 1, marginLeft: "2px" }}>{it.n}</span>
                                        <span style={{ fontSize: "12px", fontWeight: 700, color: score ? "var(--teal)" : "var(--red)" }}>
                                            {score ? score + " / 5 ✓" : "ยังไม่กรอก"}
                                        </span>
                                        <span style={{ marginLeft: "10px", color: "var(--text3)", fontSize: "12px" }}>{expanded === curIdx ? "▴" : "▾"}</span>
                                    </div>
                                    <div className={`ab ${expanded === curIdx ? "open" : ""}`}>
                                        <div style={{ marginBottom: "14px" }}>
                                            <div className="lbl mb6" style={{ fontSize: "11px" }}>พฤติกรรมบ่งชี้ (ใช้ประกอบการตัดสิน)</div>
                                            {score ? (
                                                <>
                                                    <div className="fs11" style={{ padding: "8px 10px", borderRadius: "8px", background: "var(--blue-lt)", color: "var(--blue)", marginBottom: "8px" }}>
                                                        ระดับ {score}: {scoreLabels[score - 1]}
                                                    </div>
                                                    <ul className="blist">
                                                        {getBehaviors(it, score).map((b, i) => <li key={i}>{b}</li>)}
                                                    </ul>
                                                </>
                                            ) : (
                                                <div className="muted fs12">เลือกคะแนนความสามารถเพื่อดูพฤติกรรมบ่งชี้ของระดับนั้น</div>
                                            )}
                                        </div>
                                        <div className="lbl mb8">คะแนนความสามารถของคุณ <span style={{ color: "var(--red)" }}>*</span></div>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px", marginBottom: "14px" }}>
                                            {[1, 2, 3, 4, 5].map(k => (
                                                <div key={k} onClick={() => setScores({ ...scores, [curIdx]: k })} style={{ border: `2px solid ${score === k ? "var(--teal)" : "var(--border)"}`, borderRadius: "10px", padding: "14px 8px", cursor: "pointer", background: score === k ? "var(--teal-lt)" : "#fff", transition: ".15s", textAlign: "center" }}>
                                                    <div style={{ fontSize: "26px", fontWeight: 800, color: score === k ? "var(--teal)" : "var(--navy)", lineHeight: 1 }}>{k}</div>
                                                    <div style={{ fontSize: "10px", color: "var(--text3)", marginTop: "4px" }}>{scoreLabels[k - 1]}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="divider" />
                                        <div className="lbl mb8" style={{ fontSize: '11px' }}>แนบหลักฐานประกอบ <span className="lbl-opt">(ถ้ามี)</span></div>
                                        <div className="g2">
                                            <div className="upload-area" style={{ padding: '12px' }}>
                                                <div style={{ fontSize: '18px', marginBottom: '4px' }}>📎</div>
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
                                                    <textarea className="ta" style={{ minHeight: '48px', fontSize: '12px' }} placeholder="อธิบายสั้นๆ..." />
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
                <button className="btn btn-t" onClick={submitEval}>📤 ส่งให้หัวหน้า</button>
                <button className="btn btn-s">💾 บันทึกร่าง</button>
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
                    <div className="sec-t">สรุปผลสมรรถนะ 📊</div>
                    <div className="sec-s">ยืนยันโดย รศ.ดร.วิไล ใจดี · 5 พ.ค. 2568 · สถานะ: approved</div>
                </div>
                <button className="btn btn-s">📥 Export PDF</button>
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
                            <td style={{ textAlign: 'center' }}>{diff >= 0 ? "✓" : "✖"}</td>
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
                        <div className="ct">⚠ สมรรถนะที่ต้องทำ IDP</div>
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
                            <span className={`b ${g.pri === 'high' ? 'br' : 'by'}`}>เป้าหมาย: Level {g.exp} (ปัจจุบัน {g.sup})</span>
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
export const EmployeeIDP: React.FC = () => {
    const [gaps, setGaps] = useState(IDP_GAPS_DATA);
    const [activeGapIdx, setActiveGapIdx] = useState<number | null>(null);

    const methods = [
        { key: "experiential", label: "Experiential Learning", color: "var(--orange)", desc: "การเรียนรู้ผ่านประสบการณ์จากการทำงานจริง เช่น OJT โครงการพิเศษ หรือ Job Rotation" },
        { key: "social", label: "Social Learning", color: "var(--green)", desc: "การเรียนรู้ผ่านบุคคลอื่น การปฏิสัมพันธ์ แลกเปลี่ยนความคิดเห็น ประสบการณ์ร่วมกัน หรือการมีผู้คอยให้คำแนะนำ" },
        { key: "formal", label: "Formal Learning", color: "var(--blue)", desc: "การเรียนรูอย่างเป็นทางการ มีแบบแผน หรือการเรียนในห้องเรียน" }
    ];

    return (
        <>
            <div className="flex ic jb mb20">
                <div>
                    <div className="sec-t">แผนพัฒนา IDP 📝</div>
                    <div className="sec-s">ดึงข้อมูลสมรรถนะที่ต้องการพัฒนาอัตโนมัติ · ปีงบประมาณ 2568 · Status: draft</div>
                </div>
                <button className="btn btn-s">📥 Export PDF</button>
            </div>

            <div className="card mb20">
                <div className="ch"><div className="ct">รูปแบบการเรียนรู้ที่นำไปใช้ได้</div></div>
                <div className="cb" style={{ paddingTop: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {methods.map(m => (
                            <div key={m.key} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderLeft: `3px solid ${m.color}`, borderRadius: "var(--r)", padding: "11px 14px" }}>
                                <div className="fw7 fs12" style={{ color: m.color, marginBottom: "4px" }}>{m.label}</div>
                                <div className="fs12 muted">{m.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {gaps.map((g, idx) => {
                const status = g.status === 'submitted' ? { badge: '📤 ส่งแล้ว · รออนุมัติ', cls: 'by' } : g.status === 'rejected' ? { badge: '❌ ไม่ผ่าน', cls: 'br' } : { badge: '', cls: '' };
                const activities = IDP_ACTIVITIES_DATA[g.cd] || [];
                return (
                    <div key={g.cd} className="idp-gap" style={{ marginBottom: '20px' }}>
                        <div className="idp-gap-h" style={{ padding: '14px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, flexWrap: 'wrap' }}>
                                <span className={`b ${g.pri === 'high' ? 'br' : 'by'}`}>{g.pri === 'high' ? 'เร่งด่วน' : 'ต้องพัฒนา'}</span>
                                <span className={g.t === 'CC' ? 'tag-cc' : g.t === 'MC' ? 'tag-mc' : g.t === 'FC1' ? 'tag-fc1' : g.t === 'FC2' ? 'tag-fc2' : 'tag-fc'}>{g.t}</span>
                                <span className="fw8 fs14">{g.n}</span>
                                <span className="muted fs12" style={{ marginLeft: "4px" }}>คาดหวัง {g.exp} · ปัจจุบัน {g.actual}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {g.status === 'draft' ? (
                                    <button className="btn btn-t btn-sm" onClick={() => alert("ส่ง IDP สำเร็จ!")}>📤 ส่งให้หัวหน้า</button>
                                ) : (
                                    <span className={`b ${status.cls}`}>{status.badge}</span>
                                )}
                            </div>
                        </div>

                        {g.status === 'rejected' && (
                            <div style={{ background: '#FEF2F2', borderBottom: '1px solid #FECACA', padding: '12px 18px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                                <div style={{ fontSize: '20px', flexShrink: 0 }}>❌</div>
                                <div style={{ flex: 1 }}>
                                    <div className="fw7 fs13" style={{ color: 'var(--red)', marginBottom: '3px' }}>แผนนี้ไม่ผ่านการอนุมัติ</div>
                                    <div className="fs12" style={{ color: '#991B1B', marginBottom: '6px' }}>
                                        <span className="fw6">{g.rejectedBy}</span> · {g.rejectedDate}
                                    </div>
                                    <div className="fs12" style={{ background: '#fff', border: '1px solid #FECACA', borderRadius: '6px', padding: '8px 10px', color: 'var(--text2)' }}>
                                        "{g.rejectComment}"
                                    </div>
                                </div>
                                <button className="btn btn-r btn-sm" style={{ flexShrink: 0 }}>✏️ แก้ไขแผน</button>
                            </div>
                        )}

                        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--blue-md)', background: '#fff' }}>
                            <label className="lbl">เป้าหมายการพัฒนา <span style={{ color: "var(--red)" }}>*</span></label>
                            <textarea className="ta" style={{ minHeight: '52px', marginTop: '5px' }} placeholder="ระบุเป้าหมายการพัฒนา..." />
                        </div>

                        <div style={{ background: '#fff' }}>
                            {activities.map((act, aIdx) => (
                                <div key={aIdx} style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--blue)', flexShrink: 0 }}></div>
                                    <div style={{ flex: 1 }}>
                                        <div className="fw6 fs13">{act.t}</div>
                                        <div className="muted fs11">{act.m} · ครบ {act.due}</div>
                                    </div>
                                    <span className={`b ${act.stC}`}>{act.st}</span>
                                </div>
                            ))}
                            {activities.length === 0 && (
                                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text3)', fontSize: '13px', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '28px', marginBottom: "8px" }}>📋</div>
                                    <div className="fw6 fs13" style={{ color: 'var(--text2)' }}>ยังไม่มีกิจกรรมพัฒนา</div>
                                </div>
                            )}
                        </div>
                        <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', background: '#fff' }}>
                            <button className="btn btn-s btn-sm" onClick={() => setActiveGapIdx(idx)}>+ เพิ่มกิจกรรม</button>
                        </div>
                    </div>
                );
            })}

            <div className="flex g8 mt4" style={{ paddingTop: '4px' }}>
                <button className="btn btn-t" onClick={() => alert("ส่ง IDP ทั้งหมดเรียบร้อยแล้ว")}>📤 ส่ง IDP ทั้งหมด</button>
                <button className="btn btn-s">💾 บันทึกร่าง</button>
            </div>
        </>
    );
};

// ==========================================
// 4. COMPONENT: EmployeeProgress (อัปเดตความก้าวหน้า)
// ==========================================
export const EmployeeProgress: React.FC = () => {
    const list = IDP_GAPS_DATA.map(g => ({ g, acts: IDP_ACTIVITIES_DATA[g.cd] || [] }));

    return (
        <>
            <div className="mb20">
                <div className="sec-t">อัปเดตความก้าวหน้า 🔄</div>
                <div className="sec-s">บันทึกผลการพัฒนา · แนบหลักฐาน · อัปเดตสถานะกิจกรรม IDP</div>
            </div>

            {list.map(({ g, acts }, idx) => {
                const hasFailed = acts.some(a => a.result === 'failed');
                return (
                    <div key={g.cd} style={{ marginBottom: "24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", padding: "10px 14px", background: hasFailed ? "#FEF2F2" : "var(--blue-lt)", border: `1px solid ${hasFailed ? "#FECACA" : "var(--blue-md)"}`, borderLeft: `4px solid ${hasFailed ? "var(--red)" : "var(--blue)"}`, borderRadius: "var(--r-lg)" }}>
                            {hasFailed && <span style={{ fontSize: '16px', flexShrink: 0 }}>❌</span>}
                            <span className={g.t === 'CC' ? 'tag-cc' : g.t === 'MC' ? 'tag-mc' : g.t === 'FC1' ? 'tag-fc1' : g.t === 'FC2' ? 'tag-fc2' : 'tag-fc'}>{g.t}</span>
                            <span className="fw7 fs13" style={{ color: hasFailed ? 'var(--red)' : 'inherit' }}>{g.n}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                                {hasFailed && <span className="b br">⚠ มีกิจกรรมไม่ผ่าน</span>}
                                <span className={`b ${g.pri === 'high' ? 'br' : 'by'}`}>{g.pri === 'high' ? 'เร่งด่วน' : 'ต้องพัฒนา'}</span>
                            </div>
                        </div>

                        {acts.map((act, aIdx) => (
                            <div key={aIdx} className="card mb10">
                                <div className="ch">
                                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: act.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>{act.ic}</div>
                                    <div style={{ flex: 1, marginLeft: "10px" }}>
                                        <div className="fw7 fs13">{act.t}</div>
                                        <div className="muted fs12 mt4">{act.m} · ครบ {act.due}</div>
                                    </div>
                                    <span className={`b ${act.stC}`}>{act.st}</span>
                                </div>
                                {act.result === 'failed' && (
                                    <div style={{ background: '#FEF2F2', borderTop: '1px solid #FECACA', borderBottom: '1px solid #FECACA', padding: '12px 18px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                                        <div style={{ fontSize: '20px', flexShrink: 0 }}>❌</div>
                                        <div style={{ flex: 1 }}>
                                            <div className="fw7 fs13" style={{ color: 'var(--red)', marginBottom: '2px' }}>กิจกรรมนี้ไม่ผ่าน</div>
                                            <div className="fs12" style={{ color: '#991B1B', marginBottom: '6px' }}>
                                                <span className="fw6">{act.rejectedBy}</span> · {act.rejectedDate}
                                            </div>
                                            <div className="fs12" style={{ background: '#fff', border: '1px solid #FECACA', borderRadius: '6px', padding: '8px 10px', color: 'var(--text2)', marginBottom: '10px' }}>
                                                "{act.rejectComment}"
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="cb" style={{ paddingTop: '10px' }}>
                                    {act.result !== 'failed' && (
                                        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '12px', marginBottom: '12px' }}>
                                            <div className="fw7 fs12 mb8">บันทึกความก้าวหน้าใหม่</div>
                                            <div className="fg mb8">
                                                <label className="lbl" style={{ fontWeight: 500, fontSize: '11px' }}>บันทึก</label>
                                                <textarea className="ta" style={{ minHeight: '52px', fontSize: '12px' }} placeholder="สรุปสิ่งที่ทำ ผลที่ได้รับ..." />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                                                <button className="btn btn-s btn-sm">💾 ร่าง</button>
                                                <button className="btn btn-t btn-sm">✔ บันทึก</button>
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
                        ))}
                    </div>
                );
            })}
        </>
    );
};
