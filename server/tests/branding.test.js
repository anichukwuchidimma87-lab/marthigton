import assert from "node:assert/strict";
import test from "node:test";
import { maximumLogoBytes, validateLogoUpload } from "../lib/branding.js";

function pngHeader(width = 64, height = 64) {
  const image = Buffer.alloc(24);
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(image);
  image.write("IHDR", 12, "ascii");
  image.writeUInt32BE(width, 16);
  image.writeUInt32BE(height, 20);
  return image;
}

test("accepts a small PNG with bounded dimensions", () => {
  assert.equal(validateLogoUpload("image/png", pngHeader()), "image/png");
});

test("rejects unsupported MIME types and mismatched file content", () => {
  assert.throws(() => validateLogoUpload("image/svg+xml", Buffer.from("<svg/>")), {
    status: 400,
  });
  assert.throws(() => validateLogoUpload("image/jpeg", pngHeader()), { status: 400 });
});

test("rejects oversized and excessive-dimension PNG logos", () => {
  assert.throws(
    () => validateLogoUpload("image/png", Buffer.alloc(maximumLogoBytes + 1)),
    { status: 413 },
  );
  assert.throws(() => validateLogoUpload("image/png", pngHeader(2049, 64)), {
    status: 400,
  });
});
