import { Injectable, inject } from "@angular/core";
import {
  Firestore,
  collection,
  doc,
  collectionData,
  docData,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
  DocumentData,
  CollectionReference,
  DocumentReference,
} from "@angular/fire/firestore";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class FirebaseFirestoreService {
  private firestore: Firestore = inject(Firestore);

  /**
   * Get collection data as Observable
   */
  getCollection<T = DocumentData>(
    collectionName: string,
    ...queryConstraints: QueryConstraint[]
  ): Observable<T[]> {
    const collectionRef = collection(this.firestore, collectionName);
    const q = queryConstraints.length > 0
      ? query(collectionRef, ...queryConstraints)
      : collectionRef;
    return collectionData(q, { idField: "id" }) as Observable<T[]>;
  }

  /**
   * Get document data as Observable
   */
  getDocument<T = DocumentData>(
    collectionName: string,
    docId: string
  ): Observable<T | undefined> {
    const docRef = doc(this.firestore, collectionName, docId);
    return docData(docRef, { idField: "id" }) as Observable<T | undefined>;
  }

  /**
   * Add document to collection
   */
  async addDocument<T = DocumentData>(
    collectionName: string,
    data: T
  ): Promise<DocumentReference> {
    try {
      const collectionRef = collection(this.firestore, collectionName);
      return await addDoc(collectionRef, data);
    } catch (error) {
      console.error("Error adding document:", error);
      throw error;
    }
  }

  /**
   * Set document (create or overwrite)
   */
  async setDocument<T = DocumentData>(
    collectionName: string,
    docId: string,
    data: T,
    merge: boolean = false
  ): Promise<void> {
    try {
      const docRef = doc(this.firestore, collectionName, docId);
      await setDoc(docRef, data, { merge });
    } catch (error) {
      console.error("Error setting document:", error);
      throw error;
    }
  }

  /**
   * Update document
   */
  async updateDocument<T = DocumentData>(
    collectionName: string,
    docId: string,
    data: Partial<T>
  ): Promise<void> {
    try {
      const docRef = doc(this.firestore, collectionName, docId);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error("Error updating document:", error);
      throw error;
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(collectionName: string, docId: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  }

  /**
   * Query helpers
   */
  where = where;
  orderBy = orderBy;
  limit = limit;
}
