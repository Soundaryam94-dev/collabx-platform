import { NextRequest } from "next/server";
import {
  sendInviteEmail,
  sendCreatorProposalEmail,
  type InvitePayload,
  type CreatorProposalPayload,
} from "@/lib/email/sendInvite";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const senderRole: "brand" | "creator" = body.senderRole ?? "brand";

  /* Try to find recipient profile — optional, invite still sends if not found */
  const recipientEmail = senderRole === "brand" ? body.creatorEmail : body.brandEmail;
  const { data: recipientProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", recipientEmail)
    .single();

  const creatorId = senderRole === "brand" ? (recipientProfile?.id ?? null) : user.id;
  const brandId   = senderRole === "brand" ? user.id : (recipientProfile?.id ?? null);

  /* Insert collaboration only when both parties are registered */
  let collabId: string = `pending-${Date.now()}`;
  if (creatorId && brandId) {
    const { data: collab, error: dbError } = await supabase
      .from("collaborations")
      .insert({
        campaign_id: null,
        creator_id: creatorId,
        brand_id: brandId,
        status: "invited",
        payment_amount: body.paymentAmount ?? body.paymentExpected,
        deliverables: body.deliverables ?? body.platforms,
        posting_timeline: body.deadline ?? body.timeline,
        content_requirements: body.notes ?? body.proposalDetails,
      })
      .select()
      .single();

    if (dbError) console.error("DB insert error:", dbError.message);
    if (collab?.id) collabId = collab.id;
  }

  try {
    if (senderRole === "brand") {
      await sendInviteEmail({ ...(body as InvitePayload), collaborationId: collabId });
    } else {
      await sendCreatorProposalEmail({ ...(body as CreatorProposalPayload), collaborationId: collabId });
    }
    return Response.json({ success: true, collaborationId: collabId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    return Response.json({ error: message }, { status: 500 });
  }
}
