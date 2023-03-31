import clsx from 'clsx'
import {
  Link as RouterLink,
  NavLink as RouterNavLink,
  type LinkProps,
  type NavLinkProps,
} from 'react-router-dom'
import { forwardRef } from 'react'

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <RouterLink
        className={clsx('group', className)}
        ref={forwardedRef}
        {...props}
      >
        {children}
      </RouterLink>
    )
  },
)

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <RouterNavLink
        className={clsx('group', className)}
        ref={forwardedRef}
        {...props}
      >
        {children}
      </RouterNavLink>
    )
  },
)
