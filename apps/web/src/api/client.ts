import type { ProductDTO, SetupDTO } from "@desklab/shared";

const BASE_URL =
  import.meta.env?.VITE_API_URL ?? "http://localhost:3001";

export interface ProductsResponse {
  data: ProductDTO[];
  page: number;
  pageSize: number;
  total: number;
}

export interface SetupsResponse {
  data: SetupDTO[];
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new ApiError(res.status, `GET ${path} failed (${res.status})`);
  }
  return (await res.json()) as T;
}

export function fetchProducts(query: string): Promise<ProductsResponse> {
  const suffix = query ? `?${query}` : "";
  return get<ProductsResponse>(`/products${suffix}`);
}

export function fetchSetups(): Promise<SetupsResponse> {
  return get<SetupsResponse>("/setups");
}
