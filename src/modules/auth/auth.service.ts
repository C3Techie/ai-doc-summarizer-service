import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { User, UserDocument } from "./user.schema";
import {
  SignupDto,
  LoginDto,
  AuthResponseDto,
  LoginResponseDto,
} from "./dto/auth.dto";
import { ApiResponse } from "../../common";
import * as sysMsg from "../../constants/system.messages";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto): Promise<ApiResponse<AuthResponseDto>> {
    const existingUser = await this.userModel.findOne({
      email: signupDto.email,
    });
    if (existingUser) {
      throw new ConflictException(sysMsg.USER_ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(signupDto.password, 10);

    const user = await this.userModel.create({
      ...signupDto,
      password: hashedPassword,
    });

    return {
      message: sysMsg.USER_REGISTERED,
      data: new AuthResponseDto(user.toObject()),
    };
  }

  async login(loginDto: LoginDto): Promise<ApiResponse<LoginResponseDto>> {
    const user = await this.userModel.findOne({ email: loginDto.email });
    if (!user) {
      throw new UnauthorizedException(sysMsg.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(sysMsg.INVALID_CREDENTIALS);
    }

    const payload = { sub: user._id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      message: sysMsg.LOGIN_SUCCESS,
      data: new LoginResponseDto({
        ...user.toObject(),
        token,
      }),
    };
  }

  async validateUser(userId: string): Promise<UserDocument> {
    return this.userModel.findById(userId);
  }
}
