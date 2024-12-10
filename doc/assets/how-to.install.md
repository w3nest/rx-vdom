# Installation

## From npm

You can install the library using npm:

```shell
npm install rx-vdom
```

Or yarn:

```shell
yarn add rx-vdom
```

## From CDN

A standalone example using a CDN is available <a href="{{URL-example-cdn}}" target="_blank">here</a>.

# TypeScript Setup

To fully integrate {{rx-vdom}} with TypeScript, you need to set up a configuration file that the TypeScript
compiler can reference. This file, `rx-vdom.config.ts`, should be added to your project and referenced in your 
`tsconfig.json`.

After installing  {{rx-vdom}}, you can initialize the TypeScript configuration with a single command:

```shell
yarn rx-vdom-init
```

<note level='hint'>
The `rx-vdom.config.ts` file offers the opportunity to optimize compilation time by ensuring that only the HTML tags 
you actually use are considered during the build process. 
This helps speed up the compilation time. 
By default, all the HTML tags are accounted.
Feel free to explore the configuration file for more details.

</note>