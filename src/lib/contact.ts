import { createServerFn } from "@tanstack/react-start";
import nodemailer from "nodemailer";
import { supabase } from "./supabase";

export interface ContactFormData {
  name: string;
  email: string;
  category: "allmant" | "klinik" | "samarbete" | "redaktionellt" | "annat";
  phone?: string;
  clinicName?: string;
  message: string;
  honeypot?: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

const CATEGORY_LABELS: Record<ContactFormData["category"], string> = {
  allmant: "Allmän fråga eller feedback",
  klinik: "Registrera / uppdatera klinik",
  samarbete: "Samarbete & Partnerskap",
  redaktionellt: "Redaktionellt tips / artikel",
  annat: "Övrigt ärende",
};

export const sendContactMessage = createServerFn({ method: "POST" })
  .validator((data: ContactFormData) => {
    if (!data.name || typeof data.name !== "string" || data.name.trim().length < 2) {
      throw new Error("Vänligen ange ditt namn.");
    }
    if (!data.email || typeof data.email !== "string" || !data.email.includes("@")) {
      throw new Error("Vänligen ange en giltig e-postadress.");
    }
    if (!data.message || typeof data.message !== "string" || data.message.trim().length < 5) {
      throw new Error("Vänligen skriv ett meddelande (minst 5 tecken).");
    }
    return data;
  })
  .handler(async ({ data }): Promise<ContactResponse> => {
    // 1. Honeypot check - silently prevent bot spam
    if (data.honeypot && data.honeypot.trim() !== "") {
      console.warn("[Bot Filter] Submission stopped by honeypot:", data.honeypot);
      return {
        success: true,
        message: "Tack för ditt meddelande! Vi återkommer till dig så snart som möjligt.",
      };
    }

    const categoryTitle = CATEGORY_LABELS[data.category] || "Kontaktförfrågan";
    const timestamp = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" });
    const targetEmail = process.env.CONTACT_RECEIVER_EMAIL || "info@nakima.se";

    // Plain text body
    const plainText = [
      `Nytt kontaktmeddelande från nakima.se`,
      `=========================================`,
      `Tidpunkt: ${timestamp}`,
      `Kategori: ${categoryTitle}`,
      `Namn: ${data.name.trim()}`,
      `E-post: ${data.email.trim()}`,
      data.phone ? `Telefon: ${data.phone.trim()}` : null,
      data.clinicName ? `Klinik / Företag: ${data.clinicName.trim()}` : null,
      ``,
      `Meddelande:`,
      `-----------------------------------------`,
      data.message.trim(),
      `=========================================`,
      `Besvara detta mejl direkt för att skriva tillbaka till ${data.name.trim()} (${data.email.trim()}).`,
    ]
      .filter(Boolean)
      .join("\n");

    // HTML Email body
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="sv">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1c1917; background-color: #f7f6f2; padding: 24px; }
          .card { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e7e5e4; border-radius: 8px; overflow: hidden; }
          .header { background: #1c1917; color: #f7f6f2; padding: 20px 24px; border-bottom: 3px solid #d95d39; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.02em; }
          .header p { margin: 4px 0 0 0; font-size: 13px; color: #a8a29e; }
          .content { padding: 24px; }
          .field { margin-bottom: 16px; }
          .field-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #78716c; margin-bottom: 2px; }
          .field-value { font-size: 15px; color: #1c1917; font-weight: 500; }
          .message-box { background: #fafaf9; border-left: 3px solid #d95d39; padding: 16px; border-radius: 4px; margin-top: 16px; white-space: pre-wrap; font-size: 14px; color: #292524; }
          .footer { background: #f5f5f4; padding: 16px 24px; font-size: 12px; color: #78716c; border-top: 1px solid #e7e5e4; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>Nytt kontaktmeddelande</h1>
            <p>Mottaget från nakima.se • ${timestamp}</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="field-label">Ärende</div>
              <div class="field-value">${categoryTitle}</div>
            </div>
            <div class="field">
              <div class="field-label">Avsändare</div>
              <div class="field-value">${data.name.trim()}</div>
            </div>
            <div class="field">
              <div class="field-label">E-postadress</div>
              <div class="field-value"><a href="mailto:${encodeURIComponent(data.email.trim())}" style="color: #d95d39; text-decoration: none;">${data.email.trim()}</a></div>
            </div>
            ${
              data.phone
                ? `<div class="field">
                    <div class="field-label">Telefon</div>
                    <div class="field-value"><a href="tel:${encodeURIComponent(data.phone.trim())}" style="color: #1c1917; text-decoration: none;">${data.phone.trim()}</a></div>
                   </div>`
                : ""
            }
            ${
              data.clinicName
                ? `<div class="field">
                    <div class="field-label">Klinik / Företag</div>
                    <div class="field-value">${data.clinicName.trim()}</div>
                   </div>`
                : ""
            }
            <div class="field" style="margin-top: 20px;">
              <div class="field-label">Meddelande</div>
              <div class="message-box">${data.message
                .trim()
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")}</div>
            </div>
          </div>
          <div class="footer">
            Klicka på Svara i ditt e-postprogram för att svara direkt till <strong>${data.email.trim()}</strong>.
          </div>
        </div>
      </body>
      </html>
    `;

    console.log(`[Nakima Contact] Message from ${data.name} <${data.email}> [${categoryTitle}]`);

    // 2. Try storing into Supabase if table exists
    try {
      if (supabase) {
        await supabase.from("contact_submissions").insert({
          name: data.name.trim(),
          email: data.email.trim(),
          category: data.category,
          phone: data.phone?.trim() || null,
          clinic_name: data.clinicName?.trim() || null,
          message: data.message.trim(),
          created_at: new Date().toISOString(),
        });
      }
    } catch (dbErr) {
      console.warn("Supabase insert note:", dbErr);
    }

    // 3. Send email using Loopia SMTP if configured
    const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.LOOPIA_EMAIL_PASSWORD;
    const smtpUser = process.env.SMTP_USER || process.env.LOOPIA_EMAIL_USER || "info@nakima.se";
    const smtpHost = process.env.SMTP_HOST || "mailcluster.loopia.se";
    const smtpPort = Number(process.env.SMTP_PORT || "465");
    const smtpSecure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : smtpPort === 465;

    let emailSent = false;

    if (smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail({
          from: `"Nakima Webbformulär" <${smtpUser}>`,
          to: targetEmail,
          replyTo: `"${data.name.trim()}" <${data.email.trim()}>`,
          subject: `[Nakima Kontakt] ${categoryTitle}: ${data.name.trim()}`,
          text: plainText,
          html: htmlContent,
        });

        emailSent = true;
        console.log(`[Nakima Contact] Email sent successfully via Loopia SMTP to ${targetEmail}`);
      } catch (smtpErr) {
        console.error("Failed to send email via Loopia SMTP:", smtpErr);
      }
    }

    // 4. Secondary option: Resend API if configured and SMTP didn't send
    if (!emailSent && process.env.RESEND_API_KEY) {
      try {
        const resendApiKey = process.env.RESEND_API_KEY;
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Nakima <onboarding@resend.dev>",
            to: [targetEmail],
            reply_to: data.email.trim(),
            subject: `[Nakima Kontakt] ${categoryTitle}: ${data.name.trim()}`,
            html: htmlContent,
            text: plainText,
          }),
        });
        if (res.ok) {
          emailSent = true;
          console.log(`[Nakima Contact] Email sent successfully via Resend to ${targetEmail}`);
        }
      } catch (resendErr) {
        console.error("Failed to send email via Resend:", resendErr);
      }
    }

    if (!emailSent && !smtpPass && !process.env.RESEND_API_KEY) {
      console.info("[Nakima Contact] No SMTP_PASS or RESEND_API_KEY set. Message stored/logged successfully.");
    }

    return {
      success: true,
      message: "Tack för ditt meddelande! Vi har tagit emot det och återkommer till dig så snart som möjligt.",
    };
  });
