"use client";
import React from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { updateUser } from "@/store/user";
import { toast } from "sonner";
import { Input } from "../../../../ui/input";
import {
  AtSign,
  Edit,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
  UserCheck,
  UserRound,
  Users,
} from "lucide-react";
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
import { useParams } from "next/navigation";
import TextMuted from "../../../common/texts/TextMuted";
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
  const { locale } = useParams();
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
      <DialogContent
        showCloseButton={false}
        dir={locale == "ar" ? "rtl" : "ltr"}
        className="max-h-[90%] overflow-auto custom-scrollbar sm:max-w-[650px] rounded-2xl border-0 shadow-2xl bg-white dark:bg-gray-800"
      >
        <DialogHeader>
          <DialogTitle
            className={`
          text-xl font-bold text-gray-900 dark:text-white 
          flex items-center gap-3
          ${locale === "ar" ? "" : ""}
        `}
          >
            <div className="text-start p-2 rounded-lg bg-btn">
              <Edit className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            {locale === "ar" ? "تعديل المستخدم" : "Edit User"}
          </DialogTitle>

          <DialogDescription>
            <TextMuted>
              {locale === "ar"
                ? "قم بتحديث معلومات المستخدم. اترك حقل كلمة المرور فارغاً للاحتفاظ بالقيمة الحالية."
                : "Update user information. Leave password empty to keep current password."}
            </TextMuted>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Arabic Name Section */}
          <div className="space-y-4">
            <h3
              className={`
            text-lg font-semibold text-gray-700 dark:text-gray-300
            ${locale === "ar" ? "text-right" : "text-left"}
          `}
            >
              {locale === "ar" ? "الاسم باللغة العربية" : "Arabic Name Section"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-3">
                <Label
                  htmlFor="edit-nameAr"
                  className={`
                  text-sm font-semibold text-gray-700 dark:text-gray-300
                flex items-center gap-2
                
              `}
                >
                  <User className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {locale === "ar" ? "الاسم *" : "Name *"}
                </Label>
                <Input
                  id="edit-nameAr"
                  name="nameAr"
                  value={formData.nameAr}
                  onChange={handleInputChange}
                  placeholder={
                    locale === "ar" ? "أدخل الاسم" : "Enter first name"
                  }
                  className={`
                rounded-xl border-gray-300 dark:border-gray-700
                bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white
                
                ${locale === "ar" ? "text-right" : "text-left"}
              `}
                />
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="edit-fatherNameAr"
                  className={`
                text-sm font-semibold text-gray-700 dark:text-gray-300
                flex items-center gap-2
                
              `}
                >
                  <Users className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {locale === "ar" ? "اسم الأب" : "Father's Name"}
                </Label>
                <Input
                  id="edit-fatherNameAr"
                  name="fatherNameAr"
                  value={formData.fatherNameAr}
                  onChange={handleInputChange}
                  placeholder={
                    locale === "ar" ? "أدخل اسم الأب" : "Enter father's name"
                  }
                  className={`
                rounded-xl border-gray-300 dark:border-gray-700
                bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white
                
                ${locale === "ar" ? "text-right" : "text-left"}
              `}
                />
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="edit-surnameAr"
                  className={`
                text-sm font-semibold text-gray-700 dark:text-gray-300
                flex items-center gap-2
                
              `}
                >
                  <UserRound className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {locale === "ar" ? "اللقب / الكنية" : "Surname / Family Name"}
                </Label>
                <Input
                  id="edit-surnameAr"
                  name="surnameAr"
                  value={formData.surnameAr}
                  onChange={handleInputChange}
                  placeholder={locale === "ar" ? "أدخل اللقب" : "Enter surname"}
                  className={`
                rounded-xl border-gray-300 dark:border-gray-700
                bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white
                
                ${locale === "ar" ? "text-right" : "text-left"}
              `}
                />
              </div>
            </div>
          </div>

          {/* English Name Section */}
          <div className="space-y-4">
            <h3
              className={`
            text-lg font-semibold text-gray-700 dark:text-gray-300
            ${locale === "ar" ? "text-right" : "text-left"}
          `}
            >
              {locale === "ar"
                ? "الاسم باللغة الإنجليزية"
                : "English Name Section"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-3">
                <Label
                  htmlFor="edit-nameEn"
                  className={`
                text-sm font-semibold text-gray-700 dark:text-gray-300
                flex items-center gap-2
                
              `}
                >
                  <User className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {locale === "ar" ? "الاسم *" : "Name *"}
                </Label>
                <Input
                  id="edit-nameEn"
                  name="nameEn"
                  value={formData.nameEn}
                  onChange={handleInputChange}
                  placeholder={
                    locale === "ar" ? "أدخل الاسم" : "Enter first name"
                  }
                  className={`
                rounded-xl border-gray-300 dark:border-gray-700
                bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white
                
                ${locale === "ar" ? "text-right" : "text-left"}
              `}
                />
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="edit-fatherNameEn"
                  className={`
                text-sm font-semibold text-gray-700 dark:text-gray-300
                flex items-center gap-2
                
              `}
                >
                  <Users className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {locale === "ar" ? "اسم الأب" : "Father's Name"}
                </Label>
                <Input
                  id="edit-fatherNameEn"
                  name="fatherNameEn"
                  value={formData.fatherNameEn}
                  onChange={handleInputChange}
                  placeholder={
                    locale === "ar" ? "أدخل اسم الأب" : "Enter father's name"
                  }
                  className={`
                rounded-xl border-gray-300 dark:border-gray-700
                bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white
                
                ${locale === "ar" ? "text-right" : "text-left"}
              `}
                />
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="edit-surnameEn"
                  className={`
                text-sm font-semibold text-gray-700 dark:text-gray-300
                flex items-center gap-2
                
              `}
                >
                  <UserRound className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {locale === "ar" ? "اللقب / الكنية" : "Surname / Family Name"}
                </Label>
                <Input
                  id="edit-surnameEn"
                  name="surnameEn"
                  value={formData.surnameEn}
                  onChange={handleInputChange}
                  placeholder={locale === "ar" ? "أدخل اللقب" : "Enter surname"}
                  className={`
                rounded-xl border-gray-300 dark:border-gray-700
                bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white
                
                ${locale === "ar" ? "text-right" : "text-left"}
              `}
                />
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label
                htmlFor="edit-userName"
                className={`
              text-sm font-semibold text-gray-700 dark:text-gray-300
              flex items-center gap-2
              
            `}
              >
                <AtSign className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {locale === "ar" ? "اسم المستخدم *" : "Username *"}
              </Label>
              <Input
                id="edit-userName"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                placeholder={
                  locale === "ar" ? "أدخل اسم المستخدم" : "Enter username"
                }
                className={`
              rounded-xl border-gray-300 dark:border-gray-700
              bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white
              focus:border-blue-500 dark:focus:border-blue-500
              focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20
              ${locale === "ar" ? "text-right" : "text-left"}
            `}
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="edit-password"
                className={`
              text-sm font-semibold text-gray-700 dark:text-gray-300
              flex items-center gap-2
              
            `}
              >
                <Lock className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {locale === "ar" ? "كلمة المرور" : "Password"}
              </Label>
              <Input
                id="edit-password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={
                  locale === "ar"
                    ? "اترك فارغاً للاحتفاظ بالكلمة الحالية"
                    : "Leave blank to keep current password"
                }
                className={`
              rounded-xl border-gray-300 dark:border-gray-700
              bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white
              focus:border-blue-500 dark:focus:border-blue-500
              focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20
              ${locale === "ar" ? "text-right" : "text-left"}
            `}
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <Label
                htmlFor="edit-gender"
                className={`
              text-sm font-semibold text-gray-700 dark:text-gray-300
              flex items-center gap-2
              
            `}
              >
                <UserCheck className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {locale === "ar" ? "الجنس" : "Gender"}
              </Label>
              <Select
                value={formData.gender.toString()}
                onValueChange={(value) => handleSelectChange("gender", value)}
              >
                <SelectTrigger className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
                  <SelectValue
                    placeholder={
                      locale === "ar" ? "اختر الجنس" : "Select gender"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                  <SelectItem value="0">
                    {locale === "ar" ? "ذكر" : "Male"}
                  </SelectItem>
                  <SelectItem value="1">
                    {locale === "ar" ? "أنثى" : "Female"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="edit-email"
                className={`
              text-sm font-semibold text-gray-700 dark:text-gray-300
              flex items-center gap-2
              
            `}
              >
                <Mail className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {locale === "ar" ? "البريد الإلكتروني *" : "Email *"}
              </Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={
                  locale === "ar" ? "أدخل البريد الإلكتروني" : "Enter email"
                }
                className={`
              rounded-xl border-gray-300 dark:border-gray-700
              bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white
              focus:border-blue-500 dark:focus:border-blue-500
              focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20
              ${locale === "ar" ? "text-right" : "text-left"}
            `}
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="edit-mobile"
                className={`
              text-sm font-semibold text-gray-700 dark:text-gray-300
              flex items-center gap-2
              
            `}
              >
                <Phone className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {locale === "ar" ? "رقم الجوال" : "Mobile Number"}
              </Label>
              <Input
                id="edit-mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                placeholder={
                  locale === "ar" ? "أدخل رقم الجوال" : "Enter mobile number"
                }
                className={`
              rounded-xl border-gray-300 dark:border-gray-700
              bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white
              focus:border-blue-500 dark:focus:border-blue-500
              focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20
              ${locale === "ar" ? "text-right" : "text-left"}
            `}
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-3">
            <Label
              htmlFor="edit-address"
              className={`
            text-sm font-semibold text-gray-700 dark:text-gray-300
            flex items-center gap-2
            
          `}
            >
              <MapPin className="h-4 w-4 text-sec" strokeWidth={2.5} />
              {locale === "ar" ? "العنوان" : "Address"}
            </Label>
            <Input
              id="edit-address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder={locale === "ar" ? "أدخل العنوان" : "Enter address"}
              className={`
            rounded-xl border-gray-300 dark:border-gray-700
            bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white
            focus:border-blue-500 dark:focus:border-blue-500
            focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20
            ${locale === "ar" ? "text-right" : "text-left"}
          `}
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
            className="flex-1 rounded-xl border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 close-hover"
          >
            {locale === "ar" ? "إلغاء" : "Cancel"}
          </Button>
          <Button
            onClick={handleUpdateUser}
            disabled={isUpdating}
            className="flex-1 rounded-xl bg-btn hover:opacity-80 text-white shadow-lg"
          >
            {isUpdating
              ? locale === "ar"
                ? "جاري التحديث..."
                : "Updating..."
              : locale === "ar"
                ? "تحديث المستخدم"
                : "Update User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
