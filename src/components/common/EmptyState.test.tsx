import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import EmptyState from "./EmptyState";

describe("EmptyState", () => {
  it("renders the default empty message", () => {
    render(<EmptyState />);

    expect(screen.getByText("Không có dữ liệu")).toBeInTheDocument();
  });

  it("renders custom title, description, children, and action", () => {
    const onClick = vi.fn();

    render(
      <EmptyState
        type="error"
        title="Không tải được"
        description="Thử lại sau"
        action={{ label: "Tải lại", onClick }}
      >
        <span>Chi tiết lỗi</span>
      </EmptyState>,
    );

    expect(screen.getByText("Không tải được")).toBeInTheDocument();
    expect(screen.getByText("Thử lại sau")).toBeInTheDocument();
    expect(screen.getByText("Chi tiết lỗi")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /tải lại/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
