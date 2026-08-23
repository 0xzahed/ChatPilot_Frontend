import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Switch } from "@/components/ui/switch";

describe("Switch", () => {
  it("renders with role switch", () => {
    render(<Switch checked={false} onChange={jest.fn()} />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("reflects checked state in aria-checked", () => {
    const { rerender } = render(
      <Switch checked={false} onChange={jest.fn()} />
    );
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");

    rerender(<Switch checked={true} onChange={jest.fn()} />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("calls onChange with toggled value when clicked", async () => {
    const onChange = jest.fn();
    render(<Switch checked={false} onChange={onChange} />);
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("calls onChange with false when checked and clicked", async () => {
    const onChange = jest.fn();
    render(<Switch checked={true} onChange={onChange} />);
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("does not call onChange when disabled", async () => {
    const onChange = jest.fn();
    render(
      <Switch checked={false} onChange={onChange} disabled />
    );
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("applies aria-label", () => {
    render(
      <Switch checked={false} onChange={jest.fn()} aria-label="Enable AI" />
    );
    expect(screen.getByRole("switch")).toHaveAttribute("aria-label", "Enable AI");
  });

  it("applies bg-primary class when checked", () => {
    render(<Switch checked={true} onChange={jest.fn()} />);
    expect(screen.getByRole("switch").className).toContain("bg-primary");
  });

  it("applies bg-input class when unchecked", () => {
    render(<Switch checked={false} onChange={jest.fn()} />);
    expect(screen.getByRole("switch").className).toContain("bg-input");
  });
});
