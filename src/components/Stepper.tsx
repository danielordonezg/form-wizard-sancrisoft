import { useMediaQuery } from "@/utils/useMediaQuery";
import styled from "styled-components";

const Wrap = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;

  &::before {
    content: "";
    position: absolute;
    left: 3px;
    top: 0;
    bottom: 0;
    z-index: -1;
    width: 35px;
    background-color: #d9d9d970;
    border-radius: 25px;
  }

  @media (max-width: 560px) {
    align-items: center;

    &::before {
      content: "";
      position: absolute;
      left: 6px;
      top: 5px;
    }
  }
`;

const Item = styled.button<{
  active: boolean;
  done: boolean;
  disabled?: boolean;
}>`
  display: grid;
  grid-template-columns: 28px 1fr;
  align-items: center;
  gap: 12px;
  padding: 8px 0 8px 6px;
  background: transparent;
  border: none;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  text-align: left;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focus};
    outline-offset: 2px;
  }

  @media (max-width: 560px) {
    grid-template-columns: 28px;
    justify-items: center;
    padding-left: 0;
  }
`;

const Bullet = styled.span<{ active: boolean; done: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-grid;
  place-items: center;
  background: ${({ active, done, theme }) =>
    active ? theme.colors.primary : done ? theme.colors.success : "#fff"};
  border: ${({ active, done, theme }) =>
    active || done ? "none" : `1.5px solid ${theme.colors.border}`};
  color: ${({ active, done }) => (active || done ? "#fff" : "#111")};
  font-weight: 700;
  font-size: 14px;
`;

const Label = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};

  @media (max-width: 560px) {
    display: none;
  }
`;

export function Stepper({
  current,
  completed,
  onNavigate,
  disabled,
  compact = false,
}: {
  current: number;
  completed: Record<number, boolean>;
  onNavigate: (i: number) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  const isMobile = useMediaQuery("(max-width: 560px)");
  const labels = ["Business structure", "Contact person", "Review & submit"];
  return (
    <Wrap aria-label="Steps">
      {labels.map((label, i) => {
        const idx = i + 1;
        const isActive = current === idx;
        const isDone = !!completed[idx];
        return (
          <Item
            key={idx}
            active={isActive}
            done={isDone}
            disabled={disabled}
            onClick={() => !disabled && onNavigate(idx)}
            aria-current={isActive ? "step" : undefined}
          >
            <Bullet active={isActive} done={isDone}>
              {isMobile ? idx : isDone ? "✓" : idx}
            </Bullet>
            {compact || isMobile ? null : <Label>{label}</Label>}
          </Item>
        );
      })}
    </Wrap>
  );
}
