import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dropdown } from "@/components/ui/dropdown";
import { Button } from "@/components/ui/button";

describe("Dropdown", () => {
  const items = [
    { label: "Edit", onClick: jest.fn() },
    { label: "Delete", onClick: jest.fn() },
    { label: "Share", onClick: jest.fn() },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders trigger element", () => {
    render(
      <Dropdown trigger={<Button>Menu</Button>} items={items} />
    );
    expect(screen.getByText("Menu")).toBeInTheDocument();
  });

  it("does not show menu items initially", () => {
    render(
      <Dropdown trigger={<Button>Menu</Button>} items={items} />
    );
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  it("shows menu items when trigger is clicked", async () => {
    render(
      <Dropdown trigger={<Button>Menu</Button>} items={items} />
    );
    await userEvent.click(screen.getByText("Menu"));
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Share")).toBeInTheDocument();
  });

  it("calls item onClick when menu item is clicked", async () => {
    render(
      <Dropdown trigger={<Button>Menu</Button>} items={items} />
    );
    await userEvent.click(screen.getByText("Menu"));
    await userEvent.click(screen.getByText("Edit"));
    expect(items[0].onClick).toHaveBeenCalled();
  });

  it("closes menu after item click", async () => {
    render(
      <Dropdown trigger={<Button>Menu</Button>} items={items} />
    );
    await userEvent.click(screen.getByText("Menu"));
    await userEvent.click(screen.getByText("Edit"));
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  it("closes on Escape key", async () => {
    render(
      <Dropdown trigger={<Button>Menu</Button>} items={items} />
    );
    await userEvent.click(screen.getByText("Menu"));
    expect(screen.getByText("Edit")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  it("closes on outside click", async () => {
    render(
      <div>
        <Dropdown trigger={<Button>Menu</Button>} items={items} />
        <div data-testid="outside">Outside</div>
      </div>
    );
    await userEvent.click(screen.getByText("Menu"));
    expect(screen.getByText("Edit")).toBeInTheDocument();
    await userEvent.click(screen.getByTestId("outside"));
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  it("supports disabled items", async () => {
    const disabledItems = [
      { label: "Edit", onClick: jest.fn(), disabled: true },
      { label: "Delete", onClick: jest.fn() },
    ];
    render(
      <Dropdown trigger={<Button>Menu</Button>} items={disabledItems} />
    );
    await userEvent.click(screen.getByText("Menu"));
    const editBtn = screen.getByText("Edit").closest("button");
    expect(editBtn).toBeDisabled();
  });

  it("disabled item does not call onClick", async () => {
    const onClick = jest.fn();
    const disabledItems = [
      { label: "Edit", onClick, disabled: true },
    ];
    render(
      <Dropdown trigger={<Button>Menu</Button>} items={disabledItems} />
    );
    await userEvent.click(screen.getByText("Menu"));
    await userEvent.click(screen.getByText("Edit"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies right alignment", async () => {
    render(
      <Dropdown trigger={<Button>Menu</Button>} items={items} align="right" />
    );
    await userEvent.click(screen.getByText("Menu"));
    const menu = screen.getByText("Edit").parentElement;
    expect(menu).toHaveClass("right-0");
  });

  it("applies left alignment by default", async () => {
    render(
      <Dropdown trigger={<Button>Menu</Button>} items={items} />
    );
    await userEvent.click(screen.getByText("Menu"));
    const menu = screen.getByText("Edit").parentElement;
    expect(menu).toHaveClass("left-0");
  });
});
