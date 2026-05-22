/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/` | `/(tabs)/customers` | `/(tabs)/invoices` | `/(tabs)/products` | `/(tabs)/suppliers` | `/_sitemap` | `/customers` | `/customers/add` | `/invoices` | `/invoices/purchase` | `/invoices/sales` | `/login` | `/products` | `/suppliers`;
      DynamicRoutes: `/customers/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/customers/[id]`;
    }
  }
}
