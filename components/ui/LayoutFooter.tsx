"use client";
import { usePathname } from "next/navigation";

export default function LayoutFooter() {
  const pathname = usePathname();
  if (pathname === "/map") return null;
  return (
    <footer
      className="border-t px-4 py-5 text-center"
      style={{ borderColor: "var(--nc-border)" }}
    >
      <p className="te-label leading-relaxed">
        Noisecatcher — indicative readings only.{" "}
        <span style={{ color: "var(--nc-text-3)" }}>Not a certified instrument.</span>
      </p>
    </footer>
  );
}
