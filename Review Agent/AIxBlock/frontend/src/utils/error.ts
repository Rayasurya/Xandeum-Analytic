export function isValidationError(e: any) {
  return typeof e === "object" && "validation_errors" in e;
}

export function hasErrorMessage(e: any) {
  return typeof e === "object" && "message" in e;
}

export function hasErrorMessages(e: any) {
  return typeof e === "object" && "messages" in e;
}

export function hasErrorDetail(e: any) {
  return typeof e === "object" && "detail" in e;
}

export function extractErrorMessage(e: any): string | null {
  if (isValidationError(e)) {
    return "Validation error";
  }

  if (hasErrorMessage(e)) {
    return e["message"];
  }

  if (hasErrorMessages(e)) {
    return e["messages"];
  }

  if (hasErrorDetail(e)) {
    return e["detail"];
  }

  if (e instanceof Error) {
    return e.message;
  }

  return null;
}

export async function extractErrorMessageFromResponse(r: Response) {
  let data;

  try {
    data = await r.clone().json();
  } catch (e) {
    if (window.APP_SETTINGS.debug) {
      console.error(e);
    }

    return extractErrorMessage(e) ?? "Error: " + r.status + " / " + r.statusText;
  }

  return extractErrorMessage(data) ?? "Error: " + r.status + " / " + r.statusText;
}

export function unexpectedErrorMessage(e: any): string {
  if (typeof e.toString === "function") {
    return "Unexpected error occurred. Error: " + e?.toString();
  }

  return "Unexpected error occurred";
}
