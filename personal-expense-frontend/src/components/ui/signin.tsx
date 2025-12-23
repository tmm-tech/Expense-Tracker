import * as React from "react";
import { forwardRef, useCallback, useEffect } from "react";
import { Loader2, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export interface SignInButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "onClick"> {
  /**
   * Optional callback fired before auth action
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * Show icon inside the button
   * @default true
   */
  showIcon?: boolean;

  /**
   * Text when user is signed out
   * @default "Sign in with Google"
   */
  signInText?: string;

  /**
   * Text when user is signed in
   * @default "Sign out"
   */
  signOutText?: string;

  /**
   * Text while auth action is in progress
   */
  loadingText?: string;
}

/**
 * SignInButton
 *
 * Handles Google sign-in / sign-out via Supabase
 * with proper loading state, accessibility, and error handling.
 */
export const SignInButton = forwardRef<
  HTMLButtonElement,
  SignInButtonProps
>(
  (
    {
      onClick,
      disabled,
      showIcon = true,
      signInText = "Sign in with Google",
      signOutText = "Sign out",
      loadingText,
      className,
      ...props
    },
    ref,
  ) => {
    const {
      session,
      signInWithGoogle,
      signOut,
      loading,
      error,
    } = useAuth();

    const isAuthenticated = !!session;

    // Surface auth errors to user
    useEffect(() => {
      if (error) {
        toast.error("Authentication error", {
          description: error.message,
        });
        console.error("[Auth Error]", error);
      }
    }, [error]);

    const handleClick = useCallback(
      async (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;

        try {
          if (isAuthenticated) {
            await signOut();
          } else {
            await signInWithGoogle();
          }
        } catch (err) {
          console.error("[SignInButton] action failed", err);
        }
      },
      [isAuthenticated, signInWithGoogle, signOut, onClick],
    );

    const isDisabled = disabled || loading;

    const text = loading
      ? loadingText ??
        (isAuthenticated ? "Signing out…" : "Signing in…")
      : isAuthenticated
        ? signOutText
        : signInText;

    const Icon = loading
      ? Loader2
      : isAuthenticated
        ? LogOut
        : LogIn;

    return (
      <Button
        ref={ref}
        onClick={handleClick}
        disabled={isDisabled}
        className={className}
        aria-label={
          isAuthenticated
            ? "Sign out of your account"
            : "Sign in with Google"
        }
        {...props}
      >
        {showIcon && (
          <Icon
            className={`mr-2 h-4 w-4 ${
              loading ? "animate-spin" : ""
            }`}
          />
        )}
        {text}
      </Button>
    );
  },
);

SignInButton.displayName = "SignInButton";