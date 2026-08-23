import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs } from "@/components/ui/tabs";

const TABS = [
  { id: "general", label: "General" },
  { id: "ai", label: "AI Settings" },
  { id: "billing", label: "Billing" },
];

describe("Tabs", () => {
  it("renders all tab labels", () => {
    render(<Tabs tabs={TABS} activeTab="general" onChange={jest.fn()} />);
    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByText("AI Settings")).toBeInTheDocument();
    expect(screen.getByText("Billing")).toBeInTheDocument();
  });

  it("calls onChange with tab id when clicked", async () => {
    const onChange = jest.fn();
    render(<Tabs tabs={TABS} activeTab="general" onChange={onChange} />);
    await userEvent.click(screen.getByText("Billing"));
    expect(onChange).toHaveBeenCalledWith("billing");
  });

  it("highlights active tab", () => {
    render(<Tabs tabs={TABS} activeTab="ai" onChange={jest.fn()} />);
    const activeTab = screen.getByText("AI Settings");
    expect(activeTab.className).toContain("bg-background");
  });

  it("does not highlight inactive tabs", () => {
    render(<Tabs tabs={TABS} activeTab="general" onChange={jest.fn()} />);
    const inactiveTab = screen.getByText("Billing");
    expect(inactiveTab.className).not.toContain("bg-background");
  });

  it("renders correct number of tab buttons", () => {
    render(<Tabs tabs={TABS} activeTab="general" onChange={jest.fn()} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);
  });

  it("applies custom className", () => {
    render(
      <Tabs tabs={TABS} activeTab="general" onChange={jest.fn()} className="custom-tabs" />
    );
    const container = screen.getByText("General").parentElement;
    expect(container?.className).toContain("custom-tabs");
  });
});
