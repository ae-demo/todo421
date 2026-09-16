import { type RouteProps, Navigate } from "react-router";
import AppLayout from "../layouts/AppLayout";
import AuthGate from "../components/AuthGate";
import CallbackPage from "../pages/CallbackPage";
import MyLists from "../pages/MyLists";
import ListDetail from "../pages/ListDetail";
import TaskForm from "../pages/TaskForm";
import InviteCollaborator from "../pages/InviteCollaborator";
import Notifications from "../pages/Notifications";

export interface AppRoute extends Omit<RouteProps, "children"> {
  children?: AppRoute[];
  label?: string;
}

const appRoutes: AppRoute[] = [
  // Thunder redirects here after sign-in — no chrome, no AuthGate (there is
  // no session yet on the very first round trip).
  { path: "/callback", element: <CallbackPage /> },
  {
    element: (
      <AuthGate>
        <AppLayout />
      </AuthGate>
    ),
    children: [
      { index: true, element: <MyLists />, label: "MyLists" },
      { path: "/lists/:listId", element: <ListDetail />, label: "ListDetail" },
      { path: "/lists/:listId/tasks/new", element: <TaskForm />, label: "TaskForm" },
      { path: "/lists/:listId/tasks/:taskId/edit", element: <TaskForm />, label: "TaskForm" },
      { path: "/lists/:listId/invite", element: <InviteCollaborator />, label: "InviteCollaborator" },
      { path: "/notifications", element: <Notifications />, label: "Notifications" },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
];

export default appRoutes;
