import styled from "styled-components";
import { ReactNode } from "react";

const Shell = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-template-rows: auto 1px 1fr;
  grid-template-areas:
    "header header"
    "divider divider"
    "aside  main";
  column-gap: 48px;
  row-gap: 35px;
  padding: 28px 56px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 900px) {
    grid-template-columns: 240px 1fr;
    column-gap: 16px;
    padding: 20px;
  }

  @media (max-width: 560px) {
    grid-template-columns: 48px 1fr;
    grid-template-areas:
      "header header"
      "divider divider"
      "aside main";
    column-gap: 16px;
    padding: 20px;
  }
`;

const HeaderBar = styled.header`
  grid-area: header;
  display: flex;
  align-items: center;
  gap: 12px;

  & h1 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
  }
`;

const Divider = styled.div`
  grid-area: divider;
  height: 1px;
  background: ${({ theme }) => theme.colors.divider || "#E0E0E0"};
  margin-bottom: 30px;
`;

const Aside = styled.nav`
  grid-area: aside;
`;

const Main = styled.main`
  grid-area: main;
`;

const Tag = styled.span<{ tone: "inprogress" | "success" | "error" }>`
  font-size: 11px;
  font-weight: 600;
  padding: 6px 8px;
  border-radius: ${({ theme }) => theme.radii.pill};
  text-transform: lowercase;
  background: ${({ tone, theme }) =>
    tone === "inprogress"
      ? theme.colors.muted
      : tone === "success"
      ? theme.colors.successBg
      : theme.colors.errorBg};
  color: ${({ tone, theme }) =>
    tone === "inprogress"
      ? theme.colors.progress
      : tone === "success"
      ? theme.colors.success
      : theme.colors.error};
  border: 1px solid
    ${({ tone, theme }) =>
      tone === "inprogress"
        ? theme.colors.border
        : tone === "success"
        ? theme.colors.success
        : theme.colors.error};
`;

export function Layout({
  children,
  statusLabel,
}: {
  children: ReactNode;
  statusLabel?: "inprogress" | "success" | "error" | null;
}) {
  return (
    <Shell>
      <HeaderBar>
        <h1>New Company</h1>
        {statusLabel ? (
          <Tag tone={statusLabel}>
            {statusLabel === "inprogress" ? "In progress" : statusLabel}
          </Tag>
        ) : null}
      </HeaderBar>
      <Divider />
      {children}
    </Shell>
  );
}

export { Aside as Left, Main as Right };
