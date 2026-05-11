export type MenuScreen = "main" | "products" | "customers";

export type ClientRequestAction = "GET" | "POST" | "PUT";
export type ClientRequestOrigin = "users" | "products";

interface GETRequest {
  action: "GET";
  origin: ClientRequestOrigin;
}

interface POSTRequest {
  action: "POST";
  origin: ClientRequestOrigin;
  body: POSTUserRequestBody | POSTProductRequestBody;
}

interface PUTRequest {
  action: "PUT";
  origin: ClientRequestOrigin;
  body: PUTUserRequestBody | PUTProductRequestBody;
}

export interface PUTUserRequestBody {
  type: "users";
  id: number;
  firstname: string;
  lastname: string;
}

export interface PUTProductRequestBody {
  type: "products";
  id: number;
  name: string;
  description: string;
}

export interface POSTUserRequestBody {
  type: "users";
  firstname: string;
  lastname: string;
}

export interface POSTProductRequestBody {
  type: "products";
  name: string;
  description: string;
}

export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface User extends BaseEntity {
  firstname: string;
  lastname: string;
}

export interface Product extends BaseEntity {
  name: string;
  description: string;
}

export type ClientRequest = GETRequest | POSTRequest | PUTRequest;

export interface ServerResponse {
  status: "OKAY" | "ERROR" | "NOT_FOUND";
  request: ClientRequest;
  data: string;
}
