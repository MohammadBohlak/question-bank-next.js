"use client"
import { UniversityCard } from "@/components/university-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchUniversities, createUniversity, deleteUniversity, updateUniversity, getAllUsers, selectAllUsers } from "@/store/admin";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Plus, Grid, List, Building, Pencil, Trash2, Save, X, Users, Globe, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
interface UniversityFormData {
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
  adminId: number|null;
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
  adminId: number|null;
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
  const universities = useSelector((state: RootState) => state.admin.universities || []);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslations('UniversitiesPage');
  const { locale } = useParams()
  // State for filters  
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // State for create/edit dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUniversityId, setCurrentUniversityId] = useState<number | null>(null);
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
    programsCount: 0
  });

  const loadUniversities = useCallback(async () => {
    setIsLoading(true);
    try {
      await dispatch(fetchUniversities()).unwrap();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "فشل في تحميل الجامعات");
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadUniversities();
    dispatch(getAllUsers());
  }, [dispatch, loadUniversities]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
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
      programsCount: 0
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
    university: UniversityApi
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
    admin: university.admin ?? t('noAdminAssigned'),
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
      admin: university.admin ?? t('noAdminAssigned'),
      isActive: university.isActive,
      programsCount: university.programsCount
    });
    setCurrentUniversityId(university.id);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {

    // Basic validation
    if (!formData.nameAr || !formData.nameEn || !formData.code) {
      toast.error(t('form.validation.requiredFields'));
      return;
    }

    setLoading(true);
    try {
      if (isEditMode && currentUniversityId) {
        const res = await dispatch(updateUniversity({
          id: currentUniversityId,
          body: formData
        })).unwrap();
        if (!res.success && Array.isArray(res.errors) && res.errors.length > 0) {
          toast.error(res.errors.join(' • '));
          return;
        }
        toast.success(res.message || t('messages.updateSuccess'));
      } else {
        const res = await dispatch(createUniversity(formData)).unwrap();
        if (!res.success && Array.isArray(res.errors) && res.errors.length > 0) {
          toast.error(res.errors.join(' • '));
          return;
        }
        toast.success(res.message || t('messages.createSuccess'));
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
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value, 10)
    }));
  };

  const handleDelete = (id: number) => {
    toast(
      <div
        className="flex flex-col gap-4 p-4 bg-card-bg dark:bg-gray-800 border border-border-light dark:border-gray-700 rounded-lg shadow-lg"
        dir={locale == 'en' ? 'ltr' : 'rtl'}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-error/10 dark:bg-red-900/30 rounded-lg">
            <Trash2 className="h-5 w-5 text-error dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-dark dark:text-white mb-1 font-arabic">
              تأكيد الحذف
            </h3>
            <p className="text-sm text-text-secondary dark:text-gray-300 font-arabic">
              {t('deleteConfirmation.message')}
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.dismiss()}
            className="border-border-light dark:border-gray-700 text-text-secondary dark:text-gray-300 hover:bg-bg-alt dark:hover:bg-gray-700 hover:border-border dark:hover:border-gray-600 transition-colors font-arabic min-w-20"
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={async () => {
              try {
                const res = await dispatch(deleteUniversity(id)).unwrap();
                if (!res.success && Array.isArray(res.errors) && res.errors.length > 0) {
                  toast.error(res.errors.join(' • '));
                  toast.dismiss();
                  return;
                }
                toast.success(res.message || t('messages.deleteSuccess'));
                loadUniversities();
                toast.dismiss();
              } catch (error: unknown) {
                toast.error(error instanceof Error ? error.message : "فشل الحذف");
                toast.dismiss();

              }
            }}
            className="bg-error dark:bg-red-700 hover:bg-error/90 dark:hover:bg-red-800 text-text-light dark:text-gray-100 font-arabic min-w-20 shadow-sm hover:shadow-md transition-all duration-200"
          >
            {t('common.delete')}
          </Button>
        </div>
      </div>,
      {
        duration: Infinity,
        className: "!p-0 !bg-transparent !border-0 !shadow-none",
        style: {
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
        },
      }
    );
  };

  // Filter universities based on search and filters
  const filteredUniversities = useMemo(() => {
    return universities.filter(university => {
      const matchesSearch = searchTerm === "" ||
        university?.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        university?.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        university?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        university?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        university?.country?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === "all" ||
        (typeFilter === "public" && university.isPublic) ||
        (typeFilter === "private" && !university.isPublic);

      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "active" && university.isActive) ||
        (statusFilter === "inactive" && !university.isActive);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [universities, searchTerm, typeFilter, statusFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: universities.length,
      active: universities.filter(u => u.isActive).length,
      public: universities.filter(u => u.isPublic).length,
      private: universities.filter(u => !u.isPublic).length,
      inactive: universities.filter(u => !u.isActive).length,
    };
  }, [universities]);

  // Transform university data to match UniversityCard component format
  const transformUniversityData = (
    university: UniversityApi
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
    admin: university.admin ?? t('noAdminAssigned'),
    adminId: university.adminId ?? 0,
  });

  // Loading skeleton
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

  return (
    <div dir={locale == 'en' ? 'ltr' : 'rtl'}
      className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 bg-bg dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-text-secondary dark:text-blue-300">
                {t('title')}
              </h1>
              <p className="mt-2 flex items-center gap-2 text-text dark:text-gray-300">
                <Building className="h-4 w-4" />
                {t('subtitle')}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="gap-2 border-primary dark:border-blue-600 text-text-secondary dark:text-blue-400 hover:bg-primary/10 dark:hover:bg-blue-900/30"
                onClick={() => loadUniversities()}
                disabled={isLoading}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t('common.refresh')}
              </Button>

              <Button
                className="gap-2 bg-primary dark:bg-blue-700 hover:bg-dark dark:hover:bg-blue-800 text-text-light"
                onClick={handleOpenCreateDialog}
              >
                <Plus className="h-4 w-4" />
                {t('actions.addUniversity')}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="rounded-xl p-5 shadow-sm border border-border-light dark:border-gray-700 bg-card-bg dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-text-secondary dark:text-blue-300">{stats.total}</div>
                  <div className="text-sm text-text dark:text-gray-300">{t('stats.total')}</div>
                </div>
                <div className="p-2 rounded-lg bg-primary/20 dark:bg-blue-900/30">
                  <Building className="h-5 w-5 text-primary dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="rounded-xl p-5 shadow-sm border border-border-light dark:border-gray-700 bg-card-bg dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-success dark:text-green-400">{stats.active}</div>
                  <div className="text-sm text-text dark:text-gray-300">{t('stats.active')}</div>
                </div>
                <div className="p-2 rounded-lg bg-success/20 dark:bg-green-900/30">
                  <Shield className="h-5 w-5 text-success dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="rounded-xl p-5 shadow-sm border border-border-light dark:border-gray-700 bg-card-bg dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-error dark:text-red-400">{stats.inactive}</div>
                  <div className="text-sm text-text dark:text-gray-300">{t('stats.inactive')}</div>
                </div>
                <div className="p-2 rounded-lg bg-error/20 dark:bg-red-900/30">
                  <Shield className="h-5 w-5 text-error dark:text-red-400" />
                </div>
              </div>
            </div>

            <div className="rounded-xl p-5 shadow-sm border border-border-light dark:border-gray-700 bg-card-bg dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-secondary dark:text-blue-400">{stats.public}</div>
                  <div className="text-sm text-text dark:text-gray-300">{t('stats.public')}</div>
                </div>
                <div className="p-2 rounded-lg bg-secondary/20 dark:bg-blue-900/30">
                  <Users className="h-5 w-5 text-secondary dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="rounded-xl p-5 shadow-sm border border-border-light dark:border-gray-700 bg-card-bg dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-dark dark:text-gray-200">{stats.private}</div>
                  <div className="text-sm text-text dark:text-gray-300">{t('stats.private')}</div>
                </div>
                <div className="p-2 rounded-lg bg-dark/20 dark:bg-gray-700">
                  <Globe className="h-5 w-5 text-dark dark:text-gray-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text dark:text-gray-400" />
              <Input
                placeholder={t('search.placeholder')}
                className="pr-10 h-11 rounded-xl border-border-light dark:border-gray-700 bg-input-bg dark:bg-gray-800 text-text dark:text-gray-300 focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px] h-11 rounded-xl border-border-light dark:border-gray-700 bg-input-bg dark:bg-gray-800 text-text dark:text-gray-300 focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20 transition-colors">
                  <SelectValue placeholder={t('filters.type')} />
                </SelectTrigger>
                <SelectContent className="bg-card-bg dark:bg-gray-800 border-border-light dark:border-gray-700">
                  <SelectItem value="all" className="text-text dark:text-gray-300 focus:bg-bg-alt dark:focus:bg-gray-700">
                    {t('filters.allTypes')}
                  </SelectItem>
                  <SelectItem value="public" className="text-text dark:text-gray-300 focus:bg-bg-alt dark:focus:bg-gray-700">
                    {t('filters.public')}
                  </SelectItem>
                  <SelectItem value="private" className="text-text dark:text-gray-300 focus:bg-bg-alt dark:focus:bg-gray-700">
                    {t('filters.private')}
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-11 rounded-xl border-border-light dark:border-gray-700 bg-input-bg dark:bg-gray-800 text-text dark:text-gray-300 focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20 transition-colors">
                  <SelectValue placeholder={t('filters.status')} />
                </SelectTrigger>
                <SelectContent className="bg-card-bg dark:bg-gray-800 border-border-light dark:border-gray-700">
                  <SelectItem value="all" className="text-text dark:text-gray-300 focus:bg-bg-alt dark:focus:bg-gray-700">
                    {t('filters.allStatuses')}
                  </SelectItem>
                  <SelectItem value="active" className="text-text dark:text-gray-300 focus:bg-bg-alt dark:focus:bg-gray-700">
                    {t('filters.active')}
                  </SelectItem>
                  <SelectItem value="inactive" className="text-text dark:text-gray-300 focus:bg-bg-alt dark:focus:bg-gray-700">
                    {t('filters.inactive')}
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                className="h-11 rounded-xl gap-2 border-border-light dark:border-gray-700 text-text-secondary dark:text-blue-400 hover:bg-bg-alt dark:hover:bg-gray-800 hover:border-primary dark:hover:border-blue-500 hover:text-primary dark:hover:text-blue-400 transition-colors"
                onClick={() => {
                  setSearchTerm("");
                  setTypeFilter("all");
                  setStatusFilter("all");
                }}
              >
                <Filter className="h-4 w-4" />
                {t('filters.clearFilters')}
              </Button>
            </div>
          </div>

          {/* View Controls and Stats */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-sm text-text dark:text-gray-300">
              <Badge variant="secondary" className="ml-2 bg-primary dark:bg-blue-700 text-text-light">
                {filteredUniversities.length}
              </Badge>
              {t('search.resultsFound')}
              {searchTerm && (
                <span className="mr-2">
                  {t('search.for')} <span className="font-medium">{searchTerm}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 rounded-lg p-1 bg-bg-alt dark:bg-gray-800">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8 rounded-md"
                  style={viewMode === "grid" ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-text-light)' } : { color: 'var(--color-text)' }}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8 rounded-md"
                  style={viewMode === "list" ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-text-light)' } : { color: 'var(--color-text)' }}
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Universities Grid/List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {renderSkeletons()}
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredUniversities.map((university) => (
                  <div key={university.id} className="relative group">
                    <UniversityCard
                      university={transformUniversityData(university)}
                    />
                    {/* Action buttons overlay */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 shadow-md bg-card-bg dark:bg-gray-800 hover:bg-bg-alt dark:hover:bg-gray-700"
                        onClick={() => handleOpenEditDialog(mapUniversityToForm(university))}
                        disabled={loading}
                      >
                        <Pencil className="h-3.5 w-3.5 text-primary dark:text-blue-400" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8 shadow-md bg-card-bg dark:bg-gray-800 hover:bg-error/10 dark:hover:bg-red-900/30"
                        onClick={() => { handleDelete(university.id) }}
                        disabled={loading}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-error dark:text-red-400" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-3">
                {filteredUniversities.map((university) => (
                  <div key={university.id} className="border border-border-light dark:border-gray-700 rounded-xl p-4 hover:shadow-md dark:hover:shadow-gray-900 transition-shadow bg-card-bg dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`h-3 w-1 rounded-full ${university.isActive ? 'bg-success dark:bg-green-500' : 'bg-bg-alt dark:bg-gray-700'}`} />
                        <div>
                          <h3 className="font-semibold text-text-secondary dark:text-blue-300">{university.nameEn}</h3>
                          <p className="text-sm font-arabic text-text dark:text-gray-300">{university.nameAr}</p>
                        </div>
                        <Badge variant={university.isPublic ? "default" : "secondary"} className={`${university.isPublic ? 'bg-secondary dark:bg-blue-700' : 'bg-dark dark:bg-gray-700'} text-text-light dark:text-gray-100`}>
                          {university.isPublic ? t('common.public') : t('common.private')}
                        </Badge>
                        <Badge variant="outline" className={`border ${university.isActive ? 'border-success dark:border-green-500 text-success dark:text-green-400 bg-success/10 dark:bg-green-900/30' : 'border-error dark:border-red-500 text-error dark:text-red-400 bg-error/10 dark:bg-red-900/30'}`}>
                          {university.isActive ? t('common.active') : t('common.inactive')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEditDialog(mapUniversityToForm(university))}
                          disabled={loading}
                          className="text-primary dark:text-blue-400 hover:bg-primary/10 dark:hover:bg-blue-900/30"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(university.id)}
                          disabled={loading}
                          className="text-error dark:text-red-400 hover:bg-error/10 dark:hover:bg-red-900/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {filteredUniversities.length === 0 && !isLoading && (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-bg-alt dark:bg-gray-800">
                  <Building className="h-12 w-12 text-text dark:text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-text-secondary dark:text-blue-300">
                  {universities.length === 0 ? t('emptyState.noUniversities') : t('emptyState.noResults')}
                </h3>
                <p className="mb-8 max-w-md mx-auto text-text dark:text-gray-400">
                  {universities.length === 0
                    ? t('emptyState.startAdding')
                    : t('emptyState.adjustSearch')
                  }
                </p>
                <Button
                  onClick={handleOpenCreateDialog}
                  className="gap-2 bg-primary dark:bg-blue-700 hover:bg-dark dark:hover:bg-blue-800 text-text-light"
                >
                  <Plus className="h-5 w-5" />
                  {t('actions.addNewUniversity')}
                </Button>
              </div>
            )}
          </>
        )}

        {/* Create/Edit University Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[525px] rounded-2xl bg-card-bg dark:bg-gray-800 border-border dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-text-secondary dark:text-blue-300">
                {isEditMode ? t('dialog.editTitle') : t('dialog.createTitle')}
              </DialogTitle>
              <DialogDescription className="text-text dark:text-gray-400">
                {isEditMode
                  ? t('dialog.editDescription')
                  : t('dialog.createDescription')
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nameAr" className="text-sm font-medium text-text-secondary dark:text-blue-400">
                    {t('form.fields.nameAr')} <span className="text-error dark:text-red-400">*</span>
                  </Label>
                  <Input
                    id="nameAr"
                    name="nameAr"
                    value={formData.nameAr}
                    onChange={handleInputChange}
                    placeholder={t('form.placeholders.nameAr')}
                    className="rounded-lg border-border-light dark:border-gray-700 bg-input-bg dark:bg-gray-900 text-text dark:text-gray-300 focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameEn" className="text-sm font-medium text-text-secondary dark:text-blue-400">
                    {t('form.fields.nameEn')} <span className="text-error dark:text-red-400">*</span>
                  </Label>
                  <Input
                    id="nameEn"
                    name="nameEn"
                    value={formData.nameEn}
                    onChange={handleInputChange}
                    placeholder={t('form.placeholders.nameEn')}
                    className="rounded-lg border-border-light dark:border-gray-700 bg-input-bg dark:bg-gray-900 text-text dark:text-gray-300 focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-sm font-medium text-text-secondary dark:text-blue-400">
                    {t('form.fields.code')} <span className="text-error dark:text-red-400">*</span>
                  </Label>
                  <Input
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder={t('form.placeholders.code')}
                    className="rounded-lg font-mono border-border-light dark:border-gray-700 bg-input-bg dark:bg-gray-900 text-text dark:text-gray-300 focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-medium text-text-secondary dark:text-blue-400">
                    {t('form.fields.country')}
                  </Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder={t('form.placeholders.country')}
                    className="rounded-lg border-border-light dark:border-gray-700 bg-input-bg dark:bg-gray-900 text-text dark:text-gray-300 focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium text-text-secondary dark:text-blue-400">
                    {t('form.fields.city')}
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder={t('form.placeholders.city')}
                    className="rounded-lg border-border-light dark:border-gray-700 bg-input-bg dark:bg-gray-900 text-text dark:text-gray-300 focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminId" className="text-sm font-medium text-text-secondary dark:text-blue-400">
                    {t('form.fields.admin')}
                  </Label>
                  <Select name="adminId" onValueChange={(value) => handleSelectChange("adminId", value)}>
                    <SelectTrigger className="w-full rounded-lg border-border-light dark:border-gray-700 bg-input-bg dark:bg-gray-900 text-text dark:text-gray-300 focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20 transition-colors">
                      <SelectValue
                        placeholder={formData.admin ? formData.admin : t('form.placeholders.selectAdmin')}
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-card-bg dark:bg-gray-800 border-border-light dark:border-gray-700">
                      {adminOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id.toString()} className="text-text dark:text-gray-300 focus:bg-bg-alt dark:focus:bg-gray-700">
                          {option.fullNameAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-bg-alt dark:bg-gray-700/50">
                <div>
                  <Label htmlFor="isPublic" className="text-sm font-medium block mb-1 text-text-secondary dark:text-blue-400">
                    {t('form.fields.universityType')}
                  </Label>
                  <p className="text-sm text-text dark:text-gray-300">
                    {formData.isPublic ? t('form.labels.publicUniversity') : t('form.labels.privateUniversity')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-text-secondary dark:text-blue-400">
                    {formData.isPublic ? t('common.public') : t('common.private')}
                  </span>
                  <Switch
                    dir="ltr"
                    id="isPublic"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => handleSwitchChange("isPublic", checked)}
                    className="data-[state=checked]:bg-secondary data-[state=checked]:dark:bg-blue-600"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-bg-alt dark:bg-gray-700/50">
                <div>
                  <Label htmlFor="isActive" className="text-sm font-medium block mb-1 text-text-secondary dark:text-blue-400">
                    {t('form.fields.universityStatus')}
                  </Label>
                  <p className="text-sm text-text dark:text-gray-300">
                    {formData.isActive ? t('common.active') : t('common.inactive')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-text-secondary dark:text-blue-400">
                    {formData.isActive ? t('common.active') : t('common.inactive')}
                  </span>
                  <Switch
                    dir="ltr"
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleSwitchChange("isActive", checked)}
                    className="data-[state=checked]:bg-success data-[state=checked]:dark:bg-green-600"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={loading}
                className="rounded-lg border-border-light dark:border-gray-700 text-text-secondary dark:text-blue-400 hover:bg-bg-alt dark:hover:bg-gray-700 hover:border-primary dark:hover:border-blue-500"
              >
                <X className="h-4 w-4 ml-2" />
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="rounded-lg bg-primary dark:bg-blue-700 hover:bg-dark dark:hover:bg-blue-800 text-text-light"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -mr-1 ml-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('common.processing')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 ml-2" />
                    {isEditMode ? t('dialog.updateButton') : t('dialog.createButton')}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}