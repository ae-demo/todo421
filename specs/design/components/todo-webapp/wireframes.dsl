screen MyLists "Lists the user owns and collaborates on"
  navbar "Todo | Notifications -> Notifications"
  sidebar "My Lists -> MyLists | Notifications -> Notifications"
  row
    heading "My Lists"
    right
    button "New List" primary -> ListDetail
  table "Name | Role | Tasks"
    row "Groceries | Owner | 4"
    row "Move Prep | Collaborator | 9"

screen ListDetail "A single list's tasks, filters, and members"
  navbar "Todo | Notifications -> Notifications"
  sidebar "My Lists -> MyLists | Notifications -> Notifications"
  breadcrumb "My Lists / Groceries"
  row
    heading "Groceries"
    right
    button "Invite" -> InviteCollaborator
    button "Add Task" primary -> TaskForm
  row
    select "Priority"
    select "Category"
    select "Assignee"
    select "Sort by due date"
  table "Title | Due | Priority | Categories | Assignee | Done | " -> TaskForm
    row "Buy milk | Tomorrow | High | dairy | Jane | No | "
    row "Book venue | Fri | Medium | move-prep | Sam | No | "
  card "Members"
    row
      avatar "Jane Doe"
      avatar "Sam Lee"
      right
      button "Manage" -> InviteCollaborator

screen TaskForm "Create or edit a task"
  navbar "Todo | Notifications -> Notifications"
  sidebar "My Lists -> MyLists | Notifications -> Notifications"
  heading "Task Details"
  input "Title"
  input "Due date"
  select "Priority"
  input "Categories/tags"
  select "Assignee"
  row
    right
    button "Cancel" -> ListDetail
    button "Save" primary -> ListDetail

screen InviteCollaborator "Invite another user to this list, or manage current members"
  navbar "Todo | Notifications -> Notifications"
  sidebar "My Lists -> MyLists | Notifications -> Notifications"
  heading "Invite Collaborator"
  input "Collaborator email"
  table "Member | Role | "
    row "Jane Doe | Owner | "
    row "Sam Lee | Collaborator | Remove"
  row
    right
    button "Cancel" -> ListDetail
    button "Send Invite" primary -> ListDetail

screen Notifications "In-app notifications for invitations and task assignments"
  navbar "Todo | Notifications -> Notifications"
  sidebar "My Lists -> MyLists | Notifications -> Notifications"
  heading "Notifications"
  list "You were invited to Move Prep | You were assigned Buy milk in Groceries"
  row
    right
    button "Accept Invite" primary -> ListDetail

flow "Manage lists and tasks"
  role "User"
  description "A user views their lists, opens one, and manages its tasks"
  MyLists
  ListDetail
  TaskForm

flow "Collaborate on a shared list"
  role "User"
  description "A user invites a collaborator and later checks notifications"
  MyLists
  InviteCollaborator
  Notifications
