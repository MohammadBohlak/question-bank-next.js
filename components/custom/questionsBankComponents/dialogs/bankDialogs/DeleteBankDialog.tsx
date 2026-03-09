import React from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { toast } from "sonner";
import DeleteDialog from "@/components/custom/DeleteDialog";
import { deleteBank } from "@/store/admin";
import { getCourseDetails } from "@/store/supervisor";
import { useParams } from "next/navigation";

interface BankDeleteDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedBank: {
    id: number;
    code: string;
    questionsCount?: number;
  } | null;
  // onConfirmDelete: () => void | Promise<void>; // دالة الحذف التي يتم تمريرها من الأب
  t: (key: string, params?: Record<string, any>) => string;
  setSelectedBank: (bank: null) => void;
}

const DeleteBankDialog: React.FC<BankDeleteDialogProps> = ({
  open,
  setOpen,
  selectedBank,
  setSelectedBank,
  // onConfirmDelete,
  t,
}) => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const handleDelete = async () => {
    if (!selectedBank) return;

    try {
      const res = await dispatch(deleteBank(selectedBank!.id)).unwrap();
      toast.success(res.message);
      await dispatch(getCourseDetails({ id: parseInt(id) }));
      setOpen(false);
      setSelectedBank(null);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "فشل في حذف البنك");
      throw error; // نرمي الخطأ ليعالجه DeleteDialog (ليغلق الـ loading)
    }
  };
  return (
    <DeleteDialog
      open={open}
      setOpen={setOpen}
      title={t("deleteBankDialog.title")}
      warningMessage={t("deleteBankDialog.warning", {
        count: selectedBank?.questionsCount || 0,
      })}
      onConfirm={handleDelete}
      description={t("deleteBankDialog.description", {
        code: selectedBank?.code || "",
      })}
    />
  );
};

export default DeleteBankDialog;
