import { Spinner } from "../Spinner"

export const Loading = () => {
    return <div className="absolute flex items-center justify-center h-screen w-screen bg-black opacity-30">
        <Spinner size="lg" className="text-primary-400"/>
    </div>
}