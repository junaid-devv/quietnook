import type { Metadata } from "next";
import "./globals.css";
import "./public-design.css";
import { getCategories, getSettings, origin } from "@/lib/data";
import { Header } from "@/components/header";
import { Footer } from "@/components/public";
import { HOME_TITLE, HOME_DESCRIPTION, pageMetadata } from "@/lib/seo";
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const base = origin();
  return {
    ...pageMetadata({ title: HOME_TITLE, description: HOME_DESCRIPTION, path: "/", indexable: true }),
    metadataBase: base ? new URL(base) : undefined,
    title: {
      default: "quietnook | Home Decor, Small Spaces & Seasonal Ideas",
      template: "%s | quietnook",
    },
    description:
      "Explore rooms, small-space living, and the seasons at quietnook. New decorating and organization guides are on the way.",
    robots: { index: process.env.STAGING === "false" && !!base, follow: true },
    alternates: undefined,
    manifest: "/site.webmanifest",
    icons: { icon: "/brand/icon.svg", apple: "/brand/apple-touch-icon.png" },
    verification: {
      google: settings.search_console_token || undefined,
      other: settings.pinterest_token
        ? { "p:domain_verify": settings.pinterest_token }
        : undefined,
    },
  };
}
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, settings] = await Promise.all([
    getCategories(),
    getSettings(),
  ]);
  return (
    <html lang="en-US">
      <head>
        <link rel="preload" href="/fonts/editorial.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/body.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header categories={categories} />
        <main id="main">{children}</main>
        <Footer categories={categories} settings={settings} />
      </body>
    </html>
  );
}
