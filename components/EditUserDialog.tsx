"use client";
import React from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { updateUser } from "@/store/user";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { Edit } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any | null; // your user type
  onSuccess?: () => void;
}
interface CreateUserFormData {
  nameAr: string;
  fatherNameAr: string;
  surnameAr: string;
  nameEn: string;
  fatherNameEn: string;
  surnameEn: string;
  gender: number;
  userName: string;
  password: string;
  email: string;
  mobile: string;
  address: string;
}
const EditUserDialog = ({
  open,
  onOpenChange,
  user,
  onSuccess,
}: EditUserDialogProps) => {
  const initialFormState = React.useMemo<CreateUserFormData>(
    () => ({
      nameAr: "",
      fatherNameAr: "",
      surnameAr: "",
      nameEn: "",
      fatherNameEn: "",
      surnameEn: "",
      gender: 0,
      userName: "",
      password: "",
      email: "",
      mobile: "",
      address: "",
    }),
    [],
  );

  const dispatch = useDispatch<AppDispatch>();
  const t = useTranslations("usersManagement");
  console.log(user);
  const [formData, setFormData] = useState(initialFormState);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        ...initialFormState,
        ...user,
        password: "", // never prefill password
      });
    }
  }, [user, initialFormState]);

  const resetForm = () => setFormData(initialFormState);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (
    field: keyof CreateUserFormData,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "gender" ? Number(value) : value,
    }));
  };

  const handleUpdateUser = async () => {
    setIsUpdating(true);

    try {
      const res = await dispatch(
        updateUser({
          id: user.id,
          user: formData,
        }),
      ).unwrap();

      toast.success(res.message || "User updated successfully");

      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error?.message : "Failed to update user",
      );
    } finally {
      setIsUpdating(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] rounded-2xl border-0 shadow-2xl bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 rounded-lg bg-linear-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30">
              <Edit className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            Edit User
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Update user information. Leave password empty to keep current
            password.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Arabic Name Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {t("createDialog.arabicNameSection")}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-3">
                <Label
                  htmlFor="edit-nameAr"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  {t("createDialog.nameAr")} *
                </Label>
                <Input
                  id="edit-nameAr"
                  name="nameAr"
                  value={formData.nameAr}
                  onChange={handleInputChange}
                  placeholder={t("createDialog.nameArPlaceholder")}
                  className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="edit-fatherNameAr"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  {t("createDialog.fatherNameAr")}
                </Label>
                <Input
                  id="edit-fatherNameAr"
                  name="fatherNameAr"
                  value={formData.fatherNameAr}
                  onChange={handleInputChange}
                  placeholder={t("createDialog.fatherNameArPlaceholder")}
                  className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="edit-surnameAr"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  {t("createDialog.surnameAr")}
                </Label>
                <Input
                  id="edit-surnameAr"
                  name="surnameAr"
                  value={formData.surnameAr}
                  onChange={handleInputChange}
                  placeholder={t("createDialog.surnameArPlaceholder")}
                  className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* English Name Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {t("createDialog.englishNameSection")}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-3">
                <Label
                  htmlFor="edit-nameEn"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  {t("createDialog.nameEn")} *
                </Label>
                <Input
                  id="edit-nameEn"
                  name="nameEn"
                  value={formData.nameEn}
                  onChange={handleInputChange}
                  placeholder={t("createDialog.nameEnPlaceholder")}
                  className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="edit-fatherNameEn"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  {t("createDialog.fatherNameEn")}
                </Label>
                <Input
                  id="edit-fatherNameEn"
                  name="fatherNameEn"
                  value={formData.fatherNameEn}
                  onChange={handleInputChange}
                  placeholder={t("createDialog.fatherNameEnPlaceholder")}
                  className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="edit-surnameEn"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  {t("createDialog.surnameEn")}
                </Label>
                <Input
                  id="edit-surnameEn"
                  name="surnameEn"
                  value={formData.surnameEn}
                  onChange={handleInputChange}
                  placeholder={t("createDialog.surnameEnPlaceholder")}
                  className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label
                htmlFor="edit-userName"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                {t("createDialog.userName")} *
              </Label>
              <Input
                id="edit-userName"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                placeholder={t("createDialog.userNamePlaceholder")}
                className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-3">
              <Label
                htmlFor="edit-password"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                {t("createDialog.password")}
              </Label>
              <Input
                id="edit-password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Leave blank to keep current password"
                className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-3">
              <Label
                htmlFor="edit-gender"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                {t("createDialog.gender")}
              </Label>
              <Select
                value={formData.gender.toString()}
                onValueChange={(value) => handleSelectChange("gender", value)}
              >
                <SelectTrigger className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
                  <SelectValue
                    placeholder={t("createDialog.genderPlaceholder")}
                  />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                  <SelectItem value="0">{t("common.male")}</SelectItem>
                  <SelectItem value="1">{t("common.female")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label
                htmlFor="edit-email"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                {t("createDialog.email")} *
              </Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t("createDialog.emailPlaceholder")}
                className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-3">
              <Label
                htmlFor="edit-mobile"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                {t("createDialog.mobile")}
              </Label>
              <Input
                id="edit-mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                placeholder={t("createDialog.mobilePlaceholder")}
                className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-3">
            <Label
              htmlFor="edit-address"
              className="text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              {t("createDialog.address")}
            </Label>
            <Input
              id="edit-address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder={t("createDialog.addressPlaceholder")}
              className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20"
            />
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
            disabled={isUpdating}
            className="flex-1 rounded-xl border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleUpdateUser}
            disabled={isUpdating}
            className="flex-1 rounded-xl bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
          >
            {isUpdating ? "Updating..." : "Update User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
