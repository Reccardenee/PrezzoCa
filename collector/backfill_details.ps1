$detailUrl = "https://carburanti.mise.gov.it/ospzApi/registry/servicearea"
$dataPath = "$PSScriptRoot\..\data\2026.json"
$data = Get-Content $dataPath -Raw | ConvertFrom-Json
$cache = @{}
$changed = 0

foreach ($snap in $data) {
    foreach ($st in $snap.stations) {
        $sid = [string]$st.id
        if ($cache.ContainsKey($sid)) { $detail = $cache[$sid] }
        else {
            try {
                $detail = Invoke-RestMethod -Uri "$detailUrl/$sid" -Method GET -ErrorAction Stop
                $cache[$sid] = $detail
            } catch { $detail = $null }
        }
        if (-not $detail) { continue }

        $any = $false
        if ([string]::IsNullOrWhiteSpace($st.address) -and -not [string]::IsNullOrWhiteSpace($detail.address)) {
            $st.address = $detail.address; $any = $true
        }
        if ([string]::IsNullOrWhiteSpace($st.phoneNumber) -and -not [string]::IsNullOrWhiteSpace($detail.phoneNumber)) {
            $st.phoneNumber = $detail.phoneNumber; $any = $true
        }
        if ([string]::IsNullOrWhiteSpace($st.email) -and -not [string]::IsNullOrWhiteSpace($detail.email)) {
            $st.email = $detail.email; $any = $true
        }
        if ([string]::IsNullOrWhiteSpace($st.company) -and -not [string]::IsNullOrWhiteSpace($detail.company)) {
            $st.company = $detail.company; $any = $true
        }
        if ([string]::IsNullOrWhiteSpace($st.website) -and $detail.website) {
            $st.website = $detail.website; $any = $true
        }

        $st
        $any
    }
}

if ($changed -gt 0) {
    $data | ConvertTo-Json -Depth 6 | Set-Content $dataPath -Encoding utf8
    Write-Output "Updated $changed stations"
} else { Write-Output "No changes" }
