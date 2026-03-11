import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams } from "next/navigation";
import React from "react";

// تعريف شكل الخيار الواحد
interface SelectOption {
  value: string;
  label: string;
}

// تعريف الـ Props
interface CustomSelectProps {
  value: string; // القيمة الحالية
  onChange: (value: string) => void; // دالة التحديث
  options: SelectOption[]; // قائمة الخيارات
  placeholder?: string; // النص الافتراضي (اختياري)
  className?: string; // لتخصيص الستايل (اختياري)
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "اختر...",
  className,
}) => {
  const { locale } = useParams();

  return (
    <Select
      value={value}
      onValueChange={onChange}
      dir={locale == "ar" ? "rtl" : "ltr"}
    >
      <SelectTrigger
        className={`min-w-[140px] bg-white dark:bg-gray-800 border border-border-light dark:border-gray-700 font-arabic dark:text-white ${className || ""}`}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        // dir="rtl"
        className="bg-white dark:bg-gray-800 border border-border-light dark:border-gray-700"
      >
        {options.map((option) => (
          <SelectItem
            // dir="rtl"
            key={option.value}
            value={option.value}
            className="font-arabic dark:text-gray-300"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CustomSelect;
