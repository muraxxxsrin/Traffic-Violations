import React from "react";
import { BarChart3, Camera, ShieldCheck, Workflow } from "lucide-react";
import { BentoCard, BentoGrid } from "../../../components/ui/BentoGrid";

const ABOUT_ITEMS = [
  {
    name: "Automated Monitoring",
    description:
      "Camera-linked traffic monitoring helps identify incidents faster and keeps the evidence trail tied to each challan record from the beginning.",
    Icon: Camera,
    className: "md:col-span-2",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-white to-orange-50">
        <div className="absolute left-8 top-8 h-28 w-40 rounded-[2rem] border border-orange-200 bg-white/80 shadow-sm" />
        <div className="absolute left-24 top-24 h-44 w-64 rounded-[2.2rem] border border-orange-200 bg-orange-50/90 shadow-sm" />
        <div className="absolute right-10 top-10 h-24 w-24 rounded-full bg-orange-200/50 blur-2xl" />
        <div className="absolute bottom-8 left-10 h-16 w-40 rounded-full bg-orange-300/30 blur-xl" />
      </div>
    ),
  },
  {
    name: "Transparent Enforcement",
    description:
      "Users can see status, amount, location, and supporting proof together so traffic enforcement feels understandable instead of opaque.",
    Icon: ShieldCheck,
    className: "md:col-span-1",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-white to-teal-50">
        <div className="absolute left-8 top-10 h-24 w-24 rounded-3xl bg-emerald-200/70" />
        <div className="absolute right-8 bottom-10 h-32 w-28 rounded-[2rem] border border-emerald-200 bg-white/80" />
        <div className="absolute left-12 bottom-14 h-12 w-36 rounded-full bg-emerald-300/25 blur-lg" />
      </div>
    ),
  },
  {
    name: "Operational Visibility",
    description:
      "Paid, unpaid, and recurring violation trends become easier to track with focused dashboard summaries built for day-to-day monitoring.",
    Icon: BarChart3,
    className: "md:col-span-1",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-white to-blue-50">
        <div className="absolute bottom-10 left-10 flex items-end gap-3">
          <div className="h-20 w-10 rounded-t-2xl bg-sky-300/80" />
          <div className="h-28 w-10 rounded-t-2xl bg-sky-400/80" />
          <div className="h-36 w-10 rounded-t-2xl bg-blue-500/80" />
          <div className="h-24 w-10 rounded-t-2xl bg-sky-300/80" />
        </div>
        <div className="absolute right-10 top-10 h-20 w-20 rounded-full bg-blue-200/45 blur-2xl" />
      </div>
    ),
  },
  {
    name: "One Workflow",
    description:
      "The platform connects search, reporting, payment, secure sign-in, and user dashboards into a single workflow instead of scattered screens.",
    Icon: Workflow,
    className: "md:col-span-2",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-white to-zinc-100">
        <div className="absolute left-10 top-16 flex items-center gap-4">
          <div className="h-16 w-28 rounded-3xl border border-slate-200 bg-white/85" />
          <div className="h-[2px] w-16 bg-slate-300" />
          <div className="h-16 w-28 rounded-3xl border border-slate-200 bg-white/85" />
          <div className="h-[2px] w-16 bg-slate-300" />
          <div className="h-16 w-28 rounded-3xl border border-slate-200 bg-white/85" />
        </div>
        <div className="absolute bottom-16 left-16 h-20 w-52 rounded-[2rem] bg-slate-200/50 blur-xl" />
      </div>
    ),
  },
];

export default function AboutPage() {
  return (
    <section className="about-page">
      <div className="about-page__hero">
        <span className="about-page__eyebrow">About</span>
        <h2 className="about-page__title">Built to make traffic violation handling clearer and faster</h2>
        <p className="about-page__copy">
          RedLight Monitoring System is a focused traffic-enforcement portal that helps search challans, review evidence, manage payments, and give users a clearer view of violation records.
        </p>
      </div>

      <BentoGrid className="md:auto-rows-[17rem]">
        {ABOUT_ITEMS.map((item) => (
          <BentoCard
            key={item.name}
            name={item.name}
            description={item.description}
            icon={item.Icon}
            background={item.background}
            className={item.className}
          />
        ))}
      </BentoGrid>
    </section>
  );
}
