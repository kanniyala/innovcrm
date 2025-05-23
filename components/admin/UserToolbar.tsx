"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import Link from "next/link";

interface UserToolbarProps {
  onRefresh: () => void;
}

export function UserToolbar({ onRefresh }: UserToolbarProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex-1 min-w-[300px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-10"
          />
        </div>
      </div>

      <Link href="/admin/users/new" className="ml-auto">
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </Link>
    </div>
  );
}