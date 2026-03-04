import { Toaster } from "sonner"

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster position="top-center" richColors />
      {children}
    </>
  )
}