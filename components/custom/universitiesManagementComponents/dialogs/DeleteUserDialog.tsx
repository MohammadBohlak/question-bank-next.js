import React from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import DeleteDialog from "@/components/custom/DeleteDialog";
import { AppDispatch } from "@/store/store";
import { deleteUser } from "@/store/user";
import { getAllUsers } from "@/store/admin";
import { Description } from "@radix-ui/react-alert-dialog";
import { useParams } from "next/navigation";

interface UserToDelete {
  id: number;
  name: string; // الاسم الكامل للمستخدم
}

interface DeleteUserDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  // نغير من userId و username إلى مصفوفة مستخدمين لدعم الحذف الجماعي
  users: UserToDelete[];
  t: (key: string, params?: Record<string, any>) => string;
  onSuccess?: () => void;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  open,
  setOpen,
  users,
  t,
  onSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { locale } = useParams();

  // تحديد ما إذا كان الحذف فردياً أم جماعياً
  const isBulk = users.length > 1;
  const count = users.length;

  // تجهيز النصوص بناءً على نوع الحذف
  const title = isBulk
    ? t("deleteDialog.bulkTitle") // تأكد من وجود هذه الترجمة
    : t("deleteDialog.title");

  const sDescription = {
    bulkAr: `أنت على وشك حذف ${count} مستخدمين. هل أنت متأكد؟`,
    sigleAr: `هل أنت متأكد من حذف المستخدم ${users[0]?.name || ""} ؟ لا يمكن التراجع عن هذا الإجراء`,
    bulkEn: `You are about to delete ${count} users. Are you sure?`,
    singleEn: `Are you sure you want to delete user ${users[0]?.name || ""} This action cannot be undone.`,
  };

  const description = isBulk
    ? locale == "ar"
      ? sDescription.bulkAr
      : sDescription.bulkEn
    : locale == "ar"
      ? sDescription.sigleAr
      : sDescription.singleEn;
  // اللي فوق عبارة عن حل مؤقت فقط , الحل الفعلي هوي الحل اللي علقتو بهالسطرين تحت
  //   const description = isBulk
  //     ? t("deleteDialog.bulkDescription", { count })
  //     : t("deleteDialog.description", { name: users[0]?.name || "" });

  const warningMessage = isBulk
    ? t("deleteDialog.bulkWarning")
    : t("deleteDialog.warning");

  const handleDelete = async () => {
    if (users.length === 0) return;

    try {
      if (isBulk) {
        // --- منطق الحذف الجماعي ---
        const deletePromises = users.map((user) =>
          dispatch(deleteUser(user.id)).unwrap(),
        );

        const results = await Promise.allSettled(deletePromises);

        const failedCount = results.filter(
          (r) => r.status === "rejected",
        ).length;
        const successCount = results.filter(
          (r) => r.status === "fulfilled",
        ).length;

        if (failedCount > 0) {
          toast.error(t("messages.bulkDeleteError", { count: failedCount }));
          throw new Error("Bulk delete failed for some items");
        } else {
          toast.success(
            t("messages.bulkDeleteSuccess", { count: successCount }),
          );
        }
      } else {
        // --- منطق الحذف الفردي ---
        const res = await dispatch(deleteUser(users[0].id)).unwrap();

        if (
          !res.success &&
          Array.isArray(res.errors) &&
          res.errors.length > 0
        ) {
          toast.error(res.errors.join(" • "));
          throw new Error(res.errors.join(" • "));
        }
        toast.success(res.message || t("messages.userDeleted"));
      }

      // تحديث القائمة بعد الانتهاء
      await dispatch(getAllUsers());

      if (onSuccess) onSuccess();
      setOpen(false);
    } catch (error: unknown) {
      // رسائل الخطأ تمت معالجتها بالتوست أعلاه
      throw error; // ليعالجه DeleteDialog ويغلق الـ loading
    }
  };

  return (
    <DeleteDialog
      open={open}
      setOpen={setOpen}
      title={title}
      description={description}
      warningMessage={warningMessage}
      onConfirm={handleDelete}
    />
  );
};

export default DeleteUserDialog;
