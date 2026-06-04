# Approval Dashboard Redesign Design

## Goal
Redesign `อนุมัติผลการประเมิน` and `อนุมัติแผน IDP` so managers see a dashboard summary first, then review grouped records by department and workline instead of one long flat table.

## Chosen Direction
Use Dashboard + Accordion by department. This matches the requested workflow: scan whole-faculty progress, compare departments, then open each department to see workline groups and individual people.

## Page Structure
Both pages share the same layout and interaction model.

1. Header explains the approval context.
2. Dashboard cards show global counts.
3. Workline summary cards show `สายวิชาการ`, `สายสนับสนุน`, `สายงานบริหาร`, and any missing workline.
4. Department accordion cards show each department with total, completed, pending approval, approved, and not-started counts.
5. Inside each department, rows are grouped by workline.
6. Each person row keeps the existing actions: view detail and approve.

## Assessment Wording
The assessment page uses:

- `ประเมินแล้ว`
- `ยังไม่ประเมิน`
- `รออนุมัติ`
- `อนุมัติแล้ว`
- `ยืนยันผล`

The detail modal keeps competency rows with expected and actual levels.

## IDP Wording
The IDP page uses:

- `มีแผน IDP แล้ว`
- `ยังไม่มีแผน`
- `รออนุมัติแผน`
- `อนุมัติแล้ว`
- `ยืนยันแผน`

The detail modal keeps IDP topics, method, due date, and outcome.

## Data Rules
Use existing `users` and `getApprovalRows(users)` mock approval rows. Add derived fields for department and workline. If a user has no workline, show `ไม่ระบุสายงาน`. Use existing local component state for approved IDs.

For this mockup, a row counts as completed when it is available in approval rows. A row counts as approved when its ID is in the page state. A row counts as pending approval when completed but not yet approved.

## Implementation Notes
Keep the change scoped to `src/components/ManagerPages.tsx` and reuse existing CSS utility classes. Inline styles are acceptable here because this file already uses them heavily for page-specific layout.
