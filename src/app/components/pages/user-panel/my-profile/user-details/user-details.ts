import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, OnDestroy } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Subject, takeUntil } from "rxjs";

import { ToastrService } from "ngx-toastr";
import { User } from "@angular/fire/auth";

import { FeatherIcons } from "../../../../../shared/components/ui/feather-icons/feather-icons";
import { FirebaseAuthService } from "../../../../../shared/services/firebase/firebase-auth.service";
import {
  FirebaseDatabaseService,
  UserData,
} from "../../../../../shared/services/firebase/firebase-database.service";

@Component({
  selector: "app-user-details",
  imports: [FeatherIcons, CommonModule, ReactiveFormsModule],
  templateUrl: "./user-details.html",
  styleUrls: ["./user-details.scss"],
})
export class UserDetails implements OnInit, OnDestroy {
  private authService = inject(FirebaseAuthService);
  private databaseService = inject(FirebaseDatabaseService);
  private toastr = inject(ToastrService);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  public currentUser: User | null = null;
  public userData: UserData | null = null;
  public isEditMode: boolean = false;
  public isLoading: boolean = false;
  public isSaving: boolean = false;
  public profileForm: FormGroup;

  constructor() {
    this.profileForm = this.fb.group({
      name: ["", [Validators.required, Validators.minLength(3)]],
      phone: [""],
      bio: ["", [Validators.maxLength(500)]],
      birthDate: [""],
      gender: [""],
      address: [""],
      neighborhood: [""],
      city: [""],
      state: [""],
      zipCode: [""],
      country: ["Brasil"],
    });
  }

  ngOnInit() {
    this.isLoading = true;

    // Subscribe to auth state
    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.currentUser = user;

      if (user) {
        // Load user data from database
        this.loadUserData(user.uid);
      } else {
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load user data from Realtime Database
   */
  private loadUserData(uid: string) {
    this.databaseService
      .getUser(uid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          if (data) {
            this.userData = data;
            this.populateForm(data);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error("Error loading user data:", error);
          this.toastr.error("Erro ao carregar dados do usuário", "Erro");
          this.isLoading = false;
        },
      });
  }

  /**
   * Populate form with user data
   */
  private populateForm(data: UserData) {
    this.profileForm.patchValue({
      name: data.name || "",
      phone: data.phone || "",
      bio: data.bio || "",
      birthDate: data.birthDate || "",
      gender: data.gender || "",
      address: data.address || "",
      neighborhood: data.neighborhood || "",
      city: data.city || "",
      state: data.state || "",
      zipCode: data.zipCode || "",
      country: data.country || "Brasil",
    });
  }

  /**
   * Toggle edit mode
   */
  toggleEditMode() {
    if (this.isEditMode) {
      // Cancelando edição - restaura dados originais
      if (this.userData) {
        this.populateForm(this.userData);
      }
    }
    this.isEditMode = !this.isEditMode;
  }

  /**
   * Save profile changes
   */
  async saveProfile() {
    if (this.profileForm.invalid) {
      this.toastr.error(
        "Por favor, preencha os campos obrigatórios corretamente.",
        "Erro de Validação"
      );
      return;
    }

    if (!this.currentUser) {
      this.toastr.error("Usuário não autenticado", "Erro");
      return;
    }

    this.isSaving = true;

    try {
      const formData = this.profileForm.value;

      // Prepare update data
      const updateData: Partial<UserData> = {
        name: formData.name,
        phone: formData.phone || "",
        bio: formData.bio || "",
        birthDate: formData.birthDate || "",
        gender: formData.gender || "",
        address: formData.address || "",
        neighborhood: formData.neighborhood || "",
        city: formData.city || "",
        state: formData.state || "",
        zipCode: formData.zipCode || "",
        country: formData.country || "Brasil",
      };

      // Update in database
      await this.databaseService.updateUser(this.currentUser.uid, updateData);

      this.toastr.success("Perfil atualizado com sucesso!", "Sucesso");
      this.isEditMode = false;
    } catch (error) {
      console.error("Error saving profile:", error);
      this.toastr.error("Erro ao salvar perfil. Tente novamente.", "Erro");
    } finally {
      this.isSaving = false;
    }
  }

  /**
   * Get form field error message
   */
  getFieldError(fieldName: string): string | null {
    const field = this.profileForm.get(fieldName);
    if (field?.invalid && (field?.touched || field?.dirty)) {
      if (field.errors?.["required"]) {
        return "Este campo é obrigatório";
      }
      if (field.errors?.["minlength"]) {
        return `Mínimo de ${field.errors["minlength"].requiredLength} caracteres`;
      }
      if (field.errors?.["maxlength"]) {
        return `Máximo de ${field.errors["maxlength"].requiredLength} caracteres`;
      }
    }
    return null;
  }

  /**
   * Get initials for avatar
   */
  getUserInitials(): string {
    if (!this.userData?.name) return "U";
    const parts = this.userData.name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return this.userData.name.substring(0, 2).toUpperCase();
  }

  /**
   * Format date for display
   */
  formatDate(date: string): string {
    if (!date) return "Não informado";
    try {
      const d = new Date(date);
      return d.toLocaleDateString("pt-BR");
    } catch {
      return date;
    }
  }
}
