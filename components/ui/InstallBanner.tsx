"use client";

import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";

type Platform = "android" | "ios" | "desktop" | null;

const STORAGE_KEY = "nc_install_dismissed";

function detectPlatform(): Platform {
  if (typeof window === "undefined") return null;
  const ua = navigator.userAgent;
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true);
  if (isStandalone) return null; // already installed
  if (/iPhone|iPad|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export default function InstallBanner() {
  const [platform] = useState<Platform>(() => {
    if (typeof window === "undefined") return null;
    if (localStorage.getItem(STORAGE_KEY)) return null;
    return detectPlatform();
  });
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!platform) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    if (platform === "ios") {
      const timer = setTimeout(() => setVisible(true), 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", onPrompt);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, [platform]);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") dismiss();
    else setInstallPrompt(null);
  }

  if (!visible || !platform) return null;

  return (
    <div
      className="fixed bottom-16 sm:bottom-4 left-0 right-0 mx-auto z-50 max-w-sm px-3"
    >
      <div
        className="rounded-xl px-4 py-3 flex items-center gap-3 shadow-2xl"
        style={{
          background: "var(--nc-bg-raised)",
          border: "1px solid var(--nc-border-mid)",
        }}
      >
        <div
          className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
          style={{ background: "var(--nc-text)" }}
        >
          <Download className="w-4 h-4" style={{ color: "var(--nc-bg)" }} />
        </div>

        <div className="flex-1 min-w-0">
          {platform === "ios" ? (
            <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
              <span className="font-semibold nc-text">Add to home screen: </span>
              tap <Share className="w-3 h-3 inline mx-0.5 -mt-0.5" aria-hidden="true" /> then{" "}
              <strong className="nc-text">Add to Home Screen</strong>
            </p>
          ) : (
            <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
              <span className="font-semibold nc-text">Install Noisecatcher</span>
              {" "}— works offline, adds to home screen
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {platform !== "ios" && installPrompt && (
            <button
              onClick={install}
              className="px-2.5 py-1.5 min-h-[44px] rounded-lg text-xs font-semibold transition-colors"
              style={{
                background: "var(--nc-text)",
                color: "var(--nc-bg)",
                fontFamily: "var(--font-display)",
              }}
            >
              Install
            </button>
          )}
          <button
            onClick={dismiss}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded transition-colors"
            style={{ color: "var(--nc-text-3)" }}
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
