import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { Badge, Button, Price } from "./design-system";

describe("Button", () => {
  it("renders as link when `to` is provided", () => {
    render(
      <MemoryRouter>
        <Button to="/catalogo">Explorar</Button>
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "Explorar" })).toHaveAttribute(
      "href",
      "/catalogo",
    );
  });
});

describe("Badge", () => {
  it("renders the label", () => {
    render(<Badge label="Minimal" />);
    expect(screen.getByText("Minimal")).toBeInTheDocument();
  });
});

describe("Price", () => {
  it("formats cents as EUR", () => {
    render(<Price cents={12900} />);
    expect(screen.getByText("129,00 €")).toBeInTheDocument();
  });
});
