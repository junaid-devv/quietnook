import Image from "next/image";
import Link from "next/link";
import { type Settings, type Category } from "@/lib/taxonomy";
import { Breadcrumbs } from "./public";
import { ContactForm } from "./contact";
import { CollectionShelf } from "./collections";
import { Icon } from "./icon";
export function AboutPage({
  settings,
  categories,
}: {
  settings: Settings;
  categories: Category[];
}) {
  return (
    <div className="collection-container about-page">
      <Breadcrumbs items={[{ label: "About" }]} />
      <section className="about-intro">
        <div>
          <h1>
            A home that <br />
            feels like you.
          </h1>
          <p>Decorating, small-space living, and the seasons in between.</p>
          {settings.operator_name && (
            <p className="publisher-line">
              Published by {settings.operator_name}.
            </p>
          )}
        </div>
        <div className="about-photo">
          <Image
            src="/images/living-room.webp"
            alt="A welcoming living room with plants, a cream sofa, and a wooden coffee table."
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(max-width:760px) 90vw, 50vw"
          />
        </div>
      </section>
      <section className="about-values">
        <div>
          <Icon name="house" />
          <h2>Real rooms.</h2>
          <p>Everyday spaces, with room for your own style.</p>
        </div>
        <div>
          <Icon name="heart" />
          <h2>Personal touches.</h2>
          <p>Familiar textures, natural materials, and things you love.</p>
        </div>
        <div>
          <Icon name="leaf" />
          <h2>Every season.</h2>
          <p>A home that changes with the moments that matter.</p>
        </div>
      </section>
      <section className="about-story">
        <h2>Welcome to quietnook</h2>
        <p>{settings.about_text || "quietnook brings together home decorating, small-space living, organization, DIY projects, and seasonal inspiration. Our focus is approachable ideas for everyday rooms, manageable projects, and making the most of the space you have."}</p>
        <p>Browse by room, explore a season, or start with the part of your home you want to make your own.</p>
        <p>Have a question or suggestion? <Link className="text-link" href="/contact/">Get in touch</Link>.</p>
      </section>
      <CollectionShelf
        title="Make yourself at home"
        items={categories.filter((c) => c.kind === "topic")}
      />
    </div>
  );
}
export function ContactPage({
  settings,
  categories,
}: {
  settings: Settings;
  categories: Category[];
}) {
  const enabled = !!(
    process.env.RESEND_API_KEY &&
    process.env.CONTACT_FROM &&
    process.env.CONTACT_TO &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    settings.privacy_text
  );
  return (
    <div className="collection-container contact-page">
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <section className="contact-layout">
        <div className="contact-intro">
          <h1>Let’s talk home.</h1>
          <p>A question, a suggestion, or just a hello.</p>
          <div className="contact-photo">
            <Image
              src="/images/diy-projects.webp"
              alt="Natural materials and pottery on a sunny worktable."
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(max-width:760px) 90vw, 42vw"
            />
          </div>
        </div>
        <div className="contact-panel">
          <Icon name="house" />
          <h2>Send us a note</h2>
          {enabled ? (
            <ContactForm />
          ) : (
            <>
              <p>{settings.contact_email ? "Email us with your question or suggestion." : "Our message channel isn’t open yet."}</p>
              {settings.contact_email ? (
                <a
                  className="text-link"
                  href={`mailto:${settings.contact_email}`}
                >
                  {settings.contact_email}
                  <Icon name="arrow" />
                </a>
              ) : (
                <Link className="text-link" href="/about/">
                  About quietnook
                  <Icon name="arrow" />
                </Link>
              )}
            </>
          )}
          <div className="contact-quick-links">
            {settings.privacy_text && <p>Read our <Link href="/privacy/">Privacy Policy</Link> before sending personal information.</p>}
            <h3>Looking for inspiration?</h3>
            <Link href="/rooms/">
              Explore the rooms
              <Icon name="arrow" />
            </Link>
            <Link href="/seasons/">
              Seasons & holidays
              <Icon name="arrow" />
            </Link>
            <Link href="/search/">
              Search the site
              <Icon name="search" />
            </Link>
          </div>
        </div>
      </section>
      <CollectionShelf
        title="Take a look around"
        items={categories.filter((c) =>
          ["bedroom", "balcony", "kitchen"].includes(c.slug),
        )}
      />
    </div>
  );
}
