import { useEffect, useState } from "react";
import { currentUser } from "../auth";

type CurrentUser = {
  profile: { sub: string; name?: string; email?: string };
};

/** The signed-in user's profile, for display only (name/email in the header). */
export function useCurrentUser(): CurrentUser | null {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    void currentUser().then((u) => {
      if (!cancelled && u) {
        setUser({
          profile: {
            sub: u.profile.sub,
            name: (u.profile as { name?: string }).name,
            email: (u.profile as { email?: string }).email,
          },
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return user;
}
