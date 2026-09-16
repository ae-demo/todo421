import { useCallback, useEffect, useMemo, useState, type JSX } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Alert,
  AppBreadcrumbs,
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  IconButton,
  ListingTable,
  MenuItem,
  PageContent,
  PageTitle,
  Stack,
  TextField,
  Tooltip,
} from "@wso2/oxygen-ui";
import { Plus, Trash2, UserPlus } from "@wso2/oxygen-ui-icons-react";
import { todoApi, CALLER_HEADER } from "../api";
import type { components } from "../generated/todo-api";

type Task = components["schemas"]["Task"];
type Member = components["schemas"]["Member"];
type TodoList = components["schemas"]["TodoList"];

const PRIORITIES: Task["priority"][] = ["low", "medium", "high"];
const PRIORITY_COLOR: Record<Task["priority"], "error" | "warning" | "info"> = {
  high: "error",
  medium: "warning",
  low: "info",
};

function initials(email: string): string {
  const name = email.split("@")[0] ?? email;
  return name.slice(0, 2).toUpperCase();
}

export default function ListDetail(): JSX.Element {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();

  const [list, setList] = useState<TodoList | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [priority, setPriority] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [assignee, setAssignee] = useState<string>("");
  const [sort, setSort] = useState<string>("");

  const loadStatic = useCallback(async () => {
    if (!listId) return;
    const [{ data: listData }, { data: memberData }] = await Promise.all([
      todoApi.GET("/lists/{listId}", { params: { header: CALLER_HEADER, path: { listId } } }),
      todoApi.GET("/lists/{listId}/members", { params: { header: CALLER_HEADER, path: { listId } } }),
    ]);
    setList(listData ?? null);
    setMembers(memberData ?? []);
  }, [listId]);

  const loadTasks = useCallback(async () => {
    if (!listId) return;
    setError(null);
    const { data, error: tasksError } = await todoApi.GET("/lists/{listId}/tasks", {
      params: {
        header: CALLER_HEADER,
        path: { listId },
        query: {
          priority: (priority || undefined) as Task["priority"] | undefined,
          category: category || undefined,
          assigneeId: assignee || undefined,
          sort: (sort || undefined) as "dueDate" | "priority" | undefined,
        },
      },
    });
    if (tasksError || !data) {
      setError("Could not load this list's tasks.");
      return;
    }
    setTasks(data.data);
  }, [listId, priority, category, assignee, sort]);

  useEffect(() => {
    void loadStatic();
  }, [loadStatic]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const categoryOptions = useMemo(() => {
    const all = new Set<string>();
    tasks?.forEach((t) => t.categories?.forEach((c) => all.add(c)));
    return Array.from(all);
  }, [tasks]);

  const memberEmail = (userId: string | null | undefined) => members.find((m) => m.userId === userId)?.email;

  const toggleDone = async (task: Task) => {
    const { data } = await todoApi.PATCH("/tasks/{taskId}", {
      params: { header: CALLER_HEADER, path: { taskId: task.id } },
      body: { completed: !task.completed },
    });
    if (data) setTasks((prev) => prev?.map((t) => (t.id === task.id ? data : t)) ?? null);
  };

  const deleteTask = async (task: Task) => {
    const { response } = await todoApi.DELETE("/tasks/{taskId}", {
      params: { header: CALLER_HEADER, path: { taskId: task.id } },
    });
    if (response.ok) setTasks((prev) => prev?.filter((t) => t.id !== task.id) ?? null);
  };

  if (!listId) return <Alert severity="error">No list selected.</Alert>;

  return (
    <PageContent>
      <AppBreadcrumbs
        items={[
          { key: "my-lists", label: "My Lists", onClick: () => navigate("/") },
          { key: "list", label: list?.name ?? "…" },
        ]}
      />
      <PageTitle sx={{ mt: 2 }}>
        <PageTitle.Header>{list?.name ?? "List"}</PageTitle.Header>
        <PageTitle.Actions>
          <Button
            variant="outlined"
            startIcon={<UserPlus size={18} />}
            onClick={() => navigate(`/lists/${listId}/invite`)}
          >
            Invite
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => navigate(`/lists/${listId}/tasks/new`)}
          >
            Add Task
          </Button>
        </PageTitle.Actions>
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: "wrap" }}>
        <TextField select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="">All</MenuItem>
          {PRIORITIES.map((p) => (
            <MenuItem key={p} value={p}>
              {p[0]!.toUpperCase() + p.slice(1)}
            </MenuItem>
          ))}
        </TextField>
        <TextField select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="">All</MenuItem>
          {categoryOptions.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>
        <TextField select label="Assignee" value={assignee} onChange={(e) => setAssignee(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="">All</MenuItem>
          {members.map((m) => (
            <MenuItem key={m.userId} value={m.userId}>
              {m.email}
            </MenuItem>
          ))}
        </TextField>
        <TextField select label="Sort by due date" value={sort} onChange={(e) => setSort(e.target.value)} sx={{ minWidth: 180 }}>
          <MenuItem value="">Default</MenuItem>
          <MenuItem value="dueDate">Due date</MenuItem>
          <MenuItem value="priority">Priority</MenuItem>
        </TextField>
      </Stack>

      <ListingTable.Container>
        <ListingTable>
          <ListingTable.Head>
            <ListingTable.Row>
              <ListingTable.Cell>Title</ListingTable.Cell>
              <ListingTable.Cell>Due</ListingTable.Cell>
              <ListingTable.Cell>Priority</ListingTable.Cell>
              <ListingTable.Cell>Categories</ListingTable.Cell>
              <ListingTable.Cell>Assignee</ListingTable.Cell>
              <ListingTable.Cell>Done</ListingTable.Cell>
              <ListingTable.Cell />
            </ListingTable.Row>
          </ListingTable.Head>
          <ListingTable.Body>
            {tasks?.length === 0 && (
              <ListingTable.Row>
                <ListingTable.Cell colSpan={7}>
                  <ListingTable.EmptyState title="No tasks" description="Add a task to get started." />
                </ListingTable.Cell>
              </ListingTable.Row>
            )}
            {tasks?.map((task) => (
              <ListingTable.Row
                key={task.id}
                clickable
                onClick={() => navigate(`/lists/${listId}/tasks/${task.id}/edit`)}
              >
                <ListingTable.Cell>{task.title}</ListingTable.Cell>
                <ListingTable.Cell>{task.dueDate ?? "—"}</ListingTable.Cell>
                <ListingTable.Cell>
                  <Chip
                    size="small"
                    color={PRIORITY_COLOR[task.priority]}
                    label={task.priority[0]!.toUpperCase() + task.priority.slice(1)}
                  />
                </ListingTable.Cell>
                <ListingTable.Cell>
                  {task.categories && task.categories.length > 0
                    ? task.categories.map((c) => <Chip key={c} size="small" label={c} sx={{ mr: 0.5 }} />)
                    : "—"}
                </ListingTable.Cell>
                <ListingTable.Cell>{memberEmail(task.assigneeId) ?? "Unassigned"}</ListingTable.Cell>
                <ListingTable.Cell>
                  <Checkbox
                    checked={task.completed}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => void toggleDone(task)}
                  />
                </ListingTable.Cell>
                <ListingTable.RowActions>
                  <Tooltip title="Delete task">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        void deleteTask(task);
                      }}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Tooltip>
                </ListingTable.RowActions>
              </ListingTable.Row>
            ))}
          </ListingTable.Body>
        </ListingTable>
      </ListingTable.Container>

      <Card sx={{ mt: 3 }}>
        <CardHeader title="Members" />
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2}>
            <AvatarGroup max={8}>
              {members.map((m) => (
                <Tooltip key={m.userId} title={`${m.email} (${m.role})`}>
                  <Avatar>{initials(m.email)}</Avatar>
                </Tooltip>
              ))}
            </AvatarGroup>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="outlined" onClick={() => navigate(`/lists/${listId}/invite`)}>
              Manage
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </PageContent>
  );
}
