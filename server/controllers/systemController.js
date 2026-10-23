import mongoose from "mongoose";
import { getRuntimeConfiguration } from "../lib/runtimeConfiguration.js";

export function getSystemConfiguration(_request, response) {
  response.set("Cache-Control", "no-store");
  response.json({
    configuration: getRuntimeConfiguration(
      process.env,
      mongoose.connection.readyState,
    ),
  });
}
