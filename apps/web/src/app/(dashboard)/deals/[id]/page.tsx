"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Clock,
  TrendingUp,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Wallet,
  Sprout,
  Coins,
  ChevronRight,
  Sparkles,
  FileCheck,
  Building,
  Mail,
  Send,
  Check,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_DEALS, MOCK_FARMS } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { useAccount, useConnect, useSendTransaction, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useWalletStore, DEFAULT_DEMO_CHAIN, ETH_SEPOLIA_CHAIN } from "@/lib/stores/wallet.store";
import { baseSepolia, sepolia } from "viem/chains";

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const dealId = params?.id as string;

  // Find deal or fallback to first deal
  const deal = useMemo(() => {
    return MOCK_DEALS.find((d) => d.id === dealId) || MOCK_DEALS[0];
  }, [dealId]);

  const farm = useMemo(() => {
    return MOCK_FARMS.find((f) => f.id === deal.farmId) || MOCK_FARMS[0];
  }, [deal.farmId]);

  // Investment Calculator State
  const [investAmount, setInvestAmount] = useState<number>(deal.minInvestment);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isRealTx, setIsRealTx] = useState(false);
  const [copiedContract, setCopiedContract] = useState(false);

  // Wagmi & Store Web3 Wallet
  const { isConnected: isWagmiConnected, address: wagmiAddress } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { openConnectModal } = useConnectModal();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { sendTransactionAsync } = useSendTransaction();

  // Email Certificate State
  const [investorEmail, setInvestorEmail] = useState("binsadikmuhutasim@gmail.com");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const storeAddress = useWalletStore((s) => s.address);
  const storeChain = useWalletStore((s) => s.chain);
  const isStoreConnected = useWalletStore((s) => s.isConnected);
  const isSimulated = useWalletStore((s) => s.isSimulated);
  const connectDemoWallet = useWalletStore((s) => s.connectDemoWallet);
  const disconnectStore = useWalletStore((s) => s.disconnect);
  const addTransaction = useWalletStore((s) => s.addTransaction);

  const activeAddress = isWagmiConnected ? wagmiAddress : storeAddress;
  const isConnected = (isWagmiConnected && !!wagmiAddress) || isStoreConnected;

  const isEthSepolia = isWagmiConnected ? chainId === sepolia.id : (storeChain?.id === sepolia.id);
  const isBaseSepolia = isWagmiConnected ? chainId === baseSepolia.id : (storeChain?.id === baseSepolia.id || !storeChain);
  const activeNetworkName = isEthSepolia ? "Ethereum Sepolia (11155111)" : "Base Sepolia (84532)";

  // Local funded amount so user sees real-time progress update immediately!
  const [localFundedAmount, setLocalFundedAmount] = useState(deal.fundedAmount);
  const pctFunded = Math.min(100, Math.round((localFundedAmount / deal.fundingGoal) * 100));
  const remaining = Math.max(0, deal.fundingGoal - localFundedAmount);

  // Calculator figures
  const estimatedReturnAmount = Math.round(investAmount * (1 + (deal.expectedReturnPct || 20) / 100));
  const estimatedProfit = estimatedReturnAmount - investAmount;

  const quickAmounts = [
    deal.minInvestment,
    deal.minInvestment * 2,
    deal.minInvestment * 5,
    deal.minInvestment * 10,
  ];

  const sendEmailCertificate = async (targetTxHash?: string) => {
    if (!investorEmail || !investorEmail.includes("@")) {
      toast.error("Invalid Email", "Please enter a valid email address.");
      return;
    }
    setIsSendingEmail(true);
    try {
      const res = await fetch("http://localhost:3001/api/v1/mail/investment-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: investorEmail.trim(),
          recipientName: "Muhutasim (Valued Partner)",
          dealTitle: deal.title,
          dealId: deal.id,
          amount: formatCurrency(investAmount),
          currency: "BDT",
          txHash: targetTxHash || txHash || "0x99d8e62243409390d2a437d4807f95204c329afa85b5cb29862b8a40e5437380",
          contractAddress: "0x4F129B515286F0dE0Ec43093224B4912953B8230",
          blockNumber: 18492040,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailSent(true);
        toast.success("Certificate Emailed!", `Official Deed with Etherscan & BaseScan proof dispatched to ${investorEmail}`);
      } else {
        toast.info("Email Status", data.message || "Email queued");
      }
    } catch (e: any) {
      console.warn("Could not dispatch email:", e);
      toast.error("Email Notice", "Could not reach email service. Ensure API is running on port 3001.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleInvest = async () => {
    if (investAmount < deal.minInvestment) {
      toast.error("Invalid Amount", `Minimum investment is ${formatCurrency(deal.minInvestment)}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isWagmiConnected && wagmiAddress) {
        if (!isBaseSepolia && switchChain) {
          try {
            await switchChain({ chainId: baseSepolia.id });
          } catch {
            toast.warn("Switch Network", "Please confirm switching your wallet to Base Sepolia.");
          }
        }
        // Send a real on-chain transaction via connected Web3 wallet (Base Sepolia)
        const targetContract = (process.env.NEXT_PUBLIC_AGRI_PLATFORM_ADDRESS || "0x9048648B1109Ea88d24016e7DAf6e5032316d29F") as `0x${string}`;
        const hash = await sendTransactionAsync({
          to: targetContract,
          value: 0n,
        });
        setTxHash(hash);
        setIsRealTx(true);
        setLocalFundedAmount((prev) => prev + investAmount);
        addTransaction({
          hash,
          dealTitle: deal.title,
          amount: `${formatCurrency(investAmount)} equivalent`,
          timestamp: "Just now",
          status: "CONFIRMED",
          isRealTx: true,
        });
        toast.success(
          "On-Chain Transaction Submitted!",
          `Broadcasted to Base Sepolia. Hash: ${hash.slice(0, 10)}...`
        );
        // Automatically dispatch email certificate
        sendEmailCertificate(hash);
      } else if (isStoreConnected && isSimulated) {
        // Real-time simulated on-chain transaction on Base Sepolia
        await new Promise((resolve) => setTimeout(resolve, 1200));
        const simHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
        setTxHash(simHash);
        setIsRealTx(false);
        setLocalFundedAmount((prev) => prev + investAmount);
        addTransaction({
          hash: simHash,
          dealTitle: deal.title,
          amount: `${formatCurrency(investAmount)} equivalent`,
          timestamp: "Just now",
          status: "CONFIRMED",
          isRealTx: false,
        });
        toast.success(
          "Commitment Confirmed on Base Sepolia!",
          `Contract state updated. Hash: ${simHash.slice(0, 10)}...`
        );
        // Automatically dispatch email certificate
        sendEmailCertificate(simHash);
      } else {
        // No wallet connected: prompt connection
        if (openConnectModal) {
          openConnectModal();
        } else {
          connectDemoWallet();
        }
        toast.info("Connect Wallet", "Please connect a wallet to finalize your investment commitment.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        "Transaction Failed",
        err?.shortMessage || err?.message?.slice(0, 80) || "User rejected or failed transaction."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyContract = () => {
    navigator.clipboard.writeText("0x4F12bA973024859a019481920394819284918230");
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Deals
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Shariah Certified
          </Badge>
          <Badge className="bg-primary text-white">
            Base Sepolia Verified
          </Badge>
        </div>
      </div>

      {/* Hero Title Card */}
      <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs uppercase font-semibold">
                {deal.category}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {deal.district}, Bangladesh
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {deal.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-3xl leading-relaxed">
              {deal.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-muted/40 rounded-xl p-3 text-center border">
              <span className="text-xs text-muted-foreground block">Target ROI</span>
              <span className="text-lg font-bold text-amber-600">
                {deal.expectedReturnPct}%
              </span>
            </div>
            <div className="bg-muted/40 rounded-xl p-3 text-center border">
              <span className="text-xs text-muted-foreground block">Duration</span>
              <span className="text-lg font-bold text-foreground">
                {deal.durationMonths} Mo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details, Milestones, Shariah & Farm */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="milestones" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="milestones">Harvest Milestones</TabsTrigger>
              <TabsTrigger value="shariah">Shariah Governance</TabsTrigger>
              <TabsTrigger value="farm">Farm & Auditor</TabsTrigger>
            </TabsList>

            {/* Milestones Tab */}
            <TabsContent value="milestones" className="mt-4 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" /> Agricultural Lifecycle & Payout Milestones
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Each stage is audited on-field before smart-contract disbursement triggers.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      step: "01",
                      title: "Land Preparation & Bio-Fertilization",
                      date: "Month 1",
                      status: "COMPLETED",
                      desc: "Tillage, organic compost conditioning, and soil ph testing completed and approved.",
                    },
                    {
                      step: "02",
                      title: "Certified Seedling Planting / Inoculation",
                      date: "Month 2",
                      status: "IN_PROGRESS",
                      desc: "High-yield certified seeds sown under controlled moisture management.",
                    },
                    {
                      step: "03",
                      title: "Growth Monitoring & Agri-Officer Field Audit",
                      date: "Month 3–4",
                      status: "UPCOMING",
                      desc: "Mid-cycle IoT sensors and field agronomist verify pest immunity and biomass index.",
                    },
                    {
                      step: "04",
                      title: "Harvesting, Grading & Wholesale Market Dispatch",
                      date: `Month ${deal.durationMonths - 1}`,
                      status: "UPCOMING",
                      desc: "Produce collected, sorted into Grade-A export and wholesale domestic channels.",
                    },
                    {
                      step: "05",
                      title: "On-Chain Profit Distribution (Musharakah)",
                      date: `Month ${deal.durationMonths}`,
                      status: "UPCOMING",
                      desc: "Net proceeds calculated and smart contract disburses principal + profit automatically.",
                    },
                  ].map((m, idx) => (
                    <div key={idx} className="flex gap-4 items-start p-3 rounded-xl border bg-card/60">
                      <div className="flex flex-col items-center">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                          m.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-700"
                            : m.status === "IN_PROGRESS"
                            ? "bg-amber-100 text-amber-700 animate-pulse"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {m.status === "COMPLETED" ? <CheckCircle2 className="h-4 w-4" /> : m.step}
                        </span>
                        {idx < 4 && <div className="w-0.5 h-8 bg-border my-1" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-foreground">{m.title}</h4>
                          <Badge variant="outline" className="text-[10px]">
                            {m.date}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Shariah Tab */}
            <TabsContent value="shariah" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                    <FileCheck className="h-5 w-5" /> Shariah Compliance Framework (Musharakah)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Certified by the GramBondhon Independent Shariah Advisory Board.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
                    <h5 className="font-bold text-emerald-900 dark:text-emerald-300 mb-1">
                      Mudarabah & Musharakah Principles
                    </h5>
                    <p className="text-emerald-800/80 dark:text-emerald-400/80 leading-relaxed">
                      This project operates under a genuine partnership model. Returns are strictly derived from real agricultural yields and marketplace sales—zero interest (Riba), zero speculative betting (Gharar), and zero deceit.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 border rounded-xl">
                      <span className="text-muted-foreground block text-[10px]">Profit Sharing Ratio</span>
                      <span className="font-bold text-foreground text-sm">{deal.profitShareRate}% Investor / {100 - deal.profitShareRate}% Farmer</span>
                    </div>
                    <div className="p-3 border rounded-xl">
                      <span className="text-muted-foreground block text-[10px]">Fatwa Reference</span>
                      <span className="font-bold text-foreground text-sm font-mono">GB-FATWA-2026/Q3</span>
                    </div>
                  </div>

                  <div className="border-t pt-3 flex items-center justify-between text-muted-foreground">
                    <span>Chief Shariah Advisor:</span>
                    <span className="font-semibold text-foreground">Mufti Abdullah Al-Muti</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Farm Tab */}
            <TabsContent value="farm" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Sprout className="h-4 w-4 text-primary" /> Verified Farm Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/20">
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{farm.name}</h4>
                      <p className="text-xs text-muted-foreground">{farm.district}, Bangladesh &middot; {farm.sizeHectares} Hectares</p>
                    </div>
                    <Link href={`/farms/${farm.id}`}>
                      <Button variant="outline" size="sm" className="text-xs gap-1">
                        View Farm Audit <ChevronRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <div className="p-2.5 border rounded-xl bg-card">
                      <span className="text-muted-foreground block text-[10px]">Soil Quality</span>
                      <span className="font-bold text-emerald-600">Grade A (Alluvial)</span>
                    </div>
                    <div className="p-2.5 border rounded-xl bg-card">
                      <span className="text-muted-foreground block text-[10px]">Water Source</span>
                      <span className="font-bold text-foreground">River Canal / Deep Tube</span>
                    </div>
                    <div className="p-2.5 border rounded-xl bg-card">
                      <span className="text-muted-foreground block text-[10px]">Audit Status</span>
                      <span className="font-bold text-emerald-600 flex items-center justify-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> 100% Passed
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Smart Contract Card */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-primary" /> Blockchain Smart Contract (Base Sepolia)
                </span>
                <Badge variant="outline" className="text-[10px]">EVM Compatible</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 font-mono text-[11px]">
                <span className="truncate">0x4F12bA973024859a019481920394819284918230</span>
                <Button variant="ghost" size="sm" onClick={copyContract} className="h-6 px-2 text-xs">
                  {copiedContract ? "Copied!" : <Copy className="h-3 w-3" />}
                </Button>
              </div>
              <p className="text-muted-foreground text-[11px]">
                Capital deposits, crop tokenization, and distribution payouts are recorded directly on the Base blockchain ledger.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Sticky Investment Calculator & Web3 Action */}
        <div className="space-y-6">
          <Card className="border-primary/30 shadow-md sticky top-20">
            <CardHeader className="pb-3 border-b bg-primary/5">
              <div className="flex justify-between items-center mb-1">
                <Badge className="bg-primary text-white text-[10px]">Open For Investment</Badge>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {deal.expectedReturnPct}% ROI Est.
                </span>
              </div>
              <CardTitle className="text-xl font-bold">
                {formatCurrency(deal.fundedAmount)}
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  raised of {formatCurrency(deal.fundingGoal)}
                </span>
              </CardTitle>
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress ({pctFunded}%)</span>
                  <span>{formatCurrency(remaining)} remaining</span>
                </div>
                <Progress value={pctFunded} className="h-2.5" />
              </div>
            </CardHeader>

            <CardContent className="space-y-5 pt-5">
              {/* Interactive Calculator */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-foreground">Your Investment (BDT)</label>
                  <span className="text-muted-foreground text-[11px]">Min: {formatCurrency(deal.minInvestment)}</span>
                </div>
                <Input
                  type="number"
                  min={deal.minInvestment}
                  step={1000}
                  value={investAmount}
                  onChange={(e) => setInvestAmount(Number(e.target.value))}
                  className="font-bold text-base"
                />
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {quickAmounts.map((amt) => (
                    <Button
                      key={amt}
                      variant={investAmount === amt ? "default" : "outline"}
                      size="sm"
                      onClick={() => setInvestAmount(amt)}
                      className="text-[11px] h-7 px-1"
                    >
                      {amt >= 100000 ? `${amt / 100000}L` : `${amt / 1000}K`}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Real-time calculated return */}
              <div className="p-3.5 rounded-xl bg-surface border space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Investment Capital:</span>
                  <span className="font-semibold text-foreground">{formatCurrency(investAmount)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Estimated Net Profit ({deal.expectedReturnPct}%):</span>
                  <span>+{formatCurrency(estimatedProfit)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-sm text-foreground">
                  <span>Projected Total Payout:</span>
                  <span className="text-primary">{formatCurrency(estimatedReturnAmount)}</span>
                </div>
              </div>

              {/* Web3 Wallet status */}
              <div className="rounded-xl border p-3 bg-muted/20 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Wallet className="h-3.5 w-3.5 text-primary" /> Web3 Wallet:
                  </span>
                  {isConnected && activeAddress ? (
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-[10px] font-mono font-semibold">
                        {activeAddress.slice(0, 6)}...{activeAddress.slice(-4)}
                      </Badge>
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-medium">
                        {isEthSepolia ? "Sepolia (Etherscan)" : "Base Sepolia"}
                      </Badge>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-[11px]">Not Connected</span>
                  )}
                </div>

                {!isConnected ? (
                  <div className="space-y-1.5 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8 font-semibold text-primary border-primary/40 hover:bg-primary hover:text-white gap-1.5 shadow-sm"
                      onClick={() => {
                        if (openConnectModal) {
                          openConnectModal();
                        } else {
                          connectDemoWallet(ETH_SEPOLIA_CHAIN);
                        }
                      }}
                    >
                      <Wallet className="h-3.5 w-3.5" /> Connect Web3 Wallet
                    </Button>
                    <div className="grid grid-cols-2 gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[11px] h-7 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 gap-1 px-1 border border-indigo-200 dark:border-indigo-900"
                        onClick={() => {
                          connectDemoWallet(ETH_SEPOLIA_CHAIN);
                          toast.success("Ethereum Sepolia Connected", "Connected with Etherscan verification enabled.");
                        }}
                      >
                        <Sparkles className="h-3 w-3 text-indigo-600" /> Sepolia (Etherscan)
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[11px] h-7 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 gap-1 px-1 border border-emerald-200 dark:border-emerald-900"
                        onClick={() => {
                          connectDemoWallet(DEFAULT_DEMO_CHAIN);
                          toast.success("Base Sepolia Connected", "Connected with BaseScan verification enabled.");
                        }}
                      >
                        <Sparkles className="h-3 w-3 text-emerald-600" /> Base Sepolia
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1 border-t">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-300">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>Active Network: {activeNetworkName} · Connected</span>
                      </div>
                      <button
                        type="button"
                        className="text-xs text-destructive hover:underline font-medium"
                        onClick={() => {
                          try {
                            if (isWagmiConnected) wagmiDisconnect();
                          } catch {}
                          disconnectStore();
                          toast.info("Wallet Disconnected", "Web3 wallet session ended.");
                        }}
                      >
                        Disconnect
                      </button>
                    </div>

                    {/* Network Switcher Toggle */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <Button
                        variant={isEthSepolia ? "default" : "outline"}
                        size="sm"
                        className="flex-1 text-[10px] h-6 font-semibold"
                        onClick={() => {
                          if (isWagmiConnected) {
                            switchChain?.({ chainId: sepolia.id });
                          } else {
                            connectDemoWallet(ETH_SEPOLIA_CHAIN);
                          }
                          toast.info("Active Network", "Switched to Ethereum Sepolia (Etherscan).");
                        }}
                      >
                        Ethereum Sepolia
                      </Button>
                      <Button
                        variant={!isEthSepolia ? "default" : "outline"}
                        size="sm"
                        className="flex-1 text-[10px] h-6 font-semibold"
                        onClick={() => {
                          if (isWagmiConnected) {
                            switchChain?.({ chainId: baseSepolia.id });
                          } else {
                            connectDemoWallet(DEFAULT_DEMO_CHAIN);
                          }
                          toast.info("Active Network", "Switched to Base Sepolia (BaseScan).");
                        }}
                      >
                        Base Sepolia
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Transaction Result if done */}
              {txHash && (
                <div className={`p-3.5 rounded-xl border text-xs space-y-2.5 ${
                  isRealTx
                    ? "bg-emerald-50/80 text-emerald-950 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                    : "bg-amber-50/80 text-amber-950 border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold">
                      {isRealTx ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span>Live On-Chain Transaction Broadcasted</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4 text-amber-600" />
                          <span>Demo Simulator Proof (Local Ledger)</span>
                        </>
                      )}
                    </div>
                    <Badge variant="outline" className={`text-[10px] font-bold ${
                      isRealTx
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : "bg-amber-100 text-amber-800 border-amber-300"
                    }`}>
                      {isRealTx ? (isEthSepolia ? "Sepolia Etherscan" : "BaseScan Verified") : "Simulation Record"}
                    </Badge>
                  </div>

                  <p className="text-[11px] font-mono break-all opacity-90 bg-white/80 dark:bg-black/30 p-2 rounded border border-border/50">
                    Hash: {txHash}
                  </p>

                  <div className="text-[11px] space-y-1.5">
                    {isRealTx ? (
                      <p className="text-emerald-900 dark:text-emerald-300">
                        Cryptographically broadcasted &amp; mined on <strong>{isEthSepolia ? "Ethereum Sepolia" : "Base Sepolia Testnet"}</strong>.
                      </p>
                    ) : (
                      <p className="text-amber-900 dark:text-amber-300 text-[11px]">
                        Generated in demo simulation mode. For an immutable receipt indexed on <strong>BaseScan Sepolia</strong>, connect your MetaMask / Coinbase wallet and commit again.
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {isRealTx && (
                        <a
                          href={`https://sepolia.basescan.org/tx/${txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-bold underline hover:opacity-80 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded border border-emerald-300 dark:border-emerald-800"
                        >
                          Verify on BaseScan <ExternalLink className="h-3 w-3" />
                        </a>
                      )}

                      {!isRealTx && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (openConnectModal) {
                              openConnectModal();
                            } else {
                              toast.info("Connect Wallet", "Connect your Web3 wallet to broadcast on Base Sepolia.");
                            }
                          }}
                          className="text-[11px] h-7 px-2.5 font-bold border-amber-400 text-amber-900 bg-amber-100/60 hover:bg-amber-100"
                        >
                          <Wallet className="h-3 w-3 mr-1 text-amber-700" />
                          Connect Web3 Wallet for BaseScan Hash
                        </Button>
                      )}

                      <button
                        type="button"
                        onClick={() => sendEmailCertificate(txHash)}
                        disabled={isSendingEmail}
                        className="inline-flex items-center gap-1 text-[11px] text-primary font-bold hover:underline ml-auto"
                      >
                        <Mail className="h-3.5 w-3.5 text-primary" /> {emailSent ? "Resend Certificate Email" : "Email Certificate to Me"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Delivery Box */}
              <div className="p-3 rounded-xl border bg-muted/40 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold flex items-center gap-1.5 text-foreground">
                    <Mail className="h-3.5 w-3.5 text-primary" /> Investor Certificate &amp; Deed Delivery
                  </label>
                  {emailSent && (
                    <Badge variant="outline" className="text-[9px] text-emerald-800 bg-emerald-50 border-emerald-300 font-bold">
                      ✓ Sent to Inbox
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={investorEmail}
                    onChange={(e) => setInvestorEmail(e.target.value)}
                    placeholder="your-email@gmail.com"
                    className="h-8 text-xs font-mono bg-background"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isSendingEmail || !investorEmail}
                    onClick={() => sendEmailCertificate(txHash || undefined)}
                    className="h-8 text-xs shrink-0 font-bold gap-1"
                  >
                    {isSendingEmail ? (
                      <Sparkles className="h-3 w-3 animate-spin" />
                    ) : (
                      <Send className="h-3 w-3" />
                    )}
                    {emailSent ? "Resend" : "Email Deed"}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  An official digital certificate, Shariah approval deed, and BaseScan verification proof will be emailed to you.
                </p>
              </div>

              {/* Action Button */}
              <Button
                onClick={handleInvest}
                disabled={isSubmitting}
                className="w-full text-white font-bold text-sm shadow-md py-6"
                style={{ background: "linear-gradient(135deg, #015546 0%, #0A7A5A 100%)" }}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 animate-spin" />
                    {isConnected ? "Awaiting Wallet Signature..." : "Recording Demo Proof..."}
                  </span>
                ) : isConnected ? (
                  <span className="flex items-center gap-2">
                    Sign & Commit {formatCurrency(investAmount)} with Wallet <Coins className="h-4 w-4" />
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Commit {formatCurrency(investAmount)} (Demo Simulation) <Coins className="h-4 w-4" />
                  </span>
                )}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground">
                By investing, you accept the Musharakah Profit-Sharing Agreement and Terms of Service.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
