import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import TextMuted from "@/components/custom/common/texts/TextMuted";
import { useTranslations } from "next-intl";

interface DeleteDialogProps {
  // التحكم في فتح وإغلاق الديالوج
  open: boolean;
  setOpen: (open: boolean) => void;

  // النصوص
  title?: string; // عنوان الديالوج (مثلاً: حذف المقرر)
  description?: string;
  itemName?: string; // اسم العنصر الذي سيظهر في رسالة التأكيد
  warningMessage?: string; // رسالة تحذيرية اختيارية (مثل: سيتم حذف 5 بنوك)

  // الأحداث
  onConfirm: () => void | Promise<void>; // دالة الحذف
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  open,
  setOpen,
  title,
  description,
  warningMessage,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);
  const t = useTranslations("deleteDialog");
  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
    } catch (error) {
      console.error("Delete failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[425px] bg-card-bg dark:bg-gray-800 border border-error dark:border-red-700"
      >
        <DialogHeader>
          <DialogTitle className="text-dark dark:text-white font-arabic">
            {title ? title : ""}
          </DialogTitle>
          <DialogDescription>
            <TextMuted>{description}</TextMuted>
          </DialogDescription>
        </DialogHeader>

        {/* عرض التحذير فقط إذا تم تمرير رسالة تحذيرية */}
        {warningMessage && (
          <div className="flex items-center gap-2 p-3 bg-error/10 dark:bg-red-900/30 rounded-lg">
            <Trash2 className="h-4 w-4 text-error dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-error dark:text-red-400 font-arabic">
              {warningMessage}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-border-light dark:border-gray-700 text-dark dark:text-gray-300 close-hover font-arabic"
            disabled={loading}
          >
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            className="bg-error hover:bg-error/80 dark:bg-red-700 dark:hover:bg-red-800 text-text-light font-arabic"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                {t("deleting")}
              </>
            ) : (
              t("del") || "حذف"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDialog;
