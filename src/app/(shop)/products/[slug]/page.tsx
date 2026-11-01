import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductView } from "@/components/product/ProductView";
import { getProduct, listFaqs, productSocialProof, relatedProducts } from "@/lib/catalog";

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return { title: "Page not found" };
  const title = p.name.en ?? slug;
  return {
    title,
    description: p.shortDescription.en ?? undefined,
    openGraph: { title, type: "website", images: p.image ? [p.image] : undefined },
  };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const [related, faqs, proof] = await Promise.all([relatedProducts(product), listFaqs(), productSocialProof(product.id)]);
  Object.assign(product, proof);
  return <ProductView product={product} related={related} faqs={faqs} />;
}
