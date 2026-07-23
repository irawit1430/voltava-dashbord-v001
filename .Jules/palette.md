## 2025-05-19 - Form Input Accessibility
**Learning:** Found multiple form inputs in components (like CostSavingsSimulator) lacking programmatic association with their labels using `htmlFor` and `id` attributes. This is a crucial accessibility gap for screen readers to navigate forms.
**Action:** When adding or updating forms, always ensure explicit `id` bindings on inputs and matching `htmlFor` attributes on corresponding `<label>` tags. Do not rely solely on nested `<label><input /></label>` structures if standalone `<label>` and `<input>` are used.

## 2024-05-18 - [Add ARIA states to grouped toggle buttons in EnergyLoadChart]
**Learning:** Recharts components and layered interactive DOM elements require explicit `role="group"` and `aria-pressed` definitions to ensure chart toggles are accessible to assistive devices. Simple `active` CSS classes are insufficient for accessibility context.
**Action:** Always add `aria-pressed` states and `role="group"` container attributes when implementing custom toggle switch clusters for charting or data manipulation.
