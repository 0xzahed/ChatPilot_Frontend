import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("renders an input element", () => {
    render(<Input placeholder="Enter name" />);
    expect(screen.getByPlaceholderText("Enter name")).toBeInTheDocument();
  });

  it("displays typed value", async () => {
    render(<Input placeholder="Type here" />);
    const input = screen.getByPlaceholderText("Type here");
    await userEvent.type(input, "hello world");
    expect(input).toHaveValue("hello world");
  });

  it("supports password type", () => {
    render(<Input type="password" placeholder="Password" />);
    expect(screen.getByPlaceholderText("Password")).toHaveAttribute("type", "password");
  });

  it("supports disabled state", () => {
    render(<Input disabled placeholder="Disabled" />);
    expect(screen.getByPlaceholderText("Disabled")).toBeDisabled();
  });

  it("calls onChange handler", async () => {
    const onChange = jest.fn();
    render(<Input onChange={onChange} placeholder="Test" />);
    await userEvent.type(screen.getByPlaceholderText("Test"), "a");
    expect(onChange).toHaveBeenCalled();
  });

  it("applies custom className", () => {
    render(<Input className="my-input" placeholder="Custom" />);
    expect(screen.getByPlaceholderText("Custom").className).toContain("my-input");
  });

  it("forwards ref", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Input ref={ref} placeholder="Ref" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("supports data attributes", () => {
    render(<Input data-testid="my-input" placeholder="Data" />);
    expect(screen.getByTestId("my-input")).toBeInTheDocument();
  });
});
