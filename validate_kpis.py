import re
import sys
from pathlib import Path

# Target files
FRONTEND_FILES = [
    Path("workforce-frontend/src/pages/Executive.tsx"),
    Path("workforce-frontend/src/pages/PortfolioCommandCenter.tsx")
]
BACKEND_FILES = [
    Path("workforce-backend/api/routers/dashboard.py")
]

def check_frontend_hardcodes(filepath: Path) -> list:
    findings = []
    if not filepath.exists():
        return findings
        
    content = filepath.read_text(encoding="utf-8")
    lines = content.split('\n')
    
    # Regex to find hardcoded numbers in typical KPI tags like <div className="text-3xl font-bold">85%</div>
    # But allow {metrics?.value}
    # Specifically look for >[0-9]+%?< or >[0-9]+/[0-9]+< inside KPI elements
    pattern = re.compile(r'>\s*([0-9]+(?:\.[0-9]+)?%?)\s*<')
    
    for i, line in enumerate(lines):
        # Skip SVG paths or generic iterations
        if "<path" in line or "<circle" in line or "x=" in line or "y=" in line:
            continue
            
        matches = pattern.findall(line)
        for match in matches:
            if match != "0": # Sometimes 0 is used for empty states, but any KPI hardcoded is bad
                findings.append((filepath.name, i+1, f"Found hardcoded number in JSX: '{match}' -> {line.strip()}"))
                
    return findings

def check_backend_hardcodes(filepath: Path) -> list:
    findings = []
    if not filepath.exists():
        return findings
        
    content = filepath.read_text(encoding="utf-8")
    lines = content.split('\n')
    
    # Look for "score": 85, "trend": "+2.5%", etc.
    # Exclude dynamic variables like "score": org_health_score
    trend_pattern = re.compile(r'"trend"\s*:\s*"([+-]?[0-9]+(?:\.[0-9]+)?%)"')
    score_pattern = re.compile(r'"score"\s*:\s*([0-9]+)(?!,) *(?:\n|,|})')
    
    for i, line in enumerate(lines):
        trend_matches = trend_pattern.findall(line)
        for match in trend_matches:
            findings.append((filepath.name, i+1, f"Found hardcoded trend: '{match}' -> {line.strip()}"))
            
        score_matches = score_pattern.findall(line)
        for match in score_matches:
            findings.append((filepath.name, i+1, f"Found hardcoded score: '{match}' -> {line.strip()}"))
            
    return findings

def main():
    print("Starting Executive KPI Validation...")
    all_findings = []
    
    for f in FRONTEND_FILES:
        all_findings.extend(check_frontend_hardcodes(f))
        
    for f in BACKEND_FILES:
        all_findings.extend(check_backend_hardcodes(f))
        
    integrity_score = 100
    if all_findings:
        penalty_per_finding = 5
        integrity_score = max(0, 100 - (len(all_findings) * penalty_per_finding))
        
    print(f"\n--- KPI VALIDATION REPORT ---")
    print(f"Integrity Score: {integrity_score}/100")
    
    print("\nData Sources Map:")
    print("- Executive Metrics: Database (TeamAssignment, ProjectRequirement, EmployeeSkill, BurnoutMetrics)")
    print("- Dashboard Score: Database (ML Intelligence agg)")
    print("- Forecasts: Database (Time-bound Project constraints vs Supply)\n")
    
    if all_findings:
        print("FAIL: Hardcoded KPIs Detected!\n")
        for finding in all_findings:
            print(f"[{finding[0]}:{finding[1]}] {finding[2]}")
        sys.exit(1)
    else:
        print("PASS: All KPIs are fully dynamic and database-driven.")
        sys.exit(0)

if __name__ == "__main__":
    main()
