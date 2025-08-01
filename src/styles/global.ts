import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  :root { color-scheme: light; }
  *, *::before, *::after { box-sizing: border-box; }
  html, body, #__next { height: 100%; }
  body {
    margin: 0;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
    color: ${({ theme }) => theme.colors.text};
    background: #fff;
  }
  button { font: inherit; }
  a { color: inherit; text-decoration: none; }
  input, select, textarea { font: inherit; }
  ::placeholder { color: #9CA3AF; }
  [data-hidden="true"] { display:none !important; }
`;
