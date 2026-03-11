import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
import { AllUsers } from "@/app/[locale]/(admin)/users/page";
export interface UsersTableProps {
  users: AllUsers[];
  selectedIds: number[]; // ← غيّر من (string | number)[]
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: number, checked: boolean) => void; // ← غيّر من string | number
  onEditClick: (user: AllUsers) => void;
  onDeleteClick: (user: AllUsers) => void;
  t: (key: string) => string;
}

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onEditClick,
  onDeleteClick,
  t,
}) => {
  const isAllSelected = users.length > 0 && selectedIds.length === users.length;
  const { locale }: any = useTranslations();
  return (
    <div className="hidden md:block overflow-x-auto custom-scrollbar">
      <table className="w-full">
        {/* رأس الجدول */}
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="p-4 w-12 text-center">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={onSelectAll}
                aria-label="Select all"
              />
            </th>
            <th className="ltr:text-left rtl:text-right py-4 px-6 font-semibold text-gray-900 dark:text-white">
              {t("usersTable.headers.name")}
            </th>
            <th className="ltr:text-left rtl:text-right py-4 px-6 font-semibold text-gray-900 dark:text-white">
              {t("usersTable.headers.username")}
            </th>
            <th className="ltr:text-left rtl:text-right py-4 px-6 font-semibold text-gray-900 dark:text-white">
              {t("usersTable.headers.contact")}
            </th>
            <th className="ltr:text-left rtl:text-right py-4 px-6 font-semibold text-gray-900 dark:text-white">
              {t("usersTable.headers.gender")}
            </th>
            <th className="ltr:text-left rtl:text-right py-4 px-6 font-semibold text-gray-900 dark:text-white">
              {t("usersTable.headers.status")}
            </th>
            <th className="ltr:text-left rtl:text-right py-4 px-6 font-semibold text-gray-900 dark:text-white">
              {t("usersTable.headers.created")}
            </th>
            <th className="ltr:text-left rtl:text-right py-4 px-6 font-semibold text-gray-900 dark:text-white">
              {t("usersTable.headers.actions")}
            </th>
          </tr>
        </thead>

        {/* جسم الجدول */}
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className={cn(
                "border-b border-gray-100 dark:border-gray-700 transition-colors duration-200",
                "hover:bg-gray-50 dark:hover:bg-gray-700/50",
                selectedIds.includes(user.id) && "!bg-sec/10",
              )}
            >
              {/* خانة الاختيار */}
              <td className="p-4 text-center">
                <Checkbox
                  checked={selectedIds.includes(user.id)}
                  onCheckedChange={(checked) =>
                    onSelectOne(user.id, checked as boolean)
                  }
                  className="data-[state=checked]:bg-prim dark:data-[state=checked]:bg-sec"
                  aria-label="Select row"
                />
              </td>

              {/* الاسم */}
              <td className="py-4 px-6">
                <div className="space-y-1 text-nowrap">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {getFullNameAr(user)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {getFullNameEn(user)}
                  </div>
                </div>
              </td>

              {/* اسم المستخدم */}
              <td className="py-4 px-6">
                <div className="font-medium text-gray-700 dark:text-gray-300">
                  {getUsername(user)}
                </div>
              </td>

              {/* معلومات الاتصال */}
              <td className="py-4 px-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-3.5 w-3.5 text-sec" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {getEmail(user)}
                    </span>
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
              </td>

              {/* الجنس */}
              <td className="py-4 px-6">
                <GenderBadge gender={user.gender} />
              </td>

              {/* الحالة */}
              <td className="py-4 px-6">
                <StatusBadge isActive={user.isActive} />
              </td>

              {/* تاريخ الإنشاء */}
              <td className="py-4 px-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 text-nowrap">
                  <Calendar className="h-3 w-3 text-sec" />
                  {formatDate(user.createDate, locale === "ar" ? "ar" : "en")}
                </div>
              </td>

              {/* الإجراءات */}
              <td className="py-4 px-6">
                <div className="flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="none"
                        className="h-8 w-8 p-0 hover:bg-sec hover:text-white"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      {/* عرض */}
                      <DropdownMenuItem className="cursor-pointer text-blue-600 dark:text-blue-400 hover:text-white hover:bg-blue-600 dark:hover:bg-blue-400">
                        <Eye className="h-4 w-4 text-inherit" />
                        {t("usersTable.actions.view")}
                      </DropdownMenuItem>

                      {/* تعديل */}
                      <DropdownMenuItem
                        className="cursor-pointer hover:text-white text-green-600 dark:text-green-400 hover:bg-green-600 dark:hover:bg-green-400"
                        onClick={() => onEditClick(user)}
                      >
                        <Edit className="h-4 w-4 text-inherit" />
                        {t("usersTable.actions.edit")}
                      </DropdownMenuItem>

                      {/* حذف */}
                      <DropdownMenuItem
                        className="cursor-pointer hover:text-white text-red-600 dark:text-red-400 hover:bg-red-600 dark:hover:bg-red-400"
                        onClick={() => onDeleteClick(user)}
                      >
                        <Trash2 className="h-4 w-4 text-inherit" />
                        {t("usersTable.actions.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
