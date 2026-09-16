import type { JSX } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  AppShell,
  Header,
  Sidebar,
  Footer,
  UserMenu,
  Divider,
} from "@wso2/oxygen-ui";
import { ListChecks, Bell, LogOut, User } from "@wso2/oxygen-ui-icons-react";
import { signOut } from "../auth";
import { useCurrentUser } from "../lib/useCurrentUser";

/**
 * The signed-in app shell every screen in wireframes.dsl shares: a `navbar`
 * carrying the brand + a Notifications link, and a `sidebar` repeating
 * "My Lists -> MyLists | Notifications -> Notifications" on every screen.
 */
export default function AppLayout(): JSX.Element {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useCurrentUser();

  const active = pathname.startsWith("/notifications") ? "notifications" : "my-lists";

  return (
    <AppShell>
      <AppShell.Navbar>
        <Header>
          <Header.Toggle />
          <Header.Brand onClick={() => navigate("/")}>
            <Header.BrandTitle>Todo</Header.BrandTitle>
          </Header.Brand>
          <Header.Spacer />
          <Header.Actions>
            <UserMenu>
              <UserMenu.Trigger name={user?.profile.name ?? "Account"} />
              <UserMenu.Header
                name={user?.profile.name ?? "Signed in"}
                email={user?.profile.email ?? ""}
              />
              <UserMenu.Item icon={<Bell />} label="Notifications" onClick={() => navigate("/notifications")} />
              <Divider />
              <UserMenu.Logout icon={<LogOut />} onClick={() => void signOut()} />
            </UserMenu>
          </Header.Actions>
        </Header>
      </AppShell.Navbar>

      <AppShell.Sidebar>
        <Sidebar activeItem={active}>
          <Sidebar.Nav>
            <Sidebar.Category>
              <Sidebar.Item id="my-lists" link={<Link to="/" />}>
                <Sidebar.ItemIcon>
                  <ListChecks />
                </Sidebar.ItemIcon>
                <Sidebar.ItemLabel>My Lists</Sidebar.ItemLabel>
              </Sidebar.Item>
              <Sidebar.Item id="notifications" link={<Link to="/notifications" />}>
                <Sidebar.ItemIcon>
                  <Bell />
                </Sidebar.ItemIcon>
                <Sidebar.ItemLabel>Notifications</Sidebar.ItemLabel>
              </Sidebar.Item>
            </Sidebar.Category>
          </Sidebar.Nav>
          <Sidebar.Footer showDivider>
            <Sidebar.User onClick={() => void signOut()}>
              <Sidebar.UserAvatar>
                <User size={16} />
              </Sidebar.UserAvatar>
              <Sidebar.UserName>{user?.profile.name ?? "Account"}</Sidebar.UserName>
              <Sidebar.UserEmail>{user?.profile.email ?? ""}</Sidebar.UserEmail>
            </Sidebar.User>
          </Sidebar.Footer>
        </Sidebar>
      </AppShell.Sidebar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>

      <AppShell.Footer>
        <Footer>
          <Footer.Copyright>© WSO2 LLC</Footer.Copyright>
        </Footer>
      </AppShell.Footer>
    </AppShell>
  );
}
