import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";

import { ToastrService } from "ngx-toastr";
import { User } from "@angular/fire/auth";

import { FeatherIcons } from "../../../../../shared/components/ui/feather-icons/feather-icons";
import { FirebaseAuthService } from "../../../../../shared/services/firebase/firebase-auth.service";
import {
  FirebaseDatabaseService,
  UserData,
} from "../../../../../shared/services/firebase/firebase-database.service";

@Component({
  selector: "app-login-form",
  templateUrl: "./login-form.html",
  styleUrls: ["./login-form.scss"],
  imports: [FeatherIcons, CommonModule, RouterModule, ReactiveFormsModule],
})
export class LoginForm {
  private authService = inject(FirebaseAuthService);
  private databaseService = inject(FirebaseDatabaseService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private fb = inject(FormBuilder);

  public isShow: boolean = false;
  public inputType: string = "password";
  public isLoading: boolean = false;
  public loginForm: FormGroup;

  constructor() {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  showPassword() {
    this.isShow = !this.isShow;
    if (this.isShow) {
      this.inputType = "text";
    } else {
      this.inputType = "password";
    }
  }

  /**
   * Login with Email and Password
   */
  async onSubmit() {
    if (this.loginForm.invalid) {
      this.toastr.error(
        "Por favor, preencha todos os campos corretamente.",
        "Erro"
      );
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    try {
      const result = await this.authService.signInWithEmail(email, password);

      // Save user data to database if first login
      await this.saveUserDataIfFirstLogin(result.user);

      this.toastr.success(`Bem-vindo, ${result.user.email}!`, "Login realizado");
      this.router.navigate(["/"]);
    } catch (error: any) {
      console.error("Erro no login:", error);
      this.handleAuthError(error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Login with Google
   */
  async loginWithGoogle() {
    this.isLoading = true;

    try {
      const result = await this.authService.signInWithGoogle();

      // Save user data to database if first login
      await this.saveUserDataIfFirstLogin(result.user);

      this.toastr.success(
        `Bem-vindo, ${result.user.displayName}!`,
        "Login com Google"
      );
      this.router.navigate(["/"]);
    } catch (error: any) {
      console.error("Erro no login com Google:", error);
      this.handleAuthError(error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Save user data to Realtime Database on first login
   * @param user - Firebase Auth User
   */
  private async saveUserDataIfFirstLogin(user: User): Promise<void> {
    try {
      // Debug: Log user data from Firebase Auth
      console.log("🔐 Firebase Auth User Data:", {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber,
      });

      // Check if user already exists in database
      const userExists = await this.databaseService.checkUserExists(user.uid);

      if (!userExists) {
        // First login - create user record
        const userData: UserData = {
          name: user.displayName || user.email?.split("@")[0] || "Usuário",
          email: user.email || "",
          phone: user.phoneNumber || "",
          photoURL: user.photoURL || "",
          createdAt: Date.now(),
          lastLogin: Date.now(),
        };

        console.log("💾 Saving user data to Database:", userData);
        await this.databaseService.createUser(user.uid, userData);
        console.log("✅ User data saved to Realtime Database:", user.uid);
      } else {
        // Existing user - update last login
        await this.databaseService.updateLastLogin(user.uid);
        console.log("🔄 Last login updated for user:", user.uid);
      }
    } catch (error) {
      console.error("❌ Error saving user data to database:", error);
      // Don't throw error - allow login to proceed even if database save fails
    }
  }

  /**
   * Handle Firebase Authentication Errors
   */
  private handleAuthError(error: any) {
    const errorMessages: { [key: string]: string } = {
      "auth/user-not-found": "Usuário não encontrado.",
      "auth/wrong-password": "Senha incorreta.",
      "auth/invalid-email": "Email inválido.",
      "auth/user-disabled": "Conta desabilitada.",
      "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
      "auth/network-request-failed": "Erro de conexão. Verifique sua internet.",
      "auth/popup-closed-by-user": "Login cancelado pelo usuário.",
      "auth/cancelled-popup-request": "Login cancelado.",
      "auth/invalid-credential": "Credenciais inválidas.",
    };

    const message =
      errorMessages[error.code] || "Erro ao fazer login. Tente novamente.";
    this.toastr.error(message, "Erro de Autenticação");
  }

  /**
   * Get form field errors
   */
  getFieldError(fieldName: string): string | null {
    const field = this.loginForm.get(fieldName);
    if (field?.invalid && field?.touched) {
      if (field.errors?.["required"]) {
        return "Este campo é obrigatório";
      }
      if (field.errors?.["email"]) {
        return "Email inválido";
      }
      if (field.errors?.["minlength"]) {
        return "Mínimo de 6 caracteres";
      }
    }
    return null;
  }
}
