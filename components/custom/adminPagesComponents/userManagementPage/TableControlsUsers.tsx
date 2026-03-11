import { Search } from "lucide-react";
import CustomSelect from "../../common/CustomSelect";
import { Input } from "@/components/ui/input";

// TableControlsUsers.tsx
interface TableControlsUsersProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
  t: (key: string) => string;
}

const TableControlsUsers: React.FC<TableControlsUsersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  t,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mt-6">
      <div className="relative flex-2">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder={t("usersTable.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
        />
      </div>

      <div className="flex-1">
        <CustomSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: t("usesrsFilters.states.all") },
            { value: "active", label: t("usesrsFilters.states.active") },
            { value: "inactive", label: t("usesrsFilters.states.inActive") },
          ]}
          placeholder="الحالة"
          className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
        />
      </div>

      <div className="flex-1">
        <CustomSelect
          value={sortBy}
          onChange={setSortBy}
          options={[
            { value: "dateDesc", label: t("usesrsFilters.sort.recent") },
            { value: "dateAsc", label: t("usesrsFilters.sort.older") },
            { value: "nameAsc", label: t("usesrsFilters.sort.fullNameA") },
            { value: "nameDesc", label: t("usesrsFilters.sort.fullNameD") },
          ]}
          placeholder="ترتيب حسب"
          className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
        />
      </div>
    </div>
  );
};
export default TableControlsUsers;
