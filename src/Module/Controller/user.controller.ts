import { UserService } from "../Service/user.service";
import type { RegisterInput } from "../global.types";

export class UserController {
  static register({ body, set }: { body: RegisterInput; set: any }) {
    try {
      const result = UserService.register(body);
      set.status = 201
      return {
        success: true,
        message: "User dan Profile telah berhasil di daftarkan",
        data: result
      }
    } catch (error: any) {
      set.status = 500
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error)
      }
    }
  }

  static getProfile({ params, set }: any) {
    try {
      const id = Number(params.id); 
      const result = UserService.getProfile(id);
  
      return {
        success: true,
        message: "Data user berhasil diambil",
        data: result,
      };
    } catch (error: any) {
      set.status = 404;
      return {
        success: false,
        message: error.message || "Gagal mengambil data user",
      };
    }
  }
}