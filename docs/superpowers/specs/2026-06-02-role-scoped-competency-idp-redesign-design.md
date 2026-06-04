# Role-Scoped Competency and IDP Redesign Design

## Source And Scope

This redesign is based on `เอกสารที่เกี่ยวข้อง/หลักการทำงาน_notFinal.pdf`, with `เอกสารที่เกี่ยวข้อง/ระบบบริหารสมรรถนะและแผนพัฒนารายบุคคล.pdf` used only as supporting context for the competency and IDP system concept.

The implementation must not add behavior beyond the finished parts of the document. If a requirement is unclear, pause and ask before implementing.

In scope:

- Universal employee pages that every role must see.
- Additional pages for `หัวหน้างาน`.
- Additional pages for `หัวหน้าฝ่าย`.
- Rename the existing `manager` role label/concept to `dean` only. Do not redesign dean workflows in this phase.

Out of scope:

- Deep workflow redesign for dean, HR, or admin.
- Features not described in the reference document.
- New approval paths beyond the document.

## Role Model

Every system user is also a `บุคลากร`, so every role must include the universal self-service pages.

Role-specific pages are add-ons:

- `employee`: universal pages only.
- `supervisor`: universal pages plus direct-report review and team monitoring pages.
- `department_head`: universal pages plus department-level review, approval, and monitoring pages.
- `dean`: renamed from the existing `manager` role only. No internal flow redesign in this phase.

The existing `manager_dept` role maps to `หัวหน้าฝ่าย`.

## Universal Pages For Every Role

### 1. ประเมินตนเอง

The assessment UI must be rebuilt as a cumulative behavior checklist.

Requirements:

- Display competency items bound to the user's position.
- Display expected level from the user's proficiency or configured expectation.
- Do not use score dropdowns or numeric score input fields.
- Show behavior indicators in order: `1.1`, `1.2`, `1.3`, etc.
- Each behavior item contributes `0.25` score by default.
- Only the first incomplete behavior checkbox is active.
- Later behavior checkboxes are disabled until previous behaviors are checked.
- Checking an item updates the actual score in real time.
- Each competency has a comment field.
- No evidence upload or URL attachment is required in the assessment page.

Score rule:

`Actual Score = checked behavior count * 0.25`

### 2. ผลการประเมิน

This page is available after the assessment result is approved by the required supervisor or department-head step.

Requirements:

- Show a Gap Dashboard at the top.
- Show total actual score.
- Show counts for passed competencies and competencies that require development.
- Show a competency breakdown table for CC, MC, and FC.
- For each competency, show expected score, actual score, and gap.
- Show missing behaviors for competencies with negative gap.
- Show comments from reviewers.
- Use missing behaviors as the source for the IDP page.

Gap rule:

`Gap = Actual Score - Expected Score`

If `Gap < 0`, the system must identify unchecked behavior indicators within the expected range.

### 3. แผนพัฒนา IDP

This page starts from negative competency gaps.

Auto-filled read-only data:

- Personal data: name, employee ID, position, organization.
- Competency code and name for competencies with negative gap.
- Expected score, actual score, and negative gap.
- Reviewer comment.
- Missing behavior text.

Locked data:

- Missing behavior targets are mandatory and cannot be removed by the user.

User input:

- Development target or behavior result.
- Development method or activity.
- Learning type, using options defined by admin data.
- Learning weight percentage.
- Activity detail.
- KPI or success criteria.
- Start date and end date.

Actions:

- Save draft.
- Submit for approval after required activity fields are completed.

The page should include a donut chart summary of learning weight distribution. The chart exists only to summarize weights entered in the form.

### 4. อัปเดตความก้าวหน้า

This page uses IDP items that have already been approved.

Read-only data:

- Competency code, competency name, and gap.
- Development target.
- Development method and activity.

User input:

- Execution status: follows plan or does not follow plan.
- If not following plan, reason is required.
- Achievement result: exceeds target, meets target, or does not meet target.
- If not achieved, text for continued development is required.
- Evidence attachment or evidence reference, such as document number, file, image, certificate, or URL.

After submission, the result goes to the matching supervisor or department-head verification flow.

### 5. รายละเอียด IDP

This page summarizes the user's IDP.

Requirements:

- Show current assessment year overview.
- Show passed competencies.
- Show competencies requiring development.
- Show current IDP status and progress for each activity.
- Allow selecting past assessment years.
- Past years are read-only.
- Provide export as PDF or Excel.

Data must be versioned by assessment cycle and year. Historical data must not be overwritten.

## Supervisor Add-On Pages

`หัวหน้างาน` sees direct reports only.

### 1. ตรวจประเมินลูกน้อง

Requirements:

- Show a pending to-do list before opening any assessment form.
- List only direct reports that submitted self-assessment.
- Table fields: employee name, position, submitted date, review action.
- Review view is read-only.
- Display expected level clearly.
- Mirror the employee's checked behavior checklist exactly.
- Disable all behavior checkboxes.
- Show employee comments.
- Provide supervisor comment field.

Actions:

- Approve: move result to `Pending Department Head`.
- Reject: return to employee for reassessment from the start.

### 2. ผลประเมินทีม

This is read-only analytics for direct reports.

Requirements:

- Summary cards for completion count, team strengths, and team weaknesses.
- Team gap heatmap.
- Heatmap X axis: competencies.
- Heatmap Y axis: direct reports.
- Red means gap is negative.
- Green means gap is zero or positive.
- Segment employees into high-gap list and talent pool.
- Export as PDF or Excel.

No edit or approval actions belong on this page.

### 3. ติดตาม IDP ทีม

Requirements:

- Show direct reports with negative gap and IDP obligation.
- Columns: employee name, position, number of competencies requiring IDP, current IDP status.
- Status tags include Draft, Submitted, In Progress, Evidence Submitted, and Completed.
- Detail view mirrors the employee IDP form in read-only mode.
- Show a progress stepper.
- Show evidence when available.
- Include a coaching comment box.

The coaching comment does not approve or reject the document.

## Department Head Add-On Pages

`หัวหน้าฝ่าย` sees users within the department or division they supervise. This role uses the same review family as supervisor, but with broader data scope and final approval authority.

### 1. อนุมัติผลการประเมินในฝ่าย

Requirements:

- Query by organization structure, not only by direct manager ID.
- Show employees in the department or division that the department head supervises.
- Provide filters for all units and team or unit.
- Show pending assessment inbox.
- Table fields: employee name, position, sub-unit, submitted date, review action.
- Review view is read-only.
- Display expected level clearly.
- Mirror checked behavior checklist exactly.
- Disable all behavior checkboxes.
- Show supervisor comment if the supervisor screened the assessment first.
- Provide department-head comment field.

Actions:

- Approve assessment: close the assessment result, calculate gap, and create IDP targets from missing behaviors when gap is negative.
- Reject or send back: require a comment and return to employee for reassessment.

### 2. ผลประเมินฝ่าย

This page is department-level analytics.

Requirements:

- Filter by all units or one team or unit.
- Show executive summary for the department.
- Show pass versus development ratio.
- Show top 5 strengths.
- Show top 5 competencies requiring development.
- Provide a "ดูเพิ่มเติม" path for seeing pass and fail counts per competency.
- Show department gap heatmap.
- Allow heatmap by employee or by team average when viewing all units.
- Show talent pool from people with overachieve or positive gap.
- Export as PDF or Excel.

RBAC:

- Department head can see only their own department or division.
- They must not see other departments.

### 3. อนุมัติผล IDP

This page has two tabs.

Tab 1: รออนุมัติแผน

- Show IDP plans in pending department-head approval status.
- Show read-only plan detail.
- Detail includes competency with negative gap, development target, KPI, method, learning type, timeline, and activity detail.
- Approve Plan changes status to Active or In Progress.
- Reject requires comment and returns the plan for correction.

Tab 2: รอรับรองผล

- Show IDP plans with Evidence Submitted status.
- Show evidence, execution status, and employee achievement report.
- Department head evaluates achievement as exceeds target, meets target, or does not meet target.
- If not achieved, continued-development reason is required.
- Certify and Complete changes status to Completed.

Filters:

- Must allow filtering by team or sub-unit.

### 4. ติดตาม IDP ฝ่าย

Requirements:

- Show department status board.
- Include donut or gauge for IDP statuses: In Progress, Evidence Submitted, Completed.
- Highlight delayed or inactive plans.
- Provide hierarchy tracking table.
- Filter by all units or one team or unit.
- Table fields: employee name, position, number of behaviors in development, progress percentage.
- Detail view is read-only.
- Show goals, development activities, evidence, and latest saved updates.
- Include executive feedback comment.

The feedback comment does not approve or reject the document.

## Dean Rename Only

Rename the existing `manager` concept to `dean` so the code and labels no longer confuse dean-level users with department-head users.

Allowed in this phase:

- Rename the existing `manager` role key to `dean`.
- Preserve current dean workflow behavior.

Not allowed in this phase:

- Redesign dean pages.
- Add new dean approval flow.
- Change dean dashboard behavior beyond what is required for the rename.

## Navigation Rules

Every role navigation starts with the universal pages.

Supervisor navigation then adds supervisor pages.

Department-head navigation then adds department-head pages.

Dean, HR, and admin may still show their existing pages, but this redesign phase must not rebuild those workflows.

## Data And State Rules

Assessment statuses must support at least:

- Draft.
- Self Submitted.
- Pending Supervisor.
- Pending Department Head.
- Approved or Completed.
- Rejected.

IDP statuses must support at least:

- Draft.
- Submitted.
- Active or In Progress.
- Evidence Submitted.
- Completed.
- Rejected.

Missing behavior text must remain linked to the source competency and source assessment result.

Historical assessment and IDP data must be tied to assessment year or cycle.

## Implementation Guardrails

- Do not keep old score dropdown or numeric score inputs in the redesigned assessment flow.
- Do not let reviewers edit another person's checked behaviors.
- Do not let supervisor or department-head monitoring pages accidentally approve or reject documents.
- Do not add uploads to the self-assessment page.
- Do not add role flows outside the finished document scope.
- Ask before implementing anything ambiguous.

## Open Questions Before Implementation

Resolved decisions:

- Rename the existing `manager_dept` role key to `department_head`.
- Rename the existing `manager` role key to `dean`.
- The progress update evidence UI must include a real file picker in the mockup.
