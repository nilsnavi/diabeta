import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiabetesProfileDto } from './dto/create-diabetes-profile.dto';
import { UpdateDiabetesProfileDto } from './dto/update-diabetes-profile.dto';

@Injectable()
export class DiabetesProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.diabetesProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Diabetes profile not found');
    }

    return profile;
  }

  async createProfile(userId: string, dto: CreateDiabetesProfileDto) {
    const existing = await this.prisma.diabetesProfile.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException('Diabetes profile already exists');
    }

    return this.prisma.diabetesProfile.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  async updateProfile(userId: string, dto: UpdateDiabetesProfileDto) {
    const profile = await this.prisma.diabetesProfile.update({
      where: { userId },
      data: dto,
    });

    return profile;
  }
}
