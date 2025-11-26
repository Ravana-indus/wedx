import React from "react";
import { render, screen } from "@testing-library/react";
import DesignSystemDemo from "@/app/page";

describe("Design System Demo Page", () => {
  it("renders page with correct title", () => {
    render(<DesignSystemDemo />);

    expect(screen.getByText("wedX Design System Demo")).toBeInTheDocument();
  });

  it("displays component showcase tabs", () => {
    render(<DesignSystemDemo />);

    expect(screen.getByText("Buttons")).toBeInTheDocument();
    expect(screen.getByText("Forms")).toBeInTheDocument();
    expect(screen.getByText("Cards")).toBeInTheDocument();
    expect(screen.getByText("Dialog")).toBeInTheDocument();
  });

  it("renders buttons with different variants", () => {
    render(<DesignSystemDemo />);

    expect(screen.getByText("Primary Button")).toBeInTheDocument();
    expect(screen.getByText("Secondary")).toBeInTheDocument();
    expect(screen.getByText("Outline")).toBeInTheDocument();
    expect(screen.getByText("Ghost")).toBeInTheDocument();
    expect(screen.getByText("Destructive")).toBeInTheDocument();
  });

  it("renders wedX color token demonstration", () => {
    render(<DesignSystemDemo />);

    expect(screen.getByText("wedX Color Tokens")).toBeInTheDocument();
    expect(screen.getByText("Primary (Coral)")).toBeInTheDocument();
    expect(screen.getByText("Accent (Gold)")).toBeInTheDocument();
    expect(screen.getByText("Support (Teal)")).toBeInTheDocument();
    expect(screen.getByText("Neutral")).toBeInTheDocument();
  });

  it("renders color swatches with correct classes", () => {
    render(<DesignSystemDemo />);

    // Check primary colors
    const primaryColors = screen.getAllByText(/^bg-wedx-primary-\d+$/);
    expect(primaryColors).toHaveLength(3);

    // Check accent colors
    const accentColors = screen.getAllByText(/^bg-wedx-accent-\d+$/);
    expect(accentColors).toHaveLength(3);

    // Check support colors
    const supportColors = screen.getAllByText(/^bg-wedx-support-\d+$/);
    expect(supportColors).toHaveLength(3);
  });

  it("renders functional dialog", () => {
    render(<DesignSystemDemo />);

    const openButton = screen.getByText("Open Dialog");
    expect(openButton).toBeInTheDocument();

    // Dialog should be closed initially
    expect(screen.queryByText("Sample Dialog")).not.toBeInTheDocument();

    // Click to open dialog
    require("@testing-library/user-event").default.click(openButton);

    // Dialog should now be open
    expect(screen.getByText("Sample Dialog")).toBeInTheDocument();
    expect(
      screen.getByText(
        "This is a demonstration of wedX dialog component with proper theming."
      )
    ).toBeInTheDocument();
  });

  it("renders form input with proper styling", () => {
    render(<DesignSystemDemo />);

    const emailInput = screen.getByLabelText("Email");
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("placeholder", "Enter your email");
  });
});
