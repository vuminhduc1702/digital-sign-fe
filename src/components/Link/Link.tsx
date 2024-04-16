import {
  Link as RouterLink,
  NavLink as RouterNavLink,
  type LinkProps,
  type NavLinkProps,
} from 'react-router-dom'
import { forwardRef } from 'react'

import { cn } from '~/utils/misc'

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <RouterLink
        className={cn('group', className)}
        ref={forwardedRef}
        {...props}
      >
        {children}
      </RouterLink>
    )
  },
)
Link.displayName = 'Link'

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <RouterNavLink
        className={cn('group', className)}
        ref={forwardedRef}
        {...props}
      >
        {children}
      </RouterNavLink>
    )
  },
)
NavLink.displayName = 'NavLink'
