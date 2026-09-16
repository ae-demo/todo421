// USER is create-on-first-reference: there is no registration endpoint, so a
// row is created the first time an identity is observed — either the caller's
// X-User-Id (gateway-injected subject) or an invitee's email (from
// inviteMember, before that person has ever signed in). This service has no
// directory dependency to resolve an email for a bare subject, so until the
// invitee's real X-User-Id is observed, id and email are seeded equal; the
// row is reconciled to the real subject the moment that identity calls in.

import ballerina/sql;

type UserRow record {|
    string id;
    string email;
|};

function getOrCreateUserById(string userId) returns UserRow|error {
    UserRow|sql:Error existing = dbClient->queryRow(`SELECT id, email FROM users WHERE id = ${userId}`);
    if existing is UserRow {
        return existing;
    }
    if !(existing is sql:NoRowsError) {
        return existing;
    }
    sql:ExecutionResult _ = check dbClient->execute(`INSERT INTO users (id, email) VALUES (${userId}, ${userId}) ON CONFLICT (id) DO NOTHING`);
    UserRow created = check dbClient->queryRow(`SELECT id, email FROM users WHERE id = ${userId}`);
    return created;
}

function getOrCreateUserByEmail(string email) returns UserRow|error {
    UserRow|sql:Error existing = dbClient->queryRow(`SELECT id, email FROM users WHERE email = ${email}`);
    if existing is UserRow {
        return existing;
    }
    if !(existing is sql:NoRowsError) {
        return existing;
    }
    sql:ExecutionResult _ = check dbClient->execute(`INSERT INTO users (id, email) VALUES (${email}, ${email}) ON CONFLICT (id) DO NOTHING`);
    UserRow created = check dbClient->queryRow(`SELECT id, email FROM users WHERE email = ${email}`);
    return created;
}

function findUserById(string userId) returns UserRow?|error {
    UserRow|sql:Error row = dbClient->queryRow(`SELECT id, email FROM users WHERE id = ${userId}`);
    if row is UserRow {
        return row;
    }
    if row is sql:NoRowsError {
        return ();
    }
    return row;
}
