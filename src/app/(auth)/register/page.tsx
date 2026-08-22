"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { useAuth } from "@/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: "",
    username: "",
    first_name: "",
    last_name: "",
    password: "",
    password_confirm: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.password_confirm) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      await authApi.register(form);
      await login(form.email, form.password);
      router.push("/dashboard");
    } catch (err: any) {
      const errors = err.response?.data?.error?.details;
      if (errors) {
        setError(Object.values(errors).flat().join(", "));
      } else {
        setError(err.response?.data?.error?.message || "Registration failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold">Create your account</h2>
      <p className="mt-2 text-sm text-muted-foreground">Start your 14-day free trial</p>

      {error && (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First name</Label>
            <Input id="first_name" name="first_name" value={form.first_name} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last name</Label>
            <Input id="last_name" name="last_name" value={form.last_name} onChange={handleChange} required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" name="username" value={form.username} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password_confirm">Confirm password</Label>
          <Input id="password_confirm" name="password_confirm" type="password" value={form.password_confirm} onChange={handleChange} required />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Spinner className="h-4 w-4" /> : "Create Account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
