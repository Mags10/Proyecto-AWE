import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ZardBadgeComponent } from '../../shared/components/badge';
import { ZardButtonComponent } from '../../shared/components/button';
import { ZardCardComponent } from '../../shared/components/card';
import { ZardInputDirective } from '../../shared/components/input';
import { ZardTableImports } from '../../shared/components/table';
import { ManagedUser, UserRole } from '../../interfaces/auth';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { UsuarioFormModalComponent } from '../../components/usuarios/usuario-form-modal.component';
import { UsuarioPasswordModalComponent } from '../../components/usuarios/usuario-password-modal.component';

@Component({
  selector: 'app-usuarios-page',
  imports: [
    DatePipe,
    ZardBadgeComponent,
    ZardButtonComponent,
    ZardCardComponent,
    ZardInputDirective,
    ...ZardTableImports,
    UsuarioFormModalComponent,
    UsuarioPasswordModalComponent,
  ],
  templateUrl: './usuarios-page.html',
  styleUrl: './usuarios-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuariosPage implements OnInit {
  readonly authService = inject(AuthService);
  readonly usersService = inject(UsersService);

  readonly query = signal('');
  readonly formModalOpen = signal(false);
  readonly passwordModalOpen = signal(false);
  readonly selectedUser = signal<ManagedUser | null>(null);

  readonly users = this.usersService.users;
  readonly loading = this.usersService.loading;
  readonly error = this.usersService.error;
  readonly success = this.usersService.success;

  readonly filteredUsers = computed(() => {
    const term = this.query().trim().toLowerCase();
    const users = this.users();

    if (!term) {
      return users;
    }

    return users.filter((user) =>
      [user.name, user.email, user.role, user.active ? 'activo' : 'inactivo'].some((value) =>
        value.toLowerCase().includes(term)
      )
    );
  });

  readonly activeUsers = computed(() => this.users().filter((user) => user.active).length);
  readonly adminUsers = computed(() => this.users().filter((user) => user.role === 'ADMIN' && user.active).length);
  readonly inactiveUsers = computed(() => this.users().filter((user) => !user.active).length);

  async ngOnInit(): Promise<void> {
    await this.usersService.fetchUsers();
  }

  updateQuery(value: string): void {
    this.query.set(value);
  }

  openCreate(): void {
    this.selectedUser.set(null);
    this.formModalOpen.set(true);
  }

  openEdit(user: ManagedUser): void {
    this.selectedUser.set(user);
    this.formModalOpen.set(true);
  }

  openPassword(user: ManagedUser): void {
    this.selectedUser.set(user);
    this.passwordModalOpen.set(true);
  }

  closeFormModal(): void {
    this.formModalOpen.set(false);
    this.selectedUser.set(null);
  }

  closePasswordModal(): void {
    this.passwordModalOpen.set(false);
    this.selectedUser.set(null);
  }

  async submitForm(value: {
    name: string;
    email: string;
    role: UserRole;
    active: boolean;
    password: string;
  }): Promise<void> {
    const selectedUser = this.selectedUser();

    const succeeded = selectedUser
      ? await this.usersService.updateUser(selectedUser._id, {
          name: value.name,
          email: value.email,
          role: value.role,
          active: value.active,
        })
      : await this.usersService.createUser(value);

    if (succeeded) {
      this.formModalOpen.set(false);
      this.selectedUser.set(null);
    }
  }

  async submitPassword(value: { password: string }): Promise<void> {
    const selectedUser = this.selectedUser();
    if (!selectedUser) {
      return;
    }

    const succeeded = await this.usersService.resetPassword(selectedUser._id, value);
    if (succeeded) {
      this.passwordModalOpen.set(false);
      this.selectedUser.set(null);
    }
  }

  getRoleLabel(role: UserRole): string {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'KITCHEN':
        return 'Cocina';
      case 'FLOOR':
        return 'Piso';
    }
  }

  getRoleBadge(role: UserRole): 'default' | 'secondary' {
    return role === 'ADMIN' ? 'default' : 'secondary';
  }

  isCurrentUser(user: ManagedUser): boolean {
    return this.authService.currentUser()?._id === user._id;
  }
}
