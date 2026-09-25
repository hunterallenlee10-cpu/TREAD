import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import { getThreadProductById } from "@/data/thread";

// Constructed per request rather than at module scope: the Resend constructor
// throws when the key is missing, which fails `next build` on any environment
// that doesn't expose RESEND_API_KEY at build time.
function getResend(): Resend {
  return new Resend(process.env.RESEND_API_KEY);
}

// Thread requests deliver to the shared contact address along with everything
// else. THREAD_TO_EMAIL exists only so Thread can be split onto its own inbox
// later without touching this route — and it carries a caveat: until a domain
// is verified in Resend, any recipient other than the account's own address is
// refused and the form fails.
const THREAD_TO_EMAIL =
  process.env.THREAD_TO_EMAIL ||
  process.env.CONTACT_TO_EMAIL ||
  "ceo@leeenterprisesunlimited.com";

const fromAddress =
  process.env.CONTACT_FROM_EMAIL || "noreply@leeenterprisesunlimited.com";

/** Mirrors the provider's limits so a rejected payload is a client-side bug. */
const MAX_LINES = 100;
const MAX_QUANTITY = 1000;

interface ThreadOrderItem {
  productId?: unknown;
  colorName?: unknown;
  sizeLabel?: unknown;
  quantity?: unknown;
}

interface ThreadOrderRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  organization?: string;
  orderType?: string;
  useCase?: string;
  preferredContact?: "email" | "phone" | "text";
  needByDate?: string;
  hasArtwork?: string;
  designNotes?: string;
  additionalNotes?: string;
  items?: ThreadOrderItem[];
  honeypot?: string;
}

const orderTypeLabels: Record<string, string> = {
  "ready-made": "Ready-made pieces from the collection",
  custom: "Custom printed apparel",
  both: "Both ready-made and custom",
};

const preferredContactLabels: Record<string, string> = {
  email: "Email",
  phone: "Phone Call",
  text: "Text Message",
};

/**
 * Keys must match the option values in ThreadOrderRequestForm. An unmapped
 * value falls through to "Not provided", which would read as an unanswered
 * required field rather than the answer the sender actually chose.
 */
const hasArtworkLabels: Record<string, string> = {
  yes: "Has artwork ready to send",
  no: "Needs Thread to design it",
  unsure: "Not sure yet",
  "Not applicable": "Not applicable — ordering ready-made pieces",
};

/**
 * Rebuilds each line from the catalog rather than trusting the browser.
 *
 * The client posts a product id; the product NAME comes from data/thread.ts
 * here. Interpolating a client-supplied name straight into the email would be
 * an open channel for writing arbitrary text into the inbox. Unknown ids are
 * dropped rather than echoed.
 */
function formatItems(items: ThreadOrderItem[]): {
  lines: string[];
  totalPieces: number;
  droppedCount: number;
} {
  const lines: string[] = [];
  let totalPieces = 0;
  let droppedCount = 0;

  for (const item of items.slice(0, MAX_LINES)) {
    const product =
      typeof item.productId === "string"
        ? getThreadProductById(item.productId)
        : undefined;

    if (!product) {
      droppedCount += 1;
      continue;
    }

    const rawQuantity =
      typeof item.quantity === "number" && Number.isFinite(item.quantity)
        ? Math.round(item.quantity)
        : 1;
    const quantity = Math.min(MAX_QUANTITY, Math.max(1, rawQuantity));

    // Color and size are labels, not identifiers, so they are length-capped
    // rather than resolved. Anything longer is not a real colorway.
    const color =
      typeof item.colorName === "string" && item.colorName.trim()
        ? item.colorName.trim().slice(0, 40)
        : "—";
    const size =
      typeof item.sizeLabel === "string" && item.sizeLabel.trim()
        ? item.sizeLabel.trim().slice(0, 20)
        : "—";

    totalPieces += quantity;
    lines.push(`  ${quantity} × ${product.name} — ${color} / ${size}`);
  }

  return { lines, totalPieces, droppedCount };
}

export async function POST(request: NextRequest) {
  try {
    const body: ThreadOrderRequest = await request.json();

    // Honeypot field check - silently return 200 if filled
    if (body.honeypot && body.honeypot.trim() !== "") {
      return NextResponse.json(
        { message: "Thank you for your submission" },
        { status: 200 }
      );
    }

    const errors: Record<string, string> = {};

    const fullNameTrimmed = body.fullName?.trim() || "";
    if (!fullNameTrimmed) {
      errors.fullName = "Full name is required";
    } else if (fullNameTrimmed.length < 2) {
      errors.fullName = "Name must be at least 2 characters";
    }

    // Email is required rather than optional: artwork and proofs are
    // exchanged over email, so a phone-only request cannot actually complete
    // a custom order.
    const emailTrimmed = body.email?.trim() || "";
    if (!emailTrimmed) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      errors.email = "Please enter a valid email address";
    }

    const phoneTrimmed = body.phone?.trim() || "";
    if (!phoneTrimmed) {
      errors.phone = "Phone number is required";
    } else if (
      !/^[\d\s\-().+]+$/.test(phoneTrimmed) ||
      phoneTrimmed.length < 10
    ) {
      errors.phone = "Please enter a valid phone number";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const items = Array.isArray(body.items) ? body.items : [];
    const { lines, totalPieces, droppedCount } = formatItems(items);

    // An empty selection is valid — someone can describe a custom job without
    // picking anything off the shelf first.
    const itemsBlock = lines.length
      ? `${lines.join("\n")}\n\n  Total: ${totalPieces} ${
          totalPieces === 1 ? "piece" : "pieces"
        }`
      : "  No specific pieces selected — see the notes below.";

    const emailBody = `
Full Name: ${fullNameTrimmed}
Email Address: ${emailTrimmed}
Phone Number: ${phoneTrimmed}
Organization: ${body.organization?.trim() || "Not provided"}
Preferred Contact Method: ${
      preferredContactLabels[body.preferredContact || ""] || "Not provided"
    }

Order Type: ${orderTypeLabels[body.orderType || ""] || "Not provided"}
Ordering For: ${body.useCase?.trim() || "Not specified"}
Needed By: ${body.needByDate?.trim() || "No date given"}
Artwork: ${hasArtworkLabels[body.hasArtwork || ""] || "Not provided"}

Requested Items:
${itemsBlock}${
      droppedCount > 0
        ? `\n\n  Note: ${droppedCount} submitted line(s) did not match a known product and were omitted.`
        : ""
    }

Design Notes:
${body.designNotes?.trim() || "Not provided"}

Additional Notes:
${body.additionalNotes?.trim() || "Not provided"}
    `.trim();

    const subject = `New Thread Order Request — ${fullNameTrimmed}`;

    // Checked up front so a missing key is reported as itself rather than as a
    // generic failure: the Resend constructor throws on an absent key, which
    // would otherwise surface identically to a rejected send.
    if (!process.env.RESEND_API_KEY) {
      console.error(
        "[thread] RESEND_API_KEY is not set - the order form cannot send email."
      );
      return NextResponse.json(
        { error: "Failed to send email", code: "email_not_configured" },
        { status: 500 }
      );
    }

    const response = await getResend().emails.send({
      from: fromAddress,
      to: THREAD_TO_EMAIL,
      replyTo: emailTrimmed,
      subject,
      text: emailBody,
    });

    if (response.error) {
      // Logged field by field: Resend's error object stringifies to "[object
      // Object]" through console.error on Vercel, hiding the actual reason.
      console.error(
        "[thread] Resend rejected the order request email.",
        `name=${response.error.name}`,
        `message=${response.error.message}`,
        `from=${fromAddress}`,
        `to=${THREAD_TO_EMAIL}`
      );
      return NextResponse.json(
        { error: "Failed to send email", code: "email_rejected" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Order request sent successfully", id: response.data?.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("[thread] Order request error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
