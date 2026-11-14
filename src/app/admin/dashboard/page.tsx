import { redirect } from 'next/navigation';

// /admin/dashboard redirects to /admin (the main dashboard page)
export default function AdminDashboardRedirect() {
  redirect('/admin');
}
