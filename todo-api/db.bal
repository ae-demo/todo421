// Postgres client and idempotent schema creation for the todo-db
// platform-resource. Every repository module in this service reaches the
// database only through `dbClient`.

import ballerina/sql;
import ballerinax/postgresql;
import ballerinax/postgresql.driver as _;

final postgresql:Client dbClient = check new (
    host = dbHost,
    username = dbUser,
    password = dbPassword,
    database = dbName,
    port = dbPort
);

function initSchema() returns error? {
    sql:ExecutionResult _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    `);
    sql:ExecutionResult _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS lists (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            owner_id TEXT NOT NULL REFERENCES users(id),
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    `);
    sql:ExecutionResult _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS list_members (
            id TEXT PRIMARY KEY,
            list_id TEXT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
            user_id TEXT NOT NULL REFERENCES users(id),
            role TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            UNIQUE (list_id, user_id)
        )
    `);
    sql:ExecutionResult _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            list_id TEXT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            due_date TEXT,
            priority TEXT NOT NULL,
            categories TEXT,
            assignee_id TEXT REFERENCES users(id),
            completed BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    `);
    sql:ExecutionResult _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id),
            type TEXT NOT NULL,
            message TEXT NOT NULL,
            read BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    `);
    return;
}

final () schemaReady = check initSchema();
