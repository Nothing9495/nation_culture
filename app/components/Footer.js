import MailSubscribe from "./MailSubscribe";

const socialItems = [
  { label: "in", href: "#" },
  { label: "gh", href: "#" },
  { label: "dr", href: "#" },
];

export default function Footer() {
  return (
    <footer className="border-t border-black/10 bg-gradient-to-r from-amber-50/80 via-white to-cyan-50/80 dark:border-white/15 dark:from-zinc-950 dark:via-black dark:to-zinc-900">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_auto_1fr] md:gap-6">
          <div className="w-full">
            <div className="flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-between">
              <div className="text-center md:text-left">
                <p className="text-xl font-semibold tracking-tight text-black dark:text-zinc-100">
                  云碑文萃
                </p>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  守护石上史诗，传承民族文脉。
                </p>
              </div>
              <div className="text-center md:text-right">
                <div className="flex items-center justify-center gap-3 md:justify-end">
                  {socialItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-xs font-semibold text-zinc-700 transition-colors hover:bg-black hover:text-white dark:border-white/20 dark:text-zinc-200 dark:hover:bg-zinc-100 dark:hover:text-black"
                      aria-label={`Social ${item.label}`}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
                <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                  Copyright 2026. All Rights Reserved.
                </p>
              </div>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="hidden h-28 w-px shrink-0 justify-self-center bg-black/20 md:block dark:bg-white/20"
          />
          <div className="flex justify-center md:justify-start">
            <div className="w-full max-w-xl">
              <MailSubscribe />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
