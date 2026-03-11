import Background from "@/components/custom/common/Background";
import MainTitle from "@/components/custom/common/texts/MainTitle";
import { Button } from "@/components/ui/button";
import { ChevronLeft, UserPlus, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

interface HeaderUMProps {
  setIsCreateDialogOpen: (arg: boolean) => void;
}
const HeaderUM = ({ setIsCreateDialogOpen }: HeaderUMProps) => {
  const router = useRouter();
  const t = useTranslations("usersManagement");

  return (
    <Background isHeader>
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="rounded-xl border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-linear-to-br from-prim to-sec shadow-md">
                <Users className="h-6 w-6 text-white" />
              </div>
              <MainTitle>{t("title")}</MainTitle>
            </div>
          </div>
        </div>

        <Button
          className="self-end gap-2 rounded-xl bg-btn text-white shadow-lg hover:opacity-80 hover:shadow-xl transition-all"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <UserPlus className="h-5 w-5" />
          {t("actions.createUser")}
        </Button>
      </div>
    </Background>
  );
};

export default HeaderUM;
