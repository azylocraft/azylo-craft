"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { ArrowDown, ArrowRight, Info } from "lucide-react";
import { collectionHref, routes } from "@/lib/routes";

/* Sofa materials guide (editorial layout). Pictures live in /public/guide. */

const g = (n: string) => `/guide/${n}.webp`;
const WRAP = "mx-auto max-w-[1312px] px-4 md:px-12";

function Kicker({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span className={clsx("flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.2em]", dark ? "text-on-dark-muted" : "text-muted")}>
      <span aria-hidden className={clsx("h-px w-8", dark ? "bg-on-dark-faint" : "bg-faint")} />
      {children}
    </span>
  );
}

function Accent({ children }: { children: React.ReactNode }) {
  return <span className="font-display font-normal italic tracking-[-0.02em] text-[#A68A64]">{children}</span>;
}

function Head({ kicker, title, accent, sub, dark, stack }: { kicker: string; title: string; accent: string; sub: string; dark?: boolean; stack?: boolean }) {
  return (
    <div className="grid items-end gap-6 lg:grid-cols-[1fr_380px] lg:gap-16">
      <div className="flex flex-col gap-4">
        <Kicker dark={dark}>{kicker}</Kicker>
        <h2 className={clsx("text-[40px] font-extrabold leading-[1] tracking-[-0.045em] md:text-[64px]", dark && "text-white")}>
          {title}
          {stack ? <br /> : " "}
          <Accent>{accent}</Accent>
        </h2>
      </div>
      <p className={clsx("text-[14px] leading-[1.7]", dark ? "text-on-dark-muted" : "text-muted")}>{sub}</p>
    </div>
  );
}

function Pic({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={clsx("relative overflow-hidden bg-bg2", className)}>
      <img src={src} alt={alt} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
    </div>
  );
}

const TABS = [
  { k: "explore-upholstery", l: "Upholstery" },
  { k: "explore-frame", l: "Frame materials" },
  { k: "explore-support", l: "Seat support" },
  { k: "explore-cushioning", l: "Cushioning" },
  { k: "explore-inside", l: "Inside the sofa" },
  { k: "explore-before", l: "Before buying" },
];

const MATERIALS = [
  { n: "Bouclé", img: "sw-boucle", d: "A looped yarn surface with visible relief, so light catches tiny loops and creates soft micro-shadows.", rows: [["Surface", "Looped, raised relief"], ["Light", "Scattered micro-shadows"], ["Visual feel", "Textured and cosy"]] },
  { n: "Chenille", img: "sw-chenille", d: "A soft yarn with a short tufted pile that gives a gentle surface and subtle variation in tone.", rows: [["Surface", "Soft, lightly tufted"], ["Light", "Subtle variation"], ["Visual feel", "Warm and relaxed"]] },
  { n: "Velvet", img: "sw-velvet", d: "A dense cut pile with a direction, so the same colour looks lighter or deeper depending on the angle.", rows: [["Surface", "Dense directional pile"], ["Light", "Shifts with angle"], ["Visual feel", "Rich and deep"]] },
  { n: "Woven", img: "sw-woven", d: "A fabric where the yarn structure stays visible, giving a natural, crafted look.", rows: [["Surface", "Visible yarn structure"], ["Light", "Matte and even"], ["Visual feel", "Natural and textured"]] },
  { n: "Tight weave", img: "sw-tight", d: "A compact, closely woven construction with a fine, flat surface.", rows: [["Surface", "Fine and compact"], ["Light", "Low, uniform sheen"], ["Visual feel", "Neat and tailored"]] },
  { n: "Vegan leather", img: "sw-vegan", hero: "sofa-leather", swatch: "leather-swatch", d: "A non-textile upholstery surface with fine grain and a more continuous light response than woven or looped fabrics.", rows: [["Surface", "Smooth with fine grain"], ["Light", "More continuous highlights"], ["Visual feel", "Clean and uniform"]] },
];

const WOODS = [
  ["Solid wood", "wood-solid", "Material cut from continuous natural timber. Properties vary with species, grade, moisture, cross-section and grain direction.", "where it is used and how structural members are joined."],
  ["Plywood", "wood-ply", "A panel made from thin wood veneers bonded together. The exposed edge reveals the multiple layers that form the panel.", "thickness, veneer quality, voids and where the panel is used."],
  ["MDF", "wood-mdf", "An engineered panel made from wood fibers compressed with a binder to create a dense and relatively uniform structure.", "its location and whether that use is appropriate for the role of the component."],
  ["Particleboard", "wood-particle", "A panel made from wood particles bonded under pressure. Quality varies with density, thickness and panel formulation.", "placement, edge fastening and its actual structural role."],
];

const LAYERS = [
  ["Upholstery", "The visible and tactile outer surface."],
  ["Comfort wrap", "Fiber or batting that may soften the transition between upholstery and foam."],
  ["Back cushioning", "Foam, fiber or other combinations depending on design."],
  ["Seat foam", "May combine multiple layers for comfort and support."],
  ["Support system", "Springs, webbing or another system designed to support the seat."],
  ["Frame", "The structure that connects and supports the furniture as a whole."],
];

const SIX = [
  ["Upholstery composition", "A fabric family name does not always reveal fiber composition. Check the actual material content when provided."],
  ["Care requirements", "Check cleaning guidance and what is recommended for spills, stains and routine care."],
  ["Frame construction", "Do not stop at “solid wood.” Consider frame design, reinforcement and the other materials used with it."],
  ["Seat support system", "Springs, webbing or another solution: anchoring, spacing and specification matter as much as the category name."],
  ["Foam & firmness", "If density, firmness or layered construction details are provided, use them for a more meaningful comparison."],
  ["The exact product", "General illustrations never replace the specifications of the variant you are ordering. Review the individual product page before purchase."],
];

export function MaterialsGuide() {
  const [mat, setMat] = useState(MATERIALS.length - 1);
  const m = MATERIALS[mat];
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#2b2724] text-white">
        <div className="absolute inset-y-0 right-0 w-full md:w-[62%]">
          <img src={g("hero")} alt="" fetchPriority="high" className="absolute inset-0 size-full object-cover" />
        </div>
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,#2b2724_0%,#2b2724_30%,rgba(43,39,36,.55)_48%,rgba(43,39,36,0)_72%)]" />
        <div className={clsx(WRAP, "relative flex min-h-[640px] flex-col justify-center gap-7 py-20 md:min-h-[820px]")}>
          <Kicker dark>AZYLO materials guide</Kicker>
          <h1 className="max-w-[640px] text-[54px] font-extrabold leading-[0.95] tracking-[-0.05em] md:text-[100px]">
            A sofa is more than
            <span className="block font-display font-normal italic tracking-[-0.03em] text-cream">the fabric you touch.</span>
          </h1>
          <p className="max-w-[680px] text-[16px] leading-[1.7] text-on-dark md:text-[19px]">See how upholstery, cushioning, support and frame construction work together — and learn which details are worth checking before choosing a sofa.</p>
          <div className="flex flex-wrap gap-3">
            <a href="#explore-upholstery" className="inline-flex h-[52px] items-center gap-3 rounded-full bg-white px-7 text-sm font-bold text-ink">
              Compare upholstery <ArrowDown size={15} aria-hidden />
            </a>
            <a href="#explore-inside" className="inline-flex h-[52px] items-center rounded-full border border-white/30 px-7 text-sm font-bold hover:border-white">
              Look inside the sofa
            </a>
          </div>
          <p className="flex max-w-[680px] gap-2.5 text-[11.5px] leading-[1.6] text-on-dark-muted">
            <Info size={15} className="mt-0.5 flex-none" aria-hidden />
            Visuals in this guide are representative educational illustrations. Exact materials, components and specifications vary by model. Always refer to the individual product page for the product you are considering.
          </p>
        </div>
      </section>

      {/* Explore bar */}
      <div className="sticky top-[60px] z-20 border-b border-line2 bg-bg md:top-[136px]">
        <nav className={clsx(WRAP, "flex items-center gap-8 overflow-x-auto")}>
          <span className="text-[10.5px] font-semibold uppercase tracking-[.2em] text-faint">Explore</span>
          {TABS.map((t) => (
            <a key={t.k} href={`#${t.k}`} className="flex h-14 flex-none items-center whitespace-nowrap text-[13px] font-bold text-ink2 hover:text-ink">
              {t.l}
            </a>
          ))}
        </nav>
      </div>

      {/* Start here */}
      <section className="bg-cream">
        <div className={clsx(WRAP, "grid gap-10 py-20 md:py-28 lg:grid-cols-[1.2fr_1fr] lg:gap-24")}>
          <div className="flex flex-col gap-6">
            <Kicker>Start here</Kicker>
            <p className="font-display text-[32px] leading-[1.25] text-ink md:text-[46px]">A material name alone does not determine the quality of a sofa.</p>
          </div>
          <div className="flex flex-col gap-5 text-[14.5px] leading-[1.75] text-muted lg:pt-10">
            <p>Two sofas can use materials with the same general name and still be very different. Composition, thickness, density, weave, material placement, joints and overall construction all matter.</p>
            <p>This guide is designed to help you understand what you can see — and the questions worth asking about what you cannot.</p>
            <p className="border-t border-line pt-6 text-[12.5px]">
              <b className="text-ink">Important principle:</b> no material is automatically “premium” simply because of its name.
            </p>
          </div>
        </div>
      </section>

      {/* 01 Upholstery */}
      <section id="explore-upholstery" className={clsx(WRAP, "scroll-mt-48 py-20 md:py-28")}>
        <Head kicker="01 · Upholstery" title="Same sofa." accent="Different material." sub="Compare surfaces on the same sofa silhouette so changes in furniture design do not distract from the material itself." />
        <div role="tablist" className="mt-10 flex flex-wrap gap-2">
          {MATERIALS.map((x, i) => (
            <button key={x.n} role="tab" type="button" aria-selected={i === mat} onClick={() => setMat(i)} className={clsx("h-10 rounded-full border px-4 text-[12.5px] font-bold", i === mat ? "border-ink bg-ink text-white" : "border-line bg-white text-ink2 hover:border-ink")}>
              {x.n}
            </button>
          ))}
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.8fr_1fr]">
          <div className="relative">
            <Pic src={g(m.hero ?? m.img)} alt={`${m.n} upholstery`} className="aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[560px]" />
            <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.12em]">{m.n}</span>
          </div>
          <div className="flex flex-col bg-white">
            <Pic src={g(m.swatch ?? m.img)} alt={`${m.n} close-up`} className="aspect-[16/10]" />
            <div className="flex flex-col gap-5 p-7 md:p-9">
              <h3 className="text-[34px] font-extrabold tracking-[-0.03em]">{m.n}</h3>
              <p className="text-[13.5px] leading-[1.7] text-muted">{m.d}</p>
              <dl className="border-t border-line2">
                {m.rows.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[110px_1fr] border-b border-line2 py-3.5 text-[12.5px]">
                    <dt className="text-[10px] font-semibold uppercase tracking-[.14em] text-faint">{k}</dt>
                    <dd className="font-bold text-ink2">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="flex gap-2.5 text-[11.5px] leading-[1.6] text-muted">
                <Info size={15} className="mt-0.5 flex-none text-gold" aria-hidden />
                Verify: exact composition, backing, care instructions and supplied flex or abrasion information when available.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Same colour */}
      <section className="bg-cream">
        <div className={clsx(WRAP, "py-20 md:py-28")}>
          <Head kicker="See the difference" title="Same color." accent="Different result." sub="Texture, pile, grain and surface reflectivity can substantially change how the same nominal color appears." />
          <div className="mt-12 grid gap-4 lg:grid-cols-[1.65fr_1fr_1fr]">
            <Pic src={g("same-colour")} alt="The same colour in different textures" className="aspect-[4/3] lg:aspect-auto lg:min-h-[556px]" />
            {[["pillows", "02", "Texture vs smoothness", "Loops create stronger micro-shadows; smoother surfaces read more uniformly."], ["blocks", "03", "Light response", "Matte woven fabric, chenille and velvet do not return light in the same way."]].map(([img, n, t, d]) => (
              <div key={n} className="flex flex-col bg-white">
                <Pic src={g(img)} alt={t} className="aspect-[4/3]" />
                <div className="flex flex-col gap-2 p-6">
                  <span className="text-[10px] text-faint">{n}</span>
                  <h3 className="text-[19px] font-extrabold tracking-[-0.01em]">{t}</h3>
                  <p className="text-[12.5px] leading-[1.6] text-muted">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grazing light */}
      <section className="bg-dark text-white">
        <div className={clsx(WRAP, "py-20 md:py-28")}>
          <Head dark stack kicker="Under grazing light" title="Light reveals" accent="what color can hide." sub="Side lighting makes loops, pile direction, weave structure and surface grain easier to see." />
          <div className="mt-12 grid gap-px bg-dark-line sm:grid-cols-2 lg:grid-cols-3">
            {MATERIALS.map((x) => (
              <div key={x.n} className="bg-dark2">
                <Pic src={g(x.img)} alt={`${x.n} under side light`} className="aspect-[4/3]" />
                <div className="px-5 py-4">
                  <div className="text-[14px] font-extrabold">{x.n}</div>
                  <div className="text-[11.5px] text-on-dark-muted">{x.rows[0][1]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 02 Frame materials */}
      <section id="explore-frame" className={clsx(WRAP, "scroll-mt-48 py-20 md:py-28")}>
        <Head stack kicker="02 · Frame materials" title="Look beyond" accent="the word “wood.”" sub="Solid wood, plywood and engineered panels are different material categories. Their suitability depends on quality, thickness, placement and how the frame is designed." />
        <div className="mt-12 grid border border-line2 sm:grid-cols-2 lg:grid-cols-4">
          {WOODS.map(([t, img, d, v], i) => (
            <div key={t} className="flex flex-col border-line2 bg-white sm:[&:not(:last-child)]:border-r">
              <Pic src={g(img)} alt={t} className="aspect-square" />
              <div className="flex flex-1 flex-col gap-2 p-6">
                <span className="text-[10px] text-faint">0{i + 1}</span>
                <h3 className="text-[19px] font-extrabold">{t}</h3>
                <p className="text-[12.5px] leading-[1.65] text-muted">{d}</p>
                <p className="mt-auto border-t border-line2 pt-4 text-[11px] text-muted">
                  <b className="text-ink">Verify:</b> {v}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Frame construction */}
      <section className="bg-cream">
        <div className={clsx(WRAP, "py-20 md:py-28")}>
          <Head stack kicker="Frame construction" title="Material matters." accent="So does construction." sub="Rails, reinforcement, connection points and the way loads move through the frame can matter as much as the material name itself." />
          <div className="mt-12 grid gap-4 lg:grid-cols-[2.1fr_1fr]">
            {[["frame", "01", "Frame structure", "Representative example showing rails, uprights and reinforcement before cushioning is added."], ["joint", "02", "Reinforced joint", "Higher-stress connection points may use additional reinforcement depending on the frame design."]].map(([img, n, t, d]) => (
              <div key={n} className="relative">
                <Pic src={g(img)} alt={t} className="aspect-[4/3] lg:aspect-auto lg:h-[540px]" />
                <div className="absolute inset-x-4 bottom-4 bg-white/95 p-5">
                  <span className="text-[10px] text-faint">{n}</span>
                  <h3 className="mt-1 text-[19px] font-extrabold">{t}</h3>
                  <p className="mt-1 text-[11.5px] leading-[1.6] text-muted">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03 Seat support */}
      <section id="explore-support" className="scroll-mt-48 bg-dark text-white">
        <div className={clsx(WRAP, "py-20 md:py-28")}>
          <Head dark stack kicker="03 · Seat support" title="Beneath the foam," accent="something carries the load." sub="Sinuous springs and webbing are two common approaches. The system name alone does not determine quality." />
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {[["springs", "01 · Sinuous springs", "Sinuous springs", "S-shaped steel wires span the seat between frame rails. Performance depends on factors such as wire gauge, spacing, clips and the surrounding frame design.", "Look at: spacing consistency, anchoring and integration with the frame."], ["webbing", "02 · Webbing", "Webbing support", "Bands are tensioned and interlaced across the frame. Webbing material, tension, spacing and anchoring influence how the system behaves.", "Webbing is not automatically inferior to springs — the complete specification matters."]].map(([img, k, t, d, f]) => (
              <div key={k} className="flex flex-col bg-dark2">
                <Pic src={g(img)} alt={t} className="aspect-[16/10]" />
                <div className="flex flex-col gap-3 p-7">
                  <span className="text-[10px] font-semibold uppercase tracking-[.14em] text-gold-bright">{k}</span>
                  <h3 className="text-[24px] font-extrabold">{t}</h3>
                  <p className="text-[12.5px] leading-[1.7] text-on-dark-muted">{d}</p>
                  <p className="border-t border-dark-line pt-4 text-[11.5px] text-on-dark">{f}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 04 Cushioning */}
      <section id="explore-cushioning" className={clsx(WRAP, "scroll-mt-48 py-20 md:py-28")}>
        <Head stack kicker="04 · Cushioning" title="Comfort is not" accent="one block of foam." sub="Final feel depends on how cushioning layers, thickness, firmness and the support system work together." />
        <div className="mt-12 grid items-start gap-4 lg:grid-cols-[1fr_1.67fr]">
          {[["foam", "HR foam", "“HR” is commonly used for high-resilience flexible polyurethane foam. The term does not replace specifications such as density or firmness when those values are needed to compare products.", "Representative illustration — not a density specification.", "aspect-[4/3]"], ["cushion", "Layered seat cushion", "A seat cushion may combine upholstery, batting or fiber wrap, a softer comfort layer and firmer support foam. Exact constructions vary by model.", "More layers do not automatically mean higher quality; specification and purpose matter.", "aspect-[16/10]"]].map(([img, t, d, f, a]) => (
            <div key={t} className="flex flex-col bg-white">
              <Pic src={g(img)} alt={t} className={a} />
              <div className="flex flex-col gap-3 p-7">
                <h3 className="text-[22px] font-extrabold">{t}</h3>
                <p className="text-[12.5px] leading-[1.7] text-muted">{d}</p>
                <p className="border-t border-line2 pt-4 text-[10.5px] text-faint">{f}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 05 Inside the sofa */}
      <section id="explore-inside" className="scroll-mt-48 bg-cream">
        <div className={clsx(WRAP, "py-20 md:py-28")}>
          <Head stack kicker="05 · Inside the sofa" title="What you touch depends" accent="on everything beneath it." sub="This exploded view illustrates a general construction logic. An actual sofa may use a different combination of layers and components." />
          <div className="mt-12 grid items-center gap-10 lg:grid-cols-[1.9fr_1fr]">
            <Pic src={g("exploded")} alt="Exploded view of sofa layers" className="aspect-[5/3]" />
            <ol className="border-t border-line">
              {LAYERS.map(([t, d], i) => (
                <li key={t} className="grid grid-cols-[48px_1fr] border-b border-line py-5">
                  <span className="text-[10px] text-faint">0{i + 1}</span>
                  <span>
                    <span className="block text-[14px] font-bold">{t}</span>
                    <span className="block text-[11.5px] text-muted">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Six details */}
      <section id="explore-before" className={clsx(WRAP, "scroll-mt-48 py-20 md:py-28")}>
        <Head kicker="Before you choose" title="Six details" accent="worth checking." sub="A beautiful photograph shows you the design. These questions help you understand the product." />
        <div className="mt-12 grid border-l border-t border-line2 sm:grid-cols-2 lg:grid-cols-3">
          {SIX.map(([t, d], i) => (
            <div key={t} className="flex min-h-[220px] flex-col gap-3 border-b border-r border-line2 p-7">
              <span className="text-[10px] text-faint">0{i + 1}</span>
              <h3 className="mt-auto text-[19px] font-extrabold">{t}</h3>
              <p className="text-[12.5px] leading-[1.65] text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#EDE7DC]">
        <div className={clsx(WRAP, "flex flex-col items-center gap-6 py-24 text-center md:py-32")}>
          <Kicker>Choose with clarity</Kicker>
          <h2 className="text-[42px] font-extrabold leading-[1] tracking-[-0.045em] md:text-[76px]">
            See the design.
            <span className="block">
              <Accent>Understand what is behind it.</Accent>
            </span>
          </h2>
          <p className="max-w-[640px] text-[14.5px] leading-[1.7] text-muted">If you are deciding between upholstery options or want to understand the materials used in a specific model, our team can help you review the relevant information before ordering.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={collectionHref("all")} className="inline-flex h-[52px] items-center gap-3 rounded-full bg-ink px-7 text-sm font-bold text-white">
              Explore sofas <ArrowRight size={15} aria-hidden />
            </Link>
            <Link href={routes.contact} className="inline-flex h-[52px] items-center rounded-full border border-line bg-white/60 px-7 text-sm font-bold">
              Ask about materials
            </Link>
          </div>
          <p className="mt-6 max-w-[780px] border-t border-line pt-6 text-[10.5px] leading-[1.6] text-faint">EDUCATIONAL GUIDE — Images illustrate representative material categories and construction approaches. They should not be interpreted as documentary photographs of the internal construction of every AZYLO product. Composition, color, frame construction, cushioning, support systems and other specifications can vary by model, variant and production. The applicable individual product information should always be used when making a purchase decision.</p>
        </div>
      </section>
    </>
  );
}
