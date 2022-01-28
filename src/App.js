import * as React from "react"

import { transform, transformFromAst } from '@babel/standalone'
import babelPluginSyntaxJsx from '@babel/plugin-syntax-jsx'
import { declare } from '@babel/helper-plugin-utils'  

const doWalk = declare(api => {
  api.assertVersion(7)
  return {
    visitor: {
      JSXElement: {
        enter(path) {
          path.node.openingElement.attributes.push({
            type: "JSXAttribute",
            name: {
              type: "JSXIdentifier",
              name: "__id"
            },
            value: {
              type: "StringLiteral",
              value: "abc"
            }
          })
        }
      }
    }
  }
})

function App() {
  const code = `import * as React from "react"
import { Header } from "./modules/header.js";

export const App = ({ param }) => {
  return (
    <React.Fragment>
      <div>And I'm a two</div>
      <div>I'm a one</div>
      <Header text={param} />
    </React.Fragment>
  )
}
`;

  const { ast } = transform(code, {
    // presets: ["es2015", "react"],
    plugins: [babelPluginSyntaxJsx, doWalk],
    ast: true
  }
)

  console.log(ast);

  const codeAfter = transformFromAst(ast, "", {plugins: [babelPluginSyntaxJsx]})

  console.log('after', codeAfter.code)

  // const res = new Function(codeAfter.code)
  // console.log(res())

  return <>text</>
}

export default App;