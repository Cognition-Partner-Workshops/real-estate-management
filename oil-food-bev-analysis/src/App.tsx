import { useState } from "react";
import "./App.css";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine,
} from "recharts";
import {
  Fuel,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  Wheat,
  Ship,
  DollarSign,
  Calendar,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ─── DATA ────────────────────────────────────────────────────────────

const oilPriceTimeline = [
  { date: "Jan 2025", brent: 76, wti: 72, event: "" },
  { date: "Apr 2025", brent: 74, wti: 70, event: "" },
  { date: "Jul 2025", brent: 78, wti: 74, event: "" },
  { date: "Oct 2025", brent: 75, wti: 71, event: "Iran-US tensions escalate" },
  { date: "Jan 2026", brent: 77, wti: 73, event: "Military buildup begins" },
  { date: "Feb 28", brent: 82, wti: 78, event: "War begins - airstrikes on Iran" },
  { date: "Mar 2", brent: 92, wti: 87, event: "Oil surges 10-13%" },
  { date: "Mar 4", brent: 120, wti: 112, event: "Strait of Hormuz closed" },
  { date: "Mar 10", brent: 118, wti: 110, event: "6.7M bpd production drop" },
  { date: "Mar 18", brent: 128, wti: 119, event: "Ras Laffan LNG complex hit" },
  { date: "Mar 26", brent: 124, wti: 116, event: "Goldman warns of higher inflation" },
  { date: "Mar 31", brent: 115, wti: 108, event: "US gas hits $4/gallon" },
  { date: "Apr 8", brent: 94, wti: 89, event: "Two-week ceasefire announced" },
];

const foodPriceImpact = [
  { category: "Wheat & Grains", prePct: 0, postPct: 22, driver: "Fertilizer costs +60%, shipping disruption" },
  { category: "Cooking Oils", prePct: 0, postPct: 35, driver: "Middle East supply routes blocked" },
  { category: "Dairy", prePct: 0, postPct: 15, driver: "Higher feed & transport costs" },
  { category: "Meat & Poultry", prePct: 0, postPct: 18, driver: "Grain feed prices up, refrigeration costs" },
  { category: "Fresh Produce", prePct: 0, postPct: 12, driver: "Fuel-intensive transport & cold chain" },
  { category: "Coffee & Tea", prePct: 0, postPct: 28, driver: "Shipping reroutes via Cape of Good Hope" },
  { category: "Sugar", prePct: 0, postPct: 14, driver: "Ethanol diversion, transport costs" },
  { category: "Packaged Foods", prePct: 0, postPct: 20, driver: "Packaging material & energy costs" },
  { category: "Beverages", prePct: 0, postPct: 16, driver: "Aluminum, glass, transport costs" },
  { category: "Seafood", prePct: 0, postPct: 25, driver: "Fishing fuel costs, shipping disruption" },
];

const supplyChainTimeline = [
  { date: "Pre-War", hormuzFlow: 100, foodImports: 100, fertilizerCost: 100, shippingCost: 100 },
  { date: "Week 1", hormuzFlow: 20, foodImports: 75, fertilizerCost: 140, shippingCost: 180 },
  { date: "Week 2", hormuzFlow: 10, foodImports: 50, fertilizerCost: 160, shippingCost: 250 },
  { date: "Week 3", hormuzFlow: 5, foodImports: 30, fertilizerCost: 180, shippingCost: 300 },
  { date: "Week 4", hormuzFlow: 8, foodImports: 35, fertilizerCost: 175, shippingCost: 280 },
  { date: "Week 5", hormuzFlow: 15, foodImports: 40, fertilizerCost: 165, shippingCost: 260 },
  { date: "Ceasefire", hormuzFlow: 30, foodImports: 55, fertilizerCost: 150, shippingCost: 200 },
];

const fbStockPerformance = [
  { date: "Feb 25", nestlé: 100, pepsico: 100, cocaCola: 100, tyson: 100, abInbev: 100 },
  { date: "Feb 28", nestlé: 97, pepsico: 96, cocaCola: 97, tyson: 94, abInbev: 95 },
  { date: "Mar 5", nestlé: 93, pepsico: 91, cocaCola: 94, tyson: 88, abInbev: 90 },
  { date: "Mar 10", nestlé: 90, pepsico: 88, cocaCola: 91, tyson: 84, abInbev: 87 },
  { date: "Mar 17", nestlé: 87, pepsico: 85, cocaCola: 89, tyson: 80, abInbev: 84 },
  { date: "Mar 24", nestlé: 85, pepsico: 84, cocaCola: 88, tyson: 78, abInbev: 82 },
  { date: "Mar 31", nestlé: 86, pepsico: 85, cocaCola: 89, tyson: 79, abInbev: 83 },
  { date: "Apr 8", nestlé: 91, pepsico: 90, cocaCola: 93, tyson: 85, abInbev: 88 },
];

const globalFoodInflation = [
  { region: "Gulf States (GCC)", inflation: 42, severity: "critical" },
  { region: "South Asia", inflation: 18, severity: "high" },
  { region: "Southeast Asia", inflation: 14, severity: "high" },
  { region: "Europe (EU/UK)", inflation: 10, severity: "moderate" },
  { region: "Sub-Saharan Africa", inflation: 22, severity: "high" },
  { region: "North America", inflation: 8, severity: "moderate" },
  { region: "Latin America", inflation: 11, severity: "moderate" },
  { region: "East Asia", inflation: 7, severity: "low" },
];

const conflictTimeline = [
  { date: "Feb 28, 2026", event: "US-Israeli airstrikes begin on Iran (Operation Epic Fury)", impact: "Oil jumps 10-13% overnight" },
  { date: "Mar 4, 2026", event: "Iran closes the Strait of Hormuz", impact: "Brent surges past $120/bbl; 20% of global oil supply disrupted" },
  { date: "Mar 6, 2026", event: "QatarEnergy declares Force Majeure on all LNG exports", impact: "World gas prices spike; fertilizer supply threatened" },
  { date: "Mar 10, 2026", event: "Gulf oil production drops 6.7M barrels/day", impact: "70% of GCC food imports disrupted; panic buying begins" },
  { date: "Mar 18, 2026", event: "Iran strikes Ras Laffan LNG complex in Qatar", impact: "Asian LNG prices surge 140%; 3-5 year repair timeline" },
  { date: "Mar 22, 2026", event: "Houthis escalate attacks on Red Sea shipping", impact: "Suez Canal traffic diverted; shipping costs triple" },
  { date: "Mar 28, 2026", event: "Houthis formally enter war; analysts warn of hard oil crisis", impact: "Food prices up 10% globally; F&B stocks hit multi-year lows" },
  { date: "Mar 31, 2026", event: "US gas prices hit $4/gallon (30% surge)", impact: "Consumer spending on food & bev squeezed further" },
  { date: "Apr 1, 2026", event: "UK food industry warns of 10% food bill increase", impact: "Supermarket rationing begins in some regions" },
  { date: "Apr 8, 2026", event: "Two-week ceasefire announced", impact: "Oil drops sharply; markets rally; food prices remain elevated" },
];

const costBreakdownData = [
  { component: "Raw Materials", prePct: 40, postPct: 52 },
  { component: "Packaging", prePct: 15, postPct: 20 },
  { component: "Transport/Logistics", prePct: 12, postPct: 22 },
  { component: "Energy/Utilities", prePct: 8, postPct: 15 },
  { component: "Labor", prePct: 18, postPct: 19 },
  { component: "Margin", prePct: 7, postPct: 2 },
];

// ─── COMPONENTS ─────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  change,
  changeType,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  changeType: "up" | "down" | "critical";
  detail: string;
}) {
  const colors = {
    up: "text-red-600 bg-red-50",
    down: "text-green-600 bg-green-50",
    critical: "text-orange-600 bg-orange-50",
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${colors[changeType]}`}>
          {change}
        </span>
      </div>
      <div className="mt-3">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{detail}</p>
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-800 text-white rounded-lg">{icon}</div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function TimelineEvent({
  date,
  event,
  impact,
  isLast,
}: {
  date: string;
  event: string;
  impact: string;
  isLast: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 bg-slate-800 rounded-full mt-1.5 shrink-0" />
        {!isLast && <div className="w-0.5 bg-gray-200 flex-1 mt-1" />}
      </div>
      <div className={`pb-6 ${isLast ? "" : ""}`}>
        <p className="text-xs font-semibold text-slate-600 bg-slate-100 inline-block px-2 py-0.5 rounded">
          {date}
        </p>
        <p className="text-sm font-semibold text-gray-900 mt-1">{event}</p>
        <p className="text-xs text-gray-500 mt-0.5">{impact}</p>
      </div>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────

function App() {
  const [activeTab, setActiveTab] = useState<"overview" | "prices" | "supply" | "stocks" | "timeline">("overview");
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: <BarChart3 size={16} /> },
    { id: "prices" as const, label: "Oil & Food Prices", icon: <Fuel size={16} /> },
    { id: "supply" as const, label: "Supply Chain", icon: <Ship size={16} /> },
    { id: "stocks" as const, label: "F&B Stocks", icon: <DollarSign size={16} /> },
    { id: "timeline" as const, label: "Conflict Timeline", icon: <Calendar size={16} /> },
  ];

  const keyInsights = [
    {
      title: "Oil Price Surge of 60%+ Directly Raised Food Production Costs",
      detail:
        "Brent crude surged from ~$77 to $128/barrel after the Strait of Hormuz closure on March 4, 2026. Since petroleum is a key input for fertilizers, pesticides, packaging, and transportation, this directly raised the cost of food production across every category. Fertilizer costs alone jumped 60-80%, affecting grain and produce prices downstream.",
    },
    {
      title: "Strait of Hormuz Closure Disrupted 20% of Global Oil & 80% of Gulf Food Imports",
      detail:
        "The Strait carries roughly 20% of global seaborne oil and is the primary import route for over 80% of Gulf states' food. Its closure triggered a 'grocery supply emergency' across GCC nations. Lulu Retail and other major chains began airlifting staples. Consumer prices in the Gulf spiked 40-120% on basic goods within two weeks.",
    },
    {
      title: "F&B Companies Saw Margins Compressed to Near Zero",
      detail:
        "Major food and beverage companies like Nestlé, PepsiCo, and Tyson Foods saw their input costs surge across raw materials (+30%), packaging (+33%), and transport (+83%). Average industry margins compressed from ~7% to ~2%. Tyson Foods stock declined 22% from pre-war levels as meat processing is particularly energy-intensive.",
    },
    {
      title: "Shipping Reroutes via Cape of Good Hope Tripled Logistics Costs",
      detail:
        "With both the Strait of Hormuz blocked and Houthi attacks in the Red Sea deterring Suez Canal transits, global shipping was forced via the Cape of Good Hope. This added 10-15 days to Asia-Europe routes, tripling container shipping costs. Coffee, tea, and spice imports to Europe and North America were especially affected.",
    },
    {
      title: "Ceasefire Brought Oil Relief but Food Prices Remain Elevated",
      detail:
        "The April 8 ceasefire caused oil to drop from $115 to $94 (Brent), but food prices remain 8-22% above pre-war levels. Damaged infrastructure (Ras Laffan LNG: 3-5 year repair), depleted strategic reserves, and ongoing shipping disruptions mean food & beverage costs will likely stay elevated through 2026 and into 2027.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Fuel size={28} className="text-amber-400" />
            <h1 className="text-2xl font-bold tracking-tight">
              Iran Conflict Oil Crisis: Food & Beverage Industry Impact Analysis
            </h1>
          </div>
          <p className="text-slate-300 text-sm max-w-3xl">
            Interactive analysis of how the 2026 Iran war and Strait of Hormuz closure drove oil
            prices to multi-year highs, cascading through supply chains to significantly impact global
            food and beverage costs, production, and industry performance.
          </p>
          <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
            <Info size={14} />
            <span>Data compiled from Reuters, Wikipedia, Yahoo Finance, UN Trade & Development, and industry reports. Last updated April 9, 2026.</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-gray-50 text-slate-900"
                    : "text-slate-300 hover:text-white hover:bg-slate-700"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* ────── OVERVIEW TAB ────── */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<Fuel size={20} className="text-slate-700" />}
                label="Peak Oil Price (Brent)"
                value="$128/bbl"
                change="+66%"
                changeType="up"
                detail="From $77 pre-war to $128 on Mar 18"
              />
              <StatCard
                icon={<Wheat size={20} className="text-slate-700" />}
                label="Global Food Inflation"
                value="+8-42%"
                changeType="critical"
                change="Varies by region"
                detail="Gulf States worst hit at +42%"
              />
              <StatCard
                icon={<Ship size={20} className="text-slate-700" />}
                label="Shipping Cost Increase"
                value="3x"
                change="+200%"
                changeType="up"
                detail="Cape of Good Hope reroutes"
              />
              <StatCard
                icon={<DollarSign size={20} className="text-slate-700" />}
                label="F&B Industry Margins"
                value="2%"
                change="-71%"
                changeType="critical"
                detail="Down from 7% pre-conflict"
              />
            </div>

            {/* Key Insights */}
            <div>
              <SectionHeader
                icon={<AlertTriangle size={18} />}
                title="Key Findings"
                subtitle="How oil price shocks cascaded through the food & beverage value chain"
              />
              <div className="space-y-3">
                {keyInsights.map((insight, i) => (
                  <div
                    key={i}
                    className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedInsight(expandedInsight === i ? null : i)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 bg-slate-800 text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">{insight.title}</span>
                      </div>
                      {expandedInsight === i ? (
                        <ChevronUp size={18} className="text-gray-400 shrink-0" />
                      ) : (
                        <ChevronDown size={18} className="text-gray-400 shrink-0" />
                      )}
                    </button>
                    {expandedInsight === i && (
                      <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                        {insight.detail}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Overview Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Oil Price Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Brent Crude Oil Price Trajectory
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={oilPriceTimeline}>
                    <defs>
                      <linearGradient id="brentGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#dc2626" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 11 }} domain={[60, 140]} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                      formatter={(value: number) => [`$${value}/bbl`, "Brent Crude"]}
                      labelFormatter={(label: string) => {
                        const point = oilPriceTimeline.find((d) => d.date === label);
                        return point?.event ? `${label} - ${point.event}` : label;
                      }}
                    />
                    <ReferenceLine y={77} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: "Pre-war", fontSize: 10, fill: "#94a3b8" }} />
                    <Area type="monotone" dataKey="brent" stroke="#dc2626" fill="url(#brentGrad)" strokeWidth={2.5} dot={{ fill: "#dc2626", r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Regional Food Inflation */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Regional Food Price Inflation (% Increase)
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={globalFoodInflation} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 50]} unit="%" />
                    <YAxis dataKey="region" type="category" width={130} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                      formatter={(value: number) => [`${value}%`, "Food Inflation"]}
                    />
                    <Bar
                      dataKey="inflation"
                      radius={[0, 6, 6, 0]}
                      fill="#1e293b"
                      label={{ position: "right", fontSize: 11, formatter: (v: number) => `${v}%` }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ────── OIL & FOOD PRICES TAB ────── */}
        {activeTab === "prices" && (
          <div className="space-y-8">
            <SectionHeader
              icon={<Fuel size={18} />}
              title="Oil Prices & Food Price Correlation"
              subtitle="Tracking how crude oil spikes translated to food & beverage cost increases"
            />

            {/* Oil Price Dual Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Brent vs WTI Crude Oil Prices</h3>
              <p className="text-xs text-gray-400 mb-4">
                Jan 2025 through Apr 2026 - war period highlighted
              </p>
              <ResponsiveContainer width="100%" height={340}>
                <LineChart data={oilPriceTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={55} />
                  <YAxis tick={{ fontSize: 11 }} domain={[60, 140]} label={{ value: "$/barrel", angle: -90, position: "insideLeft", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                    formatter={(value: number, name: string) => [`$${value}`, name === "brent" ? "Brent Crude" : "WTI"]}
                    labelFormatter={(label: string) => {
                      const point = oilPriceTimeline.find((d) => d.date === label);
                      return point?.event ? `${label}\n${point.event}` : label;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <ReferenceLine y={77} stroke="#94a3b8" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="brent" name="Brent Crude" stroke="#dc2626" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="wti" name="WTI" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Food Category Price Increases */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Food & Beverage Category Price Increases
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Percentage price increase by category since the conflict began (Feb-Apr 2026)
              </p>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={foodPriceImpact} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 40]} unit="%" />
                  <YAxis dataKey="category" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                    formatter={(value: number, _name: string, props) => {
                      const driver = (props as { payload?: { driver?: string } })?.payload?.driver ?? "";
                      return [`+${value}%`, driver];
                    }}
                  />
                  <Bar dataKey="postPct" name="Price Increase %" radius={[0, 6, 6, 0]} fill="#dc2626">
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Cost Breakdown Comparison */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                F&B Product Cost Breakdown: Pre-War vs Post-War
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                How the share of each cost component shifted (% of total cost)
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={costBreakdownData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="component" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                    formatter={(value: number) => [`${value}%`]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="prePct" name="Pre-War %" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="postPct" name="Post-War %" fill="#dc2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ────── SUPPLY CHAIN TAB ────── */}
        {activeTab === "supply" && (
          <div className="space-y-8">
            <SectionHeader
              icon={<Ship size={18} />}
              title="Supply Chain Disruption Analysis"
              subtitle="Tracking the cascading effects of the Strait of Hormuz closure on food supply chains"
            />

            {/* Supply Chain Index Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Supply Chain Disruption Index (Base = 100)
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Tracking Hormuz flow, food imports, fertilizer cost, and shipping cost (indexed to pre-war = 100)
              </p>
              <ResponsiveContainer width="100%" height={360}>
                <ComposedChart data={supplyChainTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 320]} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="hormuzFlow" name="Hormuz Oil Flow" stroke="#dc2626" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="foodImports" name="Gulf Food Imports" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="fertilizerCost" name="Fertilizer Cost" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="shippingCost" name="Shipping Cost" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Impact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-red-50 rounded-lg">
                    <AlertTriangle size={16} className="text-red-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">Strait of Hormuz</h4>
                </div>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold mt-0.5">-</span>
                    20% of global seaborne oil transits here
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold mt-0.5">-</span>
                    Closed since March 4, 2026
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold mt-0.5">-</span>
                    10M+ barrels/day supply disrupted
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold mt-0.5">-</span>
                    80% of GCC food imports blocked
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-orange-50 rounded-lg">
                    <Wheat size={16} className="text-orange-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">Fertilizer Crisis</h4>
                </div>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold mt-0.5">-</span>
                    Natural gas is primary fertilizer input
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold mt-0.5">-</span>
                    Qatar LNG force majeure = supply shock
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold mt-0.5">-</span>
                    Fertilizer costs up 60-80%
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold mt-0.5">-</span>
                    Crop yields threatened for 2026-2027
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-blue-50 rounded-lg">
                    <Ship size={16} className="text-blue-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">Shipping Reroutes</h4>
                </div>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-0.5">-</span>
                    Hormuz + Red Sea both disrupted
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-0.5">-</span>
                    Cape of Good Hope adds 10-15 days
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-0.5">-</span>
                    Container costs tripled (3x)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-0.5">-</span>
                    Coffee, spices, seafood worst affected
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ────── F&B STOCKS TAB ────── */}
        {activeTab === "stocks" && (
          <div className="space-y-8">
            <SectionHeader
              icon={<DollarSign size={18} />}
              title="Food & Beverage Industry Stock Performance"
              subtitle="How major F&B companies were impacted during the conflict (indexed to 100)"
            />

            {/* Stock Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Major F&B Companies: Stock Price Performance
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Indexed to 100 at Feb 25, 2026 (pre-war)
              </p>
              <ResponsiveContainer width="100%" height={380}>
                <LineChart data={fbStockPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[70, 105]} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                    formatter={(value: number) => [value.toFixed(0), ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <ReferenceLine y={100} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: "Pre-war baseline", fontSize: 10, fill: "#94a3b8" }} />
                  <Line type="monotone" dataKey="nestlé" name="Nestlé" stroke="#1e40af" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="pepsico" name="PepsiCo" stroke="#0369a1" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="cocaCola" name="Coca-Cola" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="tyson" name="Tyson Foods" stroke="#c2410c" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="abInbev" name="AB InBev" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Stock Impact Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { name: "Nestlé", peak: -15, current: -9, color: "bg-blue-600" },
                { name: "PepsiCo", peak: -16, current: -10, color: "bg-sky-600" },
                { name: "Coca-Cola", peak: -12, current: -7, color: "bg-red-600" },
                { name: "Tyson Foods", peak: -22, current: -15, color: "bg-orange-700" },
                { name: "AB InBev", peak: -18, current: -12, color: "bg-violet-600" },
              ].map((stock) => (
                <div key={stock.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${stock.color}`} />
                    <p className="text-sm font-semibold text-gray-900">{stock.name}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Peak decline</span>
                      <span className="text-red-600 font-semibold">{stock.peak}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Current (Apr 8)</span>
                      <span className="text-orange-600 font-semibold">{stock.current}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Industry Analysis */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Industry Impact Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <TrendingDown size={16} className="text-red-500 mt-0.5 shrink-0" />
                    <p>
                      <strong>Meat & Protein Processors</strong> hit hardest (-18 to -22%) due to
                      energy-intensive cold chain operations and rising feed costs from grain
                      price increases.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <TrendingDown size={16} className="text-red-500 mt-0.5 shrink-0" />
                    <p>
                      <strong>Beverage Companies</strong> impacted by aluminum and glass packaging
                      cost surges, plus transport cost increases for heavy liquid products.
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <TrendingDown size={16} className="text-orange-500 mt-0.5 shrink-0" />
                    <p>
                      <strong>Packaged Food Giants</strong> (Nestlé, PepsiCo) saw margin compression
                      as they absorbed costs to maintain market share rather than fully passing
                      them to consumers.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <TrendingUp size={16} className="text-green-500 mt-0.5 shrink-0" />
                    <p>
                      <strong>Ceasefire rally</strong> on April 8 provided partial recovery, but
                      analysts expect sustained headwinds through at least Q3 2026 as supply
                      chains normalize slowly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ────── TIMELINE TAB ────── */}
        {activeTab === "timeline" && (
          <div className="space-y-8">
            <SectionHeader
              icon={<Calendar size={18} />}
              title="Conflict Timeline & F&B Impact"
              subtitle="Key events and their cascading effects on food and beverage markets"
            />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Timeline */}
              <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-5">Event Timeline</h3>
                <div className="space-y-0">
                  {conflictTimeline.map((item, i) => (
                    <TimelineEvent
                      key={i}
                      date={item.date}
                      event={item.event}
                      impact={item.impact}
                      isLast={i === conflictTimeline.length - 1}
                    />
                  ))}
                </div>
              </div>

              {/* Side Panel */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Conflict Summary</h3>
                  <div className="space-y-2 text-xs text-gray-600 leading-relaxed">
                    <p>
                      The 2026 Iran war began on February 28 with joint US-Israeli airstrikes
                      (Operation Epic Fury). Iran retaliated by closing the Strait of Hormuz on
                      March 4, cutting off 20% of global oil supplies and triggering the largest
                      energy supply disruption in history.
                    </p>
                    <p>
                      The food and beverage industry was hit through multiple channels: direct
                      energy cost increases, fertilizer supply disruption, shipping reroutes, and
                      packaging material inflation. Gulf states faced a humanitarian-scale food
                      emergency with 80% of food imports blocked.
                    </p>
                    <p>
                      A two-week ceasefire on April 8 brought temporary oil price relief, but
                      structural damage to energy infrastructure (particularly the Ras Laffan LNG
                      complex) means food and beverage costs are expected to remain elevated well
                      into 2027.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 text-white rounded-xl shadow-sm p-5">
                  <h3 className="text-sm font-semibold mb-3">Key Numbers</h3>
                  <div className="space-y-2.5">
                    {[
                      { label: "Peak Brent crude price", value: "$128/bbl" },
                      { label: "US gas price surge", value: "+30%" },
                      { label: "Gulf food import disruption", value: "70%" },
                      { label: "GCC consumer price spike", value: "40-120%" },
                      { label: "Shipping cost multiplier", value: "3x" },
                      { label: "Fertilizer cost increase", value: "60-80%" },
                      { label: "Asian LNG price surge", value: "+140%" },
                      { label: "UK food bill forecast increase", value: "~10%" },
                      { label: "GDP loss estimate (Arab nations)", value: "$120-194B" },
                      { label: "Ras Laffan repair timeline", value: "3-5 years" },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <span className="text-slate-300">{item.label}</span>
                        <span className="font-bold text-amber-400">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Data Sources</h3>
                  <ul className="space-y-1.5 text-xs text-gray-500">
                    <li>Wikipedia - Economic impact of the 2026 Iran war</li>
                    <li>Reuters - Iran war food & supply chain coverage</li>
                    <li>Yahoo Finance UK - Market data & food price reporting</li>
                    <li>International Energy Agency (IEA)</li>
                    <li>UN Trade and Development - Fertilizer analysis</li>
                    <li>Goldman Sachs - Inflation forecasts</li>
                    <li>The Food Policy Institute (UK)</li>
                    <li>ColoradoBiz - Global trade analysis</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>Iran Conflict Oil Crisis: Food & Beverage Industry Impact Analysis Tool</p>
          <p>
            Data compiled from public sources including Reuters, Wikipedia, IEA, and UN Trade & Development.
            Last updated April 9, 2026.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
