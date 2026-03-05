"use client";
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Mail,
  Phone,
  User,
  Search,
  Calendar,
  Loader2,
  UserPlus,
  Check,
  Hash,
  BookUser,
  X,
  Filter,
} from "lucide-react";
import { searchUsers, assignUserToProgram } from "@/store/user";
import { AppDispatch, RootState } from "@/store/store";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface UniversityUser {
  id: number;
  username: string;
  fullNameAr: string;
  fullNameEn: string;
  email?: string;
  mobile?: string;
  gender?: number;
  isActive?: boolean;
  createDate?: string;
}

interface SearchedUser {
  id: number;
  username: string;
  fullNameAr: string;
  fullNameEn: string;
  gender: number;
  address: string | null;
  mobile: string | null;
  email: string | null;
  lastLogin: string | null;
  createDate: string;
  isActive: boolean;
}

interface ProgramUsersProps {
  isOpen: boolean;
  onClose: () => void;
  programId: number;
  programName: string;
  users: UniversityUser[];
  onUserAssigned?: () => void;
}

type SearchField =
  | "id"
  | "nameAr"
  | "fatherNameAr"
  | "surnameAr"
  | "userName"
  | "email"
  | "mobile";

interface SearchParams {
  id?: string;
  nameAr?: string;
  fatherNameAr?: string;
  surnameAr?: string;
  userName?: string;
  email?: string;
  mobile?: string;
}

const ProgramUsers = ({
  isOpen,
  onClose,
  programId,
  programName,
  users = [],
  onUserAssigned,
}: ProgramUsersProps) => {
  const dispatch = useDispatch<AppDispatch>();

  // Local state
  const [searchParams, setSearchParams] = useState<SearchParams>({});
  const [activeFields, setActiveFields] = useState<SearchField[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [assigningUserId, setAssigningUserId] = useState<number | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Redux state
  const { searchedUser, loading } = useSelector(
    (state: RootState) => state.user,
  );
  const searchResults = searchedUser
    ? Array.isArray(searchedUser)
      ? searchedUser
      : [searchedUser]
    : [];

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchParams({});
      setActiveFields([]);
      setIsFiltersOpen(false);
      setAssigningUserId(null);
      setHasSearched(false);
    }
  }, [isOpen]);

  const handleSearch = useCallback(async () => {
    // Check if there are any active fields with values
    const hasValues = activeFields.some((field) => {
      const value = searchParams[field];
      return field === "id"
        ? value && !isNaN(Number(value))
        : value && value.trim().length >= 2;
    });

    if (!hasValues) {
      toast.error("الرجاء إدخال قيمة بحث واحدة على الأقل");
      return;
    }

    const params: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any

    // Add search parameters for all active fields that have values
    activeFields.forEach((field) => {
      const value = searchParams[field];
      if (value) {
        if (field === "id") {
          const id = Number(value);
          if (!isNaN(id)) {
            params.id = id;
          }
        } else if (value.trim().length >= 2) {
          params[field] = value.trim();
        }
      }
    });

    // Don't search if no valid params
    if (Object.keys(params).length === 0) {
      toast.error("الرجاء إدخال قيم صحيحة للبحث");
      return;
    }

    try {
      await dispatch(searchUsers(params)).unwrap();
      setHasSearched(true);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "فشل البحث عن المستخدمين",
      );
    }
  }, [dispatch, activeFields, searchParams]);

  // Debounce search
  useEffect(() => {
    const hasValidInput = activeFields.some((field) => {
      const value = searchParams[field];
      return field === "id"
        ? value && !isNaN(Number(value))
        : value && value.trim().length >= 2;
    });

    if (hasValidInput) {
      const delayDebounceFn = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setHasSearched(false);
    }
  }, [searchParams, activeFields, handleSearch]);

  const toggleField = (field: SearchField) => {
    setActiveFields((prev) => {
      if (prev.includes(field)) {
        // Remove field and clear its value
        const newParams = { ...searchParams };
        delete newParams[field];
        setSearchParams(newParams);
        return prev.filter((f) => f !== field);
      } else {
        return [...prev, field];
      }
    });
  };

  const handleInputChange = (field: SearchField, value: string) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setActiveFields([]);
    setHasSearched(false);
  };

  const handleAssignUser = async (userId: number) => {
    setAssigningUserId(userId);
    try {
      const result = await dispatch(
        assignUserToProgram({
          userId,
          programId,
        }),
      ).unwrap();

      toast.success(result.message || "تم إضافة المستخدم للبرنامج بنجاح");

      // Clear search and show updated users list
      clearAllFilters();
      setHasSearched(false);

      if (onUserAssigned) {
        onUserAssigned();
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "فشل إضافة المستخدم للبرنامج",
      );
    } finally {
      setAssigningUserId(null);
    }
  };

  // Check if a user is already in the program
  const isUserInProgram = (userId: number) => {
    return users.some((user) => user.id === userId);
  };

  const getGenderLabel = (gender?: number) => {
    if (gender === 0) return "ذكر";
    if (gender === 1) return "أنثى";
    return "غير محدد";
  };

  const getGenderColor = (gender?: number) => {
    if (gender === 0)
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
    if (gender === 1)
      return "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400";
    return "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Get search field label in Arabic
  const getSearchFieldLabel = (field: SearchField) => {
    const labels: Record<SearchField, string> = {
      id: "رقم المستخدم",
      nameAr: "الاسم الأول",
      fatherNameAr: "اسم الأب",
      surnameAr: "الكنية",
      userName: "اسم المستخدم",
      email: "البريد الإلكتروني",
      mobile: "رقم الجوال",
    };
    return labels[field];
  };

  const getFieldIcon = (field: SearchField) => {
    const icons: Record<SearchField, any> = {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      id: Hash,
      nameAr: User,
      fatherNameAr: BookUser,
      surnameAr: BookUser,
      userName: User,
      email: Mail,
      mobile: Phone,
    };
    return icons[field];
  };

  const getActiveFiltersCount = () => {
    return activeFields.filter((field) => {
      const value = searchParams[field];
      return value && value.trim().length > 0;
    }).length;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-4xl max-h-[90vh] custom-scrollbar p-0 gap-0 overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border-0 shadow-2xl"
      >
        {/* Header */}
        <DialogHeader className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-btn shadow-md">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  مستخدمي البرنامج
                  <Badge variant="secondary" className="mr-2 bg-sec text-white">
                    {users.length}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400 mt-1">
                  إدارة المستخدمين المرتبطين بـ {programName}
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Filters Collapsible */}
          <Collapsible
            open={isFiltersOpen}
            onOpenChange={setIsFiltersOpen}
            className="mt-4"
          >
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 rounded-xl border-gray-300 dark:border-gray-700"
                >
                  <Filter className="h-4 w-4" />
                  {isFiltersOpen ? "إخفاء الفلاتر" : "إظهار الفلاتر"}
                  {getActiveFiltersCount() > 0 && !isFiltersOpen && (
                    <Badge className="mr-2 bg-blue-500 text-white">
                      {getActiveFiltersCount()}
                    </Badge>
                  )}
                </Button>
              </CollapsibleTrigger>

              {activeFields.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                >
                  <X className="h-4 w-4" />
                  مسح الكل
                </Button>
              )}
            </div>

            <CollapsibleContent className="mt-4 space-y-4">
              {/* Field Selection Buttons */}
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { value: "id", label: "رقم المستخدم", icon: Hash },
                    { value: "nameAr", label: "الاسم الأول", icon: User },
                    {
                      value: "fatherNameAr",
                      label: "اسم الأب",
                      icon: BookUser,
                    },
                    { value: "surnameAr", label: "الكنية", icon: BookUser },
                    { value: "userName", label: "اسم المستخدم", icon: User },
                    { value: "email", label: "البريد الإلكتروني", icon: Mail },
                    { value: "mobile", label: "رقم الجوال", icon: Phone },
                  ] as const
                ).map((field) => {
                  const Icon = field.icon;
                  const isActive = activeFields.includes(field.value);

                  return (
                    <Button
                      key={field.value}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleField(field.value)}
                      className={
                        isActive
                          ? "bg-sec focus:scale-105 hover:bg-sec  text-white"
                          : "border-gray-300 dark:border-gray-700"
                      }
                    >
                      <Icon className="h-4 w-4 ml-2" />
                      {field.label}
                    </Button>
                  );
                })}
              </div>

              {/* Dynamic Input Fields */}
              {activeFields.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  {activeFields.map((field) => {
                    const Icon = getFieldIcon(field);
                    const value = searchParams[field] || "";

                    return (
                      <div key={field} className="relative">
                        <Icon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder={`البحث بـ ${getSearchFieldLabel(field)}...`}
                          value={value}
                          onChange={(e) =>
                            handleInputChange(field, e.target.value)
                          }
                          className="pr-10 pl-4 py-2 rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20"
                          dir="rtl"
                          type={field === "id" ? "number" : "text"}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Active Filters Summary */}
          {activeFields.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                فلاتر نشطة:
              </span>
              {activeFields.map((field) => {
                const value = searchParams[field];
                if (!value) return null;

                return (
                  <Badge
                    key={field}
                    variant="secondary"
                    className="gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                  >
                    {getSearchFieldLabel(field)}: {value}
                    <button
                      onClick={() => {
                        handleInputChange(field, "");
                        toggleField(field);
                      }}
                      className="mr-1 hover:text-blue-900 dark:hover:text-blue-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </DialogHeader>

        {/* Content - Users List or Search Results */}
        <div className="p-6 max-h-[calc(90vh-320px)] overflow-y-auto custom-scrollbar">
          {/* No search yet - Show current program users */}
          {!hasSearched && activeFields.length === 0 && (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  المستخدمين الحاليين
                </h3>
              </div>

              {users.length > 0 ? (
                <div className="space-y-3">
                  {users.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      getGenderLabel={getGenderLabel}
                      getGenderColor={getGenderColor}
                      formatDate={formatDate}
                      isInProgram={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mx-auto mb-6">
                    <Users className="h-10 w-10 text-sec" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    لا يوجد مستخدمين
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    لم يتم العثور على أي مستخدمين مرتبطين بهذا البرنامج
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    اختر الفلاتر أعلاه للبحث عن مستخدمين وإضافتهم
                  </p>
                </div>
              )}
            </>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400">جاري البحث...</p>
            </div>
          )}

          {/* Search Results */}
          {!loading && hasSearched && activeFields.length > 0 && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  نتائج البحث
                </h3>
                <Badge
                  variant="outline"
                  className="bg-blue-50 dark:bg-blue-900/20"
                >
                  {searchResults.length} نتيجة
                </Badge>
              </div>

              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((user: SearchedUser) => {
                    const inProgram = isUserInProgram(user.id);
                    return (
                      <div key={user.id} className="relative">
                        <UserCard
                          user={user}
                          getGenderLabel={getGenderLabel}
                          getGenderColor={getGenderColor}
                          formatDate={formatDate}
                          isInProgram={inProgram}
                        />
                        {!inProgram ? (
                          <Button
                            size="sm"
                            className="absolute top-4 left-4 gap-2 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleAssignUser(user.id)}
                            disabled={assigningUserId === user.id}
                          >
                            {assigningUserId === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <UserPlus className="h-4 w-4" />
                            )}
                            إضافة للبرنامج
                          </Button>
                        ) : (
                          <Badge className="absolute top-4 left-4 gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 py-2">
                            <Check className="h-4 w-4" />
                            مضاف بالفعل
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    لا توجد نتائج
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    لم يتم العثور على مستخدمين يطابقون معايير البحث
                  </p>
                </div>
              )}
            </>
          )}

          {/* No filters selected hint */}
          {!loading && !hasSearched && activeFields.length > 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                أدخل قيم البحث في الفلاتر أعلاه
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {hasSearched
                ? `تم العثور على ${searchResults.length} نتائج`
                : `عرض ${users.length} مستخدم في البرنامج`}
            </p>
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-xl border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              إغلاق
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const UserCard = ({
  user,
  getGenderLabel,
  getGenderColor,
  formatDate,
  isInProgram,
}: any) => {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md dark:hover:shadow-gray-800 transition-all duration-200 bg-white dark:bg-gray-900/50">
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {user.fullNameAr || user.fullNameEn || user.username}
          </h4>
          <Badge
            variant={user.isActive ? "default" : "secondary"}
            className={
              user.isActive
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
            }
          >
            {user.isActive ? "نشط" : "غير نشط"}
          </Badge>
          {isInProgram && (
            <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
              <Check className="h-3 w-3 ml-1" />
              مضاف
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Badge
            className={`gap-1.5 px-3 py-1 rounded-full ${getGenderColor(user.gender)}`}
          >
            <User className="h-3 w-3" />
            {getGenderLabel(user.gender)}
          </Badge>

          {user.email && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <Mail className="h-3.5 w-3.5" />
              <span dir="ltr">{user.email}</span>
            </div>
          )}

          {user.mobile && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <Phone className="h-3.5 w-3.5" />
              <span dir="ltr">{user.mobile}</span>
            </div>
          )}

          {user.createDate && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(user.createDate)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgramUsers;
