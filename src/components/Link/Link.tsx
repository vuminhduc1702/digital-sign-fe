import clsx from 'clsx'
import {
  Link as RouterLink,
  NavLink as RouterNavLink,
  type LinkProps,
  type NavLinkProps,
} from 'react-router-dom'

export const Link = ({ className, children, ...props }: LinkProps) => {
  return (
    <RouterLink className={clsx('group', className)} {...props}>
      {children}
    </RouterLink>
  )
}

export const NavLink = ({ className, children, ...props }: NavLinkProps) => {
  return (
    <RouterNavLink className={clsx('group', className)} {...props}>
      {children}
    </RouterNavLink>
  )
}
