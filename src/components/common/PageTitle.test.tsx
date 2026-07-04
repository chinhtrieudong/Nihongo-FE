import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PageTitle from "./PageTitle";

describe("PageTitle", () => {
  it("renders title, subtitle, icon, and extra content", () => {
    render(
      <PageTitle
        title="Bài học"
        subtitle="Luyện tập hôm nay"
        icon={<span data-testid="page-icon">本</span>}
        extra={<button type="button">Tạo mới</button>}
      />,
    );

    expect(screen.getByRole("heading", { name: /bài học/i })).toBeInTheDocument();
    expect(screen.getByText("Luyện tập hôm nay")).toBeInTheDocument();
    expect(screen.getByTestId("page-icon")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tạo mới" })).toBeInTheDocument();
  });
});
