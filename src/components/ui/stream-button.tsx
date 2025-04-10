"use client"

import type * as React from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface StreamButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  streamUrl: string
  variant?: ButtonProps["variant"]
  size?: ButtonProps["size"]
}

export function StreamButton({ streamUrl, variant = "outline", size = "sm", className, ...props }: StreamButtonProps) {
  const handleClick = () => {
    window.open(streamUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn("gap-1 font-medium", className)}
      {...props}
    >
      STREAM
      <ExternalLink className="h-3.5 w-3.5" />
    </Button>
  )
}
