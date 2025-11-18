"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { acceptInviteSchema, type AcceptInviteFormData } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAcceptInvite } from "@/hooks/use-iam"
import { useAuth } from "@/contexts/auth-context"

export function AcceptInviteForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const inviteToken = searchParams.get("token") || ""
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const acceptInvite = useAcceptInvite()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInviteFormData>({
    resolver: zodResolver(acceptInviteSchema),
  })

  const { updateSessionWithInvite } = useAuth()

  const onSubmit = async (data: AcceptInviteFormData) => {
    const { confirmPassword, ...payload } = data
    const response = await acceptInvite.mutateAsync({ ...payload, inviteToken })

    // `acceptInvite` returns unwrapped AuthData (or throws).
    if (!response || !response.token || !response.token.refreshToken) {
      // If the response doesn't include a refresh token, abort (service should throw on failure).
      return
    }

    await updateSessionWithInvite({
      token: {
        token: response.token.token,
        refreshToken: response.token.refreshToken,
      },
      user: response.user,
    })
  }

  const tokenMissing = !inviteToken

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Aceitar Convite</CardTitle>
        <CardDescription>
          {tokenMissing ? "Token de convite não encontrado na URL." : "Defina sua senha para concluir o acesso."}
        </CardDescription>
      </CardHeader>
      {!tokenMissing && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome (opcional)</Label>
              <Input id="name" type="text" placeholder="Seu nome" {...register("name")} disabled={isSubmitting} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword((s) => !s)}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isSubmitting || acceptInvite.isPending}>
              {(isSubmitting || acceptInvite.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Concluir
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  )
}
