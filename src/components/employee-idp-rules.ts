export const getEmployeeIDPActivityStatus = (act: any, planStatus?: string) => {
    if (planStatus === "rejected") return { label: "อยู่ในแผนที่ไม่ผ่าน", cls: "br" };
    if (act.result === "failed" || act.st === "ไม่ผ่าน") return { label: "ไม่ผ่าน", cls: "br" };
    if (act.result === "done" || act.result === "passed" || act.st === "ผ่าน" || act.st === "เสร็จสิ้น") return { label: "ผ่าน", cls: "bg" };
    if (act.st === "ร่าง" || planStatus === "draft") return { label: "ร่าง", cls: "bgr" };
    return { label: "รออนุมัติ", cls: "by" };
};

export type EmployeeIDPProgressStatus = "developing" | "submitted" | "rejected" | "done";

export const getEmployeeIDPProgressStatusMeta = (status: EmployeeIDPProgressStatus) => {
    const map: Record<EmployeeIDPProgressStatus, { label: string; cls: string }> = {
        developing: { label: "ต้องพัฒนา", cls: "bt" },
        submitted: { label: "ส่งแล้ว/รอตรวจสอบ", cls: "by" },
        rejected: { label: "ไม่ผ่าน", cls: "br" },
        done: { label: "เสร็จสิ้น", cls: "bg" }
    };
    return map[status] || map.developing;
};

export const deriveEmployeeIDPProgressStatus = (gap: any): EmployeeIDPProgressStatus => {
    if (gap.progressStatus) return gap.progressStatus;
    if (gap.status === "approved" || gap.status === "done") return "done";
    if (gap.status === "submitted") return "submitted";
    if (gap.status === "rejected") return "rejected";
    return "developing";
};

export const isEmployeeIDPActivityDone = (activity: any) =>
    activity?.progressDone === true ||
    activity?.result === "done" ||
    activity?.result === "passed" ||
    activity?.st === "ผ่าน" ||
    activity?.st === "เสร็จสิ้น" ||
    activity?.st === "เสร็จสิ้นกิจกรรม";

export const getEmployeeIDPProgressSummary = (activities: any[], status: EmployeeIDPProgressStatus) => {
    const totalCount = activities.length;
    const doneCount = activities.filter(isEmployeeIDPActivityDone).length;
    return {
        doneCount,
        totalCount,
        canSubmit: totalCount > 0 && doneCount === totalCount,
        status
    };
};

export const getEmployeeIDPRejectionNotice = (gap: any) => ({
    title: "สมรรถนะนี้ไม่ผ่านการอนุมัติ",
    competencyName: gap.n || "-",
    reviewer: gap.rejectedBy || "ผู้ตรวจแผน",
    date: gap.rejectedDate || "",
    comment: gap.rejectComment || "กรุณาปรับแก้แผนพัฒนาของสมรรถนะนี้ตามข้อเสนอแนะจากผู้ตรวจ"
});

export const buildEmployeeIDPCatalogPatch = (catalog: { key: string; method: string; title: string; desc?: string; cost?: number | string }) => ({
    catalog: catalog.key,
    method: catalog.method,
    title: catalog.title,
    note: catalog.desc || "",
    cost: catalog.cost === undefined || catalog.cost === null ? "" : String(catalog.cost)
});
