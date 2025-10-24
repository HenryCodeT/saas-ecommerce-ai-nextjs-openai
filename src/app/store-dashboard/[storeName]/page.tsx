import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getStoreById, getStoreByName, getStoreStats } from '@/services/storeService';
import { StoreDashboardClient } from './StoreDashboardClient';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function StoreDashboardPage({ params }: { params: { storeName: string } }) {
  console.log('params', params);
  const session = await getServerSession(authOptions);
  console.log('session', session);
  if (!session?.user) {
    redirect('/login');
  }

  const store = await getStoreById(session.user.storeId || '');

  if (session.user.role !== 'CLIENT') {
    redirect('/');
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Store Not Found</h1>
          <p className="mt-2 text-gray-600">The store you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Verify the store belongs to the logged-in client
  if (store.clientUserId !== session.user.id) {
    redirect('/');
  }

  const stats = await getStoreStats(store.id);
  console.log('stats', stats);
  return <StoreDashboardClient store={store} stats={stats} />;
}
