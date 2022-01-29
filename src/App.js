import * as React from "react"

import { transform, transformFromAst } from '@babel/standalone'
import babelPluginSyntaxJsx from '@babel/plugin-syntax-jsx'
import { declare } from '@babel/helper-plugin-utils'  

import { Header } from "./modules/header"

const importsMap = {
  'React': React,
  'Header':  Header,
}

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

const imports = []

const walkImport = declare(api => {
  api.assertVersion(7)
  return {
    visitor: {
      ImportDeclaration: {
        enter(path) {
          const importDeclaration = {
            path: path.node.source.value,
            name: path.node.specifiers[0].local.name,
          };
          imports.push(importDeclaration);
          path.remove();
        }
      },
      ExportDeclaration: {
        enter(path) {
          // replace export with return here ->
          // path.replaceWith()
        }
      }
    }
  }
})

function App() {
  const code = `import React from "react"
import Header from "./modules/header.js";

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
    presets: ["es2015", "react"],
    plugins: [babelPluginSyntaxJsx, doWalk, walkImport],
    ast: true
  }
)

  console.log(ast);

  const codeAfter = transformFromAst(ast, "", {plugins: [babelPluginSyntaxJsx]})

  console.log('after', codeAfter.code)

  const params = imports.map(i => i.name)
  const fullParams = [...params, codeAfter.code];
  const values = imports.map(i => importsMap[i.name]);

  console.log(fullParams, values)

  const res = new Function(...fullParams).apply(values)

  console.log('applied', res)

  return <>text</>
}

export default App;