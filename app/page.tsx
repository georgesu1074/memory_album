import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import HomePage from '@/components/HomePage';

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return <HomePage />;
}