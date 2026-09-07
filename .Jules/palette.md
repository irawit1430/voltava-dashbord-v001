## 2025-05-19 - Form Input Accessibility
**Learning:** Found multiple form inputs in components (like CostSavingsSimulator) lacking programmatic association with their labels using `htmlFor` and `id` attributes. This is a crucial accessibility gap for screen readers to navigate forms.
**Action:** When adding or updating forms, always ensure explicit `id` bindings on inputs and matching `htmlFor` attributes on corresponding `<label>` tags. Do not rely solely on nested `<label><input /></label>` structures if standalone `<label>` and `<input>` are used.

## 2025-05-20 - Tabbed Interface Accessibility
**Learning:** The application uses several custom tabbed interfaces (like the historical data charts in DeviceDetailModal and diagnostic terminals in GatewayConfig) that lack standard WAI-ARIA roles (`tablist`, `tab`, `tabpanel`). This makes it difficult for screen reader users to understand the structure and their active state.
**Action:** When building or refactoring custom tab components, always apply `role="tablist"` to the container, `role="tab"` and `aria-selected` to the tab buttons, and `role="tabpanel"` to the content area, linking them via `aria-controls` and `id`.
