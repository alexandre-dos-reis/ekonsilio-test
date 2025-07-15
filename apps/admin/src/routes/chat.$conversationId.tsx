import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/chat/$conversationId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/chat/$conversationId"!</div>
}
