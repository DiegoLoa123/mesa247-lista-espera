import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom";

import { HostPage } from "../features/host/pages/HostPage";
import { JoinPage } from "../features/waitlist/pages/JoinPage";
import { QueuePage } from "../features/waitlist/pages/QueuePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Navigate
        to="/join/1"
        replace
      />
    ),
  },

  {
    path: "/join/:locationId",
    element: <JoinPage />,
  },

  {
    path: "/queue/:entryId",
    element: <QueuePage />,
  },

  {
    path: "/host/:locationId",
    element: <HostPage />,
  },
]);