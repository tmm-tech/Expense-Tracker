import * as React from "react";
import { forwardRef, useCallback, useEffect } from "react";
import { type VariantProps } from "class-variance-authority";
import { Loader2, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Button, buttonVariants } from "@/components/ui/button";

export interface SignInButtonProps
  extends Omit<React.ComponentProps<"button">, "onClick">,
    VariantProps<typeof buttonVariants> {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  showIcon?: boolean;
  signInText?: string;
  signOutText?: string;
  loadingText?: string;
  asChild?: boolean;
}

export const SignInButton = forwardRef<
  HTMLButtonElement,
  SignInButtonProps
>(
  (
    {
      onClick,
      disabled,
      showIcon = true,
      signInText = "Sign In",
      signOutText = "Sign Out",
      loadingText,
      className,
      variant,
      size,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const {
      isAuthenticated,
      signInWithGoogle,
      signOut,
      loading,
      error,
    } = useAuth();

    useEffect(() => {
      if (error) {
        toast.error("Authentication error", {
          description: error.message,
        });
        console.error("Auth error:", error);
      }
    }, [error]);

    const handleClick = useCallback(
      async (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);

        try {
          if (isAuthenticated) {
            await signOut();
          } else {
            await signInWithGoogle();
          }
        } catch (err) {
          console.error("Authentication action failed:", err);
        }
      },
      [isAuthenticated, signInWithGoogle, signOut, onClick]
    );

    const isDisabled = disabled || loading;
    const defaultLoadingText = isAuthenticated
      ? "Signing Out..."
      : "Signing In...";
    const currentLoadingText = loadingText || defaultLoadingText;

    const buttonText = loading
      ? currentLoadingText
      : isAuthenticated
        ? signOutText
        : signInText;

    const icon = loading ? (
      <Loader2 className="size-4 animate-spin" />
    ) : isAuthenticated ? (
      <LogOut className="size-4" />
    ) : (
      <LogIn className="size-4" />
    );

    return (
      <Button
        ref={ref}
        onClick={handleClick}
        disabled={isDisabled}
        variant={variant}
        size={size}
        className={className}
        asChild={asChild}
        aria-label={
          isAuthenticated
            ? "Sign out of your account"
            : "Sign in to your account"
        }
        {...props}
      >
        {showIcon && icon}
        {buttonText}
      </Button>
    );
  }
);

SignInButton.displayName = "SignInButton";