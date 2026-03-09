import React, { useState } from "react";
import Background from "../Background";
import MainTitle from "../common/texts/MainTitle";
import TextMuted from "../common/texts/TextMuted";
import { Button } from "@/components/ui/button";
import { Book, Loader2, Plus } from "lucide-react";
import AddCourseDialogQB from "../questionsBankComponents/dialogs/courseDialogs/AddCourseDialogQB";

// 1. تعريف الـ Interface للـ Props
interface HeaderQuestionsBankProps {
  t: (key: string) => string; // دالة الترجمة تأخذ مفتاح وتعيد نص
  setIsAddDialogOpen: (open: boolean) => void;
}

// 2. تطبيق الـ Interface على المكون
const HeaderQB: React.FC<HeaderQuestionsBankProps> = ({
  t,
  setIsAddDialogOpen,
}) => {
  return (
    <>
      <div className="mb-8">
        <Background isHeader>
          <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <MainTitle className="flex items-center gap-3">
                <div className="p-2 bg-btn rounded-lg">
                  <Book className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                {t("title")}
              </MainTitle>
              <TextMuted className="mt-1">{t("description")}</TextMuted>
            </div>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-btn hover:opacity-80 text-text-light font-arabic gap-1"
            >
              <Plus className="h-4 w-4" />
              {t("addNewCourse")}
            </Button>
          </div>
        </Background>
      </div>
    </>
  );
};

export default HeaderQB;
