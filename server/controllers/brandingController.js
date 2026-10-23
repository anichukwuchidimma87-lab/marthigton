import SiteSettings from "../models/SiteSettings.js";
import { validateLogoUpload } from "../lib/branding.js";
import { requireObjectBody, requiredText } from "../lib/validation.js";

export async function getPublicBranding(_request, response) {
  const settings = await SiteSettings.findById("site-branding").lean();
  response.set("Cache-Control", "no-store");
  response.json({
    branding: serializeBranding(settings),
  });
}

export async function updateBranding(request, response) {
  const body = requireObjectBody(request);
  const allowedKeys = new Set(["brandName", "tagline"]);
  if (Object.keys(body).some((key) => !allowedKeys.has(key))) {
    throw Object.assign(new Error("Only brand name and tagline can be updated here."), {
      status: 400,
    });
  }

  const updates = {};
  if (body.brandName !== undefined) {
    updates.brandName = requiredText(body.brandName, "Brand name", 80);
  }
  if (body.tagline !== undefined) {
    updates.tagline = requiredText(body.tagline, "Tagline", 120);
  }
  if (!Object.keys(updates).length) {
    throw Object.assign(new Error("Provide a brand name or tagline to update."), {
      status: 400,
    });
  }

  const settings = await SiteSettings.findByIdAndUpdate(
    "site-branding",
    { $set: updates },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).lean();
  response.json({ branding: serializeBranding(settings) });
}

export async function updateBrandLogo(request, response) {
  const mimeType = validateLogoUpload(request.get("content-type"), request.body);
  const settings = await SiteSettings.findByIdAndUpdate(
    "site-branding",
    { $set: { logo: { mimeType, data: request.body } } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).lean();
  response.json({ branding: serializeBranding(settings) });
}

export async function removeBrandLogo(_request, response) {
  const settings = await SiteSettings.findByIdAndUpdate(
    "site-branding",
    { $unset: { logo: 1 } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).lean();
  response.json({ branding: serializeBranding(settings) });
}

function serializeBranding(settings) {
  const logo = settings?.logo?.data;
  return {
    brandName: settings?.brandName || "Marthington",
    tagline: settings?.tagline || "Family & maternal care",
    logoDataUrl:
      logo && settings.logo.mimeType
        ? `data:${settings.logo.mimeType};base64,${Buffer.from(logo).toString("base64")}`
        : null,
    logoMimeType: settings?.logo?.mimeType || null,
  };
}
