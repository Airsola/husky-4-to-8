# husky-4-to-8

> Easily migrate your husky 4 config to husky 8

While it should cover most basic migrations, it's **recommended** to have a look at husky 8 [documentation](https://typicode.github.io/husky).

If your `package.json` is not at the same level as `.git`, please update manually.

## Usage

### yarn

Yarn 1

```shell

# 旧有项目升级整体复制以下命令执行即可

yarn add husky@^8.0.0 @airsola/husky-4-to-8 -D  \
  && npx husky-init \
  && npx @airsola/husky-4-to-8 --remove-v4-config \
  && yarn remove @airsola/husky-4-to-8

# @airsola/husky-4-to-8 是一个过河即可拆桥的辅助工具

```

## What each command does

`husky init` sets up Git hooks and updates your `package.json` scripts (you may want to commit your changes to `package.json` before running `husky init`).

`@airsola/husky-4-to-8` creates hooks based on your husky v4 config. If `--remove-v4-config` is passed, previous config will be deleted (recommended).

## Revert

If there's an error during the process, you can clean things up by running:

```sh
rm -rf .husky && git config --unset core.hooksPath
```
