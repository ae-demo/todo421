// Single place every other module reads runtime configuration through.
// Names match the envBindings in specs/design/components/todo-api/design.json
// verbatim (TODO_DB_*) — never invented names. Every value has a sensible
// local-dev default so the service starts with no required env vars set.

import ballerina/os;

configurable string dbHost = os:getEnv("TODO_DB_HOST").trim().length() > 0 ? os:getEnv("TODO_DB_HOST") : "localhost";
configurable string dbPortStr = os:getEnv("TODO_DB_PORT").trim().length() > 0 ? os:getEnv("TODO_DB_PORT") : "5432";
configurable string dbUser = os:getEnv("TODO_DB_USER").trim().length() > 0 ? os:getEnv("TODO_DB_USER") : "postgres";
configurable string dbPassword = os:getEnv("TODO_DB_PASSWORD").trim().length() > 0 ? os:getEnv("TODO_DB_PASSWORD") : "postgres";
configurable string dbName = os:getEnv("TODO_DB_DBNAME").trim().length() > 0 ? os:getEnv("TODO_DB_DBNAME") : "todo";

final int dbPort = check int:fromString(dbPortStr);
