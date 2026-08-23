import { render, screen } from "@testing-library/react";
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter,
} from "@/components/ui/card";

describe("Card components", () => {
  describe("Card", () => {
    it("renders children", () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText("Card content")).toBeInTheDocument();
    });

    it("applies default border classes", () => {
      render(<Card data-testid="card">Test</Card>);
      expect(screen.getByTestId("card")).toHaveClass("border", "border-border");
    });

    it("applies custom className", () => {
      render(<Card className="my-card" data-testid="card">Test</Card>);
      expect(screen.getByTestId("card")).toHaveClass("my-card");
    });

    it("forwards ref", () => {
      const ref = { current: null as HTMLDivElement | null };
      render(<Card ref={ref}>Ref test</Card>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe("CardHeader", () => {
    it("renders with padding", () => {
      render(<CardHeader data-testid="header">Header</CardHeader>);
      expect(screen.getByTestId("header")).toHaveClass("p-6");
    });

    it("renders children", () => {
      render(<CardHeader>My Header</CardHeader>);
      expect(screen.getByText("My Header")).toBeInTheDocument();
    });
  });

  describe("CardTitle", () => {
    it("renders with font-semibold class", () => {
      render(<CardTitle data-testid="title">Title</CardTitle>);
      expect(screen.getByTestId("title")).toHaveClass("font-semibold");
    });

    it("renders children text", () => {
      render(<CardTitle>My Title</CardTitle>);
      expect(screen.getByText("My Title")).toBeInTheDocument();
    });
  });

  describe("CardDescription", () => {
    it("renders with muted-foreground class", () => {
      render(<CardDescription data-testid="desc">Description</CardDescription>);
      expect(screen.getByTestId("desc")).toHaveClass("text-muted-foreground");
    });
  });

  describe("CardContent", () => {
    it("renders children", () => {
      render(<CardContent>Content body</CardContent>);
      expect(screen.getByText("Content body")).toBeInTheDocument();
    });

    it("applies padding class", () => {
      render(<CardContent data-testid="content">Body</CardContent>);
      expect(screen.getByTestId("content")).toHaveClass("p-6");
    });
  });

  describe("CardFooter", () => {
    it("renders children", () => {
      render(<CardFooter>Footer</CardFooter>);
      expect(screen.getByText("Footer")).toBeInTheDocument();
    });

    it("applies flex class", () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>);
      expect(screen.getByTestId("footer")).toHaveClass("flex", "items-center");
    });
  });

  describe("Full Card composition", () => {
    it("renders all parts together", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Body content</CardContent>
          <CardFooter>Footer text</CardFooter>
        </Card>
      );
      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
      expect(screen.getByText("Body content")).toBeInTheDocument();
      expect(screen.getByText("Footer text")).toBeInTheDocument();
    });
  });
});
