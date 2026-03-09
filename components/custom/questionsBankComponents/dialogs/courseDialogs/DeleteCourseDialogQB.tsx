import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useDispatch } from "react-redux";
import DeleteDialog from "@/components/custom/DeleteDialog";
import { deletePrivateCourse, getCourses } from "@/store/supervisor";
import { AppDispatch } from "@/store/store";
import { toast } from "sonner";

interface DeleteCourseDialogQBProps {
  selectedCourse: {
    id: number;
    nameAr: string;
    courseBanksCount?: number;
  } | null;
  t: (key: string, params?: Record<string, any>) => string;
  open: boolean;
  setOpen: (open: boolean) => void;
  setSelectedCourse: (course: null) => void;
}

const DeleteCourseDialogQB: React.FC<DeleteCourseDialogQBProps> = ({
  t,
  open,
  setOpen,
  selectedCourse,
  setSelectedCourse,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const confirmDelete = async () => {
    if (!selectedCourse) return;

    try {
      const res = await dispatch(
        deletePrivateCourse(selectedCourse.id),
      ).unwrap();
      toast.success(res.message || "تم الحذف بنجاح");
      await dispatch(getCourses());
      setOpen(false);
      setSelectedCourse(null);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "فشل في حذف المقرر");
    }
  };

  return (
    <DeleteDialog
      open={open} // تم تعديل الاسم ليطابق Interface المكون السابق
      setOpen={setOpen} // تم تعديل الاسم
      title={t("deleteCourse")}
      warningMessage={t("deleteWarning", {
        count: selectedCourse?.courseBanksCount || 0,
      })}
      onConfirm={confirmDelete}
      description={t("deleteConfirmation", {
        name: selectedCourse?.nameAr || "",
      })}
    />
  );
};

export default DeleteCourseDialogQB;
