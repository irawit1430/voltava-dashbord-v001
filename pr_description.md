💡 What: Added accessible states to the chart filter toggle buttons in `EnergyLoadChart.tsx`.
🎯 Why: Filter pills were acting as toggle buttons but did not semantically communicate their grouped nature or active state to screen readers.
📸 Before/After: Visuals remain unchanged, but assistive technologies now properly interpret the control.
♿ Accessibility:
- Wrapped filters in a container with `role="group"` and `aria-label="Chart data filters"`.
- Added `aria-pressed={activeFilter === '...'}` to each filter toggle button to communicate active state.
- Added `aria-hidden="true"` to decorative `Sun`, `Zap`, and `BatteryCharging` icons to reduce screen reader noise.
