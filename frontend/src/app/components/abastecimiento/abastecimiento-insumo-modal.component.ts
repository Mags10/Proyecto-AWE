import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ZardButtonComponent } from '../../shared/components/button';
import { ZardCardComponent } from '../../shared/components/card';
import { ZardInputDirective } from '../../shared/components/input';
import { UNIT_OPTIONS } from '../../shared/catalogs/units';
import { SupplyService } from '../../services/supply-service';

@Component({
  selector: 'app-abastecimiento-insumo-modal',
  imports: [ReactiveFormsModule, ZardButtonComponent, ZardCardComponent, ZardInputDirective],
  templateUrl: './abastecimiento-insumo-modal.component.html',
  styleUrl: './abastecimiento-insumo-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AbastecimientoInsumoModalComponent {
  private fb = inject(NonNullableFormBuilder);
  public supplyService = inject(SupplyService);

  @Output() closed = new EventEmitter<void>();

  public unitOptions = UNIT_OPTIONS;

  public ingredientForm = this.fb.group({
    name: ['', Validators.required],
    unit: [UNIT_OPTIONS[3].value, Validators.required],
    currentStock: [0, Validators.min(0)],
    averageCost: [0, Validators.min(0)],
    minimumStock: [0, Validators.min(0)]
  });

  close(): void {
    this.closed.emit();
  }

  createIngredient(): void {
    if (this.ingredientForm.invalid) {
      this.ingredientForm.markAllAsTouched();
      return;
    }

    void this.supplyService.createIngredient(this.ingredientForm.getRawValue()).then(() => {
      if (!this.supplyService.error()) {
        this.closed.emit();
        this.ingredientForm.reset({
          name: '',
          unit: UNIT_OPTIONS[3].value,
          currentStock: 0,
          averageCost: 0,
          minimumStock: 0
        });
      }
    });
  }
}