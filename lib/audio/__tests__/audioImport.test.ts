import { describe, it, expect } from "vitest";
import { formatDuration } from "../audioImport";

describe("formatDuration", () => {
  it("formats 0 seconds as 00:00", () => {
    expect(formatDuration(0)).toBe("00:00");
  });

  it("formats 61 seconds as 01:01", () => {
    expect(formatDuration(61)).toBe("01:01");
  });

  it("formats 3600 seconds as 60:00", () => {
    expect(formatDuration(3600)).toBe("60:00");
  });

  it("pads single-digit seconds with a leading zero", () => {
    expect(formatDuration(65)).toBe("01:05");
  });

  it("handles large durations correctly", () => {
    expect(formatDuration(3661)).toBe("61:01");
  });
});
