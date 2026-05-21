/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Menu } from 'lucide-react';
import { 
  ROLES_CONFIG, 
  NAV_CONFIG, 
  PAGE_TITLES, 
  INITIAL_USERS, 
  INITIAL_COMPETENCIES, 
  DEPT_STRUCTURE 
} from './data';

import Login from './components/Login';
import AdminUsers from './components/AdminUsers';
import AdminOrg from './components/AdminOrg';
import AdminOrgStructure from './components/AdminOrgStructure';
import AdminDict from './components/AdminDict';
import Profile from './components/Profile';
import { HRCycle, HRCatalog, HRMonitor, HRTemplate } from './components/HRPages';
import { EmployeeAssess, EmployeeGap, EmployeeIDP, EmployeeProgress } from './components/EmployeePages';
import { SupervisorAssess, TeamGap, TeamIDP } from './components/SupervisorPages';
import { ManagerGap, ManagerIDP, DeptMonitor } from './components/ManagerPages';

const formatPhone = (val: string) => {
  if (!val) return val;
  const digits = val.replace(/[^\d]/g, "");
  const len = digits.length;
  if (len < 4) return digits;
  if (len < 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

const SUPPORT_JOB_FAMILY_POSITIONS: Record<string, string[]> = {
  "สนับสนุนการศึกษาและวิชาการ": [
    "นักวิชาการทรัพย์สินทางปัญญา",
    "พนักงานบริหารงานอุดมศึกษา",
    "นักวิชาการวิทยาศาสตร์",
    "พนักงานวิทยาศาสตร์",
    "พนักงานประจำห้องปฏิบัติการ",
    "ครูพี่เลี้ยง",
    "นักเอกสารสนเทศ",
    "นักแนะแนวการศึกษาและอาชีพ",
    "นักวิชาการศึกษา",
    "นักวิชาการเกษตร",
    "พนักงานการเกษตร",
    "นักพัฒนากีฬา",
    "นักจิตวิทยา",
    "พนักงานห้องสมุด",
    "บรรณารักษ์"
  ],
  "เทคโนโลยีสารสนเทศ": [
    "นักเทคโนโลยีสารสนเทศ",
    "นักวิชาการโสตทัศนศึกษา",
    "นักวิชาการคอมพิวเตอร์"
  ],
  "ทรัพยากรบุคคล": [
    "นักทรัพยากรบุคคล",
    "เจ้าหน้าที่บริหารงานทั่วไป"
  ],
  "บริหารยุทธศาสตร์": [
    "นักวิชาการแผนและสารสนเทศ",
    "นักจัดการงานทั่วไป"
  ],
  "บริการเทคนิคและวิจัย": [
    "ช่างเทคนิค",
    "ผู้ช่วยวิศวกร",
    "นักวิชาการวิทยาศาสตร์"
  ],
  "สื่อสารและบริหารความสัมพันธ์": [
    "นักประชาสัมพันธ์",
    "นักวิเทศสัมพันธ์"
  ],
  "ทำนุบำรุงศิลปวัฒนธรรม": [
    "นักจัดการงานทั่วไป",
    "เจ้าหน้าที่บริหารงานทั่วไป"
  ],
  "บริการการเงิน": [
    "นักบัญชี",
    "นักวิชาการเงินและบัญชี",
    "นักวิชาการพัสดุ"
  ],
  "กฎหมาย กำกับดูแล และคุ้มครอง": [
    "นิติกร",
    "เจ้าหน้าที่บริหารงานทั่วไป"
  ],
  "วิเทศสัมพันธ์": [
    "นักวิเทศสัมพันธ์",
    "นักประชาสัมพันธ์"
  ],
  "บริหารงานทั่วไป": [
    "นักจัดการงานทั่วไป",
    "เจ้าหน้าที่บริหารงานทั่วไป",
    "พนักงานธุรการ"
  ],
  "โครงสร้างพื้นฐานและบริการสถานที่": [
    "นายช่างเทคนิค",
    "พนักงานช่างเทคนิค",
    "พนักงานบริการ"
  ],
  "บริการสุขภาพ": [
    "พยาบาล",
    "นักจิตวิทยา"
  ]
};

const EVALUATOR1_ROLES_BY_ROLE: Record<string, string[]> = {
  employee: ["manager_dept"],
  hr: ["manager_dept"],
  admin: ["manager_dept"],
  supervisor: ["manager_dept"],
  manager_dept: ["manager"]
};

const EVALUATOR2_ROLES_BY_ROLE: Record<string, string[]> = {
  employee: ["supervisor"],
  hr: ["supervisor"],
  admin: ["supervisor"]
};

export default function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [showSidebar, setShowSidebar] = useState(window.innerWidth > 768);
  const [winWidth, setWinWidth] = useState(window.innerWidth);
  const [currentRole, setCurrentRole] = useState<keyof typeof ROLES_CONFIG>("employee");

  useEffect(() => {
    const handleResize = () => setWinWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [activePage, setActivePage] = useState("emp-assess");
  const [dictHasUnsavedChanges, setDictHasUnsavedChanges] = useState(false);
  const [profileHasUnsavedChanges, setProfileHasUnsavedChanges] = useState(false);
  const [modalType, setModalType] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState("");

  const [users, setUsers] = useState(INITIAL_USERS);
  const [competencies, setCompetencies] = useState(INITIAL_COMPETENCIES);

  const [workline, setWorkline] = useState("");
  const [dept1, setDept1] = useState("");
  const [dept2, setDept2] = useState("");
  const [dept3, setDept3] = useState("");
  const [position, setPosition] = useState("");
  const [level, setLevel] = useState("");
  const [roleId, setRoleId] = useState("employee");
  const [supervisor, setSupervisor] = useState("");
  const [supervisorSearch, setSupervisorSearch] = useState("");
  const [evaluator2, setEvaluator2] = useState("");
  const [evaluator2Search, setEvaluator2Search] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [userUniqueErrors, setUserUniqueErrors] = useState({
    sso: "",
    email: "",
    phone: ""
  });
  const [evaluatorPairError, setEvaluatorPairError] = useState("");

  const [worklines, setWorklines] = useState(["สายวิชาการ", "สายสนับสนุน", "สายงานบริหาร"]);
  const [adminDepts, setAdminDepts] = useState(["คณะวิศวกรรมศาสตร์"]);
  const [competencyTypes, setCompetencyTypes] = useState(["CC", "MC", "FC1", "FC2"]);
  const [supportPositionGroups, setSupportPositionGroups] = useState(SUPPORT_JOB_FAMILY_POSITIONS);
  const supportJobFamilies = Object.keys(supportPositionGroups);
  const [academicPositions, setAcademicPositions] = useState(["อาจารย์", "นักวิจัย"]);
  const [supportPositions, setSupportPositions] = useState([
    "คนงาน (ห้องผลิตเอกสาร)",
    "คนงาน (ห้องสมุด)",
    "ครู",
    "ช่างเทคนิค",
    "นักจัดการงานทั่วไป",
    "นักจิตวิทยา",
    "นักทรัพยากรบุคคล",
    "นักบัญชี",
    "นักประชาสัมพันธ์",
    "นักวิชาการคอมพิวเตอร์",
    "นักวิชาการพัสดุ",
    "นักวิชาการวิทยาศาสตร์",
    "นักวิชาการศึกษา",
    "นักวิชาการเงินและบัญชี",
    "นักวิชาการแผนและสารสนเทศ",
    "นักวิชาการโสตทัศนศึกษา",
    "นักวิเทศสัมพันธ์",
    "นักเทคโนโลยีสารสนเทศ",
    "นายช่างเทคนิค",
    "ผู้ช่วยช่างทั่วไป",
    "ผู้ช่วยนักวิชาการศึกษา",
    "ผู้ช่วยวิศวกร",
    "พนักงานช่างเทคนิค",
    "พนักงานธุรการ",
    "พนักงานบริการ",
    "พนักงานปฏิบัติงานทั่วไป",
    "พนักงานวิทยาศาสตร์",
    "พนักงานห้องปฏิบัติการ",
    "พนักงานเข้าเล่ม",
    "เจ้าหน้าที่บริหารงานทั่วไป",
    "เจ้าหน้าที่ระบบงานคอมพิวเตอร์"
  ]);
  const [adminPositions, setAdminPositions] = useState([
    "คณบดี",
    "รองคณบดีฝ่ายบริหาร",
    "รองคณบดีฝ่ายวิจัย นวัตกรรม และการต่างประเทศ",
    "รองคณบดีฝ่ายแผนยุทธศาสตร์และพัฒนาองค์กร",
    "รองคณบดีฝ่ายวิชาการ",
    "ผู้ช่วยคณบดีฝ่ายบริหาร",
    "ผู้ช่วยคณบดีฝ่ายบัณฑิตศึกษา และ วิเทศสัมพันธ์",
    "ผู้ช่วยคณบดีฝ่ายบริการวิชาการ และถ่ายทอดเทคโนโลยี",
    "ผู้ช่วยคณบดีฝ่ายพัฒนานักศึกษา และศิษย์เก่าสัมพันธ์",
    "รักษาการแทนผู้อำนวยการกองบริหารงานคณะ"
  ]);

  const [adminPosList, setAdminPosList] = useState([
    "บุคลากร (อายุงานไม่เกิน 1 ปี)",
    "บุคลากร",
    "ผู้ช่วยคณบดี / หัวหน้างาน",
    "รองคณบดี",
    "คณบดี"
  ]);
  const [academicPosList, setAcademicPosList] = useState([
    "อาจารย์ (อายุงานไม่เกิน 1 ปี)",
    "อาจารย์",
    "ผู้ช่วยศาสตราจารย์",
    "รองศาสตราจารย์",
    "ศาสตราจารย์",
    "นักวิชาการวิจัย(อายุงานไม่เกิน 1 ปี)",
    "นักวิชาการวิจัยระดับ 1",
    "นักวิชาการวิจัยระดับ 2",
    "นักวิชาการอาวุโส"
  ]);
  const [supportPosList, setSupportPosList] = useState(["ปฏิบัติการ (อายุงานไม่เกิน 1 ปี)", "ลูกจ้างของมหาวิทยาลัย (อายุงานไม่เกิน 1 ปี)", "ปฏิบัติการ", "ลูกจ้างของมหาวิทยาลัย", "ปฏิบัติงาน", "ชํานาญการ", "ชำนาญงาน", "ชำนาญการพิเศษ", "ชำนาญงานพิเศษ", "เชี่ยวชาญ"]);

  const [orgSups, setOrgSups] = useState<any>({
    "คณะวิศวกรรมศาสตร์": "สมพงษ์ จงขยัน",
    "ฝ่ายแผนยุทธศาสตร์และพัฒนาองค์กร": "อำนาจ ศักดิ์สิทธิ์",
    "ฝ่ายแผนยุทธศาสตร์และพัฒนาองค์กร > งานแผนยุทธศาสตร์และทรัพยากรบุคคล > หน่วยพัฒนาทรัพยากรบุคคล": "มาลี ดีเสมอ",
    "ฝ่ายการศึกษาและพัฒนาทักษะการเรียนรู้": "นิธิ ศรีสุข",
    "ฝ่ายการศึกษาและพัฒนาทักษะการเรียนรู้ > งานการศึกษาและพัฒนาทักษะการเรียนรู้ > หน่วยวิชาการและหลักสูตร": "สมภพ การศึกษา",
    "ฝ่ายบริหาร": "เจนจิรา มั่นคง",
    "ฝ่ายบริหาร > งานคลังและพัสดุ > หน่วยการเงินและบัญชี": "บุญมี เงินดี",
    "ฝ่ายวิจัย นวัตกรรมและการต่างประเทศ": "ศิริพงษ์ ใจบุญ",
    "ฝ่ายวิจัย นวัตกรรมและการต่างประเทศ > งานปฏิบัติการและบริการทางวิศวกรรม > หน่วยปฏิบัติการทางวิศวกรรม": "วิชัย ระบบดี"
  });

  const [supportOrg, setSupportOrg] = useState(DEPT_STRUCTURE);
  const supportDeptsList = Object.keys(supportOrg).filter(k => k.startsWith("ฝ่าย"));

  const getPositionOptions = () => {
    if (workline === "สายวิชาการ") return academicPositions;
    if (workline === "สายสนับสนุน") return supportPositions;
    if (workline === "สายงานบริหาร") return adminPositions;
    return [];
  };

  const getSupportPositionOptions = () => supportPositionGroups[dept1] || [];
  const getSupervisorOptions = () => {
    const supervisorRoles = EVALUATOR1_ROLES_BY_ROLE[roleId] || [];
    const query = supervisorSearch.trim().toLowerCase();
    const queryParts = query.split(/\s+/).filter(Boolean);
    const isIdQuery = /\d/.test(query);
    return users.filter(user =>
      supervisorRoles.includes(user.r) &&
      user.sso !== modalData?.sso &&
      (!query ||
        queryParts.every(part => `${user.t}${user.n}`.toLowerCase().includes(part)) ||
        (isIdQuery && user.sso.toLowerCase().includes(query)))
    );
  };
  const getEvaluator2Options = () => {
    const evaluatorRoles = EVALUATOR2_ROLES_BY_ROLE[roleId] || [];
    const query = evaluator2Search.trim().toLowerCase();
    const queryParts = query.split(/\s+/).filter(Boolean);
    const isIdQuery = /\d/.test(query);
    return users.filter(user =>
      evaluatorRoles.includes(user.r) &&
      user.sso !== modalData?.sso &&
      user.n !== supervisor &&
      (!query ||
        queryParts.every(part => `${user.t}${user.n}`.toLowerCase().includes(part)) ||
        (isIdQuery && user.sso.toLowerCase().includes(query)))
    );
  };
  const showEvaluator2Field = !!EVALUATOR2_ROLES_BY_ROLE[roleId];

  const handleLogin = () => setIsLogged(true);
  const handleLogout = () => {
    if (
      activePage === "profile" &&
      profileHasUnsavedChanges &&
      !window.confirm("ยังไม่บันทึกข้อมูล หากยืนยันจะออกจากหน้านี้ข้อมูลจะไม่ถูกบันทึก")
    ) {
      return;
    }
    setIsLogged(false);
  };

  const openModal = (type: string, data?: any) => {
    setModalType(type);
    setUserUniqueErrors({ sso: "", email: "", phone: "" });
    setEvaluatorPairError("");
    if (data) {
      setModalData(data);
      setPhoneNumber(data.ph || "");
      setWorkline(data.w);
      if (data.w === "สายสนับสนุน" && data.d && data.d.includes(" > ")) {
        const parts = data.d.split(" > ");
        setDept1(parts[0] || "");
        setDept2(parts[1] || "");
        setDept3(parts[2] || "");
      } else {
        setDept1(data.d || "");
        setDept2("");
        setDept3("");
      }
      setPosition(data.p);
      setLevel(data.l);
      setRoleId(data.r || "employee");
      setSupervisor(data.sup || "");
      setSupervisorSearch(data.sup || "");
      setEvaluator2(data.evaluator2 || "");
      setEvaluator2Search(data.evaluator2 || "");
    } else {
      setModalData(null);
      setWorkline("");
      setDept1("");
      setDept2("");
      setDept3("");
      setPosition("");
      setLevel("");
      setRoleId("employee");
      setSupervisor("");
      setSupervisorSearch("");
      setEvaluator2("");
      setEvaluator2Search("");
    }
  };

  const closeModal = () => {
    setModalType(null);
    setModalData(null);
    setPhoneNumber("");
    setSupervisor("");
    setSupervisorSearch("");
    setEvaluator2("");
    setEvaluator2Search("");
    setUserUniqueErrors({ sso: "", email: "", phone: "" });
    setEvaluatorPairError("");
    setShowResults(false);
    setDept2("");
    setDept3("");
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const firstName = formData.get("first_name") as string;
    const lastName = formData.get("last_name") as string;
    const title = formData.get("title") as string;
    const ssoId = ((formData.get("sso_id") as string) || "").trim();
    const email = ((formData.get("email") as string) || "").trim();
    const phone = ((formData.get("phone_number") as string) || "").trim();
    const submittedRoleId = formData.get("role_id") as string;
    const isActive = formData.get("is_active") === "on";
    const otherUsers = users.filter(user => user.sso !== modalData?.sso);
    const phoneDigits = phone.replace(/\D/g, "");
    const uniqueErrors = {
      sso: otherUsers.some(user => (user.sso || "").trim().toLowerCase() === ssoId.toLowerCase())
        ? "มี ID นี้อยู่แล้ว"
        : "",
      email: email && otherUsers.some(user => (user.em || "").trim().toLowerCase() === email.toLowerCase())
        ? "มีอีเมลนี้อยู่แล้ว"
        : "",
      phone: phoneDigits && otherUsers.some(user => (user.ph || "").replace(/\D/g, "") === phoneDigits)
        ? "มีเบอร์โทรศัพท์นี้อยู่แล้ว"
        : ""
    };

    setUserUniqueErrors(uniqueErrors);
    if (Object.values(uniqueErrors).some(Boolean)) return;

    if (submittedRoleId !== "manager" && !supervisor) {
      alert("กรุณาเลือกผู้ประเมินลำดับที่ 1 จากผลการค้นหา");
      return;
    }
    if (showEvaluator2Field && !evaluator2) {
      setEvaluatorPairError("กรุณาเลือกผู้ประเมินลำดับที่ 2 จากผลการค้นหา");
      return;
    }
    if (supervisor && evaluator2 && supervisor === evaluator2) {
      setEvaluatorPairError("ผู้ประเมินลำดับที่ 1 และลำดับที่ 2 ต้องไม่ใช่คนเดียวกัน");
      return;
    }

    const fullDept = workline === "สายวิชาการ"
      ? position
      : [dept1, dept2, dept3].filter(Boolean).join(" > ");

    const newUser = {
      ...(modalData || {}),
      n: `${firstName} ${lastName}`.trim() || modalData?.n,
      fn: firstName,
      ln: lastName,
      fe: formData.get("first_name_eng") as string,
      le: formData.get("last_name_eng") as string,
      t: title,
      d: fullDept,
      g: formData.get("gender") as string,
      em: email,
      ph: phone,
      sso: ssoId,
      p: position,
      l: level,
      w: workline,
      sup: submittedRoleId === "manager" ? "" : supervisor,
      evaluator2: showEvaluator2Field ? evaluator2 : "",
      r: submittedRoleId,
      act: isActive
    };

    if (modalData) {
      setUsers(users.map(u => u.sso === modalData.sso ? newUser : u));
      alert("แก้ไขข้อมูลเรียบร้อยแล้ว");
    } else {
      setUsers([newUser, ...users]);
      alert("เพิ่มผู้ใช้งานใหม่เรียบร้อยแล้ว");
    }
    closeModal();
  };

  const requestPageChange = (nextPage: string) => {
    if (nextPage !== activePage) {
      if (
        activePage === "admin-dict" &&
        dictHasUnsavedChanges &&
        !window.confirm("มีข้อมูลสมรรถนะที่ยังไม่ได้บันทึก ต้องการออกจากหน้านี้หรือไม่")
      ) {
        return false;
      }
      if (
        activePage === "profile" &&
        profileHasUnsavedChanges &&
        !window.confirm("ยังไม่บันทึกข้อมูล หากยืนยันจะออกจากหน้านี้ข้อมูลจะไม่ถูกบันทึก")
      ) {
        return false;
      }
    }

    setActivePage(nextPage);
    return true;
  };

  const changeRoleView = (role: keyof typeof ROLES_CONFIG) => {
    const nextPage = NAV_CONFIG[role][0].items[0].id;
    if (!requestPageChange(nextPage)) return;
    setCurrentRole(role);
  };

  const getCurrentProfileUser = () =>
    users.find(user => user.r === currentRole) ||
    users.find(user => user.n === ROLES_CONFIG[currentRole].name.replace("คุณ", "")) ||
    users[0];

  const renderPage = () => {
    const profileUser = getCurrentProfileUser();
    switch (activePage) {
      case "profile":
        return (
          <Profile
            user={profileUser}
            onSave={nextUser => setUsers(users.map(user => user.sso === profileUser?.sso ? nextUser : user))}
            onDirtyChange={setProfileHasUnsavedChanges}
          />
        );
      case "admin-users":
        return <AdminUsers openModal={openModal} users={users} setUsers={setUsers} academicDepts={academicPositions} supportDepts={supportJobFamilies} adminDepts={adminDepts} worklines={worklines} />;
      case "admin-org":
        return <AdminOrg openModal={openModal} users={users} setUsers={setUsers} academicDepts={academicPositions} supportDepts={supportJobFamilies} worklines={worklines} />;
      case "admin-org-structure":
        return <AdminOrgStructure 
          academicDepts={academicPositions} setAcademicDepts={setAcademicPositions}
          supportDepts={supportJobFamilies}
          supportPositionGroups={supportPositionGroups} setSupportPositionGroups={setSupportPositionGroups}
          adminDepts={adminDepts} setAdminDepts={setAdminDepts}
          supportOrg={supportOrg} setSupportOrg={setSupportOrg}
          academicPos={academicPositions} setAcademicPos={setAcademicPositions}
          supportPos={supportPositions} setSupportPos={setSupportPositions}
          adminPos={adminPositions} setAdminPos={setAdminPositions}
          academicRank={academicPosList} setAcademicRank={setAcademicPosList}
          supportRank={supportPosList} setSupportRank={setSupportPosList}
          adminRank={adminPosList} setAdminRank={setAdminPosList}
          worklines={worklines} setWorklines={setWorklines}
          competencyTypes={competencyTypes} setCompetencyTypes={setCompetencyTypes}
        />;
      case "admin-dict":
        return <AdminDict competencies={competencies} setCompetencies={setCompetencies} competencyTypes={competencyTypes} onDirtyChange={setDictHasUnsavedChanges} />;
      case "hr-cycle":
        return <HRCycle />;
      case "hr-catalog":
        return <HRCatalog openModal={openModal} />;
      case "hr-monitor":
        return <HRMonitor />;
      case "hr-template":
        return <HRTemplate />;
      case "hr-comp-overview":
        return <ManagerGap users={users} />;
      case "hr-idp-overview":
        return <ManagerIDP users={users} />;
      case "emp-assess": {
        const staff = users.find(u => u.sso === "64020") || users.find(u => u.r === 'staff');
        return <EmployeeAssess user={staff} setUsers={setUsers} />;
      }
      case "emp-gap":
        return <EmployeeGap setPage={setActivePage} />;
      case "emp-idp":
        return <EmployeeIDP />;
      case "emp-idp-detail":
        return <EmployeeIDP />;
      case "emp-progress":
        return <EmployeeProgress />;
      case "dh-assess":
      case "sup-assess": {
        let boss;
        if (currentRole === 'manager') boss = users.find(u => u.p === 'คณบดี') || users.find(u => u.r === 'manager');
        else if (currentRole === 'manager_dept') boss = users.find(u => u.p.includes('รองคณบดี')) || users.find(u => u.r === 'manager_dept');
        else boss = users.find(u => u.r === 'supervisor');
        if (!boss) boss = users[0];
        return <SupervisorAssess users={users} setUsers={setUsers} currentUser={boss} />;
      }
      case "sup-gap":
        return <TeamGap users={users} />;
      case "dh-idp":
      case "sup-idp":
        return <TeamIDP users={users} />;
      case "mgr-gap":
        return <ManagerGap users={users} />;
      case "mgr-idp":
        return <ManagerIDP users={users} />;
      case "dept-monitor":
        return <DeptMonitor users={users} />;
      default:
        return <div className="p-20 text-center text-text3">🚧 กำลังพัฒนา</div>;
    }
  };

  if (!isLogged) return <Login onLogin={handleLogin} />;

  const currentRoleData = ROLES_CONFIG[currentRole];
  const currentProfileUser = getCurrentProfileUser();

  return (
    <div className={`shell ${showSidebar ? "" : "sidebar-hidden"}`}>
      <AnimatePresence>
        {showSidebar && winWidth <= 768 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setShowSidebar(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 999, backdropFilter: "blur(2px)" }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showSidebar && (
          <motion.div 
            className="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 232, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            style={{ overflow: "hidden" }}
          >
            <div className="sb-logo">
              <div className="sb-mark">คณะวิศวกรรมศาสตร์</div>
              <div className="sb-name">Competency &<br />IDP Management</div>
            </div>
            <button className={`sb-user ${activePage === "profile" ? "on" : ""}`} onClick={() => {
              if (!requestPageChange("profile")) return;
              if (winWidth <= 768) setShowSidebar(false);
            }}>
              <div className="av" style={{ background: currentRoleData.col }}>
                {currentProfileUser?.photo
                  ? <img className="avatar-photo" src={currentProfileUser.photo} alt={currentProfileUser.n} />
                  : currentProfileUser?.n?.[0] || currentRoleData.av}
              </div>
              <div style={{ overflow: "hidden", minWidth: 0 }}>
                <div className="u-name">{currentProfileUser ? `${currentProfileUser.t}${currentProfileUser.n}` : currentRoleData.name}</div>
                <div className="u-role">{currentProfileUser?.p || currentRoleData.pos}</div>
              </div>
            </button>
            <div className="sb-nav">
              {NAV_CONFIG[currentRole].map((sec, si) => (
                <div key={si}>
                  <div className="nav-sec">{sec.sec}</div>
                  {sec.items.map(item => (
                    <div 
                      key={item.id} 
                      className={`nav-item ${activePage === item.id ? "on" : ""}`}
                      onClick={() => {
                        if (!requestPageChange(item.id)) return;
                        if (winWidth <= 768) setShowSidebar(false);
                      }}
                    >
                      <span className="nav-ic">{item.ic}</span>
                      {item.lb}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="main">
        <div className="topbar">
          <button 
            className="btn btn-s btn-sm" 
            style={{ padding: '8px', minWidth: '40px', justifyContent: 'center', border: 'none', background: 'transparent' }} 
            onClick={() => setShowSidebar(!showSidebar)}
            title={showSidebar ? "ซ่อนเมนู" : "แสดงเมนู"}
          >
            <Menu size={20} />
          </button>
          <div className="tb-title">{PAGE_TITLES[activePage as keyof typeof PAGE_TITLES] || activePage}</div>
          <span className="tb-badge">รอบประเมิน 2568</span>
          <button className="btn btn-s btn-sm" style={{ marginLeft: '8px' }} onClick={handleLogout}>ออกจากระบบ</button>
        </div>
        <div className="content">
          <div className="rs">
            <span className="rs-lbl">ดูมุมมอง:</span>
            {(Object.keys(ROLES_CONFIG) as Array<keyof typeof ROLES_CONFIG>).map(role => (
              <button 
                key={role} 
                className={`rb ${currentRole === role ? "on" : ""}`}
                onClick={() => changeRoleView(role)}
              >
                {ROLES_CONFIG[role].lbl}
              </button>
            ))}
          </div>
          {renderPage()}
        </div>
      </div>

      {modalType === 'modal-user' && (
        <div className="mo">
          <div className="mo-box">
            <div className="mo-h">
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800 }}>จัดการผู้ใช้งาน</div>
                <div className="muted fs12">กรอกข้อมูลให้ครบตามตาราง users ในฐานข้อมูล</div>
              </div>
              <button className="btn btn-s btn-sm" onClick={closeModal}>✕ ปิด</button>
            </div>
            <form onSubmit={handleUserSubmit}>
              <div className="mo-b">
                <div style={{ background: "var(--blue-lt)", borderRadius: "var(--r)", padding: "10px 14px", marginBottom: "16px", fontSize: "12px", color: "var(--blue)" }}>
                  💡 ระบบจะ map <strong>ID</strong> ที่กรอกนี้เข้ากับข้อมูลที่ส่งมาจาก KKU SSO โดยอัตโนมัติ
                </div>
                <div className="fg">
                  <label className="lbl">ID <span style={{ color: "var(--red)" }}>*</span></label>
                  <input
                    className="inp"
                    name="sso_id"
                    placeholder="เช่น 64XXXX หรือ stu_XXXXXXX"
                    defaultValue={modalData?.sso || ""}
                    onChange={() => setUserUniqueErrors(errors => ({ ...errors, sso: "" }))}
                    style={userUniqueErrors.sso ? { borderColor: "var(--red)" } : undefined}
                    required
                  />
                  {userUniqueErrors.sso && <div className="fs12" style={{ color: "var(--red)", marginTop: "4px" }}>{userUniqueErrors.sso}</div>}
                </div>
                <div className="divider" />
                <div className="g2">
                  <div className="fg">
                    <label className="lbl">คำนำหน้า <span style={{ color: "var(--red)" }}>*</span></label>
                    <select className="sel" name="title" defaultValue={modalData?.t || ""} required>
                      <option value="">— เลือกคำนำหน้า —</option>
                      <option>นาย</option>
                      <option>นาง</option>
                      <option>นางสาว</option>
                      <option>ดร.</option>
                      <option>อ.ดร.</option>
                      <option>ผศ.ดร.</option>
                      <option>รศ.ดร.</option>
                      <option>ศ.ดร.</option>
                    </select>
                  </div>
                  <div className="fg">
                    <label className="lbl">เพศ</label>
                    <select className="sel" name="gender" defaultValue={modalData?.g || (modalData?.t === 'นางสาว' || modalData?.t === 'นาง' ? 'หญิง' : 'ชาย')}>
                      <option>ชาย</option>
                      <option>หญิง</option>
                      <option>ไม่ระบุ</option>
                    </select>
                  </div>
                </div>
                <div className="g2">
                  <div className="fg">
                    <label className="lbl">ชื่อ (ภาษาไทย) <span style={{ color: "var(--red)" }}>*</span></label>
                    <input className="inp" name="first_name" placeholder="ชื่อจริง" defaultValue={modalData?.n?.split(" ")[0] || ""} required />
                  </div>
                  <div className="fg">
                    <label className="lbl">นามสกุล (ภาษาไทย) <span style={{ color: "var(--red)" }}>*</span></label>
                    <input className="inp" name="last_name" placeholder="นามสกุล" defaultValue={modalData?.n?.split(" ").slice(1).join(" ") || ""} required />
                  </div>
                </div>
                <div className="g2">
                  <div className="fg">
                    <label className="lbl">First Name (English) <span style={{ color: "var(--red)" }}>*</span></label>
                    <input className="inp" name="first_name_eng" placeholder="First name in English" defaultValue={modalData?.fe || ""} required />
                  </div>
                  <div className="fg">
                    <label className="lbl">Last Name (English) <span style={{ color: "var(--red)" }}>*</span></label>
                    <input className="inp" name="last_name_eng" placeholder="Last name in English" defaultValue={modalData?.le || ""} required />
                  </div>
                </div>
                <div className="divider" />
                <div className="g2">
                  <div className="fg">
                    <label className="lbl">อีเมล</label>
                    <input
                      className="inp"
                      name="email"
                      type="email"
                      placeholder="example@kku.ac.th"
                      defaultValue={modalData?.em || ""}
                      onChange={() => setUserUniqueErrors(errors => ({ ...errors, email: "" }))}
                      style={userUniqueErrors.email ? { borderColor: "var(--red)" } : undefined}
                    />
                    {userUniqueErrors.email && <div className="fs12" style={{ color: "var(--red)", marginTop: "4px" }}>{userUniqueErrors.email}</div>}
                  </div>
                  <div className="fg">
                    <label className="lbl">เบอร์โทรศัพท์</label>
                    <input 
                      className="inp" 
                      name="phone_number" 
                      placeholder="0XX-XXX-XXXX" 
                      value={phoneNumber} 
                      onChange={e => {
                        setPhoneNumber(formatPhone(e.target.value));
                        setUserUniqueErrors(errors => ({ ...errors, phone: "" }));
                      }}
                      style={userUniqueErrors.phone ? { borderColor: "var(--red)" } : undefined}
                      maxLength={12} 
                    />
                    {userUniqueErrors.phone && <div className="fs12" style={{ color: "var(--red)", marginTop: "4px" }}>{userUniqueErrors.phone}</div>}
                  </div>
                </div>
                <div className="g2">
                  <div className="fg mb8">
                    <label className="lbl">สายงาน <span style={{ color: "var(--red)" }}>*</span></label>
                    <select className="sel" name="workline" value={workline} onChange={e => { setWorkline(e.target.value); setDept1(""); setDept2(""); setDept3(""); setPosition(""); setLevel(""); }} required>
                      <option value="">— เลือกสายงาน —</option>
                      {worklines.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                  {workline === "สายวิชาการ" && (
                    <div className="fg anim-fade-in">
                      <label className="lbl">กลุ่มงาน <span style={{ color: "var(--red)" }}>*</span></label>
                      <select className="sel" value={position} onChange={e => { setPosition(e.target.value); setLevel(""); }} required>
                        <option value="">— เลือกกลุ่มงาน —</option>
                        {getPositionOptions().map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  )}
                  {workline === "สายสนับสนุน" && (
                    <div className="fg anim-fade-in">
                      <label className="lbl">กลุ่มงาน <span style={{ color: "var(--red)" }}>*</span></label>
                      <select className="sel" value={dept1} onChange={e => { setDept1(e.target.value); setPosition(""); setLevel(""); }} required>
                        <option value="">— เลือกกลุ่มงาน —</option>
                        {supportJobFamilies.map(group => <option key={group} value={group}>{group}</option>)}
                      </select>
                    </div>
                  )}
                  {workline === "สายงานบริหาร" && (
                    <div className="fg anim-fade-in">
                      <label className="lbl">กลุ่มงาน / ส่วนงานบริหาร <span style={{ color: "var(--red)" }}>*</span></label>
                      <select className="sel" value={dept1} onChange={e => setDept1(e.target.value)} required>
                        <option value="">— เลือกกลุ่มงาน —</option>
                        {adminDepts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                <div className="g2" style={{ marginTop: '-4px' }}>
                  {workline === "สายสนับสนุน" && dept1 && (
                    <div className="fg mb8 anim-fade-in">
                      <label className="lbl">ตำแหน่ง <span style={{ color: "var(--red)" }}>*</span></label>
                      <select className="sel" value={position} onChange={e => { setPosition(e.target.value); setLevel(""); }} required>
                        <option value="">— เลือกตำแหน่ง —</option>
                        {getSupportPositionOptions().map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  )}
                  {workline === "สายงานบริหาร" && (
                    <div className="fg mb8">
                      <label className="lbl">ตำแหน่ง <span style={{ color: "var(--red)" }}>*</span></label>
                      <select className="sel" value={position} onChange={e => { setPosition(e.target.value); setLevel(""); }} required>
                        <option value="">— เลือกตำแหน่ง —</option>
                        {getPositionOptions().map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  )}
                  {position && (
                    <div className="fg mb8">
                      <label className="lbl">ระดับตำแหน่ง <span style={{ color: "var(--red)" }}>*</span></label>
                      <select className="sel" name="level" value={level} onChange={e => setLevel(e.target.value)} required>
                        <option value="">— เลือกระดับตำแหน่ง —</option>
                        {(workline === 'สายสนับสนุน' ? supportPosList : (workline === 'สายงานบริหาร' ? adminPosList : academicPosList)).map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                <div className="divider" />
                <div className="g2">
                  <div className="fg">
                    <label className="lbl">บทบาทในระบบ <span style={{ color: "var(--red)" }}>*</span></label>
                    <select className="sel" name="role_id" value={roleId} onChange={e => { setRoleId(e.target.value); setSupervisor(""); setSupervisorSearch(""); setEvaluator2(""); setEvaluator2Search(""); setEvaluatorPairError(""); }} required>
                      <option value="employee">บุคลากร</option>
                      <option value="supervisor">หัวหน้างาน</option>
                      <option value="manager_dept">ผู้บังคับบัญชา</option>
                      <option value="manager">ผู้บริหารคณะ</option>
                      <option value="hr">งานทรัพยากรบุคคล</option>
                      <option value="admin">ผู้ดูแลระบบ</option>
                    </select>
                  </div>
                  {roleId !== "manager" && (
                    <div className="fg anim-fade-in">
                      <label className="lbl">ผู้ประเมินลำดับที่ 1 <span style={{ color: "var(--red)" }}>*</span></label>
                      <input
                        className="inp"
                        value={supervisorSearch}
                        onChange={e => {
                          setSupervisorSearch(e.target.value);
                          setSupervisor("");
                          setEvaluatorPairError("");
                        }}
                        placeholder="ค้นหาชื่อหรือ ID ผู้ประเมินลำดับที่ 1"
                        required={!supervisor}
                      />
                      {supervisor && <input name="supervisor" value={supervisor} readOnly hidden />}
                      {supervisorSearch && !supervisor && (
                        <div className="search-drop anim-fade-in">
                          {getSupervisorOptions().slice(0, 8).map(user => (
                            <button
                              key={user.sso}
                              type="button"
                              className="search-drop-item"
                              onClick={() => {
                                setSupervisor(user.n);
                                setSupervisorSearch(`${user.t}${user.n}`);
                                setEvaluatorPairError("");
                              }}
                            >
                              <span className="fw6">{user.t}{user.n}</span>
                              <span className="muted fs11">{user.p} · ID {user.sso}</span>
                            </button>
                          ))}
                          {getSupervisorOptions().length === 0 && (
                            <div className="muted fs12" style={{ padding: "10px 12px" }}>ไม่พบผู้ประเมินลำดับที่ 1 ที่เลือกได้</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {roleId === "manager" && (
                    <div className="fg">
                      <label className="lbl">ผู้ประเมินลำดับที่ 1</label>
                      <input className="inp" value="ระดับสูงสุด" readOnly />
                    </div>
                  )}
                </div>
                {showEvaluator2Field && (
                  <div className="g2">
                    <div className="fg anim-fade-in">
                      <label className="lbl">ผู้ประเมินลำดับที่ 2 <span style={{ color: "var(--red)" }}>*</span></label>
                      <input
                        className="inp"
                        value={evaluator2Search}
                        onChange={e => {
                          setEvaluator2Search(e.target.value);
                          setEvaluator2("");
                          setEvaluatorPairError("");
                        }}
                        placeholder="ค้นหาชื่อหรือ ID ผู้ประเมินลำดับที่ 2"
                        style={evaluatorPairError ? { borderColor: "var(--red)" } : undefined}
                        required={!evaluator2}
                      />
                      {evaluatorPairError && <div className="fs12" style={{ color: "var(--red)", marginTop: "4px" }}>{evaluatorPairError}</div>}
                      {evaluator2 && <input name="evaluator2" value={evaluator2} readOnly hidden />}
                      {evaluator2Search && !evaluator2 && (
                        <div className="search-drop anim-fade-in">
                          {getEvaluator2Options().slice(0, 8).map(user => (
                            <button
                              key={user.sso}
                              type="button"
                              className="search-drop-item"
                              onClick={() => {
                                setEvaluator2(user.n);
                                setEvaluator2Search(`${user.t}${user.n}`);
                                setEvaluatorPairError("");
                              }}
                            >
                              <span className="fw6">{user.t}{user.n}</span>
                              <span className="muted fs11">{user.p} · ID {user.sso}</span>
                            </button>
                          ))}
                          {getEvaluator2Options().length === 0 && (
                            <div className="muted fs12" style={{ padding: "10px 12px" }}>ไม่พบผู้ประเมินลำดับที่ 2</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="g2">
                  <div className="fg" style={{ alignSelf: 'center' }}>
                    <div className="flex ic g10">
                      <label className="lbl" style={{ margin: 0 }}>สถานะบัญชี</label>
                      <input type="checkbox" name="is_active" defaultChecked={modalData ? modalData.act : true} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                      <span className="fs12 muted">ใช้งานได้</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "20px", justifyContent: "flex-end" }}>
                  <button type="button" className="btn btn-s" onClick={closeModal}>ยกเลิก</button>
                  <button type="submit" className="btn btn-p">💾 บันทึก</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalType === 'modal-org-edit' && modalData && (
        <div className="mo">
          <div className="mo-box" style={{ width: "520px" }}>
            <div className="mo-h">
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800 }}>จัดการโครงสร้างองค์กร 🏗️</div>
                <div className="muted fs12">{modalData.t}{modalData.n} · (เดิม: {modalData.p})</div>
              </div>
              <button className="btn btn-s btn-sm" onClick={closeModal}>✕ ปิด</button>
            </div>
            <form onSubmit={(e) => {
               e.preventDefault();
               const fullDept = (workline === "สายสนับสนุน" || workline === "สายงานบริหาร") ? [dept1, dept2, dept3].filter(Boolean).join(" > ") : dept1;
               let autoSup = "";
               const parts = fullDept.split(" > ");
               if (parts.length === 3) autoSup = orgSups[fullDept] || orgSups[parts[0] + " > " + parts[1]] || orgSups[parts[0]] || "";
               else if (parts.length === 2) autoSup = orgSups[fullDept] || orgSups[parts[0]] || "";
               else autoSup = orgSups[fullDept] || "";
               
               setUsers(users.map(u => u.sso === modalData.sso ? { ...u, d: fullDept, sup: autoSup, w: workline } : u));
               alert("บันทึกข้อมูลโครงสร้างเรียบร้อยแล้ว");
               closeModal();
            }}>
              <div className="mo-b">
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '16px' }}>
                  <div className="g2">
                    <div className="fg">
                      <label className="lbl">1. สายงาน</label>
                      <select className="sel" value={workline} onChange={e => { setWorkline(e.target.value); setDept1(""); setDept2(""); setDept3(""); }} required>
                        <option value="">— เลือกสายงาน —</option>
                        {worklines.map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                    </div>
                    {workline === 'สายวิชาการ' && (
                      <div className="fg">
                        <label className="lbl">กลุ่มงาน</label>
                        <input className="inp" value={dept1} onChange={e => { setDept1(e.target.value); setDept2(""); setDept3(""); }} placeholder="กรอกกลุ่มงานที่สังกัด (ถ้ามี)" />
                      </div>
                    )}
                    {workline && workline !== 'สายวิชาการ' && (
                      <div className="fg" style={{ flex: workline === 'สายสนับสนุน' ? '1 0 100%' : '1', marginTop: workline === 'สายสนับสนุน' ? '8px' : '0' }}>
                        <label className="lbl">{workline === 'สายสนับสนุน' ? "ฝ่าย" : "กลุ่มงาน"}</label>
                        <select className="sel" value={dept1} onChange={e => { setDept1(e.target.value); setDept2(""); setDept3(""); }}>
                          <option value="">— เลือกกลุ่มงาน/ฝ่าย —</option>
                          {(workline === 'สายสนับสนุน' ? supportDeptsList : adminDepts).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                  {workline === "สายสนับสนุน" && dept1 && (
                    <div className="g2 mt8">
                      <div className="fg">
                        <label className="lbl">งาน</label>
                        <select className="sel" value={dept2} onChange={e => { setDept2(e.target.value); setDept3(""); }} required>
                          <option value="">— เลือกงาน —</option>
                          {(supportOrg[dept1]?.map((m: any) => m.work) || []).map((w: string) => <option key={w} value={w}>{w}</option>)}
                        </select>
                      </div>
                      <div className="fg">
                        <label className="lbl">หน่วย</label>
                        <select className="sel" value={dept3} onChange={e => setDept3(e.target.value)} required>
                          <option value="">— เลือกหน่วย —</option>
                          {(supportOrg[dept1]?.find((m: any) => m.work === dept2)?.units || []).map((u: string) => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "24px", justifyContent: "flex-end" }}>
                  <button type="button" className="btn btn-s" onClick={closeModal}>ยกเลิก</button>
                  <button type="submit" className="btn btn-p">💾 ยืนยันการเปลี่ยนโครงสร้าง</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalType === 'modal-catalog' && (
        <div className="mo">
          <div className="mo-box" style={{ width: "520px" }}>
            <div className="mo-h">
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800 }}>เพิ่มกิจกรรมใน Learning Catalog</div>
                <div className="muted fs12">learning_catalog table</div>
              </div>
              <button className="btn btn-s btn-sm" onClick={closeModal}>✕</button>
            </div>
            <div className="mo-b">
              <div className="fg">
                <label className="lbl">ชื่อกิจกรรม / หลักสูตร</label>
                <input className="inp" placeholder="เช่น อบรม AI & Data Analytics" />
              </div>
              <div className="fg">
                <label className="lbl">ประเภท (70:20:10)</label>
                <select className="sel">
                  <option value="experiential">70% — Experiential Learning (OJT, Project, Job Rotation)</option>
                  <option value="social">20% — Social Learning (Coaching, Mentoring, Peer)</option>
                  <option value="formal">10% — Formal Training (อบรม, e-Learning, Workshop)</option>
                </select>
              </div>
              <div className="fg">
                <label className="lbl">ผู้จัด / ผู้ให้บริการ</label>
                <input className="inp" placeholder="เช่น ศูนย์คอมพิวเตอร์ KKU, ภายนอก" />
              </div>
              <div className="fg">
                <label className="lbl">ค่าใช้จ่าย (บาท)</label>
                <input className="inp" type="number" placeholder="0" min="0" />
              </div>
              <div className="fg" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label className="lbl" style={{ margin: 0 }}>สถานะ</label>
                <input type="checkbox" defaultChecked={true} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                <span className="fs12 muted">เปิดใช้งาน</span>
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "16px", justifyContent: "flex-end" }}>
                <button className="btn btn-s" onClick={closeModal}>ยกเลิก</button>
                <button className="btn btn-p" onClick={() => { closeModal(); alert("เพิ่มกิจกรรมสำเร็จ!"); }}>💾 บันทึก</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
