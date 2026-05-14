export interface CreatorProposalEmailData {
  brandName: string;
  creatorName: string;
  creatorNiche: string;
  creatorFollowers: string;
  campaignName: string;
  proposalDetails: string;
  paymentExpected: number;
  timeline: string;
  platforms: string;
  acceptUrl: string;
  declineUrl: string;
}

export function creatorProposalEmailHtml(d: CreatorProposalEmailData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Creator Collaboration Proposal — CollabX</title>
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
              <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;">New Collaboration Proposal</h1>
              <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">A creator wants to work with <strong>${d.brandName}</strong></p>
            </td>
          </tr>

          <!-- Creator intro -->
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="color:#A1A1AA;font-size:15px;margin:0 0 20px;">Hi <strong style="color:#fff;">${d.brandName}</strong>,</p>
              <p style="color:#A1A1AA;font-size:15px;line-height:1.6;margin:0 0 24px;">
                <strong style="color:#fff;">${d.creatorName}</strong> has sent you a collaboration proposal on CollabX and would love to work with your brand.
              </p>

              <!-- Creator card -->
              <table width="100%" style="background:rgba(124,92,255,0.1);border:1px solid rgba(124,92,255,0.25);border-radius:14px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="color:#A855F7;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Creator Profile</p>
                    <table width="100%">
                      <tr>
                        <td style="width:50%;padding:6px 0;border-top:1px solid rgba(255,255,255,0.06);">
                          <p style="color:#A1A1AA;font-size:11px;margin:0 0 2px;">Name</p>
                          <p style="color:#fff;font-size:13px;font-weight:600;margin:0;">${d.creatorName}</p>
                        </td>
                        <td style="width:50%;padding:6px 0 6px 16px;border-top:1px solid rgba(255,255,255,0.06);">
                          <p style="color:#A1A1AA;font-size:11px;margin:0 0 2px;">Niche</p>
                          <p style="color:#fff;font-size:13px;font-weight:600;margin:0;">${d.creatorNiche}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;border-top:1px solid rgba(255,255,255,0.06);">
                          <p style="color:#A1A1AA;font-size:11px;margin:0 0 2px;">Followers</p>
                          <p style="color:#10B981;font-size:13px;font-weight:700;margin:0;">${d.creatorFollowers}</p>
                        </td>
                        <td style="padding:6px 0 6px 16px;border-top:1px solid rgba(255,255,255,0.06);">
                          <p style="color:#A1A1AA;font-size:11px;margin:0 0 2px;">Platforms</p>
                          <p style="color:#fff;font-size:13px;font-weight:600;margin:0;">${d.platforms}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Proposal card -->
              <table width="100%" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="color:#A1A1AA;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Proposal For</p>
                    <p style="color:#fff;font-size:17px;font-weight:800;margin:0 0 16px;">${d.campaignName}</p>
                    <table width="100%">
                      <tr>
                        <td style="width:50%;padding:6px 0;border-top:1px solid rgba(255,255,255,0.06);">
                          <p style="color:#A1A1AA;font-size:11px;margin:0 0 2px;">Rate</p>
                          <p style="color:#10B981;font-size:13px;font-weight:700;margin:0;">$${d.paymentExpected.toLocaleString()}</p>
                        </td>
                        <td style="padding:6px 0 6px 16px;border-top:1px solid rgba(255,255,255,0.06);">
                          <p style="color:#A1A1AA;font-size:11px;margin:0 0 2px;">Timeline</p>
                          <p style="color:#fff;font-size:13px;font-weight:600;margin:0;">${d.timeline}</p>
                        </td>
                      </tr>
                    </table>
                    ${d.proposalDetails ? `
                    <div style="margin-top:14px;padding:12px;background:rgba(255,255,255,0.04);border-radius:8px;">
                      <p style="color:#A1A1AA;font-size:11px;margin:0 0 4px;">Message from Creator</p>
                      <p style="color:#fff;font-size:13px;margin:0;line-height:1.5;">${d.proposalDetails}</p>
                    </div>` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table width="100%">
                <tr>
                  <td style="padding-right:8px;" width="50%">
                    <a href="${d.acceptUrl}"
                       style="display:block;text-align:center;background:linear-gradient(135deg,#7C5CFF,#A855F7);color:#fff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 20px;border-radius:100px;box-shadow:0 0 24px rgba(124,92,255,0.4);">
                      ✓ Accept Proposal
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
              <p style="color:#A1A1AA;font-size:12px;margin:16px 0 0;line-height:1.6;text-align:center;">
                This proposal expires in <strong style="color:#fff;">7 days</strong>. Once accepted, both parties are notified and the collaboration goes live on both dashboards.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
              <p style="color:#555;font-size:12px;margin:0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color:#7C5CFF;text-decoration:none;">Manage notifications</a> ·
                <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#7C5CFF;text-decoration:none;">CollabX</a>
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

export function creatorProposalEmailText(d: CreatorProposalEmailData): string {
  return `Hi ${d.brandName},

${d.creatorName} (${d.creatorNiche}, ${d.creatorFollowers} followers) has sent you a collaboration proposal on CollabX.

Campaign: ${d.campaignName}
Rate: $${d.paymentExpected}
Timeline: ${d.timeline}
Platforms: ${d.platforms}
${d.proposalDetails ? `Message: ${d.proposalDetails}` : ""}

Accept: ${d.acceptUrl}
Decline: ${d.declineUrl}

— CollabX Team`;
}
