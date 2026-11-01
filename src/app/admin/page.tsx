"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { AdminTitle } from "@/components/admin/AdminShell";
import { Badge, Btn } from "@/components/ui/primitives";
import { mediaUrl } from "@/lib/media";
import { supabaseBrowser } from "@/lib/supabase/client";

type Row = {
  id: string; slug: string; name_en: string | null; is_published: boolean; is_best_seller: boolean; is_new: boolean; is_featured: boolean; is_demo: boolean;
  product_variants: { price_cad: number | null; stock: number | null }[];
  product_images: { storage_path: string; sort_order: number; image_type: string }[];
};

/** Products list (design screen 85). */
export default function AdminProducts() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);
  useEffect(() => {
    supabaseBrowser()
      .from("products")
      .select("id, slug, name_en, is_published, is_best_seller, is_new, is_featured, is_demo, product_variants ( price_cad, stock ), product_images ( storage_path, sort_order, image_type )")
      .order("sort_order")
      .then(({ data }) => setRows((data as Row[]) ?? []));
  }, []);
  const shown = useMemo(() => (rows ?? []).filter((r) => `${r.name_en} ${r.slug}`.toLowerCase().includes(q.toLowerCase())), [rows, q]);

  const create = async () => {
    setCreating(true);
    const slug = `new-product-${Date.now().toString(36)}`;
    const { data, error } = await supabaseBrowser().from("products").insert({ slug, name_en: "New product", is_published: false, lead_time_min_days: 45, lead_time_max_days: 55 }).select("id").single();
    setCreating(false);
    if (error) return alert(error.message);
    router.push(`/admin/products/${data.id}`);
  };

  return (
    <>
      <AdminTitle title="Products" sub={rows ? `${rows.length} products` : "Loading…"} actions={<Btn iconL={Plus} onClick={create} disabled={creating}>New product</Btn>} />
      <label className="mb-4 flex h-12 max-w-[420px] items-center gap-3 rounded-full border border-line bg-white px-5">
        <Search size={16} className="text-muted" aria-hidden />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className="min-w-0 flex-1 bg-transparent text-sm outline-none" aria-label="Search products" />
      </label>
      <div className="overflow-x-auto rounded-block border border-line2 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-line text-left text-xs uppercase tracking-[.1em] text-muted">
            <tr>
              <th className="p-4">Product</th><th className="p-4">Price from</th><th className="p-4">Variants</th><th className="p-4">Stock</th><th className="p-4">Photos</th><th className="p-4">Flags</th>
            </tr>
          </thead>
          <tbody>
            {rows === null &&
              Array.from({ length: 6 }, (_, i) => (
                <tr key={i}><td colSpan={6} className="p-4"><div className="az-skeleton h-10 rounded-lg" /></td></tr>
              ))}
            {shown.map((r) => {
              const prices = r.product_variants.filter((v) => v.price_cad != null).map((v) => Number(v.price_cad));
              const stock = r.product_variants.some((v) => v.stock == null) ? "Made to order" : String(r.product_variants.reduce((n, v) => n + (v.stock ?? 0), 0));
              const img = [...r.product_images].sort((a, b) => a.sort_order - b.sort_order)[0];
              return (
                <tr key={r.id} className="border-b border-line2 last:border-0 hover:bg-bg2">
                  <td className="p-3">
                    <Link href={`/admin/products/${r.id}`} className="flex items-center gap-3">
                      {img ? <img src={mediaUrl(img.storage_path)!} alt="" className="size-12 rounded-lg object-cover" /> : <span className="size-12 rounded-lg bg-cream" />}
                      <span>
                        <b className="line-clamp-1">{r.name_en ?? "MISSING: name"}</b>
                        <span className="text-xs text-muted">/{r.slug}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="p-4">{prices.length ? `$${Math.min(...prices).toFixed(2)}` : <span className="text-red">MISSING</span>}</td>
                  <td className="p-4">{r.product_variants.length}</td>
                  <td className="p-4">{stock}</td>
                  <td className="p-4">{r.product_images.length}</td>
                  <td className="flex flex-wrap gap-1 p-4">
                    {!r.is_published && <Badge tone="grey">Draft</Badge>}
                    {r.is_featured && <Badge tone="dark">Featured</Badge>}
                    {r.is_best_seller && <Badge>Best seller</Badge>}
                    {r.is_new && <Badge tone="blue">New</Badge>}
                    {r.is_demo && <Badge tone="red">Demo</Badge>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
