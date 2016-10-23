# Java Linter

![Logo](https://raw.githubusercontent.com/faustinoaq/vscode-javac-linter/master/client/images/icon.png)

A Java linter for Visual Studio Code using the
[the language server protocol](https://code.visualstudio.com/blogs/2016/06/27/common-language-protocol).

## Features

`javac-linter` provides linting for Java sources using `javac`.

![Example](https://raw.githubusercontent.com/faustinoaq/vscode-javac-linter/master/client/images/example.gif)

## Requirements

Java linter need `javac` and `-classpath`.

By default the command is `javac -Xlint:unchecked -d ${classpath[0]} -cp ${classpath}`.

[JDK](https://en.wikipedia.org/wiki/Java_Development_Kit) is required.

## Settings 

This extension contributes the following settings:

* `javac-linter.enable`: `true` or `false` (true by default)
* `javac-linter.maxNumberOfProblems`: max number of source code problems
* `javac-linter.javac`: Java compiler executable
* `javac-linter.classpath`: project classpath array

By example in `settings.json`:

```json
{
  "javac-linter.enable": true,
  "javac-linter.maxNumberOfProblems": 20,
  "javac-linter.javac": "/usr/lib/jvm/default/bin/javac",
  "javac-linter.classpath": [
    "/home/user/JavaProject/bin/classes",
    "/home/user"
  ]
}
```

## Known Issues

Lint "on-fly" is not supported.

Take care when saving too quickly (`ctrl-s` the Java source),
because each time when the document is saved, `javac` is executed. 

Also `.class` files are generated inside of the first classpath.

## Roadmap

- Allow full workspace linting (Maybe with performance issue)
- Allow suggested fix in case of a specific error/warning.

## Release Notes

### 0.0.1

Initial release of `javac-linter`

## Contributing

1. Fork it ( https://github.com/faustinoaq/vscde-javac-linter/fork )
2. Create your feature branch (git checkout -b my-new-feature)
3. Commit your changes (git commit -am 'Add some feature')
4. Push to the branch (git push origin my-new-feature)
5. Create a new Pull Request

## Contributors

- [faustinoaq](https://github.com/faustinoaq) Faustino Aguilar - creator, maintainer
