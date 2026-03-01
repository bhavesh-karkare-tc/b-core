import { CanActivateFn, ActivatedRouteSnapshot } from "@angular/router";

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  // TODO: Implement RBAC permission logic
  return true;
};

export const moduleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  // TODO: Implement module access logic
  return true;
};
