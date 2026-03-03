export interface Provider {
  name: string;
  verified: boolean;
  logo?: string;
}

export interface Category {
  id?: number;
  unikey?: string;
  display: string;
  name?: string;
  slug?: string;
  light?: string;
  dark?: string;
  icon?: string;
}

export interface ServiceRoute {
  name: string;
  method: string;
  input?: string;
  output?: string;
  path?: string;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  about?: string;
  thumbnail?: string;
  meta_thumbnail?: string;
  provider: Provider;
  categories: Category[];
  tags: string[];
  routes: ServiceRoute[];
  certificate?: {
    gdpr?: boolean;
    data_retention?: string;
  };
  voiden_path?: string;
  coins?: { coins_per_request: number };
}

export interface Meta {
  current: number;
  number: number;
  pages: number;
  items: number;
  size: number;
}

export interface ServicesResponse {
  data: Service[];
  meta: Meta;
}

export interface DetailRoute {
  id: number;
  name: string;
  about: string;
  qs: string;
  endpoint: string;
  method: string;
  input: string;
  output: string;
  sample_response?: any;
  http_response_codes?: Record<string, string>;
}

export interface ServiceDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  about?: string;
  thumbnail?: string;
  meta_thumbnail?: string;
  provider: Provider;
  categories: Category[];
  tags: string[];
  routes: DetailRoute[];
  authentication?: string;
  coins?: { coins_per_request: number };
  certificate?: {
    gdpr?: boolean;
    data_retention?: string;
  };
  voiden_path?: string;
}

export async function fetchServiceDetail(slug: string): Promise<ServiceDetail> {
  const res = await fetch(
    `https://core.apyhub.com/pub/services/${encodeURIComponent(slug)}`,
    {
      headers: {
        accept: "application/json",
        origin: "https://apyhub.com",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`ApyHub API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  return json.data;
}

export async function fetchServices(
  query: string = "",
  page: number = 0,
  size: number = 12,
  sortBy: string = "RELEVANCE"
): Promise<ServicesResponse> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy,
  });
  if (query) params.set("query", query);

  const res = await fetch(
    `https://core.apyhub.com/pub/services?${params.toString()}`,
    {
      headers: {
        accept: "application/json",
        origin: "https://apyhub.com",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`ApyHub API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
