import { useCallback, useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ListingTable,
  PageContent,
  PageTitle,
  TextField,
} from "@wso2/oxygen-ui";
import { Plus } from "@wso2/oxygen-ui-icons-react";
import { todoApi, CALLER_HEADER } from "../api";
import { currentUserId } from "../lib/currentUserId";
import type { components } from "../generated/todo-api";

type TodoList = components["schemas"]["TodoList"];

type ListRow = TodoList & { role: "Owner" | "Collaborator"; taskCount: number };

export default function MyLists(): JSX.Element {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ListRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const myId = await currentUserId();
    const { data, error: listsError } = await todoApi.GET("/lists", {
      params: { header: CALLER_HEADER, query: {} },
    });
    if (listsError || !data) {
      setError("Could not load your lists.");
      return;
    }
    // The list endpoint carries no task count, so it is joined here with one
    // bulk request per list — `limit=1` against that list's own tasks, reading
    // the paginated envelope's `count` rather than its (discarded) `data`.
    const withCounts = await Promise.all(
      data.data.map(async (list): Promise<ListRow> => {
        const { data: tasksPage } = await todoApi.GET("/lists/{listId}/tasks", {
          params: { header: CALLER_HEADER, path: { listId: list.id }, query: { limit: 1 } },
        });
        return {
          ...list,
          role: list.ownerId === myId ? "Owner" : "Collaborator",
          taskCount: tasksPage?.count ?? 0,
        };
      }),
    );
    setRows(withCounts);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async () => {
    if (!newListName.trim()) return;
    setCreating(true);
    const { data, error: createError } = await todoApi.POST("/lists", {
      params: { header: CALLER_HEADER },
      body: { name: newListName.trim() },
    });
    setCreating(false);
    if (createError || !data) {
      setError("Could not create the list.");
      return;
    }
    setCreateOpen(false);
    setNewListName("");
    navigate(`/lists/${data.id}`);
  };

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>My Lists</PageTitle.Header>
        <PageTitle.Actions>
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => setCreateOpen(true)}>
            New List
          </Button>
        </PageTitle.Actions>
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <ListingTable.Container>
        <ListingTable>
          <ListingTable.Head>
            <ListingTable.Row>
              <ListingTable.Cell>Name</ListingTable.Cell>
              <ListingTable.Cell>Role</ListingTable.Cell>
              <ListingTable.Cell>Tasks</ListingTable.Cell>
            </ListingTable.Row>
          </ListingTable.Head>
          <ListingTable.Body>
            {rows?.length === 0 && (
              <ListingTable.Row>
                <ListingTable.Cell colSpan={3}>
                  <ListingTable.EmptyState
                    title="No lists yet"
                    description="Create your first list to start adding tasks."
                  />
                </ListingTable.Cell>
              </ListingTable.Row>
            )}
            {rows?.map((row) => (
              <ListingTable.Row key={row.id} clickable onClick={() => navigate(`/lists/${row.id}`)}>
                <ListingTable.Cell>{row.name}</ListingTable.Cell>
                <ListingTable.Cell>{row.role}</ListingTable.Cell>
                <ListingTable.Cell>{row.taskCount}</ListingTable.Cell>
              </ListingTable.Row>
            ))}
          </ListingTable.Body>
        </ListingTable>
      </ListingTable.Container>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>New list</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="List name"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={creating || !newListName.trim()} onClick={() => void handleCreate()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </PageContent>
  );
}
