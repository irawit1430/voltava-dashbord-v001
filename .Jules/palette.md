## 2025-05-19 - Form Input Accessibility
**Learning:** Found multiple form inputs in components (like CostSavingsSimulator) lacking programmatic association with their labels using `htmlFor` and `id` attributes. This is a crucial accessibility gap for screen readers to navigate forms.
**Action:** When adding or updating forms, always ensure explicit `id` bindings on inputs and matching `htmlFor` attributes on corresponding `<label>` tags. Do not rely solely on nested `<label><input /></label>` structures if standalone `<label>` and `<input>` are used.
## 2025-05-19 - Tab Accessibility Roles
**Learning:** The gateway diagnostic terminal uses a custom tabbed interface (`gw-terminal-tabs`) which lacked correct WAI-ARIA tab semantics. Elements acting as tabs must use `role="tablist"` on the container and `role="tab"` with `aria-selected` and `aria-controls` on the buttons.
**Action:** When implementing or updating custom tab navigation components, explicitly add `role="tablist"`, `role="tab"`, and `role="tabpanel"` attributes, ensuring the `aria-controls` links back to the tabpanel's ID to provide screen reader context.
