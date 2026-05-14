export interface InviteEmailData {
  creatorName: string;
  brandName: string;
  campaignName: string;
  campaignGoal: string;
  deliverables: string;
  paymentAmount: number;
  deadline: string;
  notes: string;
  acceptUrl: string;
  declineUrl: string;
}

export function inviteEmailHtml(d: InviteEmailData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Collaboration Invitation — CollabX</title>
</head>
<body style="margin:0;padding:0;background:#0B1020;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B1020;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:linear-gradient(135deg,#111827,#1a2035);border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#7C5CFF,#A855F7);padding:32px 40px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:10px 20px;margin-bottom:12px;">
                <span style="color:#fff;font-size:18px;font-weight:800;letter-spacing:-0.5px;">⚡ CollabX</span>
              </div>
              <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;">You've been invited!</h1>
              <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">${d.brandName} wants to collaborate with you</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="color:#A1A1AA;font-size:15px;margin:0 0 24px;">Hi <strong style="color:#fff;">${d.creatorName}</strong>,</p>
              <p style="color:#A1A1AA;font-size:15px;margin:0 0 28px;line-height:1.6;">
                <strong style="color:#fff;">${d.brandName}</strong> has sent you a collaboration invitation on CollabX. Here are the campaign details:
              </p>

              <!-- Campaign card -->
              <table width="100%" style="background:rgba(124,92,255,0.1);border:1px solid rgba(124,92,255,0.25);border-radius:14px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px;">
                    <p style="color:#A855F7;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Campaign</p>
                    <p style="color:#fff;font-size:18px;font-weight:800;margin:0 0 20px;">${d.campaignName}</p>

                    <table width="100%" style="border-collapse:collapse;">
                      <tr>
                        <td style="width:50%;padding:8px 0;border-top:1px solid rgba(255,255,255,0.06);">
                          <p style="color:#A1A1AA;font-size:11px;margin:0 0 2px;">Goal</p>
                          <p style="color:#fff;font-size:13px;font-weight:600;margin:0;">${d.campaignGoal}</p>
                        </td>
                        <td style="width:50%;padding:8px 0 8px 16px;border-top:1px solid rgba(255,255,255,0.06);">
                          <p style="color:#A1A1AA;font-size:11px;margin:0 0 2px;">Payment</p>
                          <p style="color:#10B981;font-size:13px;font-weight:700;margin:0;">$${d.paymentAmount.toLocaleString()}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-top:1px solid rgba(255,255,255,0.06);">
                          <p style="color:#A1A1AA;font-size:11px;margin:0 0 2px;">Deliverables</p>
                          <p style="color:#fff;font-size:13px;font-weight:600;margin:0;">${d.deliverables}</p>
                        </td>
                        <td style="padding:8px 0 8px 16px;border-top:1px solid rgba(255,255,255,0.06);">
                          <p style="color:#A1A1AA;font-size:11px;margin:0 0 2px;">Deadline</p>
                          <p style="color:#fff;font-size:13px;font-weight:600;margin:0;">${d.deadline}</p>
                        </td>
                      </tr>
                    </table>

                    ${d.notes ? `
                    <div style="margin-top:16px;padding:12px;background:rgba(255,255,255,0.05);border-radius:8px;">
                      <p style="color:#A1A1AA;font-size:11px;margin:0 0 4px;">Brand Notes</p>
                      <p style="color:#fff;font-size:13px;margin:0;line-height:1.5;">${d.notes}</p>
                    </div>` : ""}
                  </td>
                </tr>
              </table>

              <!-- CTA buttons -->
              <table width="100%" style="margin-bottom:28px;">
                <tr>
                  <td style="padding-right:8px;" width="50%">
                    <a href="${d.acceptUrl}"
                       style="display:block;text-align:center;background:linear-gradient(135deg,#7C5CFF,#A855F7);color:#fff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 20px;border-radius:100px;box-shadow:0 0 24px rgba(124,92,255,0.4);">
                      ✓ Accept Invitation
                    </a>
                  </td>
                  <td style="padding-left:8px;" width="50%">
                    <a href="${d.declineUrl}"
                       style="display:block;text-align:center;background:rgba(255,255,255,0.08);color:#A1A1AA;font-size:15px;font-weight:600;text-decoration:none;padding:14px 20px;border-radius:100px;border:1px solid rgba(255,255,255,0.1);">
                      Decline
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color:#A1A1AA;font-size:13px;line-height:1.6;margin:0;">
                This invitation will expire in <strong style="color:#fff;">7 days</strong>. Once you accept, both you and ${d.brandName} will be notified and the collaboration will be created on your dashboards.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
              <p style="color:#555;font-size:12px;margin:0;">
                You received this because you are registered on CollabX.<br/>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color:#7C5CFF;text-decoration:none;">Manage notifications</a> ·
                <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#7C5CFF;text-decoration:none;">Visit CollabX</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function inviteEmailText(d: InviteEmailData): string {
  return `Hi ${d.creatorName},

${d.brandName} has invited you to collaborate on CollabX.

Campaign: ${d.campaignName}
Goal: ${d.campaignGoal}
Payment: $${d.paymentAmount}
Deliverables: ${d.deliverables}
Deadline: ${d.deadline}
${d.notes ? `Notes: ${d.notes}` : ""}

Accept: ${d.acceptUrl}
Decline: ${d.declineUrl}

— CollabX Team`;
}
