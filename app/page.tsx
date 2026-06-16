import { redirect } from 'next/navigation'

// Root page — middleware protects this and redirects unauthenticated users to /login
// Authenticated users see the dashboard at /dashboard
export default function RootPage() {
  redirect('/dashboard')
}
