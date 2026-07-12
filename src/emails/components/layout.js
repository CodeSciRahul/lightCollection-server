import { brand, colors, layout, typography } from "../design/tokens.js";
import { escapeHtml, styleAttr, textStyle } from "../design/utils.js";
import { Header } from "./header.js";
import { Footer } from "./footer.js";

/**
 * Shared email shell — header, content column, footer.
 * Uses nested tables for reliable rendering across Gmail/Outlook/Apple Mail.
 */
export const Layout = ({
  title,
  preheader,
  children,
  supportEmail,
  showSocial = true,
} = {}) => {
  const docTitle = escapeHtml(title || brand.name);

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
  <title>${docTitle}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <style>
    table { border-collapse: collapse; }
    td { font-family: Segoe UI, sans-serif; }
  </style>
  <![endif]-->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: ${colors.cream}; }
    a { color: ${colors.ink}; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .email-body { padding: 24px 20px !important; }
      .email-heading { font-size: 24px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${colors.cream};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${colors.cream};">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" class="email-container" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:${layout.maxWidth};background-color:${colors.white};border-radius:12px;overflow:hidden;border:1px solid ${colors.border};">
          <tr>
            <td>
              ${Header({ preheader })}
            </td>
          </tr>
          <tr>
            <td class="email-body" style="padding:36px 32px 28px;background-color:${colors.white};">
              ${children || ""}
            </td>
          </tr>
          <tr>
            <td>
              ${Footer({ supportEmail, showSocial })}
            </td>
          </tr>
        </table>
        <p style="${styleAttr({
          ...textStyle({
            fontSize: typography.fontSize.xs,
            color: colors.muted,
            textAlign: "center",
            marginTop: "16px",
          }),
        })}">
          Sent by ${escapeHtml(brand.name)} · ${escapeHtml(brand.domain)}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const Heading = ({ children, as = "h1" } = {}) => {
  const Tag = as === "h2" ? "h2" : "h1";
  const size =
    as === "h2" ? typography.fontSize.xl : typography.fontSize["2xl"];

  return `<${Tag} class="email-heading" style="${styleAttr({
    ...textStyle({
      fontSize: size,
      fontWeight: "700",
      lineHeight: typography.lineHeight.tight,
      letterSpacing: "-0.02em",
      margin: "0 0 12px",
      color: colors.ink,
    }),
  })}">${children}</${Tag}>`;
};

export const Paragraph = ({ children, muted = false } = {}) => `
  <p style="${styleAttr({
    ...textStyle({
      color: muted ? colors.gray : colors.ink,
      margin: "0 0 16px",
    }),
  })}">${children}</p>
`;

export const List = ({ items = [] } = {}) => {
  const lis = items
    .map(
      (item) => `
    <li style="${styleAttr({
      ...textStyle({
        marginBottom: "8px",
        color: colors.ink,
      }),
    })}">${item}</li>`
    )
    .join("");

  return `
    <ul style="margin:0 0 16px;padding-left:20px;">
      ${lis}
    </ul>
  `;
};
