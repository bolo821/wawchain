import React from 'react';
import { useSelector } from 'react-redux';

const Counter = () => {
	const count = useSelector(state => state.counter.count);

	if (count > 0) {
		return (
			<div className="counter-rt">
				<h1>{count}</h1>
			</div>
		)
	} else {
		return <></>
	}
}

export default Counter;