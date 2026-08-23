import { NextResponse } from "next/server";

export interface StandardApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  details?: Record<string, unknown>;
  meta?: {
    request_id?: string;
    duration_ms?: number;
  };
}

export function apiSuccess<T>(
  data: T,
  status: number = 200,
  meta?: { request_id?: string; duration_ms?: number }
) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta ? { meta } : {}),
    },
    { status }
  );
}

export function apiError(
  message: string,
  code: string = "INTERNAL_ERROR",
  status: number = 500,
  details?: Record<string, unknown>,
  requestId?: string
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      ...(details ? { details } : {}),
      ...(requestId ? { meta: { request_id: requestId } } : {}),
    },
    { status }
  );
}
