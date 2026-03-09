import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Edit,
  FileText,
  Globe,
  Hash,
  Loader2,
  Power,
  Save,
  X, // 1. إضافة X للاستيراد
} from "lucide-react";
import TextMuted from "@/components/custom/common/texts/TextMuted";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getCourses, updatePrivateCourse } from "@/store/supervisor";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";

// 2. تعريف شكل بيانات الكورس
interface CourseData {
  id: number;
  nameAr: string;
  nameEn: string;
  code: string;
  descriptionAr: string;
  descriptionEn: string;
  isActive: boolean;
}

// 3. تعريف Props للمكون
interface EditCourseDialogQBProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  t: (key: string) => string;
  selectedCourse: CourseData | null;
}

const EditCourseDialogQB: React.FC<EditCourseDialogQBProps> = ({
  open,
  setOpen,
  t,
  selectedCourse,
}) => {
  const [loading, setLoading] = useState(false); // تصحيح القيمة الابتدائية
  const dispatch = useDispatch<AppDispatch>();

  const [editCourse, setEditCourse] = useState<CourseData>({
    id: 0,
    nameAr: "",
    nameEn: "",
    code: "",
    descriptionAr: "",
    descriptionEn: "",
    isActive: false,
  });

  // 4. تحديث الـ State عند تغير الكورس المحدد أو فتح الـ Dialog
  useEffect(() => {
    if (open && selectedCourse) {
      setEditCourse({
        id: selectedCourse.id,
        nameAr: selectedCourse.nameAr,
        nameEn: selectedCourse.nameEn,
        code: selectedCourse.code,
        descriptionAr: selectedCourse.descriptionAr,
        descriptionEn: selectedCourse.descriptionEn,
        isActive: selectedCourse.isActive,
      });
    }
  }, [open, selectedCourse]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[550px] bg-card-bg dark:bg-gray-800 border border-border-light dark:border-gray-700"
      >
        <DialogHeader className="flex flex-col space-y-2">
          <DialogTitle className="text-dark dark:text-white font-arabic flex items-center gap-3">
            <div className="p-2 rounded-lg bg-btn">
              <Edit className="h-5 w-5 text-white" />
            </div>
            {t("editCourse")}
          </DialogTitle>
          <DialogDescription>
            <TextMuted>{t("editCourseDescription")}</TextMuted>
          </DialogDescription>
        </DialogHeader>

        {/* نعرض المحتوى فقط إذا كان هناك كورس محدد */}
        {selectedCourse && (
          <div className="space-y-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="editNameAr"
                  className="text-dark dark:text-gray-300 font-arabic flex items-center gap-2"
                >
                  <FileText className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("addCourseARName")}
                </Label>
                <Input
                  id="editNameAr"
                  value={editCourse.nameAr}
                  onChange={(e) =>
                    setEditCourse({ ...editCourse, nameAr: e.target.value })
                  }
                  className="font-arabic text-right border border-border-light dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="editNameEn"
                  className="text-dark dark:text-gray-300 font-arabic flex items-center gap-2"
                >
                  <Globe className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("addCourseENName")}
                </Label>
                <Input
                  id="editNameEn"
                  value={editCourse.nameEn}
                  onChange={(e) =>
                    setEditCourse({ ...editCourse, nameEn: e.target.value })
                  }
                  className="border border-border-light dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="editCode"
                className="text-dark dark:text-gray-300 font-arabic flex items-center gap-2"
              >
                <Hash className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {t("addCourseCode")}
              </Label>
              <Input
                id="editCode"
                value={editCourse.code}
                onChange={(e) =>
                  setEditCourse({ ...editCourse, code: e.target.value })
                }
                className="font-mono border border-border-light dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="editDescAr"
                  className="text-dark dark:text-gray-300 font-arabic flex items-center gap-2"
                >
                  <FileText className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("addCourseARDescription")}
                </Label>
                <Textarea
                  id="editDescAr"
                  value={editCourse.descriptionAr}
                  onChange={(e) =>
                    setEditCourse({
                      ...editCourse,
                      descriptionAr: e.target.value,
                    })
                  }
                  className="font-arabic text-right min-h-20 border border-border-light dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="editDescEn"
                  className="text-dark dark:text-gray-300 font-arabic flex items-center gap-2"
                >
                  <Globe className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("addCourseENDescription")}
                </Label>
                <Textarea
                  id="editDescEn"
                  value={editCourse.descriptionEn || ""}
                  onChange={(e) =>
                    setEditCourse({
                      ...editCourse,
                      descriptionEn: e.target.value,
                    })
                  }
                  className="min-h-20 border border-border-light dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="course-status-switch"
                className="text-dark dark:text-gray-300 font-arabic flex items-center gap-2"
              >
                <Power className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {t("courseStatus")}
              </Label>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-bg-alt dark:bg-gray-700/50 border border-border-light dark:border-gray-700">
                <Switch
                  id="course-status-switch"
                  checked={editCourse.isActive}
                  onCheckedChange={(checked) =>
                    setEditCourse({ ...editCourse, isActive: checked })
                  }
                  className="data-[state=checked]:bg-success data-[state=unchecked]:bg-border-light dark:data-[state=checked]:bg-green-700 dark:data-[state=unchecked]:bg-gray-600"
                  dir="ltr"
                  disabled={loading}
                />
                <span className="font-medium dark:text-gray-300">
                  {editCourse.isActive ? t("active") : t("inactive")}
                </span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-border-light dark:border-gray-700 text-dark dark:text-gray-300 close-hover font-arabic"
            disabled={loading}
          >
            <X className="h-4 w-4 ml-2" />
            {t("cancel")}
          </Button>
          <Button
            onClick={async () => {
              setLoading(true);
              try {
                await dispatch(updatePrivateCourse(editCourse));
                await dispatch(getCourses());
                setOpen(false);
                toast.success("تم تحديث المقرر بنجاح");
              } catch (error: unknown) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "فشل في تحديث المقرر",
                );
              } finally {
                setLoading(false);
              }
            }}
            disabled={
              !editCourse.nameAr.trim() ||
              !editCourse.nameEn.trim() ||
              !editCourse.code.trim() ||
              loading
            }
            className="bg-btn hover:opacity-80 text-white font-arabic"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 ml-2" />
                {t("saveChanges")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCourseDialogQB;
