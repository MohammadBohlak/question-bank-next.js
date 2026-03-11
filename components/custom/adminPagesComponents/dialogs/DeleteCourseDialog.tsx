import React from "react";
import { useDispatch } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import DeleteDialog from "@/components/custom/common/DeleteDialog";
import { deleteCourse } from "@/store/admin"; // تأكد من صحة المسار
import { AppDispatch } from "@/store/store";

interface DeleteCourseDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  course: {
    id: number;
    nameAr: string;
    courseBanksCount: number;
    // أضف questionsCount إذا كانت متاحة في كائن course، أو سنمررها كـ prop
  } | null;
  t: (key: string, params?: Record<string, any>) => string;
  totalQuestions?: number; // تمرير مجموع الأسئلة إذا لم يكن موجوداً في كائن course
}

const DeleteCourseDialog: React.FC<DeleteCourseDialogProps> = ({
  open,
  setOpen,
  course,
  t,
  totalQuestions = 0, // قيمة افتراضية
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();

  const handleDelete = async () => {
    if (!course) return;

    try {
      const res = await dispatch(deleteCourse(course.id)).unwrap();

      // التحقق من الأخطاء (حسب نمط الـ API الخاص بك)
      if (!res.success && Array.isArray(res.errors) && res.errors.length > 0) {
        toast.error(res.errors.join(" • "));
        throw new Error(res.errors.join(" • "));
      }

      toast.success(res.message || t("messages.courseDeleted"));

      // إغلاق الـ Dialog
      setOpen(false);

      // التوجيه لصفحة الإدارة (العودة للخلف أو صفحة محددة)
      // يمكنك استخدام router.back() أو التوجيه لصفحة معينة كما في الكود الأصلي
      router.push(`/${locale}/universities_management`);
    } catch (error: unknown) {
      if (error instanceof Error && !error.message.includes("•")) {
        toast.error(error.message || t("errors.deleteCourseFailed"));
      } else if (!(error instanceof Error)) {
        toast.error(t("errors.deleteCourseFailed"));
      }
      throw error; // رمي الخطأ لإيقاف الـ loading في DeleteDialog
    }
  };

  // تجهيز رسالة التحذير
  const warningMessage = t("deleteDialog.warning", {
    banks: course?.courseBanksCount || 0,
    questions: totalQuestions,
  });

  return (
    <DeleteDialog
      open={open}
      setOpen={setOpen}
      title={t("deleteDialog.title")}
      description={t("deleteDialog.description", {
        courseName: course?.nameAr || "",
      })}
      warningMessage={warningMessage}
      onConfirm={handleDelete}
    />
  );
};

export default DeleteCourseDialog;
