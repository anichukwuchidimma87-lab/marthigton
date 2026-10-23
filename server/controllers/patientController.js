import Patient from "../models/Patient.js";
import {
  normalizeEmail,
  normalizePhone,
  requireObjectBody,
  requiredText,
} from "../lib/validation.js";

const statuses = new Set(["lead", "active", "postpartumFollowUp"]);

export async function listPatients(request, response) {
  const page = Math.max(1, Math.min(10000, Number.parseInt(request.query.page, 10) || 1));
  const limit = Math.max(1, Math.min(100, Number.parseInt(request.query.limit, 10) || 50));
  const filter = {};
  if (request.query.status) {
    if (!statuses.has(request.query.status)) {
      throw Object.assign(new Error("Patient status filter is invalid."), { status: 400 });
    }
    filter.status = request.query.status;
  }

  const [items, total] = await Promise.all([
    Patient.find(filter)
      .select("name phone email status whatsappOptIn createdAt updatedAt")
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Patient.countDocuments(filter),
  ]);
  response.json({ items, page, limit, total });
}

export async function createPatient(request, response) {
  const body = requireObjectBody(request);
  if (typeof body.whatsappOptIn !== "boolean") {
    throw Object.assign(new Error("WhatsApp contact permission must be explicitly recorded."), {
      status: 400,
    });
  }
  const patient = await Patient.create({
    name: requiredText(body.name, "Name", 120),
    phone: normalizePhone(body.phone),
    email: body.email ? normalizeEmail(body.email) : undefined,
    whatsappOptIn: body.whatsappOptIn,
    createdBy: request.user.id,
  });
  response.status(201).json({
    patient: serializePatient(patient),
  });
}

export async function updatePatient(request, response) {
  const body = requireObjectBody(request);
  const updates = {};
  if (body.name !== undefined) updates.name = requiredText(body.name, "Name", 120);
  if (body.phone !== undefined) updates.phone = normalizePhone(body.phone);
  if (body.email !== undefined) {
    updates.email = body.email ? normalizeEmail(body.email) : "";
  }
  if (body.status !== undefined) {
    if (!statuses.has(body.status)) {
      throw Object.assign(new Error("Patient status is invalid."), { status: 400 });
    }
    updates.status = body.status;
  }
  if (body.whatsappOptIn !== undefined) {
    if (typeof body.whatsappOptIn !== "boolean") {
      throw Object.assign(new Error("WhatsApp contact permission must be a boolean."), { status: 400 });
    }
    updates.whatsappOptIn = body.whatsappOptIn;
  }
  if (!Object.keys(updates).length) {
    throw Object.assign(new Error("Provide at least one supported patient field to update."), {
      status: 400,
    });
  }

  const patient = await Patient.findByIdAndUpdate(request.params.id, updates, {
    new: true,
    runValidators: true,
  }).select("name phone email status whatsappOptIn createdAt updatedAt");
  if (!patient) {
    throw Object.assign(new Error("Patient was not found."), { status: 404 });
  }
  response.json({ patient });
}

function serializePatient(patient) {
  return {
    _id: patient.id,
    name: patient.name,
    phone: patient.phone,
    email: patient.email,
    status: patient.status,
    whatsappOptIn: patient.whatsappOptIn,
    createdAt: patient.createdAt,
    updatedAt: patient.updatedAt,
  };
}
