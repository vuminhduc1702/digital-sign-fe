import { APP_VERSION } from '~/config'

export function VersionPage() {
  const version = {
    Name: 'IoT Platform',
    Organization:
      'Viettel High Technology Industries Corporation - Viettel Group',
    Version: APP_VERSION,
  }
  const versionJson = JSON.stringify(version, null, 2)
  return <div>{versionJson}</div>
}
