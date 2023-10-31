import { NavLink } from "~/components/Link"
import { OrgGroupIcon, OrgInfoIcon } from '~/components/SVGIcons'
import { PATHS } from "~/routes/PATHS"

export default function AiNavbar() {
    
    return (
      <div className="flex h-[60px] items-center justify-around bg-secondary-400 px-10">
        <NavLink
          to={PATHS.DDOS}
          className="flex cursor-pointer gap-2"
        >
          <OrgInfoIcon
            className="text-secondary-700 group-hover:text-primary-400 group-[.active]:text-primary-400"
            width={20}
            height={20}
            viewBox="0 0 20 20"
          />
          <p className="group-hover:text-primary-400 group-[.active]:text-primary-400">
            Ddos
          </p>
        </NavLink>
        <NavLink
          to={PATHS.FUEL}
          className="flex cursor-pointer gap-2"
        >
          <OrgGroupIcon
            className="text-secondary-700 group-hover:text-primary-400 group-[.active]:text-primary-400"
            width={20}
            height={20}
            viewBox="0 0 20 20"
          />
          <p className="group-hover:text-primary-400 group-[.active]:text-primary-400">
            Fuel
          </p>
        </NavLink>
      </div>
    )
  }