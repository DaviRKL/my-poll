import { createFileRoute } from '@tanstack/react-router'
import { PollsListPage } from '../pages/PollsListPage'

export const Route = createFileRoute('/')({
  component: PollsListPage,
})
