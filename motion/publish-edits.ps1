# Re-render both deck edits, web-encode them into public/video, rebuild the site and push.
$ErrorActionPreference = 'Stop'
$P = Split-Path $PSScriptRoot -Parent
$ff = (Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Gyan.FFmpeg*\*\bin\ffmpeg.exe")[0].FullName

foreach ($e in @(@{ dir = 'semi-edit'; out = 'semiconductor'; poster = 30 }, @{ dir = 'virt-edit'; out = 'virtualisation'; poster = 14 })) {
  Set-Location "$P\motion\$($e.dir)"
  npx hyperframes render -o "renders\$($e.out)-edit.mp4" --quality delivery --quiet
  $src = "$P\motion\$($e.dir)\renders\$($e.out)-edit.mp4"
  & $ff -v error -y -i $src -vf scale=1280:-2 -c:v libx264 -crf 25 -preset slow -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 112k "$P\public\video\$($e.out).mp4"
  & $ff -v error -y -ss $e.poster -i $src -frames:v 1 -vf scale=1280:-2 "$P\public\video\$($e.out).jpg"
  Write-Output "rendered $($e.out)"
}

Set-Location $P
npx astro build
git add -A
git commit -m "Use the live site address on the video end cards and in metadata`n`nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
Write-Output 'PUBLISHED'
