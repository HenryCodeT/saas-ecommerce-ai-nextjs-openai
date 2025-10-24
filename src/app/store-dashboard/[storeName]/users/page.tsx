import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getStoreById, getStoreByName, getStoreUsers } from '@/services/storeService';
import { UsersPageClient } from './UsersPageClient';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  console.log("session login", session);

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

  const users = await getStoreUsers(store.id);
  console.log("users", users);

  return <UsersPageClient store={store} users={users} />;
}
