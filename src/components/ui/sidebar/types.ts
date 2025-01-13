import { type VariantProps } from "class-variance-authority"
import { type ReactNode } from "react"

export type SidebarState = "expanded" | "collapsed"

export interface SidebarContext {
  state: SidebarState
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

export interface SidebarProviderProps extends React.ComponentProps<"div"> {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export interface SidebarProps extends React.ComponentProps<"div"> {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}

export interface SidebarMenuButtonProps extends React.ComponentProps<"button"> {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string | React.ComponentProps<"div">
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg"
}

export interface SidebarMenuItemProps extends React.ComponentProps<"li"> {
  icon?: React.ElementType
  label: string
  isActive?: boolean
}

export interface SidebarGroupProps extends React.ComponentProps<"div"> {
  label?: string
  action?: ReactNode
}