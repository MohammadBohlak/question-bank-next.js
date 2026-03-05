"use client";

import { useParams } from "next/navigation";
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

// تعريف الألوان لتكون متوافقة مع التصميم السابق
const COLORS = {
  male: "#8B5CF6", // purple-500
  female: "#EC4899", // pink-500
  active: "#22C55E", // green-500
  inactive: "#EF4444", // red-500
};

interface StatsChartProps {
  users: any[] | undefined;
}

const StatsChart: React.FC<StatsChartProps> = ({ users }) => {
  // حساب البيانات
  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter((u) => u.isActive).length || 0;
  const maleUsers = users?.filter((u) => u.gender === 0).length || 0;
  const femaleUsers = users?.filter((u) => u.gender === 1).length || 0;
  const inactiveUsers = totalUsers - activeUsers;
  const { locale } = useParams();
  // نصوص حسب اللغة
  const isArabic = locale === "ar";

  const texts = {
    titleGender: isArabic ? "توزيع الجنس" : "Gender Distribution",
    titleStatus: isArabic ? "حالة النشاط" : "Activity Status",
    maleUsers: isArabic ? "المستخدمين الذكور" : "Male Users",
    femaleUsers: isArabic ? "المستخدمات الإناث" : "Female Users",
    activeUsers: isArabic ? "المستخدمين النشطين" : "Active Users",
    inactiveUsers: isArabic ? "غير نشط" : "Inactive",
    totalUsers: isArabic ? "إجمالي المستخدمين" : "Total Users",
  };

  // تجهيز بيانات الرسم البياني للجنس
  const genderData = [
    { name: texts.maleUsers, value: maleUsers, color: COLORS.male },
    { name: texts.femaleUsers, value: femaleUsers, color: COLORS.female },
  ];

  // تجهيز بيانات الرسم البياني للنشاط
  const statusData = [
    { name: texts.activeUsers, value: activeUsers, color: COLORS.active },
    { name: texts.inactiveUsers, value: inactiveUsers, color: COLORS.inactive },
  ];

  // مكون مخصص لعرض التفاصيل عند التحويم (Tooltip)
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-3 py-2 rounded-lg shadow-xl border border-gray-700 dark:border-gray-200">
          <p className="font-bold">{`${payload[0].name} : ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Card 1: Gender Distribution */}
      <div className="bg-white dark:bg-gray-800/60 backdrop-blur-lg rounded-xl border border-border-light dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col items-center gap-6">
          {/* Chart Area */}
          <div className="w-full h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalUsers}
                </p>
                <p className="text-xs text-gray-500">{texts.totalUsers}</p>
              </div>
            </div>
          </div>

          {/* Legend & Details Area */}
          <div className="w-full space-y-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
              {texts.titleGender}
            </h3>

            {/* Male Stat */}
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
              <div className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS.male }}
                ></span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {texts.maleUsers}
                </span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                {maleUsers}
              </span>
            </div>

            {/* Female Stat */}
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
              <div className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS.female }}
                ></span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {texts.femaleUsers}
                </span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                {femaleUsers}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Activity Status */}
      <div className="bg-white dark:bg-gray-800/60 backdrop-blur-lg rounded-xl border border-border-light dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col items-center gap-6">
          {/* Chart Area */}
          <div className="w-full h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalUsers}
                </p>
                <p className="text-xs text-gray-500">{texts.totalUsers}</p>
              </div>
            </div>
          </div>

          {/* Legend & Details Area */}
          <div className="w-full space-y-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
              {texts.titleStatus}
            </h3>

            {/* Active Stat */}
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
              <div className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS.active }}
                ></span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {texts.activeUsers}
                </span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                {activeUsers}
              </span>
            </div>

            {/* Inactive Stat */}
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
              <div className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS.inactive }}
                ></span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {texts.inactiveUsers}
                </span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                {inactiveUsers}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsChart;
