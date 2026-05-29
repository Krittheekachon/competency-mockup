import React, { useState } from 'react';
import { ArrowDownAZ, ArrowUpAZ } from 'lucide-react';
import { DEPT_STRUCTURE } from '../data';

export const ManagerGap: React.FC<{ users: any[] }> = ({ users }) => {
    const [openDept, setOpenDept] = useState<string | null>(null);
    const [openProblem, setOpenProblem] = useState<string | null>(null);
    const [worklineFilter, setWorklineFilter] = useState("all");
    const [assessmentFilter, setAssessmentFilter] = useState("assessed");
    const [deptSort, setDeptSort] = useState("risk");
    const [deptSortDir, setDeptSortDir] = useState<"asc" | "desc">("asc");

    const mockCompetencies = {
        digital: { n: "การใช้เทคโนโลยีดิจิทัล", t: "FC2", tg: "tag-fc2" },
        data: { n: "การวิเคราะห์ข้อมูล", t: "FC2", tg: "tag-fc2" },
        ai: { n: "AI Literacy", t: "CC", tg: "tag-cc" },
        teamwork: { n: "การทำงานเป็นทีม", t: "CC", tg: "tag-cc" },
        teaching: { n: "การสอนและถ่ายทอด", t: "FC1", tg: "tag-fc1" },
        leadership: { n: "Visionary Leadership", t: "MC", tg: "tag-mc" },
        result: { n: "การมุ่งผลสัมฤทธิ์", t: "CC", tg: "tag-cc" }
    };
    const mockScenarioUsers = [
        { n: "ตัวอย่าง เสี่ยงสูง 1", t: "นาย", sso: "MOCK-H01", p: "นักวิชาการคอมพิวเตอร์", w: "สายสนับสนุน", d: "ฝ่ายตัวอย่าง: ความเสี่ยงสูง", evalStatus: "unit_evaluated", act: true, mockFailedCompetencies: [mockCompetencies.digital, mockCompetencies.data] },
        { n: "ตัวอย่าง เสี่ยงสูง 2", t: "นางสาว", sso: "MOCK-H02", p: "นักวิเคราะห์ข้อมูล", w: "สายสนับสนุน", d: "ฝ่ายตัวอย่าง: ความเสี่ยงสูง", evalStatus: "unit_evaluated", act: true, mockFailedCompetencies: [mockCompetencies.digital] },
        { n: "ตัวอย่าง เสี่ยงสูง 3", t: "นาย", sso: "MOCK-H03", p: "นักจัดการงานทั่วไป", w: "สายสนับสนุน", d: "ฝ่ายตัวอย่าง: ความเสี่ยงสูง", evalStatus: "self_submitted", act: true, mockFailedCompetencies: [mockCompetencies.ai] },
        { n: "ตัวอย่าง เสี่ยงสูง 4", t: "นาง", sso: "MOCK-H04", p: "นักทรัพยากรบุคคล", w: "สายสนับสนุน", d: "ฝ่ายตัวอย่าง: ความเสี่ยงสูง", evalStatus: "dept_evaluated", act: true, mockFailedCompetencies: [mockCompetencies.teamwork] },
        { n: "ตัวอย่าง เสี่ยงสูง 5", t: "นาย", sso: "MOCK-H05", p: "เจ้าหน้าที่บริหารงาน", w: "สายสนับสนุน", d: "ฝ่ายตัวอย่าง: ความเสี่ยงสูง", evalStatus: "unit_evaluated", act: true, mockFailedCompetencies: [] },
        { n: "ตัวอย่าง เฝ้าระวัง 1", t: "ผศ.ดร.", sso: "MOCK-W01", p: "อาจารย์", w: "สายวิชาการ", d: "ฝ่ายตัวอย่าง: เฝ้าระวัง", evalStatus: "unit_evaluated", act: true, mockFailedCompetencies: [mockCompetencies.ai] },
        { n: "ตัวอย่าง เฝ้าระวัง 2", t: "รศ.ดร.", sso: "MOCK-W02", p: "อาจารย์", w: "สายวิชาการ", d: "ฝ่ายตัวอย่าง: เฝ้าระวัง", evalStatus: "unit_evaluated", act: true, mockFailedCompetencies: [mockCompetencies.teaching] },
        { n: "ตัวอย่าง เฝ้าระวัง 3", t: "ผศ.ดร.", sso: "MOCK-W03", p: "อาจารย์", w: "สายวิชาการ", d: "ฝ่ายตัวอย่าง: เฝ้าระวัง", evalStatus: "dept_evaluated", act: true, mockFailedCompetencies: [] },
        { n: "ตัวอย่าง เฝ้าระวัง 4", t: "ดร.", sso: "MOCK-W04", p: "นักวิจัย", w: "สายวิชาการ", d: "ฝ่ายตัวอย่าง: เฝ้าระวัง", evalStatus: "unit_evaluated", act: true, mockFailedCompetencies: [] },
        { n: "ตัวอย่าง เฝ้าระวัง 5", t: "อ.", sso: "MOCK-W05", p: "อาจารย์", w: "สายวิชาการ", d: "ฝ่ายตัวอย่าง: เฝ้าระวัง", evalStatus: "self_submitted", act: true, mockFailedCompetencies: [] },
        { n: "ตัวอย่าง เกณฑ์ดี 1", t: "รศ.ดร.", sso: "MOCK-G01", p: "รองคณบดี", w: "สายงานบริหาร", d: "ฝ่ายตัวอย่าง: อยู่ในเกณฑ์ดี", evalStatus: "dean_approved", act: true, mockFailedCompetencies: [] },
        { n: "ตัวอย่าง เกณฑ์ดี 2", t: "ผศ.ดร.", sso: "MOCK-G02", p: "ผู้ช่วยคณบดี", w: "สายงานบริหาร", d: "ฝ่ายตัวอย่าง: อยู่ในเกณฑ์ดี", evalStatus: "dean_approved", act: true, mockFailedCompetencies: [] },
        { n: "ตัวอย่าง เกณฑ์ดี 3", t: "นาย", sso: "MOCK-G03", p: "นักจัดการงานทั่วไป", w: "สายสนับสนุน", d: "ฝ่ายตัวอย่าง: อยู่ในเกณฑ์ดี", evalStatus: "unit_evaluated", act: true, mockFailedCompetencies: [] },
        { n: "ตัวอย่าง เกณฑ์ดี 4", t: "นางสาว", sso: "MOCK-G04", p: "นักวิชาการศึกษา", w: "สายสนับสนุน", d: "ฝ่ายตัวอย่าง: อยู่ในเกณฑ์ดี", evalStatus: "unit_evaluated", act: true, mockFailedCompetencies: [] },
        { n: "ตัวอย่าง เกณฑ์ดี 5", t: "นาย", sso: "MOCK-G05", p: "นักเทคโนโลยีสารสนเทศ", w: "สายสนับสนุน", d: "ฝ่ายตัวอย่าง: อยู่ในเกณฑ์ดี", evalStatus: "dept_evaluated", act: true, mockFailedCompetencies: [] },
        { n: "ตัวอย่าง ยังไม่ประเมิน 1", t: "นาย", sso: "MOCK-N01", p: "เจ้าหน้าที่บริหารงาน", w: "สายสนับสนุน", d: "ฝ่ายตัวอย่าง: ยังไม่มีการประเมิน", evalStatus: "draft", act: true, mockFailedCompetencies: [] },
        { n: "ตัวอย่าง ยังไม่ประเมิน 2", t: "นาง", sso: "MOCK-N02", p: "นักวิชาการเงินและบัญชี", w: "สายสนับสนุน", d: "ฝ่ายตัวอย่าง: ยังไม่มีการประเมิน", evalStatus: "draft", act: true, mockFailedCompetencies: [] },
        { n: "ตัวอย่าง ยังไม่ประเมิน 3", t: "ผศ.ดร.", sso: "MOCK-N03", p: "อาจารย์", w: "สายวิชาการ", d: "ฝ่ายตัวอย่าง: ยังไม่มีการประเมิน", evalStatus: "draft", act: true, mockFailedCompetencies: [] }
    ];
    const activeUsers = [...users.filter(user => user.act !== false), ...mockScenarioUsers];
    const getSeed = (value: string) => value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const getTopDept = (user: any) => {
        if (!user.d) return "ไม่ระบุหน่วยงาน";
        return user.d.includes(" > ") ? user.d.split(" > ")[0] : user.d;
    };
    const getGroupName = (user: any) => {
        if (!user.d) return "ไม่ระบุกลุ่มงาน";
        const parts = user.d.split(" > ");
        if (user.w === "สายสนับสนุน") return parts[1] || parts[0] || "ไม่ระบุกลุ่มงาน";
        if (user.w === "สายวิชาการ") return parts[0] || user.p || "ไม่ระบุกลุ่มงาน";
        if (user.w === "สายงานบริหาร") return parts[0] || user.p || "ไม่ระบุกลุ่มงาน";
        return parts[0] || user.d;
    };
    const isAssessedUser = (user: any) => !["draft", "", undefined, null].includes(user.evalStatus);
    const getMockFailedCompetencies = (user: any) => {
        if (Array.isArray(user.mockFailedCompetencies)) return user.mockFailedCompetencies;
        if (!isAssessedUser(user)) return [];

        const seed = getSeed(`${user.sso || ""}${user.n || ""}`);
        if (seed % 5 === 0 || user.evalStatus === "dean_approved") return [];

        const supportItems = [
            { n: "การใช้เทคโนโลยีดิจิทัล", t: "FC2", tg: "tag-fc2" },
            { n: "การวิเคราะห์ข้อมูล", t: "FC2", tg: "tag-fc2" },
            { n: "AI Literacy", t: "CC", tg: "tag-cc" },
            { n: "การทำงานเป็นทีม", t: "CC", tg: "tag-cc" }
        ];
        const academicItems = [
            { n: "AI Literacy", t: "CC", tg: "tag-cc" },
            { n: "การสอนและถ่ายทอด", t: "FC1", tg: "tag-fc1" },
            { n: "การวิเคราะห์ข้อมูล", t: "FC1", tg: "tag-fc1" },
            { n: "การสื่อสารเชิงวิชาการ", t: "FC1", tg: "tag-fc1" }
        ];
        const managementItems = [
            { n: "Visionary Leadership", t: "MC", tg: "tag-mc" },
            { n: "AI Literacy", t: "CC", tg: "tag-cc" },
            { n: "การมุ่งผลสัมฤทธิ์", t: "CC", tg: "tag-cc" }
        ];
        const items = user.w === "สายวิชาการ"
            ? academicItems
            : user.w === "สายงานบริหาร"
                ? managementItems
                : supportItems;
        const failCount = (seed % 3) + 1;

        return items
            .filter((_, index) => (seed + index * 3) % 7 < 4)
            .slice(0, failCount);
    };
    const reportUsers = activeUsers.map(user => ({
        ...user,
        topDept: getTopDept(user),
        assessed: isAssessedUser(user),
        failedCompetencies: getMockFailedCompetencies(user)
    }));
    const worklineOptions = Array.from(new Set(reportUsers.map(user => user.w || "ไม่ระบุสายงาน")));
    const worklineFilteredUsers = worklineFilter === "all"
        ? reportUsers
        : reportUsers.filter(user => (user.w || "ไม่ระบุสายงาน") === worklineFilter);
    const filteredReportUsers = assessmentFilter === "all"
        ? worklineFilteredUsers
        : worklineFilteredUsers.filter(user => assessmentFilter === "assessed" ? user.assessed : !user.assessed);
    const assessedUsers = filteredReportUsers.filter(user => user.assessed);
    const passedUsers = assessedUsers.filter(user => user.failedCompetencies.length === 0);
    const failedUsers = assessedUsers.filter(user => user.failedCompetencies.length > 0);
    const worklineSummary = Array.from(new Set(filteredReportUsers.map(user => user.w || "ไม่ระบุสายงาน")))
        .map(workline => `${workline.replace("สาย", "")} ${filteredReportUsers.filter(user => (user.w || "ไม่ระบุสายงาน") === workline).length}`)
        .join(" · ");
    const totalStaff = filteredReportUsers.length;
    const assessed = assessedUsers.length;
    const passed = passedUsers.length;
    const failed = failedUsers.length;
    const passPct = assessed ? Math.round((passed / assessed) * 100) : 0;

    const deptRows = [
        { n: "สำนักงานคณะฯ", total: 55, assessed: 55, pass: 43, fail: 12, lines: [
            { n: "สายบริหาร", total: 20, fail: 3, weakDetail: [{ n: "การสื่อสาร", cnt: 3 }] },
            { n: "สายการเงิน", total: 22, fail: 5, weakDetail: [{ n: "การใช้เทคโนโลยีดิจิทัล", cnt: 4 }, { n: "การวิเคราะห์ข้อมูล", cnt: 3 }] },
            { n: "สายทรัพยากรบุคคล", total: 13, fail: 4, weakDetail: [{ n: "AI Literacy", cnt: 4 }] }
        ] },
        { n: "ภาควิชาวิศวฯ คอม", total: 52, assessed: 52, pass: 32, fail: 20, lines: [
            { n: "สายวิชาการ", total: 32, fail: 13, weakDetail: [{ n: "AI Literacy", cnt: 9 }, { n: "การวิเคราะห์ข้อมูล", cnt: 7 }] },
            { n: "สายสนับสนุน", total: 20, fail: 7, weakDetail: [{ n: "การใช้เทคโนโลยีดิจิทัล", cnt: 5 }] }
        ] },
        { n: "ภาควิชาวิศวฯ ไฟฟ้า", total: 43, assessed: 43, pass: 27, fail: 16, lines: [
            { n: "สายวิชาการ", total: 25, fail: 10, weakDetail: [{ n: "AI Literacy", cnt: 7 }] },
            { n: "สายสนับสนุน", total: 18, fail: 6, weakDetail: [{ n: "การใช้เทคโนโลยีดิจิทัล", cnt: 3 }, { n: "การทำงานเป็นทีม", cnt: 5 }] }
        ] },
        { n: "ภาควิชาวิศวฯ โยธา", total: 40, assessed: 40, pass: 22, fail: 18, lines: [
            { n: "สายวิชาการ", total: 23, fail: 11, weakDetail: [{ n: "การใช้เทคโนโลยีดิจิทัล", cnt: 7 }, { n: "AI Literacy", cnt: 7 }] },
            { n: "สายสนับสนุน", total: 17, fail: 7, weakDetail: [{ n: "การวิเคราะห์ข้อมูล", cnt: 7 }] }
        ] },
        { n: "ภาควิชาวิศวฯ อุตสาหการ", total: 30, assessed: 30, pass: 23, fail: 7, lines: [
            { n: "สายวิชาการ", total: 18, fail: 5, weakDetail: [{ n: "AI Literacy", cnt: 5 }] },
            { n: "สายสนับสนุน", total: 12, fail: 2, weakDetail: [{ n: "การใช้เทคโนโลยีดิจิทัล", cnt: 2 }] }
        ] }
    ];

    const problemGroups = [
        {
            label: "สายสนับสนุน",
            color: "var(--blue)",
            rows: [
                { n: "การใช้เทคโนโลยีดิจิทัล", t: "FC", tg: "tag-fc", count: 19, color: "var(--red)", width: 100 },
                { n: "การวิเคราะห์ข้อมูล", t: "FC", tg: "tag-fc", count: 16, color: "#f05a0a", width: 84 },
                { n: "AI Literacy", t: "CC", tg: "tag-cc", count: 10, color: "#d97706", width: 53 },
                { n: "การทำงานเป็นทีม", t: "CC", tg: "tag-cc", count: 8, color: "var(--teal)", width: 42 },
                { n: "การใช้เทคโนโลยีดิจิทัล", count: 19, color: "var(--red)", width: 100, depts: [{ d: "สำนักงานคณะฯ", c: 5 }, { d: "ภาควิชาวิศวฯ ไฟฟ้า", c: 3 }, { d: "ภาควิชาวิศวฯ โยธา", c: 4 }, { d: "ภาควิชาวิศวฯ อุตสาหการ", c: 2 }, { d: "ภาควิชาวิศวฯ คอม", c: 5 }] },
                { n: "การวิเคราะห์ข้อมูล", count: 16, color: "#f05a0a", width: 84, depts: [{ d: "สำนักงานคณะฯ", c: 5 }, { d: "ภาควิชาวิศวฯ โยธา", c: 7 }, { d: "ภาควิชาวิศวฯ คอม", c: 4 }] },
                { n: "AI Literacy", count: 10, color: "#d97706", width: 53, depts: [{ d: "สำนักงานคณะฯ", c: 4 }, { d: "ภาควิชาวิศวฯ ไฟฟ้า", c: 3 }, { d: "ภาควิชาวิศวฯ อุตสาหการ", c: 3 }] },
                { n: "การทำงานเป็นทีม", count: 8, color: "var(--teal)", width: 42, depts: [{ d: "ภาควิชาวิศวฯ ไฟฟ้า", c: 5 }, { d: "ภาควิชาวิศวฯ โยธา", c: 3 }] }
            ]
        },
        {
            label: "สายวิชาการ",
            color: "var(--purple)",
            rows: [
                { n: "AI Literacy", t: "CC", tg: "tag-cc", count: 28, color: "var(--red)", width: 100 },
                { n: "การวิเคราะห์ข้อมูล", t: "FC", tg: "tag-fc", count: 14, color: "#f05a0a", width: 50 },
                { n: "การใช้เทคโนโลยีดิจิทัล", t: "FC", tg: "tag-fc", count: 13, color: "#d97706", width: 46 },
                { n: "การสื่อสารเชิงวิชาการ", t: "FC", tg: "tag-fc", count: 9, color: "var(--teal)", width: 32 },
                { n: "AI Literacy", count: 28, color: "var(--red)", width: 100, depts: [{ d: "ภาควิชาวิศวฯ คอม", c: 9 }, { d: "ภาควิชาวิศวฯ โยธา", c: 7 }, { d: "ภาควิชาวิศวฯ ไฟฟ้า", c: 7 }, { d: "ภาควิชาวิศวฯ อุตสาหการ", c: 5 }] },
                { n: "การวิเคราะห์ข้อมูล", count: 14, color: "#f05a0a", width: 50, depts: [{ d: "ภาควิชาวิศวฯ คอม", c: 7 }, { d: "ภาควิชาวิศวฯ โยธา", c: 4 }, { d: "ภาควิชาวิศวฯ ไฟฟ้า", c: 3 }] },
                { n: "การใช้เทคโนโลยีดิจิทัล", count: 13, color: "#d97706", width: 46, depts: [{ d: "ภาควิชาวิศวฯ โยธา", c: 7 }, { d: "ภาควิชาวิศวฯ คอม", c: 4 }, { d: "ภาควิชาวิศวฯ ไฟฟ้า", c: 2 }] }
            ]
        }
    ];

    const detailRows: Record<string, { n: string; t: string; tg: string; fail: number; note: string }[]> = {
        "สำนักงานคณะฯ": [
            { n: "การใช้เทคโนโลยีดิจิทัล", t: "FC", tg: "tag-fc", fail: 8, note: "ต้องพัฒนาเร่งด่วน" },
            { n: "การวิเคราะห์ข้อมูล", t: "FC", tg: "tag-fc", fail: 4, note: "ความเสี่ยงกลาง" }
        ],
        "ฝ่ายแผนยุทธศาสตร์และพัฒนาองค์กร": [
            { n: "AI Literacy", t: "CC", tg: "tag-cc", fail: 11, note: "ความเสี่ยงสูง" },
            { n: "การวิเคราะห์ข้อมูล", t: "FC", tg: "tag-fc", fail: 9, note: "ความเสี่ยงสูง" }
        ],
        "ฝ่ายการศึกษาและพัฒนาทักษะการเรียนรู้": [
            { n: "การใช้เทคโนโลยีดิจิทัล", t: "FC", tg: "tag-fc", fail: 9, note: "ความเสี่ยงสูง" },
            { n: "AI Literacy", t: "CC", tg: "tag-cc", fail: 7, note: "ความเสี่ยงกลาง" }
        ],
        "ฝ่ายวิจัย นวัตกรรมและการต่างประเทศ": [
            { n: "การวิเคราะห์ข้อมูลวิจัย", t: "FC", tg: "tag-fc", fail: 6, note: "ความเสี่ยงกลาง" },
            { n: "การสื่อสารเชิงวิชาการ", t: "FC", tg: "tag-fc", fail: 4, note: "ความเสี่ยงต่ำ" }
        ],
        "ฝ่ายบริหาร": [
            { n: "Visionary Leadership", t: "MC", tg: "tag-mc", fail: 4, note: "ความเสี่ยงกลาง" },
            { n: "การใช้เทคโนโลยีดิจิทัล", t: "FC", tg: "tag-fc", fail: 3, note: "ความเสี่ยงต่ำ" }
        ],
        "หน่วยงานสายวิชาการ": [
            { n: "AI Literacy", t: "CC", tg: "tag-cc", fail: 5, note: "ความเสี่ยงสูง" },
            { n: "การสื่อสารเชิงวิชาการ", t: "FC", tg: "tag-fc", fail: 3, note: "ความเสี่ยงกลาง" }
        ]
    };

    const aggregateWeakDetails = (people: typeof reportUsers) => {
        const weakMap = new Map<string, { n: string; cnt: number }>();

        people.forEach(user => {
            user.failedCompetencies.forEach(item => {
                const current = weakMap.get(item.n) || { n: item.n, cnt: 0 };
                current.cnt += 1;
                weakMap.set(item.n, current);
            });
        });

        return Array.from(weakMap.values()).sort((a, b) => b.cnt - a.cnt);
    };
    const reportDeptRows = Array.from(new Set(filteredReportUsers.map(user => user.topDept))).map(dept => {
        const deptUsers = filteredReportUsers.filter(user => user.topDept === dept);
        const deptAssessed = deptUsers.filter(user => user.assessed);
        const deptFailed = deptAssessed.filter(user => user.failedCompetencies.length > 0);
        const lines = Array.from(new Set(deptUsers.map(user => user.w || "ไม่ระบุสายงาน"))).map(workline => {
            const lineUsers = deptUsers.filter(user => (user.w || "ไม่ระบุสายงาน") === workline);
            const lineAssessed = lineUsers.filter(user => user.assessed);
            const lineFailed = lineAssessed.filter(user => user.failedCompetencies.length > 0);

            return {
                n: workline,
                total: lineUsers.length,
                fail: lineFailed.length,
                weakDetail: aggregateWeakDetails(lineFailed)
            };
        });

        return {
            n: dept,
            total: deptUsers.length,
            assessed: deptAssessed.length,
            pass: deptAssessed.length - deptFailed.length,
            fail: deptFailed.length,
            lines
        };
    }).sort((a, b) => b.total - a.total || a.n.localeCompare(b.n, "th"));
    const reportDetailRows: Record<string, { n: string; t: string; tg: string; fail: number; note: string }[]> = {};

    reportDeptRows.forEach(dept => {
        const deptUsers = filteredReportUsers.filter(user => user.topDept === dept.n && user.failedCompetencies.length > 0);
        const compMap = new Map<string, { n: string; t: string; tg: string; fail: number; note: string }>();

        deptUsers.forEach(user => {
            user.failedCompetencies.forEach(item => {
                const current = compMap.get(item.n) || { n: item.n, t: item.t, tg: item.tg, fail: 0, note: "" };
                current.fail += 1;
                current.note = "";
                compMap.set(item.n, current);
            });
        });

        reportDetailRows[dept.n] = Array.from(compMap.values()).sort((a, b) => b.fail - a.fail);
    });
    const sortSummaryRows = <T extends { n: string; total: number; pass: number; fail: number }>(rows: T[]) => {
        const direction = deptSortDir === "asc" ? 1 : -1;

        return [...rows].sort((a, b) => {
            let result = 0;
            if (deptSort === "pass") result = b.pass - a.pass || b.total - a.total || a.n.localeCompare(b.n, "th");
            else if (deptSort === "all") result = a.n.localeCompare(b.n, "th") || b.total - a.total;
            else result = b.fail - a.fail || b.total - a.total || a.n.localeCompare(b.n, "th");
            return result * direction;
        });
    };
    const reportWorklineRows = Array.from(new Set(filteredReportUsers.map(user => user.w || "ไม่ระบุสายงาน"))).map(workline => {
        const worklineUsers = filteredReportUsers.filter(user => (user.w || "ไม่ระบุสายงาน") === workline);
        const worklineAssessed = worklineUsers.filter(user => user.assessed);
        const worklineFailed = worklineAssessed.filter(user => user.failedCompetencies.length > 0);
        const groups = sortSummaryRows(Array.from(new Set(worklineUsers.map(getGroupName))).map(groupName => {
            const groupUsers = worklineUsers.filter(user => getGroupName(user) === groupName);
            const groupAssessed = groupUsers.filter(user => user.assessed);
            const groupFailed = groupAssessed.filter(user => user.failedCompetencies.length > 0);
            const weakDetail = aggregateWeakDetails(groupFailed);

            return {
                id: `${workline}-${groupName}`,
                n: groupName,
                total: groupUsers.length,
                assessed: groupAssessed.length,
                pass: groupAssessed.length - groupFailed.length,
                fail: groupFailed.length,
                weakDetail
            };
        }));

        return {
            n: workline,
            total: worklineUsers.length,
            assessed: worklineAssessed.length,
            pass: worklineAssessed.length - worklineFailed.length,
            fail: worklineFailed.length,
            groups
        };
    });
    const sortedReportWorklineRows = sortSummaryRows(reportWorklineRows);
    const reportProblemGroups = Array.from(new Set(filteredReportUsers.map(user => user.w || "ไม่ระบุสายงาน"))).map((workline, groupIndex) => {
        const worklineUsers = filteredReportUsers.filter(user => (user.w || "ไม่ระบุสายงาน") === workline);
        const compMap = new Map<string, { n: string; t: string; tg: string; count: number; depts: Map<string, number> }>();

        worklineUsers.forEach(user => {
            user.failedCompetencies.forEach(item => {
                const current = compMap.get(item.n) || { n: item.n, t: item.t, tg: item.tg, count: 0, depts: new Map<string, number>() };
                current.count += 1;
                current.depts.set(user.topDept, (current.depts.get(user.topDept) || 0) + 1);
                compMap.set(item.n, current);
            });
        });

        const rows = Array.from(compMap.values()).sort((a, b) => b.count - a.count);
        const maxCount = Math.max(...rows.map(row => row.count), 1);
        const colors = ["var(--red)", "#f05a0a", "#d97706", "var(--teal)", "var(--blue)"];

        return {
            label: workline,
            color: groupIndex % 2 === 0 ? "var(--blue)" : "var(--purple)",
            rows: rows.map((row, index) => ({
                n: row.n,
                t: row.t,
                tg: row.tg,
                count: row.count,
                color: colors[index % colors.length],
                width: Math.round((row.count / maxCount) * 100),
                depts: Array.from(row.depts.entries())
                    .map(([d, c]) => ({ d, c }))
                    .sort((a, b) => b.c - a.c)
            }))
        };
    }).filter(group => group.rows.length > 0);

    const getPct = (value: number, total: number) => total ? Math.round((value / total) * 100) : 0;
    const getRiskStatus = (dept: typeof deptRows[number]) => {
        if (!dept.assessed) {
            return { label: "ยังไม่มีการประเมิน", badge: "muted", rank: 3, color: "#94a3b8" };
        }

        const failPct = 100 - getPct(dept.pass, dept.assessed);

        if (failPct > 40) {
            return { label: " ความเสี่ยงสูง", badge: "br", rank: 0, color: "var(--red)" };
        }
        if (failPct >= 20) {
            return { label: "ต้องเฝ้าระวัง", badge: "by", rank: 1, color: "var(--yellow)" };
        }

        return { label: "อยู่ในเกณฑ์ดี", badge: "bg", rank: 2, color: "var(--green)" };
    };
    const getProblemTag = (name: string) => {
        if (name === "AI Literacy" || name === "การทำงานเป็นทีม") {
            return { label: "CC", cls: "tag-cc" };
        }

        return { label: "FC", cls: "tag-fc" };
    };

    const rankedDeptRows = [...reportDeptRows].sort((a, b) => {
        const aRisk = getRiskStatus(a);
        const bRisk = getRiskStatus(b);
        const aFailPct = a.assessed ? 100 - getPct(a.pass, a.assessed) : -1;
        const bFailPct = b.assessed ? 100 - getPct(b.pass, b.assessed) : -1;
        const aCoverage = getPct(a.assessed, a.total);
        const bCoverage = getPct(b.assessed, b.total);
        const direction = deptSortDir === "asc" ? 1 : -1;
        let result = 0;

        if (deptSort === "risk") result = aRisk.rank - bRisk.rank || bFailPct - aFailPct || b.fail - a.fail;
        else if (deptSort === "pass") result = b.pass - a.pass || b.total - a.total || a.n.localeCompare(b.n, "th");
        else result = a.n.localeCompare(b.n, "th") || b.total - a.total;

        return result * direction;
    });

    const getProblemDeptRows = (count: number) => {
        const deptNames = [
            "สำนักงานคณะฯ",
            "ภาควิชาวิศวฯ คอม",
            "ภาควิชาวิศวฯ ไฟฟ้า",
            "ภาควิชาวิศวฯ โยธา",
            "ภาควิชาวิศวฯ อุตสาหการ"
        ];
        let remaining = count;

        return deptNames.map((d, index) => {
            const slotsLeft = deptNames.length - index;
            const c = Math.max(1, Math.ceil(remaining / slotsLeft));
            remaining -= c;
            return { d, c };
        }).filter(row => row.c > 0);
    };

    return (
        <>
            <div className="mb20">
                <div className="sec-t" style={{ color: "var(--navy)", fontSize: "24px" }}>ภาพรวมผลการประเมินคณะ</div>
                <div className="sec-s">คณะวิศวกรรมศาสตร์ · รอบประเมิน 2568</div>
            </div>

            <div className="mb20" style={{ background: "var(--navy)", borderRadius: "16px", padding: "34px", color: "#fff", display: "grid", gridTemplateColumns: "1fr auto", gap: "20px", alignItems: "center" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(120px, 1fr))", gap: "0" }}>
                    {[
                        { l: "บุคลากรทั้งหมด", v: totalStaff, s: worklineSummary || "ยังไม่มีข้อมูลผู้ใช้", c: "#fff" },
                        { l: "ประเมินแล้ว", v: assessed, s: `รอ ${totalStaff - assessed} คน`, c: "#fff" },
                        { l: "ผ่านเกณฑ์", v: passed, s: ` คน`, c: "#4ade80" },
                        { l: "ไม่ผ่านเกณฑ์", v: failed, s: `คน`, c: "#fca5a5" }
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

            <div className="card mb16">
                <div className="ch">
                    <div>
                        <div className="ct">ผลรายสายงาน / กลุ่มงาน</div>
                        <div className="cs">เรียงจากสายงาน แล้วแสดงรายละเอียดรายกลุ่มงาน</div>
                    </div>
                    <div className="flex ic g6" style={{ flex: "0 0 auto" }}>
                        <span className="fs11 fw7 muted">สายงาน:</span>
                        <select
                            className="sel"
                            value={worklineFilter}
                            onChange={event => {
                                setWorklineFilter(event.target.value);
                                setOpenDept(null);
                                setOpenProblem(null);
                            }}
                            style={{ width: "160px", height: "32px", padding: "4px 10px", fontSize: "12px" }}
                        >
                            <option value="all">ทุกสายงาน</option>
                            {worklineOptions.map(workline => (
                                <option key={workline} value={workline}>{workline}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex ic g6" style={{ flex: "0 0 auto" }}>
                        <span className="fs11 fw7 muted">ผลประเมิน:</span>
                        <select
                            className="sel"
                            value={assessmentFilter}
                            onChange={event => {
                                setAssessmentFilter(event.target.value);
                                setOpenDept(null);
                                setOpenProblem(null);
                            }}
                            style={{ width: "170px", height: "32px", padding: "4px 10px", fontSize: "12px" }}
                        >
                            <option value="assessed">มีผลการประเมิน</option>
                            <option value="unassessed">ยังไม่มีผลการประเมิน</option>
                            <option value="all">ทั้งหมด</option>
                        </select>
                    </div>
                    <div className="flex ic g6" style={{ flex: "0 0 auto" }}>
                        <span className="fs11 fw7 muted">เรียงตาม:</span>
                        <select
                            className="sel"
                            value={deptSort}
                            onChange={event => {
                                setDeptSort(event.target.value);
                                setOpenDept(null);
                            }}
                            style={{ width: "160px", height: "32px", padding: "4px 10px", fontSize: "12px" }}
                        >
                            <option value="all">ทั้งหมด</option>
                            <option value="risk">จำนวนผู้ไม่ผ่าน</option>
                            <option value="pass">จำนวนผู้ผ่าน</option>
                        </select>
                        <button
                            type="button"
                            className="btn btn-s btn-xs"
                            title={deptSortDir === "asc" ? "เรียงจากน้อยไปมาก" : "เรียงจากมากไปน้อย"}
                            onClick={() => {
                                setDeptSortDir(prev => prev === "asc" ? "desc" : "asc");
                                setOpenDept(null);
                            }}
                            style={{ width: "32px", height: "32px", padding: 0, lineHeight: 1, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                        >
                            {deptSortDir === "asc" ? <ArrowUpAZ size={15} /> : <ArrowDownAZ size={15} />}
                        </button>
                    </div>
                    <div style={{ marginLeft: "auto", display: "flex", gap: "18px", flexWrap: "wrap", justifyContent: "flex-end", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                            <span className="fs11 fw7 muted">สีแถบผลประเมิน:</span>
                            <span className="flex ic g6 fs11 muted"><span style={{ width: "22px", height: "8px", borderRadius: "99px", background: "var(--green)", display: "inline-block" }} /> ผ่าน</span>
                            <span className="flex ic g6 fs11 muted"><span style={{ width: "22px", height: "8px", borderRadius: "99px", background: "#FECACA", display: "inline-block" }} /> ไม่ผ่าน</span>
                            <span className="flex ic g6 fs11 muted"><span style={{ width: "22px", height: "8px", borderRadius: "99px", background: "#e2e8f0", display: "inline-block" }} /> ยังไม่มีการประเมิน</span>
                        </div>
                    </div>
                </div>
                <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    {sortedReportWorklineRows.map(section => {
                        const sectionPassWidth = getPct(section.pass, section.assessed);
                        const sectionFailWidth = section.assessed ? 100 - sectionPassWidth : 0;
                        return (
                            <div key={section.n} style={{ border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden", background: "var(--bg)" }}>
                                <div style={{ padding: "14px 16px", background: "var(--navy)", color: "#fff", display: "grid", gridTemplateColumns: "minmax(180px, 1fr) 120px 140px minmax(180px, 1fr)", gap: "14px", alignItems: "center" }}>
                                    <div>
                                        <div className="fw8 fs14">{section.n}</div>
                                        <div className="fs11" style={{ color: "rgba(255,255,255,.62)", marginTop: "2px" }}>{section.groups.length} กลุ่มงาน · ประเมินแล้ว {section.assessed}/{section.total} คน</div>
                                    </div>
                                    <div style={{ textAlign: "center" }}>
                                        <div className="fw8 fs18">{section.total}</div>
                                        <div className="fs10" style={{ color: "rgba(255,255,255,.62)" }}>สมาชิกทั้งหมด</div>
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                        <div style={{ textAlign: "center", padding: "5px 8px", background: "rgba(34,197,94,.14)", borderRadius: "8px", border: "1px solid rgba(134,239,172,.35)" }}>
                                            <div className="fw8 fs14" style={{ color: "#86efac" }}>{section.pass}</div>
                                            <div className="fs10" style={{ color: "#bbf7d0" }}>ผ่าน</div>
                                        </div>
                                        <div style={{ textAlign: "center", padding: "5px 8px", background: "rgba(239,68,68,.14)", borderRadius: "8px", border: "1px solid rgba(252,165,165,.35)" }}>
                                            <div className="fw8 fs14" style={{ color: "#fca5a5" }}>{section.fail}</div>
                                            <div className="fs10" style={{ color: "#fecaca" }}>ไม่ผ่าน</div>
                                        </div>
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ height: "9px", borderRadius: "99px", overflow: "hidden", display: "flex", background: "rgba(255,255,255,.18)" }}>
                                            <div style={{ width: `${sectionPassWidth}%`, background: "var(--green)" }} />
                                            <div style={{ width: `${sectionFailWidth}%`, background: "#FECACA" }} />
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "10px", color: "rgba(255,255,255,.62)" }}>
                                            <span>{sectionPassWidth}%</span>
                                            <span>{sectionFailWidth}%</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                                    <div className="muted fs11 fw7" style={{ display: "grid", gridTemplateColumns: "minmax(220px, 1.3fr) 104px 128px minmax(180px, 1fr) 20px", alignItems: "center", gap: "12px", padding: "0 14px" }}>
                                        <span>กลุ่มงาน</span>
                                        <span style={{ textAlign: "center" }}>สมาชิกทั้งหมด</span>
                                        <span style={{ textAlign: "center" }}>ผลประเมิน</span>
                                        <span>สัดส่วนผ่าน / ไม่ผ่าน</span>
                                        <span />
                                    </div>
                                    {section.groups.map(group => {
                                        const passWidth = getPct(group.pass, group.assessed);
                                        const failWidth = group.assessed ? 100 - passWidth : 0;
                                        const isOpen = openDept === group.id;
                                        return (
                                            <div key={group.id} style={{ border: "1px solid var(--border)", borderRadius: "var(--r)", background: "#fff", overflow: "hidden" }}>
                                                <button
                                                    type="button"
                                                    onClick={() => setOpenDept(isOpen ? null : group.id)}
                                                    style={{ width: "100%", padding: "12px 14px", border: 0, background: "#fff", cursor: "pointer", display: "grid", gridTemplateColumns: "minmax(220px, 1.3fr) 104px 128px minmax(180px, 1fr) 20px", alignItems: "center", gap: "12px", textAlign: "left", fontFamily: "inherit" }}
                                                >
                                                    <div style={{ minWidth: 0 }}>
                                                        <div className="fw8 fs13" style={{ color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={group.n}>{group.n}</div>
                                                        <div className="muted fs11 mt4">{group.total} คน · ประเมินแล้ว {group.assessed} คน</div>
                                                    </div>
                                                    <div style={{ textAlign: "center" }}>
                                                        <div className="fw8 fs15" style={{ color: "var(--navy)" }}>{group.total}</div>
                                                        <div className="muted fs10">คน</div>
                                                    </div>
                                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                                        <div style={{ textAlign: "center", padding: "4px 8px", background: "var(--green-bg)", borderRadius: "var(--r)", border: "1px solid var(--green-md)" }}>
                                                            <div className="fw8 fs14" style={{ color: "var(--green)" }}>{group.pass}</div>
                                                            <div className="fs10 fw7" style={{ color: "var(--green)" }}>ผ่าน</div>
                                                        </div>
                                                        <div style={{ textAlign: "center", padding: "4px 8px", background: "var(--red-bg)", borderRadius: "var(--r)", border: "1px solid #FCA5A5" }}>
                                                            <div className="fw8 fs14" style={{ color: "var(--red)" }}>{group.fail}</div>
                                                            <div className="fs10 fw7" style={{ color: "var(--red)" }}>ไม่ผ่าน</div>
                                                        </div>
                                                    </div>
                                                    <div style={{ minWidth: 0 }}>
                                                        <div style={{ height: "10px", borderRadius: "6px", overflow: "hidden", display: "flex", background: "#e2e8f0" }}>
                                                            {group.assessed ? (
                                                                <>
                                                                    <div style={{ width: `${passWidth}%`, background: "var(--green)" }} />
                                                                    <div style={{ width: `${failWidth}%`, background: "#FECACA" }} />
                                                                </>
                                                            ) : (
                                                                <div style={{ width: "100%", background: "#e2e8f0" }} />
                                                            )}
                                                        </div>
                                                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3px" }}>
                                                            <span style={{ fontSize: "10px", color: "var(--text3)" }}>{passWidth}%</span>
                                                            <span style={{ fontSize: "10px", color: "var(--text3)" }}>{failWidth}%</span>
                                                        </div>
                                                    </div>
                                                    <span className="muted" style={{ justifySelf: "center" }}>{isOpen ? "▴" : "▾"}</span>
                                                </button>
                                                {isOpen && (
                                                    <div style={{ borderTop: "1px solid var(--border)", background: "#FFFBEB", padding: "10px 14px", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                                                        <span className="fw8 fs11" style={{ color: "var(--yellow)" }}>สมรรถนะที่ไม่ผ่าน</span>
                                                        {group.weakDetail.length ? group.weakDetail.map(weak => (
                                                            <span key={weak.n} style={{ fontSize: "11px", padding: "3px 8px", background: "var(--red-bg)", color: "var(--red)", borderRadius: "20px", fontWeight: 700 }}>
                                                                {weak.n} <span style={{ background: "var(--red)", color: "#fff", borderRadius: "10px", padding: "0 5px", fontSize: "10px" }}>{weak.cnt} คน</span>
                                                            </span>
                                                        )) : (
                                                            <span className="muted fs12">ไม่มีหัวข้อที่ไม่ผ่าน</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="card" style={{ borderRadius: "14px", overflow: "hidden" }}>
                <div className="ch" style={{ padding: "20px 22px", display: "block" }}>
                    <div className="ct" style={{ fontSize: "16px" }}>สมรรถนะที่มีปัญหา แยกตามสายงาน</div>
                    <div className="cs">CC = สมรรถนะหลัก · MC = สมรรถนะการบริหาร · FC = สมรรถนะตามสายงาน · กดที่รายการเพื่อดูว่ามาจากหน่วยงานใดบ้าง</div>
                </div>
                <div className="cb" style={{ padding: "12px 22px 22px" }}>
                    <div style={{ background: "var(--yellow-bg)", border: "1px solid #fde68a", borderRadius: "9px", color: "var(--yellow)", padding: "12px 16px", marginBottom: "20px", fontSize: "13px" }}>
                         บุคลากร 1 คนสามารถไม่ผ่านได้หลายสมรรถนะ ผลรวมอาจสูงกว่าจำนวนจริง
                    </div>
                    {reportProblemGroups.map((group) => (
                        <div key={group.label} style={{ marginBottom: "26px" }}>
                            <div className="b" style={{ background: group.color, color: "#fff", fontSize: "13px", padding: "7px 16px", borderRadius: "20px", marginBottom: "14px" }}>{group.label}</div>
                            {group.rows.map((row, idx) => {
                                const id = `${group.label}-${row.n}`;
                                const isOpen = openProblem === id;
                                const tag = getProblemTag(row.n);
                                return (
                                    <div key={id} className="mb10">
                                        <button
                                            type="button"
                                            onClick={() => setOpenProblem(isOpen ? null : id)}
                                            style={{ width: "100%", background: "#fff", border: "1px solid var(--border)", borderRadius: "9px", padding: "16px 20px", boxShadow: "var(--sh)", cursor: "pointer", display: "grid", gridTemplateColumns: "52px minmax(220px, 1fr) 250px 88px 20px", gap: "16px", alignItems: "center", textAlign: "left", fontFamily: "inherit" }}
                                        >
                                            <span style={{ width: "32px", height: "32px", borderRadius: "50%", background: row.color, color: "#fff", display: "grid", placeItems: "center", fontWeight: 800 }}>{idx + 1}</span>
                                            <span className="flex ic g8" style={{ minWidth: 0 }}>
                                                <span className={tag.cls}>{tag.label}</span>
                                                <span className="fw8 fs14" style={{ color: "var(--navy)" }}>{row.n}</span>
                                            </span>
                                            <span style={{ height: "8px", borderRadius: "999px", background: "#e2e8f0", overflow: "hidden", display: "block" }}>
                                                <span style={{ display: "block", height: "100%", width: `${row.width}%`, background: row.color, borderRadius: "999px" }} />
                                            </span>
                                            <span className="fw8 fs13" style={{ color: row.color, textAlign: "right" }}>{row.count} คน</span>
                                            <span className="muted" style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: ".15s" }}>⌄</span>
                                        </button>
                                        {isOpen && (
                                            <div style={{ margin: "8px 20px 0 72px", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg)" }}>
                                                <div className="fs12 muted mb8">รายหน่วยงาน</div>
                                                {row.depts.map(dep => (
                                                    <div key={dep.d} className="flex ic" style={{ padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
                                                        <span style={{ flex: 1, fontSize: "12px", color: "var(--text2)" }}>{dep.d}</span>
                                                        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--red)" }}>{dep.c} คน</span>
                                                    </div>
                                                ))}
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
    const getGroupName = (user: any) => {
        if (!user.d) return "ไม่ระบุกลุ่มงาน";
        const parts = user.d.split(" > ");
        if (user.w === "สายสนับสนุน") return parts[1] || parts[0] || "ไม่ระบุกลุ่มงาน";
        if (user.w === "สายวิชาการ") return parts[0] || user.p || "ไม่ระบุกลุ่มงาน";
        if (user.w === "สายงานบริหาร") return parts[0] || user.p || "ไม่ระบุกลุ่มงาน";
        return parts[0] || user.d;
    };
    const getIdpStatus = (user: any) => {
        if (user.evalStatus === "dean_approved") return "completed";
        if (user.evalStatus === "dept_evaluated") return "submitted";
        if (user.evalStatus === "unit_evaluated") return "in_progress";
        if (user.evalStatus === "self_submitted") return "draft";
        return "no_idp";
    };
    const getIdpTopic = (user: any) => {
        if (user.w === "สายวิชาการ") return "AI Literacy";
        if ((user.p || "").includes("คอมพิวเตอร์") || (user.d || "").includes("เทคโนโลยี")) return "ดิจิทัล & Data";
        if ((user.p || "").includes("ทรัพยากร")) return "การพัฒนาทรัพยากรบุคคล";
        return "สมรรถนะตามแผนพัฒนา";
    };
    const idpPeople = users
        .filter(user => user.act !== false && user.r !== "manager" && user.r !== "manager_dept")
        .map(user => ({
            ...user,
            groupName: getGroupName(user),
            idpStatus: getIdpStatus(user),
            idpTopic: getIdpTopic(user)
        }));
    const groupProgress = Array.from(new Set(idpPeople.map(user => String(user.groupName)))).map(groupName => {
        const members = idpPeople.filter(user => user.groupName === groupName);
        const hasIDP = members.filter(user => user.idpStatus !== "no_idp").length;

        return {
            d: groupName,
            total: members.length,
            hasIDP,
            members
        };
    }).sort((a, b) => (b.total - b.hasIDP) - (a.total - a.hasIDP) || b.total - a.total || String(a.d).localeCompare(String(b.d), "th"));
    const selectedDetail = groupProgress.find(group => group.d === selectedGroup);
    const totalFail = groupProgress.reduce((total, group) => total + group.total, 0);
    const totalHasIDP = groupProgress.reduce((total, group) => total + group.hasIDP, 0);
    const totalNoIDP = totalFail - totalHasIDP;
    const idpStats = {
        completed: idpPeople.filter(user => user.idpStatus === "completed").length,
        inProgress: idpPeople.filter(user => user.idpStatus === "in_progress").length,
        submitted: idpPeople.filter(user => user.idpStatus === "submitted").length,
        draft: idpPeople.filter(user => user.idpStatus === "draft").length,
        noIdp: totalNoIDP
    };
    const noProgress = idpPeople.filter(user => user.idpStatus === "no_idp");

    const statusMeta: Record<string, { label: string; badge: string }> = {
        completed: { label: "เสร็จสิ้น", badge: "bg" },
        in_progress: { label: "กำลังดำเนินการ", badge: "bt" },
        submitted: { label: "รออนุมัติ", badge: "by" },
        draft: { label: "Draft", badge: "bgr" },
        no_idp: { label: "ยังไม่ทำ IDP", badge: "bgr" }
    };

    const noProgressMeta: Record<string, { label: string; badge: string }> = {
        no_idp: { label: "ยังไม่ทำ IDP", badge: "bgr" },
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
                <div className="sec-t">ภาพรวม IDP คณะ </div>
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
                            </div>
                            <div className="fs12 muted mt4">ยังไม่ทำ IDP <span className="fw7 rc">{totalNoIDP} คน</span></div>
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
                <div className="sc"><div className="sl">ยังไม่ทำ IDP</div><div className="sv rc">{totalNoIDP}</div><div className="ss muted">คน</div></div>
            </div>

            <div className="g2 mb14">
                <div className="card">
                    <div className="ch"><div className="ct">ความคืบหน้า IDP รายกลุ่มงาน</div></div>
                    <div className="cb" style={{ padding: 0 }}>
                        {groupProgress.map(group => {
                            const pct = Math.round((group.hasIDP / group.total) * 100);
                            const noIdp = group.total - group.hasIDP;
                            const barColor = "var(--teal)";

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
                                        <span className="fs11 fw7" style={{ color: noIdp ? "var(--red)" : "var(--green)", textAlign: "right", width: "100px" }}>ยังไม่ทำ IDP {noIdp} คน</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="card">
                    <div className="ch">
                        <div>
                            <div className="ct">บุคลากรที่ยังไม่ทำ IDP</div>
                            <div className="cs">{noProgress.length} คน</div>
                        </div>
                        <button className="btn btn-p btn-sm" style={{ marginLeft: "auto" }} onClick={() => alert(`ส่งแจ้งเตือนไปยัง ${noProgress.length} คนแล้ว`)}>แจ้งเตือนทั้งหมด</button>
                    </div>
                    <div className="cb" style={{ padding: 0 }}>
                        {noProgress.map(item => {
                            const meta = noProgressMeta.no_idp;

                            return (
                            <div key={item.n} style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "8px" }}>
                                <div className="av" style={{ width: "30px", height: "30px", fontSize: "12px", background: "var(--navy)" }}>{item.n[0]}</div>
                                <div style={{ flex: 1 }}>
                                    <div className="fw6 fs12">{item.t}{item.n}</div>
                                    <div className="muted fs11">{item.p} · {item.groupName}</div>
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
                            <div className="fw8 fs14">{selectedDetail.d} · สมาชิกและสถานะ IDP</div>
                            <button className="btn btn-s btn-sm" onClick={() => setSelectedGroup(null)}>ปิด</button>
                        </div>
                        <div className="mo-b">
                            {selectedDetail.members.map(item => {
                                const meta = statusMeta[item.idpStatus];

                                return (
                                    <div key={item.n} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px" }}>
                                        <div className="av" style={{ width: "34px", height: "34px", fontSize: "13px", background: "var(--navy)" }}>{item.n[0]}</div>
                                        <div style={{ flex: 1 }}>
                                            <div className="fw6 fs13">{item.t}{item.n}</div>
                                            <div className="muted fs11">{item.p} · {item.idpStatus === "no_idp" ? "ยังไม่มีแผน IDP" : `เรื่อง: ${item.idpTopic}`}</div>
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

const getApprovalRows = (users: any[]) => {
    const activeStaff = users.filter(user => user.act !== false && user.r !== "manager").slice(0, 12);
    const fallback = [
        { n: "สมชาย มีสุข", t: "นาย", p: "นักวิชาการศึกษา", d: "สนับสนุนการศึกษาและวิชาการ", w: "สายสนับสนุน", sup: "กัญญารัตน์ ศรีวิชา", evaluator2: "ธนพล ไชยรักษ์" },
        { n: "มาลี ดีเสมอ", t: "นางสาว", p: "นักทรัพยากรบุคคล", d: "ทรัพยากรบุคคล", w: "สายสนับสนุน", sup: "พรพิมล บุคคลดี", evaluator2: "ธนพล ไชยรักษ์" },
        { n: "วิชัย ระบบดี", t: "นาย", p: "นักวิชาการคอมพิวเตอร์", d: "เทคโนโลยีสารสนเทศ", w: "สายสนับสนุน", sup: "ปกรณ์ ศิริวัฒน์", evaluator2: "ธนพล ไชยรักษ์" }
    ];
    const source = activeStaff.length ? activeStaff : fallback;

    return source.map((user, index) => {
        const deptParts = (user.d || "ไม่ระบุหน่วยงาน").split(" > ");
        const dept = deptParts[0] || "ไม่ระบุหน่วยงาน";
        const group = deptParts.length > 1 ? deptParts[deptParts.length - 1] : dept;
        const expectedScore = 4;
        const selfScore = 2 + (index % 3);
        const supervisorScore = Math.min(5, selfScore + (index % 2));
        const deptHeadScore = Math.min(5, supervisorScore + (index % 3 === 0 ? 1 : 0));
        const finalScore = deptHeadScore;
        const gapCount = index % 3;

        return {
        id: user.sso || `mock-${index}`,
        employee: `${user.t || ""}${user.n}`,
        position: user.p || "บุคลากร",
        dept,
        rawDept: user.d || "ไม่ระบุหน่วยงาน",
        group,
        workline: user.w || "ไม่ระบุสายงาน",
        evaluator1: user.sup || "",
        evaluator2: user.evaluator2 || "กิตติพงศ์ แสงทอง",
        expectedScore,
        selfScore,
        supervisorScore,
        deptHeadScore,
        finalScore,
        gapCount,
        approvalStatus: "pending",
        submittedAt: `${18 + (index % 6)} พ.ค. 2568`,
        competencyDetails: [
            { n: "AI Literacy", expected: 4, self: selfScore, supervisor: supervisorScore, deptHead: deptHeadScore, actual: finalScore, note: finalScore < 4 ? "มีช่องว่างระดับสมรรถนะ" : "ผ่านตามเกณฑ์" },
            { n: "การใช้เทคโนโลยีดิจิทัล", expected: 4, self: Math.max(1, selfScore - 1), supervisor: supervisorScore, deptHead: finalScore, actual: finalScore, note: finalScore < 4 ? "ควรพัฒนาเพิ่มเติม" : "ผ่านตามเกณฑ์" },
            { n: "การทำงานเป็นทีม", expected: 3, self: 3, supervisor: 3 + (index % 2), deptHead: 3 + (index % 2), actual: 3 + (index % 2), note: "อยู่ในเกณฑ์" }
        ],
        idpDetails: [
            { topic: "AI Literacy", method: "Workshop + OJT", due: "ก.ค. 2568", outcome: "ใช้ AI ช่วยงานประจำได้", cost: 2500, status: "รออนุมัติ" },
            { topic: "การวิเคราะห์ข้อมูล", method: "Online course", due: "ส.ค. 2568", outcome: "ทำ dashboard สรุปงานได้", cost: 1200, status: "รออนุมัติ" }
        ]
    };
    });
};

const getApprovalFilterOptions = (rows: any[]) => ({
    worklines: Array.from(new Set(rows.map(row => row.workline))).filter(Boolean),
    depts: Array.from(new Set(rows.map(row => row.dept))).filter(Boolean),
    groups: Array.from(new Set(rows.map(row => row.group))).filter(Boolean),
    positions: Array.from(new Set(rows.map(row => row.position))).filter(Boolean)
});

const filterApprovalRows = (rows: any[], filters: Record<string, string>) => rows.filter(row => (
    (filters.workline === "all" || row.workline === filters.workline) &&
    (filters.dept === "all" || row.dept === filters.dept) &&
    (filters.group === "all" || row.group === filters.group) &&
    (filters.position === "all" || row.position === filters.position)
));

const ApprovalFilters: React.FC<{ rows: any[]; filters: Record<string, string>; setFilters: any }> = ({ rows, filters, setFilters }) => {
    const options = getApprovalFilterOptions(rows);
    const update = (key: string, value: string) => setFilters((prev: Record<string, string>) => ({ ...prev, [key]: value }));

    return (
        <div className="card mb14">
            <div className="cb" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(160px, 1fr))", gap: "12px" }}>
                {[
                    { key: "workline", label: "สายงาน", values: options.worklines },
                    { key: "dept", label: "หน่วยงาน", values: options.depts },
                    { key: "group", label: "กลุ่มงาน", values: options.groups },
                    { key: "position", label: "ตำแหน่ง", values: options.positions }
                ].map(item => (
                    <label key={item.key} className="fg" style={{ margin: 0 }}>
                        <span className="lbl">{item.label}</span>
                        <select className="sel" value={filters[item.key]} onChange={event => update(item.key, event.target.value)}>
                            <option value="all">ทั้งหมด</option>
                            {item.values.map(value => <option key={value} value={value}>{value}</option>)}
                        </select>
                    </label>
                ))}
            </div>
        </div>
    );
};

export const ManagerAssessmentApproval: React.FC<{ users: any[] }> = ({ users }) => {
    const [approvedIds, setApprovedIds] = useState<string[]>([]);
    const [rejectedIds, setRejectedIds] = useState<string[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [filters, setFilters] = useState({ workline: "all", dept: "all", group: "all", position: "all" });
    const approvalRows = getApprovalRows(users);
    const filteredRows = filterApprovalRows(approvalRows, filters);
    const selected = approvalRows.find(row => row.id === selectedId);
    const approve = (id: string) => {
        setRejectedIds(prev => prev.filter(item => item !== id));
        setApprovedIds(prev => prev.includes(id) ? prev : [...prev, id]);
    };
    const reject = (id: string) => {
        setApprovedIds(prev => prev.filter(item => item !== id));
        setRejectedIds(prev => prev.includes(id) ? prev : [...prev, id]);
    };
    const getDecision = (id: string) => approvedIds.includes(id)
        ? { label: "อนุมัติแล้ว", badge: "bg" }
        : rejectedIds.includes(id)
            ? { label: "ไม่อนุมัติ", badge: "br" }
            : { label: "รออนุมัติ", badge: "by" };

    return (
        <>
            <div className="mb20">
                <div className="sec-t">อนุมัติผลการประเมินรายบุคคล</div>
                <div className="sec-s">ตรวจสอบผู้ถูกประเมิน หัวหน้างาน และผู้บังคับบัญชา ก่อนยืนยันผลการประเมิน</div>
            </div>
            <ApprovalFilters rows={approvalRows} filters={filters} setFilters={setFilters} />
            <div className="card">
                <div className="ch"><div className="ct">รายการผลการประเมินที่รออนุมัติ</div><div className="cs">{filteredRows.length} รายการ</div></div>
                <div className="cb" style={{ padding: 0 }}>
                    <table className="tbl">
                        <thead>
                            <tr>
                                <th>ผู้ถูกประเมิน</th>
                                <th>สายงาน / กลุ่มงาน</th>
                                <th>หัวหน้างาน</th>
                                <th>ผู้บังคับบัญชา</th>
                                <th style={{ width: "118px" }}>สถานะ</th>
                                <th style={{ width: "236px" }}>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRows.map(row => {
                                const decision = getDecision(row.id);
                                return (
                                    <tr key={row.id}>
                                        <td><div className="fw7 fs13">{row.employee}</div><div className="muted fs11">{row.position} · {row.dept}</div></td>
                                        <td><div className="fw6 fs12">{row.workline}</div><div className="muted fs11">{row.group}</div></td>
                                        <td><div className="fw6 fs12">{row.evaluator1 || "—"}</div></td>
                                        <td><div className="fw6 fs12">{row.evaluator2}</div></td>
                                        <td><span className={`b ${decision.badge}`}>{decision.label}</span></td>
                                        <td>
                                            <div className="flex ic g6">
                                                <button className="btn btn-s btn-xs" onClick={() => setSelectedId(row.id)}>ดูรายละเอียด</button>
                                                <button className="btn btn-p btn-xs" onClick={() => approve(row.id)}>อนุมัติ</button>
                                                <button className="btn btn-r btn-xs" onClick={() => reject(row.id)}>ไม่อนุมัติ</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            {selected && (
                <div className="mo" style={{ zIndex: 300 }} onMouseDown={() => setSelectedId(null)}>
                    <div className="mo-box" style={{ width: "1040px" }} onMouseDown={event => event.stopPropagation()}>
                        <div className="mo-h">
                            <div><div className="fw8 fs14">{selected.employee}</div><div className="muted fs11">{selected.evaluator1 || "ไม่มีหัวหน้างาน"} · {selected.evaluator2}</div></div>
                            <button className="btn btn-s btn-sm" onClick={() => setSelectedId(null)}>ปิด</button>
                        </div>
                        <div className="mo-b">
                            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
                                <table className="tbl" style={{ margin: 0 }}>
                                    <thead>
                                        <tr>
                                            <th>สมรรถนะ</th>
                                            <th style={{ width: "110px", textAlign: "center" }}>คาดหวัง</th>
                                            <th style={{ width: "130px", textAlign: "center" }}>ประเมินตนเอง</th>
                                            <th style={{ width: "120px", textAlign: "center" }}>หัวหน้าหน่วย</th>
                                            <th style={{ width: "130px", textAlign: "center" }}>ผู้บังคับบัญชา</th>
                                            <th style={{ width: "96px", textAlign: "center" }}>Gap</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selected.competencyDetails.map(item => {
                                            const gap = Math.max(0, item.expected - item.actual);

                                            return (
                                                <tr key={item.n}>
                                                    <td><div className="fw7 fs13">{item.n}</div></td>
                                                    <td style={{ textAlign: "center" }}><span className="b bgr" style={{ justifyContent: "center", minWidth: "54px" }}>{item.expected}</span></td>
                                                    <td style={{ textAlign: "center" }}><span className="b bt" style={{ justifyContent: "center", minWidth: "54px" }}>{item.self}</span></td>
                                                    <td style={{ textAlign: "center" }}><span className="b bt" style={{ justifyContent: "center", minWidth: "54px" }}>{item.supervisor}</span></td>
                                                    <td style={{ textAlign: "center" }}><span className="b by" style={{ justifyContent: "center", minWidth: "54px" }}>{item.deptHead}</span></td>
                                                    <td style={{ textAlign: "center" }}><span className={`b ${gap ? "br" : "bg"}`} style={{ justifyContent: "center", minWidth: "54px" }}>{gap}</span></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="muted fs11 mt8">ส่งเมื่อ {selected.submittedAt}</div>
                            <div className="flex ic g8 mt12">
                                <button className="btn btn-p btn-sm" onClick={() => approve(selected.id)} style={{ flex: 1, justifyContent: "center" }}>อนุมัติผลการประเมิน</button>
                                <button className="btn btn-r btn-sm" onClick={() => reject(selected.id)} style={{ flex: 1, justifyContent: "center" }}>ไม่อนุมัติ</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export const ManagerIDPApproval: React.FC<{ users: any[] }> = ({ users }) => {
    const [approvedIds, setApprovedIds] = useState<string[]>([]);
    const [rejectedIds, setRejectedIds] = useState<string[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [filters, setFilters] = useState({ workline: "all", dept: "all", group: "all", position: "all" });
    const approvalRows = getApprovalRows(users);
    const filteredRows = filterApprovalRows(approvalRows, filters);
    const selected = approvalRows.find(row => row.id === selectedId);
    const approve = (id: string) => {
        setRejectedIds(prev => prev.filter(item => item !== id));
        setApprovedIds(prev => prev.includes(id) ? prev : [...prev, id]);
    };
    const reject = (id: string) => {
        setApprovedIds(prev => prev.filter(item => item !== id));
        setRejectedIds(prev => prev.includes(id) ? prev : [...prev, id]);
    };
    const getDecision = (id: string) => approvedIds.includes(id)
        ? { label: "อนุมัติแล้ว", badge: "bg" }
        : rejectedIds.includes(id)
            ? { label: "ไม่อนุมัติ", badge: "br" }
            : { label: "รออนุมัติ", badge: "by" };

    return (
        <>
            <div className="mb20">
                <div className="sec-t">อนุมัติแผน IDP รายบุคคล</div>
                <div className="sec-s">ตรวจสอบแผน IDP จากหัวหน้างานและผู้บังคับบัญชา ก่อนยืนยันแผนพัฒนารายบุคคล</div>
            </div>
            <ApprovalFilters rows={approvalRows} filters={filters} setFilters={setFilters} />
            <div className="card">
                <div className="ch"><div className="ct">รายการแผน IDP ที่รออนุมัติ</div><div className="cs">{filteredRows.length} รายการ</div></div>
                <div className="cb" style={{ padding: 0 }}>
                    <table className="tbl">
                        <thead>
                            <tr>
                                <th>ผู้ถูกประเมิน</th>
                                <th>สายงาน / กลุ่มงาน</th>
                                <th>หัวหน้างาน</th>
                                <th>ผู้บังคับบัญชา</th>
                                <th>หัวข้อ IDP</th>
                                <th style={{ width: "118px" }}>สถานะ</th>
                                <th style={{ width: "236px" }}>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRows.map(row => {
                                const decision = getDecision(row.id);
                                return (
                                    <tr key={row.id}>
                                        <td><div className="fw7 fs13">{row.employee}</div><div className="muted fs11">{row.position} · {row.dept}</div></td>
                                        <td><div className="fw6 fs12">{row.workline}</div><div className="muted fs11">{row.group}</div></td>
                                        <td><div className="fw6 fs12">{row.evaluator1 || "—"}</div></td>
                                        <td><div className="fw6 fs12">{row.evaluator2}</div></td>
                                        <td><div className="flex ic g4" style={{ flexWrap: "wrap" }}>{row.idpDetails.map(item => <span key={item.topic} className="b bt">{item.topic}</span>)}</div></td>
                                        <td><span className={`b ${decision.badge}`}>{decision.label}</span></td>
                                        <td>
                                            <div className="flex ic g6">
                                                <button className="btn btn-s btn-xs" onClick={() => setSelectedId(row.id)}>ดูรายละเอียด</button>
                                                <button className="btn btn-t btn-xs" onClick={() => approve(row.id)}>อนุมัติ</button>
                                                <button className="btn btn-r btn-xs" onClick={() => reject(row.id)}>ไม่อนุมัติ</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            {selected && (
                <div className="mo" style={{ zIndex: 300 }} onMouseDown={() => setSelectedId(null)}>
                    <div className="mo-box" style={{ width: "920px" }} onMouseDown={event => event.stopPropagation()}>
                        <div className="mo-h">
                            <div><div className="fw8 fs14">{selected.employee}</div><div className="muted fs11">{selected.evaluator1 || "ไม่มีหัวหน้างาน"} · {selected.evaluator2}</div></div>
                            <button className="btn btn-s btn-sm" onClick={() => setSelectedId(null)}>ปิด</button>
                        </div>
                        <div className="mo-b">
                            <div className="mb12" style={{ display: "grid", gap: "12px" }}>
                                {selected.competencyDetails.map((item, index) => {
                                    const gap = Math.max(0, item.expected - item.deptHead);
                                    const activity = selected.idpDetails[index % selected.idpDetails.length] || { topic: item.n, method: "IDP Activity", due: "-", outcome: "พัฒนาสมรรถนะตามแผนที่เสนอ", status: "รออนุมัติ" };
                                    const tagText = index === 1 ? "FC2" : "CC";
                                    const tagClass = index === 1 ? "tag-fc" : "tag-cc";
                                    const weight = 100;

                                    return (
                                        <div key={item.n} className="card supervisor-review-gap" style={{ margin: 0 }}>
                                            <div className="ch supervisor-review-gap-head">
                                                <div className="flex ic g8 supervisor-review-gap-title-row">
                                                    <span className={tagClass}>{tagText}</span>
                                                    <div className="ct supervisor-review-gap-title">{item.n}</div>
                                                    <span className="supervisor-review-meta">คาดหวัง {item.expected} · ได้ {item.deptHead} · <span className={gap ? "rc fw7" : "gcc fw7"}>Gap {gap}</span></span>
                                                    <span className="b bg">{weight}/100%</span>
                                                </div>
                                            </div>
                                            <div className="cb supervisor-review-gap-body">
                                                <div className="supervisor-review-section-label">เป้าหมายการพัฒนา</div>
                                                <div className="supervisor-review-goal">{activity.outcome}</div>
                                                <div className="supervisor-review-activity-list">
                                                    <div className="supervisor-idp-activity-row">
                                                        <div className="flex ic jb g8" style={{ flexWrap: "wrap" }}>
                                                            <div style={{ minWidth: "180px", flex: 1 }}>
                                                                <div className="fw7 supervisor-idp-activity-title">{activity.topic}</div>
                                                                <div className="muted supervisor-idp-activity-meta">{activity.method} · - ถึง {activity.due} · น้ำหนัก {weight}%</div>
                                                                <div className="muted supervisor-idp-activity-note">คำอธิบายกิจกรรม: {activity.outcome}</div>
                                                            </div>
                                                            <span className="b by">{activity.status}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
                                <table className="tbl" style={{ margin: 0 }}>
                                    <thead>
                                        <tr>
                                            <th>สมรรถนะ</th>
                                            <th style={{ width: "110px", textAlign: "center" }}>คาดหวัง</th>
                                            <th style={{ width: "130px", textAlign: "center" }}>ประเมินตนเอง</th>
                                            <th style={{ width: "120px", textAlign: "center" }}>หัวหน้าหน่วย</th>
                                            <th style={{ width: "130px", textAlign: "center" }}>ผู้บังคับบัญชา</th>
                                            <th style={{ width: "96px", textAlign: "center" }}>Gap</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selected.competencyDetails.map(item => {
                                            const gap = Math.max(0, item.expected - item.deptHead);

                                            return (
                                                <tr key={item.n}>
                                                    <td><div className="fw7 fs13">{item.n}</div></td>
                                                    <td style={{ textAlign: "center" }}><span className="b bgr" style={{ justifyContent: "center", minWidth: "54px" }}>{item.expected}</span></td>
                                                    <td style={{ textAlign: "center" }}><span className="b bt" style={{ justifyContent: "center", minWidth: "54px" }}>{item.self}</span></td>
                                                    <td style={{ textAlign: "center" }}><span className="b bt" style={{ justifyContent: "center", minWidth: "54px" }}>{item.supervisor}</span></td>
                                                    <td style={{ textAlign: "center" }}><span className="b by" style={{ justifyContent: "center", minWidth: "54px" }}>{item.deptHead}</span></td>
                                                    <td style={{ textAlign: "center" }}><span className={`b ${gap ? "br" : "bg"}`} style={{ justifyContent: "center", minWidth: "54px" }}>{gap}</span></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex ic g8 mt12">
                                <button className="btn btn-t btn-sm" onClick={() => approve(selected.id)} style={{ flex: 1, justifyContent: "center" }}>อนุมัติแผน IDP</button>
                                <button className="btn btn-r btn-sm" onClick={() => reject(selected.id)} style={{ flex: 1, justifyContent: "center" }}>ไม่อนุมัติ</button>
                            </div>
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
                    <div className="sec-t">ภาพรวมหน่วยงาน (ผู้บังคับบัญชา) </div>
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
                        <button className="btn btn-g btn-sm" onClick={() => alert("ยืนยันผลประเมินทั้งหมดในฝ่ายและส่งให้ผู้บริหารคณะเรียบร้อย")}> ยันประเมินทั้งฝ่าย</button>
                    </div>
                </div>
                <div className="cb" style={{ padding: 0 }}>
                    {deptWorks.map((w, wi) => (
                        <div key={wi} className={wi !== deptWorks.length - 1 ? "mb0" : ""}>
                            <div style={{ background: 'var(--navy)', color: '#fff', padding: '10px 16px', fontWeight: 700, fontSize: '14px', position: 'sticky', top: 0, zIndex: 10 }}>
                                 {w.work}
                            </div>
                            {w.units.map((un, ui) => (
                                <div key={ui} style={{ borderBottom: (ui === w.units.length - 1 && wi === deptWorks.length - 1) ? "" : "8px solid var(--bg)" }}>
                                    <div style={{ background: '#f8fafc', padding: '8px 16px', borderLeft: '4px solid var(--blue)', fontSize: '13px', fontWeight: 700, color: 'var(--blue)' }}> {un}</div>
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
                                                        <td><button className="btn btn-s btn-sm" style={{ padding: '4px 8px', fontSize: '11px' }}> รีวิวผล</button></td>
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
                        <button className="btn btn-s btn-sm"> ดาวน์โหลดรายงานสรุปทั้ง {activeDept} (PDF)</button>
                    </div>
                </div>
            </div>
        </>
    );
};
