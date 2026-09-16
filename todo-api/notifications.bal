import ballerina/sql;
import ballerina/uuid;

type CountRow record {|
    int cnt;
|};

type NotificationRow record {|
    string id;
    string 'type;
    string message;
    boolean read;
|};

function toNotificationType(string value) returns "invitation"|"assignment"|error {
    if value == "invitation" {
        return "invitation";
    }
    if value == "assignment" {
        return "assignment";
    }
    return error("unknown notification type: " + value);
}

function rowToNotification(NotificationRow row) returns Notification|error {
    "invitation"|"assignment" notificationType = check toNotificationType(row.'type);
    return {id: row.id, 'type: notificationType, message: row.message, read: row.read};
}

// explicitId lets a caller make the notification's own id double as a
// reference to something else it announces (an invitation's id — see
// inviteMember/acceptInvitation in lists.bal) since the Notification schema
// carries no field for that. Omitted, a fresh uuid is generated as usual.
function createNotification(string userId, string notificationType, string message, string? explicitId = ()) returns error? {
    string id = explicitId ?: uuid:createRandomUuid();
    sql:ExecutionResult _ = check dbClient->execute(`
        INSERT INTO notifications (id, user_id, type, message, read)
        VALUES (${id}, ${userId}, ${notificationType}, ${message}, false)
    `);
    return;
}

function listNotificationsForUser(string userId, boolean? unreadOnly, int 'limit, int offset) returns [Notification[], int]|error {
    sql:ParameterizedQuery whereClause = `WHERE user_id = ${userId}`;
    if unreadOnly is boolean && unreadOnly {
        whereClause = sql:queryConcat(whereClause, ` AND read = false`);
    }

    sql:ParameterizedQuery countQuery = sql:queryConcat(`SELECT COUNT(*) AS "cnt" FROM notifications `, whereClause);
    CountRow countRow = check dbClient->queryRow(countQuery);

    sql:ParameterizedQuery selectQuery = sql:queryConcat(
        `SELECT id, type, message, read FROM notifications `,
        whereClause,
        ` ORDER BY created_at DESC LIMIT ${'limit} OFFSET ${offset}`
    );
    stream<NotificationRow, sql:Error?> rows = dbClient->query(selectQuery);
    Notification[] notifications = [];
    check from NotificationRow row in rows
        do {
            Notification notification = check rowToNotification(row);
            notifications.push(notification);
        };
    check rows.close();
    return [notifications, countRow.cnt];
}

function markNotificationRead(string notificationId, string userId, boolean readValue) returns Notification?|error {
    sql:ExecutionResult result = check dbClient->execute(`
        UPDATE notifications SET read = ${readValue}
        WHERE id = ${notificationId} AND user_id = ${userId}
    `);
    int? affected = result.affectedRowCount;
    if affected is () || affected == 0 {
        return ();
    }
    NotificationRow|sql:Error row = dbClient->queryRow(`SELECT id, type, message, read FROM notifications WHERE id = ${notificationId} AND user_id = ${userId}`);
    if row is sql:NoRowsError {
        return ();
    }
    if row is sql:Error {
        return row;
    }
    return check rowToNotification(row);
}
