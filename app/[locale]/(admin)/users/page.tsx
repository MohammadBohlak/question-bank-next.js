"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { getAllUsers } from "@/store/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import CreateUserDialog from "@/components/custom/adminPagesComponents/dialogs/userDialogs/CreateUserDialog";
import EditUserDialog from "@/components/custom/adminPagesComponents/dialogs/userDialogs/EditUserDialog";
import { toast } from "sonner";
import { Trash2, User as UserIcon, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import StatsUsers from "@/components/custom/adminPagesComponents/stats/StatsUsers";
import DeleteUserDialog from "@/components/custom/adminPagesComponents/dialogs/userDialogs/DeleteUserDialog";
import { getFullNameAr, getFullNameEn } from "@/lib/userUtils";
import HeaderUM from "@/components/custom/adminPagesComponents/userManagementPage/HeaderUM";
import TableControlsUsers from "@/components/custom/adminPagesComponents/userManagementPage/TableControlsUsers";
import UsersEmptyState from "@/components/custom/adminPagesComponents/userManagementPage/UsersEmptyState";
import UsersManagementSkeleton from "@/components/custom/adminPagesComponents/userManagementPage/UsersManagementSkeleton";
import UsersTable from "@/components/custom/adminPagesComponents/userManagementPage/UsersTable";
import UsersCard from "@/components/custom/adminPagesComponents/userManagementPage/UsersCard";

export interface AllUsers {
  id: number;
  username: string;
  fullNameAr: string;
  fullNameEn: string;
  nameAr?: string;
  fatherNameAr?: string;
  surnameAr?: string;
  nameEn?: string;
  fatherNameEn?: string;
  surnameEn?: string;
  gender?: number;
  userName?: string;
  email?: string;
  mobile?: string;
  address?: string;
  isActive?: boolean;
  createDate?: string;
  updatedAt?: string;
}

export default function UsersManagementPage() {
  const dispatch = useDispatch<AppDispatch>();
  const t = useTranslations("usersManagement");
  const { locale } = useParams();

  // حالة لتخزين المستخدمين المراد حذفهم (مصفوفة فارغة افتراضياً)
  const [usersToDelete, setUsersToDelete] = useState<
    { id: number; name: string }[]
  >([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const users = useSelector((state: RootState) => state.admin.allUsers) as
    | AllUsers[]
    | undefined;
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AllUsers | null>(null);

  // --- الحالات الخاصة بالتحديد والفلترة والترتيب ---
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("dateDesc");

  const handleEditClick = (user: AllUsers) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      await dispatch(getAllUsers()).unwrap();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : t("errors.loadFailed"),
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch, t]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // --- منطق فتح الـ Dialog للحذف الفردي ---
  const handleSingleDeleteClick = (user: AllUsers) => {
    setUsersToDelete([
      {
        id: user.id,
        name: getFullNameAr(user) || user.username || "User",
      },
    ]);
    setIsDeleteDialogOpen(true);
  };

  // --- منطق فتح الـ Dialog للحذف الجماعي ---
  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) return;

    const selectedUsersData =
      users
        ?.filter((u) => selectedIds.includes(u.id))
        .map((u) => ({
          id: u.id,
          name: getFullNameAr(u) || u.username || "User",
        })) || [];

    setUsersToDelete(selectedUsersData);
    setIsDeleteDialogOpen(true);
  };

  // --- معالجة البيانات: البحث + الفلترة + الترتيب ---
  const processedUsers = useMemo(() => {
    if (!users) return [];

    let result = users.filter((user) => {
      const search = searchTerm.toLowerCase();
      return (
        (user.fullNameAr || "").toLowerCase().includes(search) ||
        (user.fullNameEn || "").toLowerCase().includes(search) ||
        (user.username || "").toLowerCase().includes(search) ||
        (user.email || "").toLowerCase().includes(search) ||
        (user.mobile || "").toLowerCase().includes(search)
      );
    });

    if (statusFilter !== "all") {
      result = result.filter((user) =>
        statusFilter === "active"
          ? user.isActive === true
          : user.isActive === false,
      );
    }

    result = [...result].sort((a, b) => {
      const nameA = locale === "ar" ? getFullNameAr(a) : getFullNameEn(a);
      const nameB = locale === "ar" ? getFullNameAr(b) : getFullNameEn(b);

      const dateA = a.createDate ? new Date(a.createDate).getTime() : 0;
      const dateB = b.createDate ? new Date(b.createDate).getTime() : 0;

      switch (sortBy) {
        case "nameAsc":
          return nameA.localeCompare(nameB);
        case "nameDesc":
          return nameB.localeCompare(nameA);
        case "dateAsc":
          return dateA - dateB;
        case "dateDesc":
        default:
          return dateB - dateA;
      }
    });

    return result;
  }, [users, searchTerm, statusFilter, sortBy, locale]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(processedUsers.map((u) => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  if (loading) {
    return <UsersManagementSkeleton />;
  }

  return (
    <>
      <div
        dir={locale == "en" ? "ltr" : "rtl"}
        className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-950"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <HeaderUM setIsCreateDialogOpen={setIsCreateDialogOpen} />
            <StatsUsers users={users} />
          </div>

          {/* Main Content */}
          <Card className="rounded-2xl border border-border-light shadow-lg bg-white dark:bg-gray-800 overflow-hidden">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              {/* ... Table Controls ... */}
              <TableControlsUsers
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                t={t}
              />

              {/* Bulk Actions Bar */}
              {selectedIds.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-800 dark:text-blue-200">
                    <Check className="h-4 w-4" />
                    <span className="flex space-x-2">
                      <span>{selectedIds.length}</span>
                      <span>{t("usersTable.usersSelected")}</span>
                    </span>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDeleteClick} // يستخدم الدالة الصحيحة
                    className="h-8"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("usersTable.deleteSelected")}
                  </Button>
                </div>
              )}
            </CardHeader>

            <CardContent className="p-0">
              {/* Desktop Table */}
              <UsersTable
                users={processedUsers}
                selectedIds={selectedIds}
                onSelectAll={handleSelectAll}
                onSelectOne={handleSelectOne}
                onEditClick={handleEditClick}
                onDeleteClick={handleSingleDeleteClick}
                t={t}
              />

              <UsersCard
                users={processedUsers}
                selectedIds={selectedIds}
                onSelectOne={handleSelectOne}
                onEditClick={handleEditClick}
                onDeleteClick={handleSingleDeleteClick}
                t={t}
              />

              {/* Empty State */}
              {processedUsers.length === 0 && (
                <UsersEmptyState
                  hasFilters={!!searchTerm || statusFilter !== "all"}
                  onCreateClick={() => setIsCreateDialogOpen(true)}
                  t={t}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dialogs */}
        <CreateUserDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSuccess={loadUsers}
        />
        <EditUserDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          user={selectedUser}
          onSuccess={loadUsers}
        />

        <DeleteUserDialog
          open={isDeleteDialogOpen}
          setOpen={setIsDeleteDialogOpen}
          users={usersToDelete}
          t={t}
          onSuccess={() => setSelectedIds([])}
        />
      </div>
    </>
  );
}
