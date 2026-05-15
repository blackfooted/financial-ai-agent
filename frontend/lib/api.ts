import type {
  RecommendationRequest,
  RecommendationResponse,
} from "@/types/recommendation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

type ErrorDetail =
  | string
  | {
      message?: string;
      error_code?: string;
      detail?: unknown;
    };

function extractErrorMessage(body: unknown): string | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const detail = (body as { detail?: ErrorDetail; error?: ErrorDetail }).detail;
  if (typeof detail === "string") {
    return detail;
  }
  if (detail && typeof detail === "object" && "message" in detail) {
    return detail.message ?? null;
  }

  const error = (body as { error?: ErrorDetail }).error;
  if (typeof error === "string") {
    return error;
  }
  if (error && typeof error === "object" && "message" in error) {
    return error.message ?? null;
  }

  return null;
}

export async function requestRecommendation(
  payload: RecommendationRequest,
): Promise<RecommendationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/phase1/recommendations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const body = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(
          extractErrorMessage(body) ||
            "오늘 AI 추천 가능 횟수를 초과했습니다. 내일 다시 시도해 주세요.",
        );
      }

      throw new Error(
        extractErrorMessage(body) ||
          "추천 API 요청을 처리하지 못했습니다. 입력 조건을 확인해 주세요.",
      );
    }

    return body as RecommendationResponse;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "추천 API에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해 주세요.",
      );
    }

    throw error;
  }
}
