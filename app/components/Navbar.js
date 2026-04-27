"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { key: "home", label: "主页", href: "/#home" },
  { key: "database", label: "碑刻数据库", href: "/sub_pages/stele-database" },
  { key: "about", label: "关于我们", href: "/sub_pages/about-page" },
];

export default function Navbar() {
  const pathname = usePathname();
  const hasMountedRef = useRef(false);
  const [activeSection, setActiveSection] = useState("home");
  const [scrollY, setScrollY] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const activeLink = pathname === "/" ? activeSection : pathname === "/sub_pages/stele-database" ? "database" : pathname === "/sub_pages/about-page" ? "about" : "home";
  const scrolled = pathname !== "/" || scrollY > 50;

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY);

      if (pathname !== "/") {
        return;
      }

      const sections = document.querySelectorAll("section[id]");
      let current = "home";

      sections.forEach((section) => {
        const top = section.offsetTop - 120;
        const bottom = top + section.offsetHeight;
        if (window.scrollY >= top && window.scrollY < bottom) {
          current = section.id;
        }
      });

      setActiveSection(current);
    };

    window.addEventListener("scroll", onScroll);
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const onUpdateActiveLink = (value) => {
    if (pathname === "/") {
      setActiveSection(value);
    }
    setExpanded(false);
  };

  return (
    <header
      className={[
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-black/10 bg-white/90 shadow-sm backdrop-blur-md dark:border-white/15 dark:bg-black/80"
          : "border-transparent bg-gradient-to-r from-amber-50 via-white to-cyan-50 dark:from-zinc-950 dark:via-black dark:to-zinc-900",
      ].join(" ")}
    >
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="#home"
          onClick={() => onUpdateActiveLink("home")}
          className="text-lg font-semibold tracking-tight text-black dark:text-zinc-100"
        >
          云碑文萃
        </Link>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/15 text-black md:hidden dark:border-white/20 dark:text-zinc-100"
          aria-label="菜单"
          aria-expanded={expanded}
          onClick={() => setExpanded((prev) => !prev)}
        >
          <span className="text-xl leading-none">{expanded ? "X" : "="}</span>
        </button>

        <div
          className={[
            "absolute left-0 right-0 top-full border-b border-black/10 bg-white/95 px-6 pb-5 pt-3 backdrop-blur-md md:static md:flex md:items-center md:gap-6 md:border-0 md:bg-transparent md:p-0",
            expanded ? "block" : "hidden md:flex",
            "dark:border-white/15 dark:bg-black/90 md:dark:bg-transparent",
          ].join(" ")}
        >
          <ul className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
            {navItems.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  onClick={() => onUpdateActiveLink(item.key)}
                  className={[
                    "inline-flex rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                    activeLink === item.key
                      ? "bg-black text-white dark:bg-zinc-100 dark:text-black"
                      : "text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-zinc-100",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
