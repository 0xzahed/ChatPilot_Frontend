import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

describe("Dialog", () => {
  it("does not render when open is false", () => {
    render(<Dialog open={false} onClose={jest.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders when open is true", () => {
    render(<Dialog open={true} onClose={jest.fn()} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders title", () => {
    render(<Dialog open={true} onClose={jest.fn()} title="My Dialog" />);
    expect(screen.getByText("My Dialog")).toBeInTheDocument();
  });

  it("renders title as h2", () => {
    render(<Dialog open={true} onClose={jest.fn()} title="Title" />);
    expect(screen.getByText("Title").tagName).toBe("H2");
  });

  it("renders description", () => {
    render(
      <Dialog open={true} onClose={jest.fn()} description="A description" />
    );
    expect(screen.getByText("A description")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(
      <Dialog open={true} onClose={jest.fn()}>
        <p>Dialog body content</p>
      </Dialog>
    );
    expect(screen.getByText("Dialog body content")).toBeInTheDocument();
  });

  it("renders footer", () => {
    render(
      <Dialog
        open={true}
        onClose={jest.fn()}
        footer={<Button>Save</Button>}
      />
    );
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const onClose = jest.fn();
    render(<Dialog open={true} onClose={onClose} title="Test" />);
    await userEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when backdrop is clicked", async () => {
    const onClose = jest.fn();
    const { container } = render(
      <Dialog open={true} onClose={onClose} title="Test" />
    );
    const backdrop = container.querySelector(".bg-black\\/50");
    await userEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose on Escape key", () => {
    const onClose = jest.fn();
    render(<Dialog open={true} onClose={onClose} title="Test" />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("has aria-modal true", () => {
    render(<Dialog open={true} onClose={jest.fn()} title="Test" />);
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("locks body scroll when open", () => {
    render(<Dialog open={true} onClose={jest.fn()} title="Test" />);
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("unlocks body scroll on unmount", () => {
    const { unmount } = render(<Dialog open={true} onClose={jest.fn()} title="Test" />);
    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("applies custom className", () => {
    render(
      <Dialog open={true} onClose={jest.fn()} className="my-dialog" title="Test" />
    );
    expect(screen.getByRole("dialog")).toHaveClass("my-dialog");
  });
});
