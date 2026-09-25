"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2, Pencil } from "lucide-react";
import {
  THREAD_PALETTE,
  THREAD_TURNAROUND,
  threadCopy,
  threadUseCases,
} from "@/data/thread";
import { useThreadCart } from "@/components/thread/ThreadCartProvider";
import { ThreadReveal } from "@/components/thread/ThreadReveal";
import {
  ThreadHeading,
  ThreadSection,
  threadCardStyle,
  threadPrimaryButtonClass,
} from "@/components/thread/ThreadUI";

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  organization: "",
  orderType: "",
  useCase: "",
  preferredContact: "email",
  needByDate: "",
  hasArtwork: "",
  designNotes: "",
  additionalNotes: "",
};

type FormState = typeof emptyForm;
type FieldErrors = Partial<Record<keyof FormState | "form", string>>;

const labelClass = "block text-sm font-semibold mb-2";

const fieldClass =
  "w-full rounded-lg border px-4 py-2.5 transition-colors focus:outline-none focus:ring-2";

const fieldStyle = {
  backgroundColor: THREAD_PALETTE.ink,
  borderColor: THREAD_PALETTE.border,
  color: THREAD_PALETTE.bone,
};

const hintClass = "mt-1.5 text-xs";

/**
 * Value posted when a field does not apply — someone buying finished pieces
 * off the collection has no use case to describe and no artwork to send.
 *
 * Deliberately readable rather than a code: `useCase` is forwarded to the
 * order email verbatim, so whatever is stored here is what the reader sees.
 * `hasArtwork` is mapped through hasArtworkLabels in the API route, which
 * carries a matching entry.
 */
const NOT_APPLICABLE = "Not applicable";

export function ThreadOrderRequestForm() {
  const { items, totalPieces, clear, setOpen } = useThreadCart();

  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, form: undefined }));
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};

    if (formData.fullName.trim().length < 2) {
      next.fullName = "Please enter your full name";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      next.email = "Please enter a valid email address";
    }
    const phone = formData.phone.trim();
    if (!phone || !/^[\d\s\-().+]+$/.test(phone) || phone.length < 10) {
      next.phone = "Please enter a valid phone number";
    }
    if (!formData.orderType) {
      next.orderType = "Please choose what you are ordering";
    }
    if (!formData.hasArtwork) {
      next.hasArtwork = "Let Thread know where your design stands";
    }

    return next;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const found = validate();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch("/api/thread-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          honeypot,
          items: items.map((item) => ({
            productId: item.productId,
            colorName: item.colorName,
            sizeLabel: item.sizeLabel,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        if (payload?.errors) {
          setErrors(payload.errors);
        } else {
          setErrors({
            form: "Something went wrong sending your request. Please try again, or email ceo@leeenterprisesunlimited.com directly.",
          });
        }
        return;
      }

      setSubmitted(true);
      setFormData(emptyForm);
      clear();
    } catch {
      setErrors({
        form: "Could not reach the server. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <ThreadSection id="order-request" alt>
        <div
          className="mx-auto max-w-2xl rounded-lg border p-10 text-center"
          style={threadCardStyle}
        >
          <CheckCircle2
            className="mx-auto h-12 w-12"
            style={{ color: THREAD_PALETTE.champagne }}
          />
          <h2
            className="heading-md mt-6"
            style={{ color: THREAD_PALETTE.bone }}
          >
            Request Sent
          </h2>
          <p
            className="mt-4 leading-relaxed"
            style={{ color: THREAD_PALETTE.muted }}
          >
            Thread will follow up within one business day to confirm quantities,
            artwork, and a written quote. Nothing is charged and nothing is
            printed until you approve it. Most orders are produced in{" "}
            {THREAD_TURNAROUND} once the proof is signed off.
          </p>
        </div>
      </ThreadSection>
    );
  }

  return (
    <ThreadSection id="order-request" alt>
      {/* Heading only. The form itself never moves — a field sliding under a
          cursor mid-tap is worse than a static header is dull. */}
      <ThreadReveal>
        {/* Decorative: the eyebrow and heading directly below name the brand
            and the action, so announcing the mark too would just repeat them.
            Matches how the LMM consultation form marks its logo. */}
        <Image
          src="/thread/wordmark.png"
          alt=""
          width={720}
          height={522}
          loading="lazy"
          className="mx-auto mb-6 h-auto w-40 opacity-80"
        />
        <ThreadHeading
          eyebrow={threadCopy.order.eyebrow}
          title={threadCopy.order.title}
          description={threadCopy.order.description}
        />
      </ThreadReveal>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mx-auto max-w-3xl rounded-lg border p-8"
        style={threadCardStyle}
      >
        {/* Selection summary. Quantities are edited in the drawer so there is
            one place that owns the request, not two that can disagree. */}
        <div
          className="mb-8 rounded-lg border p-5"
          style={{ borderColor: THREAD_PALETTE.border }}
        >
          <div className="flex items-center justify-between gap-4">
            <h3
              className="font-semibold"
              style={{ color: THREAD_PALETTE.bone }}
            >
              Your Selection
            </h3>
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold"
                style={{ color: THREAD_PALETTE.champagne }}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <p
              className="mt-3 text-sm"
              style={{ color: THREAD_PALETTE.muted }}
            >
              Nothing selected yet — that is fine. Describe what you need below
              and Thread will work it out with you.
            </p>
          ) : (
            <>
              <ul className="mt-4 space-y-2">
                {items.map((item) => (
                  <li
                    key={item.key}
                    className="flex justify-between gap-4 text-sm"
                    style={{ color: THREAD_PALETTE.muted }}
                  >
                    <span>
                      {item.productName} — {item.colorName} / {item.sizeLabel}
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: THREAD_PALETTE.bone }}
                    >
                      ×{item.quantity}
                    </span>
                  </li>
                ))}
              </ul>
              <p
                className="mt-4 text-sm font-semibold"
                style={{ color: THREAD_PALETTE.bone }}
              >
                {totalPieces} {totalPieces === 1 ? "piece" : "pieces"} total
              </p>
            </>
          )}
        </div>

        {/* The form is built for custom work, where the design and deadline
            questions carry the order. Someone buying finished pieces off the
            collection meets the same questions and reasonably wonders whether
            the order needs them. It does not, and saying so once here is
            cheaper than every field explaining itself. */}
        <p
          className="mb-6 text-sm"
          style={{ color: THREAD_PALETTE.champagne }}
        >
          Ordering ready-made pieces? Your contact details and your selection
          are all Thread needs. The design and deadline questions below are for
          custom orders — mark them Not applicable or leave them blank.
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="thread-fullName"
              className={labelClass}
              style={{ color: THREAD_PALETTE.bone }}
            >
              Full Name *
            </label>
            <input
              id="thread-fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={fieldClass}
              style={fieldStyle}
              placeholder="Jordan Lee"
            />
            {errors.fullName && (
              <p className="mt-1.5 text-sm text-red-400">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="thread-organization"
              className={labelClass}
              style={{ color: THREAD_PALETTE.bone }}
            >
              Business, Team, or Organization
            </label>
            <input
              id="thread-organization"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              className={fieldClass}
              style={fieldStyle}
              placeholder="Optional"
            />
          </div>

          <div>
            <label
              htmlFor="thread-email"
              className={labelClass}
              style={{ color: THREAD_PALETTE.bone }}
            >
              Email Address *
            </label>
            <input
              id="thread-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={fieldClass}
              style={fieldStyle}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="mt-1.5 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="thread-phone"
              className={labelClass}
              style={{ color: THREAD_PALETTE.bone }}
            >
              Phone Number *
            </label>
            <input
              id="thread-phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className={fieldClass}
              style={fieldStyle}
              placeholder="(555) 000-0000"
            />
            {errors.phone && (
              <p className="mt-1.5 text-sm text-red-400">{errors.phone}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="thread-orderType"
              className={labelClass}
              style={{ color: THREAD_PALETTE.bone }}
            >
              What are you ordering? *
            </label>
            <select
              id="thread-orderType"
              name="orderType"
              value={formData.orderType}
              onChange={handleChange}
              className={fieldClass}
              style={fieldStyle}
            >
              <option value="">Select an option...</option>
              <option value="ready-made">Ready-made pieces</option>
              <option value="custom">Custom printed apparel</option>
              <option value="both">Both</option>
            </select>
            {errors.orderType && (
              <p className="mt-1.5 text-sm text-red-400">{errors.orderType}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="thread-useCase"
              className={labelClass}
              style={{ color: THREAD_PALETTE.bone }}
            >
              Who is this for?
            </label>
            <select
              id="thread-useCase"
              name="useCase"
              value={formData.useCase}
              onChange={handleChange}
              className={fieldClass}
              style={fieldStyle}
            >
              <option value="">Select an option...</option>
              <option value={NOT_APPLICABLE}>
                Not applicable — ordering ready-made
              </option>
              {threadUseCases.map((useCase) => (
                <option key={useCase.id} value={useCase.title}>
                  {useCase.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="thread-hasArtwork"
              className={labelClass}
              style={{ color: THREAD_PALETTE.bone }}
            >
              Do you have a design? *
            </label>
            <select
              id="thread-hasArtwork"
              name="hasArtwork"
              value={formData.hasArtwork}
              onChange={handleChange}
              className={fieldClass}
              style={fieldStyle}
            >
              <option value="">Select an option...</option>
              <option value={NOT_APPLICABLE}>
                Not applicable — ordering ready-made
              </option>
              <option value="yes">Yes, I have artwork ready</option>
              <option value="no">No, I want Thread to design it</option>
              <option value="unsure">Not sure yet</option>
            </select>
            {errors.hasArtwork && (
              <p className="mt-1.5 text-sm text-red-400">{errors.hasArtwork}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="thread-needByDate"
              className={labelClass}
              style={{ color: THREAD_PALETTE.bone }}
            >
              Needed By
            </label>
            <input
              id="thread-needByDate"
              name="needByDate"
              type="date"
              value={formData.needByDate}
              onChange={handleChange}
              className={fieldClass}
              style={fieldStyle}
              aria-describedby="thread-needByDate-hint"
            />
            {/* A date input has no "not applicable" to offer, so the way out is
                stated instead. The API already reports an empty value as "No
                date given". */}
            <p
              id="thread-needByDate-hint"
              className={hintClass}
              style={{ color: THREAD_PALETTE.muted }}
            >
              No deadline? Leave this blank.
            </p>
          </div>
        </div>

        <fieldset className="mt-6">
          <legend
            className={labelClass}
            style={{ color: THREAD_PALETTE.bone }}
          >
            Preferred Contact Method
          </legend>
          <div className="flex flex-wrap gap-4">
            {[
              { value: "email", label: "Email" },
              { value: "phone", label: "Phone" },
              { value: "text", label: "Text" },
            ].map((option) => (
              <label
                key={option.value}
                className="inline-flex items-center gap-2 text-sm"
                style={{ color: THREAD_PALETTE.muted }}
              >
                <input
                  type="radio"
                  name="preferredContact"
                  value={option.value}
                  checked={formData.preferredContact === option.value}
                  onChange={handleChange}
                  className="accent-current"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-6">
          <label
            htmlFor="thread-designNotes"
            className={labelClass}
            style={{ color: THREAD_PALETTE.bone }}
          >
            Tell Thread about your design
          </label>
          <textarea
            id="thread-designNotes"
            name="designNotes"
            rows={4}
            value={formData.designNotes}
            onChange={handleChange}
            className={fieldClass}
            style={fieldStyle}
            aria-describedby="thread-designNotes-hint"
            placeholder="Colors, text, logo placement, or just a rough idea. If you have artwork, Thread will reply with where to send the files."
          />
          <p
            id="thread-designNotes-hint"
            className={hintClass}
            style={{ color: THREAD_PALETTE.muted }}
          >
            Custom orders only — skip this if you are ordering ready-made.
          </p>
        </div>

        <div className="mt-6">
          <label
            htmlFor="thread-additionalNotes"
            className={labelClass}
            style={{ color: THREAD_PALETTE.bone }}
          >
            Anything Else
          </label>
          <textarea
            id="thread-additionalNotes"
            name="additionalNotes"
            rows={3}
            value={formData.additionalNotes}
            onChange={handleChange}
            className={fieldClass}
            style={fieldStyle}
            aria-describedby="thread-additionalNotes-hint"
            placeholder="Sizing breakdowns, names and numbers, deadlines, questions."
          />
          <p
            id="thread-additionalNotes-hint"
            className={hintClass}
            style={{ color: THREAD_PALETTE.muted }}
          >
            Optional. Leave it blank if your selection above says it all.
          </p>
        </div>

        {/* Honeypot — hidden from people, catching for bots. */}
        <input
          type="text"
          name="company_website"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />

        {errors.form && (
          <p className="mt-6 text-sm text-red-400">{errors.form}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`${threadPrimaryButtonClass} mt-8 w-full`}
        >
          {isSubmitting ? "Sending..." : "Send Order Request"}
        </button>

        <p
          className="mt-4 text-center text-xs"
          style={{ color: THREAD_PALETTE.muted }}
        >
          No payment is taken and no card details are collected. You will get a
          written quote to approve before anything is produced.
        </p>
      </form>
    </ThreadSection>
  );
}
