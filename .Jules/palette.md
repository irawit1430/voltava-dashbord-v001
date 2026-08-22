## 2025-05-19 - Form Input Accessibility
**Learning:** Found multiple form inputs in components (like CostSavingsSimulator) lacking programmatic association with their labels using `htmlFor` and `id` attributes. This is a crucial accessibility gap for screen readers to navigate forms.
**Action:** When adding or updating forms, always ensure explicit `id` bindings on inputs and matching `htmlFor` attributes on corresponding `<label>` tags. Do not rely solely on nested `<label><input /></label>` structures if standalone `<label>` and `<input>` are used.
## 2024-05-18 - Accessibility on custom tabs
**Learning:** For custom tab implementations in React, standard buttons are often used to change state instead of links or inputs. When styling these as tabs, the `role="tablist"` container and `role="tab"` element structure with `aria-selected` boolean states must be manually implemented to convey semantic meaning and active state to screen readers.
**Action:** Always verify if tab-like UI components use semantic roles, and patch them with `role="tablist"`, `role="tab"`, and `aria-selected` attributes if they are missing.
