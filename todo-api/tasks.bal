// TASK repository. categories is stored comma-separated (domain-model.md)
// and converted to/from the API's array shape at this boundary.

import ballerina/sql;
import ballerina/uuid;

type TaskRow record {|
    string id;
    string listId;
    string title;
    string? dueDate;
    string priority;
    string? categories;
    string? assigneeId;
    boolean completed;
|};

function toPriority(string value) returns "low"|"medium"|"high"|error {
    if value == "low" {
        return "low";
    }
    if value == "medium" {
        return "medium";
    }
    if value == "high" {
        return "high";
    }
    return error("unknown priority: " + value);
}

function rowToTask(TaskRow row) returns Task|error {
    "low"|"medium"|"high" priority = check toPriority(row.priority);
    return {
        id: row.id,
        listId: row.listId,
        title: row.title,
        dueDate: row.dueDate,
        priority: priority,
        categories: categoriesToArray(row.categories),
        assigneeId: row.assigneeId,
        completed: row.completed
    };
}

// A collaborator is the owner or an accepted member — a still-pending
// "invited" row grants no access.
function isCollaborator(string listId, string userId) returns boolean|error {
    string? role = check findMembershipRole(listId, userId);
    if role is () {
        return false;
    }
    return role == "owner" || role == "collaborator";
}

function getTaskRow(string taskId) returns TaskRow?|error {
    TaskRow|sql:Error row = dbClient->queryRow(`
        SELECT id, list_id AS "listId", title, due_date AS "dueDate", priority, categories,
               assignee_id AS "assigneeId", completed
        FROM tasks WHERE id = ${taskId}
    `);
    if row is TaskRow {
        return row;
    }
    if row is sql:NoRowsError {
        return ();
    }
    return row;
}

function getAuthorizedTask(string taskId, string userId) returns Task?|error {
    TaskRow? row = check getTaskRow(taskId);
    if row is () {
        return ();
    }
    boolean allowed = check isCollaborator(row.listId, userId);
    if !allowed {
        return ();
    }
    return check rowToTask(row);
}

function createTask(string listId, string callerUserId, NewTask payload) returns Task|"notfound"|"badrequest"|error {
    TodoList? list = check getListRow(listId);
    if list is () {
        return "notfound";
    }
    boolean allowed = check isCollaborator(listId, callerUserId);
    if !allowed {
        return "notfound";
    }
    string? assigneeId = payload?.assigneeId;
    if assigneeId is string {
        boolean assigneeOk = check isCollaborator(listId, assigneeId);
        if !assigneeOk {
            return "badrequest";
        }
    }
    string id = uuid:createRandomUuid();
    string? categoriesStorage = categoriesToStorage(payload?.categories);
    string? dueDate = payload?.dueDate;
    sql:ExecutionResult _ = check dbClient->execute(`
        INSERT INTO tasks (id, list_id, title, due_date, priority, categories, assignee_id, completed)
        VALUES (${id}, ${listId}, ${payload.title}, ${dueDate}, ${payload.priority}, ${categoriesStorage}, ${assigneeId}, false)
    `);
    if assigneeId is string {
        check createNotification(assigneeId, "assignment", "You were assigned a task: " + payload.title);
    }
    TaskRow? created = check getTaskRow(id);
    if created is () {
        return error("task not found immediately after insert");
    }
    return check rowToTask(created);
}

function listTasksForList(string listId, string? priority, string? category, string? assigneeId, boolean? completed, string? sortField, int 'limit, int offset) returns [Task[], int]|error {
    sql:ParameterizedQuery whereClause = `WHERE list_id = ${listId}`;
    if priority is string {
        whereClause = sql:queryConcat(whereClause, ` AND priority = ${priority}`);
    }
    if category is string {
        string likePattern = "%," + category + ",%";
        whereClause = sql:queryConcat(whereClause, ` AND (',' || COALESCE(categories, '') || ',') LIKE ${likePattern}`);
    }
    if assigneeId is string {
        whereClause = sql:queryConcat(whereClause, ` AND assignee_id = ${assigneeId}`);
    }
    if completed is boolean {
        whereClause = sql:queryConcat(whereClause, ` AND completed = ${completed}`);
    }

    CountRow countRow = check dbClient->queryRow(sql:queryConcat(`SELECT COUNT(*) AS "cnt" FROM tasks `, whereClause));

    sql:ParameterizedQuery orderClause = ` ORDER BY created_at ASC`;
    if sortField is string && sortField == "dueDate" {
        orderClause = ` ORDER BY due_date ASC NULLS LAST`;
    }
    if sortField is string && sortField == "priority" {
        orderClause = ` ORDER BY CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END ASC`;
    }

    sql:ParameterizedQuery selectQuery = sql:queryConcat(
        `SELECT id, list_id AS "listId", title, due_date AS "dueDate", priority, categories,
                assignee_id AS "assigneeId", completed
         FROM tasks `,
        whereClause,
        orderClause,
        ` LIMIT ${'limit} OFFSET ${offset}`
    );
    stream<TaskRow, sql:Error?> rows = dbClient->query(selectQuery);
    Task[] tasks = [];
    check from TaskRow row in rows
        do {
            Task task = check rowToTask(row);
            tasks.push(task);
        };
    check rows.close();
    return [tasks, countRow.cnt];
}

// dueDate and assigneeId are the only TaskUpdate fields that are both
// optional AND nullable, so "absent" (leave unchanged) and "explicit null"
// (clear it) must be told apart via key presence rather than plain field
// access, which collapses both to `()`.
function updateTask(string taskId, string callerUserId, TaskUpdate payload) returns Task|"notfound"|"badrequest"|error {
    TaskRow? existing = check getTaskRow(taskId);
    if existing is () {
        return "notfound";
    }
    boolean allowed = check isCollaborator(existing.listId, callerUserId);
    if !allowed {
        return "notfound";
    }

    map<anydata> payloadMap = payload;

    string newTitle = payload?.title ?: existing.title;

    string? newDueDate = existing.dueDate;
    if payloadMap.hasKey("dueDate") {
        newDueDate = payload?.dueDate;
    }

    string newPriority = existing.priority;
    "low"|"medium"|"high"? updatedPriority = payload?.priority;
    if updatedPriority is string {
        newPriority = updatedPriority;
    }

    string? newCategoriesStorage = existing.categories;
    string[]? updatedCategories = payload?.categories;
    if updatedCategories is string[] {
        newCategoriesStorage = categoriesToStorage(updatedCategories);
    }

    string? previousAssigneeId = existing.assigneeId;
    string? newAssigneeId = existing.assigneeId;
    boolean assigneeChanged = false;
    if payloadMap.hasKey("assigneeId") {
        newAssigneeId = payload?.assigneeId;
        assigneeChanged = newAssigneeId != previousAssigneeId;
        if newAssigneeId is string {
            boolean assigneeOk = check isCollaborator(existing.listId, newAssigneeId);
            if !assigneeOk {
                return "badrequest";
            }
        }
    }

    boolean newCompleted = payload?.completed ?: existing.completed;

    sql:ExecutionResult _ = check dbClient->execute(`
        UPDATE tasks SET title = ${newTitle}, due_date = ${newDueDate}, priority = ${newPriority},
            categories = ${newCategoriesStorage}, assignee_id = ${newAssigneeId}, completed = ${newCompleted}
        WHERE id = ${taskId}
    `);

    if assigneeChanged && newAssigneeId is string {
        check createNotification(newAssigneeId, "assignment", "You were assigned a task: " + newTitle);
    }

    TaskRow? updated = check getTaskRow(taskId);
    if updated is () {
        return error("task not found immediately after update");
    }
    return check rowToTask(updated);
}

function deleteTask(string taskId, string callerUserId) returns "deleted"|"notfound"|error {
    TaskRow? existing = check getTaskRow(taskId);
    if existing is () {
        return "notfound";
    }
    boolean allowed = check isCollaborator(existing.listId, callerUserId);
    if !allowed {
        return "notfound";
    }
    sql:ExecutionResult _ = check dbClient->execute(`DELETE FROM tasks WHERE id = ${taskId}`);
    return "deleted";
}
