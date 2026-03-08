import React, { useEffect, useState } from "react";
import { LucideIcon } from "lucide-react"; // نوع الأيقونات

// تعريف شكل البيانات التي سيستقبلها المكون
interface StatItem {
  id: string; // معرف فريد
  title: string; // العنوان
  value: number | string; // القيمة
  icon: LucideIcon; // مكون الأيقونة
  dotColor: string; // لون النقطة (مثال: bg-blue-500)
  shadowColor: string; // لون الظل (مثال: rgba(59,130,246,0.5))
  hoverBg: string; // لون الخلفية عند التمرير (مثال: hover:bg-blue-50/50)
}

interface StatsGridProps {
  data: StatItem[]; // مصفوفة من العناصر
}

const StatsGrid: React.FC<StatsGridProps> = ({ data }) => {
  return (
    <>
      <div className="w-full mb-8 overflow-auto">
        <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-border-light dark:border-gray-700 overflow-hidden shadow-sm">
          <div
            className={`grid grid-cols-1 md:flex flex-nowrap divide-y divide-border-light dark:divide-gray-700 md:divide-y-0 md:divide-x`}
          >
            {data.map((item, i) => {
              const IconComponent = item.icon;

              return (
                <div
                  key={item.id}
                  className="md:flex-1 flex justify-between md:block pt-3 transition-colors duration-200 "
                >
                  {/* قسم العنوان */}
                  <div className="rtl:border-l-2 ltr:border-r-2 md:!border-r-0 md:!border-l-0 flex-1 flex items-center gap-3 mb-3 px-6 md:border-b-2 pb-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${item.dotColor}`}
                      style={{ boxShadow: `0 0 10px ${item.shadowColor}` }}
                    ></span>
                    <span className="text-nowrap text-md font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                      {item.title}
                    </span>
                  </div>

                  {/* قسم القيمة */}
                  <div className="flex-1 px-6 flex items-baseline gap-2 pb-6">
                    {typeof item.value === "string" ? (
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {item.value}
                      </h3>
                    ) : (
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {item.value}
                      </h3>
                    )}

                    <IconComponent className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default StatsGrid;
