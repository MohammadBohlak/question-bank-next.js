// components/custom/programs/DeleteProgramDialog.tsx
import React from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteProgram, getProgramDetails } from "@/store/admin"; // تأكد من المسار الصحيح
import { AppDispatch } from "@/store/store";
import DeleteDialog from "../../DeleteDialog";

interface DeleteProgramDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  program: {
    id: number;
    nameAr: string;
  } | null;
  t: (key: string, params?: Record<string, any>) => string;
}

const DeleteProgramDialog: React.FC<DeleteProgramDialogProps> = ({
  open,
  setOpen,
  program,
  t,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const handleDelete = async () => {
    if (!program) return;

    try {
      const res = await dispatch(deleteProgram(program.id)).unwrap();

      if (!res.success && Array.isArray(res.errors) && res.errors.length > 0) {
        toast.error(res.errors.join(" • "));
        throw new Error(res.errors.join(" • "));
      }

      toast.success(res.message || t("messages.deleteSuccess"));

      // إغلاق النافذة والعودة للصفحة السابقة
      setOpen(false);
      router.back();
    } catch (error: unknown) {
      if (error instanceof Error && !error.message.includes("•")) {
        toast.error(error.message || "فشل في حذف البرنامج");
      } else if (!(error instanceof Error)) {
        toast.error("فشل في حذف البرنامج");
      }
      throw error;
    }
  };

  return (
    <DeleteDialog
      open={open}
      setOpen={setOpen}
      title={t("deleteDialog.title")}
      description={t("deleteDialog.description", {
        programName: program?.nameAr || "",
      })}
      onConfirm={handleDelete}
    />
  );
};

export default DeleteProgramDialog;
