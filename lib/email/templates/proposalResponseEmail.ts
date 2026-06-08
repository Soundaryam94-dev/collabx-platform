export interface ProposalAcceptedEmailData {
  creatorName: string;
  brandName: string;
  campaignName: string;
  dashboardUrl: string;
}

export function proposalAcceptedEmailHtml(d: ProposalAcceptedEmailData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Proposal Accepted — CollabX</title>
</head>
<body style="margin:0;padding:0;background:#0B1020;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B1020;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:linear-gradient(135deg,#111827,#1a2035);border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#059669,#10B981);padding:32px 40px;text-align:center;">
              <div style="font-size:40px;margin-bottom:12px;">🎉</div>
              <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;">Your Proposal was Accepted!</h1>
              <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">${d.brandName} wants to work with you</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <p style="color:#A1A1AA;font-size:15px;margin:0 0 20px;">Hi <strong style="color:#fff;">${d.creatorName}</strong>,</p>
              <p style="color:#A1A1AA;font-size:15px;line-height:1.6;margin:0 0 28px;">
                Congratulations! <strong style="color:#fff;">${d.brandName}</strong> has accepted your collaboration proposal for <strong style="color:#fff;">${d.campaignName}</strong>. The collaboration is now active on both dashboards.
              </p>
              <table width="100%" style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.25);border-radius:14px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="color:#10B981;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">● Collaboration Active</p>
                    <table width="100%">
                      <tr>
                        <td style="width:50%;padding:6px 0;border-top:1px solid rgba(255,255,255,0.06);">
                          <p style="color:#A1A1AA;font-size:11px;margin:0 0 2px;">Brand</p>
                          <p style="color:#fff;font-size:13px;font-weight:600;margin:0;">${d.brandName}</p>
                        </td>
                        <td style="width:50%;padding:6px 0 6px 16px;border-top:1px solid rgba(255,255,255,0.06);">
                          <p style="color:#A1A1AA;font-size:11px;margin:0 0 2px;">Status</p>
                          <p style="color:#10B981;font-size:13px;font-weight:700;margin:0;">Active</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <a href="${d.dashboardUrl}" style="display:inline-block;background:linear-gradient(135deg,#7C5CFF,#A855F7);color:#fff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:100px;box-shadow:0 0 24px rgba(124,92,255,0.4);">
                View Dashboard →
              </a>
            </td>
          </tr>
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

export interface ProposalDeclinedEmailData {
  creatorName: string;
  brandName: string;
  campaignName: string;
  discoverUrl: string;
}

export function proposalDeclinedEmailHtml(d: ProposalDeclinedEmailData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Proposal Declined — CollabX</title>
</head>
<body style="margin:0;padding:0;background:#0B1020;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B1020;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:linear-gradient(135deg,#111827,#1a2035);border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#374151,#4B5563);padding:32px 40px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;">Proposal Declined</h1>
              <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:14px;">${d.brandName} is not available for this collaboration</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <p style="color:#A1A1AA;font-size:15px;margin:0 0 20px;">Hi <strong style="color:#fff;">${d.creatorName}</strong>,</p>
              <p style="color:#A1A1AA;font-size:15px;line-height:1.6;margin:0 0 28px;">
                Unfortunately, <strong style="color:#fff;">${d.brandName}</strong> has declined your proposal for <strong style="color:#fff;">${d.campaignName}</strong>. There are many more brands on CollabX looking for talented creators like you.
              </p>
              <a href="${d.discoverUrl}" style="display:inline-block;background:linear-gradient(135deg,#7C5CFF,#A855F7);color:#fff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:100px;box-shadow:0 0 24px rgba(124,92,255,0.4);">
                Discover More Brands →
              </a>
            </td>
          </tr>
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
