// LIST and LISTMEMBER repository. The owner is stored as a list_members row
// (role='owner') alongside collaborators, so membership/ownership checks are
// one query shape.
//
// invitations/{invitationId}/accept has no listId parameter, and the Member
// schema this contract returns from inviteMember carries no separate
// invitation identifier. So invitationId here IS the invited list_members
// row's own id (returned out-of-band as InviteResult.invitationId, and
// re-surfaced to the client as the id of the in-app notification created for
// that invite — see openapi_service.bal). That id is unique per (list,
// invitee) pair even when the same email is invited to several lists, unlike
// the invitee's userId which is shared across every pending invite to that
// email. Accepting updates that specific row's user_id to the accepting
// caller's real X-User-Id, the same "whoever holds the invite becomes the
// collaborator" model most invite-link flows use.

import ballerina/sql;
import ballerina/uuid;

type MembershipRow record {|
    string role;
|};

type MembershipListRow record {|
    string listId;
|};

type MemberRow record {|
    string userId;
    string email;
    string role;
|};

type ListDeleteOutcome "deleted"|"forbidden"|"notfound";
type RemoveOutcome "removed"|"forbidden"|"notfound";
type InviteOutcome "exists";

function toMemberRole(string value) returns "owner"|"collaborator"|"invited"|error {
    if value == "owner" {
        return "owner";
    }
    if value == "collaborator" {
        return "collaborator";
    }
    if value == "invited" {
        return "invited";
    }
    return error("unknown member role: " + value);
}

function rowToMember(MemberRow row) returns Member|error {
    "owner"|"collaborator"|"invited" role = check toMemberRole(row.role);
    return {userId: row.userId, email: row.email, role: role};
}

function findMembershipRole(string listId, string userId) returns string?|error {
    MembershipRow|sql:Error row = dbClient->queryRow(`SELECT role FROM list_members WHERE list_id = ${listId} AND user_id = ${userId}`);
    if row is MembershipRow {
        return row.role;
    }
    if row is sql:NoRowsError {
        return ();
    }
    return row;
}

function getListRow(string listId) returns TodoList?|error {
    TodoList|sql:Error row = dbClient->queryRow(`SELECT id, name, owner_id AS "ownerId" FROM lists WHERE id = ${listId}`);
    if row is TodoList {
        return row;
    }
    if row is sql:NoRowsError {
        return ();
    }
    return row;
}

// A caller may view a list only when they hold a membership row on it
// (owner or collaborator — a still-pending "invited" row grants no view).
function getViewableList(string listId, string userId) returns TodoList?|error {
    TodoList? list = check getListRow(listId);
    if list is () {
        return ();
    }
    string? role = check findMembershipRole(listId, userId);
    if role is () || role == "invited" {
        return ();
    }
    return list;
}

function createList(string name, string ownerId) returns TodoList|error {
    UserRow _ = check getOrCreateUserById(ownerId);
    string id = uuid:createRandomUuid();
    sql:ExecutionResult _ = check dbClient->execute(`INSERT INTO lists (id, name, owner_id) VALUES (${id}, ${name}, ${ownerId})`);
    string memberId = uuid:createRandomUuid();
    sql:ExecutionResult _ = check dbClient->execute(`
        INSERT INTO list_members (id, list_id, user_id, role) VALUES (${memberId}, ${id}, ${ownerId}, 'owner')
    `);
    return {id: id, name: name, ownerId: ownerId};
}

function listListsForUser(string userId, int 'limit, int offset) returns [TodoList[], int]|error {
    sql:ParameterizedQuery baseFrom = `FROM lists l JOIN list_members lm ON lm.list_id = l.id
        WHERE lm.user_id = ${userId} AND lm.role IN ('owner', 'collaborator')`;
    CountRow countRow = check dbClient->queryRow(sql:queryConcat(`SELECT COUNT(*) AS "cnt" `, baseFrom));
    stream<TodoList, sql:Error?> rows = dbClient->query(sql:queryConcat(
        `SELECT l.id, l.name, l.owner_id AS "ownerId" `, baseFrom,
        ` ORDER BY l.created_at ASC LIMIT ${'limit} OFFSET ${offset}`
    ));
    TodoList[] lists = [];
    check from TodoList l in rows
        do {
            lists.push(l);
        };
    check rows.close();
    return [lists, countRow.cnt];
}

function renameList(string listId, string userId, string newName) returns TodoList?|error {
    TodoList? list = check getListRow(listId);
    if list is () {
        return ();
    }
    if list.ownerId != userId {
        return ();
    }
    sql:ExecutionResult _ = check dbClient->execute(`UPDATE lists SET name = ${newName} WHERE id = ${listId}`);
    return {id: list.id, name: newName, ownerId: list.ownerId};
}

function deleteList(string listId, string userId) returns ListDeleteOutcome|error {
    TodoList? list = check getListRow(listId);
    if list is () {
        return "notfound";
    }
    if list.ownerId != userId {
        return "forbidden";
    }
    sql:ExecutionResult _ = check dbClient->execute(`DELETE FROM lists WHERE id = ${listId}`);
    return "deleted";
}

function listMembersRows(string listId) returns Member[]|error {
    stream<MemberRow, sql:Error?> rows = dbClient->query(`
        SELECT lm.user_id AS "userId", u.email, lm.role
        FROM list_members lm JOIN users u ON u.id = lm.user_id
        WHERE lm.list_id = ${listId}
        ORDER BY CASE lm.role WHEN 'owner' THEN 0 ELSE 1 END, u.email
    `);
    Member[] members = [];
    check from MemberRow row in rows
        do {
            Member member = check rowToMember(row);
            members.push(member);
        };
    check rows.close();
    return members;
}

type InviteResult record {|
    Member member;
    string invitationId;
|};

function inviteMember(string listId, string email) returns InviteResult|InviteOutcome|error {
    UserRow invitee = check getOrCreateUserByEmail(email);
    string? existingRole = check findMembershipRole(listId, invitee.id);
    if existingRole is string {
        return "exists";
    }
    // The list_members row's own id is the invitationId: unique per (list,
    // invitee) pair, even when the same email is invited to several lists —
    // unlike invitee.id, which is shared across every pending invite to that
    // email. acceptInvitation matches on this same id.
    string memberId = uuid:createRandomUuid();
    sql:ExecutionResult _ = check dbClient->execute(`
        INSERT INTO list_members (id, list_id, user_id, role) VALUES (${memberId}, ${listId}, ${invitee.id}, 'invited')
    `);
    return {member: {userId: invitee.id, email: invitee.email, role: "invited"}, invitationId: memberId};
}

function removeMember(string listId, string targetUserId, string callerUserId) returns RemoveOutcome|error {
    TodoList? list = check getListRow(listId);
    if list is () {
        return "notfound";
    }
    string? targetRole = check findMembershipRole(listId, targetUserId);
    if targetRole is () {
        return "notfound";
    }
    boolean callerIsOwner = list.ownerId == callerUserId;
    boolean isSelf = callerUserId == targetUserId;
    if isSelf && targetRole == "owner" {
        return "forbidden";
    }
    if !isSelf && !callerIsOwner {
        return "forbidden";
    }
    sql:ExecutionResult _ = check dbClient->execute(`DELETE FROM list_members WHERE list_id = ${listId} AND user_id = ${targetUserId}`);
    return "removed";
}

function acceptInvitation(string invitationId, string callerUserId) returns TodoList?|error {
    MembershipListRow|sql:Error row = dbClient->queryRow(`
        SELECT list_id AS "listId" FROM list_members WHERE id = ${invitationId} AND role = 'invited' LIMIT 1
    `);
    if row is sql:NoRowsError {
        return ();
    }
    if row is sql:Error {
        return row;
    }
    UserRow _ = check getOrCreateUserById(callerUserId);
    sql:ExecutionResult _ = check dbClient->execute(`
        UPDATE list_members SET user_id = ${callerUserId}, role = 'collaborator'
        WHERE list_id = ${row.listId} AND id = ${invitationId} AND role = 'invited'
    `);
    return check getListRow(row.listId);
}
