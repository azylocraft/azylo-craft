"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronRight, KeyRound, LayoutDashboard, LogOut, MapPin, Package, UserRound, X, type LucideIcon } from "lucide-react";
import { DrawerPanel, Modal, Overlay } from "@/components/shop/Overlay";
import { Btn, H, P } from "@/components/ui/primitives";
import { firstName, useAuth, useAuthListener } from "@/lib/auth";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useUi } from "@/lib/ui-store";

/** Mounts the auth listener once and renders the account drawer (design screen 51). */
export function AccountDrawer() {
  useAuthListener();
  const open = useUi((s) => s.drawer === "account");
  const close = useUi((s) => s.close);
  if (!open) return null;
  return (
    <Overlay onClose={close} label="Account">
      <DrawerPanel>
        <Body onClose={close} />
      </DrawerPanel>
    </Overlay>
  );
}

function Body({ onClose }: { onClose: () => void }) {
  const { user, profile } = useAuth();
  const [confirm, setConfirm] = useState(false);
  const router = useRouter();
  const links: [LucideIcon, string, string][] = [
    [Package, "Orders", "/account"],
    [UserRound, "Account details", "/account?tab=profile"],
    [MapPin, "Addresses", "/account?tab=profile#addresses"],
    [KeyRound, "Reset your password", "/auth/forgot-password"],
  ];
  if (profile?.role === "admin") links.push([LayoutDashboard, "Admin panel", "/admin"]);
  return (
    <>
      <div className="flex items-center justify-between px-6 pb-4 pt-6">
        <H className="text-[28px]">Hi, {firstName(profile, user)}</H>
        <button type="button" aria-label="Close" onClick={onClose} className="flex size-10 items-center justify-center rounded-full border border-line bg-white">
          <X size={16} aria-hidden />
        </button>
      </div>
      <nav className="flex flex-col px-6">
        {links.map(([Icon, label, href]) => (
          <Link key={label} href={href} onClick={onClose} className="flex h-14 items-center gap-3 border-b border-line text-[15px] font-bold">
            <Icon size={18} className="text-gold" aria-hidden />
            <span className="flex-1">{label}</span>
            <ChevronRight size={16} className="text-faint" aria-hidden />
          </Link>
        ))}
        <button type="button" onClick={() => setConfirm(true)} className="flex h-14 items-center gap-3 text-left text-[15px] font-bold text-red">
          <LogOut size={18} aria-hidden />
          Log out
        </button>
      </nav>
      {confirm && (
        <ConfirmDialog
          title="Log out?"
          body="You'll need to log in again to see your orders and saved addresses."
          cta="Log out"
          onCancel={() => setConfirm(false)}
          onConfirm={async () => {
            await supabaseBrowser().auth.signOut();
            setConfirm(false);
            onClose();
            router.push("/");
            router.refresh();
          }}
        />
      )}
    </>
  );
}

export function ConfirmDialog({
  title,
  body,
  cta,
  onCancel,
  onConfirm,
  danger = true,
}: {
  title: string;
  body: string;
  cta: string;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  danger?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Overlay onClose={onCancel} label={title} className="z-[75]">
      <Modal className="max-w-[460px]">
        <div className="flex flex-col items-start gap-4">
          <span className={`flex size-[52px] items-center justify-center rounded-full ${danger ? "bg-red-soft text-red" : "bg-gold-soft text-gold"}`}>
            <LogOut size={20} aria-hidden />
          </span>
          <H className="text-[26px]">{title}</H>
          <P className="text-[14.5px]">{body}</P>
          <div className="mt-1 flex w-full gap-2.5">
            <Btn kind="light" full onClick={onCancel} data-autofocus>
              Cancel
            </Btn>
            <Btn
              full
              disabled={busy}
              className={danger ? "!border-red !bg-red" : undefined}
              onClick={async () => {
                setBusy(true);
                await onConfirm();
                setBusy(false);
              }}
            >
              {busy ? "…" : cta}
            </Btn>
          </div>
        </div>
      </Modal>
    </Overlay>
  );
}
