import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "@/components/ui/textarea";

describe("Textarea", () => {
  it("renders a textarea element", () => {
    render(<Textarea placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("displays typed value", async () => {
    render(<Textarea placeholder="Type here" />);
    const ta = screen.getByPlaceholderText("Type here");
    await userEvent.type(ta, "hello world");
    expect(ta).toHaveValue("hello world");
  });

  it("supports disabled state", () => {
    render(<Textarea disabled placeholder="Disabled" />);
    expect(screen.getByPlaceholderText("Disabled")).toBeDisabled();
  });

  it("calls onChange handler", async () => {
    const onChange = jest.fn();
    render(<Textarea onChange={onChange} placeholder="Test" />);
    await userEvent.type(screen.getByPlaceholderText("Test"), "a");
    expect(onChange).toHaveBeenCalled();
  });

  it("applies custom className", () => {
    render(<Textarea className="my-textarea" placeholder="Custom" />);
    expect(screen.getByPlaceholderText("Custom")).toHaveClass("my-textarea");
  });

  it("supports rows attribute", () => {
    render(<Textarea rows={5} placeholder="Rows" />);
    expect(screen.getByPlaceholderText("Rows")).toHaveAttribute("rows", "5");
  });

  it("forwards ref", () => {
    const ref = { current: null as HTMLTextAreaElement | null };
    render(<Textarea ref={ref} placeholder="Ref" />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("supports maxLength attribute", () => {
    render(<Textarea maxLength={100} placeholder="Limited" />);
    expect(screen.getByPlaceholderText("Limited")).toHaveAttribute("maxLength", "100");
  });
});
