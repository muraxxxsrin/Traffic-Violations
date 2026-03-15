import React, { useState } from "react";
import axios from "axios";
import AuthShell from "./AuthShell";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Label } from "../../../components/ui/Label";
import { useToast } from "../../../lib/toast";
import { API_BASE_URL } from "../../../lib/api";

export default function SignInPage({ onNavigate, onAuthSuccess }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/signin`, form);
      showToast(res.data.message || "Signed in successfully.", "success", "top-right");
      onAuthSuccess?.(res.data);
      onNavigate?.("/dashboard");
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to sign in.", "error", "top-right");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome Back"
      title="Sign in to RedLight"
      subtitle="Access challan records, search violations, and manage payments from a single secure workspace."
      footer={
        <div className="auth-footer">
          <span>Don&apos;t have an account?</span>
          <button type="button" className="auth-footer__link" onClick={() => onNavigate?.("/signup")}>
            Create one
          </button>
        </div>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-form__heading">
          <h1>Sign In</h1>
          <p>Use your email and password to continue.</p>
        </div>

        <div className="auth-form__field">
          <Label htmlFor="signin-email">Email</Label>
          <Input
            id="signin-email"
            type="email"
            placeholder="officer@redlight.com"
            value={form.email}
            onChange={handleChange("email")}
            required
          />
        </div>

        <div className="auth-form__field">
          <Label htmlFor="signin-password">Password</Label>
          <Input
            id="signin-password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange("password")}
            required
          />
        </div>

        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Signing In..." : "Sign In"}
        </Button>
      </form>
    </AuthShell>
  );
}
