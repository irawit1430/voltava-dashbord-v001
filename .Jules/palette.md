## 2025-05-19 - Form Input Accessibility
**Learning:** Found multiple form inputs in components (like CostSavingsSimulator) lacking programmatic association with their labels using `htmlFor` and `id` attributes. This is a crucial accessibility gap for screen readers to navigate forms.
**Action:** When adding or updating forms, always ensure explicit `id` bindings on inputs and matching `htmlFor` attributes on corresponding `<label>` tags. Do not rely solely on nested `<label><input /></label>` structures if standalone `<label>` and `<input>` are used.
## 2025-05-19 - Accessible Tabs
**Learning:** Found multiple instances of tab-based navigation (like in GatewayConfig diagnostics and DeviceDetailModal historical charts) using plain buttons inside a div without ARIA roles. This makes it impossible for screen reader users to identify that they are interacting with a tabbed interface or which tab is currently selected.
**Action:** When implementing or updating tabbed interfaces, always ensure the container has `role="tablist"` (along with a descriptive `aria-label`), and that individual tabs have `role="tab"` and an accurately mapped `aria-selected` boolean state.
