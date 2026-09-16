// Types generated from specs/design/components/todo-api/openapi.yaml.
// Kept separate from the service wiring in service.bal.

import ballerina/http;

public type TaskUpdate record {
    string title?;
    string? dueDate?;
    "low"|"medium"|"high" priority?;
    string[] categories?;
    string? assigneeId?;
    boolean completed?;
};

public type Task record {
    string id;
    string listId;
    string title;
    string? dueDate?;
    "low"|"medium"|"high" priority;
    string[] categories?;
    string? assigneeId?;
    boolean completed;
};

public type Invitation record {
    string email;
};

public type Error record {
    # HTTP or application error code
    int code;
    # short human-readable label
    string message;
    # detailed explanation
    string description?;
    # URI to documentation
    string moreInfo?;
};

public type ErrorBadRequest record {|
    *http:BadRequest;
    Error body;
|};

public type NewList record {
    string name;
};

public type Notification record {
    string id;
    "invitation"|"assignment" 'type;
    string message;
    boolean read;
};

public type NewTask record {
    string title;
    string? dueDate?;
    "low"|"medium"|"high" priority;
    string[] categories?;
    string? assigneeId?;
};

public type ErrorNotFound record {|
    *http:NotFound;
    Error body;
|};

public type notifications_notificationId_body record {
    boolean read;
};

public type inline_response_200_1 record {
    # total matching tasks
    int count;
    # relative URI of the next page
    string? next?;
    # relative URI of the previous page
    string? previous?;
    Task[] data;
};

public type inline_response_200 record {
    # total matching lists
    int count;
    # relative URI of the next page
    string? next?;
    # relative URI of the previous page
    string? previous?;
    TodoList[] data;
};

public type ListUpdate record {
    string name?;
};

public type inline_response_200_2 record {
    # total matching notifications
    int count;
    # relative URI of the next page
    string? next?;
    # relative URI of the previous page
    string? previous?;
    Notification[] data;
};

public type ErrorForbidden record {|
    *http:Forbidden;
    Error body;
|};

public type TodoListOk record {|
    *http:Ok;
    TodoList body;
|};

public type Member record {
    string userId;
    string email;
    "owner"|"collaborator"|"invited" role;
};

public type TodoList record {
    string id;
    string name;
    # user id of the owner
    string ownerId;
};

public type ErrorUnauthorized record {|
    *http:Unauthorized;
    Error body;
|};
