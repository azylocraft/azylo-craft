/**
 * Shop copy for each upholstery material in the product page material picker.
 * Keyed by the material name used in Admin → Variants & pricing (the variant "model").
 * Ratings are 1–5. Textures live in public/materials/ (scripts/generate-material-textures.mjs).
 */
export type MaterialInfo = {
  badge: string;
  tagline: string;
  why: string;
  texture: string;
  durability: number;
  softness: number;
  care: number;
};

export const MATERIAL_INFO: Record<string, MaterialInfo> = {
  "Performance Fabric (PF)": {
    badge: "Best value",
    tagline: "Kid and pet friendly",
    why: "A tightly woven, stain-resistant fabric that shrugs off spills, paws and everyday wear. The easiest choice for busy homes.",
    texture: "/materials/performance-fabric.webp",
    durability: 5,
    softness: 3,
    care: 5,
  },
  Linen: {
    badge: "Breathable",
    tagline: "Natural, airy weave",
    why: "A natural, breathable weave that stays cool in warm weather and softens with every use. A relaxed, lived-in look.",
    texture: "/materials/linen.webp",
    durability: 3,
    softness: 4,
    care: 3,
  },
  "Half Leather (Leather Match)": {
    badge: "Smart pick",
    tagline: "Leather seat, matched sides",
    why: "Real leather where you sit and touch, with a closely matched material on the sides and back — the leather look and feel for less.",
    texture: "/materials/half-leather.webp",
    durability: 4,
    softness: 3,
    care: 4,
  },
  Velvet: {
    badge: "Most loved",
    tagline: "Rich, soft pile",
    why: "A dense, soft pile that catches the light and feels plush to sink into. Best for living rooms with light to moderate use.",
    texture: "/materials/velvet.webp",
    durability: 3,
    softness: 5,
    care: 2,
  },
  Bouclé: {
    badge: "Trending",
    tagline: "Cosy, looped texture",
    why: "Looped yarn with a soft, nubby surface and a warm, sculptural look. Cosy to touch and a statement in any room.",
    texture: "/materials/boucle.webp",
    durability: 3,
    softness: 4,
    care: 2,
  },
  "Full Leather": {
    badge: "Premium",
    tagline: "Top-grain, ages beautifully",
    why: "Top-grain leather on every surface. It wipes clean, lasts for years and develops a richer character as it ages.",
    texture: "/materials/full-leather.webp",
    durability: 5,
    softness: 3,
    care: 4,
  },
};

/** Short display name, e.g. "Performance Fabric (PF)" → "Performance fabric". */
export const materialLabel = (name: string) => {
  const s = name.replace(/\s*\(.*?\)\s*/g, "").trim();
  return s.charAt(0) + s.slice(1).toLowerCase();
};
