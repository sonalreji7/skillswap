"use client";
import { useLinkStatus } from "next/link";

export function NavigationHint({ label }: { label: string }) {
  const { pending } = useLinkStatus();
  return <span className="pointer-events-none absolute right-1 top-1 inline-flex size-2 items-center justify-center">
    <span aria-hidden="true" className={`size-2 rounded-full bg-current ${pending ? "motion-safe:animate-pulse" : "opacity-0"}`}/>
    {pending && <span role="status" className="sr-only">Opening {label}…</span>}
  </span>;
}
