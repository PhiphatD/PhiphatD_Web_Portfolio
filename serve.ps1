# Simple static file server in PowerShell using HttpListener
param(
  [int]$Port = 8000
)

Add-Type -AssemblyName System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
try {
  $listener.Start()
  Write-Host "Serving $(Get-Location) at $prefix (Ctrl+C to stop)"
} catch {
  Write-Error ("Failed to start server on {0}: {1}" -f $prefix, $_)
  exit 1
}

# Basic mime types
$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".htm"  = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".svg"  = "image/svg+xml"
  ".webp" = "image/webp"
  ".pdf"  = "application/pdf"
  ".ico"  = "image/x-icon"
}

while ($true) {
  try {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $path = $request.Url.AbsolutePath.TrimStart('/')
    if ([string]::IsNullOrWhiteSpace($path)) { $path = 'index.html' }
    $path = [System.Uri]::UnescapeDataString($path)
    $fullPath = Join-Path -Path (Get-Location) -ChildPath $path

    if (Test-Path $fullPath -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($fullPath).ToLowerInvariant()
      $contentType = $mime[$ext]
      if (-not $contentType) { $contentType = 'application/octet-stream' }
      $bytes = [System.IO.File]::ReadAllBytes($fullPath)
      $response.StatusCode = 200
      $response.ContentType = $contentType
      $response.ContentLength64 = $bytes.Length
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $msg = "404 Not Found"
      $bytes = [System.Text.Encoding]::UTF8.GetBytes($msg)
      $response.StatusCode = 404
      $response.ContentType = 'text/plain; charset=utf-8'
      $response.ContentLength64 = $bytes.Length
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
    }
    $response.OutputStream.Close()
  } catch {
    Write-Error $_
  }
}