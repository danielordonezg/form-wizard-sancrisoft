import { render, screen, fireEvent } from "../test-utils";
import Home from "../../src/pages";

Object.defineProperty(window, "innerWidth", { writable: true, value: 1200 });

test("muestra errores al enviar el Step 1 vacío", async () => {
  render(<Home />);

  fireEvent.click(screen.getByRole("button", { name: /continue/i }));

  expect(
    await screen.findByText(/Enter the registered business name/i)
  ).toBeInTheDocument();

  const first = screen.getByLabelText(/Business name/i);

  expect(first).toHaveAttribute("aria-invalid", "true");

  expect(screen.getByText(/Select a type/i)).toBeInTheDocument();
});
