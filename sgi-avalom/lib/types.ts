// Re-export all types from the new types module for backward compatibility
// New code should import from "@/lib/types" which will resolve to this file
// or directly from "@/lib/types/entities", "@/lib/types/forms", "@/lib/types/payloads"
export * from "./types/entities";
export * from "./types/forms";
export * from "./types/payloads";
