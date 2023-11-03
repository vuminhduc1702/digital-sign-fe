export function VersionPage() {
  const version = {
    Name: 'IoT Platform',
    Organization:
      'Viettel High Technology Industries Corporation - Viettel Group',
    Version: '0.0.3',
    'Build Date': '03/11/2023',
  }
  const versionJson = JSON.stringify(version, null, 2)
  return <div>{versionJson}</div>
}
