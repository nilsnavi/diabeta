import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogEntry {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  meta?: any;
}

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Логирует действие администратора или пользователя
   * ВАЖНО: Не логирует медицинские данные (сахар, инсулин, симптомы и т.д.)
   */
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      // Sanitization: удаляем чувствительные данные из meta
      const sanitizedMeta = this.sanitizeMeta(entry.meta);

      await this.prisma.auditLog.create({
        data: {
          userId: entry.userId,
          action: entry.action,
          entity: entry.entity,
          entityId: entry.entityId,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          meta: sanitizedMeta,
        },
      });
    } catch (error) {
      // Не блокируем выполнение если логирование не удалось
      console.error('Audit log error:', error);
    }
  }

  /**
   * Очищает мета-данные от медицинской информации
   */
  private sanitizeMeta(meta: any): any {
    if (!meta || typeof meta !== 'object') {
      return meta;
    }

    const sensitiveFields = [
      'value',           // значение сахара
      'glucoseValue',    // значение глюкозы
      'insulinDose',     // доза инсулина
      'dose',            // доза
      'symptoms',        // симптомы
      'comment',         // комментарий
      'comments',        // комментарии
      'diagnosis',       // диагноз
      'notes',           // заметки
      'description',     // описание
      'foodItems',       // продукты питания
      'carbs',           // углеводы
      'proteins',        // белки
      'fats',            // жиры
      'calories',        // калории
      'medications',     // лекарства
      'feelings',        // ощущения
      'activity',        // активность
    ];

    const sanitized = { ...meta };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Логирует действия администраторов
   */
  async logAdminAction(
    adminId: string,
    action: string,
    entity: string,
    entityId?: string,
    details?: any,
  ): Promise<void> {
    await this.log({
      userId: adminId,
      action: `admin.${action}`,
      entity,
      entityId,
      meta: {
        ...details,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Логирует доступ к медицинским данным
   */
  async logMedicalDataAccess(
    userId: string,
    accessorId: string,
    entityType: string,
    entityId: string,
  ): Promise<void> {
    await this.log({
      userId: accessorId,
      action: 'medical.data.access',
      entity: entityType,
      entityId,
      meta: {
        accessedUserId: userId,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
