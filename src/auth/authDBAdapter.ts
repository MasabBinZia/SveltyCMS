import type { User, Session, Token, Role, Permission } from './types';

export interface AuthDBAdapter {
	// User Management Methods
	createUser(userData: Partial<User>): Promise<User>;
	updateUserAttributes(user_id: string, attributes: Partial<User>): Promise<void>;
	deleteUser(user_id: string): Promise<void>;
	getUserById(user_id: string): Promise<User | null>;
	getUserByEmail(email: string): Promise<User | null>;
	getAllUsers(): Promise<User[]>;
	getUserCount(): Promise<number>;

	// Session Management Methods
	createSession(data: { user_id: string; expires: number }): Promise<Session>;
	destroySession(session_id: string): Promise<void>;
	validateSession(session_id: string): Promise<User | null>;
	invalidateAllUserSessions(user_id: string): Promise<void>;

	// Token Management Methods
	createToken(data: { user_id: string; email: string; expires: number }): Promise<string>;
	validateToken(token: string, user_id: string): Promise<{ success: boolean; message: string }>;
	consumeToken(token: string, user_id: string): Promise<{ status: boolean; message: string }>;
	getAllTokens(): Promise<Token[]>;

	// Role Management Methods
	createRole(roleData: Role): Promise<Role>;
	updateRole(roleId: string, roleData: Partial<Role>): Promise<void>;
	deleteRole(roleId: string): Promise<void>;
	getRoleById(roleId: string): Promise<Role | null>;
	getAllRoles(): Promise<Role[]>;

	// Permission Management Methods
	createPermission(permissionData: Permission): Promise<Permission>;
	updatePermission(permissionId: string, permissionData: Partial<Permission>): Promise<void>;
	deletePermission(permissionId: string): Promise<void>;
	getPermissionById(permissionId: string): Promise<Permission | null>;
	getAllPermissions(): Promise<Permission[]>;

	// Role-Permissions Linking Methods
	assignPermissionToRole(roleId: string, permissionId: string): Promise<void>;
	removePermissionFromRole(roleId: string, permissionId: string): Promise<void>;
	getPermissionsForRole(roleId: string): Promise<Permission[]>;

	// User-Specific Permissions Methods (if needed)
	assignPermissionToUser(user_id: string, permissionId: string): Promise<void>;
	removePermissionFromUser(user_id: string, permissionId: string): Promise<void>;
	getPermissionsForUser(user_id: string): Promise<Permission[]>;
}
