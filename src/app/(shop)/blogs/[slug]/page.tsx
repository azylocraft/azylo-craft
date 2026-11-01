import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/pages/ArticleView";
import { getArticle } from "@/lib/catalog";

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps<"/blogs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) return { title: "Page not found" };
  return {
    title: a.title.en ?? slug,
    description: a.excerpt.en ?? undefined,
    openGraph: { type: "article", title: a.title.en ?? slug, images: a.cover ? [a.cover] : undefined },
  };
}

export default async function ArticlePage({ params }: PageProps<"/blogs/[slug]">) {
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) notFound();
  return <ArticleView a={a} />;
}
