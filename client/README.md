# Java Linter

A Java linter for Visual Studio Code using the [the language server protocol](https://code.visualstudio.com/blogs/2016/06/27/common-language-protocol).

## Features

`javac-linter` provides linting for Java sources using `javac`.

![Example](https://raw.githubusercontent.com/faustinoaq/vscode-javac-linter/master/client/images/example.gif)

> Tip: use `ctrl-k ctrl-h` to show `javac-linter`logs

## Requirements

[JDK](https://en.wikipedia.org/wiki/Java_Development_Kit) is required.

## Settings 

This extension contributes the following settings:

* `javac-linter.enable`: `true` or `false` (true by default)
* `javac-linter.maxNumberOfProblems`: max number of source code problems (20 by default)
* `javac-linter.javac`: Location of Java compiler executable (javac by default)
* `javac-linter.classpath`: project classpath array ([workspaceRoot] by default)

By example in `settings.json`:

```json
{
  "javac-linter.enable": true,
  "javac-linter.maxNumberOfProblems": 100,
  "javac-linter.javac": "c:/Program Files/Java/jdk1.8.0_112/bin/javac.exe",
  "javac-linter.classpath": [
    "${workspaceRoot}/bin/classes"
  ]
}
```

## Known Issues

Lint "on-fly" is not supported.

Take care when saving too quickly (`ctrl-s` the Java source), because each time when the document is saved, `javac` is executed. 

Also `.class` files are generated inside of the first classpath.

## Roadmap

- Allow full workspace linting (Maybe with performance issues)
- Allow suggested fix in case of a specific error/warning.

## Release Notes

See [CHANGELOG.md](https://raw.githubusercontent.com/faustinoaq/vscode-javac-linter/master/client/CHANGELOG.md)

## Contributing

1. Fork it ( https://github.com/faustinoaq/vscde-javac-linter/fork )
2. Create your feature branch (git checkout -b my-new-feature)
3. Commit your changes (git commit -am 'Add some feature')
4. Push to the branch (git push origin my-new-feature)
5. Create a new Pull Request

## Contributors

- [@faustinoaq](https://github.com/faustinoaq) Faustino Aguilar - creator, maintainer
