import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { UserPlus, Trash2, KeyRound } from "lucide-react";
import type { AppRole } from "@/lib/auth";
import { createUserFn, deleteUserFn, setUserPasswordFn, toggleRoleFn, listUsersFn } from "@/lib/admin-users.functions";

export const Route = createFileRoute("/admin/pengguna")({ component: Users });

const ROLES: AppRole[] = ["super_admin", "admin_konten", "staf"];

function Users() {
  const qc = useQueryClient();
  const [openAdd, setOpenAdd] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", full_name: "", role: "staf" as AppRole });

  const { data } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => listUsersFn(),
  });

  const toggleRole = useMutation({
    mutationFn: async ({ userId, role, has }: { userId: string; role: AppRole; has: boolean }) => {
      await toggleRoleFn({ data: { userId, role, has } });
    },
    onSuccess: () => { toast.success("Role diperbarui"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (e: any) => toast.error(e.message ?? "Gagal"),
  });

  const addUser = useMutation({
    mutationFn: async () => createUserFn({ data: form }),
    onSuccess: () => {
      toast.success("Pengguna dibuat");
      setOpenAdd(false);
      setForm({ email: "", password: "", full_name: "", role: "staf" });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Gagal membuat pengguna"),
  });

  const removeUser = useMutation({
    mutationFn: async (userId: string) => deleteUserFn({ data: { userId } }),
    onSuccess: () => { toast.success("Pengguna dihapus"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (e: any) => toast.error(e.message ?? "Gagal menghapus"),
  });

  const changePass = useMutation({
    mutationFn: async ({ userId, password }: { userId: string; password: string }) =>
      setUserPasswordFn({ data: { userId, password } }),
    onSuccess: () => toast.success("Password diperbarui"),
    onError: (e: any) => toast.error(e.message ?? "Gagal"),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display text-2xl font-bold text-primary-dark">Pengguna & Role</h1>
        <button
          onClick={() => setOpenAdd((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90"
        >
          <UserPlus className="h-4 w-4" /> Tambah Pengguna
        </button>
      </div>

      {openAdd ? (
        <div className="mb-5 rounded-2xl bg-card border border-border/60 p-5">
          <h2 className="font-semibold text-primary-dark mb-3">Tambah Pengguna Baru</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              placeholder="Nama lengkap"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
            <input
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              placeholder="Password (min 6 karakter)"
              type="text"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <select
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as AppRole })}
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              disabled={addUser.isPending}
              onClick={() => addUser.mutate()}
              className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {addUser.isPending ? "Menyimpan..." : "Simpan"}
            </button>
            <button onClick={() => setOpenAdd(false)} className="rounded-lg border border-input px-4 py-2 text-sm">
              Batal
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl bg-card border border-border/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Nama / Email</th>
              <th className="px-4 py-3">Terdaftar</th>
              <th className="px-4 py-3">Roles</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((u) => (
              <tr key={u.id} className="border-t border-border/60 align-top">
                <td className="px-4 py-3">
                  <div className="font-semibold">{u.full_name || u.email || "—"}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString("id-ID")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {ROLES.map((r) => {
                      const has = u.roles.includes(r);
                      return (
                        <button
                          key={r}
                          onClick={() => toggleRole.mutate({ userId: u.id, role: r, has })}
                          className={`text-xs rounded-full px-3 py-1 border transition ${has ? "bg-primary text-primary-foreground border-primary" : "bg-background border-input hover:bg-muted"}`}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1 justify-end">
                    <button
                      title="Kirim tautan reset password"
                      onClick={() => toast.info("Reset password via email tidak tersedia pada mode lokal")}
                      className="inline-flex items-center gap-1 text-xs rounded-md border border-input px-2 py-1 hover:bg-muted"
                    >
                      <KeyRound className="h-3 w-3" /> Reset
                    </button>
                    <button
                      title="Set password baru"
                      onClick={() => {
                        const p = window.prompt("Password baru (min 6 karakter):");
                        if (p && p.length >= 6) changePass.mutate({ userId: u.id, password: p });
                        else if (p) toast.error("Password minimal 6 karakter");
                      }}
                      className="inline-flex items-center gap-1 text-xs rounded-md border border-input px-2 py-1 hover:bg-muted"
                    >
                      <KeyRound className="h-3 w-3" /> Password
                    </button>
                    <button
                      title="Hapus pengguna"
                      onClick={() => {
                        if (window.confirm(`Hapus pengguna ${u.email}? Aksi ini permanen.`)) removeUser.mutate(u.id);
                      }}
                      className="inline-flex items-center gap-1 text-xs rounded-md border border-destructive/40 text-destructive px-2 py-1 hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3 w-3" /> Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {(data ?? []).length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Belum ada pengguna.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Klik role untuk mengaktifkan/menonaktifkan. Semua aksi (tambah, hapus, reset password) hanya dapat dilakukan oleh Super Admin.
      </p>
    </div>
  );
}
