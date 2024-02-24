export function VersionPage() {
  const version = {
    Name: 'IoT Platform',
    Organization:
      'Viettel High Technology Industries Corporation - Viettel Group',
    Version: '0.2.5',
    'Build Date': '24/02/2024',
  }
  const versionJson = JSON.stringify(version, null, 2)
  return <div>{versionJson}</div>
}
