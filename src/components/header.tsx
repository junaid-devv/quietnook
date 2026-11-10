"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { Logo } from "./logo";
import { Icon } from "./icon";
import { categoryHref, type Category } from "@/lib/taxonomy";
export function Header({ categories }: { categories: Category[] }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const searchTrigger = useRef<HTMLButtonElement | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    function dismiss(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (searchOpen) {
          setSearchOpen(false);
          searchTrigger.current?.focus();
        } else if (dropdown) {
          header.current
            ?.querySelector<HTMLButtonElement>(
              `.nav-label > button[aria-expanded="true"]`,
            )
            ?.focus();
          setDropdown("");
        } else {
          if (open) button.current?.focus();
          setOpen(false);
        }
      }
    }
    function outside(e: PointerEvent) {
      if (!header.current?.contains(e.target as Node)) {
        setOpen(false);
        setDropdown("");
        setSearchOpen(false);
      }
    }
    function focusOutside(e: FocusEvent) {
      if (!header.current?.contains(e.target as Node)) {
        setOpen(false);
        setDropdown("");
        setSearchOpen(false);
      }
    }
    document.addEventListener("keydown", dismiss);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", focusOutside);
    return () => {
      document.removeEventListener("keydown", dismiss);
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", focusOutside);
    };
  }, [dropdown, open, searchOpen]);
  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);
  useEffect(() => {
    setOpen(false);
    setDropdown("");
    setSearchOpen(false);
  }, [path]);
  function toggleSearch(trigger: HTMLButtonElement) {
    searchTrigger.current = trigger;
    setSearchOpen(!searchOpen);
    setOpen(false);
    setDropdown("");
  }
  const items = [
    ["Home", "/", ""],
    ["Decor Ideas", "/decor-ideas/", "room"],
    ["Small Spaces", "/small-spaces/", "small"],
    ["Organization", "/organization/", ""],
    ["DIY Projects", "/diy-projects/", ""],
    ["Seasons & Holidays", "/seasons/", "season"],
  ];
  return (
    <header className="site-header" ref={header}>
      <div className="header-inner">
        <Logo />
        <div className="mobile-actions">
          <button
            type="button"
            className="icon-button"
            aria-label={searchOpen ? "Close search" : "Search the site"}
            aria-expanded={searchOpen}
            aria-controls="navbar-search"
            onClick={(e) => toggleSearch(e.currentTarget)}
          >
            <Icon name={searchOpen ? "close" : "search"} />
          </button>
          <button
            type="button"
            className="menu-button"
            aria-label={open ? "Close menu" : "Open menu"}
            ref={button}
            aria-expanded={open}
            aria-controls="main-nav"
            onClick={() => { setOpen(!open); setSearchOpen(false); }}
          >
            <span className="menu-label">{open ? "Close" : "Menu"}</span>
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
        <nav
          id="main-nav"
          className={open ? "main-nav is-open" : "main-nav"}
          aria-label="Main navigation"
        >
          {items.map(([label, href, group]) => (
            <div className="nav-item" key={href}>
              <div className="nav-label">
                <Link
                  href={href}
                  aria-current={
                    path === href
                      ? "page"
                      : href !== "/" && path.startsWith(href)
                        ? "location"
                        : undefined
                  }
                >
                  {label}
                </Link>
                {group && (
                  <button
                    type="button"
                    aria-label={`Show ${label} categories`}
                    aria-expanded={dropdown === href}
                    aria-controls={`dropdown-${group}`}
                    onClick={() => setDropdown(dropdown === href ? "" : href)}
                  >
                    <Icon name="chevron" />
                  </button>
                )}
              </div>
              {group && dropdown === href && (
                <div className="dropdown" id={`dropdown-${group}`}>
                  {categories
                    .filter((c) =>
                      group === "small"
                        ? ["bedroom", "balcony", "living-room"].includes(c.slug)
                        : c.kind === group,
                    )
                    .map((c) => (
                      <Link href={categoryHref(c)} key={c.slug}>
                        {c.name}
                      </Link>
                    ))}
                </div>
              )}
            </div>
          ))}
          <button
            type="button"
            className="desktop-search icon-button"
            aria-label={searchOpen ? "Close search" : "Search the site"}
            aria-expanded={searchOpen}
            aria-controls="navbar-search"
            onClick={(e) => toggleSearch(e.currentTarget)}
          >
            <Icon name={searchOpen ? "close" : "search"} />
          </button>
        </nav>
      </div>
      {searchOpen && (
        <div className="navbar-search-panel" id="navbar-search">
          <form action="/search/" className="search-form" role="search" aria-label="Site search">
            <Icon name="search" />
            <label htmlFor="navbar-query" className="sr-only">Search home ideas</label>
            <input ref={searchInput} id="navbar-query" name="q" type="search" placeholder="Search home ideas…" maxLength={200} required />
            <button className="button" type="submit">Search</button>
          </form>
        </div>
      )}
    </header>
  );
}
