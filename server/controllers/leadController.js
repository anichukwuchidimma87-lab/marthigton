import Lead from "../models/Lead.js";
import {
  normalizeEmail,
  normalizePhone,
  normalizeReferralCode,
  optionalText,
  requireObjectBody,
  requiredText,
} from "../lib/validation.js";

export async function createLead(request, response) {
  const body = requireObjectBody(request);
  if (typeof body.tipsOptIn !== "boolean") {
    throw Object.assign(new Error("Please specify whether you want to receive tips."), {
      status: 400,
    });
  }
  const lead = await Lead.create({
    name: requiredText(body.name, "Name", 120),
    phone: normalizePhone(body.phone),
    email: body.email ? normalizeEmail(body.email) : undefined,
    referralCode: normalizeReferralCode(body.referralCode),
    tipsOptIn: body.tipsOptIn,
  });
  response.status(201).json({ lead: { id: lead.id, status: lead.status } });
}

export async function listLeads(request, response) {
  const page = Math.max(1, Math.min(10000, Number.parseInt(request.query.page, 10) || 1));
  const limit = Math.max(1, Math.min(100, Number.parseInt(request.query.limit, 10) || 50));
  const [items, total] = await Promise.all([
    Lead.find()
      .select("name email phone referralCode tipsOptIn status createdAt")
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Lead.countDocuments(),
  ]);
  response.json({ items, page, limit, total });
}

export async function updateLead(request, response) {
  const body = requireObjectBody(request);
  if (!["new", "contacted", "converted"].includes(body.status)) {
    throw Object.assign(new Error("Lead status must be new, contacted, or converted."), {
      status: 400,
    });
  }
  const lead = await Lead.findByIdAndUpdate(
    request.params.id,
    { status: body.status },
    { new: true, runValidators: true },
  ).select("name email phone referralCode tipsOptIn status createdAt");
  if (!lead) {
    throw Object.assign(new Error("Lead was not found."), { status: 404 });
  }
  response.json({ lead });
}
