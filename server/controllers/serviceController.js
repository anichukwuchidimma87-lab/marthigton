import Service from "../models/Service.js";
import {
  requireObjectBody,
  requiredText,
} from "../lib/validation.js";

export async function listServices(_request, response) {
  const items = await Service.find({ active: true }).sort({ name: 1 }).lean();
  response.json({ items });
}

export async function listManagedServices(_request, response) {
  const items = await Service.find().sort({ name: 1 }).lean();
  response.json({ items });
}

export async function createService(request, response) {
  const body = requireObjectBody(request);
  const service = await Service.create({
    name: requiredText(body.name, "Name", 160),
    description: requiredText(body.description, "Description", 3000),
    price: validatePrice(body.price),
    currency: body.currency ? validateCurrency(body.currency) : "NGN",
  });
  response.status(201).json({ service });
}

export async function updateService(request, response) {
  const body = requireObjectBody(request);
  const updates = {};
  if (body.name !== undefined) updates.name = requiredText(body.name, "Name", 160);
  if (body.description !== undefined) {
    updates.description = requiredText(body.description, "Description", 3000);
  }
  if (body.price !== undefined) {
    updates.price = body.price === null || body.price === "" ? null : validatePrice(body.price);
  }
  if (body.currency !== undefined) {
    updates.currency = validateCurrency(body.currency);
  }
  if (body.active !== undefined) {
    if (typeof body.active !== "boolean") {
      throw Object.assign(new Error("Active must be a boolean."), { status: 400 });
    }
    updates.active = body.active;
  }
  if (!Object.keys(updates).length) {
    throw Object.assign(new Error("Provide at least one supported service field to update."), {
      status: 400,
    });
  }

  const service = await Service.findByIdAndUpdate(request.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!service) {
    throw Object.assign(new Error("Service was not found."), { status: 404 });
  }
  response.json({ service });
}

function validatePrice(value) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "number" && (typeof value !== "string" || !/^\d+(\.\d{1,2})?$/.test(value))) {
    throw Object.assign(new Error("Price must be a non-negative number."), { status: 400 });
  }
  const price = Number(value);
  if (!Number.isFinite(price) || price < 0 || price > 1000000000) {
    throw Object.assign(new Error("Price must be a non-negative number."), { status: 400 });
  }
  return price;
}

function validateCurrency(value) {
  const currency = requiredText(value, "Currency", 3).toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw Object.assign(new Error("Currency must be a three-letter currency code."), {
      status: 400,
    });
  }
  return currency;
}
