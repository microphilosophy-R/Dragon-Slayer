
Add-Type -AssemblyName System.Drawing

$srcPath = "src/images/mouse.png"
$outNormal = "public/cursor.png"
$outActive = "public/cursor_active.png"

if (-not (Test-Path $srcPath)) {
    Write-Error "Source image not found at $srcPath"
    exit 1
}

# 1. Load Original
$srcImg = [System.Drawing.Image]::FromFile($srcPath)
Write-Host "Loaded source image ($($srcImg.Width)x$($srcImg.Height))"

# 2. Resize to 64x64 (Higher Res)
$width = 64
$height = 64
$bmp = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($srcImg, 0, 0, $width, $height)
$g.Dispose()

# 3. Apply Transparency with Tolerance
$bg = $bmp.GetPixel(0, 0)
# Tolerance threshold (sum of RGB differences)
$threshold = 30 

for ($x = 0; $x -lt $bmp.Width; $x++) {
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        $cw = $bmp.GetPixel($x, $y)
        
        # Calculate difference
        $diff = [Math]::Abs($cw.R - $bg.R) + [Math]::Abs($cw.G - $bg.G) + [Math]::Abs($cw.B - $bg.B)
        
        if ($diff -lt $threshold) {
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
        }
    }
}

$bmp.Save($outNormal, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Created $outNormal"

# 4. Create Active State (Scaled 90% to simulate click)
$bmpActive = New-Object System.Drawing.Bitmap($width, $height)
$gActive = [System.Drawing.Graphics]::FromImage($bmpActive)
$gActive.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# Draw scaled and centered
$scale = 0.9
$newW = [int]($width * $scale)
$newH = [int]($height * $scale)
$offX = [int](($width - $newW) / 2)
$offY = [int](($height - $newH) / 2)

$gActive.DrawImage($bmp, $offX, $offY, $newW, $newH)
$gActive.Dispose()

$bmpActive.Save($outActive, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Created $outActive"

# Cleanup
$bmp.Dispose()
$bmpActive.Dispose()
$srcImg.Dispose()
