import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { VotedPoll } from "../services/pollService";
import type { Poll } from "../types";
import { useAuth } from "../hooks/useAuth";
import { useMyPolls } from "../hooks/useMyPolls";
import { useMyVotes } from "../hooks/useMyVotes";
import { usePolls } from "../hooks/usePolls";
import { PollsListPage, validatePollScopeSearch } from "./index";

const mockRouter = {
  scope: "all",
  user: { uid: "user-1" } as { uid: string } | null,
  navigate: jest.fn(),
};

jest.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: { component: () => ReactNode }) => ({
    ...options,
    useSearch: () => ({ scope: mockRouter.scope }),
  }),
  useNavigate: () => (options: { search?: { scope?: string } }) => {
    mockRouter.navigate(options);
    if (options.search?.scope) mockRouter.scope = options.search.scope;
  },
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string | Record<string, unknown>) =>
      typeof defaultValue === "string"
        ? defaultValue
        : typeof defaultValue?.defaultValue === "string"
          ? defaultValue.defaultValue
          : key,
  }),
}));

jest.mock("../components/AuthPrompt", () => ({
  AuthPrompt: ({ title }: { title: string }) => (
    <div data-testid="auth-prompt">{title}</div>
  ),
}));

jest.mock("../hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../hooks/usePolls", () => ({
  usePolls: jest.fn(),
}));

jest.mock("../hooks/useMyPolls", () => ({
  useMyPolls: jest.fn(),
}));

jest.mock("../hooks/useMyVotes", () => ({
  useMyVotes: jest.fn(),
}));

const polls: Poll[] = [
  {
    id: "created-newer",
    title: "Created newest",
    startDate: new Date("2026-01-01T10:00:00"),
    endDate: new Date("2026-01-10T18:00:00"),
    status: "em andamento",
    options: [],
    createdBy: "user-1",
    createdAt: new Date("2026-02-02T09:00:00"),
  },
  {
    id: "created-older",
    title: "Created older",
    startDate: new Date("2026-01-01T10:00:00"),
    endDate: new Date("2026-01-10T18:00:00"),
    status: "em andamento",
    options: [],
    createdBy: "user-1",
    createdAt: new Date("2026-02-01T09:00:00"),
  },
];

const votedPolls: VotedPoll[] = [
  {
    ...polls[0],
    id: "voted-older",
    title: "Voted older",
    votedAt: new Date("2026-02-01T09:00:00"),
  },
  {
    ...polls[1],
    id: "voted-newer",
    title: "Voted newest",
    votedAt: new Date("2026-02-02T09:00:00"),
  },
];

describe("PollsListPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.scope = "all";
    mockRouter.user = { uid: "user-1" };
    jest.mocked(useAuth).mockReturnValue({
      user: mockRouter.user as never,
      loading: false,
      loginWithGoogle: jest.fn(),
      loginAnon: jest.fn(),
      logout: jest.fn(),
    });
    jest.mocked(usePolls).mockReturnValue({
      polls,
      loading: false,
      error: null,
      refetch: jest.fn(),
      addPoll: jest.fn(),
    });
    jest.mocked(useMyPolls).mockReturnValue({
      polls,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });
    jest.mocked(useMyVotes).mockReturnValue({
      votedPolls,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it("validates the default scope as all and renders the all-polls view", () => {
    expect(validatePollScopeSearch({})).toEqual({ scope: "all" });
    expect(validatePollScopeSearch({ scope: "invalid" })).toEqual({
      scope: "all",
    });

    render(<PollsListPage />);

    expect(screen.getByRole("tab", { name: "Todas" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("Created newest")).toBeInTheDocument();
  });

  it("updates the query scope when a signed-in user changes tabs", async () => {
    const user = userEvent.setup();
    const view = render(<PollsListPage />);

    await user.click(screen.getByRole("tab", { name: "Criadas por mim" }));

    expect(mockRouter.navigate).toHaveBeenCalledWith({
      search: { scope: "mine" },
    });
    view.rerender(<PollsListPage />);
    expect(
      screen.getByRole("tab", { name: "Criadas por mim" }),
    ).toHaveAttribute("aria-selected", "true");
  });

  it.each(["Criadas por mim", "Votadas por mim"] as const)(
    "prompts for authentication instead of changing to %s when signed out",
    async (label) => {
      mockRouter.user = null;
      jest.mocked(useAuth).mockReturnValue({
        user: null,
        loading: false,
        loginWithGoogle: jest.fn(),
        loginAnon: jest.fn(),
        logout: jest.fn(),
      });
      const user = userEvent.setup();

      render(<PollsListPage />);
      await user.click(screen.getByRole("tab", { name: label }));

      expect(screen.getByTestId("auth-prompt")).toBeInTheDocument();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
      expect(mockRouter.scope).toBe("all");
    },
  );

  it("closes the authentication dialog from its button and backdrop", async () => {
    mockRouter.user = null;
    jest.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      loginWithGoogle: jest.fn(),
      loginAnon: jest.fn(),
      logout: jest.fn(),
    });
    const user = userEvent.setup();
    render(<PollsListPage />);

    await user.click(screen.getByRole("tab", { name: "Criadas por mim" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(
      dialog.querySelector('[data-testid="auth-prompt"]') as HTMLElement,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Fechar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Votadas por mim" }));
    fireEvent.click(screen.getByRole("dialog"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("sorts all and mine by creation date, and voted polls by vote date", async () => {
    const user = userEvent.setup();
    const view = render(<PollsListPage />);
    const getCardTitles = () =>
      screen
        .getAllByRole("heading", { level: 3 })
        .map((heading: HTMLElement) => heading.textContent);

    expect(getCardTitles()).toEqual(["Created newest", "Created older"]);

    await user.click(screen.getByRole("tab", { name: "Criadas por mim" }));
    view.rerender(<PollsListPage />);
    expect(getCardTitles()).toEqual(["Created newest", "Created older"]);

    await user.click(screen.getByRole("tab", { name: "Votadas por mim" }));
    view.rerender(<PollsListPage />);
    expect(getCardTitles()).toEqual(["Voted newest", "Voted older"]);
  });

  it("changes the sort labels for vote dates in the voted scope", async () => {
    const user = userEvent.setup();
    const view = render(<PollsListPage />);

    await user.click(screen.getByRole("tab", { name: "Votadas por mim" }));
    view.rerender(<PollsListPage />);

    expect(
      screen.getByRole("option", { name: "Votos mais recentes" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Votos mais antigos" }),
    ).toBeInTheDocument();
  });

  it("continues to combine title search with the status filter", async () => {
    jest.mocked(usePolls).mockReturnValue({
      polls: [
        {
          ...polls[0],
          title: "Frontend framework recent",
          status: "em andamento",
        },
        {
          ...polls[1],
          title: "Frontend framework started",
          status: "iniciado",
        },
      ],
      loading: false,
      error: null,
      refetch: jest.fn(),
      addPoll: jest.fn(),
    });
    const user = userEvent.setup();

    render(<PollsListPage />);
    await user.type(screen.getByRole("searchbox"), "FRAMEWORK");
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);

    await user.selectOptions(screen.getByLabelText("Status"), "iniciado");
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(1);
    expect(screen.getByText("Frontend framework started")).toBeInTheDocument();
  });

  it("renders all empty-state messages and status translations", async () => {
    jest.mocked(usePolls).mockReturnValue({
      polls: [],
      loading: false,
      error: null,
      refetch: jest.fn(),
      addPoll: jest.fn(),
    });
    const user = userEvent.setup();
    render(<PollsListPage />);

    expect(screen.getByText("Nenhuma enquete encontrada.")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Seja o primeiro a publicar uma nova enquete em tempo real!",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Criar enquete agora" }),
    ).toHaveAttribute("href", "/create");

    for (const [status, label] of [
      ["não iniciado", "Não iniciado"],
      ["iniciado", "Iniciado"],
      ["em andamento", "Em andamento"],
      ["finalizado", "Finalizado"],
    ] as const) {
      await user.selectOptions(screen.getByLabelText("Status"), status);
      expect(
        screen.getByText(
          `Não há enquetes com o status "${label}". Altere o filtro ou crie uma nova enquete.`,
        ),
      ).toBeInTheDocument();
    }

    await user.selectOptions(screen.getByLabelText("Status"), "");
    expect(
      screen.getByText(
        "Seja o primeiro a publicar uma nova enquete em tempo real!",
      ),
    ).toBeInTheDocument();
  });

  it("shows loading and error states and retries a failed request", async () => {
    const refetch = jest.fn();
    jest.mocked(usePolls).mockReturnValue({
      polls: [],
      loading: true,
      error: null,
      refetch,
      addPoll: jest.fn(),
    });
    const view = render(<PollsListPage />);
    expect(screen.getByText("Carregando enquetes...")).toBeInTheDocument();

    jest.mocked(usePolls).mockReturnValue({
      polls: [],
      loading: false,
      error: "Could not load polls",
      refetch,
      addPoll: jest.fn(),
    });
    view.rerender(<PollsListPage />);
    expect(screen.getByText("Could not load polls")).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("shows distinct empty messages for mine, voted, and search results", async () => {
    const user = userEvent.setup();
    const view = render(<PollsListPage />);

    await user.click(screen.getByRole("tab", { name: "Criadas por mim" }));
    view.rerender(<PollsListPage />);
    jest.mocked(useMyPolls).mockReturnValue({
      polls: [],
      loading: false,
      error: null,
      refetch: jest.fn(),
    });
    view.rerender(<PollsListPage />);
    expect(
      screen.getByText("Você ainda não possui enquetes criadas"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Votadas por mim" }));
    view.rerender(<PollsListPage />);
    jest.mocked(useMyVotes).mockReturnValue({
      votedPolls: [],
      loading: false,
      error: null,
      refetch: jest.fn(),
    });
    view.rerender(<PollsListPage />);
    expect(
      screen.getByText("Você ainda não participou de nenhuma enquete."),
    ).toBeInTheDocument();

    mockRouter.scope = "all";
    jest.mocked(usePolls).mockReturnValue({
      polls,
      loading: false,
      error: null,
      refetch: jest.fn(),
      addPoll: jest.fn(),
    });
    view.rerender(<PollsListPage />);
    await user.type(screen.getByRole("searchbox"), "no matching title");
    expect(
      screen.getByText("Nenhuma enquete corresponde à busca."),
    ).toBeInTheDocument();
  });

  it("sorts oldest first when requested and resets the page after filtering", async () => {
    const user = userEvent.setup();
    const manyPolls = Array.from({ length: 11 }, (_, index) => ({
      ...polls[0],
      id: `sort-poll-${index}`,
      title: `Sort poll ${index}`,
      createdAt: new Date(
        `2026-02-${String(index + 1).padStart(2, "0")}T09:00:00`,
      ),
    }));
    jest.mocked(usePolls).mockReturnValue({
      polls: manyPolls,
      loading: false,
      error: null,
      refetch: jest.fn(),
      addPoll: jest.fn(),
    });
    render(<PollsListPage />);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Ordenar por" }),
      "asc",
    );
    expect(screen.getAllByRole("heading", { level: 3 })[0]).toHaveTextContent(
      "Sort poll 0",
    );

    await user.click(screen.getByRole("button", { name: "Próximo" }));
    expect(screen.getByText("Sort poll 10")).toBeInTheDocument();
    await user.type(screen.getByRole("searchbox"), "Sort poll 1");
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
    expect(screen.getByText("Sort poll 1")).toBeInTheDocument();
  });

  it("navigates to a selected poll and safely ignores polls without an id", () => {
    const userPoll = { ...polls[0], id: "" };
    jest.mocked(usePolls).mockReturnValue({
      polls: [userPoll],
      loading: false,
      error: null,
      refetch: jest.fn(),
      addPoll: jest.fn(),
    });

    const { rerender } = render(<PollsListPage />);
    fireEvent.click(screen.getByRole("heading", { name: userPoll.title }));
    expect(mockRouter.navigate).not.toHaveBeenCalledWith(
      expect.objectContaining({ to: "/poll/$pollId" }),
    );

    jest.mocked(usePolls).mockReturnValue({
      polls: [polls[0]],
      loading: false,
      error: null,
      refetch: jest.fn(),
      addPoll: jest.fn(),
    });
    rerender(<PollsListPage />);
    fireEvent.click(screen.getByRole("heading", { name: polls[0].title }));
    expect(mockRouter.navigate).toHaveBeenCalledWith({
      to: "/poll/$pollId",
      params: { pollId: polls[0].id },
    });
  });

  it("keeps the ten-item page size and navigates to the next page", async () => {
    jest.mocked(usePolls).mockReturnValue({
      polls: Array.from({ length: 11 }, (_, index) => ({
        ...polls[0],
        id: `page-poll-${index}`,
        title: `Page poll ${index}`,
        createdAt: new Date(
          `2026-02-${String(index + 1).padStart(2, "0")}T09:00:00`,
        ),
      })),
      loading: false,
      error: null,
      refetch: jest.fn(),
      addPoll: jest.fn(),
    });
    const user = userEvent.setup();

    render(<PollsListPage />);

    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(10);
    await user.click(screen.getByRole("button", { name: "Próximo" }));
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(1);
    expect(screen.getByText("Page poll 0")).toBeInTheDocument();
  });
});
