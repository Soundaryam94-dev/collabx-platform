export interface DeclinedEmailData {
  brandName: string;
  creatorName: string;
  campaignName: string;
  discoverUrl: string;
}

export function declinedEmailHtml(d: DeclinedEmailData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invitation Declined — CollabX</title>
</head>
<body style="margin:0;padding:0;background:#0B1020;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B1020;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:linear-gradient(135deg,#111827,#1a2035);border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#374151,#4B5563);padding:32px 40px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;">Invitation Declined</h1>
              <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:14px;">${d.creatorName} is unavailable for this campaign</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="color:#A1A1AA;font-size:15px;margin:0 0 20px;">Hi <strong style="color:#fff;">${d.brandName}</strong>,</p>
              <p style="color:#A1A1AA;font-size:15px;line-height:1.6;margin:0 0 28px;">
                Unfortunately, <strong style="color:#fff;">${d.creatorName}</strong> has declined your invitation for <strong style="color:#fff;">${d.campaignName}</strong>. Don't worry — there are thousands of other creators on CollabX ready to work with you.
              </p>

              <a href="${d.discoverUrl}"
                 style="display:inline-block;background:linear-gradient(135deg,#7C5CFF,#A855F7);color:#fff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:100px;box-shadow:0 0 24px rgba(124,92,255,0.4);">
                Find More Creators →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
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
