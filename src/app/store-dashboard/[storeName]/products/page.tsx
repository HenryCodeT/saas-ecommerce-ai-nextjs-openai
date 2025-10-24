import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getStoreById } from '@/services/storeService';
import { ProductsPageClient } from './ProductsPageClient';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'CLIENT' || !session.user.storeId) {
    redirect('/');
  }

  const store = await getStoreById(session.user.storeId);

  if (!store || store.clientUserId !== session.user.id) {
    redirect('/');
  }

  return <ProductsPageClient store={store} />;
}
