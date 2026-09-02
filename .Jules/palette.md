## 2025-05-19 - Form Input Accessibility
**Learning:** Found multiple form inputs in components (like CostSavingsSimulator) lacking programmatic association with their labels using `htmlFor` and `id` attributes. This is a crucial accessibility gap for screen readers to navigate forms.
**Action:** When adding or updating forms, always ensure explicit `id` bindings on inputs and matching `htmlFor` attributes on corresponding `<label>` tags. Do not rely solely on nested `<label><input /></label>` structures if standalone `<label>` and `<input>` are used.

## 2025-05-20 - Custom Tab Components Accessibility
**Learning:** Found custom tabbed UI in components (like DeviceDetailModal for historical charting) missing standard ARIA attributes. A visual grouping of buttons does not translate to a tabbed interface for screen readers without explicit roles.
**Action:** When implementing or updating custom tab interfaces, ensure the container uses `role="tablist"` and `aria-label`, each tab button uses `role="tab"` and `aria-selected`, and the content area uses `role="tabpanel"` with proper `id` and `aria-labelledby` connections.
