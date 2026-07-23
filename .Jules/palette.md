## 2025-05-19 - Form Input Accessibility
**Learning:** Found multiple form inputs in components (like CostSavingsSimulator) lacking programmatic association with their labels using `htmlFor` and `id` attributes. This is a crucial accessibility gap for screen readers to navigate forms.
**Action:** When adding or updating forms, always ensure explicit `id` bindings on inputs and matching `htmlFor` attributes on corresponding `<label>` tags. Do not rely solely on nested `<label><input /></label>` structures if standalone `<label>` and `<input>` are used.

## 2025-07-22 - Filter Button Accessibility
**Learning:** Found toggle filter buttons in `EnergyLoadChart` that lacked grouping and state communication for screen readers. Grouping filters with `role="group"` and an `aria-label`, along with using `aria-pressed` for active states, is a crucial pattern for interactive data charts.
**Action:** Always wrap related toggle buttons or filters in a container with `role='group'` and a descriptive `aria-label`. Use the `aria-pressed` attribute on the buttons themselves to correctly communicate their active/inactive state to assistive technologies.
