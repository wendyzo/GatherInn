import { describe, it, expect } from "vitest";
import { keywordsOf, addMinutes } from "../event.utils";

describe("keywordsOf", () => {
  it("extracts meaningful keywords", () => {
    expect(keywordsOf("Photography Gala Night")).toEqual(["photography", "gala"]);
  });

  it("filters out stopwords", () => {
    expect(keywordsOf("The Annual Event")).toEqual([]);
  });

  it("filters short words", () => {
    expect(keywordsOf("AI Summit")).toEqual(["summit"]);
  });

  it("handles numbers in names", () => {
    expect(keywordsOf("Tech Conference 2025")).toEqual(["tech", "conference"]);
  });

  it("returns empty array for empty string", () => {
    expect(keywordsOf("")).toEqual([]);
  });

  it("lowercases all keywords", () => {
    const result = keywordsOf("CHESS Tournament");
    expect(result).toEqual(["chess", "tournament"]);
  });
});

describe("addMinutes", () => {
  it("adds minutes within the same hour", () => {
    expect(addMinutes("09:00", 30)).toBe("09:30");
  });

  it("rolls over to the next hour", () => {
    expect(addMinutes("09:45", 30)).toBe("10:15");
  });

  it("wraps around midnight", () => {
    expect(addMinutes("23:50", 20)).toBe("00:10");
  });

  it("handles zero minutes", () => {
    expect(addMinutes("14:30", 0)).toBe("14:30");
  });

  it("pads single-digit hours and minutes", () => {
    expect(addMinutes("00:05", 5)).toBe("00:10");
  });

  it("handles full day wrap (1440 min)", () => {
    expect(addMinutes("12:00", 1440)).toBe("12:00");
  });
});
