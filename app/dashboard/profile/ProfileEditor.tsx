"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { updateProfile, updatePassword } from "@/app/actions/auth";

const inputCls =
  "w-full px-4 py-2 border border-white/10 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white/[0.06] text-white";

export function ProfileEditor({
  initial,
}: {
  initial: {
    full_name: string | null
    phone: string | null
    exam_target: string | null
  }
}) {
  const [fullName, setFullName] = useState(initial.full_name ?? "")
  const [phone, setPhone] = useState(initial.phone ?? "")
  const [examTarget, setExamTarget] = useState(initial.exam_target ?? "")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMessage, setPwMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const saveProfile = async () => {
    setSaving(true)
    setMessage(null)
    const formData = new FormData()
    formData.set("full_name", fullName)
    formData.set("phone", phone)
    formData.set("exam_target", examTarget)
    const result = await updateProfile(formData)
    setSaving(false)
    if (result?.error) {
      setMessage({ type: "error", text: result.error })
      return
    }
    setMessage({ type: "success", text: result?.message || "Profile updated." })
  }

  const changePassword = async () => {
    setPwSaving(true)
    setPwMessage(null)
    const formData = new FormData()
    formData.set("password", password)
    formData.set("confirm", confirm)
    const result = await updatePassword(formData)
    setPwSaving(false)
    if (result?.error) {
      setPwMessage({ type: "error", text: result.error })
      return
    }
    setPwMessage({ type: "success", text: "Password updated." })
    setPassword("")
    setConfirm("")
  }

  return (
    <div className="space-y-6">
      {/* Personal details */}
      <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-sm p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          Personal Details
        </h2>

        {message && (
          <div
            className={`mb-4 p-3 text-sm rounded-[var(--radius-md)] border ${
              message.type === "success"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                : "bg-rose-500/10 text-rose-400 border-rose-500/25"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputCls}
              maxLength={200}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputCls}
              placeholder="0300 1234567"
              maxLength={50}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
              Exam Target
            </label>
            <input
              type="text"
              value={examTarget}
              onChange={(e) => setExamTarget(e.target.value)}
              className={inputCls}
              placeholder="MDCAT 2026, NUMS, AKU..."
              maxLength={200}
            />
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Your goal appears in Analytics and on the dashboard.
            </p>
          </div>
          <Button variant="primary" onClick={saveProfile} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Change password */}
      <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-sm p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          Change Password
        </h2>

        {pwMessage && (
          <div
            className={`mb-4 p-3 text-sm rounded-[var(--radius-md)] border ${
              pwMessage.type === "success"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                : "bg-rose-500/10 text-rose-400 border-rose-500/25"
            }`}
          >
            {pwMessage.text}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
              New password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputCls}
              placeholder="Repeat your new password"
            />
          </div>
          <Button variant="secondary" onClick={changePassword} disabled={pwSaving}>
            {pwSaving ? "Updating…" : "Update Password"}
          </Button>
        </div>
      </div>
    </div>
  );
}
