import { NextResponse, type NextRequest } from "next/server";
import { optOutOfCartReminders } from "@/Data/reminders";
import { BRAND } from "@/lib/email/brand";
import { validUnsubscribeToken } from "@/lib/reminders";

export const dynamic = "force-dynamic";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const page = (title: string, text: string, status = 200) =>
  new NextResponse(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head><body style="margin:0;font-family:Arial,Helvetica,sans-serif;background:#f4f2ef;color:#1c1c1c"><div style="max-width:480px;margin:15vh auto;padding:32px;background:#fff;border-radius:12px;text-align:center"><h1 style="font-size:22px;margin:0 0 12px">${esc(title)}</h1><p style="font-size:15px;line-height:1.6;color:#444;margin:0">${esc(text)}</p></div></body></html>`,
    { status, headers: { "content-type": "text/html; charset=utf-8" } },
  );

export async function GET(req: NextRequest) {
  const u = req.nextUrl.searchParams.get("u") ?? "";
  const token = req.nextUrl.searchParams.get("t") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(u) || !validUnsubscribeToken(u, token))
    return page(
      "This link isn't valid",
      "Please use the link from your most recent email.",
      400,
    );
  await optOutOfCartReminders(u);
  return page(
    "You're unsubscribed",
    `You won't get basket reminders from ${BRAND.name} any more.`,
  );
}
