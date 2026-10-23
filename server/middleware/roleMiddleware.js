export function allowRoles(...roles) {
  return (request, _response, next) => {
    if (!request.user || !roles.includes(request.user.role)) {
      return next(Object.assign(new Error("You are not allowed to perform this action."), { status: 403 }));
    }
    next();
  };
}
