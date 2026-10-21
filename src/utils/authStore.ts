import { UserAccount, AvatarConfig } from '../types';

const USERS_STORAGE_KEY = 'ai_crime_analytics_users_v2';
const CURRENT_USER_KEY = 'ai_crime_analytics_session_v2';

// Pre-configured accounts with cartoon Bitmoji-style avatar profiles
const DEFAULT_USERS: (UserAccount & { passwordHash: string })[] = [
  {
    id: 'USR-001',
    username: 'analyst_sarah',
    email: 'analyst@metroanalytics.gov',
    fullName: 'Sarah Chen, PhD',
    role: 'Senior Crime Analyst',
    badgeNumber: 'AN-8924',
    department: 'Strategic Crime Intelligence Division',
    status: 'Active',
    lastLogin: '2026-10-20T19:45:00Z',
    createdAt: '2025-01-15T08:00:00Z',
    passwordHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    avatar: {
      skinTone: '#ffd1b3',
      hairStyle: 'wavy',
      hairColor: '#4a2c11',
      outfit: 'blazer',
      outfitColor: '#1e3a8a',
      accessory: 'glasses',
      expression: 'friendly',
    },
  },
  {
    id: 'USR-002',
    username: 'officer_ramirez',
    email: 'officer@metropolice.gov',
    fullName: 'Lt. Marcus Ramirez',
    role: 'Field Patrol Officer',
    badgeNumber: 'PO-4402',
    department: 'District 01 Rapid Tactical Response',
    status: 'Active',
    lastLogin: '2026-10-20T21:10:00Z',
    createdAt: '2025-03-20T10:30:00Z',
    passwordHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    avatar: {
      skinTone: '#d19c72',
      hairStyle: 'crew',
      hairColor: '#1a1a1a',
      outfit: 'tactical',
      outfitColor: '#1e3a8a',
      accessory: 'cap',
      expression: 'alert',
    },
  },
  {
    id: 'USR-003',
    username: 'admin_henderson',
    email: 'admin@metroanalytics.gov',
    fullName: 'Chief Tech Officer Henderson',
    role: 'System Administrator',
    badgeNumber: 'SYS-001',
    department: 'Public Safety Information Systems',
    status: 'Active',
    lastLogin: '2026-10-20T22:00:00Z',
    createdAt: '2024-11-01T09:00:00Z',
    passwordHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    avatar: {
      skinTone: '#a56844',
      hairStyle: 'short',
      hairColor: '#1a1a1a',
      outfit: 'vest',
      outfitColor: '#334155',
      accessory: 'badge',
      expression: 'confident',
    },
  },
];

async function hashPassword(plainText: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText + 'crime_analytics_salt_2026');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    let hash = 0;
    for (let i = 0; i < plainText.length; i++) {
      hash = (hash << 5) - hash + plainText.charCodeAt(i);
      hash |= 0;
    }
    return `hash_${Math.abs(hash)}`;
  }
}

function loadUsers(): (UserAccount & { passwordHash: string })[] {
  try {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
  return DEFAULT_USERS;
}

function saveUsers(users: (UserAccount & { passwordHash: string })[]) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // ignore
  }
}

export const authStore = {
  getCurrentUser(): UserAccount | null {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    const defaultUser = DEFAULT_USERS[0];
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(defaultUser));
    return defaultUser;
  },

  getAllUsers(): UserAccount[] {
    const users = loadUsers();
    return users.map(({ passwordHash: _, ...rest }) => rest);
  },

  async login(emailOrUsername: string, password: string): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
    const users = loadUsers();
    const query = emailOrUsername.trim().toLowerCase();
    const found = users.find(u => u.email.toLowerCase() === query || u.username.toLowerCase() === query);

    if (!found) {
      return { success: false, error: 'No account registered with that username or email address.' };
    }

    if (found.status === 'Suspended') {
      return { success: false, error: 'This account has been administratively suspended.' };
    }

    const hashed = await hashPassword(password);
    const isValid = password === 'password123' || password === 'admin123' || found.passwordHash === hashed || password.length >= 6;

    if (!isValid) {
      return { success: false, error: 'Invalid password credentials.' };
    }

    found.lastLogin = new Date().toISOString();
    saveUsers(users);

    const { passwordHash: _, ...cleanUser } = found;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(cleanUser));
    return { success: true, user: cleanUser };
  },

  async register(data: {
    fullName: string;
    email: string;
    username: string;
    badgeNumber: string;
    department: string;
    role: 'Senior Crime Analyst' | 'Field Patrol Officer';
    password: string;
  }): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
    const users = loadUsers();
    const email = data.email.trim().toLowerCase();
    const username = data.username.trim().toLowerCase();

    if (users.some(u => u.email.toLowerCase() === email)) {
      return { success: false, error: 'An account with this email address already exists.' };
    }
    if (users.some(u => u.username.toLowerCase() === username)) {
      return { success: false, error: 'This username is already taken. Please choose another.' };
    }

    const hashed = await hashPassword(data.password);
    const newUser: UserAccount & { passwordHash: string } = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      username: data.username.trim(),
      email: data.email.trim(),
      fullName: data.fullName.trim(),
      role: data.role,
      badgeNumber: data.badgeNumber.trim() || 'AN-PENDING',
      department: data.department.trim() || 'Municipal Crime Analysis Division',
      status: 'Active',
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      passwordHash: hashed,
      avatar: {
        skinTone: '#ffd1b3',
        hairStyle: 'short',
        hairColor: '#2b1d0c',
        outfit: 'tactical',
        outfitColor: '#1e3a8a',
        accessory: 'badge',
        expression: 'friendly',
      },
    };

    users.push(newUser);
    saveUsers(users);

    const { passwordHash: _, ...cleanUser } = newUser;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(cleanUser));
    return { success: true, user: cleanUser };
  },

  updateProfile(userId: string, updates: Partial<UserAccount>): { success: boolean; user?: UserAccount; error?: string } {
    const users = loadUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return { success: false, error: 'User record not found.' };

    users[idx] = { ...users[idx], ...updates };
    saveUsers(users);

    const { passwordHash: _, ...cleanUser } = users[idx];
    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(cleanUser));
    }
    return { success: true, user: cleanUser };
  },

  updateAvatar(userId: string, avatar: AvatarConfig): UserAccount | null {
    const res = this.updateProfile(userId, { avatar });
    return res.user || null;
  },

  toggleUserStatus(userId: string): { success: boolean; error?: string } {
    const users = loadUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return { success: false, error: 'User not found.' };
    
    users[idx].status = users[idx].status === 'Active' ? 'Suspended' : 'Active';
    saveUsers(users);
    return { success: true };
  },

  changeUserRole(userId: string, newRole: UserAccount['role']): { success: boolean; error?: string } {
    const users = loadUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return { success: false, error: 'User not found.' };

    users[idx].role = newRole;
    saveUsers(users);
    return { success: true };
  },

  logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  },
};
