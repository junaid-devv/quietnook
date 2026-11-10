import { z } from "zod";
import { sameOrigin, rateLimit, json } from "@/lib/api";
import { getSettings } from "@/lib/data";
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return json({ message: "Invalid request origin" }, 403);
  const settings = await getSettings();
  if (
    !process.env.BUTTONDOWN_API_KEY ||
    process.env.NEWSLETTER_VERIFIED !== "true" ||
    !settings.newsletter_enabled ||
    !settings.newsletter_privacy ||
    !settings.privacy_text
  )
    return json({ message: "Newsletter signup is not available." }, 503);
  if (!(await rateLimit(request, "newsletter", 4, 3600)))
    return json({ message: "Please wait before trying again." }, 429);
  try {
    const data = z
      .object({
        email: z.email().max(250),
        consent: z.literal(true),
        website: z.string().max(0).optional(),
      })
      .parse(await request.json());
    const r = await fetch("https://api.buttondown.com/v1/subscribers", {
      method: "POST",
      signal: AbortSignal.timeout(10000),
      headers: {
        Authorization: `Token ${process.env.BUTTONDOWN_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email_address: data.email, type: "unactivated" }),
    });
    if (!r.ok)
      return json(
        {
          message:
            "We couldn’t confirm a new signup. If you already subscribe, no action is needed.",
        },
        r.status === 429 ? 429 : 400,
      );
    const result = await r.json();
    if (!result.id)
      return json({ message: "Signup could not be confirmed." }, 502);
    return json({
      message:
        "Your signup request was accepted. Check your inbox for a confirmation email.",
    });
  } catch (error) {
    if (!(error instanceof z.ZodError) && !(error instanceof SyntaxError))
      return json({ message: "Newsletter delivery is temporarily unavailable. Please try again later." }, 502);
    return json(
      {
        message:
          "Check your email address and consent checkbox, then try again.",
      },
      400,
    );
  }
}
