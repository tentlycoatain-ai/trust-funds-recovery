# Trust Funds Recovery — Pre-implementation UI/UX Audit

## Audit scope

The existing repository is an Angular 22 standalone-component application. Its route configuration preserves distinct public, Admin CRM, and Agent CRM experiences, with functional authentication guards, mock-data services, charts, shared CRM primitives, public marketing components, and Angular view transitions. The redesign must remain a visual-system elevation and must not alter these behaviors, routes, or role permissions.

## Architecture map

| Area | Current implementation | Preservation requirement |
| --- | --- | --- |
| Public website | Home, About, Services, How It Works, Resources, Contact, and nested legal routes; global header/footer; shared FAQ, CTA, service, timeline, testimonial, and video-modal components | Retain all content paths and CTA behavior while unifying visual identity and a grounded photography treatment. |
| Admin CRM | Protected `admin` layout with dashboard, customers, leads, cases, tasks, calls, dialer, payments, documents, communications, activity, reports, notifications, settings, profile, and audit logs | Retain routes, auth guard, operational information, notifications, and quick dialer behavior. |
| Agent CRM | Protected `agent` layout with dashboard, leads, customers, cases, tasks, dialer, calls, documents, notifications, and profile | Retain focused workflows and role separation. |
| Privacy controls | Shared `crm-phone-display` always masks actual customer phone data for Agent users and exposes only a dial launch action | This must remain intact across all visual changes. |
| Existing system | Sass token files establish navy/blue/gold colors but inline and component-local colors duplicate values across components | Consolidate and extend tokens; minimize visual drift without breaking templates or behavior. |

## Visual observations

The public home page already presents a coherent dark-navy/blue/gold direction, strong content hierarchy, and a rich set of functional sections. Its earlier hero direction relied too heavily on abstract media and decorative effects, which made the experience feel synthetic. The primary visual correction is a more human, editorial photo system with real-world office context and useful negative space for copy. The current logo is an inline generic shield; a distinct, reusable vector mark should replace it in public, CRM, and authentication contexts.

The Admin sign-in view is functional and legible but is visually sparse, with a small centered white card on a dark background. It should inherit the new brand mark, surface treatment, focus states, and secure-operation cues without inventing trust claims or changing login behavior.

The Admin dashboard has a good functional data layout—sidebar navigation, KPI cards, charts, tables, task priority list, quick dialer, notifications, and role switching—but its visual scale and hierarchy are still close to a generic dashboard. The redesign should add system-level surface treatment, richer navigation states, table density tuning, semantic status treatment, and consistent focus/hover behavior while retaining every existing event and route.

The Agent dashboard already reflects its action-oriented purpose through daily tasks, assigned cases, dialer access, and masked customer phone information. The implementation must keep agent phone data protected and preserve the concise task-and-call workflow; visual changes should make urgency, next actions, and protected-contact cues more immediately scannable.

## Initial design direction

The new system will use an ownable monogram based on an abstract **T/F** continuity mark, an ink/navy foundation, a reserved electric-blue action color, champagne accent, warm-white surfaces, and accessible semantic states. The public experience will feel editorial and reassuring; the CRM will feel compact, operational, and calm. Motion will remain short, low-amplitude, and disabled under `prefers-reduced-motion`.

## Implementation validation

The redesigned public home page now uses a full-viewport consultation photograph with an accessible text alternative, a readable dark overlay, central brand hierarchy, restrained motion, and a no-guarantee boundary statement. The production Angular build completed successfully, and the live browser console reported only the expected Angular development-mode log with no page errors.

The new local brand system includes light/dark wordmarks, an icon-only mark, browser favicon reference, and centralized Sass design tokens for brand, semantic, spacing, typography, geometry, shadow, and motion values. The Resources route is now registered, and footer legal links correctly target the existing nested legal routes.

The live Agent and Admin CRM screens were also checked after the system upgrade. Both retain their existing role switch, dashboard data, navigation, quick dialer, notifications, and functional CTA behavior while using the new shared monogram, operational surface hierarchy, refined sidebars, updated top bars, and text-plus-symbol status badges. Agent dashboards continue to display customer phone data in masked form, including the protected-phone column and call affordances; no actual customer phone number was exposed during this validation.

The repaired `/resources` route was opened in the live application and rendered the existing Knowledge Center content correctly with the redesigned shared header, visual language, and footer. A follow-up console check again returned only the standard Angular development-mode log and no browser errors.

The temporary public preview host was added to Angular's serve configuration and verified through both local and public HTTP checks. The public URL now renders the redesigned home experience correctly, including the consultation hero image, editorial evidence band, client-meeting story image, new logo treatment, navigation, and content hierarchy.

## Photography revision

The first visual pass was intentionally replaced after review. The landing page no longer relies on the abstract generated hero video/poster treatment. It now uses a grounded editorial photography system: a client-and-advisor consultation in the hero, a document-review desk image for evidence work, and a human client meeting image for the methodology story. The treatment uses restrained crops, natural light, lived-in office details, and less decorative overlay so the service feels credible and human rather than synthetic or futuristic.

## Public-page photography rollout

The editorial photography system has now been extended across every primary public landing page. About uses a multidisciplinary team review, Services uses transaction-analysis work, How It Works uses a document-roadmap scene, Resources uses a practical reading scene, and Contact uses a human intake-coordinator scene. Each hero has descriptive alternative text, page-specific image composition, a dark readable overlay, and preserved navigation/CTA behavior. Legal pages remain intentionally content-first rather than promotional landing pages.

## Image-based icon system rollout

The generic outline treatment has been replaced in the highest-visibility public and CRM surfaces with a shared image-icon component. Public service cards now use tangible dollar-note, warning-file, payment-card, coin-stack, and document-folder assets. Admin and Agent CRM navigation, dialer, notifications, public-site switch, role switch, and logout controls use the same asset-backed icon vocabulary. Each icon is an actual transparent PNG with a semantic image label, rather than an inline generic line glyph. Remaining inline chevrons and small utility marks are intentionally retained where they function as compact interaction indicators rather than content icons.

## Complete icon migration

The full application icon audit is now complete. All inline SVG elements under `src/app` have been removed, and all emoji/text-symbol icon markers used for calls, documents, messages, checks, arrows, and close controls have been replaced with transparent image assets. The shared image vocabulary now covers currency, payment cards, warnings, coins, evidence folders, phone calls, messages, privacy, scheduling, reports, verification, forward actions, and close actions. Public pages, legal pages, CRM layouts, CRM pages, authentication screens, and shared CRM components now use real image assets for iconography.

Validation: production build passed; unit tests passed 2/2; `svg=0`; audited icon emoji/text-symbol count `0`.
