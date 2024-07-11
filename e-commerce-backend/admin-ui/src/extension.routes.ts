export const extensionRoutes = [  {
    path: 'extensions/productreview',
    loadChildren: () => import('./extensions/productreview-ui/routes'),
  }];
