import { LazyMotion, domAnimation, m } from 'framer-motion'

export const AnimatedWrapper = ({
  children,
}: {
  children?: JSX.Element | JSX.Element[]
}) => {
  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        className="flex h-full flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        // custom={{ direction: 'forward' }}
        // initial="initial"
        // animate="in"
        // exit="out"
        // variants={MOTION_VARIANTS}
      >
        {children}
      </m.div>
    </LazyMotion>
  )
}
