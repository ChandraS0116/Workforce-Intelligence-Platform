# Screenshot Generation Guide

To ensure consistency in our portfolio, marketing materials, and repository documentation, follow these strict guidelines when generating application screenshots.

## General Guidelines
- **Resolution**: 1920x1080 (16:9 aspect ratio)
- **Browser**: Google Chrome or Safari (Hide bookmarks bar)
- **Theme**: Capture 75% in `Cyber Teal` (Dark mode) and 25% in `Enterprise Light` to show flexibility.
- **Data State**: Ensure no empty states are visible. Use the populated DB.

---

## Required Screenshots

### 1. Login
- **Route**: `/login`
- **Sample Data**: Use `admin@company.com` filled in.
- **Capture Instructions**: Capture the entire window, showing the split-screen design (form on left, branding/hero on right).

### 2. Dashboard
- **Route**: `/`
- **Sample Data**: Wait for charts to load. Ensure top KPI cards display the aggregated ML values (e.g., 90+ health).
- **Capture Instructions**: Capture the full page layout showing sidebar navigation, header, and grid widgets.

### 3. Executive Command Center
- **Route**: `/executive` (Presentation Mode)
- **Sample Data**: Should show "Strategic Priorities & Risks" populated with at least two insights.
- **Capture Instructions**: Click the "Presentation Mode" button to trigger fullscreen before capturing. This removes the sidebar for a cinematic executive view.

### 4. Team Builder
- **Route**: `/team-builder`
- **Sample Data**: Search for `React` and `Python`. Run the builder to show the top recommended team.
- **Capture Instructions**: Ensure the "Match Score" radial chart and the selected team avatars are fully visible.

### 5. Skill Gap Analysis
- **Route**: `/skill-gap`
- **Sample Data**: Displays the "BUY / BUILD / BORROW" recommendations for critical shortages like `Cloud Architecture`.
- **Capture Instructions**: Scroll to ensure the severity tags and estimated cost impacts are prominently displayed.

### 6. Team Chemistry
- **Route**: `/chemistry`
- **Sample Data**: The D3.js force-directed graph should be fully settled.
- **Capture Instructions**: Hover over a major "node" (employee) so the collaboration edges highlight and the tooltip appears before capturing.

### 7. Forecasting
- **Route**: `/forecasting`
- **Sample Data**: Ensure the 365-day predictive horizon is visible.
- **Capture Instructions**: Capture the multi-line chart highlighting the delta between Capacity and Demand.

### 8. Scenario Simulator
- **Route**: `/scenario-simulator`
- **Sample Data**: Set Hiring to +15% and Attrition to 5%. 
- **Capture Instructions**: Ensure the mathematical outcome card ("Risk Reduced by X%") is glowing in the success state.

### 9. Reporting Center
- **Route**: `/reporting`
- **Sample Data**: Have the "Executive Summary" selected.
- **Capture Instructions**: Capture while the "Export CSV" dropdown is expanded to show functionality.

### 10. Audit Logs
- **Route**: `/audit-logs`
- **Sample Data**: The table should show various actions (`LOGIN`, `TEAM_GENERATED`).
- **Capture Instructions**: Type "TEAM" into the search bar to demonstrate the live-filtering capability.

### 11. Notification Center
- **Route**: Any (Global Header)
- **Sample Data**: 3 unread notifications.
- **Capture Instructions**: Click the Bell icon in the top right to open the dropdown. Capture the open popover.

### 12. Data Quality Center
- **Route**: `/data-quality`
- **Sample Data**: Show 1-2 warnings (e.g., "Overallocated Employee").
- **Capture Instructions**: Highlight the automated AI Recommendation text next to the issue.

### 13. Theme Gallery
- **Route**: `/settings/appearance` (or global theme toggle)
- **Sample Data**: N/A
- **Capture Instructions**: Capture a split-image combining `Midnight Gold`, `Cyber Teal`, and `Corporate Light` to showcase the design system's versatility.
