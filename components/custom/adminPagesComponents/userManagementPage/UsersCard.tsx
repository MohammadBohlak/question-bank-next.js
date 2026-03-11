import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Hash,
  User,
  UserCircle,
  Edit,
  Trash2,
  Mail,
  Phone,
  Building2,
  Shield,
  Calendar,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  formatDate,
  getEmail,
  getFullNameAr,
  getFullNameEn,
  getMobile,
  getUsername,
} from "@/lib/userUtils";
import GenderBadge from "../../common/badges/GenderBadge";
import StatusBadge from "../../common/badges/StatusBadge";
import { UsersTableProps } from "./UsersTable";

type UsersCardProps = Omit<UsersTableProps, "onSelectAll">;

const UsersCard: React.FC<UsersCardProps> = ({
  users,
  selectedIds,
  onSelectOne,
  onEditClick,
  onDeleteClick,
  t,
}) => {
  const { locale }: any = useTranslations();

  // ألوان متدرجة للحقول
  const fieldStyles = [
    {
      // اسم المستخدم - أزرق
      gradient:
        "from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20",
      iconBg: "from-[#2ab3f7] to-[#1da1e6]",
      textColor: "text-blue-600 dark:text-blue-400",
      icon: UserCircle,
    },
    {
      // البريد الإلكتروني - بنفسجي
      gradient:
        "from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20",
      iconBg: "from-[#8b5cf6] to-[#7c3aed]",
      textColor: "text-purple-600 dark:text-purple-400",
      icon: Mail,
    },
    {
      // رقم الجوال - أخضر
      gradient:
        "from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20",
      iconBg: "from-[#10b981] to-[#059669]",
      textColor: "text-emerald-600 dark:text-emerald-400",
      icon: Phone,
    },
    {
      // الجامعة - برتقالي
      gradient:
        "from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20",
      iconBg: "from-[#f59e0b] to-[#d97706]",
      textColor: "text-orange-600 dark:text-orange-400",
      icon: Building2,
    },
    {
      // الدور - وردي
      gradient:
        "from-rose-50 to-rose-100/50 dark:from-rose-950/30 dark:to-rose-900/20",
      iconBg: "from-[#f43f5e] to-[#e11d48]",
      textColor: "text-rose-600 dark:text-rose-400",
      icon: Shield,
    },
    {
      // تاريخ الإنشاء - سماوي
      gradient:
        "from-cyan-50 to-cyan-100/50 dark:from-cyan-950/30 dark:to-cyan-900/20",
      iconBg: "from-[#06b6d4] to-[#0891b2]",
      textColor: "text-cyan-600 dark:text-cyan-400",
      icon: Calendar,
    },
  ];
  const contactField = {
    gradient:
      "from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20",
    iconBg: "from-[#2ab3f7] to-[#1da1e6]",
    textColor: "text-blue-600 dark:text-blue-400",
  };

  const dateField = {
    gradient:
      "from-gray-50 to-gray-100/50 dark:from-gray-950/30 dark:to-gray-900/20",
    iconBg: "from-gray-400 to-gray-500",
    textColor: "text-gray-600 dark:text-gray-400",
  };
  return (
    <div className="md:hidden space-y-6 p-6">
      {users.map((user) => (
        <Card
          key={user.id}
          className="relative border-2 border-transparent shadow-2xl hover:border-sec transition-all duration-300 overflow-hidden group"
        >
          {/* Header Background */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-prim via-[#1a2285] to-sec z-0" />

          <CardContent className="p-0">
            <div className="relative z-10">
              {/* Header */}
              <div className="px-6 pt-6 pb-3 flex items-start justify-between">
                <div className="flex items-center gap-3 bg-white/20 dark:bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
                  <Checkbox
                    checked={selectedIds.includes(user.id)}
                    onCheckedChange={(checked) =>
                      onSelectOne(user.id, checked as boolean)
                    }
                    className="border-2 border-white data-[state=checked]:bg-white data-[state=checked]:text-[#141a73]"
                  />
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <Hash className="w-3.5 h-3.5 opacity-80" />
                    <span>{user.id}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <GenderBadge gender={user.gender} />
                  <StatusBadge isActive={user.isActive} />
                </div>
              </div>

              {/* Avatar & Name */}
              <div className="flex flex-col items-center px-6 pb-6">
                <div
                  className={`w-24 h-24 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-xl border-4 border-white dark:border-gray-800 ${
                    user.gender === 0 ? "text-[#3498db]" : "text-[#e91e63]"
                  }`}
                >
                  <User className="w-12 h-12" strokeWidth={1.5} />
                </div>
                <div className="text-center mt-4">
                  <h3 className="font-bold text-lg text-prim dark:text-sec mb-1 drop-shadow-lg">
                    {locale === "ar"
                      ? getFullNameAr(user)
                      : getFullNameEn(user)}
                  </h3>
                  <p className="text-sm text-prim dark:text-sec italic">
                    {locale === "ar"
                      ? getFullNameEn(user)
                      : getFullNameAr(user)}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 space-y-3">
              {/* اسم المستخدم */}
              <div
                className={`flex items-center gap-3 p-3 bg-gradient-to-r ${fieldStyles[0].gradient} rounded-xl hover:shadow-md transition-all duration-300 hover:-translate-x-1 group/item`}
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${fieldStyles[0].iconBg} flex items-center justify-center flex-shrink-0 shadow-lg group-hover/item:scale-110 transition-transform`}
                >
                  <UserCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-xs font-semibold ${fieldStyles[0].textColor} uppercase tracking-wider mb-0.5`}
                  >
                    {t("usersTable.headers.username")}
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white truncate">
                    {getUsername(user)}
                  </div>
                </div>
              </div>

              {/* البريد الإلكتروني */}
              <div
                className={`flex items-center gap-3 p-3 bg-gradient-to-r ${fieldStyles[1].gradient} rounded-xl hover:shadow-md transition-all duration-300 hover:-translate-x-1 group/item`}
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${fieldStyles[1].iconBg} flex items-center justify-center flex-shrink-0 shadow-lg group-hover/item:scale-110 transition-transform`}
                >
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-xs font-semibold ${fieldStyles[1].textColor} uppercase tracking-wider mb-0.5`}
                  >
                    {locale == "en" ? "Emial" : "البريد الإلكتروني"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="h-3.5 w-3.5 text-sec" />
                    <span className="overflow-x-auto">{getEmail(user)}</span>
                  </div>
                </div>
              </div>

              {/* رقم الجوال */}
              <div
                className={`flex items-center gap-3 p-3 bg-gradient-to-r ${fieldStyles[2].gradient} rounded-xl hover:shadow-md transition-all duration-300 hover:-translate-x-1 group/item`}
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${fieldStyles[2].iconBg} flex items-center justify-center flex-shrink-0 shadow-lg group-hover/item:scale-110 transition-transform`}
                >
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-xs font-semibold ${fieldStyles[2].textColor} uppercase tracking-wider mb-0.5`}
                  >
                    {locale == "en" ? "Phone" : "الهاتف"}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3.5 w-3.5 text-sec" />
                    <span
                      dir="ltr"
                      className="ltr:text-left rtl:text-right text-gray-600 dark:text-gray-400"
                    >
                      {getMobile(user)}
                    </span>
                  </div>
                </div>
              </div>

              {/* تاريخ الإنشاء */}
              <div
                className={`flex items-center gap-3 p-3 bg-gradient-to-r ${fieldStyles[3].gradient} rounded-xl hover:shadow-md transition-all duration-300 hover:-translate-x-1 group/item`}
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${fieldStyles[3].iconBg} flex items-center justify-center flex-shrink-0 shadow-lg group-hover/item:scale-110 transition-transform`}
                >
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-xs font-semibold ${fieldStyles[3].textColor} uppercase tracking-wider mb-0.5`}
                  >
                    {t("usersTable.headers.created")}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 text-nowrap">
                    <Calendar className="h-3 w-3 text-sec" />
                    {formatDate(user.createDate, locale === "ar" ? "ar" : "en")}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="px-6 pb-6">
              <div className="flex gap-3 pt-5 border-t-2 border-dashed border-gray-200 dark:border-gray-700">
                <Button
                  size="sm"
                  className="flex-1 gap-2 bg-gradient-to-r from-[#2ab3f7] to-[#1da1e6] hover:from-[#1da1e6] hover:to-[#1890d5] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 font-semibold"
                  onClick={() => onEditClick(user)}
                >
                  <Edit className="h-4 w-4" />
                  {t("usersTable.actions.edit")}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1 gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 font-semibold"
                  onClick={() => onDeleteClick(user)}
                >
                  <Trash2 className="h-4 w-4" />
                  {t("usersTable.actions.delete")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UsersCard;
