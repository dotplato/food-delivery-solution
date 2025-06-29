"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loader from '@/components/ui/loader';

export default function UsersAdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, is_admin")
        .order("full_name");
      if (!error) setUsers(data || []);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">Full Name</th>
                  <th className="text-left">Email</th>
                  <th className="text-left">Admin</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.full_name}</td>
                    <td>{user.email}</td>
                    <td>{user.is_admin ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 