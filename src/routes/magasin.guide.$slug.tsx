import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/magasin/guide/$slug")({
  loader: ({ params }) => {
    throw redirect({
      to: "/magasin/$slug",
      params: { slug: params.slug },
      statusCode: 301,
    });
  },
  component: () => null,
});
