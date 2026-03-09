import React from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { useParams, useRouter } from "next/navigation"; // لاستخدام التوجيه بعد الحذف
import { toast } from "sonner";
import DeleteDialog from "@/components/custom/DeleteDialog";
import { deleteUniversity, fetchUniversities } from "@/store/admin"; // تأكد من صحة مسار الـ actions

interface DropUniversityDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  description?: string;
  selectedUniversity?: {
    id: number;
    nameAr: string;
    // يمكن إضافة حقول أخرى إذا لزم الأمر
  } | null;
  setSelectedUniversity: (uni: null) => void;
  t: (key: string, params?: Record<string, any>) => string; // دالة الترجمة الخاصة بالصفحة
}

const DropUniversityDialog: React.FC<DropUniversityDialogProps> = ({
  open,
  setOpen,
  selectedUniversity,
  setSelectedUniversity,
  t,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { locale } = useParams();
  const handleDelete = async () => {
    if (!selectedUniversity) return;

    try {
      const res = await dispatch(
        deleteUniversity(selectedUniversity.id),
      ).unwrap();

      // التحقق من الأخطاء التي تأتي في الاستجابة (حسب منطق مشروعك)
      if (!res.success && Array.isArray(res.errors) && res.errors.length > 0) {
        toast.error(res.errors.join(" • "));
        throw new Error(res.errors.join(" • ")); // رمي الخطأ لإيقاف الـ loading في DeleteDialog
      }

      toast.success(res.message || t("messages.deleteSuccess"));

      // تحديث القائمة (اختياري، لأننا سنقوم بالتوجيه)
      await dispatch(fetchUniversities());

      // إغلاق الـ Dialog وتصفير التحديد
      setOpen(false);
      setSelectedUniversity(null);

      // التوجيه لصفحة إدارة الجامعات
      router.push(`/${locale}/universities_management`);
    } catch (error: unknown) {
      // تجنب تكرار رسالة الخطأ إذا كانت قد عولجت أعلاه
      if (error instanceof Error && !error.message.includes("•")) {
        toast.error(error.message || "فشل في حذف الجامعة");
      } else if (!(error instanceof Error)) {
        toast.error("فشل في حذف الجامعة");
      }
      throw error; // رمي الخطأ ليعالجه DeleteDialog
    }
  };

  return (
    <DeleteDialog
      open={open}
      setOpen={setOpen}
      title={t("deleteDialog.title")} // تأكد من وجود هذا المفتاح في ملف الترجمة
      itemName={selectedUniversity?.nameAr || ""}
      warningMessage={t("deleteDialog.description", {
        universityName: selectedUniversity?.nameAr || "",
      })}
      onConfirm={handleDelete}
    />
  );
};

export default DropUniversityDialog;
