import React, { useEffect, useState } from 'react';

interface ProfileProps {
  user: any;
  onSave: (nextUser: any) => void;
  onDirtyChange?: (dirty: boolean) => void;
}

const splitThaiName = (user: any) => ({
  firstName: user?.fn || user?.n?.split(" ")[0] || "",
  lastName: user?.ln || user?.n?.split(" ").slice(1).join(" ") || ""
});

const Profile: React.FC<ProfileProps> = ({ user, onSave, onDirtyChange }) => {
  const initialName = splitThaiName(user);
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [photo, setPhoto] = useState(user?.photo || "");
  const [form, setForm] = useState({
    sso: user?.sso || "",
    title: user?.t || "",
    firstName: initialName.firstName,
    lastName: initialName.lastName,
    firstNameEng: user?.fe || "",
    lastNameEng: user?.le || "",
    gender: user?.g || "",
    workline: user?.w || "",
    group: user?.d || "",
    position: user?.p || "",
    level: user?.l || "",
    role: user?.r || "employee",
    evaluator1: user?.sup || "",
    evaluator2: user?.evaluator2 || "",
    active: user?.act !== false,
    email: user?.profileSaved ? user?.em || "" : "",
    phone: user?.profileSaved ? user?.ph || "" : "",
    affiliation: user?.profileAffiliation || ""
  });

  useEffect(() => {
    const nextName = splitThaiName(user);
    setIsEditing(false);
    setPhoto(user?.photo || "");
    setForm({
      sso: user?.sso || "",
      title: user?.t || "",
      firstName: nextName.firstName,
      lastName: nextName.lastName,
      firstNameEng: user?.fe || "",
      lastNameEng: user?.le || "",
      gender: user?.g || "",
      workline: user?.w || "",
      group: user?.d || "",
      position: user?.p || "",
      level: user?.l || "",
      role: user?.r || "employee",
      evaluator1: user?.sup || "",
      evaluator2: user?.evaluator2 || "",
      active: user?.act !== false,
      email: user?.profileSaved ? user?.em || "" : "",
      phone: user?.profileSaved ? user?.ph || "" : "",
      affiliation: user?.profileAffiliation || ""
    });
    setIsDirty(false);
  }, [user]);

  useEffect(() => {
    const hasUnsavedChanges = isEditing && isDirty;
    onDirtyChange?.(hasUnsavedChanges);

    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [isDirty, isEditing, onDirtyChange]);

  useEffect(() => () => onDirtyChange?.(false), [onDirtyChange]);

  if (!user) {
    return (
      <div className="card p24">
        <div className="sec-t">โปรไฟล์</div>
        <div className="muted mt8">ไม่พบข้อมูลบุคลากรสำหรับมุมมองนี้</div>
      </div>
    );
  }

  const setValue = (key: keyof typeof form, value: string) => {
    setForm(current => ({ ...current, [key]: value }));
    setIsDirty(true);
  };

  const uploadPhoto = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(String(reader.result || ""));
      setIsDirty(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave({
      ...user,
      n: `${form.firstName} ${form.lastName}`.trim(),
      fn: form.firstName,
      ln: form.lastName,
      t: form.title,
      sso: form.sso,
      fe: form.firstNameEng,
      le: form.lastNameEng,
      g: form.gender,
      w: form.workline,
      d: form.group,
      p: form.position,
      l: form.level,
      r: form.role,
      sup: form.role === "manager" ? "" : form.evaluator1,
      evaluator2: ["employee", "hr", "admin"].includes(form.role) ? form.evaluator2 : "",
      act: form.active,
      em: form.email,
      ph: form.phone,
      profileAffiliation: form.affiliation,
      photo,
      profileSaved: true
    });
    setIsDirty(false);
    setIsEditing(false);
    alert("บันทึกโปรไฟล์เรียบร้อยแล้ว");
  };

  const profileName = `${form.title}${form.firstName} ${form.lastName}`.trim();
  const detail = (label: string, value?: string) => (
    <div className="profile-detail">
      <div className="lbl">{label}</div>
      <div className="profile-detail-value">{value || "—"}</div>
    </div>
  );

  return (
    <form className="profile-page" onSubmit={handleSubmit}>
      <section className="profile-banner">
        <div className="profile-identity">
          <div className="profile-photo-slot">
            <div className="profile-avatar">
              {photo ? <img src={photo} alt={form.firstName} /> : <span>{form.firstName[0] || "?"}</span>}
            </div>
            {isEditing && (
              <div className="profile-photo-actions">
                <label className="btn btn-s btn-sm profile-upload">
                  เพิ่มรูป
                  <input type="file" accept="image/*" onChange={e => uploadPhoto(e.target.files?.[0])} />
                </label>
                {photo && <button className="btn btn-s btn-sm" type="button" onClick={() => { setPhoto(""); setIsDirty(true); }}>ลบ</button>}
              </div>
            )}
          </div>
          <div className="profile-title">
            <div className="sec-t">โปรไฟล์บุคลากร</div>
            <div className="profile-name">{profileName}</div>
            <div className="profile-roleline">
              {form.position || "ยังไม่ได้ระบุตำแหน่ง"} · {form.level || "ยังไม่ได้ระบุระดับตำแหน่ง"} · {form.group || "ยังไม่ได้ระบุกลุ่มงาน"}
            </div>
            <div className="profile-tags">
              <span>ID {form.sso || "—"}</span>
              <span>{form.workline || "ยังไม่ได้ระบุสายงาน"}</span>
            </div>
          </div>
        </div>
        <div className="profile-actions">
          {isEditing ? (
            <>
              <button className="btn btn-s" type="button" onClick={() => {
                const nextName = splitThaiName(user);
                setPhoto(user?.photo || "");
                setForm({
                  sso: user?.sso || "",
                  title: user?.t || "",
                  firstName: nextName.firstName,
                  lastName: nextName.lastName,
                  firstNameEng: user?.fe || "",
                  lastNameEng: user?.le || "",
                  gender: user?.g || "",
                  workline: user?.w || "",
                  group: user?.d || "",
                  position: user?.p || "",
                  level: user?.l || "",
                  role: user?.r || "employee",
                  evaluator1: user?.sup || "",
                  evaluator2: user?.evaluator2 || "",
                  active: user?.act !== false,
                  email: user?.profileSaved ? user?.em || "" : "",
                  phone: user?.profileSaved ? user?.ph || "" : "",
                  affiliation: user?.profileAffiliation || ""
                });
                setIsDirty(false);
                setIsEditing(false);
              }}>ยกเลิก</button>
              <button className="btn btn-p" type="submit">บันทึกโปรไฟล์</button>
            </>
          ) : (
            <button className="btn btn-p" type="button" onClick={() => { setIsDirty(false); setIsEditing(true); }}>แก้ไขโปรไฟล์</button>
          )}
        </div>
      </section>

      <div className="profile-layout">
        <section className="profile-form">
          {!isEditing ? (
            <>
              <div className="profile-section">
                <div className="fw8 fs14">ข้อมูลบุคลากร</div>
                <div className="profile-grid">
                  {detail("ID", form.sso)}
                  {detail("ชื่อ-นามสกุล", profileName)}
                  {detail("First Name", form.firstNameEng)}
                  {detail("Last Name", form.lastNameEng)}
                  {detail("เพศ", form.gender)}
                  {detail("อีเมล", form.email)}
                  {detail("เบอร์โทรศัพท์", form.phone)}
                  {detail("สังกัด/หน่วยงาน", form.affiliation)}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="profile-section">
                <div className="fw8 fs14">ข้อมูลบุคลากร</div>
                <div className="profile-grid">
              <div className="fg">
                <label className="lbl">ID</label>
                <input className="inp profile-readonly" value={form.sso} readOnly />
              </div>
              <div className="fg">
                <label className="lbl">คำนำหน้า <span className="required">*</span></label>
                <input className="inp" value={form.title} onChange={e => setValue("title", e.target.value)} required />
              </div>
              <div className="fg">
                <label className="lbl">ชื่อ (ภาษาไทย) <span className="required">*</span></label>
                <input className="inp" value={form.firstName} onChange={e => setValue("firstName", e.target.value)} required />
              </div>
              <div className="fg">
                <label className="lbl">นามสกุล (ภาษาไทย) <span className="required">*</span></label>
                <input className="inp" value={form.lastName} onChange={e => setValue("lastName", e.target.value)} required />
              </div>
              <div className="fg">
                <label className="lbl">First Name <span className="required">*</span></label>
                <input className="inp" value={form.firstNameEng} onChange={e => setValue("firstNameEng", e.target.value)} required />
              </div>
              <div className="fg">
                <label className="lbl">Last Name <span className="required">*</span></label>
                <input className="inp" value={form.lastNameEng} onChange={e => setValue("lastNameEng", e.target.value)} required />
              </div>
              <div className="fg">
                <label className="lbl">เพศ <span className="required">*</span></label>
                <select className="sel" value={form.gender} onChange={e => setValue("gender", e.target.value)} required>
                  <option value="">— เลือกเพศ —</option>
                  <option value="ชาย">ชาย</option>
                  <option value="หญิง">หญิง</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>
              <div className="fg">
                <label className="lbl">อีเมล</label>
                <input className="inp" type="email" value={form.email} onChange={e => setValue("email", e.target.value)} placeholder="-" />
              </div>
              <div className="fg">
                <label className="lbl">เบอร์โทรศัพท์</label>
                <input className="inp" value={form.phone} onChange={e => setValue("phone", e.target.value)} placeholder="-" />
              </div>
              <div className="fg">
                <label className="lbl">สังกัด/หน่วยงาน</label>
                <input className="inp" value={form.affiliation} onChange={e => setValue("affiliation", e.target.value)} placeholder="-" />
              </div>
            </div>
              </div>

            </>
          )}
        </section>
      </div>

      <style>{`
        .profile-page { display: grid; gap: 14px; }
        .profile-banner { display: flex; align-items: center; justify-content: space-between; gap: 18px; min-height: 198px; padding: 26px; border: 1px solid var(--border); border-radius: var(--r-lg); background: #fff; }
        .profile-identity { min-width: 0; display: flex; align-items: center; gap: 20px; }
        .profile-title { min-width: 0; display: grid; gap: 5px; }
        .profile-name { color: var(--navy); font-size: 25px; font-weight: 850; line-height: 1.2; overflow-wrap: anywhere; }
        .profile-roleline { color: var(--text2); font-size: 13px; font-weight: 600; overflow-wrap: anywhere; }
        .profile-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 5px; }
        .profile-tags span { min-height: 27px; display: inline-flex; align-items: center; padding: 0 9px; border: 1px solid var(--border); border-radius: 7px; background: var(--bg); color: var(--text2); font-size: 12px; font-weight: 700; }
        .profile-tags .ok { border-color: #bbf7d0; background: #f0fdf4; color: #15803d; }
        .profile-tags .off { border-color: #fecaca; background: #fef2f2; color: #b91c1c; }
        .profile-actions { flex: 0 0 auto; display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; max-width: 330px; }
        .profile-photo-slot { display: grid; justify-items: center; gap: 8px; }
        .profile-photo-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; }
        .profile-avatar { width: 136px; height: 136px; display: flex; align-items: center; justify-content: center; border-radius: 50%; overflow: hidden; background: var(--navy); color: #fff; font-size: 44px; font-weight: 800; border: 6px solid var(--bg); }
        .profile-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .profile-upload { position: relative; overflow: hidden; cursor: pointer; }
        .profile-upload input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
        .profile-layout { min-width: 0; }
        .profile-form { display: grid; gap: 12px; }
        .profile-section { padding: 20px; border: 1px solid var(--border); border-radius: var(--r-lg); background: #fff; }
        .profile-grid { display: grid; gap: 12px; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 12px; }
        .profile-detail { min-height: 66px; display: grid; align-content: center; gap: 5px; padding: 11px 13px; border-left: 3px solid var(--blue); border-radius: 0 var(--r) var(--r) 0; background: var(--bg); }
        .profile-detail-value { color: var(--text); font-size: 14px; font-weight: 700; overflow-wrap: anywhere; }
        .profile-readonly { border-color: #e2e8f0; background: #f1f5f9; color: var(--text3); cursor: not-allowed; }
        .required { color: var(--red); }
        @media (max-width: 760px) {
          .profile-banner, .profile-identity { align-items: flex-start; flex-direction: column; }
          .profile-banner { padding: 18px; }
          .profile-actions { width: 100%; justify-content: flex-start; }
          .profile-name { font-size: 21px; }
          .profile-avatar { width: 108px; height: 108px; font-size: 36px; }
          .profile-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </form>
  );
};

export default Profile;
