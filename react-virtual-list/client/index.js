import 'babel-polyfill'
import React from 'react'
import ReactDom from 'react-dom'
import VirtualList from 'react-virtual-list'

const theData = [...Array(1000).keys()].map((f, i)=>({id:i}))
const theSecondData = [...Array(500).keys()].map((f, i)=>({id:i}))
const itemHeight = 100
const MyList = ({
  items,
  itemHeight
}) => (
  <div>
    {items.map(item => (
      <li key={ `item_${item.id}`} style={{height: itemHeight}}>
        Lorem ipsum dolor sit amet {`${item.id}`}
      </li>
    ))}
  </div>
)

const VirtualCanvas = ({virtual, itemHeight, children}) => (
  <div id="theCanvas" style={virtual.style}>
    {children({items: virtual.items, itemHeight})}
  </div>
)

const VirtualWithScroll = (Virtual, getScrollingContainer=f=>window) => (options) => (controls) => {
  const correctedControls = ({virtual, itemHeight}) => {
    let correctedVirtual = {...virtual}
    correctedVirtual.style.height = virtual.style.height - virtual.style.paddingTop
    return VirtualCanvas({virtual: correctedVirtual, itemHeight, children: controls})
  }
  let vlist = Virtual(options)(correctedControls)
  return class vlistWithScroll extends vlist {
    constructor (props) {
      super(props)
      if(props.startingElement!==undefined) {
        this.startingElement = props.startingElement
      }
    }
    
    componentDidMount() {
      super.componentDidMount && super.componentDidMount()
      if(this.startingElement!==undefined) {
        this.scrollToElementNumber(this.startingElement)
      }
    }
    componentDidUpdate(prevProps, prevState) {
      super.componentDidUpdate && super.componentDidUpdate(prevProps, prevState)
      if(this.startingElement!==undefined && this.props.items !== prevProps.items) {
        this.scrollToElementNumber(this.startingElement)
      }
    }

    scrollToElementNumber (id) {
      const theContainer = getScrollingContainer()
      if(theContainer === window) {
        window.scrollTo(0, document.body.getBoundingClientRect().top + 
          window.scrollY + this.props.itemHeight * id)
      }
      else {
        alert('not implemented')
      }
    }
  }
}

const MyVirtualList = VirtualWithScroll(VirtualList)()(MyList)

ReactDom.render(<ul>
  <MyVirtualList id="theList" items={theData} itemHeight={itemHeight} startingElement={201} />
</ul>, document.getElementById('app'));

setTimeout(() => {
  ReactDom.render(<ul>
    <MyVirtualList id="theList" items={theSecondData} itemHeight={itemHeight} startingElement={201} />
  </ul>, document.getElementById('app'))
  console.log('updated')
  }, 5000)
