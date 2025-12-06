export class SignupDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export class LoginDto {
  email: string;
  password: string;
}

export class AuthResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;

  constructor(partial: Partial<AuthResponseDto>) {
    Object.assign(this, partial);
  }
}

export class LoginResponseDto extends AuthResponseDto {
  token: string;

  constructor(partial: Partial<LoginResponseDto>) {
    super(partial);
    this.token = partial.token;
  }
}
