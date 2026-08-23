import { render, screen } from "@testing-library/react";
import { Inbox } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

describe("EmptyState", () => {
  it("renders title", () => {
    render(<EmptyState title="No data" />);
    expect(screen.getByText("No data")).toBeInTheDocument();
  });

  it("renders title as heading", () => {
    render(<EmptyState title="Nothing here" />);
    const heading = screen.getByText("Nothing here");
    expect(heading.tagName).toBe("H3");
  });

  it("renders description when provided", () => {
    render(
      <EmptyState title="Empty" description="No items found yet." />
    );
    expect(screen.getByText("No items found yet.")).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    render(<EmptyState title="Empty" />);
    expect(screen.queryByText("No items")).not.toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    const { container } = render(
      <EmptyState icon={Inbox} title="No messages" />
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("does not render icon when not provided", () => {
    const { container } = render(<EmptyState title="No icon" />);
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("renders action when provided", () => {
    render(
      <EmptyState
        title="No data"
        action={<Button>Create New</Button>}
      />
    );
    expect(screen.getByText("Create New")).toBeInTheDocument();
  });

  it("does not render action when not provided", () => {
    render(<EmptyState title="No action" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<EmptyState title="Test" className="my-empty" />);
    expect(container.firstChild).toHaveClass("my-empty");
  });

  it("applies dashed border class", () => {
    const { container } = render(<EmptyState title="Test" />);
    expect(container.firstChild).toHaveClass("border-dashed");
  });
});
