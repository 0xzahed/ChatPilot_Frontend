import {
  cn,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTime,
  timeAgo,
  getInitials,
  debounce,
} from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", true && "visible")).toBe("base visible");
  });

  it("deduplicates tailwind classes", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });
});

describe("formatCurrency", () => {
  it("formats number with currency symbol", () => {
    expect(formatCurrency(1234.56)).toBe("৳1,234.56");
  });

  it("formats string number", () => {
    expect(formatCurrency("999")).toBe("৳999");
  });

  it("uses custom currency symbol", () => {
    expect(formatCurrency(100, "$")).toBe("$100");
  });

  it("handles zero", () => {
    expect(formatCurrency(0)).toBe("৳0");
  });
});

describe("formatDate", () => {
  it("formats ISO date string", () => {
    const result = formatDate("2026-01-15T10:00:00Z");
    expect(result).toMatch(/Jan.*15.*2026/);
  });

  it("formats Date object", () => {
    const d = new Date(2026, 5, 1);
    expect(formatDate(d)).toContain("2026");
  });

  it("accepts custom options", () => {
    const result = formatDate("2026-01-15", { year: "numeric", month: "long" });
    expect(result).toContain("January");
    expect(result).toContain("2026");
  });
});

describe("formatDateTime", () => {
  it("formats date and time", () => {
    const result = formatDateTime("2026-01-15T14:30:00Z");
    expect(result).toMatch(/Jan.*15/);
  });
});

describe("formatTime", () => {
  it("formats time from ISO string", () => {
    const result = formatTime("2026-01-15T14:30:00Z");
    expect(result).toMatch(/\d{2}:\d{2}/);
  });
});

describe("timeAgo", () => {
  it("returns 'just now' for recent dates", () => {
    expect(timeAgo(new Date())).toBe("just now");
  });

  it("returns minutes ago", () => {
    const d = new Date(Date.now() - 5 * 60 * 1000);
    expect(timeAgo(d)).toBe("5m ago");
  });

  it("returns hours ago", () => {
    const d = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(timeAgo(d)).toBe("3h ago");
  });

  it("returns days ago", () => {
    const d = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    expect(timeAgo(d)).toBe("2d ago");
  });
});

describe("getInitials", () => {
  it("returns initials for full name", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("returns first two initials for long name", () => {
    expect(getInitials("John Michael Doe")).toBe("JM");
  });

  it("handles single name", () => {
    expect(getInitials("John")).toBe("J");
  });

  it("handles lowercase", () => {
    expect(getInitials("john doe")).toBe("JD");
  });

  it("handles empty string", () => {
    expect(getInitials("")).toBe("?");
  });
});

describe("debounce", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("calls function after delay", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 500);
    debounced("arg");
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledWith("arg");
  });

  it("cancels previous call on rapid invoke", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 500);
    debounced("first");
    jest.advanceTimersByTime(200);
    debounced("second");
    jest.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("second");
  });
});
