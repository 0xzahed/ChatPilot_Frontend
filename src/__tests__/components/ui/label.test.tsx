import { render, screen } from "@testing-library/react";
import { Label } from "@/components/ui/label";

describe("Label", () => {
  it("renders a label element", () => {
    render(<Label>Name</Label>);
    expect(screen.getByText("Name")).toBeInTheDocument();
  });

  it("renders as label tag", () => {
    render(<Label data-testid="label">Email</Label>);
    expect(screen.getByTestId("label").tagName).toBe("LABEL");
  });

  it("applies font-medium class", () => {
    render(<Label data-testid="label">Test</Label>);
    expect(screen.getByTestId("label")).toHaveClass("font-medium");
  });

  it("applies custom className", () => {
    render(<Label className="my-label" data-testid="label">Test</Label>);
    expect(screen.getByTestId("label")).toHaveClass("my-label");
  });

  it("supports htmlFor attribute", () => {
    render(<Label htmlFor="input-id">Field</Label>);
    expect(screen.getByText("Field")).toHaveAttribute("for", "input-id");
  });

  it("forwards ref", () => {
    const ref = { current: null as HTMLLabelElement | null };
    render(<Label ref={ref}>Ref</Label>);
    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
  });
});
