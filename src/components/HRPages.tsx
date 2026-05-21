import React from 'react';

export const HRCycle: React.FC = () => {
    const cycles = [
        { n: "รอบประเมิน 2568", y: 2568, s: "1 เม.ย. 68", se: "30 มิ.ย. 68", sup: "31 ก.ค. 68", sent: "189/247", act: true },
        { n: "รอบประเมิน 2567", y: 2567, s: "1 เม.ย. 67", se: "30 มิ.ย. 67", sup: "31 ก.ค. 67", sent: "240/240", act: false },
        { n: "รอบประเมิน 2566", y: 2566, s: "1 เม.ย. 66", se: "30 มิ.ย. 66", sup: "31 ก.ค. 66", sent: "235/235", act: false }
    ];

    return (
        <>
            <div className="flex ic jb mb20">
                <div>
                    <div className="sec-t">รอบการประเมิน 🗓️</div>
                    <div className="sec-s">เปิด-ปิดรอบ กำหนดช่วงเวลา ตรวจสอบสถานะ</div>
                </div>
                <button className="btn btn-p">+ เปิดรอบใหม่</button>
            </div>

            <div className="g3 mb14">
                <div className="sc">
                    <div className="sl">รอบที่กำลังเปิดอยู่</div>
                    <div className="sv tc">1</div>
                    <div className="ss muted">ปีงบประมาณ 2568</div>
                </div>
                <div className="sc">
                    <div className="sl">ส่งแบบประเมินแล้ว</div>
                    <div className="sv gcc">189<span style={{ fontSize: '14px', color: 'var(--text3)' }}>/247</span></div>
                    <div className="ss rc">⚠ เหลือ 58 คน</div>
                </div>
                <div className="sc">
                    <div className="sl">ส่ง IDP แล้ว</div>
                    <div className="sv bc">153<span style={{ fontSize: '14px', color: 'var(--text3)' }}>/247</span></div>
                    <div className="ss muted">62%</div>
                </div>
            </div>

            <div className="card mb14">
                <div className="ch"><div className="ct">รอบประเมินทั้งหมด</div></div>
                <table className="tbl">
                    <thead>
                        <tr>
                            <th>ชื่อรอบ (name)</th>
                            <th>ปี (year)</th>
                            <th>เปิด Self-assess</th>
                            <th>ปิด Supervisor</th>
                            <th>ส่งแล้ว</th>
                            <th>สถานะ</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {cycles.map((c, i) => (
                            <tr key={i}>
                                <td className="fw7">{c.n}</td>
                                <td className="muted">{c.y}</td>
                                <td className="muted fs12">{c.s} – {c.se}</td>
                                <td className="muted fs12">{c.sup}</td>
                                <td className={`fw6 ${c.act ? 'bc' : 'gcc'}`}>{c.sent}</td>
                                <td><span className={`b ${c.act ? 'bg' : 'bgr'}`}>{c.act ? 'เปิดอยู่' : 'ปิดแล้ว'}</span></td>
                                <td>
                                    <div className="flex g4">
                                        <button className="btn btn-s btn-xs">แก้ไข</button>
                                        {c.act && <button className="btn btn-r btn-xs">ปิดรอบ</button>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export const HRCatalog: React.FC<{ openModal: (type: string) => void }> = ({ openModal }) => {
    const catalog = [
        { n: "OJT / มอบหมายโครงการพิเศษ", t: "experiential", tc: "bo", prov: "หัวหน้างาน", cost: 0, act: true },
        { n: "Job Rotation", t: "experiential", tc: "bo", prov: "ฝ่ายงาน", cost: 0, act: true },
        { n: "Mentoring Program", t: "social", tc: "bg", prov: "ภายใน", cost: 0, act: true },
        { n: "Coaching by Supervisor", t: "social", tc: "bg", prov: "ผู้บังคับบัญชา", cost: 0, act: true },
        { n: "Peer Learning / Group Activity", t: "social", tc: "bg", prov: "ภายใน", cost: 0, act: true },
        { n: "อบรม AI & Data Analytics", t: "formal", tc: "bb", prov: "ศูนย์คอมพิวเตอร์", cost: 4500, act: true },
        { n: "Workshop การสื่อสาร", t: "formal", tc: "bb", prov: "ภายนอก", cost: 1500, act: true },
        { n: "e-Learning ภาษาอังกฤษ", t: "formal", tc: "bb", prov: "KKU Online", cost: 0, act: false }
    ];

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            alert(`นำเข้าไฟล์ "${file.name}" เรียบร้อยแล้ว! (Mock Import)`);
        }
    };

    return (
        <>
            <div className="flex ic jb mb20">
                <div>
                    <div className="sec-t">Learning Catalog 📚</div>
                    <div className="sec-s">ทะเบียนกิจกรรมพัฒนา 70:20:10 · บุคลากรเลือกกิจกรรมจาก Catalog นี้เมื่อทำ IDP</div>
                </div>
                <div className="flex" style={{ gap: "8px" }}>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        accept=".xlsx, .xls, .csv" 
                        onChange={handleFileChange} 
                    />
                    <button className="btn btn-s" onClick={handleImportClick}>📥 Import Excel</button>
                    <button className="btn btn-p" onClick={() => openModal("modal-catalog")}>+ เพิ่มกิจกรรม</button>
                </div>
            </div>

            <div className="g3 mb14">
                <div className="sc">
                    <div className="sl">70% Experiential</div>
                    <div className="sv" style={{ color: "var(--orange)" }}>14</div>
                    <div className="ss muted">กิจกรรม</div>
                </div>
                <div className="sc">
                    <div className="sl">20% Social Learning</div>
                    <div className="sv gcc">10</div>
                    <div className="ss muted">กิจกรรม</div>
                </div>
                <div className="sc">
                    <div className="sl">10% Formal Training</div>
                    <div className="sv bc">18</div>
                    <div className="ss muted">หลักสูตร</div>
                </div>
            </div>

            <div className="card">
                <table className="tbl">
                    <thead>
                        <tr>
                            <th>ชื่อกิจกรรม (name)</th>
                            <th>ประเภท (method_type)</th>
                            <th>ผู้จัด (provider)</th>
                            <th>ค่าใช้จ่าย (cost)</th>
                            <th>สถานะ (is_active)</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {catalog.map((c, i) => (
                            <tr key={i}>
                                <td className="fw6 fs13">{c.n}</td>
                                <td>
                                    <span className={`b ${c.tc}`}>
                                        {c.t === 'experiential' ? '70% Experiential' : c.t === 'social' ? '20% Social' : '10% Formal'}
                                    </span>
                                </td>
                                <td className="muted fs12">{c.prov}</td>
                                <td className="muted fs12">{c.cost === 0 ? 'ฟรี' : c.cost.toLocaleString() + ' ฿'}</td>
                                <td><span className={`b ${c.act ? 'bg' : 'bgr'}`}>{c.act ? 'เปิดใช้' : 'ปิด'}</span></td>
                                <td><div className="flex g4"><button className="btn btn-s btn-xs">แก้ไข</button></div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export const HRMonitor: React.FC = () => {
    const deptStats = [
        { d: "สำนักงานคณะฯ", tot: 45, ass: 41, idp: 38, p: 91 },
        { d: "ฝ่ายแผนยุทธศาสตร์ฯ", tot: 32, ass: 28, idp: 25, p: 88 },
        { d: "ฝ่ายการศึกษาฯ", tot: 28, ass: 18, idp: 14, p: 64 },
        { d: "ฝ่ายวิจัยฯ", tot: 24, ass: 12, idp: 10, p: 50 },
        { d: "ฝ่ายบริหาร", tot: 20, ass: 20, idp: 20, p: 100 }
    ];

    const topNeeds = [
        { n: "AI Literacy", c: 89 },
        { n: "การวิเคราะห์ข้อมูล", c: 72 },
        { n: "ภาษาอังกฤษ", c: 58 },
        { n: "การจัดการโครงการ", c: 45 },
        { n: "การสื่อสาร", c: 38 }
    ];

    return (
        <>
            <div className="mb20">
                <div className="sec-t">ติดตามภาพรวม 📡</div>
                <div className="sec-s">คณะวิศวกรรมศาสตร์ · รอบประเมิน 2568</div>
            </div>

            <div className="g4 mb14">
                <div className="sc">
                    <div className="sl">บุคลากรทั้งหมด</div>
                    <div className="sv">247</div>
                    <div className="ss muted">วิชาการ 148 · สนับสนุน 99</div>
                </div>
                <div className="sc">
                    <div className="sl">ส่งแบบประเมินแล้ว</div>
                    <div className="sv gcc">189<span style={{ fontSize: '14px', color: 'var(--text3)' }}>/247</span></div>
                    <div className="ss rc">เหลือ 58 คน</div>
                </div>
                <div className="sc">
                    <div className="sl">IDP อนุมัติแล้ว</div>
                    <div className="sv bc">153</div>
                    <div className="ss muted">62%</div>
                </div>
                <div className="sc">
                    <div className="sl">IDP รออนุมัติ</div>
                    <div className="sv yc">14</div>
                    <div className="ss muted">รอ Supervisor</div>
                </div>
            </div>

            <div className="g2 mb14">
                <div className="card">
                    <div className="ch"><div className="ct">สถานะรายหน่วยงาน</div></div>
                    <div className="cb" style={{ paddingTop: '10px' }}>
                        {deptStats.map((d, i) => (
                            <div key={i} style={{ marginBottom: '12px' }}>
                                <div className="flex ic jb mb4">
                                    <span className="fs12 fw6">{d.d}</span>
                                    <span className="muted fs11">ประเมิน {d.ass}/{d.tot} · IDP {d.idp}/{d.tot}</span>
                                </div>
                                <div className="pw" style={{ height: '7px' }}>
                                    <div className="pb" style={{ width: `${d.p}%`, background: d.p >= 80 ? 'var(--green)' : d.p >= 60 ? 'var(--blue)' : 'var(--yellow)' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="ch"><div className="ct">Top 5 Training Need (TNA)</div></div>
                    <div className="cb">
                        {topNeeds.map((n, i) => (
                            <div key={i} className="flex ic g8 mb12">
                                <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "var(--navy)", color: "#fff", fontSize: "10px", fontWeight: 800, display: "flex", alignItems: "center", justifyCenter: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
                                <div style={{ flex: 1 }}>
                                    <div className="fw6 fs12 mb4">{n.n}</div>
                                    <div className="pw" style={{ height: '5px' }}>
                                        <div className="pb" style={{ width: `${n.c}%`, background: 'var(--red)' }}></div>
                                    </div>
                                </div>
                                <span className="fs12 fw8 rc" style={{ width: "28px", textAlign: "right" }}>{n.c}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export const HRTemplate: React.FC = () => {
    const templates = [
        { n: "การบริการที่ดี", t: "CC", tg: "tag-cc", lv: 3 },
        { n: "การมุ่งผลสัมฤทธิ์", t: "CC", tg: "tag-cc", lv: 3 },
        { n: "AI Literacy", t: "CC", tg: "tag-cc", lv: 3 },
        { n: "การใช้เทคโนโลยีดิจิทัล", t: "FC", tg: "tag-fc", lv: 3 },
        { n: "การวิเคราะห์ข้อมูล", t: "FC", tg: "tag-fc", lv: 2 },
        { n: "การสื่อสาร", t: "FC", tg: "tag-fc", lv: 3 }
    ];

    return (
        <>
            <div className="flex ic jb mb20">
                <div>
                    <div className="sec-t">แบบประเมิน & Expected Level 📋</div>
                    <div className="sec-s">กำหนดว่า workline + position + level ไหน ต้องประเมินสมรรถนะอะไร ระดับคาดหวังเท่าใด</div>
                </div>
                <button className="btn btn-p">+ เพิ่มการกำหนด</button>
            </div>

            <div className="g2 mb14">
                <div className="card">
                    <div className="ch"><div className="ct">กรองดูตามประเภทบุคลากร</div></div>
                    <div className="cb">
                        <div className="fg">
                            <label className="lbl">สายงาน (workline)</label>
                            <select className="sel"><option>สายสนับสนุน</option><option>สายวิชาการ</option></select>
                        </div>
                        <div className="fg">
                            <label className="lbl">ตำแหน่ง (position)</label>
                            <select className="sel"><option>นักวิชาการศึกษา</option><option>เจ้าหน้าที่บริหาร</option></select>
                        </div>
                        <div className="fg">
                            <label className="lbl">ระดับ (level)</label>
                            <select className="sel"><option>ระดับ 3</option><option>ระดับ 5</option></select>
                        </div>
                        <button className="btn btn-p btn-sm">🔍 ดูแบบประเมิน</button>
                    </div>
                </div>

                <div className="card">
                    <div className="ch">
                        <div>
                            <div className="ct">สายสนับสนุน · นักวิชาการศึกษา · ระดับ 5</div>
                            <div className="cs">กำลังแสดง: hr_expectations รอบ 2568</div>
                        </div>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                        <table className="tbl">
                            <thead>
                                <tr>
                                    <th>สมรรถนะ</th>
                                    <th>ประเภท</th>
                                    <th>Exp. Lv.</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {templates.map((t, i) => (
                                    <tr key={i}>
                                        <td className="fw6">{t.n}</td>
                                        <td><span className={t.tg}>{t.t}</span></td>
                                        <td>
                                            <div className="lg" style={{ gap: "4px", margin: 0 }}>
                                                {[1, 2, 3, 4, 5].map(lv => (
                                                    <div key={lv} className={`lbtn${lv === t.lv ? ' sel' : ''}`} style={{ padding: '4px 2px' }}>
                                                        <span className="lnum" style={{ fontSize: '14px' }}>{lv}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td><button className="btn btn-r btn-xs">ลบ</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ padding: '12px 16px', background: 'var(--bg)', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
                        <button className="btn btn-p btn-sm">+ เพิ่มสมรรถนะ</button>
                        <button className="btn btn-t btn-sm">💾 บันทึก Expected Level</button>
                    </div>
                </div>
            </div>
        </>
    );
};
