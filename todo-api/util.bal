// Pagination link building and the categories array<->comma-string boundary
// conversion (domain-model.md: TASK.categories is comma-separated in storage;
// the API schema is an array).

const int MAX_LIMIT = 100;
const int DEFAULT_LIMIT = 20;

function clampLimit(int requested) returns int {
    if requested <= 0 {
        return DEFAULT_LIMIT;
    }
    if requested > MAX_LIMIT {
        return MAX_LIMIT;
    }
    return requested;
}

function clampOffset(int requested) returns int {
    if requested < 0 {
        return 0;
    }
    return requested;
}

// Builds the next/previous relative URIs for a page, preserving any extra
// query parameters (filters/sort) already applied.
function buildPageLinks(string basePath, string extraQuery, int 'limit, int offset, int count) returns [string?, string?] {
    string? next = ();
    string? previous = ();
    string suffix = extraQuery.length() > 0 ? "&" + extraQuery : "";
    if offset + 'limit < count {
        next = basePath + "?limit=" + 'limit.toString() + "&offset=" + (offset + 'limit).toString() + suffix;
    }
    if offset > 0 {
        int prevOffset = offset - 'limit;
        if prevOffset < 0 {
            prevOffset = 0;
        }
        previous = basePath + "?limit=" + 'limit.toString() + "&offset=" + prevOffset.toString() + suffix;
    }
    return [next, previous];
}

function categoriesToArray(string? categories) returns string[] {
    if categories is () || categories.trim().length() == 0 {
        return [];
    }
    return re `,`.split(categories);
}

function categoriesToStorage(string[]? categories) returns string? {
    if categories is () || categories.length() == 0 {
        return ();
    }
    return string:'join(",", ...categories);
}

function buildTasksExtraQuery(string? priority, string? category, string? assigneeId, boolean? completed, string? sortField) returns string {
    string[] parts = [];
    if priority is string {
        parts.push("priority=" + priority);
    }
    if category is string {
        parts.push("category=" + category);
    }
    if assigneeId is string {
        parts.push("assigneeId=" + assigneeId);
    }
    if completed is boolean {
        parts.push("completed=" + completed.toString());
    }
    if sortField is string {
        parts.push("sort=" + sortField);
    }
    return string:'join("&", ...parts);
}

function buildNotificationsExtraQuery(boolean? unreadOnly) returns string {
    if unreadOnly is boolean {
        return "unreadOnly=" + unreadOnly.toString();
    }
    return "";
}
