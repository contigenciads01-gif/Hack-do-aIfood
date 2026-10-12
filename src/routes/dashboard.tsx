import { createFileRoute, Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ShoppingBag,
  TrendingUp,
  Star,
  Clock,
  DollarSign,
  LogOut,
  Bell,
  Search,
  UtensilsCrossed,
  Bike,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "hack du ifood — Dashboard" },
      {
        name: "description",
        content:
          "Painel completo do hack du ifood: vendas, pedidos e desempenho do seu restaurante.",
      },
      { property: "og:title", content: "hack du ifood — Dashboard" },
      {
        property: "og:description",
        content: "Vendas, pedidos e desempenho em tempo real.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

const stats = [
  {
    label: "Vendas hoje",
    value: "R$ 4.287,50",
    change: "+18,2%",
    up: true,
    icon: DollarSign,
  },
  {
    label: "Pedidos hoje",
    value: "132",
    change: "+12,4%",
    up: true,
    icon: ShoppingBag,
  },
  {
    label: "Ticket médio",
    value: "R$ 32,48",
    change: "+5,1%",
    up: true,
    icon: TrendingUp,
  },
  {
    label: "Avaliação",
    value: "4,7",
    change: "-0,1",
    up: false,
    icon: Star,
  },
];

const pedidos = [
  { id: "#8741", cliente: "Mariana S.", itens: "2x Combo Smash + 1x Refri", valor: "R$ 78,70", status: "Em preparo", tempo: "12 min" },
  { id: "#8740", cliente: "Carlos M.", itens: "1x Pizza Calabresa G", valor: "R$ 54,90", status: "Saiu p/ entrega", tempo: "8 min" },
  { id: "#8739", cliente: "Ana Paula R.", itens: "3x Açaí 500ml", valor: "R$ 62,40", status: "Entregue", tempo: "—" },
  { id: "#8738", cliente: "João Pedro L.", itens: "1x Prato feito + 1x Suco", valor: "R$ 38,50", status: "Entregue", tempo: "—" },
  { id: "#8737", cliente: "Fernanda T.", itens: "2x Yakisoba médio", valor: "R$ 71,80", status: "Cancelado", tempo: "—" },
  { id: "#8736", cliente: "Rafael C.", itens: "1x Combo família", valor: "R$ 99,90", status: "Entregue", tempo: "—" },
];

const pratos = [
  { nome: "Combo Smash Burger", vendas: 48, receita: "R$ 1.896,00" },
  { nome: "Pizza Calabresa G", vendas: 35, receita: "R$ 1.921,50" },
  { nome: "Açaí 500ml", vendas: 29, receita: "R$ 603,20" },
  { nome: "Yakisoba médio", vendas: 22, receita: "R$ 789,80" },
];

const horas = [
  { h: "11h", v: 30 },
  { h: "12h", v: 65 },
  { h: "13h", v: 90 },
  { h: "14h", v: 55 },
  { h: "15h", v: 25 },
  { h: "18h", v: 40 },
  { h: "19h", v: 75 },
  { h: "20h", v: 100 },
  { h: "21h", v: 85 },
  { h: "22h", v: 50 },
];

function statusColor(status: string) {
  switch (status) {
    case "Em preparo":
      return "bg-amber-500/15 text-amber-400";
    case "Saiu p/ entrega":
      return "bg-sky-500/15 text-sky-400";
    case "Entregue":
      return "bg-emerald-500/15 text-emerald-400";
    default:
      return "bg-red-500/15 text-red-400";
  }
}

function DashboardPage() {
  const maxV = Math.max(...horas.map((x) => x.v));

  return (
    <div className="min-h-svh bg-zinc-950 text-zinc-100">
      {/* Topbar */}
      <header className="hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          <span className="text-xl font-black italic tracking-tight text-[#EA1D2C]">
            hack du ifood
          </span>
          <div className="ml-auto flex items-center gap-2">
            <label className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 sm:flex">
              <Search className="h-4 w-4 text-zinc-500" />
              <input
                placeholder="Buscar pedido..."
                className="w-40 bg-transparent text-sm outline-none placeholder:text-zinc-600"
              />
            </label>
            <button className="relative rounded-xl border border-white/10 bg-white/5 p-2 transition-colors hover:bg-white/10">
              <Bell className="h-4 w-4" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#EA1D2C]" />
            </button>
            <Link
              to="/"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm transition-colors hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        {/* Heading */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <LayoutDashboard className="h-6 w-6 text-[#EA1D2C]" />
              Visão geral
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Restaurante Sabor &amp; Arte · hoje, 9 de outubro
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Loja aberta
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-center justify-between">
                <s.icon className="h-5 w-5 text-[#EA1D2C]" />
                <span
                  className={`flex items-center gap-0.5 text-xs font-medium ${
                    s.up ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {s.up ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                  {s.change}
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-zinc-400">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chart */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold">
                <Clock className="h-4 w-4 text-[#EA1D2C]" />
                Pedidos por horário
              </h2>
              <span className="text-xs text-zinc-500">hoje</span>
            </div>
            <div className="mt-6 flex h-44 gap-2">
              {horas.map((x) => (
                <div
                  key={x.h}
                  className="flex flex-1 flex-col items-center justify-end gap-1"
                >
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-[#EA1D2C]/60 to-[#EA1D2C]"
                    style={{ height: `${(x.v / maxV) * 100}%` }}
                  />
                  <span className="text-[10px] text-zinc-500">{x.h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top dishes */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="flex items-center gap-2 font-semibold">
              <UtensilsCrossed className="h-4 w-4 text-[#EA1D2C]" />
              Mais vendidos
            </h2>
            <ul className="mt-4 space-y-3">
              {pratos.map((p, i) => (
                <li key={p.nome} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#EA1D2C]/15 text-xs font-bold text-[#EA1D2C]">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.nome}</p>
                    <p className="text-xs text-zinc-500">{p.vendas} vendas</p>
                  </div>
                  <span className="text-sm font-semibold text-zinc-300">
                    {p.receita}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Orders table */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold">
              <Bike className="h-4 w-4 text-[#EA1D2C]" />
              Pedidos recentes
            </h2>
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <Percent className="h-3.5 w-3.5" />
              Atualizado agora
            </span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-zinc-500">
                  <th className="pb-3 pr-4 font-medium">Pedido</th>
                  <th className="pb-3 pr-4 font-medium">Cliente</th>
                  <th className="pb-3 pr-4 font-medium">Itens</th>
                  <th className="pb-3 pr-4 font-medium">Valor</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium">Tempo</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="py-3 pr-4 font-semibold text-[#EA1D2C]">
                      {p.id}
                    </td>
                    <td className="py-3 pr-4">{p.cliente}</td>
                    <td className="py-3 pr-4 text-zinc-400">{p.itens}</td>
                    <td className="py-3 pr-4 font-medium">{p.valor}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(p.status)}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 text-zinc-400">{p.tempo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
