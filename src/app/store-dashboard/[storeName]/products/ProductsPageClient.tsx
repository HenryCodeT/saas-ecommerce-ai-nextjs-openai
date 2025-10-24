'use client';

import { useState } from 'react';
import { Store, Product } from '@prisma/client';
import { StoreDashboardLayout } from '@/components/store/StoreDashboardLayout';
import { ProductTable } from '@/components/store/ProductTable';
import { ProductCard } from '@/components/store/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProductsPageClientProps {
  store: Store;
}

export function ProductsPageClient({ store }: ProductsPageClientProps) {
  const { products, isLoading, createProduct, updateProduct, deleteProduct } = useProducts(store.id);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    sku: '',
    images: '',
    tags: '',
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    const images = product.images as string[] | null;
    const tags = product.tags as string[] | null;
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      sku: product.sku || '',
      images: images ? images.join(', ') : '',
      tags: tags ? tags.join(', ') : '',
    });
    setShowForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteProduct(productId);
      alert('Product deleted successfully!');
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      name: formData.name,
      description: formData.description || undefined,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      sku: formData.sku || undefined,
      images: formData.images ? formData.images.split(',').map(s => s.trim()).filter(Boolean) : [],
      tags: formData.tags ? formData.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        alert('Product updated successfully!');
      } else {
        await createProduct(productData);
        alert('Product created successfully!');
      }
      handleCancel();
    } catch (error) {
      alert(`Failed to ${editingProduct ? 'update' : 'create'} product`);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      sku: '',
      images: '',
      tags: '',
    });
  };

  return (
    <StoreDashboardLayout storeName={store.storeName} storeUrl={store.url}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="mt-2 text-gray-600">
              Manage your store's product catalog
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
            >
              {viewMode === 'table' ? 'Grid View' : 'Table View'}
            </Button>
            {!showForm && (
              <Button onClick={() => setShowForm(true)}>
                + Add Product
              </Button>
            )}
          </div>
        </div>

        {showForm && (
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      name="sku"
                      value={formData.sku}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock *</Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      value={formData.stock}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="images">Image URLs (comma-separated)</Label>
                  <Input
                    id="images"
                    name="images"
                    value={formData.images}
                    onChange={handleFormChange}
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleFormChange}
                    placeholder="electronics, featured, sale"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : viewMode === 'table' ? (
          <ProductTable
            products={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={() => setShowForm(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
            {products.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No products found. Click "Add Product" to get started.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </StoreDashboardLayout>
  );
}
