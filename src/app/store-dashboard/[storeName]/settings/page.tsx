import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getStoreById, getStoreByName } from '@/services/storeService';
import { SettingsPageClient } from './SettingsPageClient';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'CLIENT') {
    redirect('/');
  }

  const store = await getStoreById(session.user.storeId || "");

  if (!store || store.clientUserId !== session.user.id) {
    redirect('/');
  }

  return <SettingsPageClient store={store} />;
}
