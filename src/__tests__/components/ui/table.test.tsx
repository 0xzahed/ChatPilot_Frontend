import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";

describe("Table components", () => {
  describe("Table", () => {
    it("renders a table element", () => {
      render(
        <Table>
          <tbody><tr><td>Cell</td></tr></tbody>
        </Table>
      );
      expect(screen.getByText("Cell")).toBeInTheDocument();
    });

    it("wraps in overflow-auto div", () => {
      const { container } = render(<Table />);
      expect(container.firstChild).toHaveClass("overflow-auto");
    });

    it("applies w-full to table", () => {
      const { container } = render(<Table />);
      const table = container.querySelector("table");
      expect(table).toHaveClass("w-full");
    });

    it("applies custom className", () => {
      const { container } = render(<Table className="my-table" />);
      const table = container.querySelector("table");
      expect(table).toHaveClass("my-table");
    });
  });

  describe("TableHeader", () => {
    it("renders thead element", () => {
      const { container } = render(<TableHeader />);
      expect(container.querySelector("thead")).toBeInTheDocument();
    });
  });

  describe("TableBody", () => {
    it("renders tbody element", () => {
      const { container } = render(<TableBody />);
      expect(container.querySelector("tbody")).toBeInTheDocument();
    });
  });

  describe("TableRow", () => {
    it("renders tr element", () => {
      const { container } = render(<TableRow />);
      expect(container.querySelector("tr")).toBeInTheDocument();
    });

    it("applies border-b class", () => {
      const { container } = render(<TableRow />);
      expect(container.querySelector("tr")).toHaveClass("border-b");
    });
  });

  describe("TableHead", () => {
    it("renders th element with content", () => {
      render(<TableHead>Name</TableHead>);
      expect(screen.getByText("Name").tagName).toBe("TH");
    });

    it("applies font-medium class", () => {
      render(<TableHead data-testid="th">Header</TableHead>);
      expect(screen.getByTestId("th")).toHaveClass("font-medium");
    });
  });

  describe("TableCell", () => {
    it("renders td element with content", () => {
      render(<TableCell>Data</TableCell>);
      expect(screen.getByText("Data").tagName).toBe("TD");
    });

    it("applies p-4 class", () => {
      render(<TableCell data-testid="td">Data</TableCell>);
      expect(screen.getByTestId("td")).toHaveClass("p-4");
    });
  });

  describe("Full table composition", () => {
    it("renders a complete table", () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John</TableCell>
              <TableCell>john@test.com</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("John")).toBeInTheDocument();
      expect(screen.getByText("john@test.com")).toBeInTheDocument();
    });
  });
});
