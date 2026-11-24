// A full page load, unlike router.replace: every piece of client state is dropped, including the pages
// Next keeps hidden for back/forward and the TanStack Query cache. Used on sign-out, as Next recommends,
// so nothing from the signed-in user stays in the page.
export const hardNavigate = (url: string) => window.location.replace(url);
