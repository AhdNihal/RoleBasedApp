"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { User } from "@/lib/db/schema";

// Add currentUser type and state
type CurrentUser = {
  id: number;
  role: string;
};

type Department = "Engineering" | "Marketing" | "Sales" | "Operations";
const departments: Department[] = [
  "Engineering",
  "Marketing",
  "Sales",
  "Operations",
];

type Role = "admin" | "member" | "owner";
const roles: Role[] = ["admin", "member", "owner"];

// ...existing User, Department, Role types...

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [tableLoading, setTableLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchUsers(), fetchCurrentUser()]);
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
      setTableLoading(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    }
  };

  // Add function to fetch current user
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (!response.ok) throw new Error("Failed to fetch current user");
      const data = await response.json();
      setCurrentUser(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch current user",
        variant: "destructive",
      });
    }
  };

  // ...existing fetchUsers function...

  const handleRoleChange = async (userId: number, newRole: Role) => {
    if (!isAdmin) return;

    setIsLoading((prev) => ({ ...prev, [`role_${userId}`]: true }));
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error("Failed to update role");

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, [`role_${userId}`]: false }));
    }
  };

  const handleDepartmentChange = async (
    userId: number,
    newDepartment: Department
  ) => {
    if (!isAdmin) return;

    setIsLoading((prev) => ({ ...prev, [`dept_${userId}`]: true }));
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ department: newDepartment }),
      });

      if (!response.ok) throw new Error("Failed to update department");

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, department: newDepartment } : user
        )
      );

      toast({
        title: "Success",
        description: "User department updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user department",
        variant: "destructive",
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, [`dept_${userId}`]: false }));
    }
  };

  // Add isAdmin check
  const isAdmin = currentUser?.role === "admin";

  // Modify the table row rendering to conditionally render editable selects
  const renderRoleCell = (user: User) => {
    if (isAdmin) {
      return (
        <div className="flex items-center gap-2">
          <Select
            value={user.role}
            onValueChange={(value: Role) => handleRoleChange(user.id, value)}
            disabled={isLoading[`role_${user.id}`]}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isLoading[`role_${user.id}`] && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
        </div>
      );
    }
    return <div className="text-sm text-gray-500">{user.role}</div>;
  };

  const renderDepartmentCell = (user: User) => {
    if (isAdmin) {
      return (
        <div className="flex items-center gap-2">
          <Select
            value={user.department || "Engineering"}
            onValueChange={(value: Department) =>
              handleDepartmentChange(user.id, value)
            }
            disabled={isLoading[`dept_${user.id}`]}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isLoading[`dept_${user.id}`] && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
        </div>
      );
    }
    return (
      <div className="text-sm text-gray-500">
        {user.department || "Engineering"}
      </div>
    );
  };

  // Update the return statement to use the new render functions
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        {/* ...existing table header... */}
        <div className="divide-y divide-gray-200 bg-white">
          {users.map((user) => (
            <div key={user.id} className="grid grid-cols-4 gap-4 px-6 py-4">
              <div className="text-sm font-medium text-gray-900">
                {user.name || "N/A"}
              </div>
              <div className="text-sm text-gray-500">{user.email}</div>
              {renderRoleCell(user)}
              {renderDepartmentCell(user)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
