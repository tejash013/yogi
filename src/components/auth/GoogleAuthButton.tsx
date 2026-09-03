import { useEffect, useRef, useState } from 'react';
import { useNavigate, type NavigateFunction } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { useAuthStore } from '@/store';

export function redirectByRole(navigate: NavigateFunction, role?: string) {
  if (role === 'platformAdmin') {
    navigate(ROUTES.WORKSPACE);
  } else if (role === 'owner') {
    navigate(ROUTES.OWNER.DASHBOARD);
  } else if (role === 'manager') {
    navigate(ROUTES.ADMIN.DASHBOARD);
  } else if (role === 'chef') {
    navigate(ROUTES.KITCHEN.DASHBOARD);
  } else if (role === 'cashier') {
    navigate(ROUTES.CASHIER.DASHBOARD);
  } else {
    navigate(ROUTES.CUSTOMER.HOME);
  }
}

interface GoogleAuthButtonProps {
  mode?: 'signin' | 'signup';
  onSuccess?: () => void;
  className?: string;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: (notification?: (notification: any) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}

export default function GoogleAuthButton({
  mode = 'signin',
  onSuccess,
  className = '',
}: GoogleAuthButtonProps) {
  const navigate = useNavigate();
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const isLoading = useAuthStore((state) => state.isLoading);
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);
  const [configNotice, setConfigNotice] = useState<string | null>(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

  useEffect(() => {
    if (!googleClientId) return;

    let isCancelled = false;

    function initGoogle() {
      if (isCancelled || !window.google?.accounts?.id || !googleBtnContainerRef.current) return;

      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: { credential?: string }) => {
            if (!response?.credential) return;
            try {
              await loginWithGoogle(response.credential);
              const role = useAuthStore.getState().user?.role;
              if (onSuccess) {
                onSuccess();
              } else {
                redirectByRole(navigate, role);
              }
            } catch {
              // Store error is rendered in page
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Clear container and render official GIS button
        googleBtnContainerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: mode === 'signup' ? 'signup_with' : 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: '100%',
        });
      } catch (err) {
        console.warn('Google Identity Services initialization warning:', err);
      }
    }

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const existingScript = document.getElementById('google-identity-services');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'google-identity-services';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => initGoogle();
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener('load', initGoogle);
      }
    }

    return () => {
      isCancelled = true;
    };
  }, [googleClientId, loginWithGoogle, mode, navigate, onSuccess]);

  const handleManualClick = () => {
    if (!googleClientId) {
      setConfigNotice(
        'Google OAuth is not configured yet. Add VITE_GOOGLE_CLIENT_ID to your .env file with your Google Cloud Client ID to enable 1-click Google authentication.'
      );
      return;
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Official Google Identity Services container when Client ID is configured */}
      {googleClientId && (
        <div
          ref={googleBtnContainerRef}
          className="flex w-full justify-center [&>div]:!w-full [&>div>iframe]:!w-full [&>div>iframe]:!rounded-xl"
        />
      )}

      {/* Styled fallback button if GIS is loading, not yet rendered, or Client ID is unconfigured */}
      {(!googleClientId || !window.google?.accounts?.id) && (
        <button
          type="button"
          onClick={handleManualClick}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-neutral-50 hover:shadow-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-500"
        >
          <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M5.266 9.765A7.077 7.077 0 0112 4.91c1.665 0 3.158.613 4.303 1.626l3.196-3.196A11.954 11.954 0 0012 0C7.667 0 3.855 2.322 1.8 5.715l3.466 4.05z"
            />
            <path
              fill="#34A853"
              d="M16.693 19.626A7.048 7.048 0 0112 21.09c-3.876 0-7.178-2.623-8.336-6.243l-3.466 4.05A11.96 11.96 0 0012 24c3.27 0 6.286-1.323 8.463-3.596l-3.77-2.778z"
            />
            <path
              fill="#FBBC05"
              d="M5.337 14.268A7.12 7.12 0 014.89 12c0-.723.12-1.44.348-2.118L1.8 5.715A11.89 11.89 0 000 12c0 2.308.653 4.494 1.82 6.45l3.517-4.182z"
            />
            <path
              fill="#4285F4"
              d="M12 21.09c2.427 0 4.636-.98 6.255-2.56l3.77 2.778C20.338 21.183 16.478 24 12 24V21.09z"
            />
            <path
              fill="#34A853"
              d="M22.637 12c0-.789-.07-1.575-.21-2.34H12v4.364h6.016a5.68 5.68 0 01-1.973 2.634l3.77 2.778c2.172-2.052 3.484-5.056 3.484-8.436z"
            />
          </svg>
          <span>{mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}</span>
        </button>
      )}

      {configNotice && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300">
          <div className="flex items-start gap-2">
            <span className="font-bold">Info:</span>
            <span className="flex-1">{configNotice}</span>
            <button
              type="button"
              onClick={() => setConfigNotice(null)}
              className="font-medium underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
