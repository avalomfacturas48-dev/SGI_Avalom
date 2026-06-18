import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import HomePage from "@/components/homePage/homePage"

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/homePage",
}))

jest.mock("js-cookie", () => ({
  get: jest.fn(() => "fake-token"),
}))

jest.mock("@/lib/UserContext", () => ({
  useUser: () => ({
    user: { usu_nombre: "Test", usu_papellido: "User", usu_rol: "A" },
    logout: jest.fn(),
  }),
}))

jest.mock("@/components/homePage/bodyHomePage", () => {
  return () => <div>BodyHomePage Renderizado</div>
})

jest.mock("@/components/AppShell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div>
      <nav>AppShell Mock</nav>
      {children}
    </div>
  ),
}))

jest.mock("@/components/AuthRoute", () => {
  return ({ children }: { children: React.ReactNode }) => <>{children}</>
})

describe("HomePage", () => {
  it("renderiza correctamente el dashboard", () => {
    render(<HomePage />)

    expect(screen.getByText("AppShell Mock")).toBeInTheDocument()
    expect(screen.getByText("BodyHomePage Renderizado")).toBeInTheDocument()
  })
})
