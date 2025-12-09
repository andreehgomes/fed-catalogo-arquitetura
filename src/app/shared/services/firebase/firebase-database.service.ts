import { Injectable, inject } from "@angular/core";
import { Database, ref, set, get, update, onValue, off } from "@angular/fire/database";
import { Observable } from "rxjs";

/**
 * User data interface for Realtime Database
 */
export interface UserData {
  // Basic Info
  name: string;
  email: string;
  phone: string;
  photoURL?: string;

  // Address Info
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  neighborhood?: string;
  country?: string;

  // Additional Info
  bio?: string;
  birthDate?: string;
  gender?: string;

  // Timestamps
  createdAt: number;
  lastLogin: number;
}

/**
 * Firebase Realtime Database Service
 * Manages user data storage and retrieval
 */
@Injectable({
  providedIn: "root",
})
export class FirebaseDatabaseService {
  private database = inject(Database);

  /**
   * Check if user exists in database
   * @param uid - User ID
   * @returns Promise<boolean> - True if user exists
   */
  async checkUserExists(uid: string): Promise<boolean> {
    try {
      const userRef = ref(this.database, `users/${uid}`);
      const snapshot = await get(userRef);
      return snapshot.exists();
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  }

  /**
   * Create new user in database
   * @param uid - User ID
   * @param userData - User data to save
   * @returns Promise<void>
   */
  async createUser(uid: string, userData: UserData): Promise<void> {
    try {
      const userRef = ref(this.database, `users/${uid}`);
      await set(userRef, userData);
      console.log("User created successfully:", uid);
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  /**
   * Update existing user data
   * @param uid - User ID
   * @param userData - Partial user data to update
   * @returns Promise<void>
   */
  async updateUser(uid: string, userData: Partial<UserData>): Promise<void> {
    try {
      const userRef = ref(this.database, `users/${uid}`);
      await update(userRef, userData);
      console.log("User updated successfully:", uid);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  /**
   * Get user data as Observable
   * @param uid - User ID
   * @returns Observable<UserData | null>
   */
  getUser(uid: string): Observable<UserData | null> {
    return new Observable((observer) => {
      const userRef = ref(this.database, `users/${uid}`);

      const unsubscribe = onValue(
        userRef,
        (snapshot) => {
          if (snapshot.exists()) {
            observer.next(snapshot.val() as UserData);
          } else {
            observer.next(null);
          }
        },
        (error) => {
          console.error("Error getting user:", error);
          observer.error(error);
        },
      );

      // Cleanup function
      return () => {
        off(userRef);
      };
    });
  }

  /**
   * Get user data once (not realtime)
   * @param uid - User ID
   * @returns Promise<UserData | null>
   */
  async getUserOnce(uid: string): Promise<UserData | null> {
    try {
      const userRef = ref(this.database, `users/${uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        return snapshot.val() as UserData;
      }
      return null;
    } catch (error) {
      console.error("Error getting user once:", error);
      return null;
    }
  }

  /**
   * Update last login timestamp
   * @param uid - User ID
   * @returns Promise<void>
   */
  async updateLastLogin(uid: string): Promise<void> {
    try {
      await this.updateUser(uid, { lastLogin: Date.now() });
    } catch (error) {
      console.error("Error updating last login:", error);
      throw error;
    }
  }
}
