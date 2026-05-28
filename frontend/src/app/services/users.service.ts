import { Injectable, signal } from '@angular/core';
import { apiClient } from '../api/client';
import {
  CreateUserPayload,
  ManagedUser,
  ResetUserPasswordPayload,
  UpdateUserPayload,
  UserMutationResponse,
  UsersResponse,
} from '../interfaces/auth';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  readonly users = signal<ManagedUser[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  async fetchUsers(): Promise<void> {
    this.loading.set(true);
    this.error.set('');

    const { data, error } = await apiClient.GET('/api/users');

    if (error || !data) {
      this.error.set('No se pudieron cargar los usuarios.');
      this.loading.set(false);
      return;
    }

    this.users.set((data as UsersResponse).users);
    this.loading.set(false);
  }

  async createUser(payload: CreateUserPayload): Promise<boolean> {
    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    const { data, error } = await apiClient.POST('/api/users', { body: payload });

    if (error || !data) {
      this.error.set('No se pudo crear el usuario.');
      this.loading.set(false);
      return false;
    }

    const response = data as UserMutationResponse;
    this.users.update((current) =>
      [...current, response.user].sort((a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name))
    );
    this.success.set('Usuario creado.');
    this.loading.set(false);
    return true;
  }

  async updateUser(userId: string, payload: UpdateUserPayload): Promise<boolean> {
    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    const { data, error } = await apiClient.PUT('/api/users/{id}', {
      params: { path: { id: userId } },
      body: payload,
    });

    if (error || !data) {
      this.error.set('No se pudo actualizar el usuario.');
      this.loading.set(false);
      return false;
    }

    const response = data as UserMutationResponse;
    this.users.update((current) =>
      current
        .map((user) => (user._id === userId ? response.user : user))
        .sort((a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name))
    );
    this.success.set('Usuario actualizado.');
    this.loading.set(false);
    return true;
  }

  async resetPassword(userId: string, payload: ResetUserPasswordPayload): Promise<boolean> {
    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    const { error } = await apiClient.POST('/api/users/{id}/reset-password', {
      params: { path: { id: userId } },
      body: payload,
    });

    if (error) {
      this.error.set('No se pudo actualizar la contraseña.');
      this.loading.set(false);
      return false;
    }

    this.success.set('Contraseña actualizada.');
    this.loading.set(false);
    return true;
  }
}
