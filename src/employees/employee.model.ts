export interface EmployeeCreateOptions {
  locations: Array<{ id: string; code: string; name: string; type: string }>;
  departments: Array<{ id: string; code: string; name: string }>;
  managers: Array<{
    id: string;
    displayName: string;
    employeeCode: string | null;
  }>;
  reasons: Array<{
    id: string;
    code: string;
    label: string;
    isFreetext: boolean;
  }>;
  roles: Array<{
    code: string;
    nameVi: string;
    nameEn: string;
    contextType: string;
    descriptionVi: string;
  }>;
}

export interface CreatedEmployeeModel {
  id: string;
  displayName: string;
  workEmail: string;
  employeeCode: string | null;
  status: string;
  activationMethod: string;
  invitationEmailSent: boolean;
}
