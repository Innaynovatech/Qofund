import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  ChevronDown,
  LoaderCircle,
  UserRound,
  X,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Input } from "@/components/ui/input";
import { useGetInitials } from "../utils/useGetInitials";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";

export interface HeaderUser {
  name: string;
  avatarUrl?: string;
}

interface HeaderProps {
  user: HeaderUser;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  hasUnreadNotifications?: boolean;
  onNotificationsClick?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onLogout?: () => void;

  onUserUpdated?: (user: HeaderUser) => void;
}

interface UserProfile {
  userId?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  phone?: string;
  avatarUrl?: string;
  [key: string]: unknown;
}

const API_BASE_URL = "https://localhost:7062";

export default function Header({
  user,
  searchPlaceholder = "Search loan, customer, transaction",
  onSearch,
  hasUnreadNotifications = false,
  onNotificationsClick,
  onProfileClick,
  onSettingsClick,
  onLogout,
  onUserUpdated,
}: HeaderProps) {
  const navigate = useNavigate();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const handleProfile = async () => {
    setIsProfileOpen(true);
    setProfileError("");
    setIsLoadingProfile(true);

    try {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        navigate("/login", { replace: true });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/Auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Unable to load profile. Server returned ${response.status}.`
        );
      }

      // The /api/Auth/me endpoint returns the user object directly.
      const data: UserProfile = await response.json();

      setProfile(data);

      const fullName =
        [data.firstName, data.lastName]
          .filter(
            (part): part is string =>
              typeof part === "string" && part.trim().length > 0
          )
          .join(" ") ||
        data.name ||
        data.email ||
        "User";

      const updatedUser: HeaderUser = {
        name: fullName,
        avatarUrl: data.avatarUrl ?? user.avatarUrl,
      };

      // Update the parent component so the header stays synchronized.
      onUserUpdated?.(updatedUser);

      // Persist the latest profile for the next page load.
      localStorage.setItem(
        "user",
        JSON.stringify({
          userId: data.userId ?? data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          avatarUrl: data.avatarUrl,
        })
      );

      onProfileClick?.();
    } catch (error) {
      console.error("Unable to load authenticated user profile:", error);

      setProfileError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while loading your profile."
      );
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    const refreshToken = localStorage.getItem("refreshToken");
    const accessToken = localStorage.getItem("accessToken");

    try {
      if (refreshToken) {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`;
        }

        const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: "POST",
          headers,
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          console.error(
            "Logout API request failed:",
            response.status,
            await response.text()
          );
        }
      }
    } catch (error) {
      console.error("Unable to reach logout endpoint:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      onLogout?.();
      navigate("/login", { replace: true });
      setIsLoggingOut(false);
    }
  };

  const displayName = profile
    ? [profile.firstName, profile.lastName]
        .filter((part) => typeof part === "string" && part.trim())
        .join(" ") ||
      profile.name ||
      profile.email ||
      user.name
    : user.name;

  const profileFields: { label: string; value: unknown }[] = [
    {
      label: "User ID",
      value: profile?.userId ?? profile?.id,
    },
    {
      label: "First name",
      value: profile?.firstName,
    },
    {
      label: "Last name",
      value: profile?.lastName,
    },
    {
      label: "Email",
      value: profile?.email,
    },
    {
      label: "Phone number",
      value: profile?.phoneNumber ?? profile?.phone,
    },
  ];

  return (
    <>
      <header className="flex h-12 items-center justify-end gap-4 border-b border-[#E7E7E7] bg-white px-6">
        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch?.(e.target.value)}
            className="rounded-full bg-slate-50 pl-9"
          />
        </div>

        {/* Notifications and user menu */}
        <div className="flex shrink-0 items-center gap-4">
          <button
            type="button"
            onClick={onNotificationsClick}
            className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />

            {hasUnreadNotifications && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            )}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full pr-1"
                disabled={isLoggingOut}
              >
                <Avatar>
                  <AvatarImage
                    src={profile?.avatarUrl ?? user.avatarUrl}
                    alt={displayName}
                  />
                  <AvatarFallback>
                    {useGetInitials(displayName)}
                  </AvatarFallback>
                </Avatar>

                <span className="text-sm font-medium text-slate-700">
                  {displayName}
                </span>

                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={handleProfile}>
                <UserRound className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem onClick={onSettingsClick}>
                Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-red-600 focus:text-red-600"
              >
                {isLoggingOut ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Logging out...
                  </>
                ) : (
                  "Log out"
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Profile dialog */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsProfileOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-title"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2
                id="profile-title"
                className="text-lg font-semibold text-slate-900"
              >
                My Profile
              </h2>

              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close profile"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isLoadingProfile ? (
              <div className="flex items-center justify-center gap-2 py-10 text-slate-500">
                <LoaderCircle className="h-5 w-5 animate-spin" />
                Loading profile...
              </div>
            ) : profileError ? (
              <div className="space-y-4 py-4">
                <p className="text-sm text-red-600">{profileError}</p>

                <button
                  type="button"
                  onClick={handleProfile}
                  className="rounded-md bg-[#007D53] px-4 py-2 text-sm font-medium text-white hover:bg-[#006747]"
                >
                  Try again
                </button>
              </div>
            ) : profile ? (
              <>
                <div className="mb-6 flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage
                      src={profile.avatarUrl ?? user.avatarUrl}
                      alt={displayName}
                    />
                    <AvatarFallback>
                      {useGetInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">
                      {displayName}
                    </p>
                    <p className="break-all text-sm text-slate-500">
                      {profile.email ?? "No email available"}
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {profileFields
                    .filter(
                      (field) =>
                        field.value !== undefined &&
                        field.value !== null &&
                        field.value !== ""
                    )
                    .map((field) => (
                      <div
                        key={field.label}
                        className="grid grid-cols-3 gap-3 py-3 text-sm"
                      >
                        <span className="text-slate-500">
                          {field.label}
                        </span>
                        <span className="col-span-2 break-words font-medium text-slate-800">
                          {String(field.value)}
                        </span>
                      </div>
                    ))}
                </div>
              </>
            ) : (
              <p className="py-6 text-sm text-slate-500">
                No profile information was returned by the server.
              </p>
            )}
          </section>
        </div>
      )}
    </>
  );
}
