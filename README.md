# Webpack with ReactJS

## Steps to get things going:

1. Create React Application:

```
$ npm i react react-dom
```

2. Create Webpack development config:

-   Define the top-level **mode** property to suppress errors/warnings
-   Define the **entry** point - which module webpack should use to begin bundling out
    its internal [dependency graph](https://webpack.js.org/concepts/dependency-graph/).

```js
module.exports = {
    mode: 'development',
    entry: './src/components/index.js',
};
```

-   Define the **output** property which will tell webpack where to emit the _bundles_ it creates and how to name these files.

```js
const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/components/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',
    },
};
```

`output.filename` is defined as a string containing a placeholder `[name]`. This place holder will be replaced with the actual name of the entry filename without the extension, in this example `main.bundle.js`.

## Resolving jsx syntax

In order for our modules to be properly resolved for `.js` and `.jsx` extensions,
we need to tell webpack where to look for the input files.
Webpack will resolve files designated in the `alias` property's path `src`.
`alias` will help us to import/require certain modules more easily.
In this example we alias all entry files in the `src/` directory so we can write
`import AppComponent from '@/components/App';` and not for example `import AppComponent from '../../components/App';`.

```js
const path = require('path');

mode: 'development',
    entry: './src/components/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
```

## Loaders

Webpack enables us to use loaders to preprocess files.
This allows us to bundle any static resources way beyond JavaScript.
We can write our own loaders using Node.js.
In our case we need transpilation and style loaders:

-   [babel-loader](https://webpack.js.org/loaders/babel-loader) - loads ES2015+ code and transpiles to ES5 using [Babel](https://babeljs.io/)
-   [style-loader](https://webpack.js.org/loaders/style-loader) - add exports of a module as style to DOM
-   [css-loader](https://webpack.js.org/loaders/css-loader) - loads CSS file with resolved imports and returns CSS code

In order for our different filetypes to be recognized and successfully transpiled
and bundled into webpack bundle we need a top-level `module` property in our configuration that will help us to tell webpack how the different types of modules within a project will be treated.
`module` accepts a top-level `rules` property - an array of [Rules](https://webpack.js.org/configuration/module/#rule) that is also used when the Rule matches.

So far what we know, we need at least two rule objects - one for `.js` and `.jsx`, and the other for loading and processing `.css` file extensions.

```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/components/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    module: {
        rules: [
            {
                test: /\.(?:js|jsx)$/,
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
            },
        ],
    },
};
```

Options describing the Rule object:

-   `Rule.test` - include all modules that pass test assertion
-   `Rule.exclude` - exclude all modules matching any of these conditions

In order to complete our rules we need additional properties that will define usage of our loaders.
First, we need to install [babel-loader](https://webpack.js.org/loaders/babel-loader):

```
$ npm install -D babel-loader @babel/core @babel/preset-env
```

babel-loader is a bridge between Babel and Webpack, for this we need the core Babel compiler `@babel/core` and a smart preset `@babel/preset-env` that allows us to use the latest JavaScript without needing to micromanage which syntax transforms (and optionally, browser polyfills).

To use babel-loader a Rule object accepts another property - `use`.

```js
const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/components/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    module: {
        rules: [
            {
                test: /\.(?:js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        targets: 'defaults',
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                    },
                },
            },
            {
                test: /\.css$/i,
            },
        ],
    },
};
```

We specify the loader in the `loader` object and any options in the `options` object.
`options` object also specifies `targets` property which describes the environments we should support/target for our project.
This can either be [browserslist-compatible](https://github.com/ai/browserslist) query:

```json
{
    "targets": "> 0.25%, not dead"
}
```

or an object of minimum environment versions to support:

```json
{
    "targets": {
        "chrome": "58",
        "ie": "11"
    }
}
```

Supported environments: android, chrome, deno, edge, electron, firefox, ie, ios, node, opera, rhino, safari, samsung.
If a minor version is not specified, Babel will interpret it as MAJOR.0. For example, "node": 12 will be considered as Node.js 12.0.

When no targets are specified: Babel will assume you are targeting the oldest browsers possible. For example, @babel/preset-env will transform all ES2015-ES2020 code to be ES5 compatible.

It is recommended to set `targets` value to reduce the output code size.
Because of this, Babel's behavior is different than browserslist: it does not use the defaults query when there are no targets are found in your Babel or browserslist config(s). If you want to use the defaults query, you will need to explicitly pass it as a target.

The next configuration property is `presets`.
Webpack/Babel will check if they are installed in the node_modules already.

Next, we define two more loaders `style-loader` and `css-loader`.
We define their configuration similar to the configuration for the `babel-loader`.

```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/components/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    module: {
        rules: [
            {
                test: /\.(?:js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        targets: 'defaults',
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                    },
                },
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
};
```

So far, we don't have any way to create our final html template to be served in our webpack bundles. For that purpose we need a plugin.

```
$ npm install --save-dev html-webpack-plugin
```

`HtmlWebpackPlugin` will generate an HTML5 file for us that includes all our webpack bundles in the body using `<script>` tag.

```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/components/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    module: {
        rules: [
            {
                test: /\.(?:js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        targets: 'defaults',
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                    },
                },
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: 'index.html',
        }),
    ],
};
```

In the `plugins` top-level array we create a new instance of `HtmlWebpackPlugin` with its own configuration options - namely, `template` to define a template to be used for the generated `filename` in the dist directory.

The next step is to install and configure `webpack-dev-server`.

```
npm install --save-dev webpack-dev-server
```

In the project root create `server.js` with the following content:

```js
const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('./webpack.dev.config.js');

const compiler = Webpack(webpackConfig);
const devServerOptions = { ...webpackConfig.devServer, open: true };
const server = new WebpackDevServer(devServerOptions, compiler);

const runServer = async () => {
    console.log('Starting server...');
    await server.start();
};

runServer();
```

Create a script in the `package.json` to run that server:

```json
...
"scripts": {
        "build:dev": "npx webpack --config webpack.dev.config.js",
        "serve": "node server.js"
    },
...
```

Now, any change to any file in the `src` folder will trigger a page update (without an actual reload). This is possible due to the important concept made available in the webpack - HMR, or hot module replacement - any affected module will be replaced/updated in the runtime without the need to reload the whole page or to touch unaffected modules. This is possible because there is a WebSocket connection which listens for changes in our source code during development.
If we edit our app, Webpack sends updated modules to the modules, and React efficiently updated the UI without refreshing the page.

The command to start Webpack Dev Server:

```
$ npm run serve
```

Gains:

-   Efficiency: HMR speeds up development by applying the changes we make instead of reloading the entire page
-   Isolation: Webpack Dev Server serves everything from memory, keeping our build output clean during development
-   Reactive Updates: The browser reflects code changes almost instantly, improving the development experience

On the other hand, we can build our bundle by running the following command:

```
$ npm run build:dev
```

This will result with `main.bundle.js` being created in the `dist` directory, alongside with the `index.html` with the script tag pointing to our generated bundle.

The bundle contains the following code parts:

-   React Components: our app's components compiled from JSX/TS into plain JS
-   Webpack Runtime: a set of utility functions that Webpack uses to load, execute, and manage modules
-   Module Code: all of our JS files (and imported assets) bundled together into one file
-   IIFE (Immediately Invoked Function Expression):
-   The bundle is wrapped in an IIFE, which is a self-executing function that isolates Webpack's internal logic from the global scope.
-   HMR Code (for Development): includes additional Webpack logic for handling HMR during development.

Webpack uses specific methods like `__webpack_require__` to load modules dynamically at runtime.

## Loading images

If we just insert a `<img>` tag in our template, it will not be available in our bundle because our current webpack setup does not know how to load and bundle images.

Either this:

```js
import React from 'react';
import './App.css';

export default function AppComponent() {
    return (
        <div className="container">
            <div>App Component</div>
            <img src="../../public/dog-img.jpg" alt="a dog" />
        </div>
    );
}
```

nor this:

```js
import React from 'react';
import './App.css';
import dogImage from '../../public/dog-img.jpg';

export default function AppComponent() {
    return (
        <div className="container">
            <div>App Component</div>
            <img src={dogImage} alt="a dog" />
        </div>
    );
}
```

will work.

Webpack will make sure to inform us about that.

```js
ERROR in ./public/dog-img.jpg 1:0
Module parse failed: Unexpected character '�' (1:0)
You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders
(Source code omitted for this binary file)
 @ ./src/components/App.js 3:0-48 8:9-17
 @ ./src/components/index.js 3:0-44 5:84-96

webpack 5.97.1 compiled with 1 error in 16 ms
```

Guess, it says we need another loader.

As of webpack v5, using the built-in [Asset Modules](https://webpack.js.org/guides/asset-modules/), we can easily incorporate those in our system as well.

```js
...
module: {
        rules: [
            ...
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
        ],
    },
...
```

# Creating a Production Build

# Production Build

webpack.prod.config.js

```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './src/components/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    module: {
        rules: [
            {
                test: /\.(?:js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        targets: 'defaults',
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                    },
                },
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: 'index.html',
        }),
    ],
};
```

With just one simple change of the `mode` property and by running the following command:

```
$ npx webpack --config webpack.prod.config.js
```

we now have automatically minified main.bundle.js.
This process also removed dead code (treeshaking) to reduce the bundle size.

# Explicit Minification with TerserWebpackPlugin

Webpack v5 comes with the latest terser-webpack-plugin out of the box.
Since we wish to customize the plugin's options, we need to install the `terser-webpack-plugin`.

```
$ npm install terser-webpack-plugin --save-dev
```

TerserWebpackPlugin will do an optimized minification of the `main.bundle.js`.
It will:

-   shorten the function names
-   remove whitespaces
-   treeshake the resulting bundle

To test dead code elimination, define additional code in the `src/components/App.js` that will not be referenced anywhere.

```js
import React from 'react';
import './App.css';
import dogImage from '../../public/dog-img.jpg';

export default function AppComponent() {
    const logMessage = () => {
        console.log('hello, I am not referenced anywhere!');
    };
    return (
        <div className="container">
            <div>App Component</div>
            <div>
                <img className="dog" src={dogImage} alt="a dog" />
            </div>
        </div>
    );
}
```

Try TerserWebpackPlugin with options:

webpack.prod.config.js

```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './src/components/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    module: {
        rules: [
            {
                test: /\.(?:js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        targets: 'defaults',
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                    },
                },
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: 'index.html',
        }),
    ],
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },
};
```

As we mentioned earlier, TerserWebpackPlugin is a default in Webpack v5, but there is a lot of additional options to include in the optimization process:

-   matching only certain file types
-   including and excluding certain types
-   running multi-process parallel for increasing build speed
-   extracting comments to a separate file
-   preserving certain comments by matching them with RegEx
-   uglifying minimized build
-   using `swc`, a super fast compiler written in Rust
-   using `esbuild`, an extremely fast JS bundler and minifier
-   writing custom minify functions

Read more about it [here](https://webpack.js.org/plugins/terser-webpack-plugin/).

# Extracting CSS with MiniCssExtractPlugin

Currently, all CSS is bundled together with the javascript code in one bundle file.
MiniCssExtractPlugin extracts CSS into separate files. It creates a CSS file per JS file which contain CSS. It supports on-demand-loading of CSS and source maps.

```js
$ npm install --save-dev mini-css-extract-plugin
```

In our production webpack configuration we already have defined rule for matching css files. All we need to do now is to add the `use` property in the Rule object:

```js
...
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: 'production',
    ...
    module: {
        rules: [
            ...
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            ...
        ],
    },
        plugins: [
            ...
            new MiniCssExtractPlugin(),
    ],
    ...
};

```

Since we are in the production mode, we can safely replace `style-loader` with the `MiniCssExtractPlugin.loader`.
We also have to include a new instance of `MiniCssExtractPlugin` in the `plugins` array. It comes with options configuration object, but for our purpose we will instantiate it without one.

The compilation/bundling will spit out additional file in our `dist` directory - namely, `main.css`.

# DefinePlugin

The `DefinePlugin` is a Webpack plugin used to define global constants at compile time, allowing you to inject static values into your code during the build process.

Example:

Add the following line to `src/App.js`

```js
import React from 'react';
import './App.css';
import dogImage from '../../public/dog-img.jpg';

export default function AppComponent() {
    console.log('API_URL', API_URL);
    ...
}
```

Declare new instance of DefinePlugin in the `webpack.prod.config.js` configuration file:

```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
    ...
    plugins: [
        ...
        new webpack.DefinePlugin({
            PRODUCTION: JSON.stringify(true),
            API_URL: JSON.stringify('https://api/v2/graphql'),
        }),
    ],
    ...
};
```

We have defined a constant `API_URL` that holds the string `https://api/v2/graphql`.
Webpack replaces every occurrence of API_URL in our source code with the string value `https://api/v2/graphql` at build time.

So, DefinePlugin is useful for injecting environment-specific variables like API URLs, feature flags, or build metadata.
We avoid hardcoding these values in our source code or relying on runtime configuration, making our builds predictable.

Note that because the plugin does a direct text replacement, the value given to it must include actual quotes inside of the string itself. Typically, this is done either with alternate quotes, such as '"production"', or by using JSON.stringify('production').

# About source-map and devtool

The configuration entry `devtool: 'source-map'` tells Webpack to generate source maps for our code, which map the minified/compiled output to our original source code.
The source map allows us to debug minified or bundled code effectively.

Why?

1. Easier debugging:

-   In production mode, your code is minified and bundled (thanks to TerserPlugin).
-   Without source maps, debugging such code is nearly impossible because variable names are shortened, and the structure of the code is altered.

2. Improved Error Reporting:

-   Modern browsers like Chrome use source maps to display the original source file and line number in the developer tools when an error occurs, rather than showing the compiled output.

3. Selective Visibility:

-   The source-map option generates separate .map files alongside your bundles, making them available for debugging but not embedded in the code itself (unlike inline-source-map).

When?

-   Production Mode:
    -   Use it when you need debuggable production builds while keeping the source maps external for faster load times.
-   Development Mode:
    -   Use faster but less production-suited options, like `eval-source-map`, which generates maps quickly.
    -   example: `devtool: 'eval-source-map'`

Best Practices:

Use environment variables (e.g., `process.env.API_URL`) with `DefinePlugin` to manage values for multiple environments dynamically.

Be cautious about using source-map in production as it can expose sensitive information (e.g., comments or unintentional code leaks).
For stricter control, you might prefer `hidden-source-map`, which doesn't expose the source map URL in the minified file.

# SplitChunksPlugin

Originally, chunks (and modules imported inside them) were connected by a parent-child relationship in the internal webpack graph.
The `CommonsChunkPlugin` was used to avoid duplicated dependencies across them, but further optimizations were not possible.
Since webpack v4, the `CommonsChunkPlugin` was removed in favor of `optimization.splitChunks`.

Webpack will automatically split chunks based on these conditions:

-   New chunk can be shared OR modules are from the node_modules folder
-   New chunk would be bigger than 20kb (before min+gz)
-   Maximum number of parallel requests when loading chunks on demand would be lower or equal to 30
-   Maximum number of parallel requests at initial page load would be lower or equal to 30

When trying to fulfill the last two conditions, bigger chunks are preferred.

The default configuration was chosen to fit web performance best practices, but the optimal strategy for your project might differ. If you're changing the configuration, you should measure the effect of your changes to ensure there's a real benefit.

```js
...
module.exports = {
    ...
     optimization: {
        chunkIds: 'named',
        minimize: true,
        minimizer: [new TerserPlugin()],
        splitChunks: {
            chunks: 'async',
            minSize: 20000,
            minRemainingSize: 0,
            minChunks: 1,
            maxAsyncRequests: 30,
            maxInitialRequests: 30,
            enforceSizeThreshold: 50000,
            cacheGroups: {
                defaultVendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10,
                    name: 'vendor'
                    chunks: 'all',
                    reuseExistingChunk: true,
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true,
                },
            },
        },
    },
};

```

This might result in a large chunk containing all external packages. It is recommended to only include your core frameworks and utilities and dynamically load the rest of the dependencies.

For example:

```js
...
module.exports = {
    ...
     optimization: {
        chunkIds: 'named',
        minimize: true,
        minimizer: [new TerserPlugin()],
        splitChunks: {
            chunks: 'async',
            minSize: 20000,
            minRemainingSize: 0,
            minChunks: 1,
            maxAsyncRequests: 30,
            maxInitialRequests: 30,
            enforceSizeThreshold: 50000,
            cacheGroups: {
                defaultVendors: {
                    test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                    priority: -10,
                    name: 'vendor'
                    chunks: 'all',
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true,
                },
            },
        },
    },
};

```

Some of the options described:

`splitChunks.minSize` is a minimum size, in bytes, for a chunk to be generated.
If that value is less, no optimization will happen.

`splitChunks.enforceSizeThreshold` size threshold at which splitting is enforced and other restrictions are ignored. You could throw an error if that threshold is reached.

`splitChunks.cacheGroups` a module can belong to multiple cache groups. The optimization will prefer the cache group with a higher `priority`.
The default groups have a negative priority to allow custom groups to take higher priority (default value is `0` for custom groups).
We have two groups, one `default` and a separate one for the `node_modules`.

`splitChunks.cacheGroups.filename` a filename of the generated chunk.

`splitChunks.cacheGroups.chunks: 'all'` include all types of chunks for optimization

`optimization.chunkIds` tells webpack which algorithm to use when choosing chunk ids. The value `named` is focused on readable ids for better debugging.
Also if the environment is development then `optimization.chunkIds` is set to `'named'`, while in production it is set to `'deterministic'`.
`'deterministic'` means short numeric ids which will not be changing between compilation. Good for long term caching. Enabled by default for production mode.

We will create a shared/common component in the `src/components` which could be called/used in multiple places, but we want them being built as a separate chunk.

`src/components/shared/Button.tsx`

```js
import React from 'react';

export default function ButtonComponent() {
    return <button>Click Me!</button>;
}
```

Call it in the `App.js`

```js
...
import ButtonComponent from '../shared/Button';
import DashboardComponent from './Dashboard';

export default function AppComponent() {
...
    return (
        <div className="container">
            <div>App Component</div>
            <div>
                <img className="dog" src={dogImage} alt="a dog" />
                <ButtonComponent />
                    <DashboardComponent />
            </div>
        </div>
    );
}

```

and another newly created component `src/components/Dashboard.jsx` called in the App.jsx.

```js
import React from 'react';

export default function DashboardComponent() {
    return (
        <>
            <div>Dashboard Component</div>
            <ButtonComponent />
        </>
    );
}
```

Modify the `webpack.prod.config.js`

```js
...
module.exports = {
    ...
     optimization: {
        chunkIds: 'named',
        minimize: true,
        minimizer: [new TerserPlugin()],
        splitChunks: {
            chunks: 'async',
            minSize: 200,
            minRemainingSize: 0,
            minChunks: 1,
            maxAsyncRequests: 30,
            maxInitialRequests: 30,
            enforceSizeThreshold: 50000,
            cacheGroups: {
                defaultVendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10,
                    name: 'vendor',
                    chunks: 'all',
                    reuseExistingChunk: true,
                },
                default: {
                    minChunks: 1,
                    priority: -20,
                    reuseExistingChunk: true,
                    name: 'common',
                    chunks: 'all',
                },
            },
        },
    },
};

```

Explanation:

1. `chunkIds: 'named`

    - Purpose:
        - Assign readable names to chunks rather than using default numeric or hashed IDs.
    - Benefits:
        - Improved debugging experience and chunks are more identifiable during development.
        - When to use: typically for development or testing environments, as it makes bundle analysis easier.
        - In production: we might prefer `'deterministic'` or `'size'` for smaller output or consistent hashing.

2. `minimize: true`

    - Purpose:
        - Enable code minification to reduce the size of our JavaScript bundles.
    - How:
        - Webpack uses the `TerserPlugin` by default to minimize the output.
    - Benefit:
        - Reduces bundle size, leading to faster downloads and better performance in production.

3. `minimizer: [new TerserPlugin()]`

    - Purpose:
        - Specifies a custom minimizer for JavaScript files.
    - Details:
        - You're explicitly defining `TerserPlugin`, which is Webpack's default minimizer in production mode.
        - This allows us to customize Terser settings if needed.
    - Benefit:
        - Enables us to optimize minification further, such as removing comments, adjusting compression, or handling specific ES versions.

4. `splitChunks`

    - Purpose:
        - Splits our bundles into smaller chunks to improve performance and allow for better caching.
    - Key Configurations:
        - `chunks: 'async'`
            - Splits only asynchronous (dynamically imported) chunks.
            - Benefit:
                - Reduces initial load times by loading only what's needed on-demand.
        - `minSize: 200`
            - The minimum size (in bytes) of a chunk before Webpack considers splitting it.
            - Why 200?
                - Small chunks (less than 200 bytes) are inefficient to load due to network overhead,
                  so this avoids unnecessary splitting.
        - `minRemainingSize: 0`
            - Ensures that the size of the remaining chunk after splitting doesn't fall below the specified value.
            - Default Behavior:
                - Matches `minSize` if not explicitly set.
        - `minChunks: 1`
            - The minimum number of chunks that must share a module before it's split.
            - Why 1?
                - Ensures even single-use modules can be split, which helps in reducing duplicated code.
        - `maxAsyncRequests: 30` and `maxInitialRequests: 30`
            - Limits the number of simultaneous chunk requests for asynchronous (`maxAsyncRequests`) or initial (`maxInitialRequests`) chunks.
            - Why 30?
                - High limits ensure you’re not unnecessarily restricted while avoiding too many
                  simultaneous requests.
        - `enforceSizeThreshold: 50000`
            - Enforces a chunk size threshold, ensuring chunks larger than this value (in bytes) are split even if other conditions aren’t met.
            - Benefit:
                - Prevents very large bundles that might negatively impact performance.

5. `cacheGroups`
    - Purpose:
        - Groups chunks together into logical bundles, typically by separating third-party libraries (from node_modules) and common code.
    - Key Groups:
        - `defaultVendors`
            - What it does:
                - Identifies modules from `node_modules` and bundles them into a chunk called `vendor`.
            - Priority:
                - `priority: -10` means this group takes precedence over the `default` group when deciding where to place a module.
            - Reuse:
                - `reuseExistingChunk: true` avoids duplicate chunks by reusing an existing one if it matches.
            - Chunks:
                - `chunk: all` means both synchronous and asynchronous modules are eligible for bundling here.
        - `default`
            - What it does:
                - Handles modules that don't belong to `node_modules` but are shared across multiple entry points.
            - Priority:
                - `priority: -20` ensures it is considered after the `defaultVendors` group.
            - Reuse:
                - Reuses chunks if they match the criteria.

Why is this optimization useful?

1. Improved Caching:
    - Splitting vendor code (third-party libraries) into a separate chunk means that if your app's code changes but the vendor libraries remain the same, users can leverage browser caching for faster load times.
2. Reduced Bundle Size:
    - Splitting chunks ensures that only the necessary code is loaded, reducing the overall bundle size and initial load times.
3. Enhanced Performance:
    - By braking down larger bundles into smaller, more manageable chunks, we reduce parsing and execution time in the browser.
4. Better Scalability:
    - This setup is robust enough to handle both small projects and large-scale applications with multiple entry points.

Example Output: - `vendor.bundle.js` contains third-party libraries like React. - `common.bundle.js` contains code shared across multiple parts of your app. - Dynamic Chunks: Asynchronous modules will be loaded on demand.

# Dynamic Imports

Two similar techniques are supported by webpack when it comes to dynamic code splitting.
The first and recommended approach is to use the [import()](https://webpack.js.org/api/module-methods/#import-1) syntax that conforms to the [ECMAScript proposal](https://github.com/tc39/proposal-dynamic-import) for dynamic imports.
The legacy, webpack-specific approach is to use [require.ensure](https://webpack.js.org/api/module-methods/#requireensure).

`import()` calls use promises internally. If you use `import()` with older browsers (e.g., IE 11), remember to shim `Promise` using a polyfill such as [es6-promise](https://github.com/stefanpenner/es6-promise) or [promise-polyfill](https://github.com/taylorhakes/promise-polyfill).

Create another component in the `src/components` - `DynamicComponent.jsx`.

First try to import it statically in the `App.jsx`.
You can see that it will be bundled into `common.bundle.js`.

Then, comment the regular import and import it dynamically like this:

```js
import React from 'react';
import './App.css';
// import DynamicComponent from './Dynamic';
const DynamicComponent = lazy(() => import('./Dynamic'));

export default function AppComponent() {
    return (
        <div className="container">
            <div>App Component</div>
            <div>
                ...
                <DynamicComponent />
            </div>
        </div>
    );
}
```

## Lazy Loading

Lazy, or "on demand" loading is a great way to optimize our application. This practice essentially involves splitting your code at logical breakpoints, and then loading it once the user has done something that requires, or will require, a new block of code. This speeds up the initial load of the application and lightens its overall weight as some blocks may never even be loaded.

Go to the `webpack.prod.config.js` and increase `optimization.splitChunks.minSize` to `20000` (20kB).

Run the build:

```
$ npm run build:prod
```

Since we injected the `Dynamic.jsx` into `App.jsx` as a lazy component this resulted in a new bundle being created `src_components_Dynamic_jsx.bundle.js`.

Furthermore, there is a special syntax we can use to give the dynamically loaded component a name to be used in the resulting chunk:

```js
...
// import DynamicComponent from './Dynamic';
const DynamicComponent = lazy(() =>
    import(/* webpackChunkName: 'dynamic-component' */ './Dynamic')
);
...
```

If we now run the production build, to our surprise we can see the generated chunk named `dynamic-component.bundle.js`.

# Performance

These options allows you to control how webpack notifies you of assets and entry points that exceed a specific file limit. This feature was inspired by the idea of [webpack Performance Budgets](https://github.com/webpack/webpack/issues/3216).

Make a production configuration change by applying the `performance` object:

```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
    devtool: 'source-map',
    entry: './src/components/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    performance: {
        hints: 'warning',
        maxAssetSize: 100000,
    },
    module: {
        rules: [
            {
                test: /\.(?:js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        targets: 'defaults',
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                    },
                },
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: 'index.html',
        }),
        new MiniCssExtractPlugin(),
        new webpack.DefinePlugin({
            PRODUCTION: JSON.stringify(true),
            API_URL: JSON.stringify('https://api/v2/graphql'),
        }),
    ],
    optimization: {
        chunkIds: 'named',
        minimize: true,
        minimizer: [new TerserPlugin()],
        splitChunks: {
            chunks: 'async',
            minSize: 20000,
            minRemainingSize: 0,
            minChunks: 1,
            maxAsyncRequests: 30,
            maxInitialRequests: 30,
            enforceSizeThreshold: 50000,
            cacheGroups: {
                defaultVendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10,
                    name: 'vendor',
                    chunks: 'all',
                    reuseExistingChunk: true,
                },
                default: {
                    minChunks: 1,
                    priority: -20,
                    reuseExistingChunk: true,
                    name: 'common',
                    chunks: 'all',
                },
            },
        },
    },
};
```
Webpack will now emit a performance hit based on individual asset size in bytes (in our case 100 KB or 97.7 KiB).

The warning will look something like this:

**WARNING** in asset size limit: The following asset(s) exceed the recommended size limit (97.7 KiB).
This can impact web performance.
Assets: 
  vendor.bundle.js (177 KiB)

Other useful options:

`maxEntrypointSize: 400` - an entry pont for all assets that would be utilized during initial load time for a specific entry. This option controls when webpack should emit performance hints based on the maximum entry pont size in bytes.

We can set budget on each and every chung being emitted. 
Also, we can be more strict on performance and issue errors when certain triggers happen.