// Mock handlers for todo-api — one per operation in
// specs/design/components/todo-api/openapi.yaml. State lives in this module's
// scope, so it behaves like an app for the length of one in-app session: a
// create shows up in the next list, an edit persists, a delete removes it —
// but any full page load (a reload, a typed URL, a link leaving the SPA)
// re-runs this module and resets to the seed below. Only in-app navigation
// carries a change forward.
//
// This app has one role ("User" — specs/design/security.json), and
// mock/auth.ts always signs the caller in as the single mock identity
// "mock-user" (sub derived from that one role's name). There is no second
// mock account to be "Sam" or "Jane" as, so every request here is treated as
// coming from "mock-user" and the seed below is written from that one
// person's point of view — the other people on their lists are real Member
// rows, just never the caller.
import { http, HttpResponse } from "msw";
import type { components } from "../src/generated/todo-api";

type TodoList = components["schemas"]["TodoList"];
type Member = components["schemas"]["Member"];
type Task = components["schemas"]["Task"];
type Notification = components["schemas"]["Notification"];

const ME = "mock-user";
const SAM = "mock-collaborator-sam";
const JANE = "mock-collaborator-jane";

function isoDaysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

let lists: TodoList[] = [
  { id: "list-groceries", name: "Groceries", ownerId: ME },
  { id: "list-move-prep", name: "Move Prep", ownerId: SAM },
  { id: "list-book-club", name: "Book Club", ownerId: SAM },
];

let members: Record<string, Member[]> = {
  "list-groceries": [
    { userId: ME, email: "user@example.test", role: "owner" },
    { userId: JANE, email: "jane@example.test", role: "collaborator" },
    { userId: SAM, email: "sam@example.test", role: "collaborator" },
  ],
  "list-move-prep": [
    { userId: SAM, email: "sam@example.test", role: "owner" },
    { userId: ME, email: "user@example.test", role: "collaborator" },
  ],
  "list-book-club": [
    { userId: SAM, email: "sam@example.test", role: "owner" },
    { userId: ME, email: "user@example.test", role: "invited" },
  ],
};

let tasks: Task[] = [
  {
    id: "task-milk",
    listId: "list-groceries",
    title: "Buy milk",
    dueDate: isoDaysFromNow(1),
    priority: "high",
    categories: ["dairy"],
    assigneeId: ME,
    completed: false,
  },
  {
    id: "task-eggs",
    listId: "list-groceries",
    title: "Buy eggs",
    dueDate: isoDaysFromNow(2),
    priority: "low",
    categories: ["dairy"],
    assigneeId: SAM,
    completed: true,
  },
  {
    id: "task-bread",
    listId: "list-groceries",
    title: "Get bread",
    dueDate: null,
    priority: "medium",
    categories: ["bakery"],
    assigneeId: null,
    completed: false,
  },
  {
    id: "task-cleaning",
    listId: "list-groceries",
    title: "Restock cleaning supplies",
    dueDate: isoDaysFromNow(5),
    priority: "low",
    categories: ["household"],
    assigneeId: JANE,
    completed: false,
  },
  {
    id: "task-venue",
    listId: "list-move-prep",
    title: "Book venue",
    dueDate: isoDaysFromNow(4),
    priority: "medium",
    categories: ["move-prep"],
    assigneeId: SAM,
    completed: false,
  },
  {
    id: "task-boxes",
    listId: "list-move-prep",
    title: "Buy moving boxes",
    dueDate: isoDaysFromNow(3),
    priority: "high",
    categories: ["move-prep", "packing"],
    assigneeId: ME,
    completed: false,
  },
  {
    id: "task-movers",
    listId: "list-move-prep",
    title: "Hire movers",
    dueDate: isoDaysFromNow(6),
    priority: "high",
    categories: ["logistics"],
    assigneeId: SAM,
    completed: false,
  },
  {
    id: "task-utilities",
    listId: "list-move-prep",
    title: "Transfer utilities",
    dueDate: isoDaysFromNow(7),
    priority: "medium",
    categories: ["logistics"],
    assigneeId: ME,
    completed: false,
  },
  {
    id: "task-address",
    listId: "list-move-prep",
    title: "Update address",
    dueDate: null,
    priority: "low",
    categories: ["admin"],
    assigneeId: null,
    completed: true,
  },
  {
    id: "task-pack-kitchen",
    listId: "list-move-prep",
    title: "Pack kitchen",
    dueDate: isoDaysFromNow(2),
    priority: "medium",
    categories: ["packing"],
    assigneeId: ME,
    completed: false,
  },
  {
    id: "task-pack-closet",
    listId: "list-move-prep",
    title: "Pack closet",
    dueDate: isoDaysFromNow(2),
    priority: "low",
    categories: ["packing"],
    assigneeId: JANE,
    completed: false,
  },
  {
    id: "task-label-boxes",
    listId: "list-move-prep",
    title: "Label boxes",
    dueDate: isoDaysFromNow(3),
    priority: "low",
    categories: ["packing", "move-prep"],
    assigneeId: null,
    completed: false,
  },
  {
    id: "task-donate",
    listId: "list-move-prep",
    title: "Donate unused furniture",
    dueDate: isoDaysFromNow(1),
    priority: "medium",
    categories: ["move-prep"],
    assigneeId: SAM,
    completed: true,
  },
];

// The invitation this notification announces — the Notification schema
// carries no invitationId of its own, so the notification's id doubles as
// the invitation's id (src/pages/Notifications.tsx documents the same gap).
let notifications: Notification[] = [
  {
    id: "notif-move-prep-invite",
    type: "invitation",
    message: "You were invited to Move Prep",
    read: true,
  },
  {
    id: "notif-buy-milk-assigned",
    type: "assignment",
    message: "You were assigned Buy milk in Groceries",
    read: false,
  },
  {
    id: "notif-book-club-invite",
    type: "invitation",
    message: "You were invited to Book Club",
    read: false,
  },
];

const pendingInvitations: Record<string, { listId: string; invitedUserId: string }> = {
  "notif-book-club-invite": { listId: "list-book-club", invitedUserId: ME },
};

let nextId = 1;
function newId(prefix: string): string {
  return `${prefix}-${nextId++}`;
}

function error(code: number, message: string) {
  return HttpResponse.json({ code, message }, { status: code });
}

export const handlers = [
  // --- Lists ---------------------------------------------------------
  http.get("/api/lists", () => {
    const mine = lists.filter((l) => (members[l.id] ?? []).some((m) => m.userId === ME));
    return HttpResponse.json({ count: mine.length, next: null, previous: null, data: mine });
  }),

  http.post("/api/lists", async ({ request }) => {
    const body = (await request.json()) as { name?: string };
    if (!body?.name) return error(400, "name is required");
    const list: TodoList = { id: newId("list"), name: body.name, ownerId: ME };
    lists = [...lists, list];
    members[list.id] = [{ userId: ME, email: "user@example.test", role: "owner" }];
    return HttpResponse.json(list, { status: 201 });
  }),

  http.get("/api/lists/:listId", ({ params }) => {
    const list = lists.find((l) => l.id === params.listId);
    return list ? HttpResponse.json(list) : error(404, "list not found");
  }),

  http.patch("/api/lists/:listId", async ({ params, request }) => {
    const list = lists.find((l) => l.id === params.listId);
    if (!list) return error(404, "list not found");
    const body = (await request.json()) as { name?: string };
    if (body.name) list.name = body.name;
    return HttpResponse.json(list);
  }),

  http.delete("/api/lists/:listId", ({ params }) => {
    const before = lists.length;
    lists = lists.filter((l) => l.id !== params.listId);
    return before === lists.length ? error(404, "list not found") : new HttpResponse(null, { status: 204 });
  }),

  // --- Members / invitations ------------------------------------------
  http.get("/api/lists/:listId/members", ({ params }) => {
    const list = lists.find((l) => l.id === params.listId);
    if (!list) return error(404, "list not found");
    return HttpResponse.json(members[list.id] ?? []);
  }),

  http.post("/api/lists/:listId/members", async ({ params, request }) => {
    const list = lists.find((l) => l.id === params.listId);
    if (!list) return error(404, "list not found");
    const body = (await request.json()) as { email?: string };
    if (!body?.email) return error(400, "email is required");
    const invitationId = newId("notif");
    const invitedUserId = newId("user");
    const member: Member = { userId: invitedUserId, email: body.email, role: "invited" };
    members[list.id] = [...(members[list.id] ?? []), member];
    pendingInvitations[invitationId] = { listId: list.id, invitedUserId };
    notifications = [
      { id: invitationId, type: "invitation", message: `You were invited to ${list.name}`, read: false },
      ...notifications,
    ];
    return HttpResponse.json(member, { status: 201 });
  }),

  http.delete("/api/lists/:listId/members/:userId", ({ params }) => {
    const list = lists.find((l) => l.id === params.listId);
    if (!list) return error(404, "list or member not found");
    const before = members[list.id]?.length ?? 0;
    members[list.id] = (members[list.id] ?? []).filter((m) => m.userId !== params.userId);
    return (members[list.id]?.length ?? 0) === before
      ? error(404, "list or member not found")
      : new HttpResponse(null, { status: 204 });
  }),

  http.post("/api/invitations/:invitationId/accept", ({ params }) => {
    const invitation = pendingInvitations[params.invitationId as string];
    if (!invitation) return error(404, "invitation not found");
    const list = lists.find((l) => l.id === invitation.listId);
    if (!list) return error(404, "invitation not found");
    members[list.id] = (members[list.id] ?? []).map((m) =>
      m.userId === invitation.invitedUserId ? { ...m, role: "collaborator" as const } : m,
    );
    delete pendingInvitations[params.invitationId as string];
    return HttpResponse.json(list);
  }),

  // --- Tasks -----------------------------------------------------------
  http.get("/api/lists/:listId/tasks", ({ params, request }) => {
    const list = lists.find((l) => l.id === params.listId);
    if (!list) return error(404, "list not found");
    const url = new URL(request.url);
    let matching = tasks.filter((t) => t.listId === list.id);

    const priority = url.searchParams.get("priority");
    if (priority) matching = matching.filter((t) => t.priority === priority);
    const category = url.searchParams.get("category");
    if (category) matching = matching.filter((t) => t.categories?.includes(category));
    const assigneeId = url.searchParams.get("assigneeId");
    if (assigneeId) matching = matching.filter((t) => t.assigneeId === assigneeId);
    const completed = url.searchParams.get("completed");
    if (completed !== null) matching = matching.filter((t) => t.completed === (completed === "true"));

    const sort = url.searchParams.get("sort");
    if (sort === "dueDate") {
      matching = [...matching].sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"));
    } else if (sort === "priority") {
      const rank = { high: 0, medium: 1, low: 2 };
      matching = [...matching].sort((a, b) => rank[a.priority] - rank[b.priority]);
    }

    const count = matching.length;
    const limit = Number(url.searchParams.get("limit") ?? 20);
    const offset = Number(url.searchParams.get("offset") ?? 0);
    const page = matching.slice(offset, offset + limit);
    return HttpResponse.json({ count, next: null, previous: null, data: page });
  }),

  http.post("/api/lists/:listId/tasks", async ({ params, request }) => {
    const list = lists.find((l) => l.id === params.listId);
    if (!list) return error(404, "list not found");
    const body = (await request.json()) as Partial<Task>;
    if (!body.title || !body.priority) return error(400, "title and priority are required");
    const task: Task = {
      id: newId("task"),
      listId: list.id,
      title: body.title,
      dueDate: body.dueDate ?? null,
      priority: body.priority,
      categories: body.categories ?? [],
      assigneeId: body.assigneeId ?? null,
      completed: false,
    };
    tasks = [...tasks, task];
    return HttpResponse.json(task, { status: 201 });
  }),

  http.get("/api/tasks/:taskId", ({ params }) => {
    const task = tasks.find((t) => t.id === params.taskId);
    return task ? HttpResponse.json(task) : error(404, "task not found");
  }),

  http.patch("/api/tasks/:taskId", async ({ params, request }) => {
    const task = tasks.find((t) => t.id === params.taskId);
    if (!task) return error(404, "task not found");
    const body = (await request.json()) as Partial<Task>;
    Object.assign(task, body);
    return HttpResponse.json(task);
  }),

  http.delete("/api/tasks/:taskId", ({ params }) => {
    const before = tasks.length;
    tasks = tasks.filter((t) => t.id !== params.taskId);
    return before === tasks.length ? error(404, "task not found") : new HttpResponse(null, { status: 204 });
  }),

  // --- Notifications -----------------------------------------------------
  http.get("/api/notifications", ({ request }) => {
    const url = new URL(request.url);
    const unreadOnly = url.searchParams.get("unreadOnly") === "true";
    const matching = unreadOnly ? notifications.filter((n) => !n.read) : notifications;
    return HttpResponse.json({ count: matching.length, next: null, previous: null, data: matching });
  }),

  http.patch("/api/notifications/:notificationId", async ({ params, request }) => {
    const notification = notifications.find((n) => n.id === params.notificationId);
    if (!notification) return error(404, "notification not found");
    const body = (await request.json()) as { read: boolean };
    notification.read = body.read;
    return HttpResponse.json(notification);
  }),
];
