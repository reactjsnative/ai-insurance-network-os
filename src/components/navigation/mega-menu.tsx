"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Menu,
  Sparkles,
  X,
} from "lucide-react";

import {
  megaMenuCategories,
  type MegaMenuCategory,
} from "./menu-data";

export default function MegaMenu() {
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState(
    megaMenuCategories[0].id
  );

  const navigationRef = useRef<HTMLElement>(null);

  const activeCategory: MegaMenuCategory =
    megaMenuCategories.find(
      (category) => category.id === activeCategoryId
    ) ?? megaMenuCategories[0];

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        navigationRef.current &&
        !navigationRef.current.contains(event.target as Node)
      ) {
        setDesktopOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDesktopOpen(false);
        setMobileOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      ref={navigationRef}
      className="relative z-50 border-b border-slate-200 bg-white"
    >
      <nav
        className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5"
        aria-label="เมนูหลัก"
      >
        <a href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-slate-900">
            <Sparkles className="h-5 w-5" />
          </span>

          <span className="text-xl font-bold text-slate-900">
            ชื่อแบรนด์
          </span>
        </a>

        <div className="hidden h-full items-center gap-8 lg:flex">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={desktopOpen}
            aria-controls="products-mega-menu"
            onClick={() => setDesktopOpen((current) => !current)}
            className={`flex h-full items-center gap-2 border-b-2 px-1 font-medium transition ${
              desktopOpen
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-700 hover:text-blue-600"
            }`}
          >
            เมนู
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                desktopOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <a
            href="/about"
            className="font-medium text-slate-700 hover:text-blue-600"
          >
            เกี่ยวกับเรา
          </a>

          <a
            href="/contact"
            className="font-medium text-slate-700 hover:text-blue-600"
          >
            ติดต่อเรา
          </a>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="/login"
            className="rounded-full px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-100"
          >
            เข้าสู่ระบบ
          </a>

          <a
            href="/register"
            className="rounded-full bg-blue-600 px-6 py-2.5 font-medium text-slate-900 hover:bg-blue-700"
          >
            เริ่มต้นใช้งาน
          </a>
        </div>

        <button
          type="button"
          aria-label="เปิดเมนู"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
      </nav>

      {desktopOpen && (
        <>
          <button
            type="button"
            aria-label="ปิดเมนู"
            onClick={() => setDesktopOpen(false)}
            className="fixed inset-0 top-20 z-40 hidden cursor-default bg-white/50 backdrop-blur-[2px] lg:block"
          />

          <section
            id="products-mega-menu"
            role="menu"
            aria-label="รายการเมนู"
            className="absolute left-1/2 top-[92px] z-50 hidden w-[min(94vw,1400px)] -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl lg:block"
          >
            <div className="grid min-h-[520px] grid-cols-[320px_1fr]">
              <aside className="border-r border-slate-200 bg-slate-50 p-7">
                <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-slate-700">
                  หมวดหมู่
                </p>

                <div className="space-y-2">
                  {megaMenuCategories.map((category) => {
                    const Icon = category.icon;
                    const selected =
                      category.id === activeCategoryId;

                    return (
                      <button
                        key={category.id}
                        type="button"
                        onMouseEnter={() =>
                          setActiveCategoryId(category.id)
                        }
                        onFocus={() =>
                          setActiveCategoryId(category.id)
                        }
                        onClick={() =>
                          setActiveCategoryId(category.id)
                        }
                        className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                          selected
                            ? "bg-blue-100 text-blue-700"
                            : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                        }`}
                      >
                        <span
                          className={`grid h-10 w-10 place-items-center rounded-full ${
                            selected
                              ? "bg-blue-600 text-slate-900"
                              : "bg-white text-slate-700"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </span>

                        <span className="flex-1 font-medium">
                          {category.title}
                        </span>

                        <ChevronRight className="h-4 w-4" />
                      </button>
                    );
                  })}
                </div>
              </aside>

              <main className="p-8">
                <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-white via-blue-950 to-blue-600 p-8 text-white">
                  <div className="relative z-10 max-w-2xl">
                    <p className="mb-3 text-sm font-medium text-blue-700">
                      {activeCategory.title}
                    </p>

                    <h2 className="text-3xl font-bold">
                      {activeCategory.heading}
                    </h2>

                    <p className="mt-3 leading-7 text-slate-700">
                      {activeCategory.description}
                    </p>

                    <a
                      href={`/category/${activeCategory.id}`}
                      className="mt-6 inline-flex items-center gap-2 font-semibold hover:text-blue-700"
                    >
                      ดูทั้งหมด
                      <ChevronRight className="h-4 w-4" />
                    </a>
                  </div>

                  <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-white/10" />
                  <div className="absolute right-20 top-8 h-32 w-32 rounded-full bg-blue-300/10" />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  {activeCategory.links.map((link) => {
                    const Icon = link.icon;

                    return (
                      <a
                        key={link.href}
                        href={link.href}
                        role="menuitem"
                        className="group flex gap-4 rounded-xl border border-transparent p-4 transition hover:border-blue-100 hover:bg-blue-50"
                      >
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-blue-600 group-hover:text-slate-900">
                          <Icon className="h-5 w-5" />
                        </span>

                        <span>
                          <span className="flex items-center gap-1 font-semibold text-slate-900 group-hover:text-blue-700">
                            {link.title}
                            <ChevronRight className="h-4 w-4 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
                          </span>

                          <span className="mt-1 block text-sm leading-6 text-slate-700">
                            {link.description}
                          </span>
                        </span>
                      </a>
                    );
                  })}
                </div>
              </main>
            </div>
          </section>
        </>
      )}

      {mobileOpen && (
        <div className="fixed inset-0 z-[70] bg-white lg:hidden">
          <div className="flex h-20 items-center justify-between border-b px-5">
            <span className="text-xl font-bold text-slate-900">
              ชื่อแบรนด์
            </span>

            <button
              type="button"
              aria-label="ปิดเมนู"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="h-[calc(100vh-80px)] overflow-y-auto p-5">
            <div className="space-y-3">
              {megaMenuCategories.map((category) => {
                const Icon = category.icon;
                const expanded =
                  activeCategoryId === category.id;

                return (
                  <div
                    key={category.id}
                    className="overflow-hidden rounded-xl border border-slate-200"
                  >
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() =>
                        setActiveCategoryId(
                          expanded ? "" : category.id
                        )
                      }
                      className="flex w-full items-center gap-3 p-4 text-left"
                    >
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-100 text-blue-600">
                        <Icon className="h-5 w-5" />
                      </span>

                      <span className="flex-1 font-semibold text-slate-900">
                        {category.title}
                      </span>

                      <ChevronDown
                        className={`h-5 w-5 transition-transform ${
                          expanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {expanded && (
                      <div className="space-y-2 border-t bg-slate-50 p-3">
                        {category.links.map((link) => {
                          const LinkIcon = link.icon;

                          return (
                            <a
                              key={link.href}
                              href={link.href}
                              onClick={() => setMobileOpen(false)}
                              className="flex gap-3 rounded-lg bg-white p-3"
                            >
                              <LinkIcon className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                              <span>
                                <span className="block font-medium text-slate-900">
                                  {link.title}
                                </span>

                                <span className="mt-1 block text-sm text-slate-700">
                                  {link.description}
                                </span>
                              </span>
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
