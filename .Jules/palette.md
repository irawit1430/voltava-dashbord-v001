## 2025-05-19 - Form Input Accessibility
**Learning:** Found multiple form inputs in components (like CostSavingsSimulator) lacking programmatic association with their labels using `htmlFor` and `id` attributes. This is a crucial accessibility gap for screen readers to navigate forms.
**Action:** When adding or updating forms, always ensure explicit `id` bindings on inputs and matching `htmlFor` attributes on corresponding `<label>` tags. Do not rely solely on nested `<label><input /></label>` structures if standalone `<label>` and `<input>` are used.

## 2023-10-27 - Toggle Button Accessibility
**Learning:** Found that custom filter pills/buttons used to toggle views (e.g. in EnergyLoadChart, FleetOverview) lacked `aria-pressed` attributes. Without this, screen readers announce them as normal buttons and users cannot determine their active state.
**Action:** When implementing custom toggle buttons or filter pills that behave like tabs or toggles, always bind `aria-pressed={isActive}` to communicate their state effectively.
