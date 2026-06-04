import assert from "node:assert/strict";
import {
    buildEmployeeIDPCatalogPatch,
    getEmployeeIDPProgressStatusMeta,
    getEmployeeIDPProgressSummary,
    getEmployeeIDPActivityStatus,
    getEmployeeIDPRejectionNotice,
    isEmployeeIDPActivityDone
} from "./employee-idp-rules";

const failedActivity = {
    result: "failed",
    st: "ไม่ผ่าน"
};

assert.deepEqual(getEmployeeIDPActivityStatus(failedActivity, "rejected"), {
    label: "อยู่ในแผนที่ไม่ผ่าน",
    cls: "br"
});

assert.deepEqual(getEmployeeIDPActivityStatus({ st: "รออนุมัติ" }, "rejected"), {
    label: "อยู่ในแผนที่ไม่ผ่าน",
    cls: "br"
});

assert.deepEqual(getEmployeeIDPActivityStatus(failedActivity, "submitted"), {
    label: "ไม่ผ่าน",
    cls: "br"
});

assert.deepEqual(getEmployeeIDPRejectionNotice({
    n: "การใช้เทคโนโลยีดิจิทัล",
    rejectedBy: "ผศ.ดร.ธนพล ไชยรักษ์",
    rejectedDate: "8 พ.ค. 68",
    rejectComment: "ควรเพิ่ม OJT หรือ Workshop เฉพาะด้าน Digital Literacy"
}), {
    title: "สมรรถนะนี้ไม่ผ่านการอนุมัติ",
    competencyName: "การใช้เทคโนโลยีดิจิทัล",
    reviewer: "ผศ.ดร.ธนพล ไชยรักษ์",
    date: "8 พ.ค. 68",
    comment: "ควรเพิ่ม OJT หรือ Workshop เฉพาะด้าน Digital Literacy"
});

assert.deepEqual(buildEmployeeIDPCatalogPatch({
    key: "formal-ai-data",
    method: "formal",
    title: "หลักสูตร AI & Data Analytics",
    desc: "เรียนรู้พื้นฐานการวิเคราะห์ข้อมูลและสร้าง dashboard",
    cost: 1500
}), {
    catalog: "formal-ai-data",
    method: "formal",
    title: "หลักสูตร AI & Data Analytics",
    note: "เรียนรู้พื้นฐานการวิเคราะห์ข้อมูลและสร้าง dashboard",
    cost: "1500"
});

assert.equal(isEmployeeIDPActivityDone({ result: "done" }), true);
assert.equal(isEmployeeIDPActivityDone({ st: "เสร็จสิ้นกิจกรรม" }), true);
assert.equal(isEmployeeIDPActivityDone({ st: "รออนุมัติ" }), false);

assert.deepEqual(getEmployeeIDPProgressStatusMeta("developing"), {
    label: "ต้องพัฒนา",
    cls: "bt"
});

assert.deepEqual(getEmployeeIDPProgressStatusMeta("submitted"), {
    label: "ส่งแล้ว/รอตรวจสอบ",
    cls: "by"
});

assert.deepEqual(getEmployeeIDPProgressSummary([
    { result: "done" },
    { st: "กำลังดำเนินการ" }
], "developing"), {
    doneCount: 1,
    totalCount: 2,
    canSubmit: false,
    status: "developing"
});

assert.deepEqual(getEmployeeIDPProgressSummary([
    { result: "done" },
    { st: "เสร็จสิ้นกิจกรรม" }
], "rejected"), {
    doneCount: 2,
    totalCount: 2,
    canSubmit: true,
    status: "rejected"
});
