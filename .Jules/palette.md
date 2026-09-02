## 2025-05-19 - Form Input Accessibility
**Learning:** Found multiple form inputs in components (like CostSavingsSimulator) lacking programmatic association with their labels using `htmlFor` and `id` attributes. This is a crucial accessibility gap for screen readers to navigate forms.
**Action:** When adding or updating forms, always ensure explicit `id` bindings on inputs and matching `htmlFor` attributes on corresponding `<label>` tags. Do not rely solely on nested `<label><input /></label>` structures if standalone `<label>` and `<input>` are used.

## 2025-05-19 - Tabbed Interface Accessibility
**Learning:** Found custom tabbed interfaces (like GatewayConfig diagnostic tabs) lacking proper ARIA roles for tabs and tab panels. This is a crucial accessibility gap for screen readers to navigate and understand tabbed content.
**Action:** When implementing tabbed interfaces, always ensure the container uses `role='tablist'` with a descriptive `aria-label`, individual tabs use `role='tab'` with correctly mapped `aria-selected` state, and wrap tab content panels in `role='tabpanel'` with matching `id` and `aria-labelledby` attributes.
