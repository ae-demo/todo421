// Shared error-response builders. Every 4xx uses components/schemas/Error
// from the openapi contract.

function notFoundError(string message) returns ErrorNotFound {
    return {body: {code: 404, message: message}};
}

function forbiddenError(string message) returns ErrorForbidden {
    return {body: {code: 403, message: message}};
}

function badRequestError(string message) returns ErrorBadRequest {
    return {body: {code: 400, message: message}};
}

function unauthorizedError(string message) returns ErrorUnauthorized {
    return {body: {code: 401, message: message}};
}

// Reads X-User-Id and answers 401 when it is missing or blank — the header
// is declared optional at the resource signature so this rule (rather than a
// framework-level "required header" 400) is what fires.
function requireUserId(string? xUserId) returns string|ErrorUnauthorized {
    if xUserId is string && xUserId.trim().length() > 0 {
        return xUserId;
    }
    return unauthorizedError("X-User-Id header missing");
}
