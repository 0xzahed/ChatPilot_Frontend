import { render } from "@testing-library/react";
import { Spinner } from "@/components/ui/spinner";

describe("Spinner", () => {
  it("renders spinner svg element", () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("applies animate-spin class", () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("animate-spin");
  });

  it("applies custom className", () => {
    const { container } = render(<Spinner className="h-8 w-8" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("h-8", "w-8");
  });

  it("applies size prop", () => {
    const { container: smContainer } = render(<Spinner size="sm" />);
    const smSvg = smContainer.querySelector("svg");
    expect(smSvg).toHaveClass("h-4");

    const { container: lgContainer } = render(<Spinner size="lg" />);
    const lgSvg = lgContainer.querySelector("svg");
    expect(lgSvg).toHaveClass("h-8");
  });

  it("defaults to default size", () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("h-6");
  });
});
