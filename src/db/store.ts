import { User, DriverProfile, RiderProfile, DriverDocument } from '../types.js';

// In-memory storage
export class Store {
  private users: Map<string, User> = new Map();
  private driverProfiles: Map<string, DriverProfile> = new Map();
  private riderProfiles: Map<string, RiderProfile> = new Map();

  // User operations
  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find((u) => u.email === email);
  }

  createUser(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // Driver profile operations
  getDriverProfile(userId: string): DriverProfile | undefined {
    return this.driverProfiles.get(userId);
  }

  createDriverProfile(profile: DriverProfile): DriverProfile {
    this.driverProfiles.set(profile.userId, profile);
    return profile;
  }

  updateDriverProfile(userId: string, updates: Partial<DriverProfile>): DriverProfile | undefined {
    const profile = this.driverProfiles.get(userId);
    if (!profile) return undefined;
    const updated = { ...profile, ...updates, updatedAt: new Date() };
    this.driverProfiles.set(userId, updated);
    return updated;
  }

  getAllDriverProfiles(): DriverProfile[] {
    return Array.from(this.driverProfiles.values());
  }

  // Rider profile operations
  getRiderProfile(userId: string): RiderProfile | undefined {
    return this.riderProfiles.get(userId);
  }

  createRiderProfile(profile: RiderProfile): RiderProfile {
    this.riderProfiles.set(profile.userId, profile);
    return profile;
  }

  updateRiderProfile(userId: string, updates: Partial<RiderProfile>): RiderProfile | undefined {
    const profile = this.riderProfiles.get(userId);
    if (!profile) return undefined;
    const updated = { ...profile, ...updates, updatedAt: new Date() };
    this.riderProfiles.set(userId, updated);
    return updated;
  }

  // Document operations
  addDriverDocument(userId: string, document: DriverDocument): DriverDocument | undefined {
    const profile = this.driverProfiles.get(userId);
    if (!profile) return undefined;
    profile.documents.push(document);
    profile.updatedAt = new Date();
    return document;
  }

  getDriverDocuments(userId: string): DriverDocument[] {
    const profile = this.driverProfiles.get(userId);
    return profile?.documents || [];
  }

  updateDriverDocument(userId: string, docId: string, updates: Partial<DriverDocument>): DriverDocument | undefined {
    const profile = this.driverProfiles.get(userId);
    if (!profile) return undefined;
    const doc = profile.documents.find((d) => d.id === docId);
    if (!doc) return undefined;
    Object.assign(doc, updates);
    profile.updatedAt = new Date();
    return doc;
  }

  // Admin operations
  getPendingDrivers(): DriverProfile[] {
    return Array.from(this.driverProfiles.values()).filter((p) => p.status === 'pending_approval');
  }

  getDriversByStatus(status: string): DriverProfile[] {
    return Array.from(this.driverProfiles.values()).filter((p) => p.status === status);
  }
}

// Singleton instance
export const store = new Store();
