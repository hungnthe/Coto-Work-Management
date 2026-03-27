// Response DTOs
export interface UnitSummaryDto {
  id: number;
  unitCode: string;
  unitName: string;
  parentUnitId: number | null;
}

export interface UnitResponseDto {
  id: number;
  unitCode: string;
  unitName: string;
  parentUnitId: number | null;
  description: string | null;
  isActive: boolean;
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
  address: string | null;
  phoneNumber: string | null;
}

// Request DTOs
export interface CreateUnitDto {
  unitCode: string;
  unitName: string;
  parentUnitId?: number | null;
  description?: string;
  address?: string;
  phoneNumber?: string;
}

export interface UpdateUnitDto {
  unitCode?: string;
  unitName?: string;
  parentUnitId?: number | null;
  description?: string;
  address?: string;
  phoneNumber?: string;
  isActive?: boolean;
}
