import assert from "node:assert/strict";
import {
    buildSupervisorGapDecisionKey,
    getSupervisorIDPReviewState,
    validateSupervisorGapDecision
} from "./supervisor-idp-rules";

const staffId = "staff-1";
const gaps = [
    { cd: "CC-003", n: "การทำงานเป็นทีม" },
    { cd: "FC2-061", n: "การใช้เทคโนโลยีดิจิทัล" }
];

assert.equal(buildSupervisorGapDecisionKey(staffId, "CC-003"), "staff-1:CC-003");

assert.deepEqual(validateSupervisorGapDecision("rejected", ""), {
    ok: false,
    message: "กรุณาระบุข้อเสนอแนะของข้อสมรรถนะที่ไม่ผ่านก่อน"
});

assert.deepEqual(validateSupervisorGapDecision("rejected", "ควรเพิ่มกิจกรรม OJT"), {
    ok: true
});

assert.deepEqual(
    getSupervisorIDPReviewState(staffId, gaps, {
        "staff-1:CC-003": "approved"
    }, {}),
    {
        canForward: false,
        nextPhase: null,
        message: "กรุณาตรวจทุกข้อสมรรถนะก่อนส่งต่อ",
        pendingGapCodes: ["FC2-061"],
        rejectedGapCodes: []
    }
);

assert.deepEqual(
    getSupervisorIDPReviewState(staffId, gaps, {
        "staff-1:CC-003": "approved",
        "staff-1:FC2-061": "rejected"
    }, {
        "staff-1:FC2-061": "เพิ่มรายละเอียดกิจกรรมให้ชัดเจน"
    }),
    {
        canForward: false,
        nextPhase: "rejected",
        message: "มีข้อสมรรถนะไม่ผ่าน ต้องส่งกลับให้บุคลากรแก้ไขก่อน",
        pendingGapCodes: [],
        rejectedGapCodes: ["FC2-061"]
    }
);

assert.deepEqual(
    getSupervisorIDPReviewState(staffId, gaps, {
        "staff-1:CC-003": "approved",
        "staff-1:FC2-061": "approved"
    }, {}),
    {
        canForward: true,
        nextPhase: "forwarded",
        message: null,
        pendingGapCodes: [],
        rejectedGapCodes: []
    }
);
