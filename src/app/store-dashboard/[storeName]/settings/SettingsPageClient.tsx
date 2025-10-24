'use client';

import { Store } from '@prisma/client';
import { StoreDashboardLayout } from '@/components/store/StoreDashboardLayout';
import { StoreForm } from '@/components/store/StoreForm';
import { useStore } from '@/hooks/useStore';

interface SettingsPageClientProps {
  store: Store;
}

export function SettingsPageClient({ store }: SettingsPageClientProps) {
  const { updateStore } = useStore(store.id);

  return (
    <StoreDashboardLayout storeName={store.storeName} storeUrl={store.url}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Store Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your store information and configuration
          </p>
        </div>

        <StoreForm store={store} onUpdate={updateStore} />
      </div>
    </StoreDashboardLayout>
  );
}
