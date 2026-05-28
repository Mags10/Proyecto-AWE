import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ZardButtonComponent } from '../../shared/components/button';
import { ZardCardComponent } from '../../shared/components/card';
import { ZardInputDirective } from '../../shared/components/input';
import { ManagedUser, UserRole } from '../../interfaces/auth';
import { captureActiveElement, focusModalSurface, restoreActiveElement } from '../../shared/utils/modal-a11y';

type UserFormValue = {
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  password: string;
};

@Component({
  selector: 'app-usuario-form-modal',
  imports: [ReactiveFormsModule, ZardButtonComponent, ZardCardComponent, ZardInputDirective],
  templateUrl: './usuario-form-modal.component.html',
  styleUrl: './usuario-form-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuarioFormModalComponent implements AfterViewInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly previouslyFocusedElement = captureActiveElement();
  readonly dialogSurface = viewChild<ElementRef<HTMLElement>>('dialogSurface');

  readonly user = input<ManagedUser | null>(null);
  readonly saving = input(false);
  readonly error = input('');
  readonly closed = output<void>();
  readonly submitted = output<UserFormValue>();

  readonly roleOptions: Array<{ value: UserRole; label: string }> = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'KITCHEN', label: 'Cocina' },
    { value: 'FLOOR', label: 'Piso' },
  ];

  readonly editing = computed(() => !!this.user());

  readonly form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['KITCHEN' as UserRole, Validators.required],
    active: [true],
    password: ['', [Validators.minLength(8)]],
  });

  constructor() {
    effect(() => {
      const user = this.user();
      this.form.reset({
        name: user?.name ?? '',
        email: user?.email ?? '',
        role: user?.role ?? 'KITCHEN',
        active: user?.active ?? true,
        password: '',
      });

      if (user) {
        this.form.controls.password.clearValidators();
      } else {
        this.form.controls.password.setValidators([Validators.required, Validators.minLength(8)]);
      }
      this.form.controls.password.updateValueAndValidity({ emitEvent: false });
    });
  }

  ngAfterViewInit(): void {
    focusModalSurface(this.dialogSurface());
  }

  close(): void {
    restoreActiveElement(this.previouslyFocusedElement);
    this.closed.emit();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.form.getRawValue());
  }
}
