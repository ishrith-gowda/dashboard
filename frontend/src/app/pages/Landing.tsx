import { Link } from 'react-router';
import { PriorFlowLogo } from '../components/priorflow-logo';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Shield,
  Bot,
  FileCheck,
  Activity,
  Clock,
  CheckCircle2,
  TrendingUp,
  Zap,
  ChevronRight,
} from 'lucide-react';

// ─── Animated counter for stats ────────────────────────────────────────────
function AnimatedStat({ value, suffix = '', label }: { value: string; suffix?: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-5">
      <div className="text-5xl lg:text-6xl font-bold tracking-tight text-foreground" style={{ fontFamily: '"Playfair Display", serif' }}>
        {value}{suffix}
      </div>
      <div className="text-xs text-muted-foreground tracking-[0.18em] uppercase text-center">{label}</div>
    </div>
  );
}

// ─── Feature card ──────────────────────────────────────────────────────────
function FeatureCard({
  icon: Icon,
  roman,
  title,
  description,
}: {
  icon: React.ElementType;
  roman: string;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className="group rounded border border-border bg-card px-6 py-7 flex flex-col gap-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded bg-primary text-primary-foreground">
          <Icon className="size-5" />
        </div>
        <span className="text-[10px] text-muted-foreground/50 tracking-[0.2em] uppercase">{roman}</span>
      </div>
      <div>
        <h3 className="text-lg font-semibold tracking-tight mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

// ─── Pipeline step ─────────────────────────────────────────────────────────
function PipelineStep({
  step,
  title,
  description,
  isLast,
}: {
  step: string;
  title: string;
  description: string;
  isLast?: boolean;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center size-10 rounded-full border-2 border-foreground text-foreground text-sm font-bold shrink-0">
          {step}
        </div>
        {!isLast && <div className="w-px h-12 bg-border mt-2" />}
      </div>
      <div className="pt-1.5">
        <h4 className="text-sm font-semibold tracking-wide uppercase mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ─── Main Landing Page ─────────────────────────────────────────────────────
export function Landing() {
  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>
      {/* ── Navigation ── */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <PriorFlowLogo className="size-8 text-foreground" />
            <span className="text-lg font-bold tracking-tight">PriorFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors tracking-wide">Features</a>
            <a href="#pipeline" className="text-sm text-muted-foreground hover:text-foreground transition-colors tracking-wide">How It Works</a>
            <a href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition-colors tracking-wide">Impact</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/signin"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors tracking-wide hidden sm:inline"
            >
              Sign In
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-foreground text-background text-xs tracking-[0.15em] font-semibold uppercase hover:opacity-90 transition-opacity"
            >
              Open Dashboard
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }} />

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 lg:pt-32 lg:pb-36">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card mb-8"
            >
              <span className="size-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-muted-foreground tracking-wider">AI-Powered Prior Authorization</span>
              <ChevronRight className="size-3 text-muted-foreground/50" />
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-balance mb-6"
            >
              Prior Authorization
              <br />
              <span className="text-muted-foreground/70">Automated End-to-End</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl text-pretty mb-10"
            >
              AI agents that autonomously verify eligibility, navigate payer portals, fill PA forms, and monitor submissions. Reclaim the hours lost to administrative burden.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded bg-foreground text-background text-sm tracking-[0.12em] font-semibold uppercase hover:opacity-90 transition-opacity"
              >
                Open Dashboard
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#pipeline"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded border border-border bg-card text-sm tracking-[0.12em] font-semibold uppercase hover:bg-accent transition-colors"
              >
                See How It Works
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section id="stats" className="border-y border-border bg-card">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
            <AnimatedStat value="$35B" label="Annual PA Admin Cost in US Healthcare" />
            <AnimatedStat value="93" suffix="%" label="Physicians Report PA Delays Care" />
            <AnimatedStat value="3x" label="Faster Than Phone or Fax Submissions" />
            <AnimatedStat value="100K" suffix="+" label="Nurse-Equivalent Hours Wasted Yearly" />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="inline-block size-2 bg-foreground rounded-sm rotate-45" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em]">Platform Capabilities</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-balance mb-4">
              Three Agents, One Seamless Workflow
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
              PriorFlow deploys specialized AI agents that handle every step of the prior authorization lifecycle automatically.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <FeatureCard
              icon={Shield}
              roman="I"
              title="Eligibility Verification"
              description="Agent navigates real payer portals to verify coverage, extract benefits, copays, deductibles, and determine if PA is required for requested services."
            />
            <FeatureCard
              icon={Bot}
              roman="II"
              title="Autonomous PA Filing"
              description="Agent logs into CoverMyMeds, fills medication and patient data, completes clinical justification, and submits PA requests electronically to the plan."
            />
            <FeatureCard
              icon={Activity}
              roman="III"
              title="Real-Time Monitoring"
              description="Agent continuously polls payer dashboards for determination status, alerts staff on approvals, denials, or requests for additional information."
            />
          </div>
        </div>
      </section>

      {/* ── Pipeline Section ── */}
      <section id="pipeline" className="py-20 lg:py-28 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left: Description */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block size-2 bg-foreground rounded-sm rotate-45" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em]">How It Works</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-balance mb-6">
                From Chart Upload to Determination
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-10">
                Upload a patient chart and PriorFlow handles the rest. Our pipeline moves requests through five stages autonomously, surfacing only what needs human attention.
              </p>

              {/* Pipeline visual */}
              <div className="flex flex-col gap-0">
                <PipelineStep
                  step="I"
                  title="Intake"
                  description="Upload a chart PDF. Patient data is extracted and validated automatically."
                />
                <PipelineStep
                  step="II"
                  title="Eligibility Check"
                  description="Agent verifies insurance coverage through payer test environments in real time."
                />
                <PipelineStep
                  step="III"
                  title="AI Drafting"
                  description="Clinical justification and PA form fields are generated from chart data."
                />
                <PipelineStep
                  step="IV"
                  title="Submission"
                  description="Agent navigates the payer portal and submits the PA request electronically."
                />
                <PipelineStep
                  step="V"
                  title="Determination"
                  description="Monitor for approval, denial, or additional info requests with instant alerts."
                  isLast
                />
              </div>
            </div>

            {/* Right: Dashboard preview card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.7 }}
              className="rounded border border-border bg-background p-6 lg:p-8 sticky top-24"
            >
              <div className="text-[10px] tracking-[0.18em] text-muted-foreground/55 uppercase mb-6">Live Dashboard Preview</div>

              {/* Mini stat cards */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { icon: CheckCircle2, label: 'Approved', value: '12', color: 'text-success' },
                  { icon: Clock, label: 'Pending', value: '4', color: 'text-warning' },
                  { icon: TrendingUp, label: 'Rate', value: '86%', color: 'text-foreground' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded border border-border/60 bg-card px-3 py-3">
                    <stat.icon className={`size-4 mb-2 ${stat.color}`} />
                    <div className="text-2xl font-bold tabular-nums" style={{ fontFamily: '"Playfair Display", serif' }}>{stat.value}</div>
                    <div className="text-[9px] text-muted-foreground/50 tracking-wider uppercase mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Mini pipeline visualization */}
              <div className="rounded border border-border/60 bg-accent/40 px-4 py-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="size-2 rounded-full bg-foreground/70 animate-pulse" />
                  <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground/60">Pipeline Active</span>
                </div>
                <div className="flex items-center gap-2">
                  {['Intake', 'Eligibility', 'Drafting', 'Submitted', 'Decision'].map((stage, i) => (
                    <div key={stage} className="flex items-center gap-2 flex-1 min-w-0">
                      <div className={`h-1.5 rounded-full flex-1 ${i < 3 ? 'bg-foreground/40' : 'bg-border'}`} />
                      {i < 4 && <ChevronRight className="size-3 text-muted-foreground/30 shrink-0" />}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2">
                  {['I', 'II', 'III', 'IV', 'V'].map((r, i) => (
                    <span key={r} className={`text-[8px] tracking-wider ${i < 3 ? 'text-foreground/60' : 'text-muted-foreground/30'}`}>{r}</span>
                  ))}
                </div>
              </div>

              {/* Sample request */}
              <div className="mt-6 rounded border border-border/60 bg-card px-4 py-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="size-2 rounded-full bg-warning animate-pulse" />
                  <span className="text-sm font-semibold">Jane Doe</span>
                  <span className="text-[9px] text-muted-foreground/40 ml-auto tracking-wider">4m ago</span>
                </div>
                <div className="text-[11px] text-muted-foreground/70">72148 — MRI lumbar spine w/o contrast</div>
                <div className="text-[10px] text-muted-foreground/50 mt-1">Aetna Choice POS II — W123456789</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="inline-block size-2 bg-foreground rounded-sm rotate-45" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em]">Why PriorFlow</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-balance">
              Built for the Realities of Healthcare
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Zap,
                title: 'Eliminates Manual Entry',
                description: 'No more phone trees, fax machines, or portal logins. Agents handle form-filling autonomously.',
              },
              {
                icon: Shield,
                title: 'HIPAA Compliant',
                description: 'All data processing meets healthcare compliance standards. No PHI leaves your environment.',
              },
              {
                icon: FileCheck,
                title: 'Real Payer Portals',
                description: 'Agents navigate actual payer systems like CoverMyMeds and Claim.MD — not simulations.',
              },
              {
                icon: Clock,
                title: 'Instant Alerts',
                description: 'Get notified immediately on approvals, denials, or requests for additional documentation.',
              },
              {
                icon: Bot,
                title: 'Clinical Justification AI',
                description: 'Generates medical necessity narratives from chart data, prior therapies, and lab results.',
              },
              {
                icon: TrendingUp,
                title: 'Analytics Dashboard',
                description: 'Track approval rates, turnaround times, and pipeline throughput across all your cases.',
              },
            ].map((benefit) => (
              <div key={benefit.title} className="rounded border border-border bg-card px-6 py-6 flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center size-9 rounded bg-accent shrink-0 mt-0.5">
                  <benefit.icon className="size-4.5 text-foreground/70" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold tracking-wide mb-1.5">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="border-t border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-20 lg:py-28 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4 text-balance">
            Reclaim Your Time. Accelerate Patient Care.
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10">
            Join the clinics using PriorFlow to eliminate prior authorization bottlenecks and get patients the care they need faster.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded bg-foreground text-background text-sm tracking-[0.12em] font-semibold uppercase hover:opacity-90 transition-opacity"
            >
              Get Started
              <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/signin"
              className="inline-flex items-center gap-2 px-8 py-4 rounded border border-border text-sm tracking-[0.12em] font-semibold uppercase hover:bg-accent transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-background">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <PriorFlowLogo className="size-6 text-foreground/60" />
              <span className="text-sm font-semibold tracking-tight text-foreground/60">PriorFlow</span>
              <span className="text-[10px] text-muted-foreground/30 tracking-wider">v2.4.1</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-muted-foreground/50 tracking-wider">
              <span>HIPAA Compliant</span>
              <span className="size-1 rounded-full bg-muted-foreground/20" />
              <span>SOC 2 Type II</span>
              <span className="size-1 rounded-full bg-muted-foreground/20" />
              <span>256-bit Encryption</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
