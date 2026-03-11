//universities_management

"use client";
import { UniversityCard } from "@/components/university-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fetchUniversities,
  createUniversity,
  deleteUniversity,
  updateUniversity,
  getAllUsers,
  selectAllUsers,
} from "@/store/admin";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Plus,
  Grid,
  List,
  Building,
  Pencil,
  Trash2,
  Save,
  X,
  Users,
  Globe,
  Shield,
  BadgeX,
  Power,
  Building2,
  UserCog,
  MapPin,
  Hash,
  FileText,
  Edit,
  GraduationCap,
  University,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import TextMuted from "@/components/custom/common/texts/TextMuted";
import Background from "@/components/custom/common/Background";
import StatsUniversities from "@/components/custom/adminPagesComponents/stats/StatsUniversities";
import DeleteUniversityDialog from "@/components/custom/adminPagesComponents/dialogs/univercityDialogs/DeleteUniversityDialog";
import renderSkeletons from "@/components/custom/adminPagesComponents/universitiesPage/renderSkeletons";
import UniversitiesHeader from "@/components/custom/adminPagesComponents/universitiesPage/UniversitiesHeader";
import UniversitiesFilters from "@/components/custom/adminPagesComponents/universitiesPage/UniversitiesFilters";
import UniversitiesEmptyState from "@/components/custom/adminPagesComponents/universitiesPage/UniversitiesEmptyState";
import UniversityFormDialog from "@/components/custom/adminPagesComponents/dialogs/univercityDialogs/UniversityFormDialog";
import UniversitiesGridView from "@/components/custom/adminPagesComponents/universitiesPage/UniversitiesGridView";
import UniversitiesListView from "@/components/custom/adminPagesComponents/universitiesPage/UniversitiesListView";
export interface UniversityFormData {
  id: number;
  nameAr: string;
  nameEn: string;
  code: string;
  country: string;
  city: string;
  isPublic: boolean;
  isActive: boolean;
  programsCount: number;
  admin: string;
  adminId: number | null;
}

interface UniversityCardModel {
  id: number;
  nameAr: string;
  nameEn: string;
  code: string;
  country: string;
  city: string;
  isPublic: boolean;
  isActive: boolean;
  programsCount: number;
  admin: string;
  adminId: number | null;
}

interface UniversityApi {
  id: number;
  nameAr: string;
  nameEn: string;
  code: string;
  country: string;
  city: string;
  isPublic: boolean;
  isActive: boolean;
  programsCount: number | null;
  admin: string | null;
  adminId: number | null;
}

export default function UniversitiesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const universities = useSelector(
    (state: RootState) => state.admin.universities || [],
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<{
    id: number;
    nameAr: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslations("UniversitiesPage");
  const { locale } = useParams();
  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [rsesetFilter, setRsesetFilter] = useState(false);
  // State for create/edit dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUniversityId, setCurrentUniversityId] = useState<number | null>(
    null,
  );
  const adminOptions = useSelector(selectAllUsers);
  // Form state
  const [formData, setFormData] = useState<UniversityFormData>({
    id: 0,
    nameAr: "",
    nameEn: "",
    code: "",
    country: "",
    city: "",
    admin: "",
    adminId: null,
    isPublic: true,
    isActive: true,
    programsCount: 0,
  });

  const loadUniversities = useCallback(async () => {
    setIsLoading(true);
    try {
      await dispatch(fetchUniversities()).unwrap();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "فشل في تحميل الجامعات",
      );
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (searchTerm !== "" || typeFilter != "all" || statusFilter != "all")
      setRsesetFilter(true);
    else setRsesetFilter(false);
  }, [searchTerm, typeFilter, statusFilter]);

  useEffect(() => {
    loadUniversities();
    dispatch(getAllUsers());
  }, [dispatch, loadUniversities]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const resetForm = () => {
    setFormData({
      id: 0,
      nameAr: "",
      nameEn: "",
      code: "",
      country: "",
      city: "",
      admin: "",
      adminId: null,
      isPublic: true,
      isActive: true,
      programsCount: 0,
    });
    setIsEditMode(false);
    setCurrentUniversityId(null);
  };

  const handleOpenCreateDialog = () => {
    resetForm();
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const mapUniversityToForm = (
    university: UniversityApi,
  ): UniversityFormData => ({
    id: university.id,
    nameAr: university.nameAr,
    nameEn: university.nameEn,
    code: university.code,
    country: university.country,
    city: university.city,
    isPublic: university.isPublic,
    isActive: university.isActive,
    programsCount: university.programsCount ?? 0,
    adminId: university.adminId ?? null,
    admin: university.admin ?? t("noAdminAssigned"),
  });

  const handleOpenEditDialog = (university: UniversityFormData) => {
    setFormData({
      id: university.id,
      nameAr: university.nameAr,
      nameEn: university.nameEn,
      code: university.code,
      country: university.country,
      city: university.city,
      isPublic: university.isPublic,
      adminId: university.adminId ?? 0,
      admin: university.admin ?? t("noAdminAssigned"),
      isActive: university.isActive,
      programsCount: university.programsCount,
    });
    setCurrentUniversityId(university.id);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.nameAr || !formData.nameEn || !formData.code) {
      toast.error(t("form.validation.requiredFields"));
      return;
    }

    setLoading(true);
    try {
      if (isEditMode && currentUniversityId) {
        const res = await dispatch(
          updateUniversity({
            id: currentUniversityId,
            body: formData,
          }),
        ).unwrap();
        if (
          !res.success &&
          Array.isArray(res.errors) &&
          res.errors.length > 0
        ) {
          toast.error(res.errors.join(" • "));
          return;
        }
        toast.success(res.message || t("messages.updateSuccess"));
      } else {
        const res = await dispatch(createUniversity(formData)).unwrap();
        if (
          !res.success &&
          Array.isArray(res.errors) &&
          res.errors.length > 0
        ) {
          toast.error(res.errors.join(" • "));
          return;
        }
        toast.success(res.message || t("messages.createSuccess"));
      }

      setIsDialogOpen(false);
      resetForm();
      loadUniversities();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "فشلت العملية");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: parseInt(value, 10),
    }));
  };

  const openDeleteDialog = (university: { id: number; nameAr: string }) => {
    setSelectedUniversity(university);
    setIsDeleteDialogOpen(true);
  };

  // Filter universities based on search and filters
  const filteredUniversities = useMemo(() => {
    return universities.filter((university) => {
      const matchesSearch =
        searchTerm === "" ||
        university?.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        university?.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        university?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        university?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        university?.country?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "public" && university.isPublic) ||
        (typeFilter === "private" && !university.isPublic);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && university.isActive) ||
        (statusFilter === "inactive" && !university.isActive);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [universities, searchTerm, typeFilter, statusFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: universities.length,
      active: universities.filter((u) => u.isActive).length,
      public: universities.filter((u) => u.isPublic).length,
      private: universities.filter((u) => !u.isPublic).length,
      inactive: universities.filter((u) => !u.isActive).length,
    };
  }, [universities]);

  // Transform university data to match UniversityCard component format
  const transformUniversityData = (
    university: UniversityApi,
  ): UniversityCardModel => ({
    id: university.id,
    nameAr: university.nameAr,
    nameEn: university.nameEn,
    code: university.code,
    country: university.country,
    city: university.city,
    isPublic: university.isPublic,
    isActive: university.isActive,
    programsCount: university.programsCount ?? 0,
    admin: university.admin ?? t("noAdminAssigned"),
    adminId: university.adminId ?? 0,
  });

  return (
    <>
      <div
        dir={locale == "en" ? "ltr" : "rtl"}
        className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 bg-bg dark:bg-gray-900"
      >
        <div className="max-w-7xl mx-auto">
          <UniversitiesHeader
            onRefresh={loadUniversities}
            onAddClick={handleOpenCreateDialog}
            isLoading={isLoading}
          />
          {/* Stats Cards */}
          <StatsUniversities stats={stats} />
          {/* Filters and Controls */}
          <UniversitiesFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            canReset={rsesetFilter}
            onReset={() => {
              setSearchTerm("");
              setTypeFilter("all");
              setStatusFilter("all");
            }}
            t={t}
          />
          {/* View Controls and Stats */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 ">
            <div>
              <div className="flex space-x-1 text-xl">
                <TextMuted>{t("search.resultsFound.showing")}</TextMuted>
                <span className="text-prim dark:text-sec font-bold">
                  {filteredUniversities.length}
                </span>
                <TextMuted>{t("search.resultsFound.of")}</TextMuted>
                <span className="text-prim dark:text-sec font-bold">
                  {universities.length}
                </span>
                <TextMuted>{t("search.resultsFound.universities")}</TextMuted>
              </div>

              {searchTerm && (
                <span className="mr-2">
                  {t("search.for")}{" "}
                  <span className="font-medium">{searchTerm}</span>
                </span>
              )}
            </div>

            <Background className="py-3 mb-0">
              <div className="flex items-center gap-3">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  className={`h-8 w-8 rounded-md hover:bg-sec ${viewMode === "grid" ? "bg-sec text-white" : "text-dark  hover:bg-gray-300 dark:text-sec"} `}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-6 w-6" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  className={`h-8 w-8 rounded-md  hover:bg-sec ${viewMode === "list" ? "bg-sec text-white " : "text-dark  hover:bg-gray-300  dark:text-sec"}`}
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-6 w-6 " />
                </Button>
                {/* </div> */}
              </div>
            </Background>
          </div>
          {/* Universities Grid/List */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {renderSkeletons()}
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <UniversitiesGridView
                  universities={filteredUniversities.map(
                    transformUniversityData,
                  )}
                  onEdit={handleOpenEditDialog}
                  onDelete={openDeleteDialog}
                  mapToForm={mapUniversityToForm}
                  loading={loading}
                />
              ) : (
                <UniversitiesListView
                  // ✅ قم بتحويل البيانات هنا لضمان تطابق الأنواع
                  universities={filteredUniversities.map((u) => ({
                    ...u,
                    programsCount: u.programsCount ?? 0, // تحويل null إلى 0
                    admin: u.admin ?? t("common.noAdmin"), // تأمين حقل admin أيضاً
                  }))}
                  onEdit={handleOpenEditDialog}
                  onDelete={openDeleteDialog}
                  mapToForm={mapUniversityToForm}
                  loading={loading}
                  t={t}
                  locale={locale as string}
                />
              )}

              {/* Empty State */}
              {filteredUniversities.length === 0 && !isLoading && (
                <UniversitiesEmptyState
                  totalUniversitiesCount={universities.length}
                  onAddClick={handleOpenCreateDialog}
                  t={t}
                />
              )}
            </>
          )}

          <DeleteUniversityDialog
            open={isDeleteDialogOpen}
            setOpen={setIsDeleteDialogOpen}
            selectedUniversity={selectedUniversity}
            setSelectedUniversity={setSelectedUniversity}
            t={t}
          />

          {/* Create/Edit University Dialog */}
          <UniversityFormDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            isEditMode={isEditMode}
            formData={formData}
            onInputChange={handleInputChange}
            onSwitchChange={handleSwitchChange}
            onSelectChange={handleSelectChange}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsDialogOpen(false);
              resetForm();
            }}
            adminOptions={adminOptions}
            loading={loading}
            t={t}
          />
        </div>
      </div>
    </>
  );
}
