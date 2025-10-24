'use client';

import { useState } from 'react';
import { Store } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StoreFormProps {
  store: Store;
  onUpdate: (data: Partial<Store>) => Promise<void>;
}

export function StoreForm({ store, onUpdate }: StoreFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    storeName: store.storeName,
    logoUrl: store.logoUrl || '',
    city: store.city || '',
    description: store.description || '',
    category: store.category || '',
    businessHours: store.businessHours || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await onUpdate(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating store:', error);
      alert('Failed to update store information');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      storeName: store.storeName,
      logoUrl: store.logoUrl || '',
      city: store.city || '',
      description: store.description || '',
      category: store.category || '',
      businessHours: store.businessHours || '',
    });
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Store Information</CardTitle>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} size="sm">
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name *</Label>
              <Input
                id="storeName"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="e.g., New York"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="e.g., Electronics, Fashion, Food"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={!isEditing}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Describe your store..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessHours">Business Hours</Label>
            <textarea
              id="businessHours"
              name="businessHours"
              value={formData.businessHours}
              onChange={handleChange}
              disabled={!isEditing}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Mon-Fri: 9:00 AM - 6:00 PM&#10;Sat: 10:00 AM - 4:00 PM&#10;Sun: Closed"
            />
          </div>

          {isEditing && (
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
