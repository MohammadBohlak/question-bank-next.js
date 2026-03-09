import React from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { toast } from "sonner";
import { deleteUniversity, fetchUniversities } from "@/store/admin";
import DeleteDialog from "../../DeleteDialog";

interface DeleteUniversityDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedUniversity: {
    id: number;
    nameAr: string;
  } | null;
  setSelectedUniversity: (uni: null) => void;
  t: (key: string, params?: Record<string, any>) => string;
}

const DeleteUniversityDialog: React.FC<DeleteUniversityDialogProps> = ({
  open,
  setOpen,
  selectedUniversity,
  setSelectedUniversity,
  t,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleDelete = async () => {
    if (!selectedUniversity) return;

    try {
      const res = await dispatch(
        deleteUniversity(selectedUniversity.id),
      ).unwrap();

      // التحقق من وجود أخطاء في الاستجابة (كما في الكود الأصلي)
      if (!res.success && Array.isArray(res.errors) && res.errors.length > 0) {
        toast.error(res.errors.join(" • "));
        throw new Error(res.errors.join(" • ")); // رمي الخطأ لإيقاف الـ loading
      }

      toast.success(res.message || t("messages.deleteSuccess"));
      await dispatch(fetchUniversities()); // إعادة تحميل الجامعات
      setOpen(false);
      setSelectedUniversity(null);
    } catch (error: unknown) {
      // تجنب تكرار رسالة الخطأ إذا تمت معالجتها أعلاه
      if (error instanceof Error && !error.message.includes("•")) {
        toast.error(error.message || "فشل الحذف");
      } else if (!(error instanceof Error)) {
        toast.error("فشل الحذف");
      }
      throw error; // نرمي الخطأ ليعالجه DeleteDialog (ليغلق الـ loading)
    }
  };

  return (
    <DeleteDialog
      open={open}
      setOpen={setOpen}
      title={t("deleteConfirmation.title")} // تأكد من وجود هذا المفتاح في ملف الترجمة
      itemName={selectedUniversity?.nameAr || ""}
      warningMessage={t("deleteConfirmation.message")} // استخدام رسالة التحذير
      onConfirm={handleDelete}
    />
  );
};

export default DeleteUniversityDialog;
