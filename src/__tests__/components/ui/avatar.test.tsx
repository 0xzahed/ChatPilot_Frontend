import { render, screen } from "@testing-library/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

describe("Avatar components", () => {
  describe("Avatar", () => {
    it("renders a div with rounded-full class", () => {
      const { container } = render(<Avatar />);
      expect(container.firstChild).toHaveClass("rounded-full");
    });

    it("applies default size classes", () => {
      const { container } = render(<Avatar />);
      expect(container.firstChild).toHaveClass("h-10", "w-10");
    });

    it("applies custom className", () => {
      const { container } = render(<Avatar className="h-12 w-12" />);
      expect(container.firstChild).toHaveClass("h-12", "w-12");
    });

    it("renders children", () => {
      render(<Avatar><span>Content</span></Avatar>);
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("forwards ref", () => {
      const ref = { current: null as HTMLDivElement | null };
      render(<Avatar ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe("AvatarImage", () => {
    it("renders an img element", () => {
      render(<AvatarImage src="/test.jpg" alt="Test" />);
      const img = screen.getByAltText("Test");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", "/test.jpg");
    });

    it("defaults alt to empty string", () => {
      const { container } = render(<AvatarImage src="/test.jpg" />);
      const img = container.querySelector("img");
      expect(img).toHaveAttribute("alt", "");
    });

    it("applies object-cover class", () => {
      render(<AvatarImage src="/test.jpg" alt="Test" />);
      expect(screen.getByRole("img")).toHaveClass("object-cover");
    });
  });

  describe("AvatarFallback", () => {
    it("renders children", () => {
      render(<AvatarFallback>JD</AvatarFallback>);
      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("applies bg-muted class", () => {
      render(<AvatarFallback data-testid="fb">JD</AvatarFallback>);
      expect(screen.getByTestId("fb")).toHaveClass("bg-muted");
    });

    it("applies font-medium class", () => {
      render(<AvatarFallback data-testid="fb">JD</AvatarFallback>);
      expect(screen.getByTestId("fb")).toHaveClass("font-medium");
    });

    it("applies custom className", () => {
      render(<AvatarFallback className="text-lg" data-testid="fb">JD</AvatarFallback>);
      expect(screen.getByTestId("fb")).toHaveClass("text-lg");
    });
  });

  describe("Avatar composition", () => {
    it("renders avatar with fallback", () => {
      render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByText("JD")).toBeInTheDocument();
    });
  });
});
