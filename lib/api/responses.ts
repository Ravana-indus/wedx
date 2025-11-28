import { NextResponse } from "next/server";

export function ok<T>(data: T, init: number = 200) {
  return NextResponse.json({ data, error: null }, { status: init });
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json(
    { data: null, error: { message, details, code: "bad_request" } },
    { status: 400 }
  );
}

export function notFound(message: string) {
  return NextResponse.json(
    { data: null, error: { message, code: "not_found" } },
    { status: 404 }
  );
}

export function serverError(message: string, details?: unknown) {
  return NextResponse.json(
    { data: null, error: { message, details, code: "server_error" } },
    { status: 500 }
  );
}
