## 2025-05-19 - Form Input Accessibility
**Learning:** Found multiple form inputs in components (like CostSavingsSimulator) lacking programmatic association with their labels using `htmlFor` and `id` attributes. This is a crucial accessibility gap for screen readers to navigate forms.
**Action:** When adding or updating forms, always ensure explicit `id` bindings on inputs and matching `htmlFor` attributes on corresponding `<label>` tags. Do not rely solely on nested `<label><input /></label>` structures if standalone `<label>` and `<input>` are used.

## 2025-05-19 - Button Disabling on Async State
**Learning:** Adding a loading spinner to a button is only half the battle. If the button is not disabled while loading (`disabled={isSubmitting}`), it creates a dangerous UX flaw where users can double-submit forms or assistive tech users can accidentally trigger multiple overlapping requests.
**Action:** Always pair a loading state (`Adding...`, `Saving...`) with a `disabled={isSubmitting}` attribute on the parent button.
