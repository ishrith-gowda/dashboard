import { Badge } from "@/components/ui/badge";
import DashboardCard from "@/components/dashboard/card";
import type { RebelRanking } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface RebelsRankingProps {
  rebels: RebelRanking[];
}

const avatarColors = [
  "bg-primary text-primary-foreground",
  "bg-chart-2 text-primary-foreground",
  "bg-chart-3 text-primary-foreground",
  "bg-chart-4 text-primary-foreground",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter((w) => w.length > 1)
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
}

export default function RebelsRanking({ rebels }: RebelsRankingProps) {
  return (
    <DashboardCard
      title="TEAM PERFORMANCE"
      intent="default"
      addon={<Badge variant="outline-warning">THIS WEEK</Badge>}
    >
      <div className="space-y-4">
        {rebels.map((rebel, index) => (
          <div key={rebel.id} className="flex items-center justify-between">
            <div className="flex items-center gap-1 w-full">
              <div
                className={cn(
                  "flex items-center justify-center rounded text-sm font-bold px-1.5 mr-1 md:mr-2",
                  rebel.featured
                    ? "h-10 bg-primary text-primary-foreground"
                    : "h-8 bg-secondary text-secondary-foreground"
                )}
              >
                {rebel.id}
              </div>
              <div
                className={cn(
                  "rounded-lg overflow-hidden flex items-center justify-center font-bold font-mono",
                  avatarColors[index % avatarColors.length],
                  rebel.featured
                    ? "size-14 md:size-16 text-lg"
                    : "size-10 md:size-12 text-sm"
                )}
              >
                {getInitials(rebel.name)}
              </div>
              <div
                className={cn(
                  "flex flex-1 h-full items-center justify-between py-2 px-2.5 rounded",
                  rebel.featured && "bg-accent"
                )}
              >
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span
                        className={cn(
                          "font-display font-bold tracking-tight",
                          rebel.featured
                            ? "text-xl md:text-2xl"
                            : "text-lg md:text-xl"
                        )}
                      >
                        {rebel.name}
                      </span>
                      <span className="text-muted-foreground text-xs md:text-sm">
                        {rebel.handle}
                      </span>
                    </div>
                    <Badge variant={rebel.featured ? "default" : "secondary"}>
                      {rebel.points} CASES
                    </Badge>
                  </div>
                  {rebel.subtitle && (
                    <span className="text-sm text-muted-foreground italic">
                      {rebel.subtitle}
                    </span>
                  )}
                  {rebel.streak && !rebel.featured && (
                    <span className="text-sm text-muted-foreground italic">
                      {rebel.streak}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
