import React from "react";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

describe("Card", () => {
  it("renders card with all parts", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
          <CardDescription>Test description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card content goes here</p>
        </CardContent>
      </Card>
    );

    expect(screen.getByText("Test Card")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
    expect(screen.getByText("Card content goes here")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Card className="custom-class">Content</Card>);
    const card = screen.getByText("Content").closest(".rounded-lg");

    expect(card).toHaveClass("custom-class");
  });

  it("renders card header with correct styling", () => {
    render(
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
    );

    const title = screen.getByText("Title");
    expect(title).toHaveClass(
      "text-2xl",
      "font-semibold",
      "leading-none",
      "tracking-tight"
    );
  });

  it("renders card description with muted text", () => {
    render(
      <CardHeader>
        <CardDescription>Description</CardDescription>
      </CardHeader>
    );

    const description = screen.getByText("Description");
    expect(description).toHaveClass("text-sm", "text-muted-foreground");
  });

  it("renders card content with proper padding", () => {
    render(
      <Card>
        <CardContent>Content</CardContent>
      </Card>
    );

    const content = screen.getByText("Content").closest(".p-6");
    expect(content).toHaveClass("p-6");
    expect(content).toHaveClass("pt-0");
  });
});
