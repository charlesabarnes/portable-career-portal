const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: 'production',
    entry: {
        'career-portal': './src/index.js',
    },
    output: {
        filename: 'index.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
            }
        ]
    },
    plugins: [
        new CopyPlugin({
          patterns: [
            { from: "package.json" },
            { from: "README.md" },
          ],
        }),
      ],
};