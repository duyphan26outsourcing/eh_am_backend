export type OrgChartIssueReason =
  | 'MANAGER_MISSING'
  | 'MANAGER_UNAVAILABLE'
  | 'WORK_UNIT_MISSING'
  | 'MANAGER_CYCLE';

export interface OrgChartProfileRow {
  id: string;
  display_name: string;
  employee_code: string | null;
  job_title: string | null;
  status: string;
  manager_id: string | null;
  primary_location_id: string | null;
  location_code: string | null;
  location_name: string | null;
  location_type: string | null;
  department_id: string | null;
  department_code: string | null;
  department_name: string | null;
}

export interface OrgChartPersonModel {
  id: string;
  displayName: string;
  employeeCode: string | null;
  jobTitle: string | null;
  status: string;
  managerId: string | null;
  location: { id: string; code: string; name: string } | null;
  department: { id: string; code: string; name: string } | null;
  children: OrgChartPersonModel[];
}

export interface OrgChartIssueModel extends Omit<
  OrgChartPersonModel,
  'children'
> {
  reasons: OrgChartIssueReason[];
}

export interface OrgChartModel {
  root: {
    id: 'every-half';
    label: 'Every Half';
    children: OrgChartPersonModel[];
  };
  issues: OrgChartIssueModel[];
  totals: { people: number; issues: number };
}

export function toOrgChartPerson(row: OrgChartProfileRow): OrgChartPersonModel {
  return {
    id: row.id,
    displayName: row.display_name,
    employeeCode: row.employee_code,
    jobTitle: row.job_title,
    status: row.status,
    managerId: row.manager_id,
    location: row.primary_location_id
      ? {
          id: row.primary_location_id,
          code: row.location_code ?? '',
          name: row.location_name ?? '',
        }
      : null,
    department: row.department_id
      ? {
          id: row.department_id,
          code: row.department_code ?? '',
          name: row.department_name ?? '',
        }
      : null,
    children: [],
  };
}
