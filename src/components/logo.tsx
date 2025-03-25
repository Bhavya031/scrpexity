import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full blur-xl opacity-70 minimal-gradient"></div>

      {/* Logo container */}
      <div className="relative rounded-full p-4 flex items-center justify-center bg-background/80 backdrop-blur-sm border border-white/10">
        {/* Simple, minimal logo */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          <path
            d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z"
            stroke="url(#paint0_linear)"
            strokeWidth="2"
          />
          <path d="M12 8V16" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <defs>
            <linearGradient id="paint0_linear" x1="3" y1="12" x2="21" y2="12" gradientUnits="userSpaceOnUse">
              <stop stopColor="hsl(330, 85%, 60%)" />
              <stop offset="1" stopColor="hsl(25, 95%, 53%)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}

