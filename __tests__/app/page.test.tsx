import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

    const primarySwatches = document.querySelectorAll(".bg-wedx-primary-500, .bg-wedx-primary-600, .bg-wedx-primary-700");
    const accentSwatches = document.querySelectorAll(".bg-wedx-accent-500, .bg-wedx-accent-600, .bg-wedx-accent-700");
    const supportSwatches = document.querySelectorAll(".bg-wedx-support-500, .bg-wedx-support-600, .bg-wedx-support-700");

    expect(primarySwatches.length).toBe(3);
    expect(accentSwatches.length).toBe(3);
    expect(supportSwatches.length).toBe(3);
  });

  it("renders functional dialog", async () => {
    render(<DesignSystemDemo />);
    const user = userEvent.setup();

    await user.click(screen.getByText("Dialog"));
    const openButton = await screen.findByText("Open Dialog");
    await user.click(openButton);

    expect(await screen.findByText("Sample Dialog")).toBeInTheDocument();
    expect(
      screen.getByText(
        "This is a demonstration of the wedX dialog component with proper theming."
      )
    ).toBeInTheDocument();
  });

  it("renders form input with proper styling", async () => {
    render(<DesignSystemDemo />);
    const user = userEvent.setup();

    await user.click(screen.getByText("Forms"));
    const emailInput = await screen.findByLabelText("Email");
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("placeholder", "Enter your email");
  });
});
