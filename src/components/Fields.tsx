import styled, { css } from "styled-components";

export const Form = styled.form`
  max-width: 660px;
`;

export const Fieldset = styled.fieldset`
  border: 0;
  padding: 0;
  margin: 0 0 18px 0;
`;

export const Legend = styled.legend`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
`;

export const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

export const Label = styled.label`
  display: block;
  font-size: 18px;
  margin: 8px 0 6px;
`;

export const Input = styled.input<{ invalid?: boolean }>`
  width: 100%;
  padding: 12px 12px;
  border-radius: 10px;
  background: #fff;
  border: 1.5px solid
    ${({ invalid, theme }) =>
      invalid ? theme.colors.error : theme.colors.border};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.focus};
    box-shadow: 0 0 0 3px rgba(67, 56, 202, 0.15);
  }
`;

export const Select = styled.select<{ invalid?: boolean }>`
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  background: #fff;
  border: 1.5px solid
    ${({ invalid, theme }) =>
      invalid ? theme.colors.error : theme.colors.border};
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, #6b7280 50%),
    linear-gradient(135deg, #6b7280 50%, transparent 50%),
    linear-gradient(to right, transparent, transparent);
  background-position: calc(100% - 16px) calc(1em + 2px),
    calc(100% - 11px) calc(1em + 2px), 100% 0;
  background-size: 5px 5px, 5px 5px, 2.5em 2.5em;
  background-repeat: no-repeat;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.focus};
    box-shadow: 0 0 0 3px rgba(67, 56, 202, 0.15);
  }
`;

export const Help = styled.p<{
  tone?: "error" | "muted";
}>`
  display: flex;
  align-items: center;
  margin: 6px 0 0;
  font-size: 12px;
  color: ${({ tone, theme }) =>
    tone === "error" ? theme.colors.error : theme.colors.subtleText};

  ${({ tone }) =>
    tone === "error" &&
    css`
      &::before {
        content: "";
        display: inline-block;
        width: 16px;
        height: 16px;
        margin-right: 4px;
        background-image: url(https://uxwing.com/wp-content/themes/uxwing/download/signs-and-symbols/red-alert-icon.png);
        background-size: contain;
        background-repeat: no-repeat;
      }
    `}
`;

export const Actions = styled.div`
  margin-top: 18px;
`;

export const Primary = styled.button<{ disabled?: boolean }>`
  width: 260px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 0;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-weight: 600;
  box-shadow: ${({ theme }) => theme.shadow};
  cursor: pointer;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focus};
    outline-offset: 2px;
  }
`;

export const Muted = styled.div<{ tone: "success" | "error" }>`
  margin-top: 16px;
  max-width: 520px;
  border-radius: 10px;
  padding: 12px 14px;
  border: 1.5px solid
    ${({ tone, theme }) =>
      tone === "success" ? theme.colors.success : theme.colors.error};
  background: ${({ tone, theme }) =>
    tone === "success" ? theme.colors.successBg : theme.colors.errorBg};
  color: ${({ tone, theme }) =>
    tone === "success" ? theme.colors.success : theme.colors.error};
  font-size: 13px;
`;

export const Section = styled.section`
  margin-bottom: 22px;
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
`;

export const SectionTitle = styled.h2`
  font-size: 14px;
  font-weight: 600;
  margin: 0;
`;

export const EditLink = styled.button`
  background: transparent;
  border: 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 12px;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
`;

export const KV = styled.dl`
  margin: 10px 0 0;
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 8px 18px;
  dt {
    color: ${({ theme }) => theme.colors.subtleText};
    font-size: 13px;
  }
  dd {
    margin: 0;
    font-size: 14px;
  }
`;
