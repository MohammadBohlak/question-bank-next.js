import { useState } from "react";
import { createNewUser } from "@/store/user";
import { Label } from "@/components/ui/label";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Input } from "../../../../ui/input";
import { Button } from "../../../../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";
import {
  User,
  Languages,
  Globe,
  AtSign,
  Lock,
  UserCircle,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import TextMuted from "../../../common/texts/TextMuted";
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
interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CreateUserDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: CreateUserDialogProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const t = useTranslations("usersManagement");
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState<CreateUserFormData>({
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
  });
  const handleSelectChange = (
    field: keyof CreateUserFormData,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "gender" ? Number(value) : value,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
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
    });
  };

  const handleCreateUser = async () => {
    // Validation
    if (
      !formData.nameAr ||
      !formData.nameEn ||
      !formData.userName ||
      !formData.password ||
      !formData.email
    ) {
      toast.error(t("form.validation.requiredFields"));
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error(t("form.validation.invalidEmail"));
      return;
    }

    setIsCreating(true);
    try {
      const res = await dispatch(createNewUser(formData)).unwrap();

      if (!res.success && Array.isArray(res.errors) && res.errors.length > 0) {
        toast.error(res.errors.join(" • "));
        return;
      }

      toast.success(res.message || t("messages.createSuccess"));
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : t("errors.createFailed"),
      );
    } finally {
      setIsCreating(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="h-[90%] overflow-auto custom-scrollbar sm:max-w-[650px] rounded-2xl border-0 shadow-2xl bg-white dark:bg-gray-800"
      >
        <DialogHeader className="flex flex-col space-y-2">
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 rounded-lg bg-btn">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            {t("createDialog.title")}
          </DialogTitle>
          <DialogDescription>
            <TextMuted>{t("createDialog.description")}</TextMuted>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Arabic Name Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Languages className="h-5 w-5 text-sec" strokeWidth={2.5} />
              {t("createDialog.arabicNameSection")}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-3">
                <Label
                  htmlFor="nameAr"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <User className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("createDialog.nameAr")} *
                </Label>
                <Input
                  id="nameAr"
                  name="nameAr"
                  value={formData.nameAr}
                  onChange={handleInputChange}
                  placeholder={t("createDialog.nameArPlaceholder")}
                  className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="fatherNameAr"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <User className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("createDialog.fatherNameAr")}
                </Label>
                <Input
                  id="fatherNameAr"
                  name="fatherNameAr"
                  value={formData.fatherNameAr}
                  onChange={handleInputChange}
                  placeholder={t("createDialog.fatherNameArPlaceholder")}
                  className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="surnameAr"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <User className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("createDialog.surnameAr")}
                </Label>
                <Input
                  id="surnameAr"
                  name="surnameAr"
                  value={formData.surnameAr}
                  onChange={handleInputChange}
                  placeholder={t("createDialog.surnameArPlaceholder")}
                  className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* English Name Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Globe className="h-5 w-5 text-sec" strokeWidth={2.5} />
              {t("createDialog.englishNameSection")}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-3">
                <Label
                  htmlFor="nameEn"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <User className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("createDialog.nameEn")} *
                </Label>
                <Input
                  id="nameEn"
                  name="nameEn"
                  value={formData.nameEn}
                  onChange={handleInputChange}
                  placeholder={t("createDialog.nameEnPlaceholder")}
                  className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="fatherNameEn"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <User className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("createDialog.fatherNameEn")}
                </Label>
                <Input
                  id="fatherNameEn"
                  name="fatherNameEn"
                  value={formData.fatherNameEn}
                  onChange={handleInputChange}
                  placeholder={t("createDialog.fatherNameEnPlaceholder")}
                  className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="surnameEn"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <User className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("createDialog.surnameEn")}
                </Label>
                <Input
                  id="surnameEn"
                  name="surnameEn"
                  value={formData.surnameEn}
                  onChange={handleInputChange}
                  placeholder={t("createDialog.surnameEnPlaceholder")}
                  className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label
                htmlFor="userName"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <AtSign className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {t("createDialog.userName")} *
              </Label>
              <Input
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                placeholder={t("createDialog.userNamePlaceholder")}
                className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-3">
              <Label
                htmlFor="password"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <Lock className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {t("createDialog.password")} *
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={t("createDialog.passwordPlaceholder")}
                className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-3">
              <Label
                htmlFor="gender"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <UserCircle className="h-4 w-4 text-sec" strokeWidth={2.5} />
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
                htmlFor="email"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <Mail className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {t("createDialog.email")} *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t("createDialog.emailPlaceholder")}
                className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-3">
              <Label
                htmlFor="mobile"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <Phone className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {t("createDialog.mobile")}
              </Label>
              <Input
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                placeholder={t("createDialog.mobilePlaceholder")}
                className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-3">
            <Label
              htmlFor="address"
              className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
            >
              <MapPin className="h-4 w-4 text-sec" strokeWidth={2.5} />
              {t("createDialog.address")}
            </Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder={t("createDialog.addressPlaceholder")}
              className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
            disabled={isCreating}
            className="flex-1 rounded-xl border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 close-hover"
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleCreateUser}
            disabled={isCreating}
            className="flex-1 rounded-xl bg-btn hover:opacity-80 text-white shadow-lg"
          >
            {isCreating ? t("common.creating") : t("createDialog.createButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
