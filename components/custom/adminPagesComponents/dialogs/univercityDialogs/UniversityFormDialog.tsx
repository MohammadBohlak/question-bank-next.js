"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TextMuted from "@/components/custom/common/texts/TextMuted";
import {
  Edit,
  Plus,
  FileText,
  Globe,
  Hash,
  MapPin,
  UserCog,
  Building2,
  Power,
  X,
  Save,
} from "lucide-react";
import CustomSelect from "@/components/custom/common/CustomSelect";

// تعريف نوع البيانات الأساسي للجامعة
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

// تعريف خيارات المسؤول (Admin)
export interface AdminOption {
  id: number;
  fullNameAr: string;
  [key: string]: any;
}

interface UniversityFormDialogProps {
  // حالة النافذة
  open: boolean;
  onOpenChange: (open: boolean) => void;

  // وضع التعديل أو الإنشاء
  isEditMode: boolean;

  // بيانات النموذج
  formData: UniversityFormData;

  // دوال التعامل مع الحقول
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSwitchChange: (name: string, checked: boolean) => void;
  onSelectChange: (name: string, value: string) => void;

  // دوال الإرسال والإلغاء
  onSubmit: () => Promise<void> | void;
  onCancel: () => void;

  // خيارات المسؤولين للقائمة المنسدلة
  adminOptions: AdminOption[];

  // حالة التحميل
  loading: boolean;

  // دالة الترجمة
  t: (key: string) => string;
}

export default function UniversityFormDialog({
  open,
  onOpenChange,
  isEditMode,
  formData,
  onInputChange,
  onSwitchChange,
  onSelectChange,
  onSubmit,
  onCancel,
  adminOptions,
  loading,
  t,
}: UniversityFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[525px] rounded-2xl bg-card-bg dark:bg-gray-800 border-border dark:border-gray-700"
      >
        <DialogHeader className="flex flex-col space-y-2">
          <DialogTitle className="text-xl font-semibold text-text-secondary dark:text-blue-300 flex items-center gap-3">
            {isEditMode ? (
              <>
                <div className="p-2 rounded-lg bg-btn">
                  <Edit className="h-5 w-5 text-white" />
                </div>
                {t("dialog.editTitle")}
              </>
            ) : (
              <>
                <div className="p-2 rounded-lg bg-btn">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                {t("dialog.createTitle")}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            <TextMuted>
              {isEditMode
                ? t("dialog.editDescription")
                : t("dialog.createDescription")}
            </TextMuted>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* الأسماء (عربي / إنجليزي) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="nameAr"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <FileText className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {t("form.fields.nameAr")}{" "}
                <span className="text-error dark:text-red-400">*</span>
              </Label>
              <Input
                id="nameAr"
                name="nameAr"
                value={formData.nameAr}
                onChange={onInputChange}
                placeholder={t("form.placeholders.nameAr")}
                className="rounded-lg border-border-light dark:border-gray-700 bg-input-bg dark:bg-gray-900 text-text dark:text-gray-300 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="nameEn"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <Globe className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {t("form.fields.nameEn")}{" "}
                <span className="text-error dark:text-red-400">*</span>
              </Label>
              <Input
                id="nameEn"
                name="nameEn"
                value={formData.nameEn}
                onChange={onInputChange}
                placeholder={t("form.placeholders.nameEn")}
                className="rounded-lg border-border-light dark:border-gray-700 bg-input-bg dark:bg-gray-900 text-text dark:text-gray-300 transition-colors"
              />
            </div>
          </div>

          {/* الرمز والدولة */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="code"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <Hash className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {t("form.fields.code")}{" "}
                <span className="text-error dark:text-red-400">*</span>
              </Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={onInputChange}
                placeholder={t("form.placeholders.code")}
                className="rounded-lg font-mono border-border-light dark:border-gray-700 bg-input-bg dark:bg-gray-900 text-text dark:text-gray-300 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="country"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <Globe className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {t("form.fields.country")}
              </Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={onInputChange}
                placeholder={t("form.placeholders.country")}
                className="rounded-lg border-border-light dark:border-gray-700 bg-input-bg dark:bg-gray-900 text-text dark:text-gray-300 transition-colors"
              />
            </div>
          </div>

          {/* المدينة والمسؤول */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="city"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <MapPin className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {t("form.fields.city")}
              </Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={onInputChange}
                placeholder={t("form.placeholders.city")}
                className="rounded-lg border-border-light dark:border-gray-700 bg-input-bg dark:bg-gray-900 text-text dark:text-gray-300 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="adminId"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <UserCog className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {t("form.fields.admin")}
              </Label>
              <CustomSelect
                value={formData.adminId?.toString() || ""}
                onChange={(value) => onSelectChange("adminId", value)}
                placeholder={
                  formData.admin
                    ? formData.admin
                    : t("form.placeholders.selectAdmin")
                }
                className="w-full rounded-lg border-border-light dark:border-gray-700 bg-input-bg dark:bg-gray-900 text-text dark:text-gray-300 transition-colors"
                options={adminOptions.map((option) => ({
                  value: option.id.toString(),
                  label: option.fullNameAr,
                }))}
              />
            </div>
          </div>

          {/* نوع الجامعة (عام/خاص) */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-bg-alt dark:bg-gray-700/50">
            <div>
              <Label
                htmlFor="isPublic"
                className="text-sm font-medium block mb-1 text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <Building2 className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {t("form.fields.universityType")}
              </Label>
              <p className="text-sm text-text dark:text-gray-300">
                {formData.isPublic
                  ? t("form.labels.publicUniversity")
                  : t("form.labels.privateUniversity")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {formData.isPublic ? t("common.public") : t("common.private")}
              </span>
              <Switch
                dir="ltr"
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) =>
                  onSwitchChange("isPublic", checked)
                }
                className="data-[state=checked]:bg-secondary data-[state=checked]:dark:bg-blue-600"
              />
            </div>
          </div>

          {/* حالة الجامعة (نشط/غير نشط) */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-bg-alt dark:bg-gray-700/50">
            <div>
              <Label
                htmlFor="isActive"
                className="text-sm font-medium block mb-1 text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <Power className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {t("form.fields.universityStatus")}
              </Label>
              <p className="text-sm text-text dark:text-gray-300">
                {formData.isActive ? t("common.active") : t("common.inactive")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {formData.isActive ? t("common.active") : t("common.inactive")}
              </span>
              <Switch
                dir="ltr"
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  onSwitchChange("isActive", checked)
                }
                className="data-[state=checked]:bg-success data-[state=checked]:dark:bg-green-600"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border-border-light dark:border-gray-700 text-gray-700 dark:text-gray-300 close-hover"
          >
            <X className="h-4 w-4 ml-2" />
            {t("common.cancel")}
          </Button>
          <Button
            onClick={onSubmit}
            disabled={loading}
            className="rounded-lg bg-btn hover:opacity-80 text-text-light"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -mr-1 ml-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {t("common.processing")}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 ml-2" />
                {isEditMode
                  ? t("dialog.updateButton")
                  : t("dialog.createButton")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
