import { Skeleton } from "@/components/ui/skeleton";

const renderSkeletons = () => {
  return Array.from({ length: 8 }).map((_, index) => (
    <div key={index} className="animate-pulse">
      <div className="rounded-2xl border border-border-light dark:border-gray-700 bg-card-bg dark:bg-gray-800">
        <div className="h-1 bg-primary dark:bg-blue-700" />
        <div className="p-6 space-y-4">
          <div className="flex justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32 bg-bg-alt dark:bg-gray-700" />
              <Skeleton className="h-4 w-24 bg-bg-alt dark:bg-gray-700" />
            </div>
            <Skeleton className="h-6 w-16 bg-bg-alt dark:bg-gray-700" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-bg-alt dark:bg-gray-700" />
              <Skeleton className="h-4 w-full bg-bg-alt dark:bg-gray-700" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-bg-alt dark:bg-gray-700" />
              <Skeleton className="h-4 w-full bg-bg-alt dark:bg-gray-700" />
            </div>
          </div>
          <Skeleton className="h-16 w-full rounded-xl bg-bg-alt dark:bg-gray-700" />
        </div>
      </div>
    </div>
  ));
};
export default renderSkeletons;
