export interface prismaFindManyArgs {
  where?: Record<string, unknown>;
  include?: Record<string, unknown>;
  select?: Record<string, boolean | Record<string, boolean>>;
  orderBy?: Record<string, unknown> | Record<string, unknown>[];
  skip?: number;
  take?: number;
  cursor?: Record<string, unknown>;
  distinct?: string[] | string;
  [key: string]: unknown;
}

export interface prismaCountArgs {
  where?: Record<string, unknown>;
  include?: Record<string, unknown>;
  select?: Record<string, boolean | Record<string, boolean>>;
  orderBy?: Record<string, unknown> | Record<string, unknown>[];
  skip?: number;
  take?: number;
  cursor?: Record<string, unknown>;
  distinct?: string[] | string;
  [key: string]: unknown;
}
export interface prismaModelDelegate {
  findMany(args?: any): Promise<any[]>;
  count(args?: any): Promise<number>;
}

export interface iQueryParams {
  searchTerm?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  fields?: string;
  includes?: string;
  [key: string]: any;
}

export interface iQueryConfig {
  searchableFields: string[];
  filterableFields: string[];
}

export interface stringFilter {
  contains: string;
  startsWith?: string;
  endsWith?: string;
  mode?: "insensitive" | "default";
  equals?: string;
  in?: string[];
  notIn?: string[];
  lte?: string;
  gte?: string;
  not?: string;
}

export interface PrismaWhereConditions {
  OR?: Record<string, unknown>[];
  AND?: Record<string, unknown>[];
  NOT?: Record<string, unknown>[];
  [key: string]: unknown;
}

export interface PrismaNumberFilter {
  equals?: number;
  in?: number[];
  notIn?: number[];
  lt?: number;
  lte?: number;
  gt?: number;
  gte?: number;
  not?: number | PrismaNumberFilter;
}
export interface IQueryResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
