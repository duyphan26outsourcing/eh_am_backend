import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@/common/repository/base.repository';
import { mapSupabasePostgrestError } from '@/error/supabase-postgres.mapper';
import { SupabaseAdminService } from '@/supabase/supabase-admin.service';
import { SupabaseTable } from '@/supabase/supabase.define';
import { type OrgChartProfileRow } from './org-chart.model';

type JoinedProfile = {
  id: string;
  display_name: string;
  employee_code: string | null;
  job_title: string | null;
  status: string;
  manager_id: string | null;
  primary_location_id: string | null;
  department_id: string | null;
  location: { id: string; code: string; name: string; type: string } | null;
  department: { id: string; code: string; name: string } | null;
};

@Injectable()
export class OrgChartRepository extends BaseRepository {
  constructor(supabaseAdmin: SupabaseAdminService) {
    super(supabaseAdmin, OrgChartRepository.name);
  }

  async findVisibleProfiles(): Promise<OrgChartProfileRow[]> {
    const { data, error } = await this.db
      .from(SupabaseTable.USER_PROFILES)
      .select(
        `id,display_name,employee_code,job_title,status,manager_id,primary_location_id,department_id,
         location:locations!user_profiles_primary_location_id_fkey(id,code,name,type),
         department:departments!user_profiles_department_id_fkey(id,code,name)`,
      )
      .neq('status', 'DEACTIVATED')
      .order('display_name');
    if (error) mapSupabasePostgrestError(error);

    return ((data ?? []) as unknown as JoinedProfile[]).map((row) => ({
      id: row.id,
      display_name: row.display_name,
      employee_code: row.employee_code,
      job_title: row.job_title,
      status: row.status,
      manager_id: row.manager_id,
      primary_location_id: row.primary_location_id,
      location_code: row.location?.code ?? null,
      location_name: row.location?.name ?? null,
      location_type: row.location?.type ?? null,
      department_id: row.department_id,
      department_code: row.department?.code ?? null,
      department_name: row.department?.name ?? null,
    }));
  }
}
