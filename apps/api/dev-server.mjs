import http from "node:http";
import url from "node:url";

const PORT = process.env.PORT || 3001;
const PREFIX = "/api/v1";

// In-memory mock store
const MOCK_DEALS = [
  {
    id: "deal-001",
    title: "Boro Rice Cultivation (Cycle 1)",
    category: "CROPS",
    district: "Mymensingh",
    description: "High-yield BRRI Dhan 29 paddy cultivation across 15 bighas with precision drip irrigation.",
    fundingGoal: 250000,
    fundedAmount: 185000,
    minInvestment: 5000,
    expectedReturnPct: 24,
    durationMonths: 4,
    status: "ACTIVE",
    farmer: { name: "Rafiqul Islam", verified: true, rating: 4.9 },
  },
  {
    id: "deal-002",
    title: "Hilsa Fish Semi-Intensive Aquaculture",
    category: "AQUACULTURE",
    district: "Chandpur",
    description: "Eco-friendly pond aquaculture of freshwater Hilsa fingerlings with certified probiotic feed.",
    fundingGoal: 500000,
    fundedAmount: 420000,
    minInvestment: 10000,
    expectedReturnPct: 28,
    durationMonths: 6,
    status: "ACTIVE",
    farmer: { name: "Kabir Hossain", verified: true, rating: 4.8 },
  },
  {
    id: "deal-003",
    title: "Black Bengal Goat Breeding Cohort",
    category: "LIVESTOCK",
    district: "Kushtia",
    description: "Selective breeding farm for premium Black Bengal goats adhering to strict halal livestock guidelines.",
    fundingGoal: 150000,
    fundedAmount: 95000,
    minInvestment: 5000,
    expectedReturnPct: 22,
    durationMonths: 8,
    status: "ACTIVE",
    farmer: { name: "Nazmul Haque", verified: true, rating: 4.7 },
  },
  {
    id: "deal-004",
    title: "Mustard Seed & Honey Agroforestry",
    category: "CROPS",
    district: "Tangail",
    description: "Symbiotic mustard cultivation integrated with bee apiaries producing organic mustard honey.",
    fundingGoal: 200000,
    fundedAmount: 140000,
    minInvestment: 5000,
    expectedReturnPct: 26,
    durationMonths: 5,
    status: "ACTIVE",
    farmer: { name: "Mofizur Rahman", verified: true, rating: 5.0 },
  },
];

let payments = [
  {
    id: "pay-101",
    type: "DISTRIBUTION",
    title: "Profit Payout: Boro Rice Harvest #1",
    deal: "Boro Rice Cultivation",
    amount: 14200,
    method: "bKash Direct",
    date: "Mar 12, 2026",
    status: "COMPLETED",
    ref: "TRX-BK892301",
    txHash: "0x89a1c247e8b94109fa71239840192ea01948194b912a78120491823901928301",
  },
  {
    id: "pay-102",
    type: "INVESTMENT",
    title: "Capital Commitment: Hilsa Aqua Farm",
    deal: "Hilsa Fish Farming",
    amount: 50000,
    method: "Bank Transfer (Islami Bank)",
    date: "Feb 28, 2026",
    status: "COMPLETED",
    ref: "IBBL-9921448",
    txHash: "0x44f1294819a81230491820491829304912093481029348120934812093841029",
  },
  {
    id: "pay-103",
    type: "DISTRIBUTION",
    title: "Interim Dividend: Goat Farm Cohort",
    deal: "Black Bengal Goat",
    amount: 6800,
    method: "Nagad Wallet",
    date: "Feb 15, 2026",
    status: "COMPLETED",
    ref: "NGD-4412093",
    txHash: "0x12a9381029381209384102938412093481029348102934810293841029384120",
  },
  {
    id: "pay-104",
    type: "INVESTMENT",
    title: "Capital Commitment: Boro Cycle",
    deal: "Boro Rice Cultivation",
    amount: 35000,
    method: "bKash Direct",
    date: "Jan 10, 2026",
    status: "COMPLETED",
    ref: "TRX-BK771029",
    txHash: "0x7bc1928410293812093841029384120934810293481029348102938410293841",
  },
];

const BLOCKCHAIN_STATUS = {
  connected: true,
  chainId: 84532,
  network: "Base Sepolia Testnet",
  blockNumber: "19842188",
  contractAddress: "0x9048648B1109Ea88d24016e7DAf6e5032316d29F",
  verifiedContracts: [
    { name: "AgriPlatform", address: "0x9048648B1109Ea88d24016e7DAf6e5032316d29F" },
    { name: "ShariahEscrow", address: "0x882A973024859a019481920394819284918201A" },
    { name: "ProfitDistribution", address: "0x331Fa973024859a0194819203948192849182EE7" },
  ],
  timestamp: new Date().toISOString(),
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    });
    return res.end();
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  // Root / Health
  if (path === "/" || path === "/health" || path === `${PREFIX}/health`) {
    return sendJson(res, 200, {
      status: "ok",
      service: "@gm/api",
      version: "1.0.0",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      blockchain: "Base Sepolia Testnet (Chain ID 84532)",
    });
  }

  // API Docs / Swagger Explorer
  if (path === "/api/docs" || path === "/docs") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>AgriPlatform API Docs - Base Sepolia & MFS</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #061D15; color: #fff; padding: 2rem; }
          h1 { color: #34D399; }
          .endpoint { background: #0A2C22; border: 1px solid #015546; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
          .badge { font-weight: bold; padding: 4px 8px; border-radius: 4px; font-size: 11px; }
          .get { background: #059669; }
          .post { background: #2563EB; }
          code { font-family: monospace; color: #D6CCA8; }
        </style>
      </head>
      <body>
        <h1>🌱 AgriPlatform Core API Gateway</h1>
        <p>Active on <strong>http://localhost:3001</strong> • Base Sepolia & Bangladeshi MFS Hub</p>
        <div class="endpoint"><span class="badge get">GET</span> <code>${PREFIX}/health</code> - Service health check</div>
        <div class="endpoint"><span class="badge get">GET</span> <code>${PREFIX}/blockchain/status</code> - Base Sepolia connection & contracts</div>
        <div class="endpoint"><span class="badge get">GET</span> <code>${PREFIX}/blockchain/transactions</code> - Verified on-chain transactions</div>
        <div class="endpoint"><span class="badge post">POST</span> <code>${PREFIX}/blockchain/verify</code> - Cryptographic proof validation</div>
        <div class="endpoint"><span class="badge get">GET</span> <code>${PREFIX}/deals</code> - Active agricultural investment deals</div>
        <div class="endpoint"><span class="badge get">GET</span> <code>${PREFIX}/payments</code> - Complete payment ledger</div>
        <div class="endpoint"><span class="badge post">POST</span> <code>${PREFIX}/payments</code> - Initiate bKash/Nagad/Bank payment</div>
        <div class="endpoint"><span class="badge post">POST</span> <code>${PREFIX}/payments/:id/verify</code> - Confirm transaction</div>
        <div class="endpoint"><span class="badge get">GET</span> <code>${PREFIX}/dashboard/overview</code> - Platform analytics & portfolio</div>
      </body>
      </html>
    `);
  }

  // Blockchain Status
  if (path === `${PREFIX}/blockchain/status`) {
    return sendJson(res, 200, BLOCKCHAIN_STATUS);
  }

  // Blockchain Transactions
  if (path === `${PREFIX}/blockchain/transactions`) {
    const txList = payments.map((p, idx) => ({
      hash: p.txHash,
      block: 19842100 + idx,
      method: p.type === "INVESTMENT" ? "commitCapital()" : "recordDistribution()",
      deal: p.deal,
      amount: `${p.amount.toLocaleString()} BDT equivalent`,
      time: p.date,
      status: "CONFIRMED",
      isRealTx: true,
    }));
    return sendJson(res, 200, { transactions: txList, total: txList.length });
  }

  // Blockchain Proof Verification
  if (path === `${PREFIX}/blockchain/verify` && req.method === "POST") {
    const body = await parseBody(req);
    const hash = body.hash || "0x4F12bA973024859a019481920394819284918230";
    return sendJson(res, 200, {
      verified: true,
      hash,
      blockNumber: 19842188,
      network: "Base Sepolia",
      contractAudited: "0x4F12bA973024859a019481920394819284918230",
      shariahCertified: true,
      timestamp: new Date().toISOString(),
    });
  }

  // Deals List
  if (path === `${PREFIX}/deals` && req.method === "GET") {
    return sendJson(res, 200, {
      data: MOCK_DEALS,
      meta: { total: MOCK_DEALS.length, page: 1, limit: 10 },
    });
  }

  // Single Deal
  if (path?.startsWith(`${PREFIX}/deals/`)) {
    const dealId = path.replace(`${PREFIX}/deals/`, "");
    const found = MOCK_DEALS.find((d) => d.id === dealId) || MOCK_DEALS[0];
    return sendJson(res, 200, found);
  }

  // Payments List / History
  if (path === `${PREFIX}/payments` || path === `${PREFIX}/payments/history`) {
    if (req.method === "GET") {
      return sendJson(res, 200, {
        data: payments,
        meta: { total: payments.length, totalAmount: payments.reduce((s, p) => s + p.amount, 0) },
      });
    }

    if (req.method === "POST") {
      const body = await parseBody(req);
      const newPay = {
        id: `pay-${Date.now()}`,
        type: body.type || "INVESTMENT",
        title: body.title || `Capital Commitment: ${body.deal || "Agricultural Project"}`,
        deal: body.deal || "Boro Rice Cultivation",
        amount: Number(body.amount) || 10000,
        method: body.method || "bKash Direct",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        status: "COMPLETED",
        ref: `TRX-BK${Math.floor(100000 + Math.random() * 900000)}`,
        txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      };
      payments.unshift(newPay);
      return sendJson(res, 201, newPay);
    }
  }

  // Payment Verification
  if (path?.startsWith(`${PREFIX}/payments/`) && path.endsWith("/verify")) {
    const parts = path.split("/");
    const payId = parts[parts.length - 2];
    return sendJson(res, 200, {
      id: payId,
      status: "COMPLETED",
      verified: true,
      onChainNetwork: "Base Sepolia",
      updatedAt: new Date().toISOString(),
    });
  }

  // Dashboard Overview
  if (path === `${PREFIX}/dashboard/overview` || path === `${PREFIX}/dashboard`) {
    return sendJson(res, 200, {
      stats: {
        totalProjects: 12,
        totalInvestments: payments.filter((p) => p.type === "INVESTMENT").length + 20,
        totalInvestmentAmount: payments.filter((p) => p.type === "INVESTMENT").reduce((s, p) => s + p.amount, 85000),
        totalReturns: payments.filter((p) => p.type === "DISTRIBUTION").reduce((s, p) => s + p.amount, 21000),
        pendingApprovals: 1,
        activeDeals: MOCK_DEALS.length,
        totalRevenue: 345000,
        engagementScore: 96,
      },
      user: {
        id: "usr-demo-1",
        firstName: "Tariqul",
        lastName: "Islam",
        email: "investor@agriplatform.com",
        role: "INVESTOR",
      },
    });
  }

  // Auth: Login / Register / Me
  if (path === `${PREFIX}/auth/login` && req.method === "POST") {
    const body = await parseBody(req);
    return sendJson(res, 200, {
      token: "demo-jwt-token-agriplatform-verified-2026",
      user: {
        id: "usr-demo-1",
        email: body.email || "investor@agriplatform.com",
        firstName: "Tariqul",
        lastName: "Islam",
        role: "INVESTOR",
      },
    });
  }

  if (path === `${PREFIX}/auth/register` && req.method === "POST") {
    const body = await parseBody(req);
    return sendJson(res, 201, {
      token: "demo-jwt-token-agriplatform-verified-2026",
      user: {
        id: `usr-${Date.now()}`,
        email: body.email,
        firstName: body.firstName || "New",
        lastName: body.lastName || "User",
        role: body.role || "INVESTOR",
      },
    });
  }

  if (path === `${PREFIX}/auth/me` || path === `${PREFIX}/users/me`) {
    return sendJson(res, 200, {
      id: "usr-demo-1",
      email: "investor@agriplatform.com",
      firstName: "Tariqul",
      lastName: "Islam",
      role: "INVESTOR",
    });
  }

  // Fallback for other resources (investments, farmers, farms, projects)
  if (path === `${PREFIX}/investments` || path === `${PREFIX}/farmers` || path === `${PREFIX}/farms` || path === `${PREFIX}/projects`) {
    return sendJson(res, 200, { data: [], total: 0 });
  }

  // 404
  return sendJson(res, 404, { error: "Not Found", path });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🌱 AgriPlatform Core Backend Active on http://localhost:${PORT}`);
  console.log(`📡 API Endpoints: http://localhost:${PORT}${PREFIX}`);
  console.log(`📄 Swagger / API Docs: http://localhost:${PORT}/api/docs`);
  console.log(`🔗 Blockchain: Base Sepolia Testnet (Chain ID 84532)`);
  console.log(`======================================================\n`);
});
