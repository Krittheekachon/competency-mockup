# Approval Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace flat manager approval tables with dashboard summaries grouped by department and workline for assessment and IDP approval pages.

**Architecture:** Keep the existing manager page components and modals. Add small pure helper functions in `src/components/ManagerPages.tsx` to derive dashboard metrics, workline summaries, and department groups from existing approval rows, then render both approval pages through one shared approval dashboard component.

**Tech Stack:** React 19, TypeScript, Vite, existing CSS utilities, `tsx` for a lightweight helper behavior check, `npm run lint` for type verification.

---

### Task 1: Add Approval Grouping Helpers

**Files:**
- Modify: `src/components/ManagerPages.tsx`

- [ ] **Step 1: Write a failing helper behavior check**

Run:

```bash
npx tsx -e "import { __approvalDashboardTestHooks } from './src/components/ManagerPages.tsx'; const rows = [{ id: '1', dept: 'ฝ่ายบริหาร', workline: 'สายสนับสนุน', completed: true }, { id: '2', dept: 'ฝ่ายบริหาร', workline: 'สายวิชาการ', completed: false }, { id: '3', dept: 'ฝ่ายแผน', workline: 'สายสนับสนุน', completed: true }]; const data = __approvalDashboardTestHooks.buildApprovalDashboard(rows, ['1']); if (data.totals.departments !== 2) throw new Error('departments mismatch'); if (data.totals.approved !== 1) throw new Error('approved mismatch'); if (data.worklines.find(w => w.name === 'สายสนับสนุน')?.total !== 2) throw new Error('workline grouping mismatch'); if (data.departments.find(d => d.name === 'ฝ่ายบริหาร')?.worklines.length !== 2) throw new Error('department workline mismatch'); console.log('approval helper ok');"
```

Expected: FAIL because `__approvalDashboardTestHooks` does not exist yet.

- [ ] **Step 2: Implement minimal helper code**

Add `workline` and `completed` fields to approval rows and add helper functions:

```ts
type ApprovalRow = ReturnType<typeof getApprovalRows>[number];
type ApprovalDashboardRow = ApprovalRow & { workline: string; completed: boolean };

const getDisplayWorkline = (workline?: string) => workline || "ไม่ระบุสายงาน";
const buildApprovalDashboard = (rows: ApprovalDashboardRow[], approvedIds: string[]) => {
  // derive totals, workline summaries, and department groups
};

export const __approvalDashboardTestHooks = { buildApprovalDashboard };
```

- [ ] **Step 3: Run the helper behavior check**

Run the same `npx tsx -e ...` command.

Expected: PASS and print `approval helper ok`.

### Task 2: Replace Flat Tables With Shared Dashboard UI

**Files:**
- Modify: `src/components/ManagerPages.tsx`

- [ ] **Step 1: Add a shared approval dashboard component**

Create a local `ApprovalDashboardView` component that receives page copy, rows, approved IDs, selected ID setter, and approve callback.

- [ ] **Step 2: Update `ManagerAssessmentApproval`**

Use `ApprovalDashboardView` with assessment wording and keep the competency detail modal.

- [ ] **Step 3: Update `ManagerIDPApproval`**

Use `ApprovalDashboardView` with IDP wording and keep the IDP detail modal.

- [ ] **Step 4: Run type verification**

Run:

```bash
npm run lint
```

Expected: TypeScript completes without errors.

### Task 3: Visual Verification

**Files:**
- Modify only if verification finds layout issues.

- [ ] **Step 1: Start the app**

Run:

```bash
npm run dev
```

Expected: Vite serves the app on port 3000 or another available port.

- [ ] **Step 2: Inspect the manager approval pages**

Open the app in the browser, switch to the manager role if needed, and check:

- `อนุมัติผลการประเมิน` shows dashboard cards, workline cards, department accordion cards, and person actions.
- `อนุมัติแผน IDP` shows the same structure with IDP wording and IDP topics.
- Text does not overflow on desktop width.
- Approve buttons update counts and row badges.

- [ ] **Step 3: Final verification**

Run:

```bash
npm run lint
```

Expected: TypeScript completes without errors.
