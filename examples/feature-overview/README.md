# `feature-overview`

## Key improvements:
* Unified interface for all products
* Typed SDKs for all products
* Easy migration from static SDK to generated typed SDKs
* Products as Plugins
    * Centralized configuration, logging, privacy, user
    * Product interfaces allow for easy extension
* Improved user management
    * Centralized across products
    * Improved server interfaces (multitenant)
* Cross-product communication
    * One product can integrate with others as soon as they are added
    * 3rd parties plugins can hook into the event bus for quick, flexible integrations

## TODO
* Group management
* Environment support (codegen)

## Usage
You can run the examples with
```
yarn example-<number>
```

You can run examples one at a time or `yarn example-all` to run them all in sequence
```
yarn example-1
yarn example-9
yarn example-all
```

## Individual examples (Cross platform)
* [1-core-sdk-usage.ts](1-core-sdk-usage.ts) - *Untyped* usage of Amplitude SDK
* [2-typed-sdk-usage.ts](2-typed-sdk-usage.ts) - *Typed* usage of Amplitude SDK
* [3-core-to-typed-sdk-migration.ts](3-core-to-typed-sdk-migration.ts) - Migrating from *untyped* to *typed* SDK
* [4-product-plugins.ts](4-product-plugins.ts) - Amplitude plugins
* [5-multiple-users-on-a-server.ts](5-multiple-users-on-a-server.ts) - Server usage with multiple Users
* [6-cross-platform-usage.ts](6-cross-platform-usage.ts) - Client/server hybrid applications
* [7-cross-plugin-communication.ts](7-cross-plugin-communication.ts) - Centralized event bus for decoupled hooks
* [8-plugin-configuration.ts](8-plugin-configuration.ts) - Configuring plugins
* [9-hooks.ts](9-hooks.ts) - Hook into updates from different products via the message hub
