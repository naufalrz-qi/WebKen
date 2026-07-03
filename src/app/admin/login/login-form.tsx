'use client'

import { useActionState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "@/app/actions/auth"

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, null)

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-left text-sm text-destructive">
          {state.error}
        </div>
      )}
      <div className="space-y-2 text-left">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          name="email" 
          type="email" 
          placeholder="Email address" 
          required 
          className="text-sm"
        />
      </div>
      <div className="space-y-2 text-left">
        <Label htmlFor="password">Password</Label>
        <Input 
          id="password" 
          name="password" 
          type="password" 
          placeholder="Password"
          required 
          className="text-sm"
        />
      </div>
      <Button type="submit" className="w-full mt-2" disabled={pending}>
        {pending ? "Authenticating..." : "Login"}
      </Button>
    </form>
  )
}
