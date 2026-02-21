"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/lib/firebase/auth-context";
import { logOut, updateUserProfile } from "@/lib/firebase/auth";
import {
  createFamilyLink,
  subscribeFamilyLinks,
  removeFamilyLink,
  type FamilyLink,
} from "@/lib/firebase/family-service";
import { Trash2, Users } from "lucide-react";

export default function SettingsPage() {
  const { user, dataUid } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [saving, setSaving] = useState(false);

  // Family sharing
  const [familyLinks, setFamilyLinks] = useState<FamilyLink[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const isLinked = dataUid !== null && user !== null && dataUid !== user.uid;

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeFamilyLinks(user.uid, setFamilyLinks);
    return unsub;
  }, [user]);

  async function handleSave() {
    if (!displayName.trim()) return;
    setSaving(true);
    try {
      await updateUserProfile(displayName.trim());
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await logOut();
    router.push("/");
  }

  async function handleAddMember() {
    if (!user || !user.email || !newMemberEmail.trim()) return;
    const email = newMemberEmail.trim().toLowerCase();
    if (email === user.email?.toLowerCase()) {
      toast.error("You can't add yourself");
      return;
    }
    if (familyLinks.some((l) => l.memberEmail === email)) {
      toast.error("This email is already linked");
      return;
    }
    setAddingMember(true);
    try {
      await createFamilyLink(user.uid, user.email, email);
      setNewMemberEmail("");
      toast.success("Family member added");
    } catch {
      toast.error("Failed to add family member");
    } finally {
      setAddingMember(false);
    }
  }

  async function handleRemoveMember(linkId: string) {
    try {
      await removeFamilyLink(linkId);
      toast.success("Family member removed");
    } catch {
      toast.error("Failed to remove family member");
    }
  }

  return (
    <>
      <PageHeader title="Settings" description="Manage your account" />

      <div className="max-w-lg space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display-name">Display name</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email ?? ""}
                disabled
                className="bg-muted"
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={saving || !displayName.trim()}
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Family Sharing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLinked ? (
              <p className="text-sm text-muted-foreground">
                You are currently sharing data with another account. All meals
                and plans are synced with the family owner.
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Add family members by email so they can share your meals and
                  weekly plans. They will see and edit the same data as you.
                </p>

                {familyLinks.length > 0 && (
                  <div className="space-y-2">
                    <Label>Linked members</Label>
                    {familyLinks.map((link) => (
                      <div
                        key={link.id}
                        className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                      >
                        <span className="text-sm">{link.memberEmail}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleRemoveMember(link.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="Family member's email"
                    type="email"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddMember();
                      }
                    }}
                  />
                  <Button
                    onClick={handleAddMember}
                    disabled={addingMember || !newMemberEmail.trim()}
                  >
                    {addingMember ? "Adding..." : "Add"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleSignOut}>
              Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
