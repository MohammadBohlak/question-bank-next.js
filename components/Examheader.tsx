'use client'
// @ts-nocheck - This is a client component, function props are valid

import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
export type HeaderField = {
    id: string
    value: string
    visible: boolean
}

export interface ExamHeaderConfig {
    logo?: string
    headerNote?: string

    right: HeaderField[]
    left: HeaderField[]
}
// interface Props {
//   config: ExamHeaderConfig
//   onChange: (config: ExamHeaderConfig) => void
// }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ExamHeader({ config, onChange }: any) {

    const updateField = (
        section: "right" | "center" | "left",
        id: string,
        value: string
    ) => {
        onChange({
            ...config,
            [section]: config[section].map(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (f: any) =>
                    f.id === id ? { ...f, value } : f
            ),
        })
    }

    const toggleVisibility = (
        section: "right" | "center" | "left",
        id: string
    ) => {
        onChange({
            ...config,
            [section]: config[section].map(    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (f: any) =>
                    f.id === id ? { ...f, visible: !f.visible } : f
            ),
        })
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderBlock = (fields: HeaderField[], section: any, align: string) => (
        <div className={` text-${align}`}>
            {fields?.map(field => (
                <div key={field.id}>

                    {/* SCREEN ONLY */}
                    <div className="no-print space-y-1">
                        <Input
                            value={field.value}
                            onChange={e => updateField(section, field.id, e.target.value)}
                        />
                        <div className="flex items-center gap-2 text-xs">
                            <Checkbox
                                checked={field.visible}
                                onCheckedChange={() => toggleVisibility(section, field.id)}
                            />
                            إظهار في الطباعة
                        </div>
                    </div>

                    {/* PRINT ONLY */}
                    {field.visible && (
                        <div className="print-only">{field.value}</div>
                    )}
                </div>
            ))}
        </div>
    )

    const onLogoChange = (file?: File) => {
        if (!file) return

        const reader = new FileReader()
        reader.onload = () => {
            onChange({
                ...config,
                logo: reader.result as string,
            })
        }
        reader.readAsDataURL(file)
    }

    return (
        <div className="border-b  border-gray-300 pb-2 mb-2 text-sm">

            <div className="grid grid-cols-3 ">

                {renderBlock(config.right, "right", "right")}

                <div className="flex flex-col items-center ">
                    <div className="flex flex-col items-center gap-1">

                        {/* SCREEN ONLY */}

                        {/* LOGO (screen + print) */}
                        {config.logo && (
                            <Image
                                src={config.logo}
                                alt="logo"
                                width={100}
                                height={60}
                                className=""
                                priority
                            />
                        )}
                        <div className="no-print mt-2">
                            <input
                                type="file"
                                accept="image/*"
                                id="logo-upload"
                                className="hidden"
                                onChange={(e) => onLogoChange(e.target.files?.[0])}
                            />

                            <label
                                htmlFor="logo-upload"
                                className="cursor-pointer  text-xs px-2 py-1 border rounded hover:bg-gray-50"
                            >
                                اختيار شعار
                            </label>
                        </div>
                    </div>

                    {renderBlock(config.center, "center", "center")}
                </div>

                {renderBlock(config.left, "left", "left")}

            </div>
        </div>
    )
}
