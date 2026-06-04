# Role-Scoped Competency and IDP Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the employee, supervisor, and department-head competency/IDP pages from the approved document-driven spec.

**Architecture:** Keep the app as a Vite/React mockup, but split the incorrect role flows into clearer files: universal employee pages, supervisor add-ons, department-head add-ons, and dean pages. Add one shared workflow module for mock assessment/IDP data, scoring, missing behavior extraction, role scoping, and status labels so the UI does not duplicate domain rules.

**Tech Stack:** React 19, TypeScript, Vite, existing CSS utility classes in `src/index.css`, `lucide-react` where icons are already used.

---

## Source Spec

Implement only what is in:

`docs/superpowers/specs/2026-06-02-role-scoped-competency-idp-redesign-design.md`

Reference PDFs:

- `เอกสารที่เกี่ยวข้อง/หลักการทำงาน_notFinal.pdf`
- `เอกสารที่เกี่ยวข้อง/ระบบบริหารสมรรถนะและแผนพัฒนารายบุคคล.pdf`

Do not add new roles, dean workflows, HR workflows, admin workflows, or extra approval paths.

## File Structure

Modify:

- `src/data.ts`
  - Rename role keys: `manager_dept` to `department_head`, `manager` to `dean`.
  - Update role labels and navigation IDs.
  - Preserve dean behavior and pages.

- `src/App.tsx`
  - Update imports and routing.
  - Route universal pages to every role.
  - Route supervisor add-ons to `supervisor`.
  - Route department-head add-ons to `department_head`.
  - Route dean pages through renamed dean components without redesigning dean internals.

- `src/components/EmployeePages.tsx`
  - Rebuild the five universal pages.
  - Remove score dropdown/numeric 1-5 assessment UI.
  - Add real file picker only on progress/evidence page, not assessment page.

- `src/components/SupervisorPages.tsx`
  - Rebuild supervisor add-ons for direct reports only.
  - Ensure all review checklists are read-only.

- `src/components/DepartmentHeadPages.tsx`
  - Create this new file for `หัวหน้าฝ่าย`.
  - Use department/division scope rather than direct-report scope.

- `src/components/DeanPages.tsx`
  - Rename/move existing `src/components/ManagerPages.tsx` into this file.
  - Keep internals as-is except exported component names and role-name references needed for imports.

Create:

- `src/workflow.ts`
  - Shared mock workflow data and pure helpers.
  - Competency behavior flattening, score calculation, gap calculation, missing behavior extraction.
  - Direct-report and department-head scoping helpers.
  - IDP mock rows and progress evidence data.

Verification:

- `npm run lint`
- `npm run build`
- Manual browser check after implementation using the local Vite URL.

## Task 1: Baseline And Role Rename

**Files:**

- Modify: `src/data.ts`
- Modify: `src/App.tsx`
- Rename: `src/components/ManagerPages.tsx` to `src/components/DeanPages.tsx`

- [ ] **Step 1: Capture current type/build baseline**

Run:

```bash
npm run lint
```

Expected:

- Either `tsc --noEmit` passes, or the current failures are recorded before editing.
- Do not fix unrelated failures in this task.

- [ ] **Step 2: Rename dean file**

Run:

```bash
mv src/components/ManagerPages.tsx src/components/DeanPages.tsx
```

Expected:

- `src/components/DeanPages.tsx` exists.
- `src/components/ManagerPages.tsx` no longer exists.

- [ ] **Step 3: Update role keys in `src/data.ts`**

Change `ROLES_CONFIG` keys:

```ts
department_head: { lbl: "หัวหน้าฝ่าย", name: "ผศ.ดร.ธนพล ไชยรักษ์", av: "ธ", pos: "รองคณบดีฝ่ายบริหาร", col: "#D97706" },
dean: { lbl: "ผู้บริหาร", name: "รศ.ดร.กิตติพงศ์ แสงทอง", av: "ก", pos: "คณบดี", col: "#0F2D5B" }
```

Replace references in `INITIAL_USERS`:

- `r: "manager_dept"` becomes `r: "department_head"`.
- `r: "manager"` becomes `r: "dean"`.

- [ ] **Step 4: Update navigation keys in `src/data.ts`**

Rename `NAV_CONFIG.manager_dept` to `NAV_CONFIG.department_head`.

Rename `NAV_CONFIG.manager` to `NAV_CONFIG.dean`.

Keep universal items first for all roles. Department-head add-on items should use these IDs:

```ts
{ id: "dept-assessment-approval", ic: "✅", lb: "อนุมัติผลการประเมิน" },
{ id: "dept-gap", ic: "📊", lb: "ผลประเมินฝ่าย" },
{ id: "dept-idp-approval", ic: "🗂️", lb: "อนุมัติผล IDP" },
{ id: "dept-idp-tracking", ic: "📉", lb: "ติดตาม IDP ฝ่าย" }
```

Keep dean page IDs mapped to the existing dean page behavior:

```ts
"dean-gap": "Competency Gap คณะ"
"dean-idp": "ติดตาม IDP ภาพรวม"
"dean-assessment-approval": "อนุมัติผลการประเมิน"
"dean-idp-approval": "อนุมัติแผน IDP"
```

- [ ] **Step 5: Update imports in `src/App.tsx`**

Replace manager/dean imports:

```ts
import { DeanGap, DeanIDP, DeanAssessmentApproval, DeanIDPApproval, DeptMonitor } from './components/DeanPages';
import { DepartmentAssessmentApproval, DepartmentGap, DepartmentIDPApproval, DepartmentIDPTracking } from './components/DepartmentHeadPages';
```

Expected:

- `ManagerPages` is no longer imported.
- Existing dean internals are imported from `DeanPages`.

- [ ] **Step 6: Update role checks in `src/App.tsx`**

Replace role-key checks:

- `currentRole === "manager_dept"` with `currentRole === "department_head"`.
- `currentRole === "manager"` with `currentRole === "dean"`.
- `u.r === "manager_dept"` with `u.r === "department_head"`.
- `u.r === "manager"` with `u.r === "dean"`.

Expected:

- TypeScript recognizes `currentRole` as a key of the updated `ROLES_CONFIG`.

- [ ] **Step 7: Run type check**

Run:

```bash
npm run lint
```

Expected:

- Failures only if later tasks have not created imported files yet.
- If it fails because `DepartmentHeadPages.tsx` is missing, continue to Task 4.

## Task 2: Shared Workflow Module

**Files:**

- Create: `src/workflow.ts`

- [ ] **Step 1: Create shared types**

Add `src/workflow.ts` with exported types:

```ts
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
  status: IDPStatus;
  evidenceFiles?: string[];
  evidenceUrl?: string;
  progressComment?: string;
}
```

- [ ] **Step 2: Add mock competencies with 0.25 behavior weights**

In `src/workflow.ts`, export `WORKFLOW_COMPETENCIES`.

Include at least the competencies already used in the mock app:

- `CC-001`
- `CC-002`
- `CC-003`
- `FC2-061`
- `FC2-062`

Each competency must contain ordered behavior indicators with IDs like:

```ts
{
  id: "CC-001-1.1",
  level: 1,
  order: 1,
  text: "สามารถระบุและจำแนกผู้เรียนและผู้รับบริการที่เกี่ยวข้องกับงานของตนได้อย่างเหมาะสม",
  weight: 0.25
}
```

Expected:

- Every behavior has a unique ID.
- Every behavior weight is `0.25`.
- Behaviors are ordered from Level 1 upward.

- [ ] **Step 3: Add scoring helpers**

Add:

```ts
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
```

- [ ] **Step 4: Add sequential unlock helper**

Add:

```ts
export const nextUnlockedBehaviorId = (competency: WorkflowCompetency, checkedBehaviorIds: string[]) =>
  competency.indicators.find(indicator => !checkedBehaviorIds.includes(indicator.id))?.id || null;

export const canToggleBehavior = (
  competency: WorkflowCompetency,
  behaviorId: string,
  checkedBehaviorIds: string[]
) => checkedBehaviorIds.includes(behaviorId) || nextUnlockedBehaviorId(competency, checkedBehaviorIds) === behaviorId;
```

Expected:

- A behavior can be checked only if it is the first unchecked behavior.
- A checked behavior can be unchecked so the user can correct the last state.

- [ ] **Step 5: Add role scoping helpers**

Add:

```ts
export const getDirectReports = (users: any[], currentUser: any) =>
  users.filter(user => user.sup === currentUser?.n && user.sso !== currentUser?.sso);

export const getDepartmentMembers = (users: any[], departmentHead: any) => {
  const dept = departmentHead?.d?.split(" > ")[0] || departmentHead?.d;
  return users.filter(user => {
    const userDept = user?.d?.split(" > ")[0] || user?.d;
    return dept && userDept === dept && user.sso !== departmentHead?.sso;
  });
};
```

Expected:

- Supervisor pages use direct reports.
- Department-head pages use department scope.

- [ ] **Step 6: Add mock records**

Export mock records:

```ts
export const MOCK_ASSESSMENTS: AssessmentRecord[] = [
  {
    userSso: "20002",
    checkedBehaviorIds: ["CC-001-1.1", "CC-001-1.2", "CC-001-1.3", "CC-001-1.4", "FC2-061-1.1", "FC2-061-1.2"],
    comments: {
      "CC-001": "ทำงานบริการได้ตามเกณฑ์พื้นฐาน",
      "FC2-061": "ยังต้องพัฒนาการใช้เครื่องมือดิจิทัลให้ต่อเนื่อง"
    },
    status: "self_submitted"
  }
];
```

Expected:

- At least one mock user has negative gap.
- Missing behavior extraction can feed the IDP page.

- [ ] **Step 7: Run type check**

Run:

```bash
npm run lint
```

Expected:

- `src/workflow.ts` compiles.
- Any remaining failures should be from components not yet updated.

## Task 3: Universal Employee Pages

**Files:**

- Modify: `src/components/EmployeePages.tsx`
- Use: `src/workflow.ts`

- [ ] **Step 1: Replace score UI with behavior checklist**

In `EmployeeAssess`, remove the 1-5 score tiles and assessment evidence upload block.

Render each competency with:

- Expected level.
- Actual score.
- Ordered behavior rows.
- Checkbox per behavior.
- Disabled state from `canToggleBehavior`.
- Comment field per competency.

The checkbox handler must:

```ts
const toggleBehavior = (competency: WorkflowCompetency, behaviorId: string) => {
  setCheckedIds(prev => {
    if (!canToggleBehavior(competency, behaviorId, prev)) return prev;
    if (prev.includes(behaviorId)) {
      return prev.filter(id => id !== behaviorId);
    }
    return [...prev, behaviorId];
  });
};
```

Expected:

- No assessment page upload UI.
- No numeric score input or dropdown.
- Users can check only the next available behavior.

- [ ] **Step 2: Add save draft and submit**

Keep localStorage behavior, but store:

```ts
{
  checkedBehaviorIds: string[],
  comments: Record<string, string>,
  status: "draft" | "self_submitted"
}
```

Submit action:

- Updates current user `evalStatus` to `self_submitted`.
- Saves the assessment record.
- Shows mock success alert.

- [ ] **Step 3: Rebuild `EmployeeGap`**

Use `gapFor` across `WORKFLOW_COMPETENCIES`.

Render:

- Total actual score.
- Passed count where `gap >= 0`.
- Development count where `gap < 0`.
- Breakdown rows with expected, actual, gap.
- Missing behaviors listed only for negative gaps.
- Reviewer comments.
- Button to go to `emp-idp`.

Expected:

- Negative gap rows show missing behavior text.
- Positive/zero gap rows do not create IDP targets.

- [ ] **Step 4: Rebuild `EmployeeIDP`**

Use negative gap results as the source.

Each negative gap block must show read-only:

- Competency code/name.
- Expected score.
- Actual score.
- Gap.
- Reviewer comment.
- Locked missing behaviors.

Editable fields:

- Development target.
- Learning type dropdown using `learningMethods`.
- Learning weight number.
- Activity detail.
- KPI.
- Start/end date.

Actions:

- Save draft.
- Submit for approval.

Expected:

- Missing behaviors are visible and cannot be removed.
- User cannot create unrelated development targets outside negative gaps.

- [ ] **Step 5: Add donut chart summary in `EmployeeIDP`**

Use existing CSS and inline style if needed.

Render learning weight summary from the editable activity rows only.

Expected:

- Chart summarizes entered weights.
- Chart does not enforce a ratio unless the document explicitly says so.

- [ ] **Step 6: Rebuild `EmployeeProgress` with real file picker**

Use approved/in-progress mock IDP rows.

For each row, render read-only:

- Competency code/name/gap.
- Development target.
- Activity.

Editable:

- Execution status.
- Required reason if not following plan.
- Achievement result.
- Required continued-development text if not achieved.
- File picker:

```tsx
<input type="file" multiple />
```

- Evidence URL/reference field.

Expected:

- File picker exists.
- Assessment page still has no file picker.

- [ ] **Step 7: Rebuild `EmployeeIDPDetail`**

Render:

- Current-year overview.
- Passed competencies.
- Competencies requiring development.
- Current IDP status and progress.
- Year selector with read-only history.
- Export buttons.

Expected:

- Past year view is read-only.

- [ ] **Step 8: Run verification**

Run:

```bash
npm run lint
npm run build
```

Expected:

- Both commands pass before moving to supervisor pages.

## Task 4: Supervisor Add-On Pages

**Files:**

- Modify: `src/components/SupervisorPages.tsx`
- Use: `src/workflow.ts`

- [ ] **Step 1: Rebuild `SupervisorAssess` as pending inbox**

Use `getDirectReports(users, currentUser)`.

Show only direct reports with `evalStatus === "self_submitted"`.

Table:

- Name.
- Position.
- Submitted date mock value.
- Review button.

Expected:

- No assessment form appears until a row is selected.

- [ ] **Step 2: Add read-only review view**

When reviewing a selected direct report, render:

- Expected level.
- Employee checked behaviors.
- Disabled checkboxes.
- Employee comments.
- Supervisor comment text area.

Actions:

- Approve: set employee `evalStatus` to `pending_department_head`.
- Reject: set employee `evalStatus` to `rejected`.

Expected:

- Supervisor cannot edit checked behaviors.

- [ ] **Step 3: Rebuild `TeamGap`**

Use direct reports only.

Render:

- Completion summary.
- Team strengths.
- Team weaknesses.
- Heatmap with competencies as X axis and direct reports as Y axis.
- Red for `gap < 0`.
- Green for `gap >= 0`.
- High-gap list.
- Talent pool.
- Export buttons.

Expected:

- Read-only page.
- No approve/reject actions.

- [ ] **Step 4: Rebuild `TeamIDP`**

Use direct reports with negative gap.

Render:

- Employee table.
- Position.
- Number of IDP competencies.
- Current status tag.
- Read-only detail drawer/modal.
- Progress stepper.
- Evidence viewer.
- Coaching comment box.

Expected:

- Coaching comment does not change IDP status.
- No approve/reject action exists on this monitoring page.

- [ ] **Step 5: Run verification**

Run:

```bash
npm run lint
npm run build
```

Expected:

- Both commands pass before department-head pages.

## Task 5: Department-Head Add-On Pages

**Files:**

- Create: `src/components/DepartmentHeadPages.tsx`
- Modify: `src/App.tsx`
- Use: `src/workflow.ts`

- [ ] **Step 1: Create exports**

Create `src/components/DepartmentHeadPages.tsx` with:

```ts
export const DepartmentAssessmentApproval: React.FC<{ users: any[]; currentUser: any; setUsers: any }> = ...
export const DepartmentGap: React.FC<{ users: any[]; currentUser: any }> = ...
export const DepartmentIDPApproval: React.FC<{ users: any[]; currentUser: any }> = ...
export const DepartmentIDPTracking: React.FC<{ users: any[]; currentUser: any }> = ...
```

Expected:

- The file compiles after the components are filled in.

- [ ] **Step 2: Implement `DepartmentAssessmentApproval`**

Use `getDepartmentMembers(users, currentUser)`.

Render:

- Filter for all units or one unit/team.
- Pending assessment inbox.
- Read-only review view.
- Expected level.
- Disabled behavior checkboxes.
- Supervisor comment.
- Department-head comment.

Actions:

- Approve: calculate gaps and set status approved/completed for the mock user.
- Reject: require comment and set status rejected.

Expected:

- Department head sees only their department.
- Approve triggers missing behavior extraction for IDP source data.

- [ ] **Step 3: Implement `DepartmentGap`**

Render:

- Department summary.
- Pass vs development ratio.
- Top 5 strengths.
- Top 5 competencies requiring development.
- `ดูเพิ่มเติม` view for pass/fail counts per competency.
- Department heatmap by employee or unit average.
- Talent pool.
- Export buttons.

Expected:

- No data from other departments appears.

- [ ] **Step 4: Implement `DepartmentIDPApproval`**

Render two tabs:

- `รออนุมัติแผน`.
- `รอรับรองผล`.

Pending Plan tab:

- Read-only plan detail.
- Approve Plan sets status to `in_progress`.
- Reject requires comment and sets status to `rejected`.

Pending Result tab:

- Shows evidence and employee achievement report.
- Department head selects result: exceeds, meets, not achieved.
- If not achieved, continued-development text is required.
- Certify and Complete sets status to `completed`.

Expected:

- The two tabs do not mix plan approval and result certification.

- [ ] **Step 5: Implement `DepartmentIDPTracking`**

Render:

- Department status board.
- Donut or gauge for In Progress, Evidence Submitted, Completed.
- Delayed/inactive alert.
- Hierarchy tracking table.
- Read-only progress detail.
- Executive feedback comment.

Expected:

- Feedback comment does not approve or reject anything.

- [ ] **Step 6: Wire routes in `src/App.tsx`**

Map page IDs:

```ts
case "dept-assessment-approval":
  return <DepartmentAssessmentApproval users={users} currentUser={selectedDepartmentHead} setUsers={setUsers} />;
case "dept-gap":
  return <DepartmentGap users={users} currentUser={selectedDepartmentHead} />;
case "dept-idp-approval":
  return <DepartmentIDPApproval users={users} currentUser={selectedDepartmentHead} />;
case "dept-idp-tracking":
  return <DepartmentIDPTracking users={users} currentUser={selectedDepartmentHead} />;
```

Expected:

- `department_head` role opens department-head pages.
- `supervisor` role still opens supervisor add-ons.

- [ ] **Step 7: Run verification**

Run:

```bash
npm run lint
npm run build
```

Expected:

- Both commands pass.

## Task 6: Dean Rename Preservation

**Files:**

- Modify: `src/components/DeanPages.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Rename exported component names only**

In `src/components/DeanPages.tsx`, rename exports:

- `ManagerGap` to `DeanGap`.
- `ManagerIDP` to `DeanIDP`.
- `ManagerAssessmentApproval` to `DeanAssessmentApproval`.
- `ManagerIDPApproval` to `DeanIDPApproval`.

Keep internal layout and behavior unchanged.

- [ ] **Step 2: Update dean route IDs**

In `src/App.tsx`, map:

```ts
case "dean-gap":
  return <DeanGap users={users} />;
case "dean-idp":
  return <DeanIDP users={users} />;
case "dean-assessment-approval":
  return <DeanAssessmentApproval users={users} />;
case "dean-idp-approval":
  return <DeanIDPApproval users={users} />;
```

Expected:

- Dean page behavior is preserved.
- No new dean functionality is added.

- [ ] **Step 3: Run verification**

Run:

```bash
npm run lint
npm run build
```

Expected:

- Both commands pass.

## Task 7: Visual And Manual QA

**Files:**

- No code changes unless defects are found.

- [ ] **Step 1: Start dev server**

Run:

```bash
npm run dev
```

Expected:

- Vite serves at `http://localhost:3000`.

- [ ] **Step 2: Check employee universal flow**

Manual checks:

- Log in.
- Select `บุคลากร`.
- Open `ประเมินตนเอง`.
- Confirm checkboxes unlock one by one.
- Confirm no score dropdown or numeric score input exists.
- Confirm no evidence upload exists on assessment.
- Open `ผลการประเมิน`.
- Confirm negative gaps show missing behaviors.
- Open `แผนพัฒนา IDP`.
- Confirm missing behaviors are locked targets.
- Open `อัปเดตความก้าวหน้า`.
- Confirm file picker exists.
- Open `รายละเอียด IDP`.
- Confirm year history is read-only.

- [ ] **Step 3: Check supervisor add-ons**

Manual checks:

- Select `หัวหน้างาน`.
- Confirm universal 5 pages are still visible.
- Open supervisor assessment inbox.
- Confirm only direct reports appear.
- Open review.
- Confirm checklist is read-only.
- Confirm approve sends to department-head pending state.
- Open team gap.
- Confirm read-only heatmap.
- Open team IDP.
- Confirm monitoring page has no approve/reject actions.

- [ ] **Step 4: Check department-head add-ons**

Manual checks:

- Select `หัวหน้าฝ่าย`.
- Confirm universal 5 pages are still visible.
- Open department assessment approval.
- Confirm only department members appear.
- Confirm review checklist is read-only.
- Confirm approval calculates gap and creates IDP targets.
- Open department gap.
- Confirm department heatmap and top 5 sections.
- Open IDP approval.
- Confirm two tabs are separate.
- Open IDP tracking.
- Confirm feedback is separate from approval.

- [ ] **Step 5: Check dean rename**

Manual checks:

- Select `ผู้บริหาร`.
- Confirm role is named dean/ผู้บริหาร rather than manager.
- Confirm old dean pages still render.
- Do not change dean workflows.

## Task 8: Final Verification

**Files:**

- No code changes unless defects are found.

- [ ] **Step 1: Run final type check**

Run:

```bash
npm run lint
```

Expected:

- `tsc --noEmit` passes.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected:

- Vite build succeeds.

- [ ] **Step 3: Check git diff**

Run:

```bash
git status --short --untracked-files=all
git diff -- src/data.ts src/App.tsx src/components/EmployeePages.tsx src/components/SupervisorPages.tsx src/components/DepartmentHeadPages.tsx src/components/DeanPages.tsx src/workflow.ts src/index.css
```

Expected:

- Diff only covers this redesign.
- Existing unrelated user changes are not reverted.

- [ ] **Step 4: Commit after user approval**

Only after the user confirms the final implementation, stage the files touched by this plan.

Run:

```bash
git add src/data.ts src/App.tsx src/components/EmployeePages.tsx src/components/SupervisorPages.tsx src/components/DepartmentHeadPages.tsx src/components/DeanPages.tsx src/workflow.ts docs/superpowers/specs/2026-06-02-role-scoped-competency-idp-redesign-design.md docs/superpowers/plans/2026-06-02-role-scoped-competency-idp-redesign.md
git commit -m "feat: rebuild role scoped competency idp flows"
```

Expected:

- Commit succeeds.
- Do not stage unrelated `.gitignore`, old approval-dashboard docs, or unrelated existing edits unless the user asks.

## Plan Self-Review

Spec coverage:

- Universal pages are covered by Task 3.
- Supervisor add-ons are covered by Task 4.
- Department-head add-ons are covered by Task 5.
- Dean rename only is covered by Tasks 1 and 6.
- Evidence file picker is covered by Task 3 Step 6.
- Guardrails against out-of-document behavior are reflected in the source scope, department-head actions, and dean preservation tasks.

Placeholder scan:

- No placeholder marker steps are used.
- Every task has concrete file targets and verification commands.

Type consistency:

- Role keys are consistently `department_head` and `dean`.
- Department-head components are consistently imported from `DepartmentHeadPages`.
- Dean components are consistently imported from `DeanPages`.
