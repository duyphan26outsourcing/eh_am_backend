import { Injectable } from '@nestjs/common';
import {
  type OrgChartIssueModel,
  type OrgChartIssueReason,
  type OrgChartModel,
  type OrgChartPersonModel,
  type OrgChartProfileRow,
  toOrgChartPerson,
} from './org-chart.model';
import { OrgChartRepository } from './org-chart.repository';

@Injectable()
export class OrgChartService {
  constructor(private readonly repository: OrgChartRepository) {}

  async getChart(): Promise<OrgChartModel> {
    const rows = await this.repository.findVisibleProfiles();
    const rowsById = new Map(rows.map((row) => [row.id, row]));
    const cycleIds = findCycleIds(rows, rowsById);
    const nodes = new Map(
      rows
        .filter((row) => !cycleIds.has(row.id))
        .map((row) => [row.id, toOrgChartPerson(row)]),
    );
    const roots: OrgChartPersonModel[] = [];

    for (const node of nodes.values()) {
      const parent = node.managerId ? nodes.get(node.managerId) : null;
      if (parent) parent.children.push(node);
      else roots.push(node);
    }
    sortTree(roots);

    const issues = rows
      .map((row) => toIssue(row, rowsById, cycleIds))
      .filter((issue): issue is OrgChartIssueModel => issue !== null)
      .sort(comparePeople);

    return {
      root: { id: 'every-half', label: 'Every Half', children: roots },
      issues,
      totals: { people: rows.length, issues: issues.length },
    };
  }
}

function findCycleIds(
  rows: OrgChartProfileRow[],
  rowsById: Map<string, OrgChartProfileRow>,
): Set<string> {
  const state = new Map<string, 0 | 1 | 2>();
  const cycles = new Set<string>();

  for (const start of rows) {
    if (state.get(start.id) === 2) continue;
    const path: string[] = [];
    const index = new Map<string, number>();
    let current: OrgChartProfileRow | undefined = start;
    while (current && state.get(current.id) !== 2) {
      const loopStart = index.get(current.id);
      if (loopStart !== undefined) {
        path.slice(loopStart).forEach((id) => cycles.add(id));
        break;
      }
      if (state.get(current.id) === 1) break;
      state.set(current.id, 1);
      index.set(current.id, path.length);
      path.push(current.id);
      current = current.manager_id
        ? rowsById.get(current.manager_id)
        : undefined;
    }
    path.forEach((id) => state.set(id, 2));
  }
  return cycles;
}

function toIssue(
  row: OrgChartProfileRow,
  rowsById: Map<string, OrgChartProfileRow>,
  cycleIds: Set<string>,
): OrgChartIssueModel | null {
  const reasons: OrgChartIssueReason[] = [];
  if (cycleIds.has(row.id)) reasons.push('MANAGER_CYCLE');
  if (row.status === 'ACTIVE' && !cycleIds.has(row.id)) {
    if (!row.manager_id) reasons.push('MANAGER_MISSING');
    else if (!rowsById.has(row.manager_id)) reasons.push('MANAGER_UNAVAILABLE');
    if (
      !row.primary_location_id ||
      (row.location_type === 'OFFICE' && !row.department_id)
    ) {
      reasons.push('WORK_UNIT_MISSING');
    }
  }
  if (reasons.length === 0) return null;
  const person = toOrgChartPerson(row);
  return {
    id: person.id,
    displayName: person.displayName,
    employeeCode: person.employeeCode,
    jobTitle: person.jobTitle,
    status: person.status,
    managerId: person.managerId,
    location: person.location,
    department: person.department,
    reasons,
  };
}

function comparePeople(
  a: Pick<OrgChartPersonModel, 'displayName' | 'employeeCode'>,
  b: Pick<OrgChartPersonModel, 'displayName' | 'employeeCode'>,
) {
  return (
    a.displayName.localeCompare(b.displayName, 'vi') ||
    (a.employeeCode ?? '').localeCompare(b.employeeCode ?? '', 'vi')
  );
}

function sortTree(nodes: OrgChartPersonModel[]): void {
  nodes.sort(comparePeople);
  nodes.forEach((node) => sortTree(node.children));
}
