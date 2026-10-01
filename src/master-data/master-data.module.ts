import { Module } from '@nestjs/common';
import { SupabaseModule } from '@/supabase/supabase.module';
import { SupabaseJwtModule } from '@/auth/supabase-jwt/supabase-jwt.module';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import { LocationRepository } from './location.repository';
import { CostCentersController } from './cost-centers.controller';
import { CostCentersService } from './cost-centers.service';
import { CostCenterRepository } from './cost-center.repository';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { DepartmentRepository } from './department.repository';
import { ReasonCodesController } from './reason-codes.controller';
import { ReasonCodesService } from './reason-codes.service';
import { ReasonCodeRepository } from './reason-code.repository';
import { AssetTypesController } from './asset-types.controller';
import { AssetTypesService } from './asset-types.service';
import { AssetTypeRepository } from './asset-type.repository';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { SupplierRepository } from './supplier.repository';
import { RepairVendorsController } from './repair-vendors.controller';
import { RepairVendorsService } from './repair-vendors.service';
import { RepairVendorRepository } from './repair-vendor.repository';

/**
 * M02 — Danh mục nền. Hiện có: location (UC-MDM-01), cost center (UC-MDM-03), phòng ban
 * (UC-MDM-08), lý do (UC-MDM-07), cây loại tài sản (UC-MDM-04). Cost center + lý do + cây loại
 * đã có luồng ngừng (AC.2/AC.3); đóng location (UC-MDM-02) + ngừng phòng ban chờ M03/UC-IAM-05.
 *
 * ⚠️ Controller dùng `JwtAuthGuard` nên phải tự khai `SupabaseModule` + `SupabaseJwtModule`
 * (SupabaseJwtModule cố ý không được re-export toàn cục). `AccessScopeService`/`PermissionsGuard`
 * đã global từ `AuthModule`.
 */
@Module({
  imports: [SupabaseModule, SupabaseJwtModule],
  controllers: [
    LocationsController,
    CostCentersController,
    DepartmentsController,
    ReasonCodesController,
    AssetTypesController,
    SuppliersController,
    RepairVendorsController,
  ],
  providers: [
    LocationsService,
    LocationRepository,
    CostCentersService,
    CostCenterRepository,
    DepartmentsService,
    DepartmentRepository,
    ReasonCodesService,
    ReasonCodeRepository,
    AssetTypesService,
    AssetTypeRepository,
    SuppliersService,
    SupplierRepository,
    RepairVendorsService,
    RepairVendorRepository,
  ],
})
export class MasterDataModule {}
