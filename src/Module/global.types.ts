export interface CreateUserDTO {
  email: string;
  password: string;
  nik: string;
  fullName: string;
  role: 'warga' | 'admin_rt' | 'admin_rw';
  rt: string;
  rw: string;
  phoneNumber?: string;
  isLansia: number;
}

export interface RegisterInput {
  email: string;
  password: string;
  nik: string;
  fullName: string;
  role: 'warga' | 'admin_rt' | 'admin_rw';
  rt: string;
  rw: string;
  phoneNumber?: string;
  isLansia: number;
}