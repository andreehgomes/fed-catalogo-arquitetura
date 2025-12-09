import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";

import { NgbDropdownModule } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { Subject, takeUntil } from "rxjs";
import { User } from "@angular/fire/auth";

import { FeatherIcons } from "../../../ui/feather-icons/feather-icons";
import { FirebaseAuthService } from "../../../../services/firebase/firebase-auth.service";

@Component({
  selector: "app-profile",
  imports: [FeatherIcons, NgbDropdownModule, CommonModule],
  templateUrl: "./profile.html",
  styleUrls: ["./profile.scss"],
})
export class Profile implements OnInit, OnDestroy {
  private authService = inject(FirebaseAuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private destroy$ = new Subject<void>();

  public currentUser: User | null = null;
  public isAuthenticated: boolean = false;
  public userDisplayName: string = "";
  public userEmail: string = "";
  public userPhotoURL: string = "";
  public userInitials: string = "";

  ngOnInit() {
    // Subscribe to auth state changes
    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.currentUser = user;
      this.isAuthenticated = !!user;

      if (user) {
        this.userDisplayName = user.displayName || user.email?.split("@")[0] || "Usuário";
        this.userEmail = user.email || "";
        this.userPhotoURL = user.photoURL || "";
        this.userInitials = this.getInitials(this.userDisplayName);

        // Debug logs
        console.log("🔍 Profile Component - User Data:", {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          uid: user.uid,
        });
        console.log("📸 Photo URL being set:", this.userPhotoURL);
      } else {
        this.userDisplayName = "";
        this.userEmail = "";
        this.userPhotoURL = "";
        this.userInitials = "";
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Get initials from name
   */
  private getInitials(name: string): string {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  /**
   * Navigate to login page
   */
  goToLogin() {
    void this.router.navigate(["/page/other-pages/log-in"]);
  }

  /**
   * Navigate to profile page
   */
  goToProfile() {
    void this.router.navigate(["/page/user-panel/my-profile"]);
  }

  /**
   * Navigate to user dashboard
   */
  goToDashboard() {
    void this.router.navigate(["/page/user-panel/user-dashboard"]);
  }

  /**
   * Navigate to user wishlist
   */
  goToWishlist() {
    void this.router.navigate(["/page/user-panel/my-listing"]);
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      await this.authService.signOut();
      this.toastr.success("Você saiu da sua conta.", "Logout realizado");
      void this.router.navigate(["/"]);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      this.toastr.error("Erro ao sair da conta.", "Erro");
    }
  }
}
