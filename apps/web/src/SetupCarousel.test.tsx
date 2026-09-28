import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SetupDTO } from "@desklab/shared";
import { SetupCarousel } from "./design-system";

function setup(slug: string, name: string): SetupDTO {
  return {
    id: slug,
    slug,
    name,
    use: "Work",
    style: "Minimal",
    items: [],
    totalCents: 10000,
  };
}

const setups = [
  setup("the-calm-desk", "The Calm Desk"),
  setup("night-shift", "Night Shift"),
  setup("the-study", "The Study"),
];

function renderCarousel(): void {
  render(
    <MemoryRouter>
      <SetupCarousel setups={setups} />
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("SetupCarousel", () => {
  it("renders all setups with links, images and no autoplay", () => {
    vi.useFakeTimers();
    renderCarousel();
    for (const s of setups) {
      const article = screen.getByRole("article", { name: s.name });
      expect(
        within(article).getByRole("link", { name: s.name }),
      ).toHaveAttribute("href", `/setup/${s.slug}`);
      expect(within(article).getByAltText(s.name)).toBeInTheDocument();
      expect(
        within(article).getByRole("link", { name: "Ver setup" }),
      ).toHaveAttribute("href", `/setup/${s.slug}`);
    }
    vi.advanceTimersByTime(60_000);
    expect(
      screen.getByRole("button", { name: "Ir al setup 1 de 3" }),
    ).toHaveAttribute("aria-current", "true");
    vi.useRealTimers();
  });

  it("navigates one by one and updates indicators", () => {
    renderCarousel();
    const next = screen.getByRole("button", { name: "Setup siguiente" });
    const prev = screen.getByRole("button", { name: "Setup anterior" });
    expect(prev).toBeDisabled();
    fireEvent.click(next);
    expect(
      screen.getByRole("button", { name: "Ir al setup 2 de 3" }),
    ).toHaveAttribute("aria-current", "true");
    fireEvent.click(next);
    expect(next).toBeDisabled();
    fireEvent.click(prev);
    expect(
      screen.getByRole("button", { name: "Ir al setup 2 de 3" }),
    ).toHaveAttribute("aria-current", "true");
  });

  it("navigates with keyboard arrows", () => {
    renderCarousel();
    const region = screen.getByRole("region", { name: "Setups destacados" });
    fireEvent.keyDown(region, { key: "ArrowRight" });
    expect(
      screen.getByRole("button", { name: "Ir al setup 2 de 3" }),
    ).toHaveAttribute("aria-current", "true");
    fireEvent.keyDown(region, { key: "ArrowLeft" });
    expect(
      screen.getByRole("button", { name: "Ir al setup 1 de 3" }),
    ).toHaveAttribute("aria-current", "true");
  });
});
