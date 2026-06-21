import { Elysia, t } from "elysia";
import { UserController } from "../Controller/user.controller";

export const userRoutes = new Elysia({ prefix: "/auth" })
  .post("/register", UserController.register, {
    body: t.Object({
      email: t.String({ 
        format: "email", 
        error: "Format email tidak valid" 
      }),
      password: t.String({ 
        minLength: 1, 
        error: "Password tidak boleh kosong" 
      }),
      nik: t.String({ 
        minLength: 16, 
        maxLength: 16, 
        error: "NIK harus berjumlah 16 karakter" 
      }),
      fullName: t.String({ error: "Nama lengkap wajib diisi" }),
      role: t.Union([
        t.Literal("warga"),
        t.Literal("admin_rt"),
        t.Literal("admin_rw")
      ], { error: "Role harus berupa warga, admin_rt, atau admin_rw" }),
      rt: t.String({ error: "RT wajib diisi" }),
      rw: t.String({ error: "RW wajib diisi" }),
      phoneNumber: t.Optional(t.String()), // Bersifat opsional (boleh tidak dikirim)
      isLansia: t.Number({ error: "Status lansia harus berupa angka (0 atau 1)" })
    })
  })
  .get("/profile/:id", UserController.getProfile);