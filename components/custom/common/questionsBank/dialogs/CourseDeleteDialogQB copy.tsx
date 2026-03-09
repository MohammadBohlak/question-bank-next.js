// import React, { useState } from "react";
// import { useTranslations } from "next-intl";
// import { useDispatch } from "react-redux";
// import DeleteDialog from "@/components/custom/DeleteDialog";
// import { Button } from "@/components/ui/button";
// import { deletePrivateCourse, getCourses } from "@/store/supervisor";
// import { toast } from "sonner";

// const CourseDeleteDialogQB = ({
//   selectedCourse,
//   t,
//   setOpen,
//   open,
//   setSelectedCourse,
// }) => {
//   const dispatch = useDispatch();

//   const confirmDelete = async () => {
//     try {
//       const res = await dispatch(
//         deletePrivateCourse(selectedCourse!.id),
//       ).unwrap();
//       toast.success(res.message);
//       await dispatch(getCourses());
//       setOpen(false);
//       //   setSelectedCourse(null);
//     } catch (error: unknown) {
//       toast.error(error instanceof Error ? error.message : "فشل في حذف المقرر");
//     }
//   };

//   return (
//     <>
//       {/* استخدام المكون */}
//       <DeleteDialog
//         open={open}
//         setOpen={setOpen}
//         title={t("deleteCourse")}
//         itemName={selectedCourse?.nameAr || ""}
//         warningMessage={t("deleteWarning", {
//           count: selectedCourse?.courseBanksCount || 0,
//         })}
//         onConfirm={confirmDelete}
//         t={t} // تمرير دالة الترجمة
//       />
//     </>
//   );
// };

// export default CourseDeleteDialogQB;
