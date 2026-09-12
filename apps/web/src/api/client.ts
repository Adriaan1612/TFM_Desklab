import type { OrderDTO, ProductDTO, SetupDTO } from "@desklab/shared";

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

export function fetchProduct(slug: string): Promise<ProductDTO> {
  return get<ProductDTO>(`/products/${slug}`);
}

export function fetchProductSetups(slug: string): Promise<SetupsResponse> {
  return get<SetupsResponse>(`/products/${slug}/setups`);
}

export function fetchProductSubstitutes(
  slug: string,
): Promise<{ data: ProductDTO[] }> {
  return get<{ data: ProductDTO[] }>(`/products/${slug}/substitutes`);
}

export function fetchSetup(slug: string): Promise<SetupDTO> {
  return get<SetupDTO>(`/setups/${slug}`);
}

export function fetchSetupSubstitutes(
  slug: string,
  slot: string,
): Promise<{ data: ProductDTO[] }> {
  return get<{ data: ProductDTO[] }>(
    `/setups/${slug}/substitutes?slot=${slot}`,
  );
}

export interface CheckoutInput {
  email: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  items: Array<{ productId: string; quantity: number; setupSlug?: string }>;
}

export async function placeOrder(input: CheckoutInput): Promise<OrderDTO> {
  const res = await fetch(`${BASE_URL}/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new ApiError(res.status, `POST /checkout failed (${res.status})`);
  }
  return (await res.json()) as OrderDTO;
}
