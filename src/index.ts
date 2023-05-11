import chalk from 'chalk'
import { cosmiconfigSync } from 'cosmiconfig'
import fs from 'fs'
import { set } from 'husky'

function searchResult(): {
  hooks: { [key: string]: string }
  filepath: string | undefined
} {
  const explorer = cosmiconfigSync('husky')

  const result = explorer.search()
  if (result === null) {
    throw new Error('no husky 4 config found')
  }

  interface Config {
    hooks?: { [key: string]: string }
  }
  const config = result?.config as Config

  return {
    hooks: config?.hooks || {},
    filepath: result?.filepath,
  }
}

function showManualUpdateMessage(hooks: { [key: string]: string }) {
  const names: string[] = []

  // Simple heuristic to check if hook needs to be manually updated
  const packageManagers = ['npm', 'npx', 'yarn', 'pnpm', 'pnpx']
  const otherCriterias = ['HUSKY_GIT_PARAMS', '&&', '||']
  if (hooks) {
    Object.entries(hooks).forEach(([name, script]) => {
      if (
        !packageManagers.some((s) => script.startsWith(s)) ||
        otherCriterias.some((s) => script.includes(s))
      ) {
        names.push(name)
      }
    })
  }

  // Show manual update message
  if (names.length > 0) {
    console.log(chalk`
{red ⚠️ {bold ${names.join(', ')}} hook${
      names.length > 1 ? 's' : ''
    } may need to be manually updated to be run via package manager.}

{bold Examples:}
  jest → npx --no-install jest
       → yarn jest

  jest && eslint → npx --no-install jest && npx --no-install eslint
                 → yarn jest && yarn eslint

  commitlint -E HUSKY_GIT_PARAMS → npx --no-install commitlint --edit $1
                                 → yarn commitlint --edit $1

See {underline https://typicode.github.io/husky/#/?id=migrate-from-v4-to-v8}
`)
  }
}

export function run(): void {
  const { hooks, filepath } = searchResult()

  Object.entries(hooks).forEach(([name, script]) => {
    const file = `.husky/${name}`
    console.log('inject-script', script)
    const fullScript = `
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"

    if [[ -f ".nvmrc" ]]; then
      nvm use
    fi
    
    npx --no-install  ${script}
    `
    set(file, fullScript)
  })

  if (filepath) {
    if (filepath.endsWith('package.json')) {
      const str = fs.readFileSync('package.json', 'utf-8')
      const regex = /^[ ]+|\t+/m
      const indent = regex.exec(str)?.[0]
      const pkg = JSON.parse(str) // eslint-disable-line
      delete pkg.husky // eslint-disable-line
      fs.writeFileSync('package.json', `${JSON.stringify(pkg, null, indent)}\n`)
      console.log('husky - deleted husky field from package.json')
    } else {
      fs.unlinkSync(filepath)
      console.log(`husky - removed ${filepath}`)
    }
  }

  showManualUpdateMessage(hooks)
}
