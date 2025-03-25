"use client"

import { Separator } from "@/components/ui/separator"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronLeft, ChevronRight, Menu } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"

const SidebarContext = React.createContext<{
  collapsed: boolean
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  collapsible: "always" | "mobile" | "none"
  width: number
  setWidth: React.Dispatch<React.SetStateAction<number>>
  resizable: boolean
  isResizing: boolean
  setIsResizing: React.Dispatch<React.SetStateAction<boolean>>
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}>({
  collapsed: false,
  setCollapsed: () => {},
  collapsible: "always",
  width: 260,
  setWidth: () => {},
  resizable: false,
  isResizing: false,
  setIsResizing: () => {},
  isOpen: false,
  setIsOpen: () => {},
})

export function useSidebar() {
  return React.useContext(SidebarContext)
}

export const SidebarProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [collapsed, setCollapsed] = React.useState(false)
  const [width, setWidth] = React.useState(260)
  const [isResizing, setIsResizing] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        setCollapsed,
        collapsible: "always",
        width,
        setWidth,
        resizable: false,
        isResizing,
        setIsResizing,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    collapsible?: "always" | "mobile" | "none"
    defaultCollapsed?: boolean
    resizable?: boolean
    minWidth?: number
    maxWidth?: number
    defaultWidth?: number
  }
>(
  (
    {
      className,
      collapsible = "always",
      defaultCollapsed = false,
      resizable = false,
      minWidth = 200,
      maxWidth = 500,
      defaultWidth = 260,
      ...props
    },
    ref,
  ) => {
    const [collapsed, setCollapsed] = React.useState(defaultCollapsed)
    const [width, setWidth] = React.useState(defaultWidth)
    const [isResizing, setIsResizing] = React.useState(false)
    const [isOpen, setIsOpen] = React.useState(false)
    const isMobile = useMobile()

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event.preventDefault()
      event.stopPropagation()

      setIsResizing(true)

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (isResizing) {
        let newWidth = event.clientX

        if (newWidth < minWidth) {
          newWidth = minWidth
        }

        if (newWidth > maxWidth) {
          newWidth = maxWidth
        }

        setWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)

      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    React.useEffect(() => {
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }, [isResizing])

    return (
      <SidebarContext.Provider
        value={{
          collapsed,
          setCollapsed,
          collapsible,
          width,
          setWidth,
          resizable,
          isResizing,
          setIsResizing,
          isOpen,
          setIsOpen,
        }}
      >
        <div
          ref={ref}
          className={cn(
            "group relative flex h-full flex-col",
            isMobile && "w-full",
            !isMobile && [resizable && "resize-x", collapsed ? "w-16" : `w-[${width}px]`],
            isResizing && "select-none",
            className,
          )}
          style={{
            width: isMobile ? "100%" : collapsed ? "64px" : `${width}px`,
          }}
          {...props}
        />
        {resizable && !collapsed && (
          <div
            onMouseDown={handleMouseDown}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 h-full w-1 cursor-ew-resize bg-transparent opacity-0 transition-all group-hover:bg-accent group-hover:opacity-100"
          />
        )}
      </SidebarContext.Provider>
    )
  },
)
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex h-14 items-center px-4", className)} {...props} />
  ),
)
SidebarHeader.displayName = "SidebarHeader"

const SidebarHeaderTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { collapsed } = useSidebar()

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-2 font-semibold", collapsed && "sr-only", className)}
        {...props}
      />
    )
  },
)
SidebarHeaderTitle.displayName = "SidebarHeaderTitle"

const SidebarHeaderAction = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    const { collapsed } = useSidebar()

    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        className={cn("ml-auto h-8 w-8", collapsed && "sr-only", className)}
        {...props}
      />
    )
  },
)
SidebarHeaderAction.displayName = "SidebarHeaderAction"

const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex-1 overflow-auto", className)} {...props} />,
)
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex flex-col gap-4 p-4", className)} {...props} />,
)
SidebarFooter.displayName = "SidebarFooter"

const SidebarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { collapsed } = useSidebar()

    return <div ref={ref} className={cn("flex flex-col gap-4 px-4 py-2", collapsed && "px-2", className)} {...props} />
  },
)
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { collapsed } = useSidebar()

    return (
      <div
        ref={ref}
        className={cn(
          "flex h-6 items-center text-xs font-medium text-muted-foreground",
          collapsed && "sr-only",
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { collapsed } = useSidebar()

    return <div ref={ref} className={cn("flex flex-col gap-1", collapsed && "items-center", className)} {...props} />
  },
)
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenu = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { collapsed } = useSidebar()

    return <div ref={ref} className={cn("flex flex-col gap-1", collapsed && "items-center", className)} {...props} />
  },
)
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex cursor-pointer items-center", className)} {...props} />
  ),
)
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarMenuButtonVariants = cva("group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium", {
  variants: {
    variant: {
      default: "hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
    },
    isActive: {
      true: "bg-accent text-accent-foreground",
      false: "text-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
    isActive: false,
  },
})

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean
  icon?: React.ReactNode
  badge?: React.ReactNode
}

const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, variant, isActive, asChild = false, icon, badge, children, ...props }, ref) => {
    const { collapsed } = useSidebar()
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        ref={ref}
        className={cn(sidebarMenuButtonVariants({ variant, isActive }), collapsed && "justify-center px-0", className)}
        {...props}
      >
        {icon && <span className="flex h-5 w-5 items-center justify-center">{icon}</span>}
        {!collapsed && children}
        {!collapsed && badge && <span className="ml-auto flex h-5 w-5 items-center justify-center">{badge}</span>}
      </Comp>
    )
  },
)
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentPropsWithoutRef<typeof Separator>
>(({ className, ...props }, ref) => {
  const { collapsed } = useSidebar()

  return <Separator ref={ref} className={cn("mx-4 my-2", collapsed && "mx-2", className)} {...props} />
})
SidebarSeparator.displayName = "SidebarSeparator"

const SidebarTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    const { collapsed, setCollapsed, collapsible } = useSidebar()
    const isMobile = useMobile()
    const { isOpen, setIsOpen } = useSidebar()

    if (collapsible === "none") {
      return null
    }

    if (collapsible === "mobile" && !isMobile) {
      return null
    }

    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        className={cn("h-9 w-9", className)}
        onClick={() => {
          if (isMobile) {
            setIsOpen(!isOpen)
          } else {
            setCollapsed(!collapsed)
          }
        }}
        {...props}
      >
        <Menu className="h-4 w-4" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
    )
  },
)
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarRail = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { collapsed, setCollapsed, collapsible } = useSidebar()

    if (collapsible === "none") {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "absolute right-0 top-0 h-full w-1 cursor-ew-resize bg-transparent opacity-0 transition-all group-hover:bg-accent group-hover:opacity-100",
          className,
        )}
        {...props}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-8 h-6 w-6 rounded-full bg-accent opacity-0 shadow-sm group-hover:opacity-100"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          <span className="sr-only">{collapsed ? "Expand" : "Collapse"}</span>
        </Button>
      </div>
    )
  },
)
SidebarRail.displayName = "SidebarRail"

const SidebarInset = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { isOpen } = useSidebar()
    const isMobile = useMobile()

    return (
      <div
        ref={ref}
        className={cn("flex h-full flex-1 flex-col", isMobile && isOpen && "hidden", className)}
        {...props}
      />
    )
  },
)
SidebarInset.displayName = "SidebarInset"

export {
  Sidebar,
  SidebarHeader,
  SidebarHeaderTitle,
  SidebarHeaderAction,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,
}

