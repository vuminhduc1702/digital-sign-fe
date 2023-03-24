import { useSpinDelay } from 'spin-delay'
import { Spinner } from '~/components/Spinner/Spinner'

function Cloudpage() {
  const showSpinner = useSpinDelay(true, {
    delay: 150,
    minDuration: 300,
  })

  return (
    <div className="bg-secondary-500">
      Cloud page
      {/* <Spinner showSpinner={showSpinner} size="xl" /> */}
    </div>
  )
}

export default Cloudpage
