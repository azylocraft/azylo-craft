"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Camera, Check, PenLine, Star, X } from "lucide-react";
import { Field } from "@/components/product/ProductView";
import { Modal, Overlay } from "@/components/shop/Overlay";
import { Btn, H, P } from "@/components/ui/primitives";
import { firstName, useAuth } from "@/lib/auth";
import { supabaseBrowser } from "@/lib/supabase/client";

const MAX_PHOTOS = 4;

/** "Write a review" for customers who bought this product. Reviews are moderated before they appear. */
export function WriteReview({ productId, productName }: { productId: string; productName: string }) {
  const { user, profile } = useAuth();
  const [canReview, setCanReview] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabaseBrowser()
      .rpc("has_purchased", { p_product: productId })
      .then(({ data }) => setCanReview(data === true));
  }, [user, productId]);

  if (!user)
    return (
      <Link href={`/auth/login?next=${encodeURIComponent(typeof window !== "undefined" ? location.pathname : "/")}`} className="self-start text-sm font-bold underline">
        Bought this? Log in to write a review
      </Link>
    );
  if (!canReview) return null;
  return (
    <>
      <Btn kind="outline" iconL={PenLine} onClick={() => setOpen(true)} className="self-start">
        Write a review
      </Btn>
      {open && <ReviewForm productId={productId} productName={productName} defaultName={firstName(profile, user)} userId={user.id} onClose={() => setOpen(false)} />}
    </>
  );
}

function ReviewForm({ productId, productName, defaultName, userId, onClose }: { productId: string; productName: string; defaultName: string; userId: string; onClose: () => void }) {
  const sb = supabaseBrowser();
  const [rating, setRating] = useState(5);
  const [f, setF] = useState({ title: "", body: "", reason: "", name: defaultName, location: "" });
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (f.body.trim().length < 10) return setErr("Please write at least a sentence about your experience.");
    setErr(null);
    setState("busy");
    try {
      const photos: string[] = [];
      for (const file of files.slice(0, MAX_PHOTOS)) {
        if (file.size > 10 * 1024 * 1024) throw new Error(`${file.name} is over 10 MB.`);
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
        const path = `${userId}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
        const { error } = await sb.storage.from("review-media").upload(path, file, { contentType: file.type });
        if (error) throw new Error(error.message);
        photos.push(path);
      }
      const { error } = await sb.from("reviews").insert({
        product_id: productId,
        user_id: userId,
        rating,
        title: f.title.trim() || null,
        body: f.body.trim(),
        reason: f.reason.trim() || null,
        author_name: f.name.trim() || null,
        location: f.location.trim() || null,
        photos,
        verified: true,
        status: "pending",
        is_published: false,
      });
      if (error) throw new Error(error.message);
      setState("done");
    } catch (e2) {
      setErr((e2 as Error).message);
      setState("error");
    }
  };

  return (
    <Overlay onClose={onClose} label="Write a review">
      <Modal className="max-h-[92vh] max-w-[560px] overflow-y-auto">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <H className="text-[26px]">{state === "done" ? "Thank you!" : "Write a review"}</H>
            <p className="mt-1 text-sm text-muted">{productName}</p>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="flex size-10 flex-none items-center justify-center rounded-full border border-line">
            <X size={16} aria-hidden />
          </button>
        </div>
        {state === "done" ? (
          <div className="flex flex-col items-start gap-4">
            <span className="flex size-12 items-center justify-center rounded-full bg-green-soft text-green">
              <Check size={22} aria-hidden />
            </span>
            <P>Your review has been sent. It will appear on the product page once our team has checked it.</P>
            <Btn onClick={onClose}>Close</Btn>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <span className="text-xs font-bold text-ink2">Your rating</span>
              <div className="mt-1 flex gap-1" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} stars`} onClick={() => setRating(n)}>
                    <Star size={30} className={n <= rating ? "fill-gold text-gold" : "text-line"} aria-hidden />
                  </button>
                ))}
              </div>
            </div>
            <Field label="Headline (optional)">
              <input className="field" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={120} />
            </Field>
            <Field label="Your review">
              <textarea className="field h-28 resize-none" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} maxLength={2000} placeholder="Comfort, quality, delivery, how it fits your room…" />
            </Field>
            <Field label="Why did you buy it? (optional)">
              <input className="field" value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} maxLength={300} placeholder="e.g. Needed a sofa that becomes a bed for guests" />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name shown">
                <input className="field" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} maxLength={60} />
              </Field>
              <Field label="City (optional)">
                <input className="field" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} maxLength={60} />
              </Field>
            </div>
            <div>
              <span className="text-xs font-bold text-ink2">Photos (up to {MAX_PHOTOS})</span>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {files.map((file, i) => (
                  <span key={i} className="relative size-16 overflow-hidden rounded-lg">
                    <img src={URL.createObjectURL(file)} alt="" className="size-full object-cover" />
                    <button type="button" aria-label="Remove photo" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="absolute right-0.5 top-0.5 flex size-5 items-center justify-center rounded-full bg-white text-ink">
                      <X size={11} aria-hidden />
                    </button>
                  </span>
                ))}
                {files.length < MAX_PHOTOS && (
                  <button type="button" onClick={() => input.current?.click()} className="flex size-16 items-center justify-center rounded-lg border-2 border-dashed border-line text-muted hover:border-ink">
                    <Camera size={20} aria-hidden />
                  </button>
                )}
              </div>
              <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && setFiles([...files, ...e.target.files].slice(0, MAX_PHOTOS))} />
            </div>
            {err && <p role="alert" className="text-sm text-red">{err}</p>}
            <Btn type="submit" full size="lg" disabled={state === "busy"}>
              {state === "busy" ? "Sending…" : "Submit review"}
            </Btn>
          </form>
        )}
      </Modal>
    </Overlay>
  );
}
