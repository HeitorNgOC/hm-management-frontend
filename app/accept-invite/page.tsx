import React, { Suspense } from "react"
import { AcceptInviteForm } from "@/components/auth/accept-invite-form"

export default function AcceptInvitePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Suspense fallback={<div className="text-center">Carregando...</div>}>
        <AcceptInviteForm />
      </Suspense>
    </div>
  )
}
