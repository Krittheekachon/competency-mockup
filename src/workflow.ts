export type RoleKey = "employee" | "supervisor" | "department_head" | "dean" | "hr" | "admin";

export type AssessmentStatus =
  | "draft"
  | "self_submitted"
  | "pending_supervisor"
  | "pending_department_head"
  | "approved"
  | "rejected";

export type IDPStatus =
  | "draft"
  | "submitted"
  | "in_progress"
  | "evidence_submitted"
  | "completed"
  | "rejected";

export interface BehaviorIndicator {
  id: string;
  level: number;
  order: number;
  text: string;
  weight: number;
}

export interface WorkflowCompetency {
  code: string;
  name: string;
  type: "CC" | "MC" | "FC" | "FC1" | "FC2";
  tagClass: string;
  expectedLevel: number;
  indicators: BehaviorIndicator[];
}

export interface AssessmentRecord {
  userSso: string;
  checkedBehaviorIds: string[];
  comments: Record<string, string>;
  status: AssessmentStatus;
  supervisorComment?: string;
  departmentHeadComment?: string;
}

export interface GapResult {
  competency: WorkflowCompetency;
  expectedScore: number;
  actualScore: number;
  gap: number;
  missingBehaviors: BehaviorIndicator[];
}

export interface IDPActivity {
  id: string;
  userSso: string;
  competencyCode: string;
  behaviorIds: string[];
  target: string;
  learningType: string;
  learningWeight: number;
  activityDetail: string;
  kpi: string;
  startDate: string;
  endDate: string;
  approvalStatus?: "draft" | "submitted" | "approved" | "rejected";
  approvedBy?: string;
  approvedAt?: string;
  status: IDPStatus;
  evidenceFiles?: string[];
  evidenceUrl?: string;
  progressComment?: string;
}

const indicators = (code: string, groups: string[][]): BehaviorIndicator[] =>
  groups.flatMap((items, level) =>
    items.map((text, index) => ({
      id: `${code}-${level + 1}.${index + 1}`,
      level: level + 1,
      order: level * 4 + index + 1,
      text,
      weight: 0.25
    }))
  );

export const WORKFLOW_COMPETENCIES: WorkflowCompetency[] = [
  {
    code: "CC-001",
    name: "การมุ่งเน้นผู้เรียนและผู้รับบริการ",
    type: "CC",
    tagClass: "tag-cc",
    expectedLevel: 2,
    indicators: indicators("CC-001", [
      [
        "ระบุผู้เรียนและผู้รับบริการที่เกี่ยวข้องกับงานของตนได้",
        "รับฟังความต้องการและข้อเสนอแนะขั้นต้นได้",
        "ตอบสนองต่อความต้องการตามบทบาทหน้าที่ได้",
        "รวบรวมข้อมูลความต้องการและความคาดหวังได้ครบถ้วน"
      ],
      [
        "วิเคราะห์ข้อมูลเพื่อระบุความต้องการของผู้รับบริการได้",
        "สื่อสารและให้บริการตรงกับความต้องการของแต่ละกลุ่ม",
        "จำแนกกลุ่มผู้รับบริการและปรับการปฏิบัติงานให้สอดคล้อง",
        "ให้คำแนะนำและติดตามผลหลังการให้บริการได้"
      ],
      [
        "เก็บรวบรวมข้อมูลความพึงพอใจอย่างเป็นระบบ",
        "วิเคราะห์ข้อมูลเพื่อปรับปรุงบริการได้",
        "จัดการข้อร้องเรียนหรือสถานการณ์ยากได้อย่างมืออาชีพ",
        "พัฒนารูปแบบบริการใหม่ที่ตอบความต้องการได้"
      ],
      [
        "สร้างความสัมพันธ์และความผูกพันกับผู้รับบริการอย่างต่อเนื่อง",
        "ใช้ข้อมูลสารสนเทศเพื่อกำหนดแนวทางบริหารจัดการความสัมพันธ์",
        "คาดการณ์ความต้องการล่วงหน้าและวางแผนบริการเชิงรุก",
        "ออกแบบระบบบริการที่ส่งมอบประสบการณ์ที่ดีอย่างต่อเนื่อง"
      ],
      [
        "กำหนดทิศทางหรือนโยบายด้านการตอบสนองผู้รับบริการ",
        "ค้นหาโอกาสเชิงกลยุทธ์เพื่อสร้างคุณค่าให้ผู้รับบริการ",
        "ให้คำปรึกษาในการแก้ปัญหาที่ซับซ้อนด้านผู้รับบริการ",
        "ขับเคลื่อนวัฒนธรรมที่มุ่งสร้างประสบการณ์ที่ดีในทุกระดับ"
      ]
    ])
  },
  {
    code: "CC-002",
    name: "การมุ่งผลสัมฤทธิ์",
    type: "CC",
    tagClass: "tag-cc",
    expectedLevel: 2,
    indicators: indicators("CC-002", [
      [
        "เข้าใจเป้าหมายงานที่ได้รับมอบหมาย",
        "วางแผนงานของตนเองตามกำหนดเวลา",
        "ติดตามความคืบหน้างานอย่างสม่ำเสมอ",
        "ส่งมอบงานตามมาตรฐานขั้นต่ำได้"
      ],
      [
        "ปรับวิธีทำงานเพื่อให้งานเสร็จตามเป้าหมาย",
        "แก้ปัญหาเบื้องต้นที่กระทบผลลัพธ์งานได้",
        "ประเมินผลลัพธ์งานของตนและปรับปรุงต่อเนื่อง",
        "ประสานงานเพื่อให้ผลลัพธ์ภาพรวมสำเร็จ"
      ],
      [
        "ตั้งเป้าหมายเชิงคุณภาพและปริมาณที่ชัดเจน",
        "วิเคราะห์อุปสรรคและจัดลำดับความสำคัญได้",
        "ผลักดันงานที่ซับซ้อนให้สำเร็จตามเป้าหมาย",
        "ถ่ายทอดแนวทางเพิ่มผลสัมฤทธิ์ให้ผู้อื่นได้"
      ],
      [
        "กำหนดตัวชี้วัดที่เชื่อมโยงเป้าหมายระดับหน่วยงาน",
        "บริหารทรัพยากรและความเสี่ยงเพื่อให้ผลลัพธ์สำเร็จ",
        "ปรับปรุงกระบวนการทำงานเพื่อเพิ่มประสิทธิภาพอย่างเป็นระบบ",
        "โค้ชทีมให้ยกระดับผลสัมฤทธิ์ของงานร่วมกัน"
      ],
      [
        "กำหนดกลยุทธ์เพื่อยกระดับผลสัมฤทธิ์ขององค์กร",
        "ขับเคลื่อนการเปลี่ยนแปลงที่สร้างผลลัพธ์ระยะยาว",
        "ใช้ข้อมูลเชิงลึกตัดสินใจในสถานการณ์ที่ซับซ้อน",
        "สร้างมาตรฐานผลสัมฤทธิ์ที่หน่วยงานอื่นนำไปใช้ได้"
      ]
    ])
  },
  {
    code: "CC-003",
    name: "การทำงานเป็นทีม",
    type: "CC",
    tagClass: "tag-cc",
    expectedLevel: 2,
    indicators: indicators("CC-003", [
      [
        "รับผิดชอบงานของตนในทีมตามที่ได้รับมอบหมาย",
        "รับฟังข้อมูลจากสมาชิกทีม",
        "แจ้งปัญหาที่กระทบงานทีมได้",
        "ร่วมประชุมและติดตามงานทีมตามรอบที่กำหนด"
      ],
      [
        "แบ่งปันข้อมูลและทรัพยากรกับทีมอย่างเต็มที่",
        "รับฟังความคิดเห็นผู้อื่นด้วยใจเปิดกว้าง",
        "ช่วยเหลือเพื่อนร่วมงานเมื่อมีปัญหา",
        "ประสานงานให้ทีมส่งมอบงานตามเป้าหมาย"
      ],
      [
        "จัดการความเห็นต่างด้วยเหตุผล",
        "สร้างบรรยากาศที่สมาชิกกล้าแลกเปลี่ยน",
        "เชื่อมทีมข้ามหน่วยเพื่อแก้ปัญหาร่วมกัน",
        "โค้ชสมาชิกให้ทำงานร่วมกันได้ดีขึ้น"
      ],
      [
        "ออกแบบรูปแบบความร่วมมือระหว่างทีมให้เกิดผลลัพธ์ร่วมกัน",
        "จัดการความขัดแย้งที่ซับซ้อนโดยคำนึงถึงทุกฝ่าย",
        "สร้างเครือข่ายการทำงานร่วมกับหน่วยงานอื่น",
        "ส่งเสริมวัฒนธรรมทีมที่รับผิดชอบผลลัพธ์ร่วมกัน"
      ],
      [
        "กำหนดทิศทางความร่วมมือระดับองค์กร",
        "สร้างพันธมิตรเชิงกลยุทธ์เพื่อผลลัพธ์ระยะยาว",
        "เป็นแบบอย่างด้านการทำงานร่วมกันในสถานการณ์ท้าทาย",
        "ขับเคลื่อนวัฒนธรรมการทำงานเป็นทีมทั่วทั้งองค์กร"
      ]
    ])
  },
  {
    code: "FC2-061",
    name: "การใช้เทคโนโลยีดิจิทัล",
    type: "FC2",
    tagClass: "tag-fc2",
    expectedLevel: 3,
    indicators: indicators("FC2-061", [
      [
        "ใช้เครื่องมือดิจิทัลพื้นฐานตามขั้นตอนได้",
        "จัดเก็บไฟล์งานให้ค้นหาได้",
        "ขอความช่วยเหลือเมื่อพบปัญหาการใช้งาน",
        "ปฏิบัติตามแนวทางความปลอดภัยข้อมูลพื้นฐาน"
      ],
      [
        "ใช้โปรแกรมสำนักงานได้คล่องแคล่ว",
        "เลือกเครื่องมือดิจิทัลที่เหมาะกับงานประจำ",
        "ใช้ระบบร่วมงานออนไลน์กับทีมได้",
        "รักษาความปลอดภัยข้อมูลในการทำงานประจำได้"
      ],
      [
        "ใช้เครื่องมือดิจิทัลช่วยวิเคราะห์และติดตามงาน",
        "ประยุกต์ใช้ระบบออนไลน์เพื่อลดงานซ้ำซ้อน",
        "ใช้ AI เบื้องต้นเพื่อเพิ่มประสิทธิภาพงานอย่างเหมาะสม",
        "แนะนำเครื่องมือดิจิทัลให้เพื่อนร่วมงานใช้ได้"
      ],
      [
        "ปรับปรุงกระบวนการทำงานด้วยเทคโนโลยีดิจิทัล",
        "ประเมินความเสี่ยงข้อมูลจากการใช้เครื่องมือใหม่",
        "ออกแบบแนวทางใช้งานระบบดิจิทัลร่วมกันในทีม",
        "ถ่ายทอดแนวปฏิบัติด้านดิจิทัลให้ผู้เกี่ยวข้อง"
      ],
      [
        "กำหนดแนวทางดิจิทัลที่สร้างผลลัพธ์ระดับหน่วยงาน",
        "ผลักดันการใช้เทคโนโลยีอย่างมีธรรมาภิบาล",
        "ติดตามแนวโน้มเทคโนโลยีเพื่อยกระดับงาน",
        "วางมาตรฐานการใช้ดิจิทัลที่องค์กรนำไปขยายผลได้"
      ]
    ])
  },
  {
    code: "FC2-062",
    name: "การวิเคราะห์ข้อมูล",
    type: "FC2",
    tagClass: "tag-fc2",
    expectedLevel: 2,
    indicators: indicators("FC2-062", [
      [
        "รวบรวมข้อมูลจากแหล่งที่กำหนดได้",
        "ตรวจสอบข้อมูลเบื้องต้นตามแบบฟอร์ม",
        "สรุปข้อเท็จจริงง่าย ๆ จากข้อมูลที่มี",
        "จัดเก็บข้อมูลให้พร้อมใช้งานต่อได้"
      ],
      [
        "จัดหมวดหมู่และตรวจความครบถ้วนของข้อมูล",
        "เปรียบเทียบข้อมูลพื้นฐานเพื่อหาความต่าง",
        "สร้างตารางหรือกราฟพื้นฐานประกอบรายงาน",
        "อธิบายผลสรุปข้อมูลให้ผู้เกี่ยวข้องเข้าใจได้"
      ],
      [
        "วิเคราะห์ข้อมูลอย่างเป็นระบบตามโจทย์งาน",
        "นำเสนอข้อมูลในรูปแบบที่เข้าใจง่าย",
        "ใช้ข้อมูลสนับสนุนการตัดสินใจและแก้ปัญหา",
        "เสนอข้อค้นพบจากข้อมูลเพื่อปรับปรุงงานได้"
      ],
      [
        "วิเคราะห์ข้อมูลหลายมิติและตรวจความน่าเชื่อถือ",
        "อธิบายแนวโน้มและปัจจัยที่เกี่ยวข้องกับผลวิเคราะห์",
        "เสนอทางเลือกจากผลวิเคราะห์ให้ผู้เกี่ยวข้องตัดสินใจ",
        "ออกแบบรายงานหรือ dashboard เพื่อใช้ติดตามงาน"
      ],
      [
        "ออกแบบกรอบวิเคราะห์ข้อมูลให้ทีมใช้ร่วมกัน",
        "คาดการณ์ผลกระทบจากข้อมูลเชิงลึก",
        "กำหนดมาตรฐานการใช้ข้อมูลเพื่อยกระดับการตัดสินใจ",
        "ขับเคลื่อนวัฒนธรรมการใช้ข้อมูลในระดับหน่วยงาน"
      ]
    ])
  }
];

export const DEFAULT_CHECKED_BEHAVIOR_IDS = [
  "CC-001-1.1",
  "CC-001-1.2",
  "CC-001-1.3",
  "CC-001-1.4",
  "CC-001-2.1",
  "CC-001-2.2",
  "CC-002-1.1",
  "CC-002-1.2",
  "CC-002-1.3",
  "CC-002-1.4",
  "CC-003-1.1",
  "CC-003-1.2",
  "CC-003-1.3",
  "FC2-061-1.1",
  "FC2-061-1.2",
  "FC2-061-1.3",
  "FC2-062-1.1",
  "FC2-062-1.2",
  "FC2-062-1.3",
  "FC2-062-1.4"
];

export const expectedScoreFor = (competency: WorkflowCompetency) => competency.expectedLevel;

export const actualScoreFor = (competency: WorkflowCompetency, checkedBehaviorIds: string[]) =>
  competency.indicators
    .filter(indicator => checkedBehaviorIds.includes(indicator.id))
    .reduce((total, indicator) => total + indicator.weight, 0);

export const expectedBehaviorIdsFor = (competency: WorkflowCompetency) =>
  competency.indicators
    .filter(indicator => indicator.level <= competency.expectedLevel)
    .map(indicator => indicator.id);

export const missingBehaviorsFor = (competency: WorkflowCompetency, checkedBehaviorIds: string[]) =>
  competency.indicators.filter(indicator =>
    indicator.level <= competency.expectedLevel && !checkedBehaviorIds.includes(indicator.id)
  );

export const gapFor = (competency: WorkflowCompetency, checkedBehaviorIds: string[]): GapResult => {
  const expectedScore = expectedScoreFor(competency);
  const actualScore = actualScoreFor(competency, checkedBehaviorIds);
  return {
    competency,
    expectedScore,
    actualScore,
    gap: Number((actualScore - expectedScore).toFixed(2)),
    missingBehaviors: missingBehaviorsFor(competency, checkedBehaviorIds)
  };
};

export const gapResultsFor = (checkedBehaviorIds: string[]) =>
  WORKFLOW_COMPETENCIES.map(competency => gapFor(competency, checkedBehaviorIds));

export const nextUnlockedBehaviorId = (competency: WorkflowCompetency, checkedBehaviorIds: string[]) => {
  for (let index = 0; index < competency.indicators.length; index += 1) {
    const indicator = competency.indicators[index];
    if (!checkedBehaviorIds.includes(indicator.id)) return indicator.id;
  }
  return null;
};

export const canToggleBehavior = (
  competency: WorkflowCompetency,
  behaviorId: string,
  checkedBehaviorIds: string[]
) => checkedBehaviorIds.includes(behaviorId) || nextUnlockedBehaviorId(competency, checkedBehaviorIds) === behaviorId;

export const getDirectReports = (users: any[], currentUser: any) =>
  users.filter(user => user.sup === currentUser?.n && user.sso !== currentUser?.sso);

export const getDepartmentMembers = (users: any[], departmentHead: any) => {
  const dept = departmentHead?.d?.split(" > ")[0] || departmentHead?.d;
  return users.filter(user => {
    const userDept = user?.d?.split(" > ")[0] || user?.d;
    return dept && userDept === dept && user.sso !== departmentHead?.sso;
  });
};

export const statusLabel = (status?: string) => {
  if (status === "self_submitted") return "รอตรวจ";
  if (status === "pending_department_head" || status === "unit_evaluated") return "รอหัวหน้าฝ่าย";
  if (status === "approved" || status === "dean_approved") return "อนุมัติแล้ว";
  if (status === "rejected") return "ส่งกลับแก้ไข";
  return "ร่าง";
};

export const statusClass = (status?: string) => {
  if (status === "self_submitted") return "by";
  if (status === "pending_department_head" || status === "unit_evaluated") return "bo";
  if (status === "approved" || status === "dean_approved" || status === "completed") return "bg";
  if (status === "rejected") return "br";
  return "bgr";
};

export const learningSummary = (activities: { learningType: string; learningWeight: number }[]) => {
  const totals: Record<string, number> = {};
  activities.forEach(activity => {
    const key = activity.learningType || "ไม่ระบุ";
    totals[key] = (totals[key] || 0) + Number(activity.learningWeight || 0);
  });
  return Object.keys(totals).map(label => ({ label, value: totals[label] }));
};

export const MOCK_IDP_ACTIVITIES: IDPActivity[] = [
  {
    id: "idp-1",
    userSso: "20002",
    competencyCode: "FC2-061",
    behaviorIds: ["FC2-061-1.4", "FC2-061-2.1", "FC2-061-2.2"],
    target: "พัฒนาการใช้เครื่องมือดิจิทัลให้รองรับงานประจำและการติดตามงาน",
    learningType: "Experiential Learning",
    learningWeight: 70,
    activityDetail: "ฝึกใช้งานระบบติดตามงานร่วมกับหัวหน้างานผ่านงานจริง",
    kpi: "จัดทำรายงานสถานะงานด้วยเครื่องมือดิจิทัลได้ครบถ้วน",
    startDate: "2026-06-15",
    endDate: "2026-09-30",
    approvalStatus: "approved",
    approvedBy: "นางกัญญารัตน์ ศรีวิชา",
    approvedAt: "2026-06-10",
    status: "in_progress",
    evidenceFiles: [],
    evidenceUrl: ""
  },
  {
    id: "idp-2",
    userSso: "20002",
    competencyCode: "CC-003",
    behaviorIds: ["CC-003-1.4", "CC-003-2.1"],
    target: "เพิ่มการประสานงานและการส่งต่องานในทีม",
    learningType: "Social Learning",
    learningWeight: 30,
    activityDetail: "รับคำปรึกษาจากหัวหน้างานและสรุปบทเรียนหลังจบงาน",
    kpi: "ทีมได้รับข้อมูลครบถ้วนและลดงานตกค้าง",
    startDate: "2026-06-15",
    endDate: "2026-08-31",
    approvalStatus: "approved",
    approvedBy: "นางกัญญารัตน์ ศรีวิชา",
    approvedAt: "2026-06-10",
    status: "evidence_submitted",
    evidenceFiles: ["สรุปรายงานผลการประสานงาน.pdf"],
    evidenceUrl: "https://example.com/evidence"
  }
];
