import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { CheckCircle2, XCircle, AlertTriangle, Info, Loader2 } from "lucide-react";
import "./globals.css";
import { Providers } from "./Providers";

// Matches this app's own lucide-react icon language (used everywhere else —
// PlanCard's AlertTriangle, DevTestingPanel's CheckCircle2, etc.) instead of
// sonner's bundled default icons, which look visually out of place here.
const TOAST_ICONS = {
  success: <CheckCircle2 size={20} className="text-success-400" />,
  error: <XCircle size={20} className="text-error-400" />,
  warning: <AlertTriangle size={20} className="text-warning-400" />,
  info: <Info size={20} className="text-info-400" />,
  loading: <Loader2 size={20} className="text-muted-foreground animate-spin" />,
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NexusOne",
  description: "NexusOne",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var persisted = localStorage.getItem('persist:theme');
                  var theme = 'dark';
                  if (persisted) {
                    try { theme = JSON.parse(JSON.parse(persisted).theme) || 'dark'; } catch(e) {}
                  }
                  if (theme === 'dark') {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.setAttribute('data-theme', 'light');
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            offset={{ top: 80, right: 10 }}
            icons={TOAST_ICONS}
            toastOptions={{
              // Tailwind v4 uses a TRAILING `!` for the important modifier
              // (e.g. `bg-red-500!`), not a leading one — sonner's own
              // [data-sonner-toast] CSS otherwise wins over unmarked utilities.
              unstyled: true,
              classNames: {
                // OPAQUE themed card. Severity is conveyed by the colored
                // border + the colored icon only — NOT a translucent bg fill.
                // A `bg-error/8`-style tint would override this opaque base
                // (both are !important) and leave the toast ~92% transparent,
                // letting page content behind it bleed through. Keep it solid.
                toast:
                  "flex items-start gap-3 w-[420px] p-3.5 px-5 rounded-lg shadow-lg border " +
                  "bg-(--custom-table-bg)! border-(--custom-table-border)! text-foreground!",
                title: "text-foreground! font-semibold! text-sm!",
                description: "text-muted-foreground! text-xs! mt-0.5!",
                icon: "shrink-0 flex items-center justify-center mt-0.5",
                content: "flex-1 min-w-0",
                actionButton:
                  "bg-info/15! border border-info/30! text-info-400! text-xs! font-medium! rounded-lg! px-2.5! py-1.5!",
                cancelButton:
                  "bg-(--custom-table-header-bg)! text-muted-foreground! text-xs! font-medium! rounded-lg! px-2.5! py-1.5!",
                closeButton:
                  "bg-transparent! border-none! text-muted-foreground!",
                success: "border-success-400/40!",
                error: "border-error-400/40!",
                warning: "border-warning-400/40!",
                info: "border-info-400/40!",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
