## 2025-05-19 - Form Input Accessibility
**Learning:** Found multiple form inputs in components (like CostSavingsSimulator) lacking programmatic association with their labels using `htmlFor` and `id` attributes. This is a crucial accessibility gap for screen readers to navigate forms.
**Action:** When adding or updating forms, always ensure explicit `id` bindings on inputs and matching `htmlFor` attributes on corresponding `<label>` tags. Do not rely solely on nested `<label><input /></label>` structures if standalone `<label>` and `<input>` are used.

## 2025-05-19 - WAI-ARIA Tab implementation
**Learning:** The gateway config panel used custom buttons for a tabbed interface without proper ARIA roles (`tablist`, `tab`, `tabpanel`), making it completely inaccessible to screen reader users who expect keyboard navigation and semantic structure for tabs.
**Action:** When implementing custom tabbed interfaces, always assign `role="tablist"` to the container, `role="tab"` to each button, `role="tabpanel"` to the content, and link them using `aria-controls` pointing to the tabpanel's ID, along with dynamically updating `aria-selected` boolean states.
