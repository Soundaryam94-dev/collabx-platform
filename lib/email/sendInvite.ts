"use server";

import { resend, FROM_EMAIL, APP_URL, resolveRecipient } from "@/lib/email/resend";
import { inviteEmailHtml, inviteEmailText } from "@/lib/email/templates/inviteEmail";
import { acceptedEmailHtml } from "@/lib/email/templates/acceptedEmail";
import { declinedEmailHtml } from "@/lib/email/templates/declinedEmail";
import { creatorProposalEmailHtml, creatorProposalEmailText } from "@/lib/email/templates/creatorProposalEmail";
import { proposalAcceptedEmailHtml, proposalDeclinedEmailHtml } from "@/lib/email/templates/proposalResponseEmail";

export interface InvitePayload {
  collaborationId: string;
  creatorEmail: string;
  creatorName: string;
  brandEmail: string;
  brandName: string;
  campaignName: string;
  campaignGoal: string;
  deliverables: string;
  paymentAmount: number;
  deadline: string;
  notes: string;
}

/* Send invite email to creator — called when brand clicks "Invite" */
export async function sendInviteEmail(payload: InvitePayload) {
  const acceptUrl = `${APP_URL}/invite/accept?id=${payload.collaborationId}&action=accept`;
  const declineUrl = `${APP_URL}/invite/accept?id=${payload.collaborationId}&action=decline`;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: resolveRecipient(payload.creatorEmail),
    subject: `${payload.brandName} wants to collaborate with you on CollabX 🚀`,
    html: inviteEmailHtml({
      creatorName: payload.creatorName,
      brandName: payload.brandName,
      campaignName: payload.campaignName,
      campaignGoal: payload.campaignGoal,
      deliverables: payload.deliverables,
      paymentAmount: payload.paymentAmount,
      deadline: payload.deadline,
      notes: payload.notes,
      acceptUrl,
      declineUrl,
    }),
    text: inviteEmailText({
      creatorName: payload.creatorName,
      brandName: payload.brandName,
      campaignName: payload.campaignName,
      campaignGoal: payload.campaignGoal,
      deliverables: payload.deliverables,
      paymentAmount: payload.paymentAmount,
      deadline: payload.deadline,
      notes: payload.notes,
      acceptUrl,
      declineUrl,
    }),
  });

  if (error) throw new Error(error.message);
  return { success: true };
}

/* Send accepted notification to brand — called after creator accepts */
export async function sendAcceptedEmail(payload: {
  brandEmail: string;
  brandName: string;
  creatorName: string;
  campaignName: string;
  paymentAmount: number;
  deadline: string;
}) {
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: resolveRecipient(payload.brandEmail),
    subject: `✅ ${payload.creatorName} accepted your collaboration on CollabX`,
    html: acceptedEmailHtml({
      brandName: payload.brandName,
      creatorName: payload.creatorName,
      campaignName: payload.campaignName,
      paymentAmount: payload.paymentAmount,
      deadline: payload.deadline,
      dashboardUrl: `${APP_URL}/dashboard`,
    }),
  });

  if (error) throw new Error(error.message);
  return { success: true };
}

/* Send declined notification to brand — called after creator declines */
export async function sendDeclinedEmail(payload: {
  brandEmail: string;
  brandName: string;
  creatorName: string;
  campaignName: string;
}) {
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: resolveRecipient(payload.brandEmail),
    subject: `${payload.creatorName} declined your collaboration request`,
    html: declinedEmailHtml({
      brandName: payload.brandName,
      creatorName: payload.creatorName,
      campaignName: payload.campaignName,
      discoverUrl: `${APP_URL}/creators`,
    }),
  });

  if (error) throw new Error(error.message);
  return { success: true };
}

/* ── Creator → Brand direction ── */

export interface CreatorProposalPayload {
  collaborationId: string;
  brandEmail: string;
  brandName: string;
  creatorEmail: string;
  creatorName: string;
  creatorNiche: string;
  creatorFollowers: string;
  campaignName: string;
  proposalDetails: string;
  paymentExpected: number;
  timeline: string;
  platforms: string;
}

/* Send proposal email to brand — called when creator clicks "Propose" */
export async function sendCreatorProposalEmail(payload: CreatorProposalPayload) {
  const acceptUrl = `${APP_URL}/invite/accept?id=${payload.collaborationId}&action=accept&sender=creator`;
  const declineUrl = `${APP_URL}/invite/accept?id=${payload.collaborationId}&action=decline&sender=creator`;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: resolveRecipient(payload.brandEmail),
    subject: `${payload.creatorName} wants to collaborate with ${payload.brandName} on CollabX ⚡`,
    html: creatorProposalEmailHtml({
      brandName: payload.brandName,
      creatorName: payload.creatorName,
      creatorNiche: payload.creatorNiche,
      creatorFollowers: payload.creatorFollowers,
      campaignName: payload.campaignName,
      proposalDetails: payload.proposalDetails,
      paymentExpected: payload.paymentExpected,
      timeline: payload.timeline,
      platforms: payload.platforms,
      acceptUrl,
      declineUrl,
    }),
    text: creatorProposalEmailText({
      brandName: payload.brandName,
      creatorName: payload.creatorName,
      creatorNiche: payload.creatorNiche,
      creatorFollowers: payload.creatorFollowers,
      campaignName: payload.campaignName,
      proposalDetails: payload.proposalDetails,
      paymentExpected: payload.paymentExpected,
      timeline: payload.timeline,
      platforms: payload.platforms,
      acceptUrl,
      declineUrl,
    }),
  });

  if (error) throw new Error(error.message);
  return { success: true };
}

/* Notify creator — brand accepted their proposal */
export async function sendProposalAcceptedEmail(payload: {
  creatorEmail: string;
  creatorName: string;
  brandName: string;
  campaignName: string;
  paymentAmount: number;
}) {
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: resolveRecipient(payload.creatorEmail),
    subject: `🎉 ${payload.brandName} accepted your collaboration proposal on CollabX`,
    html: proposalAcceptedEmailHtml({
      creatorName: payload.creatorName,
      brandName: payload.brandName,
      campaignName: payload.campaignName,
      paymentAmount: payload.paymentAmount,
      dashboardUrl: `${APP_URL}/dashboard`,
    }),
  });

  if (error) throw new Error(error.message);
  return { success: true };
}

/* Notify creator — brand declined their proposal */
export async function sendProposalDeclinedEmail(payload: {
  creatorEmail: string;
  creatorName: string;
  brandName: string;
  campaignName: string;
}) {
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: resolveRecipient(payload.creatorEmail),
    subject: `${payload.brandName} passed on your proposal`,
    html: proposalDeclinedEmailHtml({
      creatorName: payload.creatorName,
      brandName: payload.brandName,
      campaignName: payload.campaignName,
      discoverUrl: `${APP_URL}/brands`,
    }),
  });

  if (error) throw new Error(error.message);
  return { success: true };
}
