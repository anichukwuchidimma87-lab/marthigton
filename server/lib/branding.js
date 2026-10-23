const allowedLogoTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
export const maximumLogoBytes = 256 * 1024;

export function validateLogoUpload(contentType, image) {
  if (!allowedLogoTypes.has(contentType)) {
    throw Object.assign(new Error("Upload a PNG, JPEG, or WebP logo image."), { status: 400 });
  }
  if (!Buffer.isBuffer(image) || image.length === 0) {
    throw Object.assign(new Error("The logo image is empty or invalid."), { status: 400 });
  }
  if (image.length > maximumLogoBytes) {
    throw Object.assign(new Error("Logo images must be 256 KB or smaller."), { status: 413 });
  }

  const isPng =
    contentType === "image/png" &&
    image.length >= 24 &&
    image.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) &&
    image.toString("ascii", 12, 16) === "IHDR" &&
    image.readUInt32BE(16) > 0 &&
    image.readUInt32BE(20) > 0 &&
    image.readUInt32BE(16) <= 2048 &&
    image.readUInt32BE(20) <= 2048;
  const isJpeg =
    contentType === "image/jpeg" &&
    image.length >= 3 &&
    image[0] === 0xff &&
    image[1] === 0xd8 &&
    image[2] === 0xff;
  const isWebp =
    contentType === "image/webp" &&
    image.length >= 12 &&
    image.toString("ascii", 0, 4) === "RIFF" &&
    image.toString("ascii", 8, 12) === "WEBP";

  if (!isPng && !isJpeg && !isWebp) {
    throw Object.assign(new Error("Image content does not match a supported logo format."), {
      status: 400,
    });
  }

  return contentType;
}
