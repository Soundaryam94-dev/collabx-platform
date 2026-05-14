import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  sendAcceptedEmail,
  sendDeclinedEmail,
  sendProposalAcceptedEmail,
  sendProposalDeclinedEmail,
} from "@/lib/email/sendInvite";

export async function POST(request: NextRequest) {
  const { collaborationId, action, sender } = await request.json() as {
    collaborationId: string;
    action: "accept" | "decline";
    sender?: "brand" | "creator";  // who sent the original invite
  };

  if (!collaborationId || !["accept", "decline"].includes(action)) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const newStatus = action === "accept" ? "agreed" : "rejected";

  const { data: collab, error } = await supabaseAdmin
    .from("collaborations")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", collaborationId)
    .select("*, campaigns(*), brand:profiles!collaborations_brand_id_fkey(id, email, full_name), creator:profiles!collaborations_creator_id_fkey(id, email, full_name)")
    .single();

  if (error) {
    console.error("DB update error:", error.message);
  }

  try {
    /* Brand sent original invite → notify brand of creator's response */
    if (!sender || sender === "brand") {
      if (action === "accept" && collab) {
        await sendAcceptedEmail({
          brandEmail: collab.brand?.email ?? "",
          brandName: collab.brand?.full_name ?? "Brand",
          creatorName: collab.creator?.full_name ?? "Creator",
          campaignName: collab.campaigns?.title ?? "Campaign",
          paymentAmount: collab.payment_amount ?? 0,
          deadline: collab.posting_timeline ?? "",
        });
      } else if (action === "decline" && collab) {
        await sendDeclinedEmail({
          brandEmail: collab.brand?.email ?? "",
          brandName: collab.brand?.full_name ?? "Brand",
          creatorName: collab.creator?.full_name ?? "Creator",
          campaignName: collab.campaigns?.title ?? "Campaign",
        });
      }
    }

    /* Creator sent original proposal → notify creator of brand's response */
    if (sender === "creator") {
      if (action === "accept" && collab) {
        await sendProposalAcceptedEmail({
          creatorEmail: collab.creator?.email ?? "",
          creatorName: collab.creator?.full_name ?? "Creator",
          brandName: collab.brand?.full_name ?? "Brand",
          campaignName: collab.campaigns?.title ?? "Campaign",
          paymentAmount: collab.payment_amount ?? 0,
        });
      } else if (action === "decline" && collab) {
        await sendProposalDeclinedEmail({
          creatorEmail: collab.creator?.email ?? "",
          creatorName: collab.creator?.full_name ?? "Creator",
          brandName: collab.brand?.full_name ?? "Brand",
          campaignName: collab.campaigns?.title ?? "Campaign",
        });
      }
    }
  } catch (emailErr) {
    console.error("Email send error:", emailErr);
  }

  return Response.json({ success: true, status: newStatus });
}
