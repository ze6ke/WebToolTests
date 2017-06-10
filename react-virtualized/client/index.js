import 'babel-polyfill'
import React from 'react'
import ReactDom from 'react-dom'
import { List } from 'react-virtualized';

// List data as an array of strings
const list = [...Array(1000)].map((e,i)=>'element ' + i) 

function rowRenderer ({
  key,         // Unique key within array of rows
  index,       // Index of row within collection
  isScrolling, // The List is currently being scrolled
  isVisible,   // This row is visible within the List (eg it is not an overscanned row)
  style        // Style object to be applied to row (to position it)
}) {
  return (
    <div
      key={key}
      style={style}
    >
      {list[index]}
    </div>
  )
}

// Render your list
ReactDom.render(
  <List
    width={300}
    height={300}
    rowCount={list.length}
    rowHeight={20}
    rowRenderer={rowRenderer}
  />,
  document.getElementById('app')
)

