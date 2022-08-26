# DX Anlaysis POC

## Summary
This POC demonstrates a new architecture for our SDKs.

## Key improvements:
* Products as Plugins
  * Centralized configuration, logging
  * Product interfaces allow for easy extension
* Easy migration from static SDK to generated typed SDKs
* Improved user management
  * Centralized across products
  * Improved server interfaces (multitenant)

## TODO
* Group management
* Environment support (codegen)

# Project structure
* README.md - you are here *
* src/
* [App.tsx](src/App.tsx) - Example user app using Amply SDK. A good place to start.
* src/usage/
  * [coreSdkUsage.ts](src/usage/coreSdkUsage.ts) - *Untyped* usage of Amplitude SDK
  * [typedSdkUsage.ts](src/usage/typedSdkUsage.ts) - *Typed* usage of Amplitude SDK
  * [coreToTypedSdkUsage.ts](src/usage/coreToTypedSdkUsage.ts) - Migrating from *untyped* to *typed* SDK
  * [productPlugins.ts](src/usage/productPlugins.ts) - Amplitude plugins
  * [multiTenantUser.ts](src/usage/multiTenantUser.ts) - Server usage with multiple Users 
