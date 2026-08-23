"use client";

import { useState, useEffect } from "react";
import { useWorkspace } from "@/providers/workspace-context";
import { useToast } from "@/components/ui/toast";
import {
  useGetProductsQuery,
  useGetCategoriesQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "@/redux/api/productApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog } from "@/components/ui/dialog";
import {
  Package,
  Search,
  Plus,
  Pencil,
  Trash2,
  Filter,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  price: number | string;
  stock?: number;
  description?: string;
  is_available?: boolean;
  image?: string;
  created_at?: string;
}

interface ProductListResponse {
  results: Product[];
  count: number;
}

const emptyForm = {
  name: "",
  sku: "",
  price: "",
  stock: "",
  category: "",
  description: "",
  is_available: true,
};

export default function ProductsPage() {
  const { workspace } = useWorkspace();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Product | null>(
    null
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    data: rawData,
    isLoading,
    isError,
  } = useGetProductsQuery(
    {
      workspace_id: workspace?.id,
      search: debouncedSearch || undefined,
      category: category || undefined,
    },
    { skip: !workspace }
  );
  const data = rawData as any;

  const { data: categoriesRawData } = useGetCategoriesQuery(undefined, {
    skip: !workspace,
  });
  const categoriesData = categoriesRawData as any;

  const categories: string[] =
    categoriesData?.results?.map((c: any) => c.name || c) ||
    (Array.isArray(categoriesData) ? categoriesData : []);

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const createMutation = {
    isPending: isCreating,
    mutate: (payload: any) => {
      createProduct(payload)
        .unwrap()
        .then(() => {
          toast({ type: "success", title: "Product created successfully" });
          closeDialog();
        })
        .catch(() => toast({ type: "error", title: "Failed to create product" }));
    },
  };

  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const updateMutation = {
    isPending: isUpdating,
    mutate: ({ id, data }: { id: string; data: any }) => {
      updateProduct({ id, data })
        .unwrap()
        .then(() => {
          toast({ type: "success", title: "Product updated successfully" });
          closeDialog();
        })
        .catch(() => toast({ type: "error", title: "Failed to update product" }));
    },
  };

  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const deleteMutation = {
    isPending: isDeleting,
    mutate: (id: string) => {
      deleteProduct(id)
        .unwrap()
        .then(() => {
          toast({ type: "success", title: "Product deleted" });
          setShowDeleteConfirm(null);
        })
        .catch(() => toast({ type: "error", title: "Failed to delete product" }));
    },
  };

  const products: Product[] = data?.results || [];

  const openAdd = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setShowDialog(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || "",
      sku: product.sku || "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      category: product.category || "",
      description: product.description || "",
      is_available: product.is_available ?? true,
    });
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingProduct(null);
    setForm(emptyForm);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast({ type: "warning", title: "Product name is required" });
      return;
    }
    const payload = {
      ...form,
      price: parseFloat(form.price) || 0,
      stock: parseInt(form.stock) || 0,
      workspace_id: workspace?.id,
    };
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your product catalog and inventory
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {categories.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-44"
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="mb-4 h-32 w-full rounded-md" />
                <Skeleton className="mb-2 h-4 w-3/4" />
                <Skeleton className="mb-4 h-3 w-1/2" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={Package}
          title="Failed to load products"
          description="Something went wrong. Please try again."
        />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description={
            debouncedSearch || category
              ? "Try adjusting your filters."
              : "Get started by adding your first product."
          }
          action={
            !debouncedSearch &&
            !category && (
              <Button onClick={openAdd}>
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group flex flex-col transition-shadow hover:shadow-md"
            >
              <CardContent className="flex flex-1 flex-col p-4">
                {/* Image placeholder */}
                <div className="mb-4 flex h-32 items-center justify-center rounded-md bg-muted">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full rounded-md object-cover"
                    />
                  ) : (
                    <Package className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>

                <div className="flex flex-1 flex-col">
                  <h3 className="font-semibold text-foreground line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    SKU: {product.sku || "—"}
                  </p>
                  {product.category && (
                    <Badge variant="secondary" className="mt-2 w-fit">
                      {product.category}
                    </Badge>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-foreground">
                      {formatCurrency(product.price)}
                    </span>
                    <span
                      className={cn(
                        "text-sm",
                        (product.stock ?? 0) > 0
                          ? "text-muted-foreground"
                          : "text-destructive"
                      )}
                    >
                      {product.stock ?? 0} in stock
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <Badge
                      variant={product.is_available ? "success" : "secondary"}
                    >
                      {product.is_available ? "Available" : "Unavailable"}
                    </Badge>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setShowDeleteConfirm(product)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog
        open={showDialog}
        onClose={closeDialog}
        title={editingProduct ? "Edit Product" : "Add Product"}
        description={
          editingProduct
            ? "Update product information"
            : "Create a new product in your catalog"
        }
        className="max-w-xl"
        footer={
          <>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending
                ? "Saving..."
                : editingProduct
                ? "Save Changes"
                : "Create Product"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="prod-name">Name *</Label>
            <Input
              id="prod-name"
              placeholder="Product name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="prod-sku">SKU</Label>
              <Input
                id="prod-sku"
                placeholder="SKU-001"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prod-category">Category</Label>
              <Select
                id="prod-category"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prod-price">Price</Label>
              <Input
                id="prod-price"
                type="number"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prod-stock">Stock</Label>
              <Input
                id="prod-stock"
                type="number"
                placeholder="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prod-desc">Description</Label>
            <Textarea
              id="prod-desc"
              placeholder="Product description..."
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label htmlFor="prod-available">Available for sale</Label>
              <p className="text-xs text-muted-foreground">
                Make this product visible to customers
              </p>
            </div>
            <Switch
              checked={form.is_available}
              onChange={(checked) =>
                setForm({ ...form, is_available: checked })
              }
              aria-label="Available"
            />
          </div>
        </div>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Delete Product"
        description="This action cannot be undone."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                showDeleteConfirm && deleteMutation.mutate(showDeleteConfirm.id)
              }
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-foreground">
            {showDeleteConfirm?.name}
          </span>
          ? This will permanently remove it from your catalog.
        </p>
      </Dialog>
    </div>
  );
}
