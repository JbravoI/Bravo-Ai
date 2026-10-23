import StatsGrid from "@/components/StatsGrid";
import AlertsSection from "@/components/AlertsSection";
import QAPanel from "@/components/QAPanel";

export default function DashboardPage() {
  return <div className="page"><StatsGrid /><AlertsSection title="Recent Regulatory Updates" subtitle="— live" dashboardFilters /><QAPanel variant="dashboard" /></div>;
}
