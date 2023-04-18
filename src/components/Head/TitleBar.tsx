function TitleBar({ title }: { title: string }) {
  return (
    <h2 className="flex h-9 items-center rounded-tr-md bg-primary-400 pl-11 text-h2 uppercase text-white">
      {title}
    </h2>
  )
}

export default TitleBar
