import React, { useState } from 'react';

interface AdminOrgStructureProps {
  academicDepts: string[];
  setAcademicDepts: React.Dispatch<React.SetStateAction<string[]>>;
  supportDepts: string[];
  supportPositionGroups: Record<string, string[]>;
  setSupportPositionGroups: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  adminDepts: string[];
  setAdminDepts: React.Dispatch<React.SetStateAction<string[]>>;
  supportOrg: any;
  setSupportOrg: React.Dispatch<React.SetStateAction<any>>;
  academicPos: string[];
  setAcademicPos: React.Dispatch<React.SetStateAction<string[]>>;
  supportPos: string[];
  setSupportPos: React.Dispatch<React.SetStateAction<string[]>>;
  adminPos: string[];
  setAdminPos: React.Dispatch<React.SetStateAction<string[]>>;
  academicRank: string[];
  setAcademicRank: React.Dispatch<React.SetStateAction<string[]>>;
  supportRank: string[];
  setSupportRank: React.Dispatch<React.SetStateAction<string[]>>;
  adminRank: string[];
  setAdminRank: React.Dispatch<React.SetStateAction<string[]>>;
  worklines: string[];
  setWorklines: React.Dispatch<React.SetStateAction<string[]>>;
  competencyTypes: string[];
  setCompetencyTypes: React.Dispatch<React.SetStateAction<string[]>>;
}

const AdminOrgStructure: React.FC<AdminOrgStructureProps> = ({ 
  academicDepts, setAcademicDepts, 
  supportDepts, supportPositionGroups, setSupportPositionGroups,
  adminDepts, setAdminDepts, 
  supportOrg, setSupportOrg,
  academicPos, setAcademicPos,
  supportPos, setSupportPos,
  adminPos, setAdminPos,
  academicRank, setAcademicRank,
  supportRank, setSupportRank,
  adminRank, setAdminRank,
  worklines, setWorklines,
  competencyTypes, setCompetencyTypes
}) => {
  const [activeTab, setActiveTab] = useState("workline");
  const [editingItem, setEditingId] = useState<any>(null);
  const [newValue, setNewValue] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedSupportGroups, setExpandedSupportGroups] = useState<Record<string, boolean>>({});
  const [showAllSupportGroups, setShowAllSupportGroups] = useState(false);
  const [addItemData, setAddItemData] = useState({
    category: "workline",
    type: "1",
    name: "",
    parent: "",
    grandparent: ""
  });

  const startEdit = (type: string, oldName: string, extras?: any) => {
    setEditingId({ type, oldName, ...extras });
    setNewValue(oldName);
  };

  const saveEdit = () => {
    if (!newValue.trim()) return;
    const { type, oldName, parent, workName } = editingItem;
    switch (type) {
      case "academic-dept": setAcademicDepts(academicDepts.map(v => v === oldName ? newValue : v)); break;
      case "admin-dept": setAdminDepts(adminDepts.map(v => v === oldName ? newValue : v)); break;
      case "support-dept": {
        const nextSupportPositionGroups = { ...supportPositionGroups };
        nextSupportPositionGroups[newValue] = nextSupportPositionGroups[oldName] || [];
        delete nextSupportPositionGroups[oldName];
        setSupportPositionGroups(nextSupportPositionGroups);
        break;
      }
      case "support-group-pos":
        setSupportPositionGroups({
          ...supportPositionGroups,
          [parent]: (supportPositionGroups[parent] || []).map(v => v === oldName ? newValue : v)
        });
        break;
      case "support-work": {
        const nextSupportOrg = { ...supportOrg };
        if (parent && nextSupportOrg[parent]) {
          nextSupportOrg[parent] = nextSupportOrg[parent].map((w: any) => w.work === oldName ? { ...w, work: newValue } : w);
          setSupportOrg(nextSupportOrg);
        }
        break;
      }
      case "support-unit": {
        const nextSupportOrg = { ...supportOrg };
        if (parent && workName && nextSupportOrg[parent]) {
          nextSupportOrg[parent] = nextSupportOrg[parent].map((w: any) => w.work === workName ? { ...w, units: w.units.map((u: string) => u === oldName ? newValue : u) } : w);
          setSupportOrg(nextSupportOrg);
        }
        break;
      }
      case "academic-pos": setAcademicPos(academicPos.map(v => v === oldName ? newValue : v)); break;
      case "support-pos": setSupportPos(supportPos.map(v => v === oldName ? newValue : v)); break;
      case "admin-pos": setAdminPos(adminPos.map(v => v === oldName ? newValue : v)); break;
      case "academic-rank": setAcademicRank(academicRank.map(v => v === oldName ? newValue : v)); break;
      case "support-rank": setSupportRank(supportRank.map(v => v === oldName ? newValue : v)); break;
      case "admin-rank": setAdminRank(adminRank.map(v => v === oldName ? newValue : v)); break;
      case "workline": setWorklines(worklines.map(v => v === oldName ? newValue : v)); break;
      case "comp-type": setCompetencyTypes(competencyTypes.map(v => v === oldName ? newValue : v)); break;
    }
    setEditingId(null);
  };

  const deleteItem = () => {
    const { type, oldName, parent, workName } = editingItem;

    switch (type) {
      case "academic-dept": setAcademicDepts(academicDepts.filter(v => v !== oldName)); break;
      case "admin-dept": setAdminDepts(adminDepts.filter(v => v !== oldName)); break;
      case "support-dept": {
        const nextSupportPositionGroups = { ...supportPositionGroups };
        delete nextSupportPositionGroups[oldName];
        setSupportPositionGroups(nextSupportPositionGroups);
        break;
      }
      case "support-group-pos":
        setSupportPositionGroups({
          ...supportPositionGroups,
          [parent]: (supportPositionGroups[parent] || []).filter(v => v !== oldName)
        });
        break;
      case "support-work": {
        const nextSupportOrg = { ...supportOrg };
        if (parent && nextSupportOrg[parent]) {
          nextSupportOrg[parent] = nextSupportOrg[parent].filter((w: any) => w.work !== oldName);
          setSupportOrg(nextSupportOrg);
        }
        break;
      }
      case "support-unit": {
        const nextSupportOrg = { ...supportOrg };
        if (parent && workName && nextSupportOrg[parent]) {
          nextSupportOrg[parent] = nextSupportOrg[parent].map((w: any) => w.work === workName ? { ...w, units: w.units.filter((u: string) => u !== oldName) } : w);
          setSupportOrg(nextSupportOrg);
        }
        break;
      }
      case "academic-pos": setAcademicPos(academicPos.filter(v => v !== oldName)); break;
      case "support-pos": setSupportPos(supportPos.filter(v => v !== oldName)); break;
      case "admin-pos": setAdminPos(adminPos.filter(v => v !== oldName)); break;
      case "academic-rank": setAcademicRank(academicRank.filter(v => v !== oldName)); break;
      case "support-rank": setSupportRank(supportRank.filter(v => v !== oldName)); break;
      case "admin-rank": setAdminRank(adminRank.filter(v => v !== oldName)); break;
      case "workline": setWorklines(worklines.filter(v => v !== oldName)); break;
      case "comp-type": setCompetencyTypes(competencyTypes.filter(v => v !== oldName)); break;
    }
    setEditingId(null);
  };

  const openAddItem = () => {
    const nextItem = activeTab === "comp"
      ? { category: "comp", type: "1", name: "", parent: "", grandparent: "" }
      : { category: "workline", type: "1", name: "", parent: "", grandparent: "" };
    setShowAddModal(true);
    setAddItemData(nextItem);
  };

  const getAddModalCopy = () => {
    const typeLabel = addItemData.type === "1"
      ? "สายวิชาการ"
      : addItemData.type === "2"
        ? "สายสนับสนุน"
        : "สายงานบริหาร";

    if (addItemData.category === "workline") return { title: "เพิ่มสายงาน", label: "ชื่อสายงาน" };
    if (addItemData.category === "comp") return { title: "เพิ่มประเภทสมรรถนะ", label: "ชื่อประเภทสมรรถนะ" };
    if (addItemData.category === "dept") return { title: `เพิ่มกลุ่มงาน${typeLabel}`, label: "ชื่อกลุ่มงาน" };
    if (addItemData.category === "pos") {
      return {
        title: addItemData.parent ? `เพิ่มตำแหน่ง ${addItemData.parent}` : `เพิ่มตำแหน่ง${typeLabel}`,
        label: "ชื่อตำแหน่ง"
      };
    }
    if (addItemData.category === "rank") return { title: `เพิ่มระดับตำแหน่ง${typeLabel}`, label: "ชื่อระดับตำแหน่ง" };
    if (addItemData.category === "work") return { title: `เพิ่มงาน ${addItemData.parent}`, label: "ชื่องาน" };
    if (addItemData.category === "unit") return { title: `เพิ่มหน่วย ${addItemData.parent}`, label: "ชื่อหน่วย" };
    return { title: "เพิ่มรายการ", label: "ชื่อรายการ" };
  };

  const saveAddItem = () => {
    const { category, type, name, parent, grandparent } = addItemData;
    if (name.trim()) {
      if (category === "pos" && type === "2" && !parent) return;
      if (category === "dept") {
        if (type === "1") setAcademicDepts([...academicDepts, name]);
        else if (type === "3") setAdminDepts([...adminDepts, name]);
        else {
          setSupportPositionGroups({ ...supportPositionGroups, [name]: [] });
        }
      } else if (category === "work") {
        const nextSupportOrg = { ...supportOrg };
        if (parent && nextSupportOrg[parent]) {
          nextSupportOrg[parent] = [...nextSupportOrg[parent], { work: name, units: [] }];
          setSupportOrg(nextSupportOrg);
        }
      } else if (category === "unit") {
        const nextSupportOrg = { ...supportOrg };
        if (grandparent && parent && nextSupportOrg[grandparent]) {
          nextSupportOrg[grandparent] = nextSupportOrg[grandparent].map((w: any) => w.work === parent ? { ...w, units: [...w.units, name] } : w);
          setSupportOrg(nextSupportOrg);
        }
      } else if (category === "pos") {
        if (type === "1") setAcademicPos([...academicPos, name]);
        else if (type === "2" && parent) {
          setSupportPositionGroups({
            ...supportPositionGroups,
            [parent]: [...(supportPositionGroups[parent] || []), name]
          });
        }
        else if (type === "3") setAdminPos([...adminPos, name]);
      } else if (category === "rank") {
        if (type === "1") setAcademicRank([...academicRank, name]);
        else if (type === "2") setSupportRank([...supportRank, name]);
        else if (type === "3") setAdminRank([...adminRank, name]);
      } else if (category === "workline") {
        setWorklines([...worklines, name]);
      } else if (category === "comp") {
        setCompetencyTypes([...competencyTypes, name]);
      }
      setShowAddModal(false);
    }
  };

  return (
    <>
      <div className="flex ic jb mb20">
        <div>
          <div className="sec-t">จัดการโครงสร้างองค์กรและสมรรถนะ</div>
          <div className="sec-s">กลุ่มงาน ตำแหน่ง ระดับตำแหน่ง และประเภทสมรรถนะ</div>
        </div>
        {(activeTab === "workline" || activeTab === "comp") && (
          <button className="btn btn-p" onClick={openAddItem}>
            {activeTab === "workline" ? "+ เพิ่มสายงาน" : "+ เพิ่มประเภทสมรรถนะ"}
          </button>
        )}
      </div>

      <div className="structure-tabs mb20">
        <button className={`structure-tab ${activeTab === "workline" ? "active" : ""}`} onClick={() => setActiveTab("workline")}>สายงาน</button>
        <button className={`structure-tab ${activeTab === "dept" ? "active" : ""}`} onClick={() => setActiveTab("dept")}>กลุ่มงาน</button>
        <button className={`structure-tab ${activeTab === "pos" ? "active" : ""}`} onClick={() => setActiveTab("pos")}>ระดับตำแหน่ง</button>
        <button className={`structure-tab ${activeTab === "comp" ? "active" : ""}`} onClick={() => setActiveTab("comp")}>ประเภทสมรรถนะ</button>
      </div>

      <div className="anim-fade-in">
        <div className="structure-shell">
          {activeTab === "workline" ? (
            <div className="structure-pane">
              <div className="structure-heading">สายงานและตำแหน่ง</div>
              <div className="structure-stack">
                {worklines.map(wl => {
                  let posList: string[] = [];
                  let type = "1";
                  let editPosType = "academic-pos";
                  if (wl === "สายวิชาการ") { posList = academicPos; type = "1"; editPosType = "academic-pos"; }
                  else if (wl === "สายสนับสนุน") {
                    return (
                      <section key={wl} className="structure-section">
                        <div className="structure-section-head">
                          <div className="fw7 fs14 text-navy">{wl}</div>
                          <div className="flex g8">
                            <button className="btn btn-s btn-sm" onClick={() => { setAddItemData({ category: "dept", type: "2", name: "", parent: "", grandparent: "" }); setShowAddModal(true); }}>+ เพิ่มกลุ่มงาน</button>
                            <button className="btn btn-s btn-sm" onClick={() => startEdit("workline", wl)}>แก้ไข</button>
                          </div>
                        </div>
                        <div className="support-columns">
                          {(showAllSupportGroups ? supportDepts : supportDepts.slice(0, 5)).map(group => (
                            <div key={group} className="support-column">
                              <div className="support-column-head">
                                <div className="fw7 fs13 text-navy">{group}</div>
                                <button className="btn-link" onClick={() => startEdit("support-dept", group)} title="แก้ไขกลุ่มงาน">✎</button>
                              </div>
                              <div className="support-position-list">
                                {(expandedSupportGroups[group]
                                  ? supportPositionGroups[group] || []
                                  : (supportPositionGroups[group] || []).slice(0, 5)
                                ).map(item => (
                                  <div key={item} className="structure-item group">
                                    <span className="fs12 fw6 text-gray-700">{item}</span>
                                    <button className="btn-link opacity-0 group-hover:opacity-100" style={{ fontSize: '12px' }} onClick={() => startEdit("support-group-pos", item, { parent: group })}>✎</button>
                                  </div>
                                ))}
                                {(supportPositionGroups[group] || []).length === 0 && <div className="structure-empty">ยังไม่มีตำแหน่ง</div>}
                              </div>
                              {(supportPositionGroups[group] || []).length > 5 && (
                                <button
                                  className="support-more"
                                  onClick={() => setExpandedSupportGroups(current => ({ ...current, [group]: !current[group] }))}
                                >
                                  {expandedSupportGroups[group]
                                    ? "ย่อรายการ"
                                    : `ดูเพิ่มเติม ${(supportPositionGroups[group] || []).length - 5} รายการ`}
                                </button>
                              )}
                              <button className="support-add" onClick={() => { setAddItemData({ category: "pos", type: "2", name: "", parent: group, grandparent: "" }); setShowAddModal(true); }}>+ เพิ่มตำแหน่ง</button>
                            </div>
                          ))}
                        </div>
                        {supportDepts.length > 5 && (
                          <button className="support-group-more" onClick={() => setShowAllSupportGroups(current => !current)}>
                            {showAllSupportGroups ? "ย่อกลุ่มงาน" : `ดูกลุ่มงานเพิ่มเติม ${supportDepts.length - 5} กลุ่ม`}
                          </button>
                        )}
                      </section>
                    );
                  }
                  else if (wl === "สายงานบริหาร") { posList = adminPos; type = "3"; editPosType = "admin-pos"; }
                  return (
                    <section key={wl} className="structure-section">
                      <div className="structure-section-head">
                        <div className="fw7 fs14 text-navy">{wl}</div>
                        <div className="flex g8">
                          <button
                            className="btn btn-s btn-sm"
                            onClick={() => {
                              setAddItemData({
                                category: wl === "สายวิชาการ" ? "dept" : "pos",
                                type,
                                name: "",
                                parent: "",
                                grandparent: ""
                              });
                              setShowAddModal(true);
                            }}
                          >
                            {wl === "สายวิชาการ" ? "+ เพิ่มกลุ่มงาน" : "+ เพิ่มตำแหน่ง"}
                          </button>
                          <button className="btn btn-s btn-sm" onClick={() => startEdit("workline", wl)}>แก้ไข</button>
                        </div>
                      </div>
                      <div className="structure-grid">
                        {posList.length > 0 ? posList.map(p => (
                          <div key={p} className="structure-item group">
                            <span className="fs13 fw6 text-gray-700 truncate">{p}</span>
                            <button className="btn-link opacity-0 group-hover:opacity-100" style={{ fontSize: '12px' }} onClick={() => startEdit(editPosType, p)}>✎</button>
                          </div>
                        )) : (
                          <div className="structure-empty">ยังไม่มีข้อมูลตำแหน่งงานใน{wl}</div>
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          ) : activeTab === "dept" ? (
            <div className="structure-pane">
              <div className="structure-heading">กลุ่มงาน</div>
              <div className="structure-stack">
                <section className="structure-section">
                  <div className="structure-section-head">
                    <div className="fw7 fs14 text-navy">สายงานบริหาร</div>
                    <button className="btn btn-s btn-sm" onClick={() => { setAddItemData({ category: "dept", type: "3", name: "", parent: "", grandparent: "" }); setShowAddModal(true); }}>+ เพิ่มกลุ่มงาน</button>
                  </div>
                  <div className="structure-grid">
                    {adminDepts.map(item => (
                      <div key={item} className="structure-item group">
                        <div className="flex flex-col g4 overflow-hidden">
                          <span className="fs13 fw7 text-gray-800">{item}</span>
                        </div>
                        <button className="btn-link opacity-0 group-hover:opacity-100" style={{ fontSize: '12px' }} onClick={() => startEdit("admin-dept", item)}>✎</button>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="structure-section">
                  <div className="structure-section-head">
                    <div className="fw7 fs14 text-navy">สายวิชาการ</div>
                    <button className="btn btn-s btn-sm" onClick={() => { setAddItemData({ category: "dept", type: "1", name: "", parent: "", grandparent: "" }); setShowAddModal(true); }}>+ เพิ่มกลุ่มงาน</button>
                  </div>
                  <div className="structure-grid">
                    {academicDepts.map(item => (
                      <div key={item} className="structure-item group">
                        <div className="flex flex-col g4 overflow-hidden">
                          <span className="fs13 fw7 text-gray-800">{item}</span>
                        </div>
                        <button className="btn-link opacity-0 group-hover:opacity-100" style={{ fontSize: '12px' }} onClick={() => startEdit("academic-dept", item)}>✎</button>
                      </div>
                    ))}
                  </div>
                </section>
                {supportDepts.map(item => (
                  <section key={item} className="structure-section">
                    <div className="structure-section-head">
                      <div className="fw7 fs14 text-navy">{item}</div>
                      <span className="fs11 muted">{(supportPositionGroups[item] || []).length} ตำแหน่ง</span>
                    </div>
                    <div className="structure-grid">
                      {(supportPositionGroups[item] || []).map(position => (
                        <div key={position} className="structure-item">
                          <span className="fs12 fw6 text-gray-700">{position}</span>
                        </div>
                      ))}
                      {(supportPositionGroups[item] || []).length === 0 && (
                        <div className="structure-empty">ยังไม่มีตำแหน่งในกลุ่มงานนี้</div>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            </div>

          ) : activeTab === "pos" ? (
            <div className="structure-pane">
              <div className="structure-heading">ระดับตำแหน่ง</div>
              <div className="structure-stack">
                {[
                  { label: "สายวิชาการ", data: academicRank, type: "1", editType: "academic-rank" },
                  { label: "สายสนับสนุน", data: supportRank, type: "2", editType: "support-rank" },
                  { label: "สายงานบริหาร", data: adminRank, type: "3", editType: "admin-rank" }
                ].map(group => (
                  <section key={group.label} className="structure-section">
                    <div className="structure-section-head">
                      <div className="fw7 fs14 text-navy">{group.label}</div>
                      <button className="btn btn-s btn-sm" onClick={() => { setAddItemData({ category: "rank", type: group.type, name: "", parent: "", grandparent: "" }); setShowAddModal(true); }}>+ เพิ่มระดับ</button>
                    </div>
                    <div className="structure-grid">
                      {group.data.map(item => (
                        <div key={item} className="structure-item group">
                          <span className="fs13 fw6 text-gray-700 truncate">{item}</span>
                          <button className="btn-link opacity-0 group-hover:opacity-100" style={{ fontSize: '12px' }} onClick={() => startEdit(group.editType, item)}>✎</button>
                        </div>
                      ))}
                      {group.data.length === 0 && <div className="structure-empty">ยังไม่มีข้อมูล</div>}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          ) : (
            <div className="structure-pane">
              <div className="structure-heading">ประเภทสมรรถนะ</div>
              <section className="structure-section">
                <div className="structure-section-head">
                  <div className="fw7 fs14 text-navy">หมวดหมู่สมรรถนะ</div>
                  <button className="btn btn-s btn-sm" onClick={() => { setAddItemData({ category: "comp", type: "1", name: "", parent: "", grandparent: "" }); setShowAddModal(true); }}>+ เพิ่มประเภท</button>
                </div>
                <div className="structure-grid">
                  {competencyTypes.map(item => (
                    <div key={item} className="structure-item group">
                      <span className="fs13 fw6 text-gray-700 truncate">{item}</span>
                      <button className="btn-link opacity-0 group-hover:opacity-100" style={{ fontSize: '12px' }} onClick={() => startEdit("comp-type", item)}>✎</button>
                    </div>
                  ))}
                  {competencyTypes.length === 0 && <div className="structure-empty">ยังไม่มีข้อมูล</div>}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="mo">
          <div className="mo-box anim-fade-in" style={{ width: "450px" }}>
            <div className="mo-h">
              <div className="fw8">{getAddModalCopy().title}</div>
              <button className="btn btn-s btn-sm" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <div className="mo-b">
              <div className="fg">
                <label className="lbl fw8" style={{ color: "var(--navy)" }}>{getAddModalCopy().label}</label>
                <input className="inp" value={addItemData.name} onChange={e => setAddItemData({...addItemData, name: e.target.value})} placeholder="กรอกชื่อที่ต้องการ..." autoFocus />
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "24px", justifyContent: "flex-end" }}>
                <button className="btn btn-s" onClick={() => setShowAddModal(false)}>ยกเลิก</button>
                <button className="btn btn-p" onClick={saveAddItem}>เพิ่มรายการ</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingItem && (
        <div className="mo">
          <div className="mo-box anim-fade-in" style={{ width: "400px" }}>
            <div className="mo-h">
              <div className="fw8">แก้ไขข้อมูลรายการ</div>
              <button className="btn btn-s btn-sm" onClick={() => setEditingId(null)}>✕</button>
            </div>
            <div className="mo-b">
              <div className="fg">
                <label className="lbl">ชื่อปัจจุบัน: <span className="muted">{editingItem.oldName}</span></label>
                <input className="inp" value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="กรอกชื่อใหม่..." autoFocus />
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "24px", justifyContent: "space-between" }}>
                <button className="btn btn-r" style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca' }} onClick={deleteItem}>🗑️ ลบรายการนี้</button>
                <div className="flex g8">
                  <button className="btn btn-s" onClick={() => setEditingId(null)}>ยกเลิก</button>
                  <button className="btn btn-p" onClick={saveEdit}>💾 บันทึก</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .structure-tabs { display: flex; gap: 4px; padding: 4px; width: fit-content; max-width: 100%; overflow-x: auto; border: 1px solid var(--border); border-radius: var(--r); background: #fff; }
        .structure-tab { flex: 0 0 auto; border: 0; border-radius: 6px; background: transparent; color: var(--text2); cursor: pointer; font-size: 13px; font-weight: 600; padding: 8px 12px; }
        .structure-tab.active { background: var(--blue); color: #fff; }
        .structure-shell { min-height: 400px; overflow: hidden; border: 1px solid var(--border); border-radius: var(--r); background: #fff; }
        .structure-pane { padding: 20px; }
        .structure-heading { margin-bottom: 14px; color: var(--text); font-size: 15px; font-weight: 800; }
        .structure-stack { display: grid; gap: 0; }
        .structure-section { padding: 16px 0; border-top: 1px solid var(--border); }
        .structure-section:first-child { padding-top: 0; border-top: 0; }
        .structure-section-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
        .structure-grid { display: grid; gap: 8px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr)); }
        .structure-item { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 40px; padding: 9px 11px; border: 1px solid var(--border); border-radius: 7px; background: var(--bg); overflow: hidden; }
        .structure-empty { grid-column: 1 / -1; padding: 14px; border: 1px dashed var(--border); border-radius: 7px; color: var(--text3); font-size: 13px; text-align: center; }
        .support-columns { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); }
        .support-group-more { justify-self: start; margin-top: 12px; border: 1px solid var(--border); border-radius: 7px; background: #fff; color: var(--blue); cursor: pointer; font-size: 12px; font-weight: 700; padding: 8px 10px; }
        .support-group-more:hover { border-color: var(--blue); background: var(--blue-lt); }
        .support-column { display: grid; align-content: start; gap: 9px; min-height: 170px; padding: 12px; border: 1px solid var(--border); border-radius: 7px; background: #fff; }
        .support-column-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; min-height: 32px; padding-bottom: 9px; border-bottom: 1px solid var(--border); }
        .support-position-list { display: grid; align-content: start; gap: 7px; }
        .support-more { justify-self: start; border: 0; background: transparent; color: var(--blue); cursor: pointer; font-size: 12px; font-weight: 700; padding: 0; }
        .support-add { min-height: 34px; border: 1px dashed var(--border); border-radius: 7px; background: transparent; color: var(--blue); cursor: pointer; font-size: 12px; font-weight: 700; }
        .support-add:hover { border-color: var(--blue); background: var(--blue-lt); }
        .tbl-mini { width: 100%; border-collapse: collapse; font-size: 13px; }
        .tbl-mini td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: var(--text2); }
        .tbl-mini tr:hover td { background: #f8fafc; color: var(--blue); }
        .btn-link { background: none; border: none; color: var(--blue); cursor: pointer; font-size: 14px; opacity: 0.5; transition: 0.2s; }
        .btn-link:hover { opacity: 1; transform: scale(1.2); }
        .inp-clean { border: none; background: transparent; outline: none; }
        @media (max-width: 640px) {
          .structure-pane { padding: 16px; }
          .structure-tabs { width: 100%; }
          .structure-section-head { align-items: flex-start; flex-direction: column; }
        }
      `}</style>
    </>
  );
};

export default AdminOrgStructure;
