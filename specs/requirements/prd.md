# todo421 — PRD

## Problem Statement

People juggling personal and shared responsibilities lose track of what needs
doing because their tasks are scattered across notes, chat threads, and
memory. When a task involves more than one person, there is no shared place to
see who is doing what, so work gets duplicated, dropped, or forgotten.

## Solution

A web-based todo application where each signed-in user manages their own
lists of tasks, and can invite others to collaborate on a shared list —
assigning tasks, tracking due dates and priority, and organizing work with
categories and tags.

## Actors

- **User** — a signed-in person who creates and manages their own todo lists,
adds and organizes tasks within them, and can invite other users to
collaborate on a shared list, assign tasks to collaborators, and manage who
has access to a shared list.

## User Stories

1. As a User, I want to sign in with my account, so that my todos are private to me.
2. As a User, I want to create a todo list, so that I can organize related tasks together.
3. As a User, I want to add a task to a list with a title, due date, priority, and categories/tags, so that I can capture what needs doing and how urgent it is.
4. As a User, I want to edit a task's details, so that I can correct or update it as things change.
5. As a User, I want to mark a task complete or incomplete, so that I can track my progress.
6. As a User, I want to delete a task, so that I can remove things I no longer need to do.
7. As a User, I want to filter and sort my tasks by due date, priority, or category/tag, so that I can focus on what matters most right now.
8. As a User, I want to invite another user to a shared list, so that we can manage tasks together.
9. As a User, I want to assign a task on a shared list to a specific collaborator, so that responsibility for it is clear.
10. As a User, I want to see who a shared task is assigned to, so that I know who owns it.
11. As a User, I want to remove a collaborator from a shared list, so that I can control who has access to it.
12. As a User, I want to leave a shared list I was invited to, so that I stop seeing tasks that aren't mine anymore.
13. As a User, I want to be notified when I'm invited to a list or assigned a task, so that I don't miss updates that affect me.

## Product Decisions

- Sign-in: every user signs in via SSO through Thunder, the platform identity provider.
- Sharing model: a list has one owner (its creator) and zero or more collaborators the owner invites; any collaborator can add, edit, complete, and assign tasks on a shared list.
- Notifications for invitations and task assignments are delivered in-app only (no email or push channel).
- No third-party integrations are needed for this product (no external calendar, email, or reminder service).

## Out of Scope

- Recurring or repeating tasks.
- Subtasks or task hierarchies.
- Reminder notifications on a schedule (e.g. "remind me the day before").
- Native mobile apps (web only).
- Calendar or third-party app integrations.
- Public/anonymous access — every user must sign in.

## Open Questions

(none)