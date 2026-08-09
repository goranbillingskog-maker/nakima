import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";

const VALID_SERVICES = ["naprapat", "kiropraktor", "massage"];

export const Route = createFileRoute("/$service/$city")({
  loader: ({ params }) => {
    if (!VALID_SERVICES.includes(params.service)) {
      throw notFound();
    }
  },
  component: () => <Outlet />,
});
