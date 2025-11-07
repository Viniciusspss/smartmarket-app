export interface Employee {
  employeeId: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  role: string;
  createdAt: Date;
  age?: number;
  jobTitle?: string;
}

export interface EmployeeResponse {
  employeeId: string;
  name: string;
  cpf: string;
  age: number;
  jobTitle: string;
}
