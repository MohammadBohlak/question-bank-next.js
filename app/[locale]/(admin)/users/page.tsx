"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { getAllUsers } from "@/store/admin";
import { deleteUser } from "@/store/user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import CreateUserDialog from "@/components/CreateUserDialog";
import EditUserDialog from "@/components/EditUserDialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Users,
  UserPlus,
  Search,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  User as UserIcon,
  Calendar,
  Check,
  X,
} from "lucide-react";
import { UserCircle, Hash, User } from "lucide-react";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useParams } from "next/navigation";
import MainTitle from "@/components/custom/texts/MainTitle";
import StatsChart from "@/components/custom/StatsChart";

// استيراد المكونات الجديدة المطلوبة
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TextMuted from "@/components/custom/texts/TextMuted";
import { cn } from "@/lib/utils";
import Background from "@/components/custom/Background";

interface AllUsers {
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
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const t = useTranslations("usersManagement");
  const { locale } = useParams();

  const users = useSelector((state: RootState) => state.admin.allUsers) as
    | AllUsers[]
    | undefined;
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // --- الحالات الجديدة للتحديد والفلترة والترتيب ---
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all"); // all, active, inactive
  const [sortBy, setSortBy] = useState<string>("dateDesc"); // dateDesc, dateAsc, nameAsc, nameDesc

  const handleEditClick = (user: any) => {
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

  // --- منطق الحذف الفردي ---
  const handleDeleteUser = async (userId: number) => {
    const toastId = toast.loading("Deleting user...");
    setIsDeleting(true);

    try {
      const res = await dispatch(deleteUser(userId)).unwrap();

      if (!res.success && Array.isArray(res.errors) && res.errors.length > 0) {
        toast.error(res.errors.join(" • "), { id: toastId });
        return;
      }

      toast.success(res.message || "User deleted successfully", {
        id: toastId,
      });
      // إزالة المعرف من القائمة المحددة إذا كان موجوداً
      setSelectedIds((prev) => prev.filter((id) => id !== userId));
      loadUsers();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete user",
        { id: toastId },
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // --- منطق الحذف الجماعي ---
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const toastId = toast.loading(`Deleting ${selectedIds.length} users...`);
    setIsDeleting(true);

    try {
      // نجري عمليات الحذف بالتوازي
      const deletePromises = selectedIds.map((id) =>
        dispatch(deleteUser(id)).unwrap(),
      );
      const results = await Promise.allSettled(deletePromises);

      const failedCount = results.filter((r) => r.status === "rejected").length;
      const successCount = results.filter(
        (r) => r.status === "fulfilled",
      ).length;

      if (failedCount > 0) {
        toast.error(`${failedCount} users failed to delete.`, { id: toastId });
      } else {
        toast.success(`${successCount} users deleted successfully.`, {
          id: toastId,
        });
        setSelectedIds([]); // تفريغ التحديد
        loadUsers();
      }
    } catch (error: unknown) {
      toast.error("An error occurred during bulk delete", { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };
  const getFullNameAr = (user: AllUsers) => {
    return (
      user.fullNameAr ||
      `${user.nameAr || ""} ${user.fatherNameAr || ""} ${user.surnameAr || ""}`.trim()
    );
  };

  const getFullNameEn = (user: AllUsers) => {
    return (
      user.fullNameEn ||
      `${user.nameEn || ""} ${user.fatherNameEn || ""} ${user.surnameEn || ""}`.trim()
    );
  };

  const getUsername = (user: AllUsers) => {
    return user.username || user.userName || "-";
  };

  const getEmail = (user: AllUsers) => {
    return user.email || "-";
  };

  const getMobile = (user: AllUsers) => {
    return user.mobile || "-";
  };

  const getGenderBadge = (user: AllUsers) => {
    if (user.gender === 0) {
      return (
        <Badge className="gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
          {t("common.male")}
        </Badge>
      );
    } else if (user.gender === 1) {
      return (
        <Badge className="gap-1.5 px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800">
          {t("common.female")}
        </Badge>
      );
    }
    return (
      <Badge className="gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800">
        {t("common.notSpecified")}
      </Badge>
    );
  };

  const getStatusBadge = (user: AllUsers) => {
    if (user.isActive === true) {
      return (
        <Badge className="gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
          {t("common.active")}
        </Badge>
      );
    } else if (user.isActive === false) {
      return (
        <Badge className="gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800">
          {t("common.inactive")}
        </Badge>
      );
    }
    return (
      <Badge className="gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800">
        {t("common.unknown")}
      </Badge>
    );
  };

  // تأكيد الحذف الجماعي
  const confirmBulkDelete = () => {
    if (selectedIds.length === 0) return;
    const toastId = toast(
      <div
        className="flex flex-col gap-4 p-4 bg-card-bg dark:bg-gray-800 border border-border-light dark:border-gray-700 rounded-lg shadow-lg"
        dir={locale == "en" ? "ltr" : "rtl"}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-error/10 dark:bg-red-900/30 rounded-lg">
            <Trash2 className="h-5 w-5 text-error dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-dark dark:text-white mb-1">
              Delete {selectedIds.length} Users
            </h3>
            <p className="text-sm text-text-secondary dark:text-gray-300">
              Are you sure you want to delete the selected users? This action
              cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.dismiss(toastId)}
            className="border-border-light dark:border-gray-700 text-text-secondary dark:text-gray-300 hover:bg-bg-alt dark:hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={async () => {
              toast.dismiss(toastId);
              await handleBulkDelete();
            }}
            disabled={isDeleting}
            className="bg-error dark:bg-red-700 hover:bg-error/90 dark:hover:bg-red-800 text-text-light"
          >
            {isDeleting ? "Deleting..." : "Delete All"}
          </Button>
        </div>
      </div>,
      {
        duration: Infinity,
        id: `bulk-delete-confirm`,
        className:
          "!p-0 !bg-transparent !border border-border-light !shadow-none",
        style: {
          background: "transparent",
          border: "none",
          boxShadow: "none",
        },
      },
    );
  };

  // --- معالجة البيانات: البحث + الفلترة + الترتيب ---
  const processedUsers = useMemo(() => {
    if (!users) return [];

    // 1. البحث النصي
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

    // 2. فلترة الحالة (نشط / غير نشط)
    if (statusFilter !== "all") {
      result = result.filter((user) =>
        statusFilter === "active"
          ? user.isActive === true
          : user.isActive === false,
      );
    }

    // 3. الترتيب
    result = [...result].sort((a, b) => {
      const nameA = locale === "ar" ? getFullNameAr(a) : getFullNameEn(a);
      const nameB = locale === "ar" ? getFullNameAr(b) : getFullNameEn(b);

      // تحويل التواريخ (Dec 10, 2014) إلى كائن Date للمقارنة
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

  // التعامل مع اختيار الكل
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(processedUsers.map((u) => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  // التعامل مع اختيار صف واحد
  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  // التحقق مما إذا كانت جميع العناصر الظاهرة محددة
  const isAllSelected =
    processedUsers.length > 0 &&
    processedUsers.every((user) => selectedIds.includes(user.id));

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-SY" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Delete confirmation toast
  const confirmDelete = (userId: number) => {
    const toastId = toast(
      <div
        className="flex flex-col gap-4 p-4 bg-card-bg dark:bg-gray-800 border border-border-light dark:border-gray-700 rounded-lg shadow-lg"
        dir={locale == "en" ? "ltr" : "rtl"}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-error/10 dark:bg-red-900/30 rounded-lg">
            <Trash2 className="h-5 w-5 text-error dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-dark dark:text-white mb-1">
              Confirm Delete
            </h3>
            <p className="text-sm text-text-secondary dark:text-gray-300">
              Are you sure you want to delete this user? This action cannot be
              undone.
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.dismiss(toastId)}
            className="border-border-light dark:border-gray-700 text-text-secondary dark:text-gray-300 hover:bg-bg-alt dark:hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={async () => {
              toast.dismiss(toastId);
              await handleDeleteUser(userId);
            }}
            disabled={isDeleting}
            className="bg-error dark:bg-red-700 hover:bg-error/90 dark:hover:bg-red-800 text-text-light"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>,
      {
        duration: Infinity,
        id: `delete-confirm-${userId}`,
        className:
          "!p-0 !bg-transparent !border border-border-light !shadow-none",
        style: {
          background: "transparent",
          border: "none",
          boxShadow: "none",
        },
      },
    );
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
            <Background className="">
              <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.back()}
                    className="rounded-xl border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-linear-to-br from-prim to-sec shadow-md">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <MainTitle>{t("title")}</MainTitle>
                    </div>
                  </div>
                </div>

                <Button
                  className="self-end gap-2 rounded-xl bg-btn text-white shadow-lg hover:opacity-80 hover:shadow-xl transition-all"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <UserPlus className="h-5 w-5" />
                  {t("actions.createUser")}
                </Button>
              </div>
            </Background>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {
                  value: users?.length || 0,
                  label: t("stats.totalUsers"),
                  icon: Users,
                  colors: {
                    bg: "from-white to-blue-50 dark:from-gray-800 dark:to-gray-900/50",
                    iconBox:
                      "from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40",
                    iconText: "text-blue-600 dark:text-blue-400",
                    border:
                      "border-r-blue-500 dark:border-r-blue-400 ltr:border-l-blue-500 dark:ltr:border-l-blue-400 ltr:border-r-border-light dark:ltr:border-r-border-light",
                  },
                },
                {
                  value: users?.filter((u) => u.isActive).length || 0,
                  label: t("stats.activeUsers"),
                  icon: UserIcon,
                  colors: {
                    bg: "from-white to-green-50 dark:from-gray-800 dark:to-gray-900/50",
                    iconBox:
                      "from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40",
                    iconText: "text-green-600 dark:text-green-400",
                    border:
                      "border-r-green-500 dark:border-r-green-400 ltr:border-l-green-500 dark:ltr:border-l-green-400 ltr:border-r-border-light dark:ltr:border-r-border-light",
                  },
                },
                {
                  value: users?.filter((u) => u.gender === 0).length || 0,
                  label: t("stats.maleUsers"),
                  icon: UserIcon,
                  colors: {
                    bg: "from-white to-purple-50 dark:from-gray-800 dark:to-gray-900/50",
                    iconBox:
                      "from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40",
                    iconText: "text-purple-600 dark:text-purple-400",
                    border:
                      "border-r-purple-500 dark:border-r-purple-400 ltr:border-l-purple-500 dark:ltr:border-l-purple-400 ltr:border-r-border-light dark:ltr:border-r-border-light",
                  },
                },
                {
                  value: users?.filter((u) => u.gender === 1).length || 0,
                  label: t("stats.femaleUsers"),
                  icon: UserIcon,
                  colors: {
                    bg: "from-white to-pink-50 dark:from-gray-800 dark:to-gray-900/50",
                    iconBox:
                      "from-pink-100 to-pink-200 dark:from-pink-900/40 dark:to-pink-800/40",
                    iconText: "text-pink-600 dark:text-pink-400",
                    border:
                      "border-r-pink-500 dark:border-r-pink-400 ltr:border-l-pink-500 dark:ltr:border-l-pink-400 ltr:border-r-border-light dark:ltr:border-r-border-light",
                  },
                },
              ].map((item, idx) => (
                <Card
                  key={idx}
                  className={`
        rounded-2xl border border-border-light shadow-lg bg-linear-to-br 
        rtl:border-r-4 ltr:border-l-4 ${item.colors.border}
        ${item.colors.bg}
      `}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                          {item.value}
                        </div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {item.label}
                        </div>
                      </div>
                      <div
                        className={`p-3 rounded-xl bg-linear-to-br ${item.colors.iconBox}`}
                      >
                        <item.icon
                          className={`h-6 w-6 ${item.colors.iconText}`}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Compact Data List Style - Responsive Grid */}
            <div className="w-full mb-8">
              <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-border-light dark:border-gray-700 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y divide-border-light dark:divide-gray-700 md:divide-y-0 md:divide-x">
                  {/* Total Users */}
                  <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors duration-200">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                      <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                        {t("stats.totalUsers")}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {users?.length || 0}
                      </h3>
                      <Users className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                    </div>
                  </div>

                  {/* Active Users */}
                  <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors duration-200">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                      <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                        {t("stats.activeUsers")}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {users?.filter((u) => u.isActive).length || 0}
                      </h3>
                      <UserIcon className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                    </div>
                  </div>

                  {/* Male Users */}
                  <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors duration-200">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></span>
                      <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                        {t("stats.maleUsers")}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {users?.filter((u) => u.gender === 0).length || 0}
                      </h3>
                      <UserIcon className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                    </div>
                  </div>

                  {/* Female Users */}
                  <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors duration-200">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]"></span>
                      <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                        {t("stats.femaleUsers")}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {users?.filter((u) => u.gender === 1).length || 0}
                      </h3>
                      <UserIcon className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <StatsChart users={users} />
          </div>

          {/* Main Content */}
          <Card className="rounded-2xl border border-border-light shadow-lg bg-white dark:bg-gray-800 overflow-hidden">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center space-x-2 text-2xl font-bold text-gray-900 dark:text-white">
                    <Users className="text-sec" />
                    <span className="text-prim dark:text-gray-100">
                      {t("usersTable.title")}
                    </span>
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    <TextMuted className="mt-1">
                      {t("usersTable.description")}
                    </TextMuted>
                  </CardDescription>
                </div>
              </div>

              {/* Table Controls */}
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

                {/* فلتر الحالة */}
                <div className="flex-1">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                      <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("usesrsFilters.states.all")}
                      </SelectItem>
                      <SelectItem value="active">
                        {t("usesrsFilters.states.active")}
                      </SelectItem>
                      <SelectItem value="inactive">
                        {t("usesrsFilters.states.inActive")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* الترتيب */}
                <div className="flex-1">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger
                      size="default"
                      className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                    >
                      <SelectValue placeholder="ترتيب حسب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dateDesc">
                        {t("usesrsFilters.sort.recent")}{" "}
                      </SelectItem>
                      <SelectItem value="dateAsc">
                        {t("usesrsFilters.sort.older")}{" "}
                      </SelectItem>
                      <SelectItem value="nameAsc">
                        {t("usesrsFilters.sort.fullNameA")}
                      </SelectItem>
                      <SelectItem value="nameDesc">
                        {t("usesrsFilters.sort.fullNameD")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

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
                    onClick={confirmBulkDelete}
                    disabled={isDeleting}
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
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="p-4 w-12 text-center">
                        <Checkbox
                          checked={isAllSelected}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all"
                        />
                      </th>
                      <th
                        className={`${locale == "en" ? "text-left" : "text-right"} py-4 px-6 font-semibold text-gray-900 dark:text-white`}
                      >
                        {t("usersTable.headers.name")}
                      </th>
                      <th
                        className={`${locale == "en" ? "text-left" : "text-right"} py-4 px-6 font-semibold text-gray-900 dark:text-white`}
                      >
                        {t("usersTable.headers.username")}
                      </th>
                      <th
                        className={`${locale == "en" ? "text-left" : "text-right"} py-4 px-6 font-semibold text-gray-900 dark:text-white`}
                      >
                        {t("usersTable.headers.contact")}
                      </th>
                      <th
                        className={`${locale == "en" ? "text-left" : "text-right"} py-4 px-6 font-semibold text-gray-900 dark:text-white`}
                      >
                        {t("usersTable.headers.gender")}
                      </th>
                      <th
                        className={`${locale == "en" ? "text-left" : "text-right"} py-4 px-6 font-semibold text-gray-900 dark:text-white`}
                      >
                        {t("usersTable.headers.status")}
                      </th>
                      <th
                        className={`${locale == "en" ? "text-left" : "text-right"} py-4 px-6 font-semibold text-gray-900 dark:text-white`}
                      >
                        {t("usersTable.headers.created")}
                      </th>
                      <th
                        className={`${locale == "en" ? "text-left" : "text-right"} py-4 px-6 font-semibold text-gray-900 dark:text-white`}
                      >
                        {t("usersTable.headers.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedUsers.map((user) => (
                      <tr
                        key={user.id}
                        className={cn(
                          "border-b border-gray-100 dark:border-gray-700 transition-colors duration-200",
                          `  hover:bg-gray-50 dark:hover:bg-gray-700/50 `,
                          `${selectedIds.includes(user.id) ? "!bg-sec/10 " : ""}`,
                        )}
                      >
                        <td className="p-4 text-center">
                          <Checkbox
                            checked={selectedIds.includes(user.id)}
                            onCheckedChange={(checked) =>
                              handleSelectOne(user.id, checked as boolean)
                            }
                            className="data-[state=checked]:bg-prim dark:data-[state=checked]:bg-sec" // تخصيص لون الحدود والخلفية عند التحديد
                            aria-label="Select row"
                          />
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {getFullNameAr(user)}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {getFullNameEn(user)}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-700 dark:text-gray-300">
                            {getUsername(user)}
                          </div>
                        </td>
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
                        <td className="py-4 px-6">{getGenderBadge(user)}</td>
                        <td className="py-4 px-6">{getStatusBadge(user)}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="h-3.5 w-3.5 text-sec" />
                            {formatDate(user.createDate)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem className="cursor-pointer text-blue-600 dark:text-blue-400">
                                  <Eye className="h-4 w-4 mr-2" />
                                  {t("usersTable.actions.view")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer text-green-600 dark:text-green-400"
                                  onClick={() => handleEditClick(user)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  {t("usersTable.actions.edit")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer text-red-600 dark:text-red-400"
                                  onClick={() => confirmDelete(user.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
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
              <div className="md:hidden space-y-6 p-6">
                {processedUsers.map((user) => (
                  <Card
                    key={user.id}
                    className="relative border-2 border-transparent  shadow-2xl hover:border-sec transition-all duration-300 overflow-hidden   group"
                  >
                    {/* Gradient Header Background */}
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-prim via-[#1a2285] to-sec z-0" />

                    <CardContent className="p-0">
                      <div className="relative z-10">
                        {/* Card Header with ID and Status */}
                        <div className="px-6 pt-6 pb-3 flex items-start justify-between">
                          <div className="flex items-center gap-3 bg-white/20 dark:bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
                            <Checkbox
                              checked={selectedIds.includes(user.id)}
                              onCheckedChange={(checked) =>
                                handleSelectOne(user.id, checked as boolean)
                              }
                              className="border-2 border-white data-[state=checked]:bg-white data-[state=checked]:text-[#141a73]"
                            />
                            <div className="flex items-center gap-2 text-white font-semibold text-sm">
                              <Hash className="w-3.5 h-3.5 opacity-80" />
                              <span>{user.id}</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {getStatusBadge(user)}
                          </div>
                        </div>

                        {/* Avatar Section */}
                        <div className="flex flex-col items-center px-6 pb-6">
                          <div className="relative mb-4">
                            {/* Avatar Circle */}
                            <div
                              className={`
                    w-24 h-24 rounded-full bg-white dark:bg-gray-800 
                    flex items-center justify-center
                    shadow-xl border-4 border-white dark:border-gray-800
                    ${user.gender === 0 ? "text-[#3498db]" : "text-[#e91e63]"}
                  `}
                            >
                              {user.gender === 0 ? (
                                <User className="w-12 h-12" strokeWidth={1.5} />
                              ) : (
                                <User className="w-12 h-12" strokeWidth={1.5} />
                              )}
                            </div>

                            {/* Gender Indicator */}
                          </div>

                          {/* User Names */}
                          <div className="text-center">
                            <h3 className="font-bold text-lg text-prim dark:text-sec mb-1 drop-shadow-lg">
                              {locale == "ar"
                                ? getFullNameAr(user)
                                : getFullNameEn(user)}
                            </h3>
                            <p className="text-sm text-prim dark:text-sec italic">
                              {locale == "ar"
                                ? getFullNameEn(user)
                                : getFullNameAr(user)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Card Body - User Information */}
                      <div className="px-6 pb-6 space-y-3 ">
                        {/* Username Info */}
                        <div className="w-full sm:w-auto flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 rounded-xl hover:shadow-md transition-all duration-300 hover:-translate-x-1 group/item">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2ab3f7] to-[#1da1e6] flex items-center justify-center flex-shrink-0 shadow-lg group-hover/item:scale-110 transition-transform">
                            <UserCircle className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-0.5">
                              {t("usersTable.headers.username")}
                            </div>
                            <div className="font-medium text-gray-900 dark:text-white truncate">
                              {getUsername(user)}
                            </div>
                          </div>
                        </div>

                        {/* Email Info */}
                        <div className="w-full sm:w-auto flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 rounded-xl hover:shadow-md transition-all duration-300 hover:-translate-x-1 group/item">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover/item:scale-110 transition-transform">
                            <Mail className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-0.5">
                              {t("usersTable.headers.email")}
                            </div>
                            <div className="font-medium text-gray-900 dark:text-white truncate text-sm">
                              {getEmail(user)}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 space-x-2 space-y-3 sm:space-y-0 ">
                          {/* Gender Info */}
                          <div className="w-full sm:w-auto flex items-center gap-3 p-3 bg-gradient-to-r  from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 rounded-xl hover:shadow-md transition-all duration-300 hover:-translate-x-1 group/item">
                            <div
                              className={`
                  w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover/item:scale-110 transition-transform
                  ${
                    user.gender === 0
                      ? "bg-gradient-to-br from-[#3498db] to-[#2980b9]"
                      : "bg-gradient-to-br from-[#e91e63] to-[#c2185b]"
                  }
                `}
                            >
                              <User
                                className="w-5 h-5 text-white"
                                strokeWidth={2}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-0.5">
                                {t("usersTable.headers.gender")}
                              </div>
                              <div className="flex items-center gap-2">
                                {getGenderBadge(user)}
                              </div>
                            </div>
                          </div>

                          {/* Address Info */}
                          {user.address && (
                            <div className=" flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 rounded-xl hover:shadow-md transition-all duration-300 hover:-translate-x-1 group/item">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover/item:scale-110 transition-transform">
                                <MapPin className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-0.5">
                                  العنوان
                                </div>
                                <div className="font-medium text-gray-900 dark:text-white truncate">
                                  {user.address}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2  space-x-2 space-y-3 sm:space-y-0">
                          {/* Phone Info */}
                          <div className="w-full sm:w-auto flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 rounded-xl hover:shadow-md transition-all duration-300 hover:-translate-x-1 group/item">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover/item:scale-110 transition-transform">
                              <Phone className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-0.5">
                                {t("usersTable.headers.phoneNumber")}
                              </div>
                              <div
                                dir="ltr"
                                className="font-medium ltr:text-left rtl:text-right text-gray-900 dark:text-white truncate"
                              >
                                {getMobile(user)}
                              </div>
                            </div>
                          </div>

                          {/* Date Info */}
                          <div className="w-full sm:w-auto flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-indigo-100/50 dark:from-indigo-950/30 dark:to-indigo-900/20 rounded-xl hover:shadow-md transition-all duration-300 hover:-translate-x-1 group/item">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover/item:scale-110 transition-transform">
                              <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-0.5">
                                {t("usersTable.headers.created")}
                              </div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {formatDate(user.createDate)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions Footer */}
                      <div className="px-6 pb-6">
                        <div className="flex gap-3 pt-5 border-t-2 border-dashed border-gray-200 dark:border-gray-700">
                          <Button
                            size="sm"
                            className="flex-1 gap-2 bg-gradient-to-r from-[#2ab3f7] to-[#1da1e6] hover:from-[#1da1e6] hover:to-[#1890d5] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 font-semibold"
                            onClick={() => handleEditClick(user)}
                          >
                            <Edit className="h-4 w-4" />
                            {t("usersTable.actions.edit")}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1 gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 font-semibold"
                            onClick={() => confirmDelete(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            {t("usersTable.actions.delete")}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {/* Mobile Cards */}
                {/* <div className="md:hidden space-y-4 p-6">
                      {processedUsers.map((user) => (
                        <Card
                          key={user.id}
                          className="border border-gray-200 dark:border-gray-700"
                        >
                          <CardContent className="p-4">
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <div className="pt-1">
                                    <Checkbox
                                      checked={selectedIds.includes(user.id)}
                                      onCheckedChange={(checked) =>
                                        handleSelectOne(
                                          user.id,
                                          checked as boolean,
                                        )
                                      }
                                    />
                                  </div>
                                  <div>
                                    <div className="font-bold text-gray-900 dark:text-white">
                                      {getFullNameAr(user)}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                      {getFullNameEn(user)}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  {getStatusBadge(user)}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {t("usersTable.headers.username")}
                                  </div>
                                  <div className="font-medium">
                                    {getUsername(user)}
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {t("usersTable.headers.gender")}
                                  </div>
                                  {getGenderBadge(user)}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {t("usersTable.headers.contact")}
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                                    <span className="text-gray-600 dark:text-gray-400">
                                      {getEmail(user)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />
                                    <span className="text-gray-600 dark:text-gray-400">
                                      {getMobile(user)}
                                    </span>
                                  </div>
                                  {user.address && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <MapPin className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                                      <span className="text-gray-600 dark:text-gray-400 truncate">
                                        {user.address}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                  <Calendar className="h-4 w-4" />
                                  {formatDate(user.createDate)}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="gap-2 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                                    onClick={() => handleEditClick(user)}
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                    {t("usersTable.actions.edit")}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="gap-2"
                                    onClick={() => confirmDelete(user.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    {t("usersTable.actions.delete")}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div> */}
              </div>

              {/* Empty State */}
              {processedUsers.length === 0 && (
                <div className="py-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center mx-auto mb-6">
                    <Users className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                    {searchTerm || statusFilter !== "all"
                      ? t("usersTable.emptyState.noResults")
                      : t("usersTable.emptyState.title")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                    {searchTerm || statusFilter !== "all"
                      ? t("usersTable.emptyState.noResultsDescription")
                      : t("usersTable.emptyState.description")}
                  </p>
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-btn text-white shadow-lg hover:shadow-xl"
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    {t("usersTable.emptyState.createFirstUser")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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
      </div>
    </>
  );
}

function UsersManagementSkeleton() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl bg-gray-300 dark:bg-gray-700" />
              <div className="space-y-3">
                <Skeleton className="h-8 w-64 bg-gray-300 dark:bg-gray-700" />
                <Skeleton className="h-5 w-48 bg-gray-300 dark:bg-gray-700" />
              </div>
            </div>
            <Skeleton className="h-10 w-40 rounded-xl bg-gray-300 dark:bg-gray-700" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-28 rounded-2xl bg-gray-300 dark:bg-gray-700"
              />
            ))}
          </div>
        </div>

        {/* Table Skeleton */}
        <Skeleton className="h-96 rounded-2xl bg-gray-300 dark:bg-gray-700" />
      </div>
    </div>
  );
}
