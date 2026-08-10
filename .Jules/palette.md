## 2025-05-19 - Form Input Accessibility
**Learning:** Found multiple form inputs in components (like CostSavingsSimulator) lacking programmatic association with their labels using `htmlFor` and `id` attributes. This is a crucial accessibility gap for screen readers to navigate forms.
**Action:** When adding or updating forms, always ensure explicit `id` bindings on inputs and matching `htmlFor` attributes on corresponding `<label>` tags. Do not rely solely on nested `<label><input /></label>` structures if standalone `<label>` and `<input>` are used.
## 2024-08-10 - Add ARIA Roles to Custom Tabs
**Learning:** Added `role="tablist"` and `role="tab"` with `aria-selected` to `DeviceDetailModal` and `GatewayConfig` tabs.
**Action:** Always ensure custom tabbed interfaces have proper ARIA attributes to communicate structural grouping and active state to screen readers.
