import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select } from "@/components/ui/select";

describe("Select", () => {
  it("renders a select element with options", () => {
    render(
      <Select defaultValue="a">
        <option value="a">Option A</option>
        <option value="b">Option B</option>
      </Select>
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("Option B")).toBeInTheDocument();
  });

  it("displays selected value", () => {
    render(
      <Select defaultValue="b">
        <option value="a">A</option>
        <option value="b">B</option>
      </Select>
    );
    expect(screen.getByRole("combobox")).toHaveValue("b");
  });

  it("calls onChange when selection changes", async () => {
    const onChange = jest.fn();
    render(
      <Select onChange={onChange}>
        <option value="a">A</option>
        <option value="b">B</option>
      </Select>
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "b");
    expect(onChange).toHaveBeenCalled();
    expect(screen.getByRole("combobox")).toHaveValue("b");
  });

  it("supports disabled state", () => {
    render(
      <Select disabled>
        <option value="a">A</option>
      </Select>
    );
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("renders chevron icon", () => {
    const { container } = render(
      <Select>
        <option value="a">A</option>
      </Select>
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <Select className="my-select" data-testid="select">
        <option value="a">A</option>
      </Select>
    );
    expect(screen.getByTestId("select")).toHaveClass("my-select");
  });

  it("forwards ref", () => {
    const ref = { current: null as HTMLSelectElement | null };
    render(
      <Select ref={ref}>
        <option value="a">A</option>
      </Select>
    );
    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });
});
