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

- Efficiency: HMR speeds up development by applying the changes we make instead of reloading the entire page
- Isolation: Webpack Dev Server serves everything from memory, keeping our build output clean during development
- Reactive Updates: The browser reflects code changes almost instantly, improving the development experience

On the other hand, we can build our bundle by running the following command:

```
$ npm run build:dev
```

This will result with `main.bundle.js` being created in the `dist` directory, alongside with the `index.html` with the script tag pointing to our generated bundle.

The bundle contains the following code parts:

- React Components: our app's components compiled from JSX/TS into plain JS
- Webpack Runtime: a set of utility functions that Webpack uses to load, execute, and manage modules
- Module Code: all of our JS files (and imported assets) bundled together into one file
- IIFE (Immediately Invoked Function Expression):
 - The bundle is wrapped in an IIFE, which is a self-executing function that isolates Webpack's internal logic from the global scope.
- HMR Code (for Development): includes additional Webpack logic for handling HMR during development.

Webpack uses specific methods like `__webpack_require__` to load modules dynamically at runtime.