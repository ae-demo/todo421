import { useEffect, useState, type JSX } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Alert,
  Button,
  Form,
  MenuItem,
  PageContent,
  PageTitle,
  Stack,
  TextField,
} from "@wso2/oxygen-ui";
import { todoApi, CALLER_HEADER } from "../api";
import type { components } from "../generated/todo-api";

type Task = components["schemas"]["Task"];
type Member = components["schemas"]["Member"];

const PRIORITIES: Task["priority"][] = ["low", "medium", "high"];

export default function TaskForm(): JSX.Element {
  const { listId, taskId } = useParams<{ listId: string; taskId?: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(taskId);

  const [members, setMembers] = useState<Member[]>([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [categories, setCategories] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [loaded, setLoaded] = useState(!isEdit);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!listId) return;
    void todoApi.GET("/lists/{listId}/members", { params: { header: CALLER_HEADER, path: { listId } } }).then(({ data }) => {
      setMembers(data ?? []);
    });
  }, [listId]);

  useEffect(() => {
    if (!taskId) return;
    void todoApi.GET("/tasks/{taskId}", { params: { header: CALLER_HEADER, path: { taskId } } }).then(({ data }) => {
      if (!data) {
        setError("Could not load this task.");
        return;
      }
      setTitle(data.title);
      setDueDate(data.dueDate ?? "");
      setPriority(data.priority);
      setCategories((data.categories ?? []).join(", "));
      setAssigneeId(data.assigneeId ?? "");
      setLoaded(true);
    });
  }, [taskId]);

  const backToList = () => navigate(`/lists/${listId}`);

  const handleSave = async () => {
    if (!listId || !title.trim()) return;
    setSaving(true);
    setError(null);
    const categoryList = categories
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    if (isEdit && taskId) {
      const { error: updateError } = await todoApi.PATCH("/tasks/{taskId}", {
        params: { header: CALLER_HEADER, path: { taskId } },
        body: {
          title: title.trim(),
          dueDate: dueDate || null,
          priority,
          categories: categoryList,
          assigneeId: assigneeId || null,
        },
      });
      setSaving(false);
      if (updateError) {
        setError("Could not save this task.");
        return;
      }
    } else {
      const { error: createError } = await todoApi.POST("/lists/{listId}/tasks", {
        params: { header: CALLER_HEADER, path: { listId } },
        body: {
          title: title.trim(),
          dueDate: dueDate || null,
          priority,
          categories: categoryList,
          assigneeId: assigneeId || null,
        },
      });
      setSaving(false);
      if (createError) {
        setError("Could not create this task.");
        return;
      }
    }
    backToList();
  };

  if (!loaded) return <PageContent>{null}</PageContent>;

  return (
    <PageContent maxWidth="sm">
      <PageTitle>
        <PageTitle.Header>Task Details</PageTitle.Header>
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Form.Section>
        <Form.Stack spacing={3}>
          <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth />
          <TextField
            type="date"
            label="Due date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
          <TextField
            select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Task["priority"])}
            fullWidth
          >
            {PRIORITIES.map((p) => (
              <MenuItem key={p} value={p}>
                {p[0]!.toUpperCase() + p.slice(1)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Categories/tags"
            placeholder="e.g. dairy, urgent"
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
            fullWidth
          />
          <TextField
            select
            label="Assignee"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            fullWidth
          >
            <MenuItem value="">Unassigned</MenuItem>
            {members.map((m) => (
              <MenuItem key={m.userId} value={m.userId}>
                {m.email}
              </MenuItem>
            ))}
          </TextField>
        </Form.Stack>
      </Form.Section>

      <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
        <Button variant="outlined" onClick={backToList}>
          Cancel
        </Button>
        <Button variant="contained" disabled={saving || !title.trim()} onClick={() => void handleSave()}>
          Save
        </Button>
      </Stack>
    </PageContent>
  );
}
