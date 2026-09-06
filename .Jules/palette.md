## 2025-05-19 - Form Input Accessibility
**Learning:** Found multiple form inputs in components (like CostSavingsSimulator) lacking programmatic association with their labels using `htmlFor` and `id` attributes. This is a crucial accessibility gap for screen readers to navigate forms.
**Action:** When adding or updating forms, always ensure explicit `id` bindings on inputs and matching `htmlFor` attributes on corresponding `<label>` tags. Do not rely solely on nested `<label><input /></label>` structures if standalone `<label>` and `<input>` are used.
## 2025-05-19 - Tab Accessibility
**Learning:** Found multiple instances where tabs (in GatewayConfig and DeviceDetailModal) were using plain `div`s and `button`s without ARIA tab roles (`tablist`, `tab`, `tabpanel`) or `aria-selected` and `aria-controls` attributes, making them opaque to screen readers.
**Action:** When implementing tabbed interfaces, always use `role="tablist"` on the container, `role="tab"` on the buttons with `aria-selected` tracking state, and `role="tabpanel"` on the content area. Additionally, use `aria-controls` on tabs to point to the `id` of their associated tab panel.
