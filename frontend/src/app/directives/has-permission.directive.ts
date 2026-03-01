import { Directive, Input, TemplateRef, ViewContainerRef } from "@angular/core";

/**
 * Structural directive to show/hide elements based on permissions.
 * TODO: Implement with AuthorizationService when ready.
 *
 * Usage:
 * <button *appHasPermission="'partner_add'">Add Partner</button>
 */
@Directive({
  selector: "[appHasPermission]",
  standalone: true
})
export class HasPermissionDirective {
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  @Input()
  set appHasPermission(value: string | string[]) {
    if (!this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    }
  }
}
