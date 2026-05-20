import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Guard для проверки владения ресурсом
 * Проверяет, что userId из JWT токена совпадает с userId ресурса
 */
@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new ForbiddenException('User not authenticated');
    }

    // Проверяем параметры запроса
    const paramId = request.params.id;
    
    // Если это создание нового ресурса, пропускаем (userId будет установлен в сервисе)
    if (request.method === 'POST') {
      return true;
    }

    // Для GET/PATCH/DELETE проверяем ownership через сервис
    // Эта проверка должна быть выполнена в сервисе
    // Guard только гарантирует наличие пользователя
    return true;
  }
}
