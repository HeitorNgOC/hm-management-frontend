"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { clientService } from "@/lib/services/client.service"
import { useToast } from "@/hooks/use-toast"

type FormData = {
  email: string
}

export default function ClientLoginPage() {
  const { register, handleSubmit, formState } = useForm<FormData>({ defaultValues: { email: "" } })
  const { toast } = useToast()

  const onSubmit = async (data: FormData) => {
    try {
      await clientService.generateMagicLink(data.email)
      toast({ title: "Link enviado", description: "Verifique seu e-mail para acessar o link de agendamento." })
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível enviar o link. Tente novamente." })
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-semibold mb-4">Acessar como cliente</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label className="block text-sm mb-1">E-mail</label>
        <input
          {...register("email", { required: true })}
          type="email"
          className="w-full border px-3 py-2 rounded"
        />

        <button type="submit" className="mt-4 w-full bg-blue-600 text-white py-2 rounded">
          Enviar link de acesso
        </button>
      </form>
    </div>
  )
}
