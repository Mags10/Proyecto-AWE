import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ZardButtonComponent } from '../../shared/components/button';
import { ZardCardComponent } from '../../shared/components/card';
import { ZardInputDirective } from '../../shared/components/input';
import { ManagedUser } from '../../interfaces/auth';
import { captureActiveElement, focusModalSurface, restoreActiveElement } from '../../shared/utils/modal-a11y';

@Component({
  selector: 'app-usuario-password-modal',
  imports: [ReactiveFormsModule, ZardButtonComponent, ZardCardComponent, ZardInputDirective],
  templateUrl: './usuario-password-modal.component.html',
  styleUrl: './usuario-password-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuarioPasswordModalComponent implements AfterViewInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly previouslyFocusedElement = captureActiveElement();
  readonly dialogSurface = viewChild<ElementRef<HTMLElement>>('dialogSurface');

  readonly user = input.required<ManagedUser>();
  readonly saving = input(false);
  readonly error = input('');
  readonly closed = output<void>();
  readonly submitted = output<{ password: string }>();

  readonly form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

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
