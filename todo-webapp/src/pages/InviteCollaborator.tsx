import { useCallback, useEffect, useState, type JSX } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Alert,
  Button,
  Chip,
  ListingTable,
  PageContent,
  PageTitle,
  Stack,
  TextField,
} from "@wso2/oxygen-ui";
import { todoApi, CALLER_HEADER } from "../api";
import { currentUserId } from "../lib/currentUserId";
import type { components } from "../generated/todo-api";

type Member = components["schemas"]["Member"];

const ROLE_LABEL: Record<Member["role"], string> = {
  owner: "Owner",
  collaborator: "Collaborator",
  invited: "Invited",
};

export default function InviteCollaborator(): JSX.Element {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();

  const [members, setMembers] = useState<Member[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!listId) return;
    const [{ data }, id] = await Promise.all([
      todoApi.GET("/lists/{listId}/members", { params: { header: CALLER_HEADER, path: { listId } } }),
      currentUserId(),
    ]);
    setMembers(data ?? []);
    setMyId(id);
  }, [listId]);

  useEffect(() => {
    void load();
  }, [load]);

  const isOwner = members.some((m) => m.userId === myId && m.role === "owner");

  const handleInvite = async () => {
    if (!listId || !email.trim()) return;
    setSending(true);
    setError(null);
    const { data, error: inviteError } = await todoApi.POST("/lists/{listId}/members", {
      params: { header: CALLER_HEADER, path: { listId } },
      body: { email: email.trim() },
    });
    setSending(false);
    if (inviteError || !data) {
      setError("Could not send this invitation.");
      return;
    }
    navigate(`/lists/${listId}`);
  };

  const handleRemove = async (userId: string) => {
    if (!listId) return;
    const { response } = await todoApi.DELETE("/lists/{listId}/members/{userId}", {
      params: { header: CALLER_HEADER, path: { listId, userId } },
    });
    if (response.ok) setMembers((prev) => prev.filter((m) => m.userId !== userId));
  };

  return (
    <PageContent maxWidth="sm">
      <PageTitle>
        <PageTitle.Header>Invite Collaborator</PageTitle.Header>
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        label="Collaborator email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        sx={{ mb: 3 }}
      />

      <ListingTable.Container>
        <ListingTable>
          <ListingTable.Head>
            <ListingTable.Row>
              <ListingTable.Cell>Member</ListingTable.Cell>
              <ListingTable.Cell>Role</ListingTable.Cell>
              <ListingTable.Cell />
            </ListingTable.Row>
          </ListingTable.Head>
          <ListingTable.Body>
            {members.map((m) => (
              <ListingTable.Row key={m.userId}>
                <ListingTable.Cell>{m.email}</ListingTable.Cell>
                <ListingTable.Cell>
                  <Chip size="small" label={ROLE_LABEL[m.role]} color={m.role === "owner" ? "primary" : "default"} />
                </ListingTable.Cell>
                <ListingTable.RowActions>
                  {isOwner && m.role !== "owner" && (
                    <Button size="small" color="error" onClick={() => void handleRemove(m.userId)}>
                      Remove
                    </Button>
                  )}
                  {!isOwner && m.userId === myId && (
                    <Button size="small" color="error" onClick={() => void handleRemove(m.userId)}>
                      Leave
                    </Button>
                  )}
                </ListingTable.RowActions>
              </ListingTable.Row>
            ))}
          </ListingTable.Body>
        </ListingTable>
      </ListingTable.Container>

      <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
        <Button variant="outlined" onClick={() => navigate(`/lists/${listId}`)}>
          Cancel
        </Button>
        <Button variant="contained" disabled={sending || !email.trim()} onClick={() => void handleInvite()}>
          Send Invite
        </Button>
      </Stack>
    </PageContent>
  );
}
