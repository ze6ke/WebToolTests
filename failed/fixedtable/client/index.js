import 'babel-polyfill'
import {Table, Column, Cell} from 'fixed-data-table-2'
import React from 'react'
import ReactDom from 'react-dom'

function rowRender ({rowIndex, ...props}) {
  return (
    <Cell {...props}>
    {rowIndex.valueOf()}
    </Cell>
  )
}
const theTable = <Table rowHeight={50} rowsCount={5000} width={300} height={500} headerHeight={50}>
  <Column header={<Cell>col 1</Cell>} cell={<Cell>col 1 content</Cell>} width={100} />
  <Column header={<Cell>col 2</Cell>} cell={rowRender} width={200}/>
  </Table>


//  ReactDom.render(theTable, document.getElementById('app'))

// Table data as a list of array.
const rows = [
  ['a1', 'b1', 'c1'],
  ['a2', 'b2', 'c2'],
  ['a3', 'b3', 'c3'],
  // .... and more
];

// Render your table
ReactDom.render(
  <Table
    rowHeight={50}
    rowsCount={rows.length}
    width={5000}
    height={5000}
    headerHeight={50}>
    <Column
      header={<Cell>Col 1</Cell>}
      cell={<Cell>Column 1 static content</Cell>}
      width={2000}
    />
    <Column
      header={<Cell>Col 3</Cell>}
      cell={({rowIndex, ...props}) => (
        <Cell {...props}>
          Data for column 3: {rows[rowIndex][2]}
        </Cell>
      )}
      width={2000}
    />
  </Table>,
  document.getElementById('app')
);
