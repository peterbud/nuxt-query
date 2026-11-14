import { execFileSync, spawnSync } from 'node:child_process'
import { appendFileSync, readFileSync } from 'node:fs'

const tag = process.env.RELEASE_TAG
const match = /^v([12])\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(-beta\.(?:0|[1-9]\d*))?$/.exec(tag ?? '')
if (!match || (match[1] === '1' && match[2]))
  throw new Error('Release tag must be stable v1.x.y, stable v2.x.y, or v2.x.y-beta.N.')

const { name, version } = JSON.parse(readFileSync('package.json', 'utf8'))
if (tag !== `v${version}`)
  throw new Error(`Release tag ${tag} does not match package version ${version}.`)

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim()
}

const head = git('rev-parse', 'HEAD')
if (head !== git('rev-parse', '--verify', `refs/tags/${tag}^{commit}`))
  throw new Error(`The checkout must be the commit tagged ${tag}.`)

const branch = match[1] === '1' ? '1.x' : 'main'
const ancestor = spawnSync('git', ['merge-base', '--is-ancestor', head, `refs/remotes/origin/${branch}`], { encoding: 'utf8' })
if (ancestor.error)
  throw ancestor.error
if (ancestor.status !== 0)
  throw new Error(`${tag} must be reachable from origin/${branch}.\n${ancestor.stderr}`)

if (!process.env.GITHUB_OUTPUT)
  throw new Error('GITHUB_OUTPUT is required to pass the validated npm dist-tag to the workflow.')

let npmTag = match[2] ? 'beta' : 'latest'
if (match[1] === '1') {
  const distTags = JSON.parse(execFileSync('npm', [
    'view', name, 'dist-tags', '--json', '--registry=https://registry.npmjs.org',
  ], { encoding: 'utf8' }))
  const latest = /^([1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/.exec(distTags?.latest ?? '')
  if (!latest)
    throw new Error('npm latest must point to a stable version before publishing 1.x; check the registry dist-tags.')
  npmTag = latest[1] === '1' ? 'latest' : 'legacy'
}

appendFileSync(process.env.GITHUB_OUTPUT, `npm_tag=${npmTag}\n`)
console.log(`Validated ${tag} on ${branch}: npm dist-tag ${npmTag}`)
