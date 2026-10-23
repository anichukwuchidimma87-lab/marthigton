import Campaign from "../models/Campaign.js";
import {
  optionalText,
  requireObjectBody,
  requiredText,
} from "../lib/validation.js";

const statuses = new Set(["draft", "scheduled", "active", "completed"]);

export async function listCampaigns(_request, response) {
  const items = await Campaign.find()
    .sort({ updatedAt: -1 })
    .lean();
  response.json({ items });
}

export async function createCampaign(request, response) {
  const body = requireObjectBody(request);
  const campaign = await Campaign.create({
    name: requiredText(body.name, "Name", 160),
    objective: requiredText(body.objective, "Objective", 2000),
    messageTemplate: optionalText(body.messageTemplate, "Message template", 5000),
    createdBy: request.user.id,
  });
  response.status(201).json({ campaign });
}

export async function updateCampaign(request, response) {
  const body = requireObjectBody(request);
  const updates = {};
  if (body.name !== undefined) updates.name = requiredText(body.name, "Name", 160);
  if (body.objective !== undefined) {
    updates.objective = requiredText(body.objective, "Objective", 2000);
  }
  if (body.messageTemplate !== undefined) {
    updates.messageTemplate = optionalText(body.messageTemplate, "Message template", 5000) || "";
  }
  if (body.status !== undefined) {
    if (!statuses.has(body.status)) {
      throw Object.assign(new Error("Campaign status is invalid."), { status: 400 });
    }
    updates.status = body.status;
  }
  if (body.scheduledAt !== undefined) {
    const scheduledAt = new Date(body.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime())) {
      throw Object.assign(new Error("Scheduled date is invalid."), { status: 400 });
    }
    updates.scheduledAt = scheduledAt;
  }
  if (!Object.keys(updates).length) {
    throw Object.assign(new Error("Provide at least one supported campaign field to update."), {
      status: 400,
    });
  }

  const campaign = await Campaign.findByIdAndUpdate(request.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!campaign) {
    throw Object.assign(new Error("Campaign was not found."), { status: 404 });
  }
  response.json({ campaign });
}
