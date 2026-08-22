## 2025-05-19 - Form Input Accessibility
**Learning:** Found multiple form inputs in components (like CostSavingsSimulator) lacking programmatic association with their labels using `htmlFor` and `id` attributes. This is a crucial accessibility gap for screen readers to navigate forms.
**Action:** When adding or updating forms, always ensure explicit `id` bindings on inputs and matching `htmlFor` attributes on corresponding `<label>` tags. Do not rely solely on nested `<label><input /></label>` structures if standalone `<label>` and `<input>` are used.
## 2025-05-19 - Tablist Accessibility
**Learning:** Tabbed interfaces in DeviceDetailModal lacked semantic roles, meaning screen readers couldn't identify them as tabs or know their selected state.
**Action:** When implementing tabbed interfaces, the container must use `role='tablist'` with a descriptive `aria-label`, and individual tabs must use `role='tab'` with an accurately mapped `aria-selected` boolean state.
