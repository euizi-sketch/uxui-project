$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:5500/")
$listener.Start()

Write-Host "Serving $root at http://localhost:5500/"

function Get-ContentType([string]$path) {
  switch ([IO.Path]::GetExtension($path).ToLowerInvariant()) {
    ".html" { return "text/html; charset=utf-8" }
    ".md"   { return "text/markdown; charset=utf-8" }
    ".css"  { return "text/css; charset=utf-8" }
    ".js"   { return "application/javascript; charset=utf-8" }
    ".json" { return "application/json; charset=utf-8" }
    ".png"  { return "image/png" }
    ".jpg"  { return "image/jpeg" }
    ".jpeg" { return "image/jpeg" }
    default { return "application/octet-stream" }
  }
}

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  try {
    $reqPath = $ctx.Request.Url.AbsolutePath.TrimStart("/")
    if ([string]::IsNullOrWhiteSpace($reqPath)) { $reqPath = "index.html" }
    $reqPath = $reqPath -replace "/", "\"
    $filePath = Join-Path $root $reqPath

    if ((Test-Path $filePath) -and -not (Get-Item $filePath).PSIsContainer) {
      $bytes = [IO.File]::ReadAllBytes($filePath)
      $ctx.Response.StatusCode = 200
      $ctx.Response.ContentType = Get-ContentType $filePath
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $msg = [Text.Encoding]::UTF8.GetBytes("404 Not Found")
      $ctx.Response.StatusCode = 404
      $ctx.Response.ContentType = "text/plain; charset=utf-8"
      $ctx.Response.ContentLength64 = $msg.Length
      $ctx.Response.OutputStream.Write($msg, 0, $msg.Length)
    }
  } catch {
    $msg = [Text.Encoding]::UTF8.GetBytes("500 Internal Server Error")
    $ctx.Response.StatusCode = 500
    $ctx.Response.ContentType = "text/plain; charset=utf-8"
    $ctx.Response.ContentLength64 = $msg.Length
    $ctx.Response.OutputStream.Write($msg, 0, $msg.Length)
  } finally {
    $ctx.Response.OutputStream.Close()
  }
}
