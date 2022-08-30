# DX Anlaysis POC

## Summary
This POC demonstrates a new architecture for our SDKs.

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

## Project structure
* README.md - you are here *
* src/
  * [App.tsx](src/App.tsx) - Example user app using Amply SDK. A good place to start.
* src/examples/
  * [coreSdkUsage.ts](src/examples/coreSdkUsage.ts) - *Untyped* usage of Amplitude SDK
  * [typedSdkUsage.ts](src/examples/typedSdkUsage.ts) - *Typed* usage of Amplitude SDK
  * [coreToTypedSdkUsage.ts](src/examples/coreToTypedSdkUsage.ts) - Migrating from *untyped* to *typed* SDK
  * [productPlugins.ts](src/examples/productPlugins.ts) - Amplitude plugins
  * [multiTenantUser.ts](src/examples/multiTenantUser.ts) - Server usage with multiple Users
  * [crossPlatform.ts](src/examples/crossPlatform.ts) - Client/server hybrid applications
  * [cross-plugin-communication.ts](src/examples/cross-plugin-communication.ts) - Centralized event bus for decoupled hooks

## Setup
To run locally
1. Install `NodeJS`
2. Install `yarn`
3. Clone the repo
4. `cd ~/react-app`
5. `yarn install`
6. `yarn start`
