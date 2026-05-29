export type SupervisorIDPDecision = "approved" | "rejected";
export type SupervisorIDPNextPhase = "forwarded" | "rejected";

type GapLike = {
    cd: string;
};

export type SupervisorIDPReviewState = {
    canForward: boolean;
    nextPhase: SupervisorIDPNextPhase | null;
    message: string | null;
    pendingGapCodes: string[];
    rejectedGapCodes: string[];
};

export const buildSupervisorGapDecisionKey = (staffId: string, gapCode: string) => `${staffId}:${gapCode}`;

export const validateSupervisorGapDecision = (decision: SupervisorIDPDecision, feedback: string) => {
    if (decision === "rejected" && !feedback.trim()) {
        return {
            ok: false,
            message: "กรุณาระบุข้อเสนอแนะของข้อสมรรถนะที่ไม่ผ่านก่อน"
        } as const;
    }

    return { ok: true } as const;
};

export const getSupervisorIDPReviewState = (
    staffId: string,
    gaps: GapLike[],
    decisions: Record<string, SupervisorIDPDecision>,
    feedback: Record<string, string>
): SupervisorIDPReviewState => {
    const pendingGapCodes = gaps
        .filter(gap => !decisions[buildSupervisorGapDecisionKey(staffId, gap.cd)])
        .map(gap => gap.cd);

    if (pendingGapCodes.length) {
        return {
            canForward: false,
            nextPhase: null,
            message: "กรุณาตรวจทุกข้อสมรรถนะก่อนส่งต่อ",
            pendingGapCodes,
            rejectedGapCodes: []
        };
    }

    const rejectedGapCodes = gaps
        .filter(gap => decisions[buildSupervisorGapDecisionKey(staffId, gap.cd)] === "rejected")
        .map(gap => gap.cd);

    if (rejectedGapCodes.length) {
        const missingFeedback = rejectedGapCodes.some(gapCode => !feedback[buildSupervisorGapDecisionKey(staffId, gapCode)]?.trim());
        return {
            canForward: false,
            nextPhase: "rejected",
            message: missingFeedback
                ? "กรุณาระบุข้อเสนอแนะของข้อสมรรถนะที่ไม่ผ่านก่อน"
                : "มีข้อสมรรถนะไม่ผ่าน ต้องส่งกลับให้บุคลากรแก้ไขก่อน",
            pendingGapCodes: [],
            rejectedGapCodes
        };
    }

    return {
        canForward: true,
        nextPhase: "forwarded",
        message: null,
        pendingGapCodes: [],
        rejectedGapCodes: []
    };
};
