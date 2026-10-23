import Appointment from "../models/Appointment.js";
import Service from "../models/Service.js";
import {
  futureDate,
  normalizeEmail,
  normalizePhone,
  requireObjectBody,
  requiredText,
} from "../lib/validation.js";

const statuses = new Set(["requested", "confirmed", "cancelled", "completed"]);

export async function createAppointment(request, response) {
  const body = requireObjectBody(request);
  const name = requiredText(body.name, "Name", 120);
  const phone = normalizePhone(body.phone);
  const serviceId = requiredText(body.serviceId, "Service", 64);
  const requestedAt = futureDate(body.requestedAt, "Preferred date");

  const service = await Service.findOne({ _id: serviceId, active: true }).select("_id");
  if (!service) {
    throw Object.assign(new Error("That service is not currently available for booking."), {
      status: 400,
    });
  }

  const appointment = await Appointment.create({
    name,
    phone,
    email: body.email ? normalizeEmail(body.email) : undefined,
    service: service.id,
    requestedAt,
  });
  response.status(201).json({
    appointment: { id: appointment.id, status: appointment.status },
  });
}

export async function listAppointments(request, response) {
  const page = Math.max(1, Math.min(10000, Number.parseInt(request.query.page, 10) || 1));
  const limit = Math.max(1, Math.min(100, Number.parseInt(request.query.limit, 10) || 50));
  const filter = {};
  if (request.query.status) {
    if (!statuses.has(request.query.status)) {
      throw Object.assign(new Error("Appointment status filter is invalid."), { status: 400 });
    }
    filter.status = request.query.status;
  }

  const [items, total] = await Promise.all([
    Appointment.find(filter)
      .select("name phone email service requestedAt status createdAt")
      .populate("service", "name")
      .sort({ requestedAt: 1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Appointment.countDocuments(filter),
  ]);
  response.json({ items, page, limit, total });
}

export async function updateAppointment(request, response) {
  const body = requireObjectBody(request);
  if (!statuses.has(body.status)) {
    throw Object.assign(new Error("Provide a valid appointment status."), { status: 400 });
  }

  const appointment = await Appointment.findByIdAndUpdate(
    request.params.id,
    { status: body.status },
    { new: true, runValidators: true },
  )
    .select("name phone email service requestedAt status createdAt")
    .populate("service", "name");
  if (!appointment) {
    throw Object.assign(new Error("Appointment was not found."), { status: 404 });
  }
  response.json({ appointment });
}
