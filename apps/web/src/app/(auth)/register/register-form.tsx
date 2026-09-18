"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Loader2,
  Sprout,
  TrendingUp,
  ArrowLeft,
  ArrowRight,
  User as UserIcon,
  Check,
} from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth.store";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/toast";
import type { Role, RegisterRequest } from "@/types";

const accountSchema = z
  .object({
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
});

const farmerSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  district: z.string().min(2, "District is required"),
});

const investorSchema = z.object({
  investorType: z.enum(["INDIVIDUAL", "INSTITUTIONAL", "VALUE_ORIENTED"], {
    message: "Select an investor type",
  }),
  companyName: z.string().optional().or(z.literal("")),
});

type AccountValues = z.infer<typeof accountSchema>;
type ProfileValues = z.infer<typeof profileSchema>;

export function RegisterForm() {
  const router = useRouter();
  const nativeLogin = useAuthStore((s) => s.nativeLogin);
  const [role, setRole] = useState<Role | null>(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const accountForm = useForm<AccountValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: "", lastName: "", phone: "" },
  });

  const [roleFields, setRoleFields] = useState({
    businessName: "",
    district: "",
    investorType: "",
    companyName: "",
  });

  const setField = (key: keyof typeof roleFields) => (value: string) =>
    setRoleFields((prev) => ({ ...prev, [key]: value }));

  const inputs = { email: accountForm.watch("email") };

  const totalSteps = 3;

  const next = () => {
    if (step === 0 && !role) return;
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    const profile = profileForm.getValues();
    const account = accountForm.getValues();
    setIsSubmitting(true);
    setError(null);
    try {
      const payload: RegisterRequest = {
        email: account.email,
        password: account.password,
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone || undefined,
        role: (role as Role) ?? "INVESTOR",
      };
      if (role === "FARMER") {
        const farmer = farmerSchema.parse({
          businessName: roleFields.businessName,
          district: roleFields.district,
        });
        Object.assign(payload, farmer);
      } else {
        const investor = investorSchema.parse({
          investorType:
            (roleFields.investorType as "INDIVIDUAL" | "INSTITUTIONAL" | "VALUE_ORIENTED") ||
            undefined,
          companyName: roleFields.companyName || "",
        });
        Object.assign(payload, {
          investorType: investor.investorType,
          companyName: investor.companyName || undefined,
        });
      }

      const res = await authApi.register(payload);
      nativeLogin(res.user, res.token, res.refreshToken);
      toast.success("Account created 🎉", `Welcome to AgriShare, ${res.user.firstName}!`);
      router.push("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err, "Registration failed. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 0) {
    return (
      <div className="space-y-5">
        <div>
          <h3 className="text-sm font-medium">I am joining as a…</h3>
          <p className="text-xs text-muted-foreground">
            Choose the account type that fits how you&apos;ll use AgriShare.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <RoleCard
            label="Farmer"
            description="Raise capital for your farm projects"
            icon={Sprout}
            selected={role === "FARMER"}
            onClick={() => setRole("FARMER")}
          />
          <RoleCard
            label="Investor"
            description="Fund farming projects for returns"
            icon={TrendingUp}
            selected={role === "INVESTOR"}
            onClick={() => setRole("INVESTOR")}
          />
        </div>
        {error && <ErrorMessage message={error} />}
        <Button className="w-full" onClick={next} disabled={!role}>
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="space-y-4">
        <StepIndicator current={1} total={totalSteps} />
        <Form {...accountForm}>
          <form
            onSubmit={accountForm.handleSubmit(() => next())}
            className="space-y-4"
          >
            <FormField
              control={accountForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={accountForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Use 8+ characters with at least one uppercase letter and one number.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={accountForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <ErrorMessage message={error} />}
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={back}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button type="submit" className="flex-1">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="space-y-4">
        <StepIndicator current={2} total={totalSteps} />
        <Form {...profileForm}>
          <form onSubmit={profileForm.handleSubmit(next)} className="space-y-4">
            <div className="flex items-center gap-3 rounded-md bg-muted px-3 py-2">
              <UserIcon className="h-4 w-4 text-primary" />
              <span className="text-sm">
                {inputs.email || "Your email"} ·{" "}
                <span className="font-medium">{role === "FARMER" ? "Farmer" : "Investor"}</span> account
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={profileForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane" autoComplete="given-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" autoComplete="family-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={profileForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+1 555 000 1234"
                      autoComplete="tel"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {role === "FARMER" ? (
              <FarmerFields
                businessName={roleFields.businessName}
                district={roleFields.district}
                onBusinessName={setField("businessName")}
                onDistrict={setField("district")}
              />
            ) : (
              <InvestorFields
                investorType={roleFields.investorType}
                onInvestorType={setField("investorType")}
                companyName={roleFields.companyName}
                onCompanyName={setField("companyName")}
              />
            )}
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={back}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button type="submit" className="flex-1">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StepIndicator current={2} total={totalSteps} />
      <Form {...profileForm}>
        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="space-y-4">
          <p className="rounded-md bg-primary/5 px-3 py-2 text-sm text-primary">
            One last review — everything below will be stored securely.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={profileForm.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly className="opacity-70" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={profileForm.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly className="opacity-70" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          {role === "FARMER" ? (
            <FarmerFields
              readonly
              businessName={roleFields.businessName}
              district={roleFields.district}
            />
          ) : (
            <InvestorFields
              readonly
              investorType={roleFields.investorType}
              companyName={roleFields.companyName}
            />
          )}
          {error && <ErrorMessage message={error} />}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={back}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              {isSubmitting ? "Creating account…" : "Create account"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function RoleCard({
  label,
  description,
  icon: Icon,
  selected,
  onClick,
}: {
  label: string;
  description: string;
  icon: typeof Sprout;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex flex-col items-start gap-3 rounded-lg border-2 p-4 text-left transition-all ${
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-muted hover:border-primary/40"
      }`}
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
          selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="block font-semibold">{label}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
      {selected && (
        <span className="flex items-center gap-1 text-xs font-medium text-primary">
          <Check className="h-3 w-3" /> Selected
        </span>
      )}
    </button>
  );
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full ${
            i <= current ? "bg-primary" : "bg-muted"
          }`}
        />
      ))}
    </div>
  );
}

function FarmerFields({
  readonly,
  businessName,
  district,
  onBusinessName,
  onDistrict,
}: {
  readonly?: boolean;
  businessName?: string;
  district?: string;
  onBusinessName?: (value: string) => void;
  onDistrict?: (value: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormItem>
        <FormLabel>Business name</FormLabel>
        <FormControl>
          <Input
            id="businessName"
            placeholder="Green Valley Farms Ltd."
            value={businessName ?? ""}
            onChange={(e) => onBusinessName?.(e.target.value)}
            readOnly={readonly}
          />
        </FormControl>
      </FormItem>
      <FormItem>
        <FormLabel>District</FormLabel>
        <FormControl>
          <Input
            id="district"
            placeholder="e.g. Musanze, Rwanda"
            value={district ?? ""}
            onChange={(e) => onDistrict?.(e.target.value)}
            readOnly={readonly}
          />
        </FormControl>
      </FormItem>
    </div>
  );
}

function InvestorFields({
  investorType,
  onInvestorType,
  companyName,
  onCompanyName,
  readonly,
}: {
  investorType?: string;
  onInvestorType?: (value: string) => void;
  companyName?: string;
  onCompanyName?: (value: string) => void;
  readonly?: boolean;
}) {
  return (
    <div className="space-y-2">
      <FormItem>
        <FormLabel>Investor type</FormLabel>
        <RadioGroup
          id="investorType"
          name="investorType"
          value={investorType}
          onValueChange={onInvestorType}
          disabled={readonly}
        >
          {[
            { value: "INDIVIDUAL", label: "Individual investor" },
            { value: "INSTITUTIONAL", label: "Institutional / fund" },
            { value: "VALUE_ORIENTED", label: "Impact / value-oriented" },
          ].map((opt) => (
            <FormItem key={opt.value} className="flex items-center space-x-3 space-y-0">
              <FormControl>
                <RadioGroupItem value={opt.value} />
              </FormControl>
              <FormLabel className="font-normal">{opt.label}</FormLabel>
            </FormItem>
          ))}
        </RadioGroup>
        {readonly && (
          <p className="text-[0.8rem] text-muted-foreground">
            You can add a company profile later in Settings.
          </p>
        )}
      </FormItem>
      <FormItem>
        <FormLabel>Company name (optional)</FormLabel>
        <FormControl>
          <Input
            id="companyName"
            placeholder="e.g. Horizon Agri Capital"
            value={companyName ?? ""}
            onChange={(e) => onCompanyName?.(e.target.value)}
            readOnly={readonly}
          />
        </FormControl>
      </FormItem>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {message}
    </div>
  );
}