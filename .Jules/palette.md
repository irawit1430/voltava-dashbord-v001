## 2025-05-19 - Form Input Accessibility
**Learning:** Found multiple form inputs in components (like CostSavingsSimulator) lacking programmatic association with their labels using `htmlFor` and `id` attributes. This is a crucial accessibility gap for screen readers to navigate forms.
**Action:** When adding or updating forms, always ensure explicit `id` bindings on inputs and matching `htmlFor` attributes on corresponding `<label>` tags. Do not rely solely on nested `<label><input /></label>` structures if standalone `<label>` and `<input>` are used.

## 2026-09-02 - Tabbed Interface Accessibility
**Learning:** Found custom tabbed interfaces (like chart tabs in DeviceDetailModal) that were missing essential ARIA roles, making them opaque to screen readers. Tab containers need `role="tablist"` and tabs need `role="tab"` with `aria-selected` tracking the active state.
**Action:** When implementing custom tabbed interfaces, ensure the container has `role="tablist"`, individual tabs have `role="tab"`, and the active state is mapped correctly to `aria-selected`.
