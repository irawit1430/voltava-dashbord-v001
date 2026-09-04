## 2025-05-19 - Form Input Accessibility
**Learning:** Found multiple form inputs in components (like CostSavingsSimulator) lacking programmatic association with their labels using `htmlFor` and `id` attributes. This is a crucial accessibility gap for screen readers to navigate forms.
**Action:** When adding or updating forms, always ensure explicit `id` bindings on inputs and matching `htmlFor` attributes on corresponding `<label>` tags. Do not rely solely on nested `<label><input /></label>` structures if standalone `<label>` and `<input>` are used.

## 2023-10-27 - Gateway Diagnostics UX
**Learning:** Found that the "Run Ping Test" and "Scan Bus" buttons in `GatewayConfig.tsx` were missing clear loading states when active (`isPinging`/`isScanning`), offering poor user feedback for async terminal operations.
**Action:** Replaced static icons with a spinning `Loader2` during active operations and ensured all decorative icons used `aria-hidden="true"`. Use this pattern for all terminal-like or async diagnostic actions to improve visual feedback.
