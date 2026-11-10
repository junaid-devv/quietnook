import { z } from "zod";
import { sameOrigin, rateLimit, json } from "@/lib/api";
import { getSettings } from "@/lib/data";
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return json({ message: "Invalid request origin" }, 403);
  if (
    !process.env.RESEND_API_KEY ||
    !process.env.CONTACT_FROM ||
    !process.env.CONTACT_TO ||
    !(await getSettings()).privacy_text
  )
    return json({ message: "Contact delivery is not configured." }, 503);
  if (!(await rateLimit(request, "contact", 4, 3600)))
    return json(
      { message: "Please wait before sending another message." },
      429,
    );
  try {
    const data = z
      .object({
        name: z.string().trim().min(1).max(100),
        email: z.email().max(250),
        message: z.string().trim().min(1).max(5000),
        website: z.string().max(0).optional(),
      })
      .parse(await request.json());
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(10000),
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM,
        to: [process.env.CONTACT_TO],
        reply_to: data.email,
        subject: "quietnook contact message",
        text: `From: ${data.name}\nEmail: ${data.email}\n\n${data.message}`,
      }),
    });
    if (!response.ok)
      return json(
        {
          message:
            "Your message could not be delivered. Please try again later.",
        },
        502,
      );
    const result = await response.json();
    if (!result.id)
      return json({ message: "Delivery could not be confirmed." }, 502);
    return json({
      message:
        "Your message was accepted for delivery. Thank you for getting in touch.",
    });
  } catch (error) {
    if (!(error instanceof z.ZodError) && !(error instanceof SyntaxError))
      return json({ message: "Contact delivery is temporarily unavailable. Please try again later." }, 502);
    return json(
      { message: "Check your name, email address, and message." },
      400,
    );
  }
}
