import 'babel-polyfill'
import React from 'react'
import ReactDom from 'react-dom'

import InfiniteGrid from 'react-infinite-grid'

var Example = React.createClass({
	render: function() {
		return(
			<div className="example">
				This is {this.props.index}
			</div>
		);
	},
});

var items = [];
for (var i = 0; i <= 100000; i++) {
	items.push(<Example index={i} key={"example-" + i} />);
}

ReactDom.render(<InfiniteGrid wrapperHeight={400} entries={items} />, document.getElementById('app'));
