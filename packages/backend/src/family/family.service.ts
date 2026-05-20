import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInviteDto, FamilyAccessStatus } from './dto/create-invite.dto';
import { UpdateAccessDto } from './dto/update-access.dto';
import { randomBytes } from 'crypto';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPrisma = any;

@Injectable()
export class FamilyService {
  private get db(): AnyPrisma {
    return this.prisma as AnyPrisma;
  }

  constructor(private readonly prisma: PrismaService) {}

  async createInvite(ownerUserId: string, dto: CreateInviteDto) {
    const inviteToken = randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const access = await this.db.familyAccess.create({
      data: {
        ownerUserId,
        accessLevel: dto.accessLevel,
        status: FamilyAccessStatus.pending,
        inviteToken,
        inviteEmail: dto.inviteEmail ?? null,
        expiresAt,
      },
    });

    const botUsername = process.env.TELEGRAM_BOT_USERNAME ?? 'diabeta_bot';
    const deepLink = `https://t.me/${botUsername}?start=family_${inviteToken}`;

    return { ...access, deepLink };
  }

  async listAccess(ownerUserId: string) {
    return this.db.familyAccess.findMany({
      where: { ownerUserId },
      include: {
        relative: {
          select: { id: true, firstName: true, lastName: true, username: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateAccess(ownerUserId: string, id: string, dto: UpdateAccessDto) {
    const record = await this.db.familyAccess.findFirst({
      where: { id, ownerUserId },
    });
    if (!record) throw new NotFoundException('Access record not found');

    return this.db.familyAccess.update({
      where: { id },
      data: {
        ...(dto.accessLevel ? { accessLevel: dto.accessLevel } : {}),
        ...(dto.status ? { status: dto.status } : {}),
      },
    });
  }

  async revokeAccess(ownerUserId: string, id: string) {
    const record = await this.db.familyAccess.findFirst({
      where: { id, ownerUserId },
    });
    if (!record) throw new NotFoundException('Access record not found');

    return this.db.familyAccess.update({
      where: { id },
      data: { status: FamilyAccessStatus.revoked },
    });
  }

  async acceptInvite(token: string, relativeUserId: string) {
    const record = await this.db.familyAccess.findUnique({
      where: { inviteToken: token },
    });

    if (!record) throw new NotFoundException('Invite not found');
    if (record.status !== FamilyAccessStatus.pending) {
      throw new ForbiddenException('Invite is no longer valid');
    }
    if (record.expiresAt && record.expiresAt < new Date()) {
      throw new ForbiddenException('Invite has expired');
    }
    if (record.ownerUserId === relativeUserId) {
      throw new ForbiddenException('Owner cannot accept their own invite');
    }

    return this.db.familyAccess.update({
      where: { id: record.id },
      data: {
        relativeUserId,
        status: FamilyAccessStatus.active,
      },
    });
  }

  /**
   * Check if a relative has access to owner data at the required level.
   * Used by other modules to enforce access control.
   */
  async checkAccess(
    relativeUserId: string,
    ownerUserId: string,
    requiredLevel?: string,
  ): Promise<boolean> {
    const record = await this.db.familyAccess.findFirst({
      where: {
        relativeUserId,
        ownerUserId,
        status: FamilyAccessStatus.active,
      },
    });
    if (!record) return false;
    if (!requiredLevel) return true;

    const levels = [
      'view_only',
      'view_and_notifications',
      'full_without_delete',
    ];
    const granted = levels.indexOf(record.accessLevel as string);
    const required = levels.indexOf(requiredLevel);
    return granted >= required;
  }
}