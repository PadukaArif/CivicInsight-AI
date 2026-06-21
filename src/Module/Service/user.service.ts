import { db } from "../../config/database";
import { UserClient } from "../Clients/user.client";
import type { RegisterInput } from "../global.types";

export class UserService {
  static register = db.transaction((input: RegisterInput) => {
    const existingAccount = UserClient.findAccountByEmail(input.email)
    if (existingAccount) {
      throw new Error("Email sudah terdaftar")
    }

    const existingProfile = UserClient.findProfileByNik(input.nik)
    if (existingProfile) {
      throw new Error("NIK sudah terdaftar")
    }

    return UserClient.create(input)
  })

  static getProfile(id: number) {
    const user = UserClient.findById(id);
    
    if (!user) {
      throw new Error("User tidak ditemukan");
    }
    
    return user;
  }
}