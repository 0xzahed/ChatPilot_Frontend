import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider, useToast } from "@/components/ui/toast";

// Test helper component that uses the toast
function TestConsumer() {
  const { toast } = useToast();
  return (
    <div>
      <button onClick={() => toast({ type: "success", title: "Success!", description: "Saved OK" })}>
        Show Success
      </button>
      <button onClick={() => toast({ type: "error", title: "Error!" })}>
        Show Error
      </button>
      <button onClick={() => toast({ type: "info", title: "Info" })}>
        Show Info
      </button>
      <button onClick={() => toast({ type: "warning", title: "Warning" })}>
        Show Warning
      </button>
    </div>
  );
}

function renderWithProvider(ui: React.ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

describe("Toast", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("throws error when useToast used outside provider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      "useToast must be used within a ToastProvider"
    );
    spy.mockRestore();
  });

  it("renders children inside provider", () => {
    renderWithProvider(<div>App content</div>);
    expect(screen.getByText("App content")).toBeInTheDocument();
  });

  it("shows success toast", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithProvider(<TestConsumer />);
    await user.click(screen.getByText("Show Success"));
    expect(screen.getByText("Success!")).toBeInTheDocument();
    expect(screen.getByText("Saved OK")).toBeInTheDocument();
  });

  it("shows error toast", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithProvider(<TestConsumer />);
    await user.click(screen.getByText("Show Error"));
    expect(screen.getByText("Error!")).toBeInTheDocument();
  });

  it("shows info toast", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithProvider(<TestConsumer />);
    await user.click(screen.getByText("Show Info"));
    expect(screen.getByText("Info")).toBeInTheDocument();
  });

  it("shows warning toast", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithProvider(<TestConsumer />);
    await user.click(screen.getByText("Show Warning"));
    expect(screen.getByText("Warning")).toBeInTheDocument();
  });

  it("auto-dismisses after 3 seconds", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithProvider(<TestConsumer />);
    await user.click(screen.getByText("Show Success"));
    expect(screen.getByText("Success!")).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.queryByText("Success!")).not.toBeInTheDocument();
  });

  it("can be dismissed manually via close button", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithProvider(<TestConsumer />);
    await user.click(screen.getByText("Show Success"));
    expect(screen.getByText("Success!")).toBeInTheDocument();
    const closeBtn = screen.getByLabelText("Close");
    await user.click(closeBtn);
    expect(screen.queryByText("Success!")).not.toBeInTheDocument();
  });

  it("toast has role alert", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithProvider(<TestConsumer />);
    await user.click(screen.getByText("Show Success"));
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("can show multiple toasts", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithProvider(<TestConsumer />);
    await user.click(screen.getByText("Show Success"));
    await user.click(screen.getByText("Show Error"));
    expect(screen.getByText("Success!")).toBeInTheDocument();
    expect(screen.getByText("Error!")).toBeInTheDocument();
  });
});
