import TextMuted from "@/components/custom/common/texts/TextMuted";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { AppDispatch } from "@/store/store";
import { createPrivateCourse, getCourses } from "@/store/supervisor";
import { FileText, Globe, Hash, Loader2, Plus, X } from "lucide-react";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

// 1. تعريف الـ Interfaces
interface NewCourseData {
  nameAr: string;
  nameEn: string;
  code: string;
  descriptionAr: string;
  descriptionEn: string;
}

interface AddCourseDialogQBProps {
  t: (key: string) => string; // دالة الترجمة
  open: boolean;
  setOpen: (open: boolean) => void;
  handleAddCourse?: () => void; // جعلنها اختيارية لأن المنطق موجود داخل المكون
}

const AddCourseDialogQB: React.FC<AddCourseDialogQBProps> = ({
  t,
  open,
  setOpen,
  // handleAddCourse لم نستقبله هنا لأننا عرفنا الدالة بداخل المكون
}) => {
  const [loading, setLoading] = useState(false);
  const [newCourse, setNewCourse] = useState<NewCourseData>({
    nameAr: "",
    nameEn: "",
    code: "",
    descriptionAr: "",
    descriptionEn: "",
  });
  const dispatch = useDispatch<AppDispatch>();

  const handleAddCourse = async () => {
    setLoading(true);
    try {
      await dispatch(createPrivateCourse(newCourse));
      await dispatch(getCourses());
      setOpen(false);
      setNewCourse({
        nameAr: "",
        nameEn: "",
        code: "",
        descriptionAr: "",
        descriptionEn: "",
      });
      toast.success("تم إضافة المقرر بنجاح");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "فشل في إضافة المقرر",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[550px] bg-card-bg dark:bg-gray-800 border border-border-light dark:border-gray-700"
      >
        <DialogHeader className="flex flex-col space-y-2">
          <DialogTitle className="text-dark dark:text-white font-arabic flex items-center gap-3">
            <div className="p-2 rounded-lg bg-btn">
              <Plus className="h-5 w-5 text-white" />
            </div>
            {t("addNewCourse")}
          </DialogTitle>
          <DialogDescription className="text-text-secondary dark:text-gray-300 font-arabic">
            <TextMuted>{t("addCourseDescription")}</TextMuted>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="newNameAr"
                className="text-dark dark:text-gray-300 font-arabic flex items-center gap-2"
              >
                <FileText className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {t("addCourseARName")}
              </Label>
              <Input
                id="newNameAr"
                value={newCourse.nameAr}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, nameAr: e.target.value })
                }
                placeholder={t("addCourseARName")}
                className="font-arabic text-right border border-border-light dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="newNameEn"
                className="text-dark dark:text-gray-300 font-arabic flex items-center gap-2"
              >
                <Globe className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {t("addCourseENName")}
              </Label>
              <Input
                id="newNameEn"
                value={newCourse.nameEn}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, nameEn: e.target.value })
                }
                placeholder={t("addCourseENName")}
                className="border border-border-light dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="newCode"
              className="text-dark dark:text-gray-300 font-arabic flex items-center gap-2"
            >
              <Hash className="h-4 w-4 text-sec" strokeWidth={2.5} />
              {t("addCourseCode")}
            </Label>
            <Input
              id="newCode"
              value={newCourse.code}
              onChange={(e) =>
                setNewCourse({ ...newCourse, code: e.target.value })
              }
              placeholder={t("addCourseCode")}
              className="font-mono border border-border-light dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="newDescAr"
                className="text-dark dark:text-gray-300 font-arabic flex items-center gap-2"
              >
                <FileText className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {t("addCourseARDescription")}
              </Label>
              <Textarea
                id="newDescAr"
                value={newCourse.descriptionAr}
                onChange={(e) =>
                  setNewCourse({
                    ...newCourse,
                    descriptionAr: e.target.value,
                  })
                }
                placeholder={t("addCourseARDescription")}
                className="min-h-20 font-arabic text-right border border-border-light dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="newDescEn"
                className="text-dark dark:text-gray-300 font-arabic flex items-center gap-2"
              >
                <Globe className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {t("addCourseENDescription")}
              </Label>
              <Textarea
                id="newDescEn"
                value={newCourse.descriptionEn}
                onChange={(e) =>
                  setNewCourse({
                    ...newCourse,
                    descriptionEn: e.target.value,
                  })
                }
                placeholder={t("addCourseENDescription")}
                className="min-h-20 border border-border-light dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

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
            onClick={handleAddCourse}
            disabled={
              !newCourse.nameAr.trim() ||
              !newCourse.nameEn.trim() ||
              !newCourse.code.trim() ||
              loading
            }
            className="bg-btn hover:opacity-80 text-white font-arabic"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جاري المعالجة...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 ml-2" />
                {t("addCourse")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCourseDialogQB;
