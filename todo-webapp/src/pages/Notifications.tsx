import { useCallback, useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router";
import {
  Alert,
  Button,
  List,
  ListItemButton,
  ListItemText,
  PageContent,
  PageTitle,
  Stack,
} from "@wso2/oxygen-ui";
import { todoApi, CALLER_HEADER } from "../api";
import type { components } from "../generated/todo-api";

type Notification = components["schemas"]["Notification"];

export default function Notifications(): JSX.Element {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const { data, error: listError } = await todoApi.GET("/notifications", {
      params: { header: CALLER_HEADER, query: {} },
    });
    if (listError || !data) {
      setError("Could not load your notifications.");
      return;
    }
    setNotifications(data.data);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const select = async (notification: Notification) => {
    setSelectedId(notification.id);
    if (!notification.read) {
      const { data } = await todoApi.PATCH("/notifications/{notificationId}", {
        params: { header: CALLER_HEADER, path: { notificationId: notification.id } },
        body: { read: true },
      });
      if (data) setNotifications((prev) => prev?.map((n) => (n.id === notification.id ? data : n)) ?? null);
    }
  };

  const selected = notifications?.find((n) => n.id === selectedId) ?? null;

  const handleAccept = async () => {
    if (!selected) return;
    setAccepting(true);
    setError(null);
    // The Notification contract carries no invitationId — the invitation this
    // notification announces is identified by the notification's own id.
    const { data, error: acceptError } = await todoApi.POST("/invitations/{invitationId}/accept", {
      params: { header: CALLER_HEADER, path: { invitationId: selected.id } },
    });
    setAccepting(false);
    if (acceptError || !data) {
      setError("Could not accept this invitation.");
      return;
    }
    navigate(`/lists/${data.id}`);
  };

  return (
    <PageContent maxWidth="sm">
      <PageTitle>
        <PageTitle.Header>Notifications</PageTitle.Header>
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <List sx={{ mb: 3 }}>
        {notifications?.length === 0 && <Alert severity="info">No notifications yet.</Alert>}
        {notifications?.map((n) => (
          <ListItemButton key={n.id} selected={n.id === selectedId} onClick={() => void select(n)} sx={{ borderRadius: 1, mb: 0.5 }}>
            <ListItemText
              primary={n.message}
              slotProps={{ primary: { fontWeight: n.read ? 400 : 700 } }}
              secondary={n.type === "invitation" ? "Invitation" : "Task assignment"}
            />
          </ListItemButton>
        ))}
      </List>

      <Stack direction="row" justifyContent="flex-end">
        <Button
          variant="contained"
          disabled={!selected || selected.type !== "invitation" || accepting}
          onClick={() => void handleAccept()}
        >
          Accept Invite
        </Button>
      </Stack>
    </PageContent>
  );
}
