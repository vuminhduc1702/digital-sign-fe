import { Helmet } from 'react-helmet-async'

type HeadProps = {
  title?: string
  description?: string
}

export const Head = ({ title = '', description = '' }: HeadProps = {}) => {
  return (
    <Helmet
      title={title ? `${title} | IoT Platform` : undefined}
      defaultTitle="IoT Platform"
    >
      <meta name="description" content={description} />
      <link
        rel="icon"
        href="public/favicon.svg"
        sizes="512x512"
        type="image/svg+xml"
      />
    </Helmet>
  )
}
