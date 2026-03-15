import React, { useState } from "react";
import axios from "axios";
import AuthShell from "./AuthShell";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Label } from "../../../components/ui/Label";
import { useToast } from "../../../lib/toast";
import { API_BASE_URL } from "../../../lib/api";

export default function SignUpPage({ onNavigate, onAuthSuccess }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      showToast("Password and confirm password must match.", "error", "top-right");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/signup`, {
        name: form.name,
        email: form.email,
        phoneNumber: form.phoneNumber,
        password: form.password,
      });
      showToast(res.data.message || "Account created successfully.", "success", "top-right");
      onAuthSuccess?.(res.data);
      onNavigate?.("/dashboard");
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to create account.", "error", "top-right");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Create Account"
      title="Join the RedLight portal"
      subtitle="Set up a simple account for officers and operators with just your name, email, and password."
      footer={
        <div className="auth-footer">
          <span>Already have an account?</span>
          <button type="button" className="auth-footer__link" onClick={() => onNavigate?.("/signin")}>
            Sign in
          </button>
        </div>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-form__heading">
          <h1>Sign Up</h1>
          <p>Create your RedLight access credentials.</p>
        </div>

        <div className="auth-form__field">
          <Label htmlFor="signup-name">Name</Label>
          <Input
            id="signup-name"
            type="text"
            placeholder="Your full name"
            value={form.name}
            onChange={handleChange("name")}
            required
          />
        </div>

        <div className="auth-form__field">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            type="email"
            placeholder="officer@redlight.com"
            value={form.email}
            onChange={handleChange("email")}
            required
          />
        </div>

        <div className="auth-form__field">
          <Label htmlFor="signup-phone-number">Phone Number</Label>
          <Input
            id="signup-phone-number"
            type="tel"
            placeholder="10-digit phone number"
            value={form.phoneNumber}
            onChange={handleChange("phoneNumber")}
            required
            pattern="[0-9]{10}"
          />
        </div>

        <div className="auth-form__field">
          <Label htmlFor="signup-password">Password</Label>
          <Input
            id="signup-password"
            type="password"
            placeholder="Minimum 6 characters"
            value={form.password}
            onChange={handleChange("password")}
            required
            minLength={6}
          />
        </div>

        <div className="auth-form__field">
          <Label htmlFor="signup-confirm-password">Confirm Password</Label>
          <Input
            id="signup-confirm-password"
            type="password"
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            onChange={handleChange("confirmPassword")}
            required
            minLength={6}
          />
        </div>

        <p className="auth-form__hint">Use the same password in both fields to create your account.</p>

        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </AuthShell>
  );
}
