import { Spinner } from "../Spinner"

export const Loading = () => {
    return <div className="fixed z-10 flex items-center justify-center h-screen w-full bg-white opacity-40">
        <Spinner size="lg" className="text-primary-400"/>
    </div>
}