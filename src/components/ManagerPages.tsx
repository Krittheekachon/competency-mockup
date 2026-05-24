import React, { useState } from 'react';
import { ArrowDownAZ, ArrowUpAZ } from 'lucide-react';
import { DEPT_STRUCTURE } from '../data';

export const ManagerGap: React.FC<{ users: any[]; }> = ({ users }) => {
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
        {
            n: "สำนักงานคณะฯ", total: 55, assessed: 55, pass: 43, fail: 12, lines: [
                { n: "สายบริหาร", total: 20, fail: 3, weakDetail: [{ n: "การสื่อสาร", cnt: 3 }] },
                { n: "สายการเงิน", total: 22, fail: 5, weakDetail: [{ n: "การใช้เทคโนโลยีดิจิทัล", cnt: 4 }, { n: "การวิเคราะห์ข้อมูล", cnt: 3 }] },
                { n: "สายทรัพยากรบุคคล", total: 13, fail: 4, weakDetail: [{ n: "AI Literacy", cnt: 4 }] }
            ]
        },
        {
            n: "ภาควิชาวิศวฯ คอม", total: 52, assessed: 52, pass: 32, fail: 20, lines: [
                { n: "สายวิชาการ", total: 32, fail: 13, weakDetail: [{ n: "AI Literacy", cnt: 9 }, { n: "การวิเคราะห์ข้อมูล", cnt: 7 }] },
                { n: "สายสนับสนุน", total: 20, fail: 7, weakDetail: [{ n: "การใช้เทคโนโลยีดิจิทัล", cnt: 5 }] }
            ]
        },
        {
            n: "ภาควิชาวิศวฯ ไฟฟ้า", total: 43, assessed: 43, pass: 27, fail: 16, lines: [
                { n: "สายวิชาการ", total: 25, fail: 10, weakDetail: [{ n: "AI Literacy", cnt: 7 }] },
                { n: "สายสนับสนุน", total: 18, fail: 6, weakDetail: [{ n: "การใช้เทคโนโลยีดิจิทัล", cnt: 3 }, { n: "การทำงานเป็นทีม", cnt: 5 }] }
            ]
        },
        {
            n: "ภาควิชาวิศวฯ โยธา", total: 40, assessed: 40, pass: 22, fail: 18, lines: [
                { n: "สายวิชาการ", total: 23, fail: 11, weakDetail: [{ n: "การใช้เทคโนโลยีดิจิทัล", cnt: 7 }, { n: "AI Literacy", cnt: 7 }] },
                { n: "สายสนับสนุน", total: 17, fail: 7, weakDetail: [{ n: "การวิเคราะห์ข้อมูล", cnt: 7 }] }
            ]
        },
        {
            n: "ภาควิชาวิศวฯ อุตสาหการ", total: 30, assessed: 30, pass: 23, fail: 7, lines: [
                { n: "สายวิชาการ", total: 18, fail: 5, weakDetail: [{ n: "AI Literacy", cnt: 5 }] },
                { n: "สายสนับสนุน", total: 12, fail: 2, weakDetail: [{ n: "การใช้เทคโนโลยีดิจิทัล", cnt: 2 }] }
            ]
        }
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

    const detailRows: Record<string, { n: string; t: string; tg: string; fail: number; note: string; }[]> = {
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
        const weakMap = new Map<string, { n: string; cnt: number; }>();

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
    const reportDetailRows: Record<string, { n: string; t: string; tg: string; fail: number; note: string; }[]> = {};

    reportDeptRows.forEach(dept => {
        const deptUsers = filteredReportUsers.filter(user => user.topDept === dept.n && user.failedCompetencies.length > 0);
        const compMap = new Map<string, { n: string; t: string; tg: string; fail: number; note: string; }>();

        deptUsers.forEach(user => {
            user.failedCompetencies.forEach(item => {
                const current = compMap.get(item.n) || { n: item.n, t: item.t, tg: item.tg, fail: 0, note: "" };
                current.fail += 1;
                current.note = current.fail > 1 ? "ควรวางแผนพัฒนาร่วมกัน" : "ติดตามรายบุคคล";
                compMap.set(item.n, current);
            });
        });

        reportDetailRows[dept.n] = Array.from(compMap.values()).sort((a, b) => b.fail - a.fail);
    });
    const reportProblemGroups = Array.from(new Set(reportUsers.map(user => user.w || "ไม่ระบุสายงาน"))).map((workline) => {
        const worklineUsers = reportUsers.filter(user => (user.w || "ไม่ระบุสายงาน") === workline);
        const compMap = new Map<string, { n: string; t: string; tg: string; count: number; depts: Map<string, number>; }>();

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
            riskScore: rows.reduce((total, row) => total + row.count, 0),
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
    })
        .filter(group => group.rows.length > 0)
        .sort((a, b) => b.riskScore - a.riskScore || a.label.localeCompare(b.label, "th"))
        .map((group, groupIndex) => ({
            ...group,
            color: groupIndex % 2 === 0 ? "var(--blue)" : "var(--purple)"
        }));

    const getPct = (value: number, total: number) => total ? Math.round((value / total) * 100) : 0;
    const getRiskStatus = (dept: typeof reportDeptRows[number]) => {
        if (!dept.assessed) {
            return { label: "ยังไม่มีการประเมิน", badge: "bgr", rank: 3, color: "#94a3b8" };
        }

        const failPct = 100 - getPct(dept.pass, dept.assessed);

        if (failPct > 40) {
            return { label: "ความเสี่ยงสูง", badge: "br", rank: 0, color: "var(--red)" };
        }

        if (failPct >= 20) {
            return { label: "เฝ้าระวัง", badge: "by", rank: 1, color: "var(--yellow)" };
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
                <div style={{ margin: "-10px", padding: "18px", borderRadius: "18px", background: "linear-gradient(180deg,#eef4fb 0%,#f8fafc 46%,#eef8f5 100%)", border: "1px solid #dbe7f3" }}>
                <div className="mb20">
                    <div className="sec-t" style={{ color: "var(--navy)", fontSize: "24px" }}>ภาพรวม Competency คณะ</div>
                    <div className="sec-s">คณะวิศวกรรมศาสตร์ · รอบประเมิน 2568</div>
                </div>

                <div className="mb20" style={{ background: "linear-gradient(135deg,#0f2d5b 0%,#153d73 54%,#0ea5a0 130%)", borderRadius: "16px", padding: "34px", color: "#fff", display: "grid", gridTemplateColumns: "1fr auto", gap: "20px", alignItems: "center", boxShadow: "0 18px 42px rgba(15,45,91,.22)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(120px, 1fr))", gap: "0" }}>
                        {[
                            { l: "บุคลากรทั้งหมด", v: totalStaff, s: worklineSummary || "ยังไม่มีข้อมูลผู้ใช้", c: "#fff" },
                            { l: "ประเมินแล้ว", v: assessed, s: `รอ ${totalStaff - assessed} คน`, c: "#fff" },
                            { l: "ผ่านเกณฑ์", v: passed, s: `${passPct}% ของที่ประเมิน`, c: "#4ade80" },
                            { l: "ไม่ผ่านเกณฑ์", v: failed, s: `${100 - passPct}% ของที่ประเมิน`, c: "#fca5a5" }
                        ].map((m, i) => (
                            <div key={m.l} style={{ padding: "0 28px", borderLeft: i ? "1px solid rgba(255,255,255,.14)" : "none" }}>
                                <div className="fw7 fs12" style={{ color: "rgba(255,255,255,.48)", marginBottom: "8px" }}>{m.l}</div>
                                <div style={{ color: m.c, fontSize: "44px", fontWeight: 800, lineHeight: 1 }}>{m.v}</div>
                                <div className="fs12" style={{ color: "rgba(255,255,255,.55)", marginTop: "8px" }}>{m.s}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ width: "144px", height: "144px", borderRadius: "50%", background: `conic-gradient(#4ade80 ${passPct * 3.6}deg, rgba(255,255,255,.12) 0)`, display: "grid", placeItems: "center" }}>
                        <div style={{ width: "108px", height: "108px", borderRadius: "50%", background: "#102f60", display: "grid", placeItems: "center", textAlign: "center" }}>
                            <div>
                                <div style={{ fontSize: "26px", fontWeight: 800, lineHeight: 1 }}>{passPct}%</div>
                                <div className="fs11" style={{ color: "rgba(255,255,255,.65)", marginTop: "6px" }}>ผ่านเกณฑ์</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card mb16" style={{ background: "#f8fbff", borderColor: "#d5e2f0", boxShadow: "0 12px 30px rgba(15,45,91,.08)", overflow: "hidden" }}>
                    <div className="ch" style={{ background: "linear-gradient(90deg,#ffffff 0%,#eef6ff 100%)", display: "block" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "minmax(180px, 1fr) auto", alignItems: "center", gap: "14px" }}>
                            <div style={{ minWidth: "180px" }}>
                                <div className="ct">ผลรายหน่วยงาน</div>
                                <div className="cs">กดที่หน่วยงานเพื่อดูรายสายงาน</div>
                            </div>
                            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "flex-end", alignItems: "center" }}>
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
                                        style={{ width: "150px", height: "32px", padding: "4px 10px", fontSize: "12px" }}
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
                                        style={{ width: "160px", height: "32px", padding: "4px 10px", fontSize: "12px" }}
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
                                        style={{ width: "150px", height: "32px", padding: "4px 10px", fontSize: "12px" }}
                                    >
                                        <option value="all">ทั้งหมด</option>
                                        <option value="risk">ความเสี่ยง</option>
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
                                        style={{ width: "32px", height: "32px", padding: 0, lineHeight: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 32px" }}
                                    >
                                        {deptSortDir === "asc" ? <ArrowUpAZ size={15} /> : <ArrowDownAZ size={15} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "18px", flexWrap: "wrap", alignItems: "center", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #dbe7f3" }}>
                            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                                <span className="fs11 fw7 muted">สีแถบผลประเมิน:</span>
                                <span className="flex ic g6 fs11 muted"><span style={{ width: "22px", height: "8px", borderRadius: "99px", background: "var(--green)", display: "inline-block" }} /> ผ่าน</span>
                                <span className="flex ic g6 fs11 muted"><span style={{ width: "22px", height: "8px", borderRadius: "99px", background: "#FECACA", display: "inline-block" }} /> ไม่ผ่าน</span>
                                <span className="flex ic g6 fs11 muted"><span style={{ width: "22px", height: "8px", borderRadius: "99px", background: "#e2e8f0", display: "inline-block" }} /> ยังไม่มีการประเมิน</span>
                            </div>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                                <span className="fs11 fw7 muted">เกณฑ์ความเสี่ยง:</span>
                                <span className="b br" style={{ fontSize: "10px" }}>ไม่ผ่าน &gt; 40% = สูง</span>
                                <span className="b by" style={{ fontSize: "10px" }}>20-40% = เฝ้าระวัง</span>
                                <span className="b bg" style={{ fontSize: "10px" }}>&lt; 20% = อยู่ในเกณฑ์ดี</span>
                                <span className="b muted" style={{ fontSize: "10px" }}>0 คนประเมิน = ยังไม่มีการประเมิน</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ padding: "14px 18px 18px", display: "flex", flexDirection: "column", gap: "12px", background: "#eef4f8" }}>
                        <div className="muted fs11 fw7" style={{ display: "grid", gridTemplateColumns: "4px minmax(220px, 1.4fr) 128px minmax(160px, 1fr) 132px 20px", alignItems: "center", gap: "12px", padding: "0 16px 2px" }}>
                            <span />
                            <span>หน่วยงาน</span>
                            <span style={{ textAlign: "center" }}>ผลประเมิน</span>
                            <span>สัดส่วนผ่าน / ไม่ผ่าน</span>
                            <span style={{ textAlign: "center" }}>สถานะ</span>
                            <span />
                        </div>
                        {rankedDeptRows.map((d) => {
                            const passWidth = getPct(d.pass, d.assessed);
                            const failWidth = d.assessed ? 100 - passWidth : 0;
                            const assessedPct = getPct(d.assessed, d.total);
                            const riskStatus = getRiskStatus(d);
                            const isCoverageLow = assessedPct < 100;
                            const isOpen = openDept === d.n;

                            return (
                                <div key={d.n} style={{ border: "1px solid #d9e4ee", borderRadius: "var(--r-lg)", overflow: "hidden", background: "#fff", boxShadow: isOpen ? "0 10px 24px rgba(15,45,91,.10)" : "0 1px 2px rgba(15,45,91,.06)" }}>
                                    <button
                                        type="button"
                                        onClick={() => setOpenDept(isOpen ? null : d.n)}
                                        style={{ width: "100%", padding: "12px 16px", background: isOpen ? "#f8fbff" : "linear-gradient(90deg,#ffffff 0%,#fbfdff 100%)", cursor: "pointer", display: "grid", gridTemplateColumns: "4px minmax(220px, 1.4fr) 128px minmax(160px, 1fr) 132px 20px", alignItems: "center", gap: "12px", border: 0, textAlign: "left", fontFamily: "inherit" }}
                                    >
                                        <div style={{ width: "4px", height: "36px", borderRadius: "3px", background: riskStatus.color, flexShrink: 0 }} />
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={d.n}>{d.n}</div>
                                            <div style={{ fontSize: "11px", color: "var(--text3)", marginTop: "2px" }}>{d.total} คน · ประเมินแล้ว {d.assessed} คน</div>
                                            {isCoverageLow && <div className="fs11 mt4" style={{ color: "var(--text2)" }}>ข้อมูลประเมินยังไม่ครบ</div>}
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", alignItems: "stretch" }}>
                                            <div style={{ textAlign: "center", padding: "4px 8px", background: "var(--green-bg)", borderRadius: "var(--r)", border: "1px solid var(--green-md)" }}>
                                                <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--green)" }}>{d.pass}</div>
                                                <div style={{ fontSize: "10px", color: "var(--green)", fontWeight: 700 }}>ผ่าน</div>
                                            </div>
                                            <div style={{ textAlign: "center", padding: "4px 8px", background: "var(--red-bg)", borderRadius: "var(--r)", border: "1px solid #FCA5A5" }}>
                                                <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--red)" }}>{d.fail}</div>
                                                <div style={{ fontSize: "10px", color: "var(--red)", fontWeight: 700 }}>ไม่ผ่าน</div>
                                            </div>
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ height: "10px", borderRadius: "6px", overflow: "hidden", display: "flex" }}>
                                                {d.assessed ? (
                                                    <>
                                                        <div style={{ width: `${passWidth}%`, background: "var(--green)", transition: ".3s" }} />
                                                        <div style={{ width: `${failWidth}%`, background: "#FECACA", transition: ".3s" }} />
                                                    </>
                                                ) : (
                                                    <div style={{ width: "100%", background: "#e2e8f0", transition: ".3s" }} />
                                                )}
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3px" }}>
                                                <span style={{ fontSize: "10px", color: "var(--text3)" }}>{passWidth}%</span>
                                                <span style={{ fontSize: "10px", color: "var(--text3)" }}>{failWidth}%</span>
                                            </div>
                                        </div>
                                        <span className={`b ${riskStatus.badge}`} style={{ justifyContent: "center", width: "100%" }}>{riskStatus.label}</span>
                                        <span style={{ fontSize: "11px", color: "var(--text3)", justifySelf: "center" }}>{isOpen ? "▴" : "▾"}</span>
                                    </button>
                                    {isOpen && (
                                        <div style={{ margin: "8px 20px 14px 20px", border: "1px solid #d9e4ee", borderRadius: "10px", overflow: "hidden", background: "#f1f7fb" }}>
                                            {reportDetailRows[d.n]?.length ? reportDetailRows[d.n].map((row) => (
                                                <div key={row.n} className="flex ic g12" style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
                                                    <div className="flex ic g8" style={{ flex: 1 }}>
                                                        <span className={row.tg}>{row.t}</span>
                                                        <span className="fw6 fs12">{row.n}</span>
                                                    </div>
                                                    <span className="b br">{row.fail} คน</span>
                                                    <span className="muted fs12">{row.note}</span>
                                                </div>
                                            )) : (
                                                <div className="muted fs12" style={{ padding: "14px" }}>ยังไม่มีรายการสมรรถนะที่ต้องติดตาม</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="card" style={{ borderRadius: "14px", overflow: "hidden", background: "#f8fbff", borderColor: "#d5e2f0", boxShadow: "0 12px 30px rgba(15,45,91,.08)" }}>
                    <div className="ch" style={{ padding: "20px 22px", display: "block", background: "linear-gradient(90deg,#ffffff 0%,#f0f7ff 100%)" }}>
                        <div className="ct" style={{ fontSize: "16px" }}>สมรรถนะที่มีปัญหา แยกตามสายงาน</div>
                        <div className="cs">CC = สมรรถนะหลัก · MC = สมรรถนะการบริหาร · FC = สมรรถนะตามสายงาน · กดที่รายการเพื่อดูว่ามาจากหน่วยงานใดบ้าง</div>
                    </div>
                    <div className="cb" style={{ padding: "12px 22px 22px", background: "#eef4f8" }}>
                        <div style={{ background: "var(--yellow-bg)", border: "1px solid #fde68a", borderRadius: "9px", color: "var(--yellow)", padding: "12px 16px", marginBottom: "20px", fontSize: "13px" }}>
                            ⚠ บุคลากร 1 คนสามารถไม่ผ่านได้หลายสมรรถนะ ผลรวมอาจสูงกว่าจำนวนจริง
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
                                                style={{ width: "100%", background: isOpen ? "#f8fbff" : "#fff", border: "1px solid #d9e4ee", borderRadius: "9px", padding: "16px 20px", boxShadow: isOpen ? "0 10px 24px rgba(15,45,91,.10)" : "0 1px 2px rgba(15,45,91,.06)", cursor: "pointer", display: "grid", gridTemplateColumns: "52px minmax(220px, 1fr) 250px 88px 20px", gap: "16px", alignItems: "center", textAlign: "left", fontFamily: "inherit" }}
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

    export const ManagerIDP: React.FC<{ users: any[]; }> = ({ users }) => {
        const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

        const idpStats = {
            completed: 18,
            inProgress: 22,
            submitted: 13,
            draft: 10,
            noIdp: 10
        };
        const groupProgress = [
            {
                d: "สำนักงานคณะฯ",
                total: 12,
                hasIDP: 10,
                idpList: [
                    { n: "สมชาย มีสุข", pos: "นักวิชาการ", topic: "ดิจิทัล & AI", status: "in_progress" },
                    { n: "วรรณา เพชรดี", pos: "เจ้าหน้าที่", topic: "การสื่อสาร", status: "completed" },
                    { n: "มานิตย์ แสง", pos: "นักวิชาการ", topic: "วิเคราะห์ข้อมูล", status: "draft" }
                ]
            },
            {
                d: "ภาควิชาวิศวฯ คอม",
                total: 20,
                hasIDP: 18,
                idpList: [
                    { n: "รศ.ดร.ปาริชาติ วงศ์ดี", pos: "รองคณบดีฝ่ายวิชาการ", topic: "AI Literacy", status: "submitted" },
                    { n: "นภัสสร ทองดี", pos: "นักวิชาการ", topic: "AI & Data", status: "in_progress" }
                ]
            },
            {
                d: "ภาควิชาวิศวฯ ไฟฟ้า",
                total: 16,
                hasIDP: 14,
                idpList: [
                    { n: "ธนาวุฒิ สว่างใจ", pos: "นักวิเคราะห์", topic: "ดิจิทัล", status: "draft" }
                ]
            },
            {
                d: "ภาควิชาวิศวฯ โยธา",
                total: 18,
                hasIDP: 15,
                idpList: [
                    { n: "อรจิรา พรม", pos: "อาจารย์", topic: "AI Literacy", status: "submitted" }
                ]
            },
            {
                d: "ภาควิชาวิศวฯ อุตสาหการ",
                total: 7,
                hasIDP: 6,
                idpList: [
                    { n: "สุภาพร แก้วมะณี", pos: "เจ้าหน้าที่", topic: "ดิจิทัล", status: "completed" }
                ]
            }
        ];

        const noProgress = [
            { n: "มานิตย์ แสง", pos: "นักวิชาการ", d: "สำนักงานคณะฯ", reason: "draft" },
            { n: "ชาญวิทย์ ดีงาม", pos: "เจ้าหน้าที่", d: "สำนักงานคณะฯ", reason: "no_idp" },
            { n: "ธนาวุฒิ สว่างใจ", pos: "นักวิเคราะห์", d: "ภาควิชาวิศวฯ ไฟฟ้า", reason: "draft" },
            { n: "สุมาลี วงศ์ทอง", pos: "นักวิชาการ", d: "ภาควิชาวิศวฯ ไฟฟ้า", reason: "no_idp" },
            { n: "วรรณา แสงทอง", pos: "เจ้าหน้าที่", d: "ภาควิชาวิศวฯ โยธา", reason: "no_idp" },
            { n: "ประภาส ศรีสุข", pos: "อาจารย์", d: "ภาควิชาวิศวฯ โยธา", reason: "draft" },
            { n: "กิตติพงษ์ ทองมา", pos: "อาจารย์", d: "ภาควิชาวิศวฯ อุตสาหการ", reason: "no_idp" },
            { n: "รัตนา พรมมา", pos: "เจ้าหน้าที่", d: "ภาควิชาวิศวฯ อุตสาหการ", reason: "draft" }
        ];

        const userByName = new Map<string, any>(users.map(user => [user.n, user]));
        const selectedDetail = groupProgress.find(group => group.d === selectedGroup);
        const totalFail = groupProgress.reduce((total, group) => total + group.total, 0);
        const totalHasIDP = idpStats.completed + idpStats.inProgress + idpStats.submitted + idpStats.draft;
        const pctIDP = Math.round((totalHasIDP / totalFail) * 100);

        const statusMeta: Record<string, { label: string; badge: string; }> = {
            completed: { label: "เสร็จสิ้น", badge: "bg" },
            in_progress: { label: "กำลังดำเนินการ", badge: "bt" },
            submitted: { label: "รออนุมัติ", badge: "by" },
            draft: { label: "Draft", badge: "bgr" }
        };

        const noProgressMeta: Record<string, { label: string; badge: string; }> = {
            draft: { label: "ยังไม่ส่งแผน (Draft)", badge: "by" },
            no_idp: { label: "ยังไม่มีการทำ IDP", badge: "bgr" },
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
                    <div className="sec-t">ภาพรวม IDP คณะ 📋</div>
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
                                    <span style={{ background: "var(--teal)", borderRadius: "20px", color: "#fff", fontSize: "13px", fontWeight: 800, padding: "3px 10px" }}>{pctIDP}%</span>
                                </div>
                                <div className="fs12 muted mt4">ยังไม่ได้ทำ IDP อีก <span className="fw7 rc">{idpStats.noIdp} คน</span></div>
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
                    <div className="sc"><div className="sl">Draft / ยังไม่มี IDP</div><div className="sv rc">{idpStats.draft + idpStats.noIdp}</div><div className="ss muted">Draft {idpStats.draft} · ไม่มี IDP {idpStats.noIdp}</div></div>
                </div>

                <div className="g2 mb14">
                    <div className="card">
                        <div className="ch"><div className="ct">ความคืบหน้า IDP รายหน่วยงาน</div></div>
                        <div className="cb" style={{ padding: 0 }}>
                            {groupProgress.map(group => {
                                const pct = Math.round((group.hasIDP / group.total) * 100);
                                const barColor = pct >= 90 ? "var(--green)" : pct >= 70 ? "var(--teal)" : pct >= 50 ? "var(--yellow)" : "var(--red)";

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
                                            <span className="fs11 fw7" style={{ color: barColor, textAlign: "right", width: "36px" }}>{pct}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="card">
                        <div className="ch">
                            <div>
                                <div className="ct">บุคลากรที่ยังไม่มีความคืบหน้า IDP</div>
                                <div className="cs">{noProgress.length} คน</div>
                            </div>
                            <button className="btn btn-p btn-sm" style={{ marginLeft: "auto" }} onClick={() => alert(`ส่งแจ้งเตือนไปยัง ${noProgress.length} คนแล้ว`)}>แจ้งเตือนทั้งหมด</button>
                        </div>
                        <div className="cb" style={{ padding: 0 }}>
                            {noProgress.map(item => {
                                const user = userByName.get(item.n);
                                const meta = noProgressMeta[item.reason];

                                return (
                                    <div key={item.n} style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "8px" }}>
                                        <div className="av" style={{ width: "30px", height: "30px", fontSize: "12px", background: "var(--navy)" }}>{item.n[0]}</div>
                                        <div style={{ flex: 1 }}>
                                            <div className="fw6 fs12">{user ? `${user.t}${user.n}` : item.n}</div>
                                            <div className="muted fs11">{item.pos} · {item.d}</div>
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
                                <div className="fw8 fs14">{selectedDetail.d} · รายละเอียด IDP</div>
                                <button className="btn btn-s btn-sm" onClick={() => setSelectedGroup(null)}>ปิด</button>
                            </div>
                            <div className="mo-b">
                                {selectedDetail.idpList.map(item => {
                                    const meta = statusMeta[item.status];
                                    const user = userByName.get(item.n);

                                    return (
                                        <div key={item.n} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px" }}>
                                            <div className="av" style={{ width: "34px", height: "34px", fontSize: "13px", background: "var(--navy)" }}>{item.n[0]}</div>
                                            <div style={{ flex: 1 }}>
                                                <div className="fw6 fs13">{user ? `${user.t}${user.n}` : item.n}</div>
                                                <div className="muted fs11">{item.pos} · เรื่อง: {item.topic}</div>
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
        const activeStaff = users
            .filter(user => user.act !== false && user.r !== "manager")
            .slice(0, 12);
        const fallback = [
            { n: "สมชาย มีสุข", t: "นาย", p: "นักวิชาการศึกษา", d: "สนับสนุนการศึกษาและวิชาการ", w: "สายสนับสนุน", sup: "กัญญารัตน์ ศรีวิชา", evaluator2: "ธนพล ไชยรักษ์" },
            { n: "มาลี ดีเสมอ", t: "นางสาว", p: "นักทรัพยากรบุคคล", d: "ทรัพยากรบุคคล", w: "สายสนับสนุน", sup: "พรพิมล บุคคลดี", evaluator2: "ธนพล ไชยรักษ์" },
            { n: "วิชัย ระบบดี", t: "นาย", p: "นักวิชาการคอมพิวเตอร์", d: "เทคโนโลยีสารสนเทศ", w: "สายสนับสนุน", sup: "ปกรณ์ ศิริวัฒน์", evaluator2: "ธนพล ไชยรักษ์" }
        ];
        const source = activeStaff.length ? activeStaff : fallback;

        return source.map((user, index) => {
            const supervisor = user.sup || (index % 2 ? "กัญญารัตน์ ศรีวิชา" : "พรพิมล บุคคลดี");
            const commander = user.evaluator2 || (index % 2 ? "ปาริชาติ วงศ์ดี" : "ธนพล ไชยรักษ์");

            return {
                id: user.sso || `mock-${index}`,
                employee: `${user.t || ""}${user.n}`,
                position: user.p || "บุคลากร",
                dept: user.d || "ไม่ระบุหน่วยงาน",
                workline: user.w || "ไม่ระบุสายงาน",
                evaluator1: supervisor,
                evaluator2: commander,
                score1: 3 + ((index + 1) % 3),
                score2: 3 + ((index + 2) % 3),
                submittedAt: `${18 + (index % 6)} พ.ค. 2568`,
                competencyDetails: [
                    { n: "AI Literacy", expected: 4, actual: index % 2 ? 3 : 4, note: index % 2 ? "ควรพัฒนาเพิ่มเติม" : "ผ่านตามเกณฑ์" },
                    { n: "การใช้เทคโนโลยีดิจิทัล", expected: 4, actual: index % 3 ? 3 : 4, note: index % 3 ? "มีช่องว่างระดับสมรรถนะ" : "ผ่านตามเกณฑ์" },
                    { n: "การทำงานเป็นทีม", expected: 3, actual: 3, note: "อยู่ในเกณฑ์" }
                ],
                idpDetails: [
                    { topic: "AI Literacy", method: "Workshop + OJT", due: "ก.ค. 2568", outcome: "ใช้ AI ช่วยงานประจำได้" },
                    { topic: "การวิเคราะห์ข้อมูล", method: "Online course", due: "ส.ค. 2568", outcome: "ทำ dashboard สรุปงานได้" }
                ]
            };
        });
    };

    export const ManagerAssessmentApproval: React.FC<{ users: any[]; }> = ({ users }) => {
        const [approvedIds, setApprovedIds] = useState<string[]>([]);
        const [selectedId, setSelectedId] = useState<string | null>(null);
        const approvalRows = getApprovalRows(users);
        const selected = approvalRows.find(row => row.id === selectedId);

        const approve = (id: string) => setApprovedIds(prev => prev.includes(id) ? prev : [...prev, id]);

        return (
            <>
                <div className="mb20">
                    <div className="sec-t">อนุมัติผลการประเมินรายบุคคล</div>
                    <div className="sec-s">ตรวจสอบผู้ถูกประเมิน ผู้ประเมินคนที่ 1 (หัวหน้างาน) และผู้ประเมินคนที่ 2 (ผู้บังคับบัญชา) ก่อนยืนยันผลการประเมิน</div>
                </div>
                <div className="g3 mb14">
                    <div className="sc"><div className="sl">รออนุมัติ</div><div className="sv yc">{approvalRows.length - approvedIds.length}</div><div className="ss muted">รายการ</div></div>
                    <div className="sc"><div className="sl">อนุมัติแล้ว</div><div className="sv gcc">{approvedIds.length}</div><div className="ss muted">รายการ</div></div>
                    <div className="sc"><div className="sl">ส่งจากผู้บังคับบัญชา</div><div className="sv bc">{new Set(approvalRows.map(row => row.evaluator2)).size}</div><div className="ss muted">คน</div></div>
                </div>
                <div className="card">
                    <div className="ch"><div className="ct">รายการผลการประเมินที่รอยืนยัน</div></div>
                    <div className="cb" style={{ padding: 0 }}>
                        <table className="tbl">
                            <thead>
                                <tr>
                                    <th>ผู้ถูกประเมิน</th>
                                    <th>ผู้ประเมินคนที่ 1 (หัวหน้างาน)</th>
                                    <th>ผู้ประเมินคนที่ 2 (ผู้บังคับบัญชา)</th>
                                    <th style={{ width: "110px", textAlign: "center" }}>คะแนน</th>
                                    <th style={{ width: "118px" }}>สถานะ</th>
                                    <th style={{ width: "190px" }}>จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {approvalRows.map(row => {
                                    const approved = approvedIds.includes(row.id);
                                    const avg = Math.round((row.score1 + row.score2) / 2);

                                    return (
                                        <tr key={row.id}>
                                            <td><div className="fw7 fs13">{row.employee}</div><div className="muted fs11">{row.position} · {row.dept}</div></td>
                                            <td><div className="fw6 fs12">{row.evaluator1}</div><div className="muted fs11">หัวหน้างาน</div></td>
                                            <td><div className="fw6 fs12">{row.evaluator2}</div><div className="muted fs11">ผู้บังคับบัญชา</div></td>
                                            <td style={{ textAlign: "center" }}><span className="fw8" style={{ color: "var(--blue)" }}>{avg}</span><span className="muted fs10"> / 5</span></td>
                                            <td><span className={`b ${approved ? "bg" : "by"}`}>{approved ? "ยืนยันแล้ว" : "รอยืนยัน"}</span></td>
                                            <td>
                                                <div className="flex ic g6">
                                                    <button className="btn btn-s btn-xs" onClick={() => setSelectedId(row.id)}>ดูรายละเอียด</button>
                                                    <button className={`btn ${approved ? "btn-g" : "btn-p"} btn-xs`} disabled={approved} onClick={() => approve(row.id)}>{approved ? "ยืนยันแล้ว" : "ยืนยัน"}</button>
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
                        <div className="mo-box" style={{ width: "720px" }} onMouseDown={event => event.stopPropagation()}>
                            <div className="mo-h">
                                <div><div className="fw8 fs14">{selected.employee}</div><div className="muted fs11">{selected.evaluator1} · {selected.evaluator2}</div></div>
                                <button className="btn btn-s btn-sm" onClick={() => setSelectedId(null)}>ปิด</button>
                            </div>
                            <div className="mo-b">
                                <div className="fw7 fs13 mb8">รายละเอียดผลการประเมิน</div>
                                {selected.competencyDetails.map(item => (
                                    <div key={item.n} style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px 150px", gap: "10px", padding: "10px 0", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
                                        <div className="fw7 fs13">{item.n}<div className="muted fs11">{item.note}</div></div>
                                        <span className="b bgr" style={{ justifyContent: "center" }}>คาดหวัง {item.expected}</span>
                                        <span className={`b ${item.actual >= item.expected ? "bg" : "br"}`} style={{ justifyContent: "center" }}>ได้ {item.actual}</span>
                                        <span className="muted fs11">ส่งเมื่อ {selected.submittedAt}</span>
                                    </div>
                                ))}
                                <button className={`btn ${approvedIds.includes(selected.id) ? "btn-g" : "btn-p"} btn-sm mt12`} disabled={approvedIds.includes(selected.id)} onClick={() => approve(selected.id)} style={{ width: "100%", justifyContent: "center" }}>{approvedIds.includes(selected.id) ? "ยืนยันผลการประเมินแล้ว" : "ยืนยันผลการประเมิน"}</button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    };

    export const ManagerIDPApproval: React.FC<{ users: any[]; }> = ({ users }) => {
        const [approvedIds, setApprovedIds] = useState<string[]>([]);
        const [selectedId, setSelectedId] = useState<string | null>(null);
        const approvalRows = getApprovalRows(users);
        const selected = approvalRows.find(row => row.id === selectedId);
        const approve = (id: string) => setApprovedIds(prev => prev.includes(id) ? prev : [...prev, id]);

        return (
            <>
                <div className="mb20">
                    <div className="sec-t">อนุมัติแผน IDP รายบุคคล</div>
                    <div className="sec-s">ตรวจสอบแผน IDP จากหัวหน้างานและผู้บังคับบัญชา ก่อนยืนยันแผนพัฒนารายบุคคล</div>
                </div>
                <div className="g3 mb14">
                    <div className="sc"><div className="sl">รออนุมัติ</div><div className="sv yc">{approvalRows.length - approvedIds.length}</div><div className="ss muted">แผน</div></div>
                    <div className="sc"><div className="sl">อนุมัติแล้ว</div><div className="sv gcc">{approvedIds.length}</div><div className="ss muted">แผน</div></div>
                    <div className="sc"><div className="sl">หัวข้อพัฒนา</div><div className="sv bc">{approvalRows.reduce((sum, row) => sum + row.idpDetails.length, 0)}</div><div className="ss muted">รายการ</div></div>
                </div>
                <div className="card">
                    <div className="ch"><div className="ct">รายการแผน IDP ที่รอยืนยัน</div></div>
                    <div className="cb" style={{ padding: 0 }}>
                        <table className="tbl">
                            <thead>
                                <tr>
                                    <th>ผู้ถูกประเมิน</th>
                                    <th>ผู้ประเมินคนที่ 1 (หัวหน้างาน)</th>
                                    <th>ผู้ประเมินคนที่ 2 (ผู้บังคับบัญชา)</th>
                                    <th>หัวข้อ IDP</th>
                                    <th style={{ width: "118px" }}>สถานะ</th>
                                    <th style={{ width: "190px" }}>จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {approvalRows.map(row => {
                                    const approved = approvedIds.includes(row.id);

                                    return (
                                        <tr key={row.id}>
                                            <td><div className="fw7 fs13">{row.employee}</div><div className="muted fs11">{row.position} · {row.dept}</div></td>
                                            <td><div className="fw6 fs12">{row.evaluator1}</div><div className="muted fs11">หัวหน้างาน</div></td>
                                            <td><div className="fw6 fs12">{row.evaluator2}</div><div className="muted fs11">ผู้บังคับบัญชา</div></td>
                                            <td><div className="flex ic g4" style={{ flexWrap: "wrap" }}>{row.idpDetails.map(item => <span key={item.topic} className="b bt">{item.topic}</span>)}</div></td>
                                            <td><span className={`b ${approved ? "bg" : "by"}`}>{approved ? "ยืนยันแล้ว" : "รอยืนยัน"}</span></td>
                                            <td>
                                                <div className="flex ic g6">
                                                    <button className="btn btn-s btn-xs" onClick={() => setSelectedId(row.id)}>ดูรายละเอียด</button>
                                                    <button className={`btn ${approved ? "btn-g" : "btn-t"} btn-xs`} disabled={approved} onClick={() => approve(row.id)}>{approved ? "ยืนยันแล้ว" : "ยืนยัน"}</button>
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
                        <div className="mo-box" style={{ width: "720px" }} onMouseDown={event => event.stopPropagation()}>
                            <div className="mo-h">
                                <div><div className="fw8 fs14">{selected.employee}</div><div className="muted fs11">{selected.evaluator1} · {selected.evaluator2}</div></div>
                                <button className="btn btn-s btn-sm" onClick={() => setSelectedId(null)}>ปิด</button>
                            </div>
                            <div className="mo-b">
                                <div className="fw7 fs13 mb8">รายละเอียดแผน IDP</div>
                                {selected.idpDetails.map(item => (
                                    <div key={item.topic} style={{ display: "grid", gridTemplateColumns: "150px 150px 100px 1fr", gap: "10px", padding: "10px 0", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
                                        <span className="b bt" style={{ justifyContent: "center" }}>{item.topic}</span>
                                        <span className="fw6 fs12">{item.method}</span>
                                        <span className="b bgr" style={{ justifyContent: "center" }}>{item.due}</span>
                                        <span className="muted fs12">{item.outcome}</span>
                                    </div>
                                ))}
                                <button className={`btn ${approvedIds.includes(selected.id) ? "btn-g" : "btn-t"} btn-sm mt12`} disabled={approvedIds.includes(selected.id)} onClick={() => approve(selected.id)} style={{ width: "100%", justifyContent: "center" }}>{approvedIds.includes(selected.id) ? "ยืนยันแผน IDP แล้ว" : "ยืนยันแผน IDP"}</button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    };

    export const DeptMonitor: React.FC<{ users: any[]; }> = ({ users }) => {
        const deptKeys = Object.keys(DEPT_STRUCTURE);
        const [activeDept, setActiveDept] = useState(deptKeys[0]);

        const getStaffData = (unit: string) => users.filter(u => {
            if (!u.d) return false;
            const parts = u.d.split(" > ");
            if (parts[0] !== activeDept) return false;
            return parts[parts.length - 1] === unit;
        }).map((u, index) => ({
            n: u.t + u.n, sso: u.sso, d: "ประเมินแล้ว", s: u.evalStatus, p: 100, unitScore: 3 + (index % 3), pos: u.p, av: u.n[0]
        }));

        const deptWorks = DEPT_STRUCTURE[activeDept as keyof typeof DEPT_STRUCTURE] || [];

        return (
            <>
                <div className="flex ic jb mb20">
                    <div>
                        <div className="sec-t">ภาพรวมหน่วยงาน (ผู้บังคับบัญชา) 🏢</div>
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
                            <button className="btn btn-g btn-sm" onClick={() => alert("ยืนยันผลประเมินทั้งหมดในฝ่ายและส่งให้ผู้บริหารคณะเรียบร้อย")}>✅ ยันประเมินทั้งฝ่าย</button>
                        </div>
                    </div>
                    <div className="cb" style={{ padding: 0 }}>
                        {deptWorks.map((w, wi) => (
                            <div key={wi} className={wi !== deptWorks.length - 1 ? "mb0" : ""}>
                                <div style={{ background: 'var(--navy)', color: '#fff', padding: '10px 16px', fontWeight: 700, fontSize: '14px', position: 'sticky', top: 0, zIndex: 10 }}>
                                    📁 {w.work}
                                </div>
                                {w.units.map((un, ui) => (
                                    <div key={ui} style={{ borderBottom: (ui === w.units.length - 1 && wi === deptWorks.length - 1) ? "" : "8px solid var(--bg)" }}>
                                        <div style={{ background: '#f8fafc', padding: '8px 16px', borderLeft: '4px solid var(--blue)', fontSize: '13px', fontWeight: 700, color: 'var(--blue)' }}>🏠 {un}</div>
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
                                                                <span className="fw8 fs14" style={{ color: 'var(--blue)' }}>{s.unitScore}</span>
                                                                <span className="muted fs10" style={{ marginLeft: '4px' }}>/ 5</span>
                                                            </td>
                                                            <td>
                                                                {s.s === 'unit_evaluated' && <span className="b bt">Unit Head ประเมินแล้ว</span>}
                                                                {s.s === 'dept_evaluated' && <span className="b bg-blue text-white">ผู้บริหารประเมินแล้ว</span>}
                                                                {s.s === 'dean_approved' && <span className="b bg-green text-white">คณบดีอนุมัติแล้ว</span>}
                                                                {s.s === 'self_submitted' && <span className="b by">รอ Unit Head</span>}
                                                                {(!s.s || s.s === 'draft') && <span className="b muted">รอดำเนินการ</span>}
                                                            </td>
                                                            <td><button className="btn btn-s btn-sm" style={{ padding: '4px 8px', fontSize: '11px' }}>🔍 รีวิวผล</button></td>
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
                            <button className="btn btn-s btn-sm">📑 ดาวน์โหลดรายงานสรุปทั้ง {activeDept} (PDF)</button>
                        </div>
                    </div>
                </div>
            </>
        );
    };
