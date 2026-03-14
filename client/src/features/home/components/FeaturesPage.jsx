import React from "react";
import { FileText, MessageCircleMore } from "lucide-react";
import AnimatedTestimonials from "../../../components/ui/AnimatedTestimonials";
import smartSearchImage from "../../../assets/smart-search.svg";
import unifiedReportsImage from "../../../assets/unified-reports.svg";
import dashboardTrackingImage from "../../../assets/dashboard-tracking.svg";
import securityAuthImage from "../../../assets/security-auth.svg";

const FEATURE_SLIDES = [
  {
    quote:
      "Search challans instantly by challan number, vehicle number, or phone number so officers and citizens can reach records without jumping between systems.",
    name: "Smart Search",
    designation: "Fast multi-key challan lookup",
    src: smartSearchImage,
  },
  {
    quote:
      "Each report keeps evidence, fine amount, location, phone number, and payment status together in one focused view that is easy to verify and act on.",
    name: "Unified Reports",
    designation: "Evidence, amount, and status in one card",
    src: unifiedReportsImage,
  },
  {
    quote:
      "Signed-in users can track all challans linked to their number, review payment history, and monitor paid versus unpaid cases from the dashboard.",
    name: "Dashboard Tracking",
    designation: "Personalized challan management",
    src: dashboardTrackingImage,
  },
  {
    quote:
      "Password-protected sign-in and token-based authorization keep user-specific challan data protected while still allowing guest users to perform public challan searches.",
    name: "Secure Authentication",
    designation: "Password protection with token-based access",
    src: securityAuthImage,
  },
];

const QUICK_FEATURES = [
  {
    icon: FileText,
    title: "PDF Generation",
    copy:
      "Generate downloadable challan summaries with evidence, payment status, amount, and location so records can be shared and archived quickly.",
    accentClass: "is-orange",
  },
  {
    icon: MessageCircleMore,
    title: "WhatsApp Messaging",
    copy:
      "Send challan details and updates over WhatsApp for faster communication with citizens, including reference number, amount, and payment reminder.",
    accentClass: "is-green",
  },
];

export default function FeaturesPage() {
  return (
    <section className="features-page">
      <div className="features-page__hero">
        <span className="features-page__eyebrow">Features</span>
        <h2 className="features-page__title">Everything important stays in one traffic workflow</h2>
        <p className="features-page__copy">
          Search, monitor, generate reports, and share updates from one place without turning the interface into a crowded admin panel.
        </p>
      </div>

      <div className="features-page__layout">
        <div className="features-page__showcase">
          <AnimatedTestimonials testimonials={FEATURE_SLIDES} autoplay className="features-page__slider" />
        </div>

        <div className="features-page__cards">
          {QUICK_FEATURES.map((feature) => {
            const Icon = feature.icon;

            return (
              <article key={feature.title} className={`features-card ${feature.accentClass}`}>
                <div className="features-card__icon">
                  <Icon />
                </div>
                <h3 className="features-card__title">{feature.title}</h3>
                <p className="features-card__copy">{feature.copy}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
