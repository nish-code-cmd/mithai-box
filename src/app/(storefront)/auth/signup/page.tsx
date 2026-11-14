import { redirect } from 'next/navigation';

// /auth/signup now redirects to the unified auth page with mode=signup
export default function SignupRedirect() {
  redirect('/auth/login?mode=signup');
}
